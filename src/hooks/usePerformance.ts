
import { useCallback, useEffect, useState } from 'react';

export function usePerformance() {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    interactionTime: 0
  });

  const startTimer = useCallback(() => {
    return performance.now();
  }, []);

  const endTimer = useCallback((startTime: number, operation: string) => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`Performance [${operation}]: ${duration.toFixed(2)}ms`);
    
    setMetrics(prev => ({
      ...prev,
      [operation]: duration
    }));

    return duration;
  }, []);

  const measureAsync = useCallback(async <T>(
    operation: string,
    asyncFn: () => Promise<T>
  ): Promise<T> => {
    const start = startTimer();
    try {
      const result = await asyncFn();
      endTimer(start, operation);
      return result;
    } catch (error) {
      endTimer(start, `${operation}_error`);
      throw error;
    }
  }, [startTimer, endTimer]);

  // Mesure automatique du temps de chargement de la page
  useEffect(() => {
    const measurePageLoad = () => {
      if (window.performance) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          const loadTime = navigation.loadEventEnd - navigation.navigationStart;
          setMetrics(prev => ({ ...prev, loadTime }));
        }
      }
    };

    if (document.readyState === 'complete') {
      measurePageLoad();
    } else {
      window.addEventListener('load', measurePageLoad);
      return () => window.removeEventListener('load', measurePageLoad);
    }
  }, []);

  return {
    metrics,
    startTimer,
    endTimer,
    measureAsync
  };
}
