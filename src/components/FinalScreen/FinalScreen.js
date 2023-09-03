import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./FinalScreen.css";

const FinalScreen = () => {
  const navigate = useNavigate();
  const [scores, setScores] = useState([]);

  useEffect(() => {
    const storedScores = localStorage.getItem("scores");
    if (storedScores) {
      const parsedScores = JSON.parse(storedScores);
      const sortedScores = parsedScores.sort((a, b) => b.score - a.score);
      setScores(sortedScores);
    }
  }, []);

  const handleGoBack = () => {
    navigate("/"); // замените '/' на путь к экрану, на который Вы хотите вернуться
  };

  return (
    <section className="final-table">
      <h1>Финальный экран</h1>
      <h2>Результаты игры:</h2>
      <table>
        <thead>
          <tr>
            <th>Игрок</th>
            <th>Счет</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((score, index) => (
            <tr key={index}>
              <td>{score.name}</td>
              <td>{score.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleGoBack}>Вернуться на главный экран</button>
    </section>
  );
};

export default FinalScreen;
