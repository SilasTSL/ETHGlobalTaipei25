// notification.tsx
import { useState, useEffect } from "react";
import { X } from 'lucide-react';

export type NotificationType = "success" | "error";

interface NotificationProps {
  type: NotificationType;
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export function Notification({ 
  type, 
  message, 
  isVisible, 
  onClose, 
  duration = 5000 
}: NotificationProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, duration]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md w-full animate-in fade-in slide-in-from-top-5">
      <div className={`rounded-lg shadow-lg p-4 flex items-start space-x-3 ${
        type === "success" ? "bg-green-900 border border-green-700" : "bg-red-900 border border-red-700"
      }`}>
        <div className={`shrink-0 w-5 h-5 rounded-full ${
          type === "success" ? "bg-green-500" : "bg-red-500"
        } flex items-center justify-center`}>
          {type === "success" ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
        <div className="flex-1 text-white">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button 
          onClick={onClose}
          className="shrink-0 text-white/80 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}