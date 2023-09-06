import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./FinalScreen.css";

const FinalScreen = () => {
  const navigate = useNavigate();
  const [scores, setScores] = useState([]);

  const combineMatchingScores = (scores) => {
    const result = {};

    scores.forEach(({ name, score }) => {
      if (result[name]) {
        result[name].push(score);
      } else {
        result[name] = [score];
      }
    });

    return Object.entries(result)
      .map(([name, scores]) => ({
        name,
        scores: scores.join(", "),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
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
