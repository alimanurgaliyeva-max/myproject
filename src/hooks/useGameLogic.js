import { useState, useCallback, useEffect, useRef } from 'react'
import { initialBoard, getAllMoves, getValidMoves, getImmediateCaptures, applyMove, checkWinner, belongsTo } from '../utils/gameRules'
import { getBestMove } from '../utils/aiEngine'
import { playMoveSound, playCaptureSound } from '../services/audio'
import { PLAYER, GAME_MODE, GAME_STATUS, DIFFICULTY, PIECE, BOARD_SIZE } from '../utils/constants'

// Apply a single capture step to a board copy; returns new board + promoted piece type.
function applyOneCapture(board, fromPos, toPos, capturedPos, piece) {
  const b = board.map(r => [...r])
  b[fromPos[0]][fromPos[1]] = PIECE.EMPTY
  b[capturedPos[0]][capturedPos[1]] = PIECE.EMPTY
  let movedPiece = piece
  if (piece === PIECE.RED   && toPos[0] === 0)              movedPiece = PIECE.RED_KING
  if (piece === PIECE.BLACK && toPos[0] === BOARD_SIZE - 1) movedPiece = PIECE.BLACK_KING
  b[toPos[0]][toPos[1]] = movedPiece
  return { newBoard: b, newPiece: movedPiece }
}

