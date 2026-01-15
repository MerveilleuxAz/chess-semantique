import { ChessPiece, Position, PieceColor, GameState, PieceType, CastlingRights } from '@/types/chess';

// ============================================================================
// CONFIGURATION INITIALE DU PLATEAU
// ============================================================================

export const createInitialBoard = (): (ChessPiece | null)[][] => {
  const board: (ChessPiece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Placer les pions
  for (let col = 0; col < 8; col++) {
    board[1][col] = { type: 'pawn', color: 'black', hasMoved: false };
    board[6][col] = { type: 'pawn', color: 'white', hasMoved: false };
  }
  
  // Placer les autres pièces
  const pieceOrder: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
  
  for (let col = 0; col < 8; col++) {
    board[0][col] = { type: pieceOrder[col], color: 'black', hasMoved: false };
    board[7][col] = { type: pieceOrder[col], color: 'white', hasMoved: false };
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
  enPassantTarget: null,
  castlingRights: {
    white: { kingSide: true, queenSide: true },
    black: { kingSide: true, queenSide: true },
  },
});

// ============================================================================
// NOTATION ALGÉBRIQUE
// ============================================================================

export const positionToNotation = (pos: Position): string => {
  const files = 'abcdefgh';
  const ranks = '87654321';
  return files[pos.col] + ranks[pos.row];
};

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

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

export const isValidPosition = (row: number, col: number): boolean => {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
};

export const copyBoard = (board: (ChessPiece | null)[][]): (ChessPiece | null)[][] => {
  return board.map(row => row.map(cell => cell ? { ...cell } : null));
};

// ============================================================================
// TROUVER LE ROI
// ============================================================================

export const findKingPosition = (board: (ChessPiece | null)[][], color: PieceColor): Position | null => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type === 'king' && piece.color === color) {
        return { row, col };
      }
    }
  }
  return null;
};

// ============================================================================
// VÉRIFIER SI UNE CASE EST ATTAQUÉE
// ============================================================================

export const isSquareAttacked = (
  board: (ChessPiece | null)[][],
  position: Position,
  byColor: PieceColor
): boolean => {
  // Attaques de pion
  const pawnDirection = byColor === 'white' ? 1 : -1;
  for (const dc of [-1, 1]) {
    const pawnRow = position.row + pawnDirection;
    const pawnCol = position.col + dc;
    if (isValidPosition(pawnRow, pawnCol)) {
      const piece = board[pawnRow][pawnCol];
      if (piece && piece.type === 'pawn' && piece.color === byColor) {
        return true;
      }
    }
  }
  
  // Attaques de cavalier
  const knightMoves = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ];
  for (const [dr, dc] of knightMoves) {
    const newRow = position.row + dr;
    const newCol = position.col + dc;
    if (isValidPosition(newRow, newCol)) {
      const piece = board[newRow][newCol];
      if (piece && piece.type === 'knight' && piece.color === byColor) {
        return true;
      }
    }
  }
  
  // Attaques de roi (pour éviter que les rois se touchent)
  const kingMoves = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1]
  ];
  for (const [dr, dc] of kingMoves) {
    const newRow = position.row + dr;
    const newCol = position.col + dc;
    if (isValidPosition(newRow, newCol)) {
      const piece = board[newRow][newCol];
      if (piece && piece.type === 'king' && piece.color === byColor) {
        return true;
      }
    }
  }
  
  // Attaques en ligne droite (tour, dame)
  const straightDirections = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  for (const [dr, dc] of straightDirections) {
    for (let i = 1; i < 8; i++) {
      const newRow = position.row + dr * i;
      const newCol = position.col + dc * i;
      if (!isValidPosition(newRow, newCol)) break;
      
      const piece = board[newRow][newCol];
      if (piece) {
        if (piece.color === byColor && (piece.type === 'rook' || piece.type === 'queen')) {
          return true;
        }
        break;
      }
    }
  }
  
  // Attaques en diagonale (fou, dame)
  const diagonalDirections = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
  for (const [dr, dc] of diagonalDirections) {
    for (let i = 1; i < 8; i++) {
      const newRow = position.row + dr * i;
      const newCol = position.col + dc * i;
      if (!isValidPosition(newRow, newCol)) break;
      
      const piece = board[newRow][newCol];
      if (piece) {
        if (piece.color === byColor && (piece.type === 'bishop' || piece.type === 'queen')) {
          return true;
        }
        break;
      }
    }
  }
  
  return false;
};

