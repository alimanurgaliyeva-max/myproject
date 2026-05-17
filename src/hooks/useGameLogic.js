import { useState, useCallback, useEffect } from 'react'
import { initialBoard, getAllMoves, getValidMoves, applyMove, checkWinner } from '../utils/gameRules'
import { getBestMove } from '../utils/aiEngine'
import { useLocalStorage } from './useLocalStorage'
import { PLAYER, GAME_MODE, GAME_STATUS, DIFFICULTY } from '../utils/constants'

export function useGameLogic(mode = GAME_MODE.AI, difficulty = DIFFICULTY.MEDIUM) {
  const [board, setBoard] = useState(initialBoard)
  const [currentPlayer, setCurrentPlayer] = useState(PLAYER.RED)
  const [selected, setSelected] = useState(null)
  const [validMoves, setValidMoves] = useState([])
  const [status, setStatus] = useState(GAME_STATUS.PLAYING)
  const [winner, setWinner] = useState(null)
  const [capturedRed, setCapturedRed] = useState(0)
  const [capturedBlack, setCapturedBlack] = useState(0)
  const [moveCount, setMoveCount] = useState(0)
  const [history, setHistory] = useLocalStorage('dama-history', [])
  const [aiThinking, setAiThinking] = useState(false)
  const [lastMove, setLastMove] = useState(null)

  const endGame = useCallback((w, finalBoard) => {
    setStatus(GAME_STATUS.OVER)
    setWinner(w)
    const record = {
      id: Date.now(),
      date: new Date().toISOString(),
      mode,
      difficulty: mode === GAME_MODE.AI ? difficulty : null,
      winner: w,
      moves: moveCount,
    }
    setHistory(h => [record, ...h].slice(0, 50))
  }, [mode, difficulty, moveCount, setHistory])

  const doMove = useCallback((move, boardState, player) => {
    const newBoard = applyMove(boardState, move)
    setBoard(newBoard)
    setLastMove(move)
    setMoveCount(c => c + 1)
    if (move.captures.length > 0) {
      if (player === PLAYER.RED) setCapturedRed(c => c + move.captures.length)
      else setCapturedBlack(c => c + move.captures.length)
    }
    const w = checkWinner(newBoard)
    if (w) { endGame(w, newBoard); return newBoard }
    setCurrentPlayer(p => p === PLAYER.RED ? PLAYER.BLACK : PLAYER.RED)
    return newBoard
  }, [endGame])

  // AI turn
  useEffect(() => {
    if (mode !== GAME_MODE.AI || currentPlayer !== PLAYER.BLACK || status !== GAME_STATUS.PLAYING) return
    setAiThinking(true)
    const delay = difficulty === DIFFICULTY.EASY ? 400 : difficulty === DIFFICULTY.MEDIUM ? 600 : 900
    const timer = setTimeout(() => {
      const move = getBestMove(board, difficulty)
      if (move) doMove(move, board, PLAYER.BLACK)
      setAiThinking(false)
    }, delay)
    return () => clearTimeout(timer)
  }, [currentPlayer, mode, board, difficulty, status, doMove])

  const handleSquareClick = useCallback((row, col) => {
    if (status !== GAME_STATUS.PLAYING) return
    if (mode === GAME_MODE.AI && currentPlayer === PLAYER.BLACK) return

    const piece = board[row][col]
    const allMoves = getAllMoves(board, currentPlayer)
    const hasMandatoryCapture = allMoves.some(m => m.captures.length > 0)

    // Try to execute a move
    if (selected) {
      const move = validMoves.find(m => m.to[0] === row && m.to[1] === col)
      if (move) {
        doMove(move, board, currentPlayer)
        setSelected(null)
        setValidMoves([])
        return
      }
    }

    // Select a piece
    if (piece && isCurrentPlayerPiece(piece, currentPlayer)) {
      const moves = getValidMoves(board, row, col).filter(m =>
        hasMandatoryCapture ? m.captures.length > 0 : true
      )
      setSelected([row, col])
      setValidMoves(moves)
    } else {
      setSelected(null)
      setValidMoves([])
    }
  }, [board, selected, validMoves, currentPlayer, status, mode, doMove])

  const reset = useCallback(() => {
    setBoard(initialBoard())
    setCurrentPlayer(PLAYER.RED)
    setSelected(null)
    setValidMoves([])
    setStatus(GAME_STATUS.PLAYING)
    setWinner(null)
    setCapturedRed(0)
    setCapturedBlack(0)
    setMoveCount(0)
    setLastMove(null)
    setAiThinking(false)
  }, [])

  return {
    board, currentPlayer, selected, validMoves, status, winner,
    capturedRed, capturedBlack, moveCount, aiThinking, lastMove,
    history, handleSquareClick, reset,
  }
}

function isCurrentPlayerPiece(piece, player) {
  if (player === PLAYER.RED) return piece === 'red' || piece === 'red-king'
  return piece === 'black' || piece === 'black-king'
}
