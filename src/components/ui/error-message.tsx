import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  variant?: 'default' | 'destructive';
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  onDismiss,
  variant = 'destructive'
}) => {
  return (
    <Alert variant={variant} className="relative">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="pr-8">
        <div className="font-medium mb-1">{title}</div>
        <div className="text-sm text-muted-foreground mb-3">{message}</div>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="mr-2"
          >
            Try Again
          </Button>
        )}
      </AlertDescription>
      {onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-auto p-1"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </Alert>
  );
};