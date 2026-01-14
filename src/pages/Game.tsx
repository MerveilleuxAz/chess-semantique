import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChessBoard } from '@/components/chess/ChessBoard';
import { GamePanel } from '@/components/chess/GamePanel';
import { OntologyPanel } from '@/components/chess/OntologyPanel';
import { Notification } from '@/components/chess/Notification';
import { PromotionModal } from '@/components/chess/PromotionModal';
import { ErrorModal } from '@/components/chess/ErrorModal';
import { useChessGame } from '@/hooks/useChessGame';
import { useOntology } from '@/hooks/useOntology';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Database } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChessEvent } from '@/lib/ontology-service';

const Game = () => {
  const [searchParams] = useSearchParams();
  const {
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
  } = useChessGame();

  // Hook pour l'ontologie
  const {
    isLoaded: ontologyLoaded,
    isLoading: ontologyLoading,
    error: ontologyError,
    currentQuery,
    queryHistory,
    stats: ontologyStats,
    queryForEvent,
    clearHistory
  } = useOntology();

  // Enable training mode if URL parameter is set
  useEffect(() => {
    if (searchParams.get('training') === 'true' && !gameState.isTrainingMode) {
      toggleTrainingMode();
    }
  }, [searchParams, gameState.isTrainingMode, toggleTrainingMode]);

  // Déclencher une requête ontologique au démarrage
  useEffect(() => {
    if (ontologyLoaded && gameState.moveHistory.length === 0) {
      queryForEvent({ type: 'game_start' });
    }
  }, [ontologyLoaded, gameState.moveHistory.length, queryForEvent]);

  // Exécuter des requêtes ontologiques lors d'événements d'échecs
  useEffect(() => {
    if (ontologyLoaded && lastChessEvent) {
      queryForEvent(lastChessEvent);
    }
  }, [ontologyLoaded, lastChessEvent, queryForEvent]);

  return (
    // <div className="min-h-screen bg-background">
    <div className="h-screen flex flex-col bg-background">

      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Retour à l'accueil</span>
          </Link>

          <h1 className="font-serif text-xl font-bold">Échecs Intelligents</h1>

          <Link to="/rules">
            <Button variant="ghost" size="sm">
              <BookOpen className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Règles</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* <main className={cn(
        "container mx-auto px-4 py-6 lg:py-10 transition-opacity duration-300",
        isPaused && "opacity-50 pointer-events-none"
      )}> */}
      <main
        className={cn(
          "flex-1 px-4 py-4 lg:py-6 transition-opacity duration-300 overflow-hidden",
          isPaused && "opacity-50 pointer-events-none"
        )}
      >

        {/* <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 max-w-[1600px] mx-auto"> */}
        <div className="h-full flex flex-col xl:flex-row gap-6">
          {/* Left Column: Game Panel */}
          {/* <div className="w-full xl:w-80 order-2 xl:order-1"> */}
          <div className="w-full xl:w-72 order-2 xl:order-1 shrink-0">
            <GamePanel
              gameState={gameState}
              onReset={resetGame}
              onUndo={undoMove}
              onToggleTraining={toggleTrainingMode}
            />
          </div>

          {/* Center: Chess Board */}
          {/* <div className="flex-shrink-0 max-w-xl lg:max-w-2xl mx-auto xl:mx-0 order-1 xl:order-2">
            <ChessBoard gameState={gameState} onSquareClick={selectSquare} />
          </div> */}
          <div className="flex-1 flex items-center justify-center order-1 xl:order-2">
            <div className="w-full max-w-3xl aspect-square">
              <ChessBoard
                gameState={gameState}
                onSquareClick={selectSquare}
              />
            </div>
          </div>


          {/* Right Column: Ontology Panel */}
          <div className="w-full xl:w-96 xl:flex-1 order-3 min-h-[500px] xl:max-w-md">
            <OntologyPanel
              isLoaded={ontologyLoaded}
              isLoading={ontologyLoading}
              error={ontologyError}
              currentQuery={currentQuery}
              queryHistory={queryHistory}
              stats={ontologyStats}
              onClearHistory={clearHistory}
            />
          </div>
        </div>
      </main>

      {/* Toast Notifications (info/success only) */}
      <Notification messages={feedback} onDismiss={removeFeedback} />

      {/* Error/Warning Modal */}
      <ErrorModal message={modalFeedback} onDismiss={dismissModal} />

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
