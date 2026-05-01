/**
 * First Draft Popup
 * Appears when user first creates a content item to guide them
 */

import React from 'react';
import { Sparkles, X } from 'lucide-react';
import { Button } from '../ui/button';

interface FirstDraftPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onStartDraft?: () => void;
  onAskJamie?: () => void;
}

export function FirstDraftPopup({
  isOpen,
  onClose,
  onStartDraft,
  onAskJamie
}: FirstDraftPopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-[#2A9D8F]" />
            <h2 className="text-xl font-bold">Ready to Draft?</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Let's turn your idea into content. You can start writing yourself or
          ask Jamie for help getting started.
        </p>

        <div className="space-y-3">
          <Button
            onClick={() => {
              onStartDraft?.();
              onClose();
            }}
            className="w-full"
          >
            Start Writing
          </Button>
          
          <Button
            onClick={() => {
              onAskJamie?.();
              onClose();
            }}
            variant="outline"
            className="w-full"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Ask Jamie for Help
          </Button>
          
          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full"
          >
            Maybe Later
          </Button>
        </div>
      </div>
    </div>
  );
}
