import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Crown, BookOpen, GraduationCap, ChevronRight, Sparkles } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-conic-gradient(hsl(var(--foreground)) 0% 25%, transparent 0% 50%)`,
            backgroundSize: '60px 60px',
          }} />
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent mb-8 animate-fade-up">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Powered by Semantic Intelligence</span>
            </div>
            
            {/* Title */}
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 animate-fade-up" style={{ animationDelay: '100ms' }}>
              Smart Chess
              <span className="block text-accent mt-2">Learn & Play</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 animate-fade-up" style={{ animationDelay: '200ms' }}>
              Play chess with an intelligent assistant that explains the rules, 
              prevents illegal moves, and helps you become a better player.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: '300ms' }}>
              <Link to="/game">
                <Button size="lg" className="group text-lg px-8 py-6 bg-primary hover:bg-primary/90">
                  <Crown className="w-5 h-5 mr-2" />
                  Start Game
                  <ChevronRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              
              <Link to="/rules">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Learn the Rules
                </Button>
              </Link>
            </div>
            
            {/* Training Mode Link */}
            <Link 
              to="/game?training=true"
              className="inline-flex items-center gap-2 mt-8 text-muted-foreground hover:text-accent transition-colors animate-fade-up"
              style={{ animationDelay: '400ms' }}
            >
              <GraduationCap className="w-5 h-5" />
              <span>Or start in Training Mode</span>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Crown className="w-8 h-8" />,
              title: 'Play Intelligently',
              description: 'Every move is validated. Illegal moves are prevented with clear explanations.',
            },
            {
              icon: <BookOpen className="w-8 h-8" />,
              title: 'Learn the Rules',
              description: 'Comprehensive guides on piece movements, special rules, and winning strategies.',
            },
            {
              icon: <GraduationCap className="w-8 h-8" />,
              title: 'Training Mode',
              description: 'Get hints and suggestions to improve your game with contextual feedback.',
            },
          ].map((feature, index) => (
            <div
              key={feature.title}
              className="group p-8 rounded-2xl bg-card border border-border hover:border-accent/50 hover:shadow-lg transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="font-serif text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
      
      {/* Chess Board Preview */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">
            Beautiful, Intuitive Interface
          </h2>
          <p className="text-muted-foreground">
            A clean, modern design that focuses on what matters most – your game.
          </p>
        </div>
        
        {/* Mini Board Preview */}
        <div className="max-w-md mx-auto p-4 bg-primary rounded-xl shadow-board">
          <div className="grid grid-cols-8 aspect-square">
            {Array.from({ length: 64 }).map((_, i) => {
              const row = Math.floor(i / 8);
              const col = i % 8;
              const isLight = (row + col) % 2 === 0;
              return (
                <div
                  key={i}
                  className={isLight ? 'chess-square-light' : 'chess-square-dark'}
                />
              );
            })}
          </div>
        </div>
        
        <div className="text-center mt-8">
          <Link to="/game">
            <Button size="lg">
              Try it Now
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="font-serif text-lg">Smart Chess</p>
          <p className="text-sm mt-2">An intelligent chess learning experience</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
