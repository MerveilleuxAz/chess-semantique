import { ChessPiece, Position } from '@/types/chess';
import { Piece } from './Piece';
import { cn } from '@/lib/utils';

interface SquareProps {
  position: Position;
  piece: ChessPiece | null;
  isLight: boolean;
  isSelected: boolean;
  isLegalMove: boolean;
  isCheck?: boolean;
  onClick: () => void;
}

export const Square = ({
  position,
  piece,
  isLight,
  isSelected,
  isLegalMove,
  isCheck,
  onClick,
}: SquareProps) => {
  const hasCapture = isLegalMove && piece !== null;
  
  return (
    <button
      onClick={onClick}
      className={cn(
        'aspect-square flex items-center justify-center relative transition-colors duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset',
        isLight ? 'chess-square-light' : 'chess-square-dark',
        isSelected && 'chess-square-selected',
        isCheck && 'chess-square-check',
        isLegalMove && !hasCapture && 'chess-square-legal',
        hasCapture && 'chess-square-legal chess-square-legal-capture',
        'hover:brightness-105'
      )}
      aria-label={`Square ${String.fromCharCode(97 + position.col)}${8 - position.row}${piece ? ` with ${piece.color} ${piece.type}` : ''}`}
    >
      {piece && <Piece piece={piece} isSelected={isSelected} />}
      
      {/* File and rank labels */}
      {position.row === 7 && (
        <span className={cn(
          'absolute bottom-0.5 right-1 text-xs font-medium',
          isLight ? 'text-chess-dark/70' : 'text-chess-light/70'
        )}>
          {String.fromCharCode(97 + position.col)}
        </span>
      )}
      {position.col === 0 && (
        <span className={cn(
          'absolute top-0.5 left-1 text-xs font-medium',
          isLight ? 'text-chess-dark/70' : 'text-chess-light/70'
        )}>
          {8 - position.row}
        </span>
      )}
    </button>
  );
};
