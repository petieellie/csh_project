import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import SudokuBoard from './components/SudokuBoard'
import './App.css'

// 수도쿠 초기 문제 생성 (간단한 예시)
const generateInitialPuzzle = () => {
  // 간단한 해결 가능한 수도쿠 문제
  const puzzle = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9],
  ]
  
  // 정답 보드
  const solution = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9],
  ]
  
  return { puzzle, solution }
}

function App() {
  // 초기 퍼즐 데이터 생성
  const initialData = useMemo(() => generateInitialPuzzle(), [])
  
  const [board, setBoard] = useState(() => 
    initialData.puzzle.map(row => [...row])
  )
  const [initialBoard, setInitialBoard] = useState(() => 
    initialData.puzzle.map(row => [...row])
  )
  const [solution, setSolution] = useState(() => 
    initialData.solution.map(row => [...row])
  )
  
  // 타이머 상태
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(true)
  const timerRef = useRef(null)

  // 행 검증
  const checkRow = useCallback((row, col, value, currentBoard) => {
    if (value === 0) return false
    for (let c = 0; c < 9; c++) {
      if (c !== col && currentBoard[row][c] === value) {
        return true
      }
    }
    return false
  }, [])

  // 열 검증
  const checkCol = useCallback((row, col, value, currentBoard) => {
    if (value === 0) return false
    for (let r = 0; r < 9; r++) {
      if (r !== row && currentBoard[r][col] === value) {
        return true
      }
    }
    return false
  }, [])

  // 3x3 블록 검증
  const checkBlock = useCallback((row, col, value, currentBoard) => {
    if (value === 0) return false
    const blockRow = Math.floor(row / 3) * 3
    const blockCol = Math.floor(col / 3) * 3
    
    for (let r = blockRow; r < blockRow + 3; r++) {
      for (let c = blockCol; c < blockCol + 3; c++) {
        if (r !== row && c !== col && currentBoard[r][c] === value) {
          return true
        }
      }
    }
    return false
  }, [])

  // 셀 에러 체크
  const isCellError = useCallback((row, col, currentBoard) => {
    const value = currentBoard[row][col]
    if (value === 0) return false
    
    return checkRow(row, col, value, currentBoard) || 
           checkCol(row, col, value, currentBoard) || 
           checkBlock(row, col, value, currentBoard)
  }, [checkRow, checkCol, checkBlock])

  // 전체 보드의 에러 상태 계산
  const errorBoard = useMemo(() => {
    const errors = Array(9).fill(null).map(() => Array(9).fill(false))
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        errors[r][c] = isCellError(r, c, board)
      }
    }
    return errors
  }, [board, isCellError])

  // 빈칸 수 계산
  const emptyCells = useMemo(() => {
    let count = 0
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) count++
      }
    }
    return count
  }, [board])

  // 각 숫자별 잔여 개수 계산 (1-9 각각 9개씩 있어야 함)
  const numberCounts = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 }
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const value = board[r][c]
        if (value >= 1 && value <= 9) {
          counts[value]++
        }
      }
    }
    // 각 숫자별로 9개 중 몇 개가 남았는지 계산
    const remaining = {}
    for (let i = 1; i <= 9; i++) {
      remaining[i] = 9 - counts[i]
    }
    return remaining
  }, [board])

  // 완료 체크
  const isCompleted = useMemo(() => {
    if (emptyCells > 0) return false
    
    // 에러가 있는지 확인
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (errorBoard[r][c]) return false
      }
    }
    
    return true
  }, [emptyCells, errorBoard])

  // 완료 시 타이머 정지
  useEffect(() => {
    if (isCompleted && isTimerRunning) {
      setIsTimerRunning(false)
    }
  }, [isCompleted, isTimerRunning])

  // 타이머 효과
  useEffect(() => {
    if (isTimerRunning && !isCompleted) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isTimerRunning, isCompleted])

  // 타이머 포맷 (mm:ss)
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  // 셀 값 변경
  const handleCellChange = useCallback((row, col, value) => {
    // 초기 보드의 고정 숫자는 변경 불가
    if (initialBoard[row][col] !== 0) return
    
    setBoard(prev => {
      const newBoard = prev.map(r => [...r])
      newBoard[row][col] = value
      return newBoard
    })
  }, [initialBoard])

  // 새 게임
  const handleNewGame = useCallback(() => {
    const { puzzle, solution } = generateInitialPuzzle()
    setBoard(puzzle.map(row => [...row]))
    setInitialBoard(puzzle.map(row => [...row]))
    setSolution(solution.map(row => [...row]))
    // 타이머 리셋 및 재시작
    setElapsedTime(0)
    setIsTimerRunning(true)
  }, [])

  // 힌트 (첫 번째 빈칸에 정답 넣기)
  const handleHint = useCallback(() => {
    setBoard(prev => {
      const newBoard = prev.map(r => [...r])
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (newBoard[r][c] === 0) {
            newBoard[r][c] = solution[r][c]
            return newBoard
          }
        }
      }
      return newBoard
    })
  }, [solution])

  return (
    <div className="app">
      <div className="app-container">
        <h1>수도쿠 게임</h1>
        
        {isCompleted && (
          <div className="completion-message">
            🎉 축하합니다! 수도쿠를 완성했습니다!
          </div>
        )}
        
        <div className="game-info">
          <div className="info-items">
            <div className="empty-cells">남은 빈칸: {emptyCells}</div>
            <div className="timer">⏱️ 시간: {formatTime(elapsedTime)}</div>
          </div>
        </div>
        
        <div className="board-wrapper">
          <SudokuBoard
            board={board}
            initialBoard={initialBoard}
            errorBoard={errorBoard}
            onCellChange={handleCellChange}
          />
          
          <div className="number-counts">
            <div className="number-counts-title">숫자별 잔여 개수</div>
            <div className="number-counts-grid">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <div 
                  key={num} 
                  className={`number-count-item ${numberCounts[num] === 0 ? 'completed' : ''}`}
                >
                  <div className="number-count-number">{num}</div>
                  <div className="number-count-value">{numberCounts[num]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="controls">
          <button onClick={handleNewGame} className="btn btn-new-game">
            새 게임
          </button>
          <button onClick={handleHint} className="btn btn-hint" disabled={emptyCells === 0}>
            힌트
          </button>
        </div>
        
        {isCompleted && (
          <div className="completion-message bottom">
            🎉 축하합니다! 수도쿠를 완성했습니다!
          </div>
        )}
      </div>
    </div>
  )
}

export default App

