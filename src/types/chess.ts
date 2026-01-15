export type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
export type PieceColor = 'white' | 'black';

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
  hasMoved?: boolean;
}

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
  piece: ChessPiece;
  captured?: ChessPiece | null;
  notation: string;
  specialMove?: 'normal' | 'capture' | 'en_passant' | 'castle_kingside' | 'castle_queenside' | 'promotion';
}

export type GameStatus = 'playing' | 'check' | 'checkmate' | 'stalemate' | 'draw';

export interface CastlingRights {
  white: { kingSide: boolean; queenSide: boolean };
  black: { kingSide: boolean; queenSide: boolean };
}

export interface GameState {
  board: (ChessPiece | null)[][];
  currentPlayer: PieceColor;
  selectedPosition: Position | null;
  legalMoves: Position[];
  moveHistory: Move[];
  gameStatus: GameStatus;
  isTrainingMode: boolean;
  kingInCheck: Position | null;
  enPassantTarget: Position | null;
  castlingRights: CastlingRights;
}

export interface FeedbackMessage {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  message: string;
  icon: string;
  explanation?: string;
  owlRule?: string;
}