// ============================================================================
// VÉRIFIER SI LE ROI EST EN ÉCHEC
// ============================================================================

export const isKingInCheck = (board: (ChessPiece | null)[][], color: PieceColor): boolean => {
  const kingPos = findKingPosition(board, color);
  if (!kingPos) return false;
  
  const opponentColor = color === 'white' ? 'black' : 'white';
  return isSquareAttacked(board, kingPos, opponentColor);
};

// ============================================================================
// OBTENIR LES MOUVEMENTS BRUTS (sans vérification d'échec)
// ============================================================================

export const getRawMoves = (
  board: (ChessPiece | null)[][],
  position: Position,
  enPassantTarget?: Position | null
): Position[] => {
  const piece = board[position.row][position.col];
  if (!piece) return [];
  
  const moves: Position[] = [];
  
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
  
  const isEmpty = (row: number, col: number): boolean => {
    return isValidPosition(row, col) && board[row][col] === null;
  };
  
  switch (piece.type) {
    case 'pawn': {
      const direction = piece.color === 'white' ? -1 : 1;
      const startRow = piece.color === 'white' ? 6 : 1;
      
      // Avance d'une case
      if (isEmpty(position.row + direction, position.col)) {
        moves.push({ row: position.row + direction, col: position.col });
        
        // Avance de deux cases
        if (position.row === startRow && isEmpty(position.row + 2 * direction, position.col)) {
          moves.push({ row: position.row + 2 * direction, col: position.col });
        }
      }
      
      // Captures diagonales
      for (const dc of [-1, 1]) {
        const captureRow = position.row + direction;
        const captureCol = position.col + dc;
        if (canCapture(captureRow, captureCol)) {
          moves.push({ row: captureRow, col: captureCol });
        }
        
        // Prise en passant
        if (enPassantTarget && 
            captureRow === enPassantTarget.row && 
            captureCol === enPassantTarget.col) {
          moves.push({ row: captureRow, col: captureCol });
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

// ============================================================================
// SIMULER UN COUP ET VÉRIFIER L'ÉCHEC
// ============================================================================

export const wouldBeInCheck = (
  board: (ChessPiece | null)[][],
  from: Position,
  to: Position,
  color: PieceColor,
  enPassantTarget?: Position | null
): boolean => {
  const testBoard = copyBoard(board);
  const piece = testBoard[from.row][from.col];
  
  if (!piece) return true;
  
  // Effectuer le coup
  testBoard[to.row][to.col] = piece;
  testBoard[from.row][from.col] = null;
  
  // Prise en passant
  if (piece.type === 'pawn' && enPassantTarget &&
      to.row === enPassantTarget.row && to.col === enPassantTarget.col) {
    testBoard[from.row][to.col] = null;
  }
  
  return isKingInCheck(testBoard, color);
};

// ============================================================================
// VÉRIFIER LE ROQUE
// ============================================================================

export const canCastle = (
  board: (ChessPiece | null)[][],
  color: PieceColor,
  side: 'kingSide' | 'queenSide',
  castlingRights: CastlingRights
): boolean => {
  if (!castlingRights[color][side]) return false;
  
  const row = color === 'white' ? 7 : 0;
  const kingCol = 4;
  const rookCol = side === 'kingSide' ? 7 : 0;
  
  const king = board[row][kingCol];
  const rook = board[row][rookCol];
  
  // Vérifier présence du roi et de la tour
  if (!king || king.type !== 'king' || king.color !== color) return false;
  if (!rook || rook.type !== 'rook' || rook.color !== color) return false;
  
  // Vérifier qu'ils n'ont pas bougé
  if (king.hasMoved || rook.hasMoved) return false;
  
  // Vérifier que le roi n'est pas en échec
  const opponentColor = color === 'white' ? 'black' : 'white';
  if (isSquareAttacked(board, { row, col: kingCol }, opponentColor)) return false;
  
  // Cases entre le roi et la tour doivent être vides
  const startCol = Math.min(kingCol, rookCol) + 1;
  const endCol = Math.max(kingCol, rookCol);
  for (let col = startCol; col < endCol; col++) {
    if (board[row][col] !== null) return false;
  }
  
  // Cases traversées par le roi ne doivent pas être attaquées
  const kingPathCols = side === 'kingSide' ? [5, 6] : [2, 3];
  for (const col of kingPathCols) {
    if (isSquareAttacked(board, { row, col }, opponentColor)) return false;
  }
  
  return true;
};

// ============================================================================
// CALCULER LES COUPS LÉGAUX
// ============================================================================

export const calculateLegalMoves = (
  board: (ChessPiece | null)[][],
  position: Position,
  currentPlayer: PieceColor,
  enPassantTarget?: Position | null,
  castlingRights?: CastlingRights
): Position[] => {
  const piece = board[position.row][position.col];
  if (!piece || piece.color !== currentPlayer) return [];
  
  // Obtenir les mouvements bruts
  const rawMoves = getRawMoves(board, position, enPassantTarget);
  
  // Filtrer les coups qui laisseraient le roi en échec
  const legalMoves = rawMoves.filter(move => 
    !wouldBeInCheck(board, position, move, currentPlayer, enPassantTarget)
  );
  
  // Ajouter les roques
  if (piece.type === 'king' && castlingRights) {
    const row = currentPlayer === 'white' ? 7 : 0;
    
    if (canCastle(board, currentPlayer, 'kingSide', castlingRights)) {
      legalMoves.push({ row, col: 6 });
    }
    
    if (canCastle(board, currentPlayer, 'queenSide', castlingRights)) {
      legalMoves.push({ row, col: 2 });
    }
  }
  
  return legalMoves;
};

// ============================================================================
// VÉRIFIER SI UN JOUEUR A DES COUPS LÉGAUX
// ============================================================================

export const hasLegalMoves = (
  board: (ChessPiece | null)[][],
  color: PieceColor,
  enPassantTarget?: Position | null,
  castlingRights?: CastlingRights
): boolean => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const moves = calculateLegalMoves(board, { row, col }, color, enPassantTarget, castlingRights);
        if (moves.length > 0) return true;
      }
    }
  }
  return false;
};

// ============================================================================
// DÉTECTER L'ÉTAT DE LA PARTIE
// ============================================================================

export type GameEndState = 'playing' | 'check' | 'checkmate' | 'stalemate';

export const getGameEndState = (
  board: (ChessPiece | null)[][],
  currentPlayer: PieceColor,
  enPassantTarget?: Position | null,
  castlingRights?: CastlingRights
): GameEndState => {
  const inCheck = isKingInCheck(board, currentPlayer);
  const hasMovesLeft = hasLegalMoves(board, currentPlayer, enPassantTarget, castlingRights);
  
  if (!hasMovesLeft) {
    return inCheck ? 'checkmate' : 'stalemate';
  }
  
  return inCheck ? 'check' : 'playing';
};

// ============================================================================
// TYPE DE COUP SPÉCIAL
// ============================================================================

export type SpecialMoveType = 'normal' | 'capture' | 'en_passant' | 'castle_kingside' | 'castle_queenside' | 'promotion';

export const detectSpecialMove = (
  board: (ChessPiece | null)[][],
  from: Position,
  to: Position,
  enPassantTarget?: Position | null
): SpecialMoveType => {
  const piece = board[from.row][from.col];
  if (!piece) return 'normal';
  
  // Roque
  if (piece.type === 'king' && Math.abs(to.col - from.col) === 2) {
    return to.col > from.col ? 'castle_kingside' : 'castle_queenside';
  }
  
  // Promotion
  if (piece.type === 'pawn') {
    const promotionRow = piece.color === 'white' ? 0 : 7;
    if (to.row === promotionRow) {
      return 'promotion';
    }
    
    // Prise en passant
    if (enPassantTarget && to.row === enPassantTarget.row && to.col === enPassantTarget.col) {
      return 'en_passant';
    }
  }
  
  // Capture
  if (board[to.row][to.col] !== null) {
    return 'capture';
  }
  
  return 'normal';
};

// ============================================================================
// EXÉCUTER UN COUP
// ============================================================================

export const executeMove = (
  board: (ChessPiece | null)[][],
  from: Position,
  to: Position,
  enPassantTarget?: Position | null,
  promotionPiece?: PieceType
): {
  newBoard: (ChessPiece | null)[][];
  capturedPiece: ChessPiece | null;
  newEnPassantTarget: Position | null;
  specialMove: SpecialMoveType;
} => {
  const newBoard = copyBoard(board);
  const piece = newBoard[from.row][from.col];
  let capturedPiece: ChessPiece | null = newBoard[to.row][to.col];
  let newEnPassantTarget: Position | null = null;
  
  if (!piece) {
    return { newBoard, capturedPiece: null, newEnPassantTarget: null, specialMove: 'normal' };
  }
  
  const specialMove = detectSpecialMove(board, from, to, enPassantTarget);
  
  piece.hasMoved = true;
  
  switch (specialMove) {
    case 'castle_kingside': {
      newBoard[to.row][to.col] = piece;
      newBoard[from.row][from.col] = null;
      const rook = newBoard[to.row][7];
      if (rook) {
        rook.hasMoved = true;
        newBoard[to.row][5] = rook;
        newBoard[to.row][7] = null;
      }
      break;
    }
    
    case 'castle_queenside': {
      newBoard[to.row][to.col] = piece;
      newBoard[from.row][from.col] = null;
      const rook = newBoard[to.row][0];
      if (rook) {
        rook.hasMoved = true;
        newBoard[to.row][3] = rook;
        newBoard[to.row][0] = null;
      }
      break;
    }
    
    case 'en_passant': {
      capturedPiece = newBoard[from.row][to.col];
      newBoard[from.row][to.col] = null;
      newBoard[to.row][to.col] = piece;
      newBoard[from.row][from.col] = null;
      break;
    }
    
    case 'promotion': {
      const promotedPiece: ChessPiece = {
        type: promotionPiece || 'queen',
        color: piece.color,
        hasMoved: true,
      };
      newBoard[to.row][to.col] = promotedPiece;
      newBoard[from.row][from.col] = null;
      break;
    }
    
    default: {
      newBoard[to.row][to.col] = piece;
      newBoard[from.row][from.col] = null;
      
      // Prise en passant future
      if (piece.type === 'pawn' && Math.abs(to.row - from.row) === 2) {
        const enPassantRow = (from.row + to.row) / 2;
        newEnPassantTarget = { row: enPassantRow, col: to.col };
      }
      break;
    }
  }
  
  return { newBoard, capturedPiece, newEnPassantTarget, specialMove };
};

// ============================================================================
// METTRE À JOUR LES DROITS DE ROQUE
// ============================================================================

export const updateCastlingRights = (
  castlingRights: CastlingRights,
  piece: ChessPiece,
  from: Position
): CastlingRights => {
  const newRights = {
    white: { ...castlingRights.white },
    black: { ...castlingRights.black },
  };
  
  if (piece.type === 'king') {
    newRights[piece.color].kingSide = false;
    newRights[piece.color].queenSide = false;
  }
  
  if (piece.type === 'rook') {
    if (from.col === 0) {
      newRights[piece.color].queenSide = false;
    } else if (from.col === 7) {
      newRights[piece.color].kingSide = false;
    }
  }
  
  return newRights;
};

// ============================================================================
// MATÉRIEL INSUFFISANT
// ============================================================================

export const isInsufficientMaterial = (board: (ChessPiece | null)[][]): boolean => {
  const pieces: { type: PieceType; color: PieceColor }[] = [];
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        pieces.push({ type: piece.type, color: piece.color });
      }
    }
  }
  
  if (pieces.length === 2) return true;
  
  if (pieces.length === 3) {
    const nonKingPiece = pieces.find(p => p.type !== 'king');
    if (nonKingPiece && (nonKingPiece.type === 'knight' || nonKingPiece.type === 'bishop')) {
      return true;
    }
  }
  
  return false;
};

// ============================================================================
// NOTATION D'UN COUP
// ============================================================================

export const createMoveNotation = (
  piece: ChessPiece,
  from: Position,
  to: Position,
  captured?: ChessPiece | null,
  specialMove?: SpecialMoveType,
  isCheck?: boolean,
  isCheckmate?: boolean
): string => {
  if (specialMove === 'castle_kingside') return 'O-O' + (isCheckmate ? '#' : isCheck ? '+' : '');
  if (specialMove === 'castle_queenside') return 'O-O-O' + (isCheckmate ? '#' : isCheck ? '+' : '');
  
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
  const checkSymbol = isCheckmate ? '#' : isCheck ? '+' : '';
  
  if (piece.type === 'pawn' && captured) {
    return positionToNotation(from)[0] + 'x' + destination + checkSymbol;
  }
  
  return symbol + captureSymbol + destination + checkSymbol;
};

// ============================================================================
// CONSEILS D'ENTRAÎNEMENT
// ============================================================================

export const getTrainingHint = (piece: ChessPiece, _from: Position, _to: Position): string => {
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
