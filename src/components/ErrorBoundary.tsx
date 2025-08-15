
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCcw, AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Erreur capturée par ErrorBoundary:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null
    });
    // Recharger la page en cas d'erreur persistante
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-4 flex flex-col items-center justify-center min-h-[200px] bg-gray-50">
          <Alert variant="destructive" className="mb-4 max-w-lg">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Une erreur s'est produite</AlertTitle>
            <AlertDescription>
              {this.state.error?.message || 'Une erreur inattendue s\'est produite. Veuillez réessayer.'}
            </AlertDescription>
          </Alert>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={this.handleReset} 
              className="flex items-center gap-2"
            >
              <RefreshCcw className="h-4 w-4" />
              Réessayer
            </Button>
            <Button 
              variant="default" 
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-2"
            >
              Retour à l'accueil
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
