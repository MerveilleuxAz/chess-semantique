import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';
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
      <DialogContent className={cn('sm:max-w-md', getBorderColor())}>
        <DialogHeader className="items-center text-center">
          <div className="mb-4">
            {getIcon()}
          </div>
          <DialogTitle className="font-serif text-2xl">
            {message.icon} {getTitle()}
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            {message.message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center pt-4">
          <Button onClick={onDismiss} className="min-w-32">
            Continuer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
