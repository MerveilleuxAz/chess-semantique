import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, AlertTriangle, Info, CheckCircle, BookOpen } from 'lucide-react';
import { FeedbackMessage } from '@/types/chess';
import { cn } from '@/lib/utils';

interface ErrorModalProps {
  message: FeedbackMessage | null;
  onDismiss: () => void;
}

export const ErrorModal = ({ message, onDismiss }: ErrorModalProps) => {
  if (!message) return null;

  const getIcon = () => {
    switch (message.type) {
      case 'error':
        return <AlertCircle className="w-12 h-12 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="w-12 h-12 text-amber-500" />;
      case 'success':
        return <CheckCircle className="w-12 h-12 text-accent" />;
      default:
        return <Info className="w-12 h-12 text-muted-foreground" />;
    }
  };

  const getTitle = () => {
    switch (message.type) {
      case 'error':
        return 'Mouvement Invalide';
      case 'warning':
        return 'Attention';
      case 'success':
        return 'Bravo !';
      default:
        return 'Information';
    }
  };

  const getBorderColor = () => {
    switch (message.type) {
      case 'error':
        return 'border-destructive/30';
      case 'warning':
        return 'border-amber-500/30';
      case 'success':
        return 'border-accent/30';
      default:
        return 'border-border';
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onDismiss()}>
      <DialogContent className={cn('sm:max-w-lg', getBorderColor())}>
        <DialogHeader className="items-center text-center">
          <div className="mb-4">
            {getIcon()}
          </div>
          <DialogTitle className="font-serif text-2xl">
            {message.icon} {message.message}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Main explanation */}
          {message.explanation && (
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-foreground leading-relaxed">
                {message.explanation}
              </p>
            </div>
          )}
          
          {/* OWL Rule reference */}
          {message.owlRule && (
            <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card">
              <BookOpen className="w-5 h-5 text-accent mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Règle OWL associée
                </p>
                <code className="text-sm font-mono text-accent">
                  {message.owlRule}
                </code>
                <p className="text-xs text-muted-foreground mt-1">
                  Ce coup viole les règles de déplacement définies dans l'ontologie.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-center pt-2">
          <Button onClick={onDismiss} className="min-w-32">
            Compris
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
