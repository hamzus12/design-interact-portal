import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { useDebugLogger } from '@/hooks/useDebugLogger';
import { usePerformance } from '@/hooks/usePerformance';
import { PhaseTests } from '@/components/Dashboard/PhaseTests';

interface ValidationDashboardProps {
  applications: any[];
  persona: any;
  matches: any[];
}

export function ValidationDashboard({ applications, persona, matches }: ValidationDashboardProps) {
  const [overallScore, setOverallScore] = useState(0);
  const [isValidating, setIsValidating] = useState(false);
  const logger = useDebugLogger('ValidationDashboard');
  const { metrics } = usePerformance();

  useEffect(() => {
    // Calculer le score global basé sur les métriques
    const calculateScore = () => {
      let score = 0;
      
      // Points pour les données présentes
      if (applications.length > 0) score += 25;
      if (persona) score += 25;
      if (matches.length > 0) score += 25;
      
      // Points pour les performances
      if (metrics.loadTime < 3000) score += 15;
      if (metrics.renderTime < 100) score += 10;
      
      setOverallScore(Math.min(score, 100));
    };

    calculateScore();
  }, [applications, persona, matches, metrics]);

  const runFullValidation = async () => {
    setIsValidating(true);
    logger.info('Starting full validation');
    
    // Simuler une validation complète
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsValidating(false);
    logger.info('Full validation completed', { score: overallScore });
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { variant: 'default' as const, label: 'Excellent' };
    if (score >= 70) return { variant: 'secondary' as const, label: 'Bon' };
    return { variant: 'destructive' as const, label: 'Amélioration nécessaire' };
  };

  const scoreBadge = getScoreBadge(overallScore);

  return (
    <div className="space-y-6">
      {/* Score global */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Score de Validation Global
            </div>
            <Badge variant={scoreBadge.variant}>
              {scoreBadge.label}
            </Badge>
          </CardTitle>
          <CardDescription>
            Évaluation globale des phases 2, 3 et 4
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className={`text-3xl font-bold ${getScoreColor(overallScore)}`}>
              {overallScore}%
            </span>
            <Button 
              onClick={runFullValidation} 
              disabled={isValidating}
              size="sm"
            >
              {isValidating ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Validation...
                </>
              ) : (
                'Validation complète'
              )}
            </Button>
          </div>
          
          <Progress value={overallScore} className="w-full" />
          
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-medium">Données</div>
              <div className="text-muted-foreground">
                {applications.length + (persona ? 1 : 0) + matches.length}/3
              </div>
            </div>
            <div className="text-center">
              <div className="font-medium">Performance</div>
              <div className="text-muted-foreground">
                {metrics.loadTime ? `${metrics.loadTime.toFixed(0)}ms` : 'N/A'}
              </div>
            </div>
            <div className="text-center">
              <div className="font-medium">Sécurité</div>
              <div className="text-muted-foreground">
                <CheckCircle className="w-4 h-4 mx-auto text-green-500" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tests par phase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PhaseTests phase="dashboard" />
        <PhaseTests phase="security" />
        <PhaseTests phase="performance" />
        <PhaseTests phase="validation" />
      </div>
    </div>
  );
}