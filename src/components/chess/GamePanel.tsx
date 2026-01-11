import { GameState } from '@/types/chess';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RotateCcw, Undo2, GraduationCap, Crown, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GamePanelProps {
  gameState: GameState;
  onReset: () => void;
  onUndo: () => void;
  onToggleTraining: () => void;
}

export const GamePanel = ({
  gameState,
  onReset,
  onUndo,
  onToggleTraining,
}: GamePanelProps) => {
  const { currentPlayer, moveHistory, gameStatus, isTrainingMode } = gameState;
  
  const getStatusText = () => {
    switch (gameStatus) {
      case 'check':
        return 'Check!';
      case 'checkmate':
        return `Checkmate! ${currentPlayer === 'white' ? 'Black' : 'White'} wins!`;
      case 'stalemate':
        return 'Stalemate! Draw.';
      case 'draw':
        return 'Draw!';
      default:
        return `${currentPlayer === 'white' ? 'White' : 'Black'} to move`;
    }
  };
  
  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Current Player Card */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-serif flex items-center gap-2">
            <Crown className="w-5 h-5 text-accent" />
            Game Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-10 h-10 rounded-full border-2 flex items-center justify-center',
              currentPlayer === 'white' 
                ? 'bg-amber-50 border-stone-400' 
                : 'bg-stone-800 border-stone-600'
            )}>
              <Circle className={cn(
                'w-6 h-6',
                currentPlayer === 'white' ? 'text-stone-800' : 'text-amber-50'
              )} fill="currentColor" />
            </div>
            <div>
              <p className={cn(
                'font-medium',
                gameStatus === 'check' && 'text-destructive',
                gameStatus === 'checkmate' && 'text-accent'
              )}>
                {getStatusText()}
              </p>
              <p className="text-sm text-muted-foreground">
                Move {Math.floor(moveHistory.length / 2) + 1}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Training Mode Toggle */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-accent" />
              <Label htmlFor="training-mode" className="font-medium">
                Training Mode
              </Label>
            </div>
            <Switch
              id="training-mode"
              checked={isTrainingMode}
              onCheckedChange={onToggleTraining}
            />
          </div>
          {isTrainingMode && (
            <p className="text-sm text-muted-foreground mt-2">
              Hints and explanations are enabled.
            </p>
          )}
        </CardContent>
      </Card>
      
      {/* Move History */}
      <Card className="glass-card flex-1 min-h-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-serif">Move History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[200px] px-6 pb-6">
            {moveHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                No moves yet. Click a piece to start.
              </p>
            ) : (
              <div className="space-y-1">
                {Array.from({ length: Math.ceil(moveHistory.length / 2) }).map((_, i) => {
                  const whiteMove = moveHistory[i * 2];
                  const blackMove = moveHistory[i * 2 + 1];
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 py-1 px-2 rounded hover:bg-muted/50 transition-colors animate-slide-in"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <span className="text-sm text-muted-foreground w-6">
                        {i + 1}.
                      </span>
                      <span className="text-sm font-medium w-14">
                        {whiteMove?.notation}
                      </span>
                      <span className="text-sm font-medium">
                        {blackMove?.notation ?? '...'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
      
      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onUndo}
          disabled={moveHistory.length === 0}
        >
          <Undo2 className="w-4 h-4 mr-2" />
          Undo
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={onReset}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>
    </div>
  );
};
