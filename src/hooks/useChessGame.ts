import { useState, useCallback, useEffect } from 'react';
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
  getTrainingHint,
  executeMove,
  updateCastlingRights,
  getGameEndState,
  isKingInCheck,
  findKingPosition,
  detectSpecialMove
} from '@/lib/chess-utils';
import {
  getIllegalDestinationError,
  getWrongColorError,
  getNoLegalMovesError
} from '@/lib/move-explanations';
import { ChessEvent } from '@/lib/ontology-service';

// Fonction pour convertir une position en notation algébrique
const positionToNotation = (pos: Position): string => {
  const col = String.fromCharCode(97 + pos.col); // 0-7 -> a-h
  const row = (8 - pos.row).toString(); // 0-7 -> 8-1
  return col + row;
};

export const useChessGame = () => {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [feedback, setFeedback] = useState<FeedbackMessage[]>([]);
  const [modalFeedback, setModalFeedback] = useState<FeedbackMessage | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [promotionPending, setPromotionPending] = useState<Position | null>(null);
  const [lastChessEvent, setLastChessEvent] = useState<ChessEvent | null>(null);

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
      // Ne pas permettre de jouer si la partie est finie
      if (prev.gameStatus === 'checkmate' || prev.gameStatus === 'stalemate' || prev.gameStatus === 'draw') {
        return prev;
      }
      
      const piece = prev.board[position.row][position.col];
      
      // If a piece is already selected
      if (prev.selectedPosition) {
        const isLegalMove = prev.legalMoves.some(
          move => move.row === position.row && move.col === position.col
        );
        
        if (isLegalMove) {
          // Make the move
          const movingPiece = prev.board[prev.selectedPosition.row][prev.selectedPosition.col]!;
          
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
          
          // Exécuter le coup avec la nouvelle logique
          const { newBoard, capturedPiece, newEnPassantTarget, specialMove } = executeMove(
            prev.board,
            prev.selectedPosition,
            position,
            prev.enPassantTarget
          );
          
          // Mettre à jour les droits de roque
          const newCastlingRights = updateCastlingRights(prev.castlingRights, movingPiece, prev.selectedPosition);
          
          // Vérifier l'état de la partie pour le prochain joueur
          const nextPlayer = prev.currentPlayer === 'white' ? 'black' : 'white';
          const gameEndState = getGameEndState(newBoard, nextPlayer, newEnPassantTarget, newCastlingRights);
          
          // Trouver la position du roi si en échec
          let kingInCheckPos: Position | null = null;
          if (gameEndState === 'check' || gameEndState === 'checkmate') {
            kingInCheckPos = findKingPosition(newBoard, nextPlayer);
          }
          
          // Créer la notation
          const notation = createMoveNotation(
            movingPiece,
            prev.selectedPosition,
            position,
            capturedPiece,
            specialMove,
            gameEndState === 'check',
            gameEndState === 'checkmate'
          );
          
          const move: Move = {
            from: prev.selectedPosition,
            to: position,
            piece: movingPiece,
            captured: capturedPiece,
            notation,
            specialMove,
          };
          
          // Émettre l'événement ontologique
          const fromNotation = positionToNotation(prev.selectedPosition);
          const toNotation = positionToNotation(position);
          
          if (specialMove === 'castle_kingside' || specialMove === 'castle_queenside') {
            setLastChessEvent({
              type: 'castling',
              piece: 'king',
              pieceColor: movingPiece.color,
              from: fromNotation,
              to: toNotation,
              castlingSide: specialMove === 'castle_kingside' ? 'kingside' : 'queenside'
            });
          } else if (gameEndState === 'checkmate') {
            setLastChessEvent({
              type: 'checkmate',
              piece: movingPiece.type,
              pieceColor: movingPiece.color,
              from: fromNotation,
              to: toNotation,
              winner: movingPiece.color
            });
          } else if (gameEndState === 'check') {
            setLastChessEvent({
              type: 'check',
              piece: movingPiece.type,
              pieceColor: movingPiece.color,
              from: fromNotation,
              to: toNotation
            });
          } else if (gameEndState === 'stalemate') {
            setLastChessEvent({
              type: 'stalemate',
              piece: movingPiece.type,
              pieceColor: movingPiece.color,
              from: fromNotation,
              to: toNotation
            });
          } else if (capturedPiece) {
            setLastChessEvent({
              type: 'capture',
              piece: movingPiece.type,
              pieceColor: movingPiece.color,
              from: fromNotation,
              to: toNotation,
              capturedPiece: capturedPiece.type
            });
          } else {
            setLastChessEvent({
              type: 'move',
              piece: movingPiece.type,
              pieceColor: movingPiece.color,
              from: fromNotation,
              to: toNotation
            });
          }
          
          // Show training hint if in training mode
          if (prev.isTrainingMode) {
            const hint = getTrainingHint(movingPiece, prev.selectedPosition, position);
            addFeedback({
              type: 'info',
              message: hint,
              icon: 'ℹ️',
            });
          }
          
          // Feedbacks pour les événements spéciaux
          if (specialMove === 'castle_kingside') {
            addFeedback({
              type: 'success',
              message: 'Petit roque effectué !',
              icon: '🏰',
            });
          } else if (specialMove === 'castle_queenside') {
            addFeedback({
              type: 'success',
              message: 'Grand roque effectué !',
              icon: '🏰',
            });
          } else if (specialMove === 'en_passant') {
            addFeedback({
              type: 'success',
              message: 'Prise en passant !',
              icon: '⚔️',
            });
          } else if (capturedPiece) {
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
          
          // Feedback pour l'état de la partie
          if (gameEndState === 'checkmate') {
            const winnerFr = prev.currentPlayer === 'white' ? 'Blancs' : 'Noirs';
            addFeedback({
              type: 'success',
              message: `Échec et mat ! Les ${winnerFr} gagnent !`,
              icon: '🏆',
            }, true);
          } else if (gameEndState === 'stalemate') {
            addFeedback({
              type: 'info',
              message: 'Pat ! La partie est nulle.',
              icon: '🤝',
            }, true);
          } else if (gameEndState === 'check') {
            const checkedPlayer = nextPlayer === 'white' ? 'blanc' : 'noir';
            addFeedback({
              type: 'warning',
              message: `Échec au roi ${checkedPlayer} !`,
              icon: '⚠️',
            });
          }
          
          return {
            ...prev,
            board: newBoard,
            currentPlayer: nextPlayer,
            selectedPosition: null,
            legalMoves: [],
            moveHistory: [...prev.moveHistory, move],
            gameStatus: gameEndState === 'playing' ? 'playing' : gameEndState,
            kingInCheck: kingInCheckPos,
            enPassantTarget: newEnPassantTarget,
            castlingRights: newCastlingRights,
          };
        } else if (piece && piece.color === prev.currentPlayer) {
          // Select a different piece
          const legalMoves = calculateLegalMoves(
            prev.board, 
            position, 
            prev.currentPlayer,
            prev.enPassantTarget,
            prev.castlingRights
          );
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
        
        const legalMoves = calculateLegalMoves(
          prev.board, 
          position, 
          prev.currentPlayer,
          prev.enPassantTarget,
          prev.castlingRights
        );
        
        // Émettre l'événement ontologique pour la sélection de pièce
        setLastChessEvent({
          type: 'piece_select',
          piece: piece.type,
          pieceColor: piece.color,
          from: positionToNotation(position)
        });
        
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
    
    // Émettre l'événement ontologique pour la promotion
    setLastChessEvent({
      type: 'promotion',
      piece: 'pawn',
      pieceColor: gameState.currentPlayer,
      from: positionToNotation(gameState.selectedPosition),
      to: positionToNotation(promotionPending),
      promotionPiece: pieceType
    });
    
    setGameState(prev => {
      const movingPiece = prev.board[prev.selectedPosition!.row][prev.selectedPosition!.col]!;
      const capturedPiece = prev.board[promotionPending.row][promotionPending.col];
      
      // Exécuter le coup de promotion
      const { newBoard, newEnPassantTarget } = executeMove(
        prev.board,
        prev.selectedPosition!,
        promotionPending,
        prev.enPassantTarget,
        pieceType
      );
      
      // Mettre à jour les droits de roque
      const newCastlingRights = updateCastlingRights(prev.castlingRights, movingPiece, prev.selectedPosition!);
      
      // Vérifier l'état de la partie
      const nextPlayer = prev.currentPlayer === 'white' ? 'black' : 'white';
      const gameEndState = getGameEndState(newBoard, nextPlayer, newEnPassantTarget, newCastlingRights);
      
      let kingInCheckPos: Position | null = null;
      if (gameEndState === 'check' || gameEndState === 'checkmate') {
        kingInCheckPos = findKingPosition(newBoard, nextPlayer);
      }
      
      const notation = createMoveNotation(
        movingPiece,
        prev.selectedPosition!,
        promotionPending,
        capturedPiece,
        'promotion',
        gameEndState === 'check',
        gameEndState === 'checkmate'
      ) + '=' + pieceType[0].toUpperCase();
      
      const promotedPiece: ChessPiece = {
        type: pieceType,
        color: movingPiece.color,
        hasMoved: true,
      };
      
      const move: Move = {
        from: prev.selectedPosition!,
        to: promotionPending,
        piece: promotedPiece,
        captured: capturedPiece,
        notation,
        specialMove: 'promotion',
      };
      
      const pieceNamesFr: Record<string, string> = {
        queen: 'Dame', rook: 'Tour', bishop: 'Fou', knight: 'Cavalier',
      };
      addFeedback({
        type: 'success',
        message: `Pion promu en ${pieceNamesFr[pieceType]} !`,
        icon: '👑',
      });
      
      // Feedback pour l'état de la partie
      if (gameEndState === 'checkmate') {
        const winnerFr = prev.currentPlayer === 'white' ? 'Blancs' : 'Noirs';
        addFeedback({
          type: 'success',
          message: `Échec et mat ! Les ${winnerFr} gagnent !`,
          icon: '🏆',
        }, true);
      } else if (gameEndState === 'check') {
        const checkedPlayer = nextPlayer === 'white' ? 'blanc' : 'noir';
        addFeedback({
          type: 'warning',
          message: `Échec au roi ${checkedPlayer} !`,
          icon: '⚠️',
        });
      }
      
      return {
        ...prev,
        board: newBoard,
        currentPlayer: nextPlayer,
        selectedPosition: null,
        legalMoves: [],
        moveHistory: [...prev.moveHistory, move],
        gameStatus: gameEndState === 'playing' ? 'playing' : gameEndState,
        kingInCheck: kingInCheckPos,
        enPassantTarget: newEnPassantTarget,
        castlingRights: newCastlingRights,
      };
    });
    
    setPromotionPending(null);
  }, [promotionPending, gameState.selectedPosition, gameState.currentPlayer, addFeedback]);

  const resetGame = useCallback(() => {
    setGameState(createInitialGameState());
    setFeedback([]);
    setPromotionPending(null);
    setLastChessEvent({ type: 'game_start' });
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
    lastChessEvent,
  };
};
