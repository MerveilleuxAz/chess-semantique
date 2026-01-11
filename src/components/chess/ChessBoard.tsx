import { GameState, Position } from '@/types/chess';
import { Square } from './Square';

interface ChessBoardProps {
  gameState: GameState;
  onSquareClick: (position: Position) => void;
}

export const ChessBoard = ({ gameState, onSquareClick }: ChessBoardProps) => {
  const { board, selectedPosition, legalMoves, kingInCheck } = gameState;
  
  const isLegalMove = (row: number, col: number): boolean => {
    return legalMoves.some(move => move.row === row && move.col === col);
  };
  
  const isSelected = (row: number, col: number): boolean => {
    return selectedPosition?.row === row && selectedPosition?.col === col;
  };
  
  const isCheck = (row: number, col: number): boolean => {
    return kingInCheck?.row === row && kingInCheck?.col === col;
  };
  
  return (
    <div className="relative">
      {/* Board shadow and frame */}
      <div className="absolute inset-0 -m-3 bg-primary/20 rounded-xl blur-xl" />
      <div className="relative p-2 sm:p-3 bg-primary rounded-lg shadow-board">
        <div className="grid grid-cols-8 w-full aspect-square">
          {board.map((row, rowIndex) =>
            row.map((piece, colIndex) => (
              <Square
                key={`${rowIndex}-${colIndex}`}
                position={{ row: rowIndex, col: colIndex }}
                piece={piece}
                isLight={(rowIndex + colIndex) % 2 === 0}
                isSelected={isSelected(rowIndex, colIndex)}
                isLegalMove={isLegalMove(rowIndex, colIndex)}
                isCheck={isCheck(rowIndex, colIndex)}
                onClick={() => onSquareClick({ row: rowIndex, col: colIndex })}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
