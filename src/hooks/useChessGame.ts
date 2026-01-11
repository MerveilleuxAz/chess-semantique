import { useState, useCallback } from 'react';
import { 
  GameState, 
  Position, 
  Move, 
  FeedbackMessage,
  ChessPiece,
  PieceType
} from '@/types/chess';
import { 
  createInitialGameState, 
  calculateLegalMoves, 
  createMoveNotation,
  getTrainingHint
} from '@/lib/chess-utils';
import {
  getIllegalDestinationError,
  getWrongColorError,
  getNoLegalMovesError
} from '@/lib/move-explanations';

export const useChessGame = () => {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [feedback, setFeedback] = useState<FeedbackMessage[]>([]);
  const [modalFeedback, setModalFeedback] = useState<FeedbackMessage | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [promotionPending, setPromotionPending] = useState<Position | null>(null);

  const addFeedback = useCallback((message: Omit<FeedbackMessage, 'id'>, showInModal = false) => {
    const id = Date.now().toString();
    const feedbackMessage = { ...message, id };
    
    if (showInModal || message.type === 'error' || message.type === 'warning') {
      setModalFeedback(feedbackMessage);
      setIsPaused(true);
    } else {
      setFeedback(prev => [...prev, feedbackMessage]);
      setTimeout(() => {
        setFeedback(prev => prev.filter(f => f.id !== id));
      }, 4000);
    }
  }, []);

  const removeFeedback = useCallback((id: string) => {
    setFeedback(prev => prev.filter(f => f.id !== id));
  }, []);

  const dismissModal = useCallback(() => {
    setModalFeedback(null);
    setIsPaused(false);
  }, []);

  const selectSquare = useCallback((position: Position) => {
    // Don't allow moves when game is paused
    if (isPaused) return;
    setGameState(prev => {
      const piece = prev.board[position.row][position.col];
      
      // If a piece is already selected
      if (prev.selectedPosition) {
        const isLegalMove = prev.legalMoves.some(
          move => move.row === position.row && move.col === position.col
        );
        
        if (isLegalMove) {
          // Make the move
          const movingPiece = prev.board[prev.selectedPosition.row][prev.selectedPosition.col]!;
          const capturedPiece = prev.board[position.row][position.col];
          
          // Check for pawn promotion
          if (movingPiece.type === 'pawn' && 
              (position.row === 0 || position.row === 7)) {
            setPromotionPending(position);
            // Store the move temporarily
            return {
              ...prev,
              selectedPosition: prev.selectedPosition,
              legalMoves: [],
            };
          }
          
          const newBoard = prev.board.map(row => [...row]);
          newBoard[position.row][position.col] = movingPiece;
          newBoard[prev.selectedPosition.row][prev.selectedPosition.col] = null;
          
          const notation = createMoveNotation(
            movingPiece,
            prev.selectedPosition,
            position,
            capturedPiece ?? undefined
          );
          
          const move: Move = {
            from: prev.selectedPosition,
            to: position,
            piece: movingPiece,
            captured: capturedPiece ?? undefined,
            notation,
          };
          
          // Show training hint if in training mode
          if (prev.isTrainingMode) {
            const hint = getTrainingHint(movingPiece, prev.selectedPosition, position);
            addFeedback({
              type: 'info',
              message: hint,
              icon: 'ℹ️',
            });
          }
          
          if (capturedPiece) {
            const pieceNamesFr: Record<string, string> = {
              king: 'Roi', queen: 'Dame', rook: 'Tour',
              bishop: 'Fou', knight: 'Cavalier', pawn: 'Pion',
            };
            const colorFr = capturedPiece.color === 'white' ? 'blanc' : 'noir';
            addFeedback({
              type: 'success',
              message: `${pieceNamesFr[capturedPiece.type]} ${colorFr} capturé !`,
              icon: '♟️',
            });
          }
          
          return {
            ...prev,
            board: newBoard,
            currentPlayer: prev.currentPlayer === 'white' ? 'black' : 'white',
            selectedPosition: null,
            legalMoves: [],
            moveHistory: [...prev.moveHistory, move],
          };
        } else if (piece && piece.color === prev.currentPlayer) {
          // Select a different piece
          const legalMoves = calculateLegalMoves(prev.board, position, prev.currentPlayer);
          return {
            ...prev,
            selectedPosition: position,
            legalMoves,
          };
        } else if (piece && piece.color !== prev.currentPlayer) {
          // Trying to move to enemy piece without legal move
          const selectedPiece = prev.board[prev.selectedPosition.row][prev.selectedPosition.col]!;
          const errorInfo = getIllegalDestinationError(selectedPiece, prev.selectedPosition, position, piece);
          addFeedback({
            type: 'error',
            message: errorInfo.message,
            explanation: errorInfo.explanation,
            owlRule: errorInfo.owlRule,
            icon: '❌',
          });
          return {
            ...prev,
            selectedPosition: null,
            legalMoves: [],
          };
        } else {
          // Clicked on empty non-legal square
          const selectedPiece = prev.board[prev.selectedPosition.row][prev.selectedPosition.col]!;
          const errorInfo = getIllegalDestinationError(selectedPiece, prev.selectedPosition, position, null);
          addFeedback({
            type: 'error',
            message: errorInfo.message,
            explanation: errorInfo.explanation,
            owlRule: errorInfo.owlRule,
            icon: '❌',
          });
          return {
            ...prev,
            selectedPosition: null,
            legalMoves: [],
          };
        }
      }
      
      // No piece selected yet
      if (piece) {
        if (piece.color !== prev.currentPlayer) {
          const errorInfo = getWrongColorError(prev.currentPlayer);
          addFeedback({
            type: 'warning',
            message: errorInfo.message,
            explanation: errorInfo.explanation,
            owlRule: errorInfo.owlRule,
            icon: '⚠️',
          });
          return prev;
        }
        
        const legalMoves = calculateLegalMoves(prev.board, position, prev.currentPlayer);
        
        if (legalMoves.length === 0) {
          const pieceNames: Record<PieceType, string> = {
            king: 'Le Roi',
            queen: 'La Dame',
            rook: 'La Tour',
            bishop: 'Le Fou',
            knight: 'Le Cavalier',
            pawn: 'Le Pion',
          };
          const errorInfo = getNoLegalMovesError(pieceNames[piece.type]);
          addFeedback({
            type: 'info',
            message: errorInfo.message,
            explanation: errorInfo.explanation,
            owlRule: errorInfo.owlRule,
            icon: 'ℹ️',
          });
        }
        
        return {
          ...prev,
          selectedPosition: position,
          legalMoves,
        };
      }
      
      return prev;
    });
  }, [isPaused, addFeedback]);

  const promotePawn = useCallback((pieceType: 'queen' | 'rook' | 'bishop' | 'knight') => {
    if (!promotionPending || !gameState.selectedPosition) return;
    
    setGameState(prev => {
      const movingPiece = prev.board[prev.selectedPosition!.row][prev.selectedPosition!.col]!;
      const capturedPiece = prev.board[promotionPending.row][promotionPending.col];
      
      const newBoard = prev.board.map(row => [...row]);
      const promotedPiece: ChessPiece = {
        type: pieceType,
        color: movingPiece.color,
      };
      newBoard[promotionPending.row][promotionPending.col] = promotedPiece;
      newBoard[prev.selectedPosition!.row][prev.selectedPosition!.col] = null;
      
      const notation = createMoveNotation(
        movingPiece,
        prev.selectedPosition!,
        promotionPending,
        capturedPiece ?? undefined
      ) + '=' + pieceType[0].toUpperCase();
      
      const move: Move = {
        from: prev.selectedPosition!,
        to: promotionPending,
        piece: promotedPiece,
        captured: capturedPiece ?? undefined,
        notation,
      };
      
      const pieceNamesFr: Record<string, string> = {
        queen: 'Dame', rook: 'Tour', bishop: 'Fou', knight: 'Cavalier',
      };
      addFeedback({
        type: 'success',
        message: `Pion promu en ${pieceNamesFr[pieceType]} !`,
        icon: '👑',
      });
      
      return {
        ...prev,
        board: newBoard,
        currentPlayer: prev.currentPlayer === 'white' ? 'black' : 'white',
        selectedPosition: null,
        legalMoves: [],
        moveHistory: [...prev.moveHistory, move],
      };
    });
    
    setPromotionPending(null);
  }, [promotionPending, gameState.selectedPosition, addFeedback]);

  const resetGame = useCallback(() => {
    setGameState(createInitialGameState());
    setFeedback([]);
    setPromotionPending(null);
    addFeedback({
      type: 'info',
      message: 'Nouvelle partie. Les Blancs commencent.',
      icon: 'ℹ️',
    });
  }, [addFeedback]);

  const undoMove = useCallback(() => {
    setGameState(prev => {
      if (prev.moveHistory.length === 0) {
        addFeedback({
          type: 'warning',
          message: 'Aucun coup à annuler.',
          icon: '⚠️',
        });
        return prev;
      }
      
      const lastMove = prev.moveHistory[prev.moveHistory.length - 1];
      const newBoard = prev.board.map(row => [...row]);
      
      // Restore the piece to its original position
      newBoard[lastMove.from.row][lastMove.from.col] = {
        type: lastMove.piece.type === 'queen' || lastMove.piece.type === 'rook' || 
              lastMove.piece.type === 'bishop' || lastMove.piece.type === 'knight'
          ? 'pawn' // Handle promotion undo (simplified)
          : lastMove.piece.type,
        color: lastMove.piece.color,
      };
      newBoard[lastMove.to.row][lastMove.to.col] = lastMove.captured ?? null;
      
      addFeedback({
        type: 'info',
        message: 'Coup annulé.',
        icon: '↩️',
      });
      
      return {
        ...prev,
        board: newBoard,
        currentPlayer: prev.currentPlayer === 'white' ? 'black' : 'white',
        selectedPosition: null,
        legalMoves: [],
        moveHistory: prev.moveHistory.slice(0, -1),
      };
    });
  }, [addFeedback]);

  const toggleTrainingMode = useCallback(() => {
    setGameState(prev => {
      const newMode = !prev.isTrainingMode;
      addFeedback({
        type: 'info',
        message: newMode 
          ? 'Mode entraînement activé. Vous verrez des conseils pour vos coups.' 
          : 'Mode entraînement désactivé.',
        icon: newMode ? '📚' : 'ℹ️',
      });
      return {
        ...prev,
        isTrainingMode: newMode,
      };
    });
  }, [addFeedback]);

  return {
    gameState,
    feedback,
    modalFeedback,
    isPaused,
    promotionPending,
    selectSquare,
    promotePawn,
    resetGame,
    undoMove,
    toggleTrainingMode,
    removeFeedback,
    dismissModal,
  };
};
