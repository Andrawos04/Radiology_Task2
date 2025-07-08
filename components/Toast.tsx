
import React, { useEffect, useState } from 'react';
import type { ToastType } from '../types';
import Icon from './Icon';

interface ToastProps {
  toast: ToastType | null;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (toast) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        // Allow time for fade out animation before calling onClose
        setTimeout(onClose, 300);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) {
    return null;
  }

  const baseClasses = "fixed top-5 right-5 z-50 max-w-sm rounded-lg shadow-lg pointer-events-auto transition-all duration-300 ease-in-out";
  const visibilityClasses = visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5";
  
  const styles = {
    success: {
      bg: 'bg-green-50',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      icon: 'check-circle' as const,
      text: 'text-green-800',
    },
    error: {
      bg: 'bg-red-50',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      icon: 'x-circle' as const,
      text: 'text-red-800',
    },
  };
  
  const style = styles[toast.type];

  return (
    <div className={`${baseClasses} ${visibilityClasses} ${style.bg}`}>
      <div className="flex items-start p-4">
        <div className={`flex-shrink-0 p-2 rounded-full ${style.iconBg}`}>
          <Icon name={style.icon} className={`h-5 w-5 ${style.iconColor}`} />
        </div>
        <div className="ml-3 w-0 flex-1 pt-0.5">
          <p className={`text-sm font-medium ${style.text}`}>{toast.message}</p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button onClick={() => setVisible(false)} className="inline-flex text-gray-400 hover:text-gray-500">
            <span className="sr-only">Close</span>
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;
