import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./GameScreen.css";
import meteoriteBig from "../../assets/meteorit-big.png";
import meteoriteSmall from "../../assets/meteorit-small.png";
import parachuteSmall from "../../assets/parashute-small.png";
import parachuteBig from "../../assets/parashute-big.png";
import healingIcon from "../../assets/first_aid_kit_PNG121.png";
import pauseIcon from "../../assets/pause-icon.png";

// основной экран
const GameScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { playerName } = location.state;
  const [healthPoints, setHealthPoints] = useState(5);
  const [scoreCount, setScoreCount] = useState(0);
  const [isAidKitIconVisible, setIsAidKitIconVisible] = useState(false);
  const [meteoriteSpeedModifier, setMeteoriteSpeedModifier] = useState(5);
  const [meteorites, setMeteorites] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [aidKitIconX, setAidKitIconX] = useState(0);
  const handleNavigateToHome = () => {
    navigate("/");
  };
  const [aidKitIconY, setAidKitIconY] = useState(-100);

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

  // аптечка падает при условии, что здоровье <=3 и с интервалом от 15 до 45 секунд
  useEffect(() => {
    let intervalId;

    const startAidKitIconFall = () => {
      setAidKitIconX(Math.random() * (window.innerWidth - 150));
      setAidKitIconY(-100);
      setIsAidKitIconVisible(true);
    };

    if (healthPoints <= 3) {
      intervalId = setInterval(startAidKitIconFall, Math.floor(Math.random() * (45000 - 15000 + 1)) + 15000);
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [healthPoints, isPaused, aidKitIconY]);
  //конец аптечки

  //обработка клика по аптечке
  const handleAidKitClick = () => {
    setHealthPoints((prevHealthPoints) => {
      const incrementedHealth =
        prevHealthPoints + (Math.floor(Math.random() * 3) + 1);
      return incrementedHealth <= 5 ? incrementedHealth : 5;
    });
    setIsAidKitIconVisible(false);
  };
  //конец

  const handleAidKitRemoval = () => {
    setIsAidKitIconVisible(false);
  };
  

  // клики по метеоритам
  const handleMeteorClick = (id, points, meteorType) => {
    if (isPaused) {
      return;
    }
    setMeteorites((prevMeteorites) => {
      return prevMeteorites.map((meteorite) => {
        if (meteorite.id === id) {
          if (meteorite.parachuteAttached) {
            return meteorite;
          }
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

  //создание метеоритов
  const createMeteorite = useCallback(() => {
    if (isPaused) {
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
  }, [isPaused, meteoriteSpeedModifier]);
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

  // интервал создания метеоритов от 1 до 3 секунд 
  useEffect(() => {
    const createMeteoriteWithLimit = () => {
      if (meteorites.length < 10) {
        createMeteorite();
      }
    };

    if (!isPaused) {
      const intervalId = setInterval(
        createMeteoriteWithLimit,
        Math.floor(Math.random() * (3000 - 1000 + 1)) + 1000
      );
      return () => clearInterval(intervalId);
    }
  }, [createMeteorite, isPaused, meteorites]);
  //конец

  //удаление метеоритов, определение урона и завершение игры
  const handleMeteorRemoval = (meteorite) => {
    if (!meteorite.parachuteAttached) {
      setHealthPoints((prevHealthPoints) => {
        const damage = meteorite.type === 'big' ? 2 : 1;
        const newHealthPoints = prevHealthPoints - damage;
        
        // завершение игры при 0 хп
        if (newHealthPoints <= 0) {
          handleEndGameClick();
        } else {
          return newHealthPoints;
        }
      });
    }
  
    setMeteorites((prevMeteorites) =>
      prevMeteorites.filter((m) => m.id !== meteorite.id)
    );
  };
  
  //конец

  //парашютики
  const attachParachute = (id) => {
    setMeteorites((prevMeteorites) => {
      return prevMeteorites.map((meteorite) => {
        if (meteorite.id === id && !meteorite.parachuteAttached) {
          return {
            ...meteorite,
            parachuteAttached: true,
            fallingSpeedModifier: meteorite.fallingSpeedModifier * 1, // при изменении значения > или < 1 - метеорит отскакивает в зависимости от прописанного значения
          };
        }
        return meteorite;
      });
    });
    
  };
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

  return (
    <section className="main">
      <section
        className="game-field"
        style={{
          animationPlayState: isPaused ? "paused" : "running",
        }}
      >
        {isPaused && (
          <div className = "pause-icon">
            <img
              src={pauseIcon}
              alt="Pause Icon"
              className="no-select"
              draggable="false"/>
          </div>
        )}

        {isAidKitIconVisible && (
  <img
    src={healingIcon}
    alt="аптечка"
    className="aid-kit-fall no-select"
    onClick={handleAidKitClick}
    onAnimationEnd={handleAidKitRemoval}
    style={{
      left: aidKitIconX,
      top: aidKitIconY,
    }}
    draggable="false"/>
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
                onAnimationEnd={(e) => handleMeteorRemoval(meteorite)}
                style={{
                  cursor: "crosshair",
                  position: "absolute",
                  left: meteorite.xPos,
                  top: yPos,
                  animationDuration: isPaused
                    ? "0s"
                    : `${meteorite.fallingSpeedModifier}s`,
                }}
                className={`${meteorite.type}-meteorite-fall`}
              >
                <img src={meteoriteImage} alt={`${meteorite.type} meteorite`} className="no-select" draggable="false"/>
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
                    className="no-select"
                    draggable="false"/>  
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
