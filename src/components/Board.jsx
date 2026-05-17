import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllValidMoves, getValidMovesForPiece } from '../utils/gameLogic.js';
import { useGame } from '../context/GameContext.jsx';

const SKINS = {
  classic: { p1: 'piece-p1', p2: 'piece-p2', crown: '♛' },
  astronaut: { p1: null, p2: null, emoji1: '🚀', emoji2: '👾', crown: '' },
  animal: { p1: null, p2: null, emoji1: '🐱', emoji2: '🐶', crown: '' },
  crystal: { p1: null, p2: null, emoji1: '💎', emoji2: '🔮', crown: '' },
};

const PieceEl = ({ cell, isSelected, skinName }) => {
  const skin = SKINS[skinName] || SKINS.classic;
  const isEmoji = skin.emoji1;

  if (isEmoji) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center text-2xl select-none transition-transform duration-200 ${isSelected ? 'scale-125' : 'hover:scale-110'}`}
        style={{ filter: isSelected ? 'drop-shadow(0 0 8px gold)' : undefined }}
      >
        {cell.piece === 'b' ? skin.emoji1 : skin.emoji2}
        {cell.isKing && <span className="absolute text-xs top-0 right-0">👑</span>}
      </div>
    );
  }

  return (
    <div
      className={`w-[78%] h-[78%] rounded-full relative transition-all duration-200 ${
        cell.piece === 'b' ? skin.p1 : skin.p2
      } ${isSelected ? 'piece-selected' : 'hover:scale-105'}`}
    >
      {cell.isKing && (
        <div className="absolute inset-0 flex items-center justify-center text-white/90 font-bold text-sm pointer-events-none">
          {skin.crown}
        </div>
      )}
    </div>
  );
};

export default function Board({ board, currentPlayer, onMove, validMoves, disabled }) {
  const [selected, setSelected] = useState(null);
  const [highlighted, setHighlighted] = useState([]);
  const { skin } = useGame();

  const handleSquareClick = useCallback((row, col) => {
    if (disabled) return;
    const cell = board[row][col];

    // Click own piece to select
    if (cell?.piece === currentPlayer) {
      if (selected?.[0] === row && selected?.[1] === col) {
        setSelected(null);
        setHighlighted([]);
        return;
      }
      const pieceMoves = getValidMovesForPiece(board, currentPlayer, row, col, validMoves);
      setSelected([row, col]);
      setHighlighted(pieceMoves.map(m => m.to));
      return;
    }

    // Click valid destination
    if (selected) {
      const pieceMoves = getValidMovesForPiece(board, currentPlayer, selected[0], selected[1], validMoves);
      const move = pieceMoves.find(m => m.to[0] === row && m.to[1] === col);
      if (move) {
        setSelected(null);
        setHighlighted([]);
        onMove(move);
        return;
      }
    }

    setSelected(null);
    setHighlighted([]);
  }, [board, currentPlayer, selected, validMoves, onMove, disabled]);

  const isHighlighted = useCallback((r, c) => highlighted.some(([hr, hc]) => hr === r && hc === c), [highlighted]);
  const isSelectable = useCallback((r, c) => {
    if (!validMoves) return false;
    return validMoves.some(m => m.from[0] === r && m.from[1] === c);
  }, [validMoves]);

  const colLabels = 'abcdefgh'.split('');

  return (
    <div className="select-none">
      {/* Board */}
      <div
        className="relative rounded-2xl overflow-hidden shadow-board"
        style={{ border: '4px solid rgba(255,255,255,0.5)' }}
      >
        {/* Column labels top */}
        <div className="flex px-6">
          {colLabels.map(l => (
            <div key={l} className="flex-1 text-center text-xs opacity-40 py-1 font-mono">{l}</div>
          ))}
        </div>

        <div className="flex">
          {/* Row labels left */}
          <div className="flex flex-col justify-around px-1">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="text-xs opacity-40 font-mono w-4 text-center">{8 - i}</div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex-1">
            {board.map((row, r) => (
              <div key={r} className="flex">
                {row.map((cell, c) => {
                  const isDark = (r + c) % 2 === 1;
                  const isValidDest = isHighlighted(r, c);
                  const canSelect = isDark && !cell && isValidDest;
                  const isSelectedPiece = selected?.[0] === r && selected?.[1] === c;

                  return (
                    <div
                      key={c}
                      className={`relative flex items-center justify-center aspect-square
                        ${isDark ? 'board-square-dark' : 'board-square-light'}
                        ${isSelectedPiece ? 'highlighted' : ''}
                        ${isDark && isSelectable(r, c) && !disabled ? 'cursor-pointer' : ''}
                        transition-all duration-150`}
                      style={{ width: '12.5%' }}
                      onClick={() => handleSquareClick(r, c)}
                    >
                      {/* Valid move indicator */}
                      {isDark && isValidDest && !cell && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute w-[32%] h-[32%] rounded-full"
                          style={{
                            background: 'rgba(155, 109, 255, 0.5)',
                            boxShadow: '0 0 12px rgba(155, 109, 255, 0.7)',
                          }}
                        />
                      )}

                      {/* Valid capture indicator */}
                      {isDark && isValidDest && cell?.piece && cell.piece !== currentPlayer && (
                        <div
                          className="absolute inset-1 rounded-full border-2"
                          style={{ borderColor: '#FFD700', boxShadow: '0 0 10px rgba(255,215,0,0.6)' }}
                        />
                      )}

                      {/* Piece */}
                      {cell && (
                        <AnimatePresence>
                          <motion.div
                            key={`${r}-${c}-${cell.piece}`}
                            className="absolute inset-0 flex items-center justify-center"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0, y: -10 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                          >
                            <PieceEl
                              cell={cell}
                              isSelected={isSelectedPiece}
                              skinName={skin}
                            />
                          </motion.div>
                        </AnimatePresence>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Row labels right */}
          <div className="flex flex-col justify-around px-1">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="text-xs opacity-40 font-mono w-4 text-center">{8 - i}</div>
            ))}
          </div>
        </div>

        {/* Column labels bottom */}
        <div className="flex px-6">
          {colLabels.map(l => (
            <div key={l} className="flex-1 text-center text-xs opacity-40 py-1 font-mono">{l}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
