import { ChessPiece } from '@/types/chess';
import { getPieceSymbol } from '@/lib/chess-utils';
import { cn } from '@/lib/utils';

interface PieceProps {
  piece: ChessPiece;
  isSelected?: boolean;
}

export const Piece = ({ piece, isSelected }: PieceProps) => {
  return (
    <span
      className={cn(
        'text-4xl sm:text-5xl lg:text-6xl piece-shadow select-none cursor-pointer transition-transform duration-150',
        isSelected && 'animate-piece-lift',
        piece.color === 'white' ? 'text-amber-50 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]' : 'text-stone-900'
      )}
      style={{
        textShadow: piece.color === 'white' 
          ? '0 1px 0 #78716c, 0 2px 3px rgba(0,0,0,0.3)' 
          : '0 1px 0 #1c1917, 0 2px 3px rgba(0,0,0,0.2)',
      }}
    >
      {getPieceSymbol(piece)}
    </span>
  );
};
