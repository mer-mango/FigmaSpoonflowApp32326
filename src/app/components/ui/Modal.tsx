import React, { useEffect } from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: 'default' | 'fullscreen';
  onSizeToggle?: () => void;
}

export function Modal({ 
  isOpen, 
  onClose, 
  children, 
  title,
  size = 'default',
  onSizeToggle,
}: ModalProps) {
  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = size === 'fullscreen' 
    ? 'w-screen h-screen rounded-none' 
    : 'w-[85vw] h-[90vh] rounded-[2.5rem]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-gentle"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`
        relative bg-white/90 backdrop-blur-2xl 
        shadow-soft border border-white/50
        ${sizeClasses}
        transition-gentle
        flex flex-col
        overflow-hidden
      `}>
        {/* Header */}
        <div className="flex items-center justify-between px-12 py-8 border-b border-slate-200/50">
          <h2 className="text-3xl font-serif font-semibold text-slate-800">
            {title}
          </h2>
          
          <div className="flex items-center gap-2">
            {/* Maximize/Minimize toggle */}
            {onSizeToggle && (
              <button
                onClick={onSizeToggle}
                className="p-2 hover:bg-slate-100/50 rounded-xl transition-gentle text-slate-500 hover:text-slate-700"
                title={size === 'fullscreen' ? 'Minimize' : 'Maximize'}
              >
                {size === 'fullscreen' ? (
                  <Minimize2 className="w-5 h-5" />
                ) : (
                  <Maximize2 className="w-5 h-5" />
                )}
              </button>
            )}
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100/50 rounded-xl transition-gentle text-slate-500 hover:text-slate-700"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto px-12 py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
