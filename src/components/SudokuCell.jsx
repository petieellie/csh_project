import { memo, useCallback } from 'react'
import './SudokuCell.css'

const SudokuCell = memo(({ value, row, col, isInitial, isError, onChange }) => {
  const handleChange = useCallback((e) => {
    const inputValue = e.target.value
    // 숫자만 입력 가능 (1-9)
    if (inputValue === '' || inputValue === '0') {
      onChange(row, col, 0)
    } else if (/^[1-9]$/.test(inputValue)) {
      onChange(row, col, parseInt(inputValue, 10))
    }
  }, [row, col, onChange])

  const handleKeyDown = useCallback((e) => {
    // 백스페이스, Delete로 숫자 지우기
    if (e.key === 'Backspace' || e.key === 'Delete') {
      if (!isInitial) {
        onChange(row, col, 0)
      }
    }
    // 화살표 키로 이동 (선택사항)
    else if (e.key.startsWith('Arrow')) {
      e.preventDefault()
      // 간단한 화살표 이동 구현은 생략
    }
  }, [row, col, isInitial, onChange])

  return (
    <input
      type="text"
      className={`sudoku-cell ${isInitial ? 'initial' : ''} ${isError ? 'error' : ''}`}
      value={value === 0 ? '' : value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      readOnly={isInitial}
      maxLength={1}
      inputMode="numeric"
    />
  )
})

SudokuCell.displayName = 'SudokuCell'

export default SudokuCell

