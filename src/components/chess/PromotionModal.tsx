import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PieceColor, PieceType } from '@/types/chess';
import { getPieceSymbol } from '@/lib/chess-utils';

interface PromotionModalProps {
  isOpen: boolean;
  color: PieceColor;
  onSelect: (pieceType: 'queen' | 'rook' | 'bishop' | 'knight') => void;
}

const promotionPieces: ('queen' | 'rook' | 'bishop' | 'knight')[] = [
  'queen',
  'rook',
  'bishop',
  'knight',
];

export const PromotionModal = ({ isOpen, color, onSelect }: PromotionModalProps) => {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center font-serif text-2xl">
            ♟️ Pawn Promotion
          </DialogTitle>
        </DialogHeader>
        <p className="text-center text-muted-foreground">
          Choose a piece to promote your pawn:
        </p>
        <div className="flex justify-center gap-4 py-6">
          {promotionPieces.map((pieceType) => (
            <Button
              key={pieceType}
              variant="outline"
              className="w-16 h-16 text-4xl hover:scale-110 transition-transform"
              onClick={() => onSelect(pieceType)}
            >
              {getPieceSymbol({ type: pieceType, color })}
            </Button>
          ))}
        </div>
        <div className="flex justify-center gap-2 text-sm text-muted-foreground">
          {promotionPieces.map((pieceType) => (
            <span key={pieceType} className="w-16 text-center capitalize">
              {pieceType}
            </span>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
