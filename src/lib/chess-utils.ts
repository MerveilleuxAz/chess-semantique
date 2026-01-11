import { ChessPiece, Position, PieceColor, GameState, Move, PieceType } from '@/types/chess';

// Initial board setup
export const createInitialBoard = (): (ChessPiece | null)[][] => {
  const board: (ChessPiece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Set up pawns
  for (let col = 0; col < 8; col++) {
    board[1][col] = { type: 'pawn', color: 'black' };
    board[6][col] = { type: 'pawn', color: 'white' };
  }
  
  // Set up other pieces
  const pieceOrder: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
  
  for (let col = 0; col < 8; col++) {
    board[0][col] = { type: pieceOrder[col], color: 'black' };
    board[7][col] = { type: pieceOrder[col], color: 'white' };
  }
  
  return board;
};

export const createInitialGameState = (): GameState => ({
  board: createInitialBoard(),
  currentPlayer: 'white',
  selectedPosition: null,
  legalMoves: [],
  moveHistory: [],
  gameStatus: 'playing',
  isTrainingMode: false,
  kingInCheck: null,
});

// Position to algebraic notation
export const positionToNotation = (pos: Position): string => {
  const files = 'abcdefgh';
  const ranks = '87654321';
  return files[pos.col] + ranks[pos.row];
};

// Get piece unicode symbol
export const getPieceSymbol = (piece: ChessPiece): string => {
  const symbols: Record<PieceColor, Record<PieceType, string>> = {
    white: {
      king: '♔',
      queen: '♕',
      rook: '♖',
      bishop: '♗',
      knight: '♘',
      pawn: '♙',
    },
    black: {
      king: '♚',
      queen: '♛',
      rook: '♜',
      bishop: '♝',
      knight: '♞',
      pawn: '♟',
    },
  };
  return symbols[piece.color][piece.type];
};

// Mock legal moves calculation (will be replaced by ontology API)
export const calculateLegalMoves = (
  board: (ChessPiece | null)[][],
  position: Position,
  currentPlayer: PieceColor
): Position[] => {
  const piece = board[position.row][position.col];
  if (!piece || piece.color !== currentPlayer) return [];
  
  const moves: Position[] = [];
  
  const isValidPosition = (row: number, col: number): boolean => {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  };
  
  const canMoveTo = (row: number, col: number): boolean => {
    if (!isValidPosition(row, col)) return false;
    const target = board[row][col];
    return !target || target.color !== piece.color;
  };
  
  const canCapture = (row: number, col: number): boolean => {
    if (!isValidPosition(row, col)) return false;
    const target = board[row][col];
    return target !== null && target.color !== piece.color;
  };
  
  switch (piece.type) {
    case 'pawn': {
      const direction = piece.color === 'white' ? -1 : 1;
      const startRow = piece.color === 'white' ? 6 : 1;
      
      // Forward move
      if (isValidPosition(position.row + direction, position.col) && 
          !board[position.row + direction][position.col]) {
        moves.push({ row: position.row + direction, col: position.col });
        
        // Double move from start
        if (position.row === startRow && 
            !board[position.row + 2 * direction][position.col]) {
          moves.push({ row: position.row + 2 * direction, col: position.col });
        }
      }
      
      // Captures
      for (const dc of [-1, 1]) {
        if (canCapture(position.row + direction, position.col + dc)) {
          moves.push({ row: position.row + direction, col: position.col + dc });
        }
      }
      break;
    }
    
    case 'rook': {
      const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
      for (const [dr, dc] of directions) {
        for (let i = 1; i < 8; i++) {
          const newRow = position.row + dr * i;
          const newCol = position.col + dc * i;
          if (!isValidPosition(newRow, newCol)) break;
          if (board[newRow][newCol]) {
            if (canCapture(newRow, newCol)) moves.push({ row: newRow, col: newCol });
            break;
          }
          moves.push({ row: newRow, col: newCol });
        }
      }
      break;
    }
    
    case 'bishop': {
      const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
      for (const [dr, dc] of directions) {
        for (let i = 1; i < 8; i++) {
          const newRow = position.row + dr * i;
          const newCol = position.col + dc * i;
          if (!isValidPosition(newRow, newCol)) break;
          if (board[newRow][newCol]) {
            if (canCapture(newRow, newCol)) moves.push({ row: newRow, col: newCol });
            break;
          }
          moves.push({ row: newRow, col: newCol });
        }
      }
      break;
    }
    
    case 'queen': {
      const directions = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];
      for (const [dr, dc] of directions) {
        for (let i = 1; i < 8; i++) {
          const newRow = position.row + dr * i;
          const newCol = position.col + dc * i;
          if (!isValidPosition(newRow, newCol)) break;
          if (board[newRow][newCol]) {
            if (canCapture(newRow, newCol)) moves.push({ row: newRow, col: newCol });
            break;
          }
          moves.push({ row: newRow, col: newCol });
        }
      }
      break;
    }
    
    case 'king': {
      const directions = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];
      for (const [dr, dc] of directions) {
        const newRow = position.row + dr;
        const newCol = position.col + dc;
        if (canMoveTo(newRow, newCol)) {
          moves.push({ row: newRow, col: newCol });
        }
      }
      break;
    }
    
    case 'knight': {
      const knightMoves = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ];
      for (const [dr, dc] of knightMoves) {
        const newRow = position.row + dr;
        const newCol = position.col + dc;
        if (canMoveTo(newRow, newCol)) {
          moves.push({ row: newRow, col: newCol });
        }
      }
      break;
    }
  }
  
  return moves;
};

