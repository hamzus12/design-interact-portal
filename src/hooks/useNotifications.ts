
import { useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationOptions {
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function useNotifications() {
  const notify = useCallback((type: NotificationType, options: NotificationOptions) => {
    const baseConfig = {
      title: options.title,
      description: options.description,
      duration: options.duration || 5000,
    };

    switch (type) {
      case 'success':
        toast({
          ...baseConfig,
          className: "border-green-500 bg-green-50 text-green-900",
        });
        break;
      case 'error':
        toast({
          ...baseConfig,
          variant: "destructive",
        });
        break;
      case 'warning':
        toast({
          ...baseConfig,
          className: "border-yellow-500 bg-yellow-50 text-yellow-900",
        });
        break;
      case 'info':
        toast({
          ...baseConfig,
          className: "border-blue-500 bg-blue-50 text-blue-900",
        });
        break;
    }
  }, []);

  const success = useCallback((options: NotificationOptions) => notify('success', options), [notify]);
  const error = useCallback((options: NotificationOptions) => notify('error', options), [notify]);
  const warning = useCallback((options: NotificationOptions) => notify('warning', options), [notify]);
  const info = useCallback((options: NotificationOptions) => notify('info', options), [notify]);

  return { notify, success, error, warning, info };
}
