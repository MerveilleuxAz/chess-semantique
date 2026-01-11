import { PieceType, Position, ChessPiece } from '@/types/chess';

interface MoveExplanation {
  message: string;
  explanation: string;
  owlRule: string;
}

// Detailed error messages for each piece type
export const getPieceRuleExplanation = (
  piece: ChessPiece,
  from: Position,
  to: Position,
  targetPiece: ChessPiece | null,
  currentPlayerColor: string
): MoveExplanation => {
  // Wrong turn
  if (piece.color !== currentPlayerColor) {
    return {
      message: `Ce n'est pas votre tour`,
      explanation: `C'est au tour des ${currentPlayerColor === 'white' ? 'Blancs' : 'Noirs'} de jouer. Vous ne pouvez pas déplacer les pièces adverses.`,
      owlRule: 'chess:TurnViolation',
    };
  }

  const pieceNames: Record<PieceType, string> = {
    king: 'Roi',
    queen: 'Dame',
    rook: 'Tour',
    bishop: 'Fou',
    knight: 'Cavalier',
    pawn: 'Pion',
  };

  const pieceName = pieceNames[piece.type];
  const dx = Math.abs(to.col - from.col);
  const dy = Math.abs(to.row - from.row);

  switch (piece.type) {
    case 'pawn': {
      const direction = piece.color === 'white' ? -1 : 1;
      const isForward = (to.row - from.row) === direction || (to.row - from.row) === 2 * direction;
      const isDiagonal = dx === 1 && (to.row - from.row) === direction;

      if (isDiagonal && !targetPiece) {
        return {
          message: `Capture diagonale impossible`,
          explanation: `Le pion ne peut capturer qu'en diagonale et uniquement s'il y a une pièce adverse sur la case cible. La case ${String.fromCharCode(97 + to.col)}${8 - to.row} est vide.`,
          owlRule: 'chess:InvalidPawnCapture',
        };
      }

      if (dx === 0 && targetPiece) {
        return {
          message: `Le pion ne peut pas capturer en avant`,
          explanation: `Le pion avance tout droit mais ne peut capturer que sur les diagonales. Une pièce bloque son chemin en ${String.fromCharCode(97 + to.col)}${8 - to.row}.`,
          owlRule: 'chess:InvalidPawnMove',
        };
      }

      if (!isForward) {
        return {
          message: `Le pion ne peut pas reculer`,
          explanation: `Le pion ne peut se déplacer que vers l'avant (vers le camp adverse). Il ne peut jamais reculer.`,
          owlRule: 'chess:InvalidPawnDirection',
        };
      }

      return {
        message: `Mouvement de pion invalide`,
        explanation: `Le pion avance d'une case (ou deux depuis sa position initiale) et capture en diagonale. Ce mouvement ne respecte pas ces règles.`,
        owlRule: 'chess:InvalidPawnMove',
      };
    }

    case 'rook': {
      if (dx !== 0 && dy !== 0) {
        return {
          message: `La tour ne se déplace pas en diagonale`,
          explanation: `La tour se déplace uniquement en ligne droite : horizontalement ou verticalement, sur autant de cases que souhaité. Les mouvements en diagonale sont réservés au fou et à la dame.`,
          owlRule: 'chess:InvalidRookMove',
        };
      }
      return {
        message: `Mouvement de tour bloqué`,
        explanation: `La tour ne peut pas sauter par-dessus d'autres pièces. Une ou plusieurs pièces bloquent le chemin vers ${String.fromCharCode(97 + to.col)}${8 - to.row}.`,
        owlRule: 'chess:RookPathBlocked',
      };
    }

    case 'bishop': {
      if (dx !== dy) {
        return {
          message: `Le fou ne se déplace qu'en diagonale`,
          explanation: `Le fou se déplace uniquement en diagonale, sur autant de cases que souhaité. Il reste toujours sur la même couleur de case (claire ou foncée).`,
          owlRule: 'chess:InvalidBishopMove',
        };
      }
      return {
        message: `Mouvement de fou bloqué`,
        explanation: `Le fou ne peut pas sauter par-dessus d'autres pièces. Une ou plusieurs pièces bloquent la diagonale vers ${String.fromCharCode(97 + to.col)}${8 - to.row}.`,
        owlRule: 'chess:BishopPathBlocked',
      };
    }

    case 'queen': {
      if (dx !== dy && dx !== 0 && dy !== 0) {
        return {
          message: `Mouvement de dame invalide`,
          explanation: `La dame combine les mouvements de la tour et du fou : elle peut se déplacer en ligne droite (horizontale/verticale) ou en diagonale, mais pas en "L" comme le cavalier.`,
          owlRule: 'chess:InvalidQueenMove',
        };
      }
      return {
        message: `Mouvement de dame bloqué`,
        explanation: `La dame ne peut pas sauter par-dessus d'autres pièces. Une ou plusieurs pièces bloquent le chemin vers ${String.fromCharCode(97 + to.col)}${8 - to.row}.`,
        owlRule: 'chess:QueenPathBlocked',
      };
    }

    case 'king': {
      if (dx > 1 || dy > 1) {
        return {
          message: `Le roi ne se déplace que d'une case`,
          explanation: `Le roi peut se déplacer dans toutes les directions, mais d'une seule case à la fois. Pour un déplacement de deux cases, le roque est requis (conditions spéciales).`,
          owlRule: 'chess:InvalidKingMove',
        };
      }
      return {
        message: `Le roi serait en échec`,
        explanation: `Le roi ne peut pas se déplacer sur une case où il serait attaqué par une pièce adverse. Cette case est contrôlée par l'adversaire.`,
        owlRule: 'chess:KingIntoCheck',
      };
    }

    case 'knight': {
      const isValidKnightMove = (dx === 2 && dy === 1) || (dx === 1 && dy === 2);
      if (!isValidKnightMove) {
        return {
          message: `Le cavalier se déplace en "L"`,
          explanation: `Le cavalier effectue un mouvement en forme de "L" : deux cases dans une direction (horizontale ou verticale) puis une case perpendiculairement. C'est la seule pièce qui peut sauter par-dessus les autres.`,
          owlRule: 'chess:InvalidKnightMove',
        };
      }
      return {
        message: `Mouvement de cavalier invalide`,
        explanation: `Le cavalier doit effectuer un mouvement en "L" : 2 cases + 1 case perpendiculaire.`,
        owlRule: 'chess:InvalidKnightMove',
      };
    }
  }

  // This should never be reached due to exhaustive switch, but TypeScript needs it
  const pieceTypeStr = String(piece.type);
  return {
    message: `Mouvement invalide`,
    explanation: `Ce mouvement ne respecte pas les règles de déplacement du ${pieceName}.`,
    owlRule: `chess:Invalid${pieceTypeStr.charAt(0).toUpperCase() + pieceTypeStr.slice(1)}Move`,
  };
};

