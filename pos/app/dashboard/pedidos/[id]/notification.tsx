'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export interface NotificationProps {
  type: 'success' | 'error';
  message: string;
  duration?: number;
}

export function Notification({ type, message, duration = 4000 }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!isVisible) return null;

  const isSuccess = type === 'success';
  const bgColor = isSuccess ? 'bg-green-50' : 'bg-red-50';
  const borderColor = isSuccess ? 'border-green-200' : 'border-red-200';
  const textColor = isSuccess ? 'text-green-800' : 'text-red-800';
  const lightText = isSuccess ? 'text-green-700' : 'text-red-700';
  const Icon = isSuccess ? CheckCircle : AlertCircle;

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-start gap-3 px-4 py-3 rounded-lg border ${bgColor} ${borderColor} shadow-lg animate-in slide-in-from-right-full duration-300`}>
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isSuccess ? 'text-green-600' : 'text-red-600'}`} />
      <div className="flex-1">
        <p className={`text-sm font-medium ${isSuccess ? 'text-green-900' : 'text-red-900'}`}>
          {isSuccess ? '¡Éxito!' : 'Error'}
        </p>
        <p className={`text-sm ${lightText}`}>
          {message}
        </p>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className={`flex-shrink-0 p-1 rounded hover:bg-green-100 transition-colors ${isSuccess ? 'hover:bg-green-100' : 'hover:bg-red-100'}`}
      >
        <X className={`w-4 h-4 ${isSuccess ? 'text-green-600' : 'text-red-600'}`} />
      </button>
    </div>
  );
}

export function useNotification() {
  const [notification, setNotification] = useState<NotificationProps | null>(null);

  const showNotification = (type: 'success' | 'error', message: string, duration?: number) => {
    setNotification({ type, message, duration });
    setTimeout(() => setNotification(null), duration || 4000);
  };

  const showSuccess = (message: string, duration?: number) => {
    showNotification('success', message, duration);
  };

  const showError = (message: string, duration?: number) => {
    showNotification('error', message, duration);
  };

  return { notification, showSuccess, showError, showNotification };
}
