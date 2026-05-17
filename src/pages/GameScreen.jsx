import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Board from '../components/Board.jsx';
import Timer from '../components/Timer.jsx';
import MoveHistory from '../components/MoveHistory.jsx';
import Confetti from '../components/Confetti.jsx';
import { useGame } from '../context/GameContext.jsx';
import { useSound } from '../hooks/useSound.js';
import {
  createInitialBoard, getAllValidMoves, executeMove,
  checkWinner, countPieces, moveToNotation, BLACK, WHITE,
} from '../utils/gameLogic.js';
import { getAIMove } from '../utils/aiLogic.js';

const BLITZ_SECONDS = 60;

const PUZZLES = [
  {
    name: 'Двойное взятие',
    board: (() => {
      const b = createInitialBoard().map(r => r.map(() => null));
      b[4][3] = { piece: BLACK, isKing: false };
      b[3][2] = { piece: WHITE, isKing: false };
      b[3][4] = { piece: WHITE, isKing: false };
      b[1][0] = { piece: WHITE, isKing: false };
      return b;
    })(),
    turn: BLACK,
    tip: 'Найди двойное взятие!',
  },
];

export default function GameScreen() {
  const navigate = useNavigate();
  const { mode, aiDifficulty, recordResult, setLastGame } = useGame();
  const { playMove, playCapture, playKing, playWin, playLose } = useSound();

  const [board, setBoard] = useState(() => {
    if (mode === 'puzzle') return PUZZLES[0].board;
    return createInitialBoard();
  });
  const [currentPlayer, setCurrentPlayer] = useState(() =>
    mode === 'puzzle' ? PUZZLES[0].turn : BLACK
  );
  const [winner, setWinner] = useState(null);
  const [moveHistory, setMoveHistory] = useState([]);
  const [captured, setCaptured] = useState({ b: 0, w: 0 });
  const [blitzTime, setBlitzTime] = useState({ [BLACK]: BLITZ_SECONDS, [WHITE]: BLITZ_SECONDS });
  const [aiThinking, setAiThinking] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [moveCount, setMoveCount] = useState(0);
  const startTimeRef = useRef(Date.now());

  const validMoves = getAllValidMoves(board, currentPlayer);
  const pieces = countPieces(board);

  const isAITurn = mode === 'ai' && currentPlayer === WHITE && !gameOver;
  const isDisabled = isAITurn || gameOver || (mode === 'puzzle' && winner);

  // Blitz timer
  useEffect(() => {
    if (mode !== 'blitz' || gameOver) return;
    const id = setInterval(() => {
      setBlitzTime(prev => {
        const next = { ...prev, [currentPlayer]: prev[currentPlayer] - 1 };
        if (next[currentPlayer] <= 0) {
          const w = currentPlayer === BLACK ? WHITE : BLACK;
          handleGameOver(w);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [mode, currentPlayer, gameOver]);

  const handleGameOver = useCallback((w) => {
    setWinner(w);
    setGameOver(true);
    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);

    // Record result for AI mode (player is BLACK)
    if (mode === 'ai') {
      if (w === BLACK) { recordResult('win', { time: duration }); playWin(); setShowConfetti(true); }
      else { recordResult('loss'); playLose(); }
    } else {
      playWin();
      setShowConfetti(true);
    }

    setLastGame({
      moves: moveHistory,
      winner: w,
      duration,
      moveCount,
    });

    setTimeout(() => setShowConfetti(false), 4000);
  }, [mode, moveHistory, moveCount, recordResult, setLastGame, playWin, playLose]);

  const handleMove = useCallback((move) => {
    const newBoard = executeMove(board, move);
    const isCapture = move.captured?.length > 0;
    const becameKing = move.captured?.length > 0
      ? false
      : (currentPlayer === BLACK && move.to[0] === 7) || (currentPlayer === WHITE && move.to[0] === 0);

    if (isCapture) {
      playCapture();
      setCaptured(prev => ({ ...prev, [currentPlayer]: prev[currentPlayer] + move.captured.length }));
    } else {
      playMove();
    }
    if (becameKing) playKing();

    const notation = moveToNotation(move, moveHistory.length + 1);
    setMoveHistory(prev => [...prev, notation]);
    setMoveCount(prev => prev + 1);

    const nextPlayer = currentPlayer === BLACK ? WHITE : BLACK;
    const w = checkWinner(newBoard, nextPlayer);

    setBoard(newBoard);
    setCurrentPlayer(nextPlayer);

    if (w) {
      setTimeout(() => handleGameOver(w), 300);
    }
  }, [board, currentPlayer, moveHistory, playCapture, playMove, playKing, handleGameOver]);

  // AI move
  useEffect(() => {
    if (!isAITurn || gameOver) return;
    setAiThinking(true);
    const timeout = setTimeout(() => {
      const aiMove = getAIMove(board, WHITE, aiDifficulty);
      setAiThinking(false);
      if (aiMove) handleMove(aiMove);
      else handleGameOver(BLACK);
    }, 500 + Math.random() * 600);
    return () => clearTimeout(timeout);
  }, [isAITurn, board, aiDifficulty, gameOver, handleMove, handleGameOver]);

  const restart = () => {
    setBoard(createInitialBoard());
    setCurrentPlayer(BLACK);
    setWinner(null);
    setGameOver(false);
    setMoveHistory([]);
    setCaptured({ b: 0, w: 0 });
    setBlitzTime({ [BLACK]: BLITZ_SECONDS, [WHITE]: BLITZ_SECONDS });
    setMoveCount(0);
    startTimeRef.current = Date.now();
    setShowConfetti(false);
  };

  const playerLabel = (p) => {
    if (mode === 'ai') return p === BLACK ? 'Ты' : 'ИИ';
    return p === BLACK ? 'Игрок 1' : 'Игрок 2';
  };

  return (
    <motion.div
      className="min-h-screen pt-24 pb-8 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Confetti active={showConfetti} />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate('/play')} className="btn-secondary text-sm">
            ← Назад
          </button>
          <div className="text-center">
            <AnimatePresence mode="wait">
              {aiThinking ? (
                <motion.p
                  key="thinking"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-purple-600/60 animate-pulse"
                >
                  🧠 ИИ думает...
                </motion.p>
              ) : (
                <motion.p
                  key={currentPlayer}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm font-medium gradient-text"
                >
                  {gameOver ? '' : `Ход: ${playerLabel(currentPlayer)}`}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          <button onClick={restart} className="btn-secondary text-sm">
            🔄 Заново
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 items-start justify-center">
          {/* Left panel */}
          <div className="flex flex-col gap-3 w-full lg:w-48">
            {/* Player 2 info */}
            <div className={`glass-card p-4 transition-all duration-300 ${currentPlayer === WHITE && !gameOver ? 'ring-2 ring-[#FF6B7A]' : ''}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full piece-p2" />
                <span className="font-semibold text-sm">{playerLabel(WHITE)}</span>
              </div>
              <div className="text-xs text-purple-600/60">
                ♟ {pieces.white} шашек {pieces.whiteKings > 0 && `• ♛ ${pieces.whiteKings} дам`}
              </div>
              <div className="text-xs text-purple-600/60 mt-1">
                Взял: {captured.w}
              </div>
              {mode === 'blitz' && (
                <div className="mt-2">
                  <Timer
                    seconds={blitzTime[WHITE]}
                    maxSeconds={BLITZ_SECONDS}
                    urgent={blitzTime[WHITE] <= 10}
                  />
                </div>
              )}
            </div>

            {/* Move history */}
            <div className="h-48 lg:h-auto lg:flex-1">
              <MoveHistory moves={moveHistory} />
            </div>
          </div>

          {/* Board */}
          <div className="flex-shrink-0 w-full max-w-[520px]">
            <Board
              board={board}
              currentPlayer={currentPlayer}
              onMove={handleMove}
              validMoves={validMoves}
              disabled={isDisabled}
            />
          </div>

          {/* Right panel */}
          <div className="flex flex-col gap-3 w-full lg:w-48">
            {/* Player 1 info */}
            <div className={`glass-card p-4 transition-all duration-300 ${currentPlayer === BLACK && !gameOver ? 'ring-2 ring-[#9B6DFF]' : ''}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full piece-p1" />
                <span className="font-semibold text-sm">{playerLabel(BLACK)}</span>
              </div>
              <div className="text-xs text-purple-600/60">
                ♟ {pieces.black} шашек {pieces.blackKings > 0 && `• ♛ ${pieces.blackKings} дам`}
              </div>
              <div className="text-xs text-purple-600/60 mt-1">
                Взял: {captured.b}
              </div>
              {mode === 'blitz' && (
                <div className="mt-2">
                  <Timer
                    seconds={blitzTime[BLACK]}
                    maxSeconds={BLITZ_SECONDS}
                    urgent={blitzTime[BLACK] <= 10}
                  />
                </div>
              )}
            </div>

            {/* Puzzle tip */}
            {mode === 'puzzle' && (
              <div className="glass-card p-4">
                <div className="text-2xl mb-2">💡</div>
                <p className="text-sm text-purple-700/70">{PUZZLES[0].tip}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Game Over Modal */}
      <AnimatePresence>
        {gameOver && winner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="glass-card p-8 text-center max-w-sm mx-4"
            >
              <div className="text-6xl mb-4">
                {mode === 'ai'
                  ? winner === BLACK ? '🏆' : '😔'
                  : '🏆'}
              </div>
              <h2 className="text-3xl font-bold gradient-text mb-2">
                {mode === 'ai'
                  ? winner === BLACK ? 'Ты победил!' : 'ИИ победил'
                  : `${playerLabel(winner)} победил!`}
              </h2>
              <p className="text-purple-600/60 mb-2 text-sm">
                Ходов сыграно: {moveCount}
              </p>
              <p className="text-purple-600/60 mb-6 text-sm">
                Время: {Math.floor((Date.now() - startTimeRef.current) / 60000)}м {Math.floor(((Date.now() - startTimeRef.current) % 60000) / 1000)}с
              </p>
              <div className="flex gap-3">
                <button onClick={restart} className="btn-primary flex-1 text-sm py-3">
                  Играть снова
                </button>
                <button onClick={() => navigate('/coach')} className="btn-secondary flex-1 text-sm py-3">
                  🧑‍🏫 Coach
                </button>
              </div>
              <button
                onClick={() => navigate('/play')}
                className="mt-3 text-sm text-purple-600/60 underline hover:text-purple-600"
              >
                Выбрать режим
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
