import { useState, useCallback, useEffect, useRef } from 'react'
import { initialBoard, getAllMoves, getValidMoves, applyMove, checkWinner, belongsTo } from '../utils/gameRules'
import { getBestMove } from '../utils/aiEngine'
import { PLAYER, GAME_MODE, GAME_STATUS, DIFFICULTY } from '../utils/constants'

export function useGameLogic({ mode = GAME_MODE.AI, difficulty = DIFFICULTY.L3, startingBoard = null, onGameEnd, onCapture }) {
  const [board, setBoard] = useState(() => startingBoard ?? initialBoard())
  const [currentPlayer, setCurrentPlayer] = useState(PLAYER.RED)
  const [selected, setSelected] = useState(null)
  const [validMoves, setValidMoves] = useState([])
  const [status, setStatus] = useState(GAME_STATUS.PLAYING)
  const [winner, setWinner] = useState(null)
  const [capturedRed, setCapturedRed] = useState(0)
  const [capturedBlack, setCapturedBlack] = useState(0)
  const [moveCount, setMoveCount] = useState(0)
  const [aiThinking, setAiThinking] = useState(false)
  const [lastMove, setLastMove] = useState(null)
  const [moveHistory, setMoveHistory] = useState([]) // { board, move, player }
  const boardRef = useRef(board)

  useEffect(() => { boardRef.current = board }, [board])

  const endGame = useCallback((w) => {
    setStatus(GAME_STATUS.OVER)
    setWinner(w)
    onGameEnd?.({ winner: w })
  }, [onGameEnd])

  const doMove = useCallback((move, boardState, player) => {
    setMoveHistory(h => [...h, { board: boardState, move, player }])
    const newBoard = applyMove(boardState, move)
    setBoard(newBoard)
    setLastMove(move)
    setMoveCount(c => c + 1)
    if (move.captures.length > 0) {
      if (player === PLAYER.RED) setCapturedRed(c => c + move.captures.length)
      else setCapturedBlack(c => c + move.captures.length)
      onCapture?.({ player, count: move.captures.length })
    }
    const w = checkWinner(newBoard)
    if (w) { endGame(w); return newBoard }
    setCurrentPlayer(p => p === PLAYER.RED ? PLAYER.BLACK : PLAYER.RED)
    return newBoard
  }, [endGame, onCapture])

  // AI turn
  useEffect(() => {
    if (mode !== GAME_MODE.AI || currentPlayer !== PLAYER.BLACK || status !== GAME_STATUS.PLAYING) return
    setAiThinking(true)
    const delays = { [DIFFICULTY.L1]: 400, [DIFFICULTY.L2]: 500, [DIFFICULTY.L3]: 600, [DIFFICULTY.L4]: 800, [DIFFICULTY.L5]: 1000 }
    const timer = setTimeout(() => {
      const b = boardRef.current
      const move = getBestMove(b, difficulty)
      if (move) doMove(move, b, PLAYER.BLACK)
      setAiThinking(false)
    }, delays[difficulty] ?? 600)
    return () => clearTimeout(timer)
  }, [currentPlayer, mode, difficulty, status, doMove])

  const handleSquareClick = useCallback((row, col) => {
    if (status !== GAME_STATUS.PLAYING) return
    if (mode === GAME_MODE.AI && currentPlayer === PLAYER.BLACK) return

    const piece = board[row][col]
    const allMoves = getAllMoves(board, currentPlayer)
    const hasMandatoryCapture = allMoves.some(m => m.captures.length > 0)

    // Execute a move
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
    if (piece && belongsTo(piece, currentPlayer)) {
      const pieceMoves = getValidMoves(board, row, col).filter(m =>
        hasMandatoryCapture ? m.captures.length > 0 : true
      )
      setSelected([row, col])
      setValidMoves(pieceMoves)
    } else {
      setSelected(null)
      setValidMoves([])
    }
  }, [board, selected, validMoves, currentPlayer, status, mode, doMove])

  const reset = useCallback((newStartingBoard = null) => {
    const freshBoard = newStartingBoard ?? initialBoard()
    boardRef.current = freshBoard
    setBoard(freshBoard)
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
    setMoveHistory([])
  }, [])

  return {
    board, currentPlayer, selected, validMoves, status, winner,
    capturedRed, capturedBlack, moveCount, aiThinking, lastMove, moveHistory,
    handleSquareClick, reset,
  }
}