// Create move notation
export const createMoveNotation = (
  piece: ChessPiece,
  from: Position,
  to: Position,
  captured?: ChessPiece
): string => {
  const pieceSymbols: Record<PieceType, string> = {
    king: 'K',
    queen: 'Q',
    rook: 'R',
    bishop: 'B',
    knight: 'N',
    pawn: '',
  };
  
  const symbol = pieceSymbols[piece.type];
  const captureSymbol = captured ? 'x' : '';
  const destination = positionToNotation(to);
  
  if (piece.type === 'pawn' && captured) {
    return positionToNotation(from)[0] + 'x' + destination;
  }
  
  return symbol + captureSymbol + destination;
};

// Get training hint for a position
export const getTrainingHint = (piece: ChessPiece, from: Position, to: Position): string => {
  const hints: Record<PieceType, string[]> = {
    pawn: [
      "Les pions avancent tout droit mais capturent en diagonale.",
      "Contrôlez le centre avec vos pions en début de partie.",
      "Un pion passé peut devenir une menace redoutable.",
    ],
    knight: [
      "Les cavaliers excellent dans les positions fermées.",
      "Les cavaliers se déplacent en L et peuvent sauter par-dessus les pièces.",
      "Placez vos cavaliers au centre pour un contrôle maximal.",
    ],
    bishop: [
      "Les fous sont puissants sur les longues diagonales.",
      "La paire de fous peut être un avantage significatif.",
      "Les fous excellent dans les positions ouvertes.",
    ],
    rook: [
      "Les tours sont plus fortes sur les colonnes ouvertes.",
      "Connectez vos tours pour une puissance maximale.",
      "La 7ème rangée est idéale pour les tours.",
    ],
    queen: [
      "Ne sortez pas votre dame trop tôt.",
      "La dame est votre pièce la plus puissante.",
      "Utilisez la dame pour créer des menaces multiples.",
    ],
    king: [
      "Gardez votre roi en sécurité, surtout en milieu de partie.",
      "En finale, le roi devient une pièce active.",
      "Roquez tôt pour protéger votre roi.",
    ],
  };
  
  const pieceHints = hints[piece.type];
  return pieceHints[Math.floor(Math.random() * pieceHints.length)];
};
