import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./GameScreen.css";
import meteoriteBig from "../../assets/meteorit-big.png";
import meteoriteSmall from "../../assets/meteorit-small.png";
import parachuteSmall from "../../assets/parashute-small.png";
import parachuteBig from "../../assets/parashute-big.png";
import healingIcon from "../../assets/first_aid_kit_PNG121.png";

// основной экран
const GameScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { playerName } = location.state;
  const [healthPoints, setHealthPoints] = useState(1);
  const [scoreCount, setScoreCount] = useState(0);
  const [isHealingIconVisible, setIsHealingIconVisible] = useState(false);
  const [meteoriteSpeedModifier, setMeteoriteSpeedModifier] = useState(5);
  const [meteorites, setMeteorites] = useState([]);
  const damageHeight = 850;
  const [isPaused, setIsPaused] = useState(false);
  const [healingIconX, setHealingIconX] = useState(0);
  const [maxMeteorites, setMaxMeteorites] = useState(10);
  const handleNavigateToHome = () => {
    navigate("/");
  };
  const [healingIconY, setHealingIconY] = useState(-100);

  // пауза
  const togglePause = () => {
    setIsPaused((prevState) => !prevState);
  };

  const handleKeyDown = useCallback((event) => {
    if (event.key === " ") {
      event.preventDefault();
      togglePause();
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--animation-play-state",
      isPaused ? "paused" : "running"
    );
  }, [isPaused]);
  // конец паузы

  // аптечка
  useEffect(() => {
    let intervalId;

    const startHealingIconFall = () => {
      setHealingIconX(Math.random() * (window.innerWidth - 150));
      setHealingIconY(-100);
      setIsHealingIconVisible(true);

      intervalId = setInterval(() => {
        if (!isPaused) {
          setHealingIconY((prevY) => prevY + 2);

          if (healingIconY >= window.innerHeight) {
            setIsHealingIconVisible(false);
            clearInterval(intervalId);
          }
        }
      }, 20);
    };

    if (healthPoints <= 3) {
      const spawnIntervalId = setInterval(
        startHealingIconFall,
        Math.floor(Math.random() * (45000 - 15000 + 1)) + 15000
      );

      return () => {
        clearInterval(spawnIntervalId);
        clearInterval(intervalId);
      };
    }
  }, [healthPoints, isPaused, healingIconY]);

  //конец атпечки

  // клик по аптечке
  const handleAidKitClick = () => {
    setHealthPoints((prevHealthPoints) => {
      const incrementedHealth =
        prevHealthPoints + (Math.floor(Math.random() * 3) + 1);
      return incrementedHealth <= 5 ? incrementedHealth : 5;
    });
    setIsHealingIconVisible(false);
  };
  //конец

  // клики по метеоритам
  const handleMeteorClick = (id, points, meteorType) => {
    if (isPaused) {
      return;
    }
    setMeteorites((prevMeteorites) => {
      return prevMeteorites.map((meteorite) => {
        if (meteorite.id === id) {
          if (meteorite.clicks < meteorite.clicksRequired - 1) {
            return {
              ...meteorite,
              clicks: meteorite.clicks + 1,
            };
          } else {
            attachParachute(id);
            setScoreCount((prevScore) => prevScore + points);
          }
        }
        return meteorite;
      });
    });
  };
  //конец

  //должен отнимать 1 или 2 ед. здоровья. где то косяк
  const handleMeteoriteFallEnd = (id, parachuteAttached, meteorType) => {
    if (!parachuteAttached) {
      const damageAmount = meteorType === "big" ? 2 : 1;
      setHealthPoints((prevHealthPoints) => {
        const newHealthPoints = prevHealthPoints - damageAmount;
        if (newHealthPoints <= 0) {
          handleEndGameClick();
          return 0;
        }
        return newHealthPoints;
      });
    }
    handleMeteorRemoval(id);
  };

  // :(( не работает
  const handleAnimationIteration = (
    e,
    id,
    parachuteAttached,
    meteorType,
    fallingSpeedModifier
  ) => {
    const meteoriteElem = e.target;
    const styles = getComputedStyle(meteoriteElem.parentNode);
    const top = parseFloat(styles.getPropertyValue("top"));

    if (!parachuteAttached && top >= damageHeight) {
      handleMeteoriteFallEnd(id, parachuteAttached, meteorType);
    }
  };
  //конец

  //создание метеоритов
  const createMeteorite = () => {
    if (isPaused || meteorites.length >= maxMeteorites) {
      return;
    }

    const id = Date.now();
    const type = Math.random() > 0.5 ? "big" : "small";
    const xPos = Math.random() * (window.innerWidth - 150);
    const clicksRequired = type === "big" ? 2 : 1;
    const meteorite = {
      id,
      type,
      xPos,
      clicksRequired,
      clicks: 0,
      fallingSpeedModifier: meteoriteSpeedModifier,
      parachuteAttached: false,
    };

    setMeteorites((prevMeteorites) => [...prevMeteorites, meteorite]);
  };
  // конец

  // изменение скорости метеоритов
  useEffect(() => {
    const speedInterval = setInterval(() => {
      setMeteoriteSpeedModifier((prevSpeed) => prevSpeed * 0.9);
    }, 60000);

    return () => clearInterval(speedInterval);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--meteorite-speed-modifier",
      meteoriteSpeedModifier
    );
  }, [meteoriteSpeedModifier]);
  //конец

  // закончить игру
  const handleEndGameClick = () => {
    const storedScores = localStorage.getItem("scores");
    const scores = storedScores ? JSON.parse(storedScores) : [];
    const newScore = { name: playerName, score: scoreCount };

    scores.push(newScore);
    localStorage.setItem("scores", JSON.stringify(scores));

    navigate("/FinalScreen");
  };
  //конец

  // интервал метеоритов
  useEffect(() => {
    const createMeteoriteWithLimit = () => {
      if (meteorites.length < maxMeteorites) {
        createMeteorite();
      }
    };

    if (!isPaused) {
      const intervalId = setInterval(
        createMeteoriteWithLimit,
        Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000
      );
      return () => clearInterval(intervalId);
    }
  }, [isPaused, meteorites]);
  //конец

  //парашютики
  const attachParachute = (id) => {
    setMeteorites((prevMeteorites) => {
      return prevMeteorites.map((meteorite) => {
        if (meteorite.id === id && !meteorite.parachuteAttached) {
          return {
            ...meteorite,
            parachuteAttached: true,
            fallingSpeedModifier: 50,
          };
        }
        return meteorite;
      });
    });
    setTimeout(() => {
      handleMeteorRemoval(id);
    }, 3000);
  };
  //конец

  //удаление метеоритов
  const handleMeteorRemoval = (id) => {
    setMeteorites((prevMeteorites) =>
      prevMeteorites.filter((meteorite) => meteorite.id !== id)
    );
  };
  //конец

  return (
    <section className="main">
      <section
        className="game-field"
        style={{
          animationPlayState: isPaused ? "paused" : "running",
        }}
      >
        {isHealingIconVisible && (
          <img
            src={healingIcon}
            alt="аптечка"
            className="aid-kit-fall"
            onClick={handleAidKitClick}
            style={{
              position: "absolute",
              left: healingIconX,
              top: healingIconY,
              cursor: "pointer",
            }}
          />
        )}

        {meteorites.map((meteorite) => {
          const meteoriteImage =
            meteorite.type === "big" ? meteoriteBig : meteoriteSmall;
          const points = meteorite.type === "big" ? 15 : 5;
          const yPos = -100;

          const parachuteImage =
            meteorite.type === "big" ? parachuteBig : parachuteSmall;

          return (
            <div key={meteorite.id} style={{ position: "relative" }}>
              <div
                onClick={() =>
                  handleMeteorClick(meteorite.id, points, meteorite.type)
                }
                onAnimationIteration={(e) =>
                  handleAnimationIteration(
                    e,
                    meteorite.id,
                    meteorite.parachuteAttached,
                    meteorite.type,
                    meteorite.fallingSpeedModifier
                  )
                }
                onAnimationEnd={(e) => handleMeteorRemoval(meteorite.id)}
                style={{
                  cursor: "pointer",
                  position: "absolute",
                  left: meteorite.xPos,
                  top: yPos,
                  animationDuration: isPaused
                    ? "0s"
                    : `${meteorite.fallingSpeedModifier}s`,
                }}
                className={`${meteorite.type}-meteorite-fall`}
              >
                <img src={meteoriteImage} alt={`${meteorite.type} meteorite`} />
                {meteorite.parachuteAttached && (
                  <img
                    src={parachuteImage}
                    alt="parachute"
                    style={{
                      position: "absolute",
                      top: "-50px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      maxWidth: meteorite.type === "big" ? "80px" : "40px",
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </section>
      <div className="info-section">
        <div>Имя: {playerName}</div>
        <div>Жизни: {healthPoints}</div>
        <div>Счет: {scoreCount}</div>
        <div>
          <button onClick={togglePause}>Пауза</button>
          <button onClick={handleNavigateToHome}>Назад на главный экран</button>
          <button onClick={handleEndGameClick}>Закончить игру</button>
        </div>
      </div>
    </section>
  );
};

export default GameScreen;
