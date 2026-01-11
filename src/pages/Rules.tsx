import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Crown, Play } from 'lucide-react';

const pieceRules = [
  {
    name: 'Roi',
    symbol: '♔',
    movement: 'Se déplace d\'une case dans n\'importe quelle direction (horizontale, verticale ou diagonale).',
    special: 'Peut effectuer le roque avec une tour si aucune des deux pièces n\'a bougé.',
    tips: 'Gardez votre roi en sécurité ! C\'est la pièce la plus importante.',
  },
  {
    name: 'Dame',
    symbol: '♕',
    movement: 'Se déplace d\'autant de cases que souhaité dans n\'importe quelle direction.',
    special: 'Pas de coup spécial, mais extrêmement puissante grâce à la combinaison des mouvements tour + fou.',
    tips: 'Ne sortez pas votre dame trop tôt – elle peut devenir une cible.',
  },
  {
    name: 'Tour',
    symbol: '♖',
    movement: 'Se déplace d\'autant de cases que souhaité horizontalement ou verticalement.',
    special: 'Peut effectuer le roque avec le roi. Connectez vos tours pour une puissance maximale.',
    tips: 'Les tours sont plus fortes sur les colonnes ouvertes et la 7ème rangée.',
  },
  {
    name: 'Fou',
    symbol: '♗',
    movement: 'Se déplace d\'autant de cases que souhaité en diagonale.',
    special: 'Chaque fou reste sur sa couleur de départ. La paire de fous est précieuse.',
    tips: 'Les fous excellent dans les positions ouvertes avec de longues diagonales.',
  },
  {
    name: 'Cavalier',
    symbol: '♘',
    movement: 'Se déplace en forme de "L" : deux cases dans une direction, puis une case perpendiculaire.',
    special: 'La seule pièce qui peut sauter par-dessus les autres.',
    tips: 'Les cavaliers sont excellents dans les positions fermées et près du centre.',
  },
  {
    name: 'Pion',
    symbol: '♙',
    movement: 'Avance d\'une case, ou deux cases depuis sa position initiale. Capture en diagonale.',
    special: 'Peut effectuer la prise en passant. Se promeut en n\'importe quelle pièce (généralement dame) en atteignant la dernière rangée.',
    tips: 'Les pions contrôlent le centre et créent la base de votre position.',
  },
];

const specialRules = [
  {
    name: 'Roque',
    icon: '🏰',
    description: 'Un coup spécial impliquant le roi et une tour. Le roi se déplace de deux cases vers une tour, et la tour passe de l\'autre côté du roi.',
    conditions: [
      'Ni le roi ni la tour n\'ont bougé auparavant',
      'Aucune pièce entre le roi et la tour',
      'Le roi n\'est pas en échec',
      'Le roi ne passe pas par ou n\'arrive sur une case attaquée',
    ],
  },
  {
    name: 'Prise en Passant',
    icon: '⚡',
    description: 'Une capture spéciale de pion qui peut se produire quand un pion adverse avance de deux cases depuis sa position de départ et arrive à côté de votre pion.',
    conditions: [
      'Doit être exécutée immédiatement après le coup du pion adverse',
      'Votre pion doit être sur sa 5ème rangée',
      'Le pion adverse vient d\'avancer de deux cases',
      'Capturez comme si le pion n\'avait avancé que d\'une case',
    ],
  },
  {
    name: 'Promotion du Pion',
    icon: '👑',
    description: 'Quand un pion atteint le bout opposé de l\'échiquier, il doit être promu en une autre pièce.',
    conditions: [
      'Peut être promu en dame, tour, fou ou cavalier',
      'La plupart des joueurs choisissent la dame (pièce la plus forte)',
      'La promotion est obligatoire – le pion ne peut pas rester pion',
      'Vous pouvez avoir plusieurs dames grâce à la promotion',
    ],
  },
];

const endgameRules = [
  {
    name: 'Échec',
    icon: '⚠️',
    description: 'Le roi est attaqué. Vous devez parer l\'échec au coup suivant en déplaçant le roi, bloquant l\'attaque ou capturant la pièce attaquante.',
  },
  {
    name: 'Échec et Mat',
    icon: '🏆',
    description: 'Le roi est en échec et n\'a aucun coup légal pour s\'échapper. La partie est terminée – le joueur qui donne le mat gagne.',
  },
  {
    name: 'Pat',
    icon: '🤝',
    description: 'Le joueur au trait n\'a aucun coup légal et son roi N\'EST PAS en échec. La partie est nulle.',
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
            <span>Retour à l'accueil</span>
          </Link>
          <Link to="/game">
            <Button>
              <Play className="w-4 h-4 mr-2" />
              Commencer à Jouer
            </Button>
          </Link>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-12">
        {/* Title */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="font-serif text-4xl sm:text-5xl font-bold mb-4">
            Règles des Échecs
          </h1>
          <p className="text-lg text-muted-foreground">
            Maîtrisez les fondamentaux des échecs – des déplacements des pièces aux règles spéciales.
          </p>
        </div>
        
        {/* Rules Tabs */}
        <Tabs defaultValue="pieces" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="pieces">Déplacements</TabsTrigger>
            <TabsTrigger value="special">Règles Spéciales</TabsTrigger>
            <TabsTrigger value="endgame">Échec & Mat</TabsTrigger>
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
                        <p><span className="font-medium">Déplacement :</span> {piece.movement}</p>
                        <p><span className="font-medium">Spécial :</span> {piece.special}</p>
                        <p className="text-accent"><span className="font-medium">💡 Conseil :</span> {piece.tips}</p>
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
                      <p className="font-medium mb-2">Conditions :</p>
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
                  Autres Conditions de Nulle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-muted-foreground">
                  <li><span className="font-medium text-foreground">Triple Répétition :</span> La même position se produit trois fois.</li>
                  <li><span className="font-medium text-foreground">Règle des 50 Coups :</span> 50 coups sans mouvement de pion ni capture.</li>
                  <li><span className="font-medium text-foreground">Matériel Insuffisant :</span> Aucun joueur ne peut mater (ex : Roi contre Roi).</li>
                  <li><span className="font-medium text-foreground">Accord Mutuel :</span> Les deux joueurs acceptent la nulle.</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Start Playing CTA */}
        <div className="max-w-xl mx-auto text-center mt-16 p-8 rounded-2xl bg-accent/5 border border-accent/20">
          <Crown className="w-12 h-12 text-accent mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-bold mb-2">Prêt à Jouer ?</h2>
          <p className="text-muted-foreground mb-6">
            Mettez vos connaissances en pratique avec notre jeu d'échecs intelligent.
          </p>
          <Link to="/game">
            <Button size="lg">
              Commencer à Jouer
              <Play className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Rules;
