import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Crown, Play } from 'lucide-react';

const pieceRules = [
  {
    name: 'King',
    symbol: '♔',
    movement: 'Moves one square in any direction (horizontal, vertical, or diagonal).',
    special: 'Can perform castling with a rook if neither piece has moved.',
    tips: 'Keep your king safe! It\'s the most important piece.',
  },
  {
    name: 'Queen',
    symbol: '♕',
    movement: 'Moves any number of squares in any direction (horizontal, vertical, or diagonal).',
    special: 'No special moves, but extremely powerful due to combined rook and bishop movement.',
    tips: 'Don\'t bring your queen out too early – it can become a target.',
  },
  {
    name: 'Rook',
    symbol: '♖',
    movement: 'Moves any number of squares horizontally or vertically.',
    special: 'Can perform castling with the king. Connect your rooks for maximum power.',
    tips: 'Rooks are strongest on open files and the 7th rank.',
  },
  {
    name: 'Bishop',
    symbol: '♗',
    movement: 'Moves any number of squares diagonally.',
    special: 'Each bishop stays on its starting color. The bishop pair is valuable.',
    tips: 'Bishops thrive in open positions with long diagonals.',
  },
  {
    name: 'Knight',
    symbol: '♘',
    movement: 'Moves in an L-shape: two squares in one direction, then one square perpendicular.',
    special: 'The only piece that can jump over other pieces.',
    tips: 'Knights are excellent in closed positions and near the center.',
  },
  {
    name: 'Pawn',
    symbol: '♙',
    movement: 'Moves forward one square, or two squares from its starting position. Captures diagonally.',
    special: 'Can perform en passant. Promotes to any piece (usually queen) upon reaching the last rank.',
    tips: 'Pawns control the center and create the foundation of your position.',
  },
];

const specialRules = [
  {
    name: 'Castling',
    icon: '🏰',
    description: 'A special move involving the king and a rook. The king moves two squares towards a rook, and the rook moves to the square the king crossed.',
    conditions: [
      'Neither the king nor the rook has moved previously',
      'No pieces between the king and the rook',
      'The king is not in check',
      'The king does not pass through or land on a square attacked by an enemy piece',
    ],
  },
  {
    name: 'En Passant',
    icon: '⚡',
    description: 'A special pawn capture that can occur when an opponent moves a pawn two squares forward from its starting position and lands beside your pawn.',
    conditions: [
      'Must be executed immediately after the opponent\'s pawn moves',
      'Your pawn must be on its fifth rank',
      'The opponent\'s pawn must have just moved two squares',
      'Capture as if the pawn had only moved one square',
    ],
  },
  {
    name: 'Pawn Promotion',
    icon: '👑',
    description: 'When a pawn reaches the opposite end of the board, it must be promoted to another piece.',
    conditions: [
      'Can promote to queen, rook, bishop, or knight',
      'Most players choose queen (strongest piece)',
      'Promotion is mandatory – the pawn cannot remain a pawn',
      'You can have multiple queens through promotion',
    ],
  },
];

const endgameRules = [
  {
    name: 'Check',
    icon: '⚠️',
    description: 'The king is under attack. You must escape check on your next move by moving the king, blocking the attack, or capturing the attacking piece.',
  },
  {
    name: 'Checkmate',
    icon: '🏆',
    description: 'The king is in check and has no legal moves to escape. The game is over – the player who delivers checkmate wins.',
  },
  {
    name: 'Stalemate',
    icon: '🤝',
    description: 'The player to move has no legal moves and their king is NOT in check. The game is a draw.',
  },
];

const Rules = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          <Link to="/game">
            <Button>
              <Play className="w-4 h-4 mr-2" />
              Start Playing
            </Button>
          </Link>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-12">
        {/* Title */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="font-serif text-4xl sm:text-5xl font-bold mb-4">
            Chess Rules
          </h1>
          <p className="text-lg text-muted-foreground">
            Master the fundamentals of chess – from piece movements to special rules.
          </p>
        </div>
        
        {/* Rules Tabs */}
        <Tabs defaultValue="pieces" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="pieces">Piece Movements</TabsTrigger>
            <TabsTrigger value="special">Special Rules</TabsTrigger>
            <TabsTrigger value="endgame">Check & Checkmate</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pieces" className="animate-fade-up">
            <div className="grid gap-4">
              {pieceRules.map((piece) => (
                <Card key={piece.name} className="overflow-hidden">
                  <div className="flex">
                    <div className="w-24 sm:w-32 bg-primary flex items-center justify-center text-5xl sm:text-6xl">
                      <span className="text-primary-foreground">{piece.symbol}</span>
                    </div>
                    <div className="flex-1 p-6">
                      <CardTitle className="font-serif text-xl mb-3">{piece.name}</CardTitle>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Movement:</span> {piece.movement}</p>
                        <p><span className="font-medium">Special:</span> {piece.special}</p>
                        <p className="text-accent"><span className="font-medium">💡 Tip:</span> {piece.tips}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="special" className="animate-fade-up">
            <div className="grid gap-6">
              {specialRules.map((rule) => (
                <Card key={rule.name}>
                  <CardHeader>
                    <CardTitle className="font-serif text-xl flex items-center gap-3">
                      <span className="text-2xl">{rule.icon}</span>
                      {rule.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{rule.description}</p>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="font-medium mb-2">Conditions:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {rule.conditions.map((condition, i) => (
                          <li key={i}>{condition}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="endgame" className="animate-fade-up">
            <div className="grid gap-6">
              {endgameRules.map((rule) => (
                <Card key={rule.name}>
                  <CardHeader>
                    <CardTitle className="font-serif text-xl flex items-center gap-3">
                      <span className="text-2xl">{rule.icon}</span>
                      {rule.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{rule.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Additional Draw Conditions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="font-serif text-xl flex items-center gap-3">
                  <span className="text-2xl">📋</span>
                  Other Draw Conditions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-muted-foreground">
                  <li><span className="font-medium text-foreground">Threefold Repetition:</span> Same position occurs three times.</li>
                  <li><span className="font-medium text-foreground">Fifty-Move Rule:</span> 50 moves without a pawn move or capture.</li>
                  <li><span className="font-medium text-foreground">Insufficient Material:</span> Neither player can checkmate (e.g., King vs King).</li>
                  <li><span className="font-medium text-foreground">Mutual Agreement:</span> Both players agree to a draw.</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Start Playing CTA */}
        <div className="max-w-xl mx-auto text-center mt-16 p-8 rounded-2xl bg-accent/5 border border-accent/20">
          <Crown className="w-12 h-12 text-accent mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-bold mb-2">Ready to Play?</h2>
          <p className="text-muted-foreground mb-6">
            Put your knowledge into practice with our intelligent chess game.
          </p>
          <Link to="/game">
            <Button size="lg">
              Start Playing
              <Play className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Rules;
