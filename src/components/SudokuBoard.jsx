import { memo } from 'react'
import SudokuCell from './SudokuCell'
import './SudokuBoard.css'

const SudokuBoard = memo(({ board, initialBoard, errorBoard, onCellChange }) => {
  return (
    <div className="sudoku-board">
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="sudoku-row">
          {row.map((cell, colIndex) => (
            <SudokuCell
              key={`${rowIndex}-${colIndex}`}
              value={cell}
              row={rowIndex}
              col={colIndex}
              isInitial={initialBoard[rowIndex][colIndex] !== 0}
              isError={errorBoard[rowIndex][colIndex]}
              onChange={onCellChange}
            />
          ))}
        </div>
      ))}
    </div>
  )
})

SudokuBoard.displayName = 'SudokuBoard'

export default SudokuBoard

