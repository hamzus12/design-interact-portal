import { useCallback } from 'react';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  component: string;
  message: string;
  data?: any;
}

export function useDebugLogger(componentName: string) {
  const createLogEntry = useCallback((
    level: LogLevel, 
    message: string, 
    data?: any
  ): LogEntry => {
    return {
      timestamp: new Date().toISOString(),
      level,
      component: componentName,
      message,
      data
    };
  }, [componentName]);

  const log = useCallback((level: LogLevel, message: string, data?: any) => {
    const entry = createLogEntry(level, message, data);
    
    // Format console output with component context
    const prefix = `[${entry.timestamp}] [${componentName}] [${level.toUpperCase()}]`;
    
    switch (level) {
      case 'debug':
        console.debug(prefix, message, data);
        break;
      case 'info':
        console.info(prefix, message, data);
        break;
      case 'warn':
        console.warn(prefix, message, data);
        break;
      case 'error':
        console.error(prefix, message, data);
        break;
    }
    
    // Store in session storage for debugging
    try {
      const logs = JSON.parse(sessionStorage.getItem('debug_logs') || '[]');
      logs.push(entry);
      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      sessionStorage.setItem('debug_logs', JSON.stringify(logs));
    } catch (error) {
      console.warn('Failed to store debug log:', error);
    }
  }, [componentName, createLogEntry]);

  const debug = useCallback((message: string, data?: any) => {
    log('debug', message, data);
  }, [log]);

  const info = useCallback((message: string, data?: any) => {
    log('info', message, data);
  }, [log]);

  const warn = useCallback((message: string, data?: any) => {
    log('warn', message, data);
  }, [log]);

  const error = useCallback((message: string, data?: any) => {
    log('error', message, data);
  }, [log]);

  const getStoredLogs = useCallback((): LogEntry[] => {
    try {
      return JSON.parse(sessionStorage.getItem('debug_logs') || '[]');
    } catch {
      return [];
    }
  }, []);

  const clearLogs = useCallback(() => {
    sessionStorage.removeItem('debug_logs');
  }, []);

  return {
    debug,
    info,
    warn,
    error,
    getStoredLogs,
    clearLogs
  };
}
