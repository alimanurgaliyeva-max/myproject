import { useState, useCallback, useEffect, useRef } from 'react'
import { getInitialBoard, PLAYER, GAME_STATUS, MAX_HISTORY, AI_DIFFICULTY } from '../utils/constants.js'
import {
  getAllMovesForPlayer, applyMoveToBoard, checkGameStatus,
  countPieces, countKings, getMovesForPiece,
} from '../utils/gameRules.js'
import { getBestMove } from '../utils/aiEngine.js'
import { useLocalStorage } from './useLocalStorage.js'
import { cloneBoard } from '../utils/helpers.js'

export function useGameLogic() {
  const [board, setBoard] = useState(getInitialBoard)
  const [currentPlayer, setCurrentPlayer] = useState(PLAYER.RED)
  const [selected, setSelected] = useState(null)       // {row, col}
  const [legalMoves, setLegalMoves] = useState([])     // all legal moves for current player
  const [hintMoves, setHintMoves] = useState([])       // moves for selected piece
  const [gameStatus, setGameStatus] = useState(GAME_STATUS.PLAYING)
  const [moveCount, setMoveCount] = useState(0)
  const [history, setHistory] = useLocalStorage('checkers-history', [])
  const [aiDifficulty, setAiDifficulty] = useLocalStorage('checkers-difficulty', AI_DIFFICULTY.EASY)
  const [showHints, setShowHints] = useLocalStorage('checkers-hints', true)
  const [isAiThinking, setIsAiThinking] = useState(false)
  const [lastMove, setLastMove] = useState(null)
  const [undoStack, setUndoStack] = useState([])
  const [promotedSquare, setPromotedSquare] = useState(null)
  const startTimeRef = useRef(Date.now())
  const aiTimerRef = useRef(null)

  // Compute legal moves whenever board or player changes
  useEffect(() => {
    if (gameStatus !== GAME_STATUS.PLAYING) return
    const moves = getAllMovesForPlayer(board, currentPlayer)
    setLegalMoves(moves)

    if (moves.length === 0) {
      const status = checkGameStatus(board, currentPlayer)
      setGameStatus(status)
      if (status !== GAME_STATUS.PLAYING) {
        saveGameToHistory(status)
      }
    }
  }, [board, currentPlayer, gameStatus])

  // AI turn
  useEffect(() => {
    if (gameStatus !== GAME_STATUS.PLAYING) return
    if (currentPlayer !== PLAYER.BLACK) return

    setIsAiThinking(true)
    const delay = aiDifficulty === AI_DIFFICULTY.HARD ? 600 : 400

    aiTimerRef.current = setTimeout(() => {
      const move = getBestMove(board, aiDifficulty)
      if (move) {
        executeMove(move, true)
      }
      setIsAiThinking(false)
    }, delay)

    return () => clearTimeout(aiTimerRef.current)
  }, [currentPlayer, gameStatus])

  function saveGameToHistory(status) {
    const entry = {
      id: Date.now(),
      date: new Date().toISOString(),
      winner: status === GAME_STATUS.RED_WINS ? 'You' : status === GAME_STATUS.BLACK_WINS ? 'AI' : 'Draw',
      moves: moveCount,
      difficulty: aiDifficulty,
      duration: Math.floor((Date.now() - startTimeRef.current) / 1000),
    }
    setHistory(prev => [entry, ...prev].slice(0, MAX_HISTORY))
  }

  const executeMove = useCallback((move, isAi = false) => {
    setUndoStack(prev => [...prev, { board, currentPlayer, moveCount, selected, lastMove }])
    setSelected(null)
    setHintMoves([])

    const newBoard = applyMoveToBoard(board, move)

    // Check king promotion
    const piece = board[move.from.row][move.from.col]
    const promoted =
      piece?.type === 'normal' &&
      ((piece.player === PLAYER.RED && move.to.row === 7) ||
       (piece.player === PLAYER.BLACK && move.to.row === 0))

    if (promoted) {
      setPromotedSquare(move.to)
      setTimeout(() => setPromotedSquare(null), 800)
    }

    setBoard(newBoard)
    setLastMove(move)
    setMoveCount(prev => prev + 1)

    const opponent = currentPlayer === PLAYER.RED ? PLAYER.BLACK : PLAYER.RED
    const status = checkGameStatus(newBoard, opponent)
    setGameStatus(status)

    if (status !== GAME_STATUS.PLAYING) {
      saveGameToHistory(status)
    } else {
      setCurrentPlayer(opponent)
    }
  }, [board, currentPlayer, moveCount, selected, lastMove])

  const handleSquareClick = useCallback((row, col) => {
    if (gameStatus !== GAME_STATUS.PLAYING) return
    if (currentPlayer !== PLAYER.RED) return // only human plays RED
    if (isAiThinking) return

    const piece = board[row][col]

    // Clicking on own piece: select it
    if (piece && piece.player === PLAYER.RED) {
      const pieceMoves = legalMoves.filter(m => m.from.row === row && m.from.col === col)
      setSelected({ row, col })
      setHintMoves(pieceMoves)
      return
    }

    // Clicking on destination
    if (selected) {
      const move = hintMoves.find(m => m.to.row === row && m.to.col === col)
      if (move) {
        executeMove(move, false)
        return
      }
      // Deselect if clicking elsewhere
      setSelected(null)
      setHintMoves([])
    }
  }, [board, selected, hintMoves, legalMoves, gameStatus, currentPlayer, isAiThinking, executeMove])

  const newGame = useCallback(() => {
    clearTimeout(aiTimerRef.current)
    setBoard(getInitialBoard())
    setCurrentPlayer(PLAYER.RED)
    setSelected(null)
    setLegalMoves([])
    setHintMoves([])
    setGameStatus(GAME_STATUS.PLAYING)
    setMoveCount(0)
    setLastMove(null)
    setUndoStack([])
    setIsAiThinking(false)
    setPromotedSquare(null)
    startTimeRef.current = Date.now()
  }, [])

  const undo = useCallback(() => {
    if (undoStack.length < 2) return // undo both AI + player moves
    const prev2 = undoStack[undoStack.length - 2]
    setUndoStack(s => s.slice(0, -2))
    setBoard(prev2.board)
    setCurrentPlayer(PLAYER.RED)
    setMoveCount(prev2.moveCount)
    setSelected(null)
    setHintMoves([])
    setLastMove(prev2.lastMove)
    setGameStatus(GAME_STATUS.PLAYING)
    setIsAiThinking(false)
  }, [undoStack])

  const stats = {
    red: { pieces: countPieces(board, PLAYER.RED), kings: countKings(board, PLAYER.RED) },
    black: { pieces: countPieces(board, PLAYER.BLACK), kings: countKings(board, PLAYER.BLACK) },
    wins: history.filter(h => h.winner === 'You').length,
    losses: history.filter(h => h.winner === 'AI').length,
  }

  // Destination squares for hints
  const hintSquares = showHints
    ? hintMoves.map(m => ({ row: m.to.row, col: m.to.col, isCapture: m.captures.length > 0 }))
    : []

  // Squares that can be moved (have legal moves available)
  const selectableSquares = legalMoves
    .filter(m => m.from.row !== undefined)
    .reduce((acc, m) => {
      const key = `${m.from.row},${m.from.col}`
      if (!acc.find(s => s.row === m.from.row && s.col === m.from.col)) {
        acc.push({ row: m.from.row, col: m.from.col })
      }
      return acc
    }, [])

  return {
    board, currentPlayer, selected, gameStatus, moveCount,
    hintSquares, selectableSquares, lastMove,
    isAiThinking, aiDifficulty, setAiDifficulty,
    showHints, setShowHints,
    handleSquareClick, newGame, undo,
    history, stats, promotedSquare,
    canUndo: undoStack.length >= 2,
  }
}
