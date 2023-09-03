import React from 'react';
import './App.css';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import StartScreen from './components/StartScreen/StartScreen';
import GameScreen from './components/GameScreen/GameScreen';
import FinalScreen from './components/FinalScreen/FinalScreen';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StartScreen />} />
        <Route path="/GameScreen" element={<GameScreen />} />
        <Route path="/FinalScreen" element={<FinalScreen />} />
      </Routes>
    </Router>
  );
};

export default App;

