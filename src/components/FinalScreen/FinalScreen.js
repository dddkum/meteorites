import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./FinalScreen.css";

const FinalScreen = () => {
  const navigate = useNavigate();
  const [scores, setScores] = useState([]);

  const combineMatchingScores = (scores) => {
    const result = {};

    scores.forEach(({ name, score }) => {
      const currentScore = parseInt(score);
      if (result[name]) {
        result[name] = result[name].slice(-2);
        result[name].push(currentScore);
      } else {
        result[name] = [currentScore];
      }
    });

    return Object.entries(result)
      .map(([name, scores]) => ({
        name,
        scores: scores
          .filter((score) => score >= 1)
          .sort((a, b) => b - a)
          .slice(0, 3)
          .join(", "),
      }))
      .filter(({ scores }) => scores !== "");
  };

  useEffect(() => {
    const storedScores = localStorage.getItem("scores");
    if (storedScores) {
      const parsedScores = JSON.parse(storedScores);
      const combinedScores = combineMatchingScores(parsedScores);
      setScores(combinedScores);
    }
  }, []);

  const handleGoBack = () => {
    navigate("/");
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
              <td>{score.scores}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleGoBack}>Вернуться на главный экран</button>
    </section>
  );
};

export default FinalScreen;
