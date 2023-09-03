import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from "../../assets/logo_game.png"
import "./StartScreen.css";

function StartScreen() {
  const [playerName, setPlayerName] = useState('');
  const navigate = useNavigate();
  const handleInputChange = (event) => {
    setPlayerName(event.target.value);
  }

  const handleStartClick = (event) => {
    event.preventDefault();

    if(playerName.trim() !== '') {
      navigate('/GameScreen', { state: { playerName } })
    }
  }

  return (
    <section className="start-screen">
        <img src={logo} alt="Логотип игры" />
      <h1>Защити этот город от разрушительных метеоритов!</h1>
      <h2>На твои плечи выпала роль встать на защиту города от падающих метеоритов.</h2>
      <p>Метеориты бывают 2 видов: маленькие и большие. Чтобы прикрепить парашют на маленький метеорит - нужно кликнуть 1 раз, на большой - 2 раза. За маленький метеорит дается 5 очков, за большой - 15. Каждую минуту скорость падения метеоритов увеличивается. За каждый пропущенный маленький метеорит ты теряешь 1 жизнь, за большой - 2 жизни. Когда у тебя останется меньше 3 жизней, с неба будут падать "Аптечки" - они восстанавливают от 1 до 3 единиц здоровья, каждая аптечка падает в интервале от 15 до 45 секунд.  Помни, ты не можешь получить более 5 жизней. Игру можно ставить на паузу кнопкой "Пробел".</p>

      <form onSubmit={handleStartClick}>
        <label>
          Имя игрока:&nbsp;
          <input type="text" value={playerName} onChange={handleInputChange} />
        </label>
        <br />
        <button type="submit">Старт</button>
      </form>
    </section>
  );
}

export default StartScreen;
