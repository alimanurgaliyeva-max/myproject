import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { GameProvider } from './context/GameContext.jsx';
import CustomCursor from './components/CustomCursor.jsx';
import Navbar from './components/Navbar.jsx';
import LandingPage from './pages/LandingPage.jsx';
import ModeSelect from './pages/ModeSelect.jsx';
import GameScreen from './pages/GameScreen.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import ProPage from './pages/ProPage.jsx';
import HowToPlay from './pages/HowToPlay.jsx';
import CoachDama from './pages/CoachDama.jsx';

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/play" element={<ModeSelect />} />
        <Route path="/game" element={<GameScreen />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/how-to-play" element={<HowToPlay />} />
        <Route path="/pro" element={<ProPage />} />
        <Route path="/coach" element={<CoachDama />} />
      </Routes>
    </AnimatePresence>
  );
};

export default function App() {
  return (
    <GameProvider>
      <BrowserRouter>
        <div className="min-h-screen">
          <CustomCursor />
          <Navbar />
          <AnimatedRoutes />
        </div>
      </BrowserRouter>
    </GameProvider>
  );
}
