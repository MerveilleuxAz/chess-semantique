import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChessBoard } from '@/components/chess/ChessBoard';
import { GamePanel } from '@/components/chess/GamePanel';
import { Notification } from '@/components/chess/Notification';
import { PromotionModal } from '@/components/chess/PromotionModal';
import { useChessGame } from '@/hooks/useChessGame';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen } from 'lucide-react';

const Game = () => {
  const [searchParams] = useSearchParams();
  const {
    gameState,
    feedback,
    promotionPending,
    selectSquare,
    promotePawn,
    resetGame,
    undoMove,
    toggleTrainingMode,
    removeFeedback,
  } = useChessGame();
  
  // Enable training mode if URL parameter is set
  useEffect(() => {
    if (searchParams.get('training') === 'true' && !gameState.isTrainingMode) {
      toggleTrainingMode();
    }
  }, [searchParams, gameState.isTrainingMode, toggleTrainingMode]);
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back to Home</span>
          </Link>
          
          <h1 className="font-serif text-xl font-bold">Smart Chess</h1>
          
          <Link to="/rules">
            <Button variant="ghost" size="sm">
              <BookOpen className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Rules</span>
            </Button>
          </Link>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6 lg:py-10">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 max-w-6xl mx-auto">
          {/* Chess Board */}
          <div className="flex-1 max-w-xl lg:max-w-2xl mx-auto lg:mx-0">
            <ChessBoard gameState={gameState} onSquareClick={selectSquare} />
          </div>
          
          {/* Game Panel */}
          <div className="w-full lg:w-80 xl:w-96">
            <GamePanel
              gameState={gameState}
              onReset={resetGame}
              onUndo={undoMove}
              onToggleTraining={toggleTrainingMode}
            />
          </div>
        </div>
      </main>
      
      {/* Notifications */}
      <Notification messages={feedback} onDismiss={removeFeedback} />
      
      {/* Promotion Modal */}
      <PromotionModal
        isOpen={promotionPending !== null}
        color={gameState.currentPlayer}
        onSelect={promotePawn}
      />
    </div>
  );
};

export default Game;
