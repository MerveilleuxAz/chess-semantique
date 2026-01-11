import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PieceColor } from '@/types/chess';
import { getPieceSymbol } from '@/lib/chess-utils';

interface PromotionModalProps {
  isOpen: boolean;
  color: PieceColor;
  onSelect: (pieceType: 'queen' | 'rook' | 'bishop' | 'knight') => void;
}

const promotionPieces: { type: 'queen' | 'rook' | 'bishop' | 'knight'; name: string }[] = [
  { type: 'queen', name: 'Dame' },
  { type: 'rook', name: 'Tour' },
  { type: 'bishop', name: 'Fou' },
  { type: 'knight', name: 'Cavalier' },
];

export const PromotionModal = ({ isOpen, color, onSelect }: PromotionModalProps) => {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center font-serif text-2xl">
            ♟️ Promotion du Pion
          </DialogTitle>
        </DialogHeader>
        <p className="text-center text-muted-foreground">
          Choisissez une pièce pour promouvoir votre pion :
        </p>
        <div className="flex justify-center gap-4 py-6">
          {promotionPieces.map((piece) => (
            <Button
              key={piece.type}
              variant="outline"
              className="w-16 h-16 text-4xl hover:scale-110 transition-transform"
              onClick={() => onSelect(piece.type)}
            >
              {getPieceSymbol({ type: piece.type, color })}
            </Button>
          ))}
        </div>
        <div className="flex justify-center gap-2 text-sm text-muted-foreground">
          {promotionPieces.map((piece) => (
            <span key={piece.type} className="w-16 text-center">
              {piece.name}
            </span>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
