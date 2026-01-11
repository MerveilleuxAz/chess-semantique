import { FeedbackMessage } from '@/types/chess';
import { X, AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface NotificationProps {
  messages: FeedbackMessage[];
  onDismiss: (id: string) => void;
}

export const Notification = ({ messages, onDismiss }: NotificationProps) => {
  const getIcon = (type: FeedbackMessage['type']) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };
  
  const getStyles = (type: FeedbackMessage['type']) => {
    switch (type) {
      case 'error':
        return 'bg-destructive/10 border-destructive/30 text-destructive';
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-700';
      case 'success':
        return 'bg-accent/10 border-accent/30 text-accent';
      default:
        return 'bg-muted border-border text-foreground';
    }
  };
  
  if (messages.length === 0) return null;
  
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm">
      {messages.map((message, index) => (
        <div
          key={message.id}
          className={cn(
            'flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm animate-slide-in',
            getStyles(message.type)
          )}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <span className="text-lg">{message.icon}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {getIcon(message.type)}
              <p className="text-sm font-medium">{message.message}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 hover:bg-transparent opacity-60 hover:opacity-100"
            onClick={() => onDismiss(message.id)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};
