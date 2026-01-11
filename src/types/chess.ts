export type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
export type PieceColor = 'white' | 'black';

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
}

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
  piece: ChessPiece;
  captured?: ChessPiece;
  notation: string;
}

export type GameStatus = 'playing' | 'check' | 'checkmate' | 'stalemate' | 'draw';

export interface GameState {
  board: (ChessPiece | null)[][];
  currentPlayer: PieceColor;
  selectedPosition: Position | null;
  legalMoves: Position[];
  moveHistory: Move[];
  gameStatus: GameStatus;
  isTrainingMode: boolean;
  kingInCheck: Position | null;
}

export interface FeedbackMessage {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  message: string;
  icon: string;
}
