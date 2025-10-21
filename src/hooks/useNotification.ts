import { useState, useCallback } from 'react';
import { NotificationType } from '../components/ui/Notification';

interface NotificationState {
  message: string;
  type: NotificationType;
  isVisible: boolean;
}

export const useNotification = () => {
  const [notification, setNotification] = useState<NotificationState>({
    message: '',
    type: 'info',
    isVisible: false
  });

  const showNotification = useCallback((message: string, type: NotificationType = 'info') => {
    setNotification({
      message,
      type,
      isVisible: true
    });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  }, []);

  const notifySuccess = useCallback((message: string) => {
    showNotification(message, 'success');
  }, [showNotification]);

  const notifyError = useCallback((message: string) => {
    showNotification(message, 'error');
  }, [showNotification]);

  const notifyWarning = useCallback((message: string) => {
    showNotification(message, 'warning');
  }, [showNotification]);

  const notifyInfo = useCallback((message: string) => {
    showNotification(message, 'info');
  }, [showNotification]);

  return {
    notification,
    showNotification,
    hideNotification,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo
  };
};