export function useGameLogic({
  mode = GAME_MODE.AI,
  difficulty = DIFFICULTY.L3,
  startingBoard = null,
  onGameEnd,
  onCapture,
  soundEnabled = true,
}) {
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
  const [moveHistory, setMoveHistory] = useState([])
  const [lastCaptures, setLastCaptures] = useState([])
  // chainState: active when player is stepping through a multi-capture sequence
  const [chainState, setChainState] = useState(null)
  // displayBoardOverride: used during AI chain animation to show intermediate states
  const [displayBoardOverride, setDisplayBoardOverride] = useState(null)

  const boardRef = useRef(board)
  const moveHistoryRef = useRef([])
  const capturedRedRef = useRef(0)
  const capturedBlackRef = useRef(0)
  const animCancelRef = useRef(null)
  const soundEnabledRef = useRef(soundEnabled)

  useEffect(() => { boardRef.current = board }, [board])
  useEffect(() => { soundEnabledRef.current = soundEnabled }, [soundEnabled])

  const endGame = useCallback((w, history, capRed, capBlack) => {
    setStatus(GAME_STATUS.OVER)
    setWinner(w)
    onGameEnd?.({ winner: w, moveHistory: history, capturedRed: capRed, capturedBlack: capBlack })
  }, [onGameEnd])

  // opts.skipGhosts — don't set lastCaptures (used when chain animation already showed them)
  const doMove = useCallback((move, boardState, player, opts = {}) => {
    const entry = { board: boardState, move, player }
    moveHistoryRef.current = [...moveHistoryRef.current, entry]
    setMoveHistory(h => [...h, entry])

    if (!opts.skipGhosts && move.captures.length > 0) {
      const ghosts = move.captures.map(([r, c]) => ({ row: r, col: c, piece: boardState[r][c] }))
      setLastCaptures(ghosts)
      setTimeout(() => setLastCaptures([]), 480)
    }

    const newBoard = applyMove(boardState, move)
    setBoard(newBoard)
    setLastMove(move)
    setMoveCount(c => c + 1)

    if (move.captures.length > 0) {
      if (player === PLAYER.RED) {
        capturedRedRef.current += move.captures.length
        setCapturedRed(capturedRedRef.current)
      } else {
        capturedBlackRef.current += move.captures.length
        setCapturedBlack(capturedBlackRef.current)
      }
      onCapture?.({ player, count: move.captures.length })
    }

    const w = checkWinner(newBoard)
    if (w) {
      endGame(w, moveHistoryRef.current, capturedRedRef.current, capturedBlackRef.current)
      return newBoard
    }
    setCurrentPlayer(p => p === PLAYER.RED ? PLAYER.BLACK : PLAYER.RED)
    return newBoard
  }, [endGame, onCapture])

  // Animate AI multi-capture move step by step, then commit the full move.
  const playAIChain = useCallback((move, boardState) => {
    animCancelRef.current?.()
    let cancelled = false
    animCancelRef.current = () => { cancelled = true }

    let currentPiece = boardState[move.from[0]][move.from[1]]
    const animBoard = boardState.map(r => [...r])
    animBoard[move.from[0]][move.from[1]] = PIECE.EMPTY

    function step(i) {
      if (cancelled) return
      if (i >= move.waypoints.length) {
        setDisplayBoardOverride(null)
        setLastCaptures([])
        doMove(move, boardState, PLAYER.BLACK, { skipGhosts: true })
        setAiThinking(false)
        return
      }

      if (i > 0) animBoard[move.waypoints[i - 1][0]][move.waypoints[i - 1][1]] = PIECE.EMPTY

      // Promotion check mid-chain
      if (currentPiece === PIECE.BLACK && move.waypoints[i][0] === BOARD_SIZE - 1) currentPiece = PIECE.BLACK_KING

      animBoard[move.waypoints[i][0]][move.waypoints[i][1]] = currentPiece

      const ghost = {
        row: move.captures[i][0],
        col: move.captures[i][1],
        piece: boardState[move.captures[i][0]][move.captures[i][1]],
      }

      setDisplayBoardOverride(animBoard.map(r => [...r]))
      setLastCaptures([ghost])
      playCaptureSound(soundEnabledRef.current)

      setTimeout(() => {
        if (cancelled) return
        animBoard[move.captures[i][0]][move.captures[i][1]] = PIECE.EMPTY
        setLastCaptures([])
        setTimeout(() => { if (!cancelled) step(i + 1) }, 60)
      }, 380)
    }

    step(0)
  }, [doMove])

  // AI turn
  useEffect(() => {
    if (mode !== GAME_MODE.AI || currentPlayer !== PLAYER.BLACK || status !== GAME_STATUS.PLAYING) return
    setAiThinking(true)
    const delays = { [DIFFICULTY.L1]: 300, [DIFFICULTY.L2]: 400, [DIFFICULTY.L3]: 500, [DIFFICULTY.L4]: 700, [DIFFICULTY.L5]: 900 }
    const timer = setTimeout(() => {
      const b = boardRef.current
      const move = getBestMove(b, difficulty)
      if (move) {
        if (move.captures.length > 1) {
          // Keep aiThinking=true during chain animation so player can't click
          playAIChain(move, b)
        } else {
          if (move.captures.length === 1) playCaptureSound(soundEnabledRef.current)
          else playMoveSound(soundEnabledRef.current)
          doMove(move, b, PLAYER.BLACK)
          setAiThinking(false)
        }
      } else {
        setAiThinking(false)
      }
    }, delays[difficulty] ?? 500)
    return () => clearTimeout(timer)
  }, [currentPlayer, mode, difficulty, status, doMove, playAIChain])

  const handleSquareClick = useCallback((row, col) => {
    if (status !== GAME_STATUS.PLAYING) return
    if (mode === GAME_MODE.AI && (currentPlayer === PLAYER.BLACK || aiThinking)) return

    // Player is stepping through a chain capture
    if (chainState) {
      const { pos, workingBoard, from, piece, capturedSoFar, waypointsSoFar, originalBoard } = chainState
      const options = getImmediateCaptures(workingBoard, pos[0], pos[1])
      const option = options.find(o => o.to[0] === row && o.to[1] === col)
      if (!option) return

      const { newBoard, newPiece } = applyOneCapture(workingBoard, pos, option.to, option.captured, piece)
      const newCaptures = [...capturedSoFar, option.captured]
      const newWaypoints = [...waypointsSoFar, option.to]

      // Ghost for this step's captured piece
      const ghost = { row: option.captured[0], col: option.captured[1], piece: workingBoard[option.captured[0]][option.captured[1]] }
      setLastCaptures([ghost])
      playCaptureSound(soundEnabledRef.current)
      setTimeout(() => setLastCaptures([]), 480)

      const nextOptions = getImmediateCaptures(newBoard, option.to[0], option.to[1])

      if (nextOptions.length === 0) {
        // Chain complete — commit full move to original board
        const fullMove = { from, to: option.to, captures: newCaptures, waypoints: newWaypoints }
        setChainState(null)
        setSelected(null)
        setValidMoves([])
        doMove(fullMove, originalBoard, currentPlayer, { skipGhosts: true })
      } else {
        // More captures available — continue chain
        setChainState({ from, piece: newPiece, pos: option.to, workingBoard: newBoard, capturedSoFar: newCaptures, waypointsSoFar: newWaypoints, originalBoard })
      }
      return
    }

    // Normal move selection
    const piece = board[row][col]
    const allMoves = getAllMoves(board, currentPlayer)
    const hasMandatoryCapture = allMoves.some(m => m.captures.length > 0)

    if (selected) {
      const move = validMoves.find(m => m.to[0] === row && m.to[1] === col)
      if (move) {
        if (move.captures.length > 0) {
          // First step of a capture: apply it and check for chain continuation
          const movingPiece = board[selected[0]][selected[1]]
          const { newBoard, newPiece } = applyOneCapture(board, move.from, move.to, move.captures[0], movingPiece)
          const ghost = { row: move.captures[0][0], col: move.captures[0][1], piece: board[move.captures[0][0]][move.captures[0][1]] }
          setLastCaptures([ghost])
          playCaptureSound(soundEnabledRef.current)
          setTimeout(() => setLastCaptures([]), 480)

          const nextOptions = getImmediateCaptures(newBoard, move.to[0], move.to[1])
          if (nextOptions.length === 0) {
            // Single capture — done
            setSelected(null)
            setValidMoves([])
            doMove(move, board, currentPlayer, { skipGhosts: true })
          } else {
            // Enter chain state
            setSelected(null)
            setValidMoves([])
            setChainState({
              from: move.from,
              piece: newPiece,
              pos: move.to,
              workingBoard: newBoard,
              capturedSoFar: [move.captures[0]],
              waypointsSoFar: [move.to],
              originalBoard: board,
            })
          }
          return
        }
        // Non-capture move
        playMoveSound(soundEnabledRef.current)
        doMove(move, board, currentPlayer)
        setSelected(null)
        setValidMoves([])
        return
      }
    }

    // Select a piece
    if (piece && belongsTo(piece, currentPlayer)) {
      if (hasMandatoryCapture) {
        const firstSteps = getImmediateCaptures(board, row, col)
        if (firstSteps.length === 0) {
          setSelected(null)
          setValidMoves([])
          return
        }
        setSelected([row, col])
        setValidMoves(firstSteps.map(o => ({ from: [row, col], to: o.to, captures: [o.captured], waypoints: [o.to] })))
      } else {
        const pieceMoves = getValidMoves(board, row, col)
        setSelected([row, col])
        setValidMoves(pieceMoves)
      }
    } else {
      setSelected(null)
      setValidMoves([])
    }
  }, [board, selected, validMoves, currentPlayer, status, mode, aiThinking, doMove, chainState])

  const reset = useCallback((newStartingBoard = null) => {
    animCancelRef.current?.()
    animCancelRef.current = null
    const freshBoard = newStartingBoard ?? initialBoard()
    boardRef.current = freshBoard
    moveHistoryRef.current = []
    capturedRedRef.current = 0
    capturedBlackRef.current = 0
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
    setLastCaptures([])
    setAiThinking(false)
    setMoveHistory([])
    setChainState(null)
    setDisplayBoardOverride(null)
  }, [])

  // During chain/animation: show intermediate board and highlight next-step options
  const displayBoard = displayBoardOverride ?? chainState?.workingBoard ?? board
  const displaySelected = chainState ? chainState.pos : selected
  const displayValidMoves = chainState
    ? getImmediateCaptures(chainState.workingBoard, chainState.pos[0], chainState.pos[1])
        .map(o => ({ from: chainState.from, to: o.to, captures: [o.captured], waypoints: [o.to] }))
    : validMoves

  return {
    board: displayBoard,
    currentPlayer,
    selected: displaySelected,
    validMoves: displayValidMoves,
    status, winner,
    capturedRed, capturedBlack, moveCount, aiThinking, lastMove, lastCaptures, moveHistory,
    handleSquareClick, reset,
  }
}