// Explanation for clicking on empty square without selection
export const getEmptySquareError = (): MoveExplanation => ({
  message: `Aucune pièce sélectionnée`,
  explanation: `Cliquez d'abord sur une de vos pièces pour la sélectionner, puis sur la case de destination.`,
  owlRule: 'chess:NoSelection',
});

// Explanation for selecting enemy piece
export const getWrongColorError = (currentPlayer: string): MoveExplanation => ({
  message: `Ce n'est pas votre pièce`,
  explanation: `C'est au tour des ${currentPlayer === 'white' ? 'Blancs' : 'Noirs'}. Vous ne pouvez sélectionner que vos propres pièces.`,
  owlRule: 'chess:TurnViolation',
});

// Explanation for piece with no legal moves
export const getNoLegalMovesError = (pieceName: string): MoveExplanation => ({
  message: `${pieceName} bloqué`,
  explanation: `Cette pièce n'a aucun mouvement légal disponible. Elle est soit bloquée par d'autres pièces, soit ses mouvements mettraient votre roi en échec.`,
  owlRule: 'chess:NoLegalMoves',
});

// Explanation for illegal destination
export const getIllegalDestinationError = (
  piece: ChessPiece,
  from: Position,
  to: Position,
  targetPiece: ChessPiece | null
): MoveExplanation => {
  return getPieceRuleExplanation(piece, from, to, targetPiece, piece.color);
};
