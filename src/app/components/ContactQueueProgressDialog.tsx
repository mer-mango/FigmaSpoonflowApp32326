import { useState } from 'react';
import { X, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { PendingContact, snoozeCurrentContact, dismissCurrentContact } from '../utils/contactSuggestionQueue';

interface ContactQueueProgressDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentContact: PendingContact | null;
  remainingCount: number;
  onContinue: () => void;
  onSnooze: (minutes: number) => void;
  onDismiss: () => void;
}

/**
 * Dialog shown after completing a contact to ask if user wants to move to next
 */
export function ContactQueueProgressDialog({
  isOpen,
  onClose,
  currentContact,
  remainingCount,
  onContinue,
  onSnooze,
  onDismiss
}: ContactQueueProgressDialogProps) {
  const [showDismissConfirm, setShowDismissConfirm] = useState(false);
  const [showSnoozeOptions, setShowSnoozeOptions] = useState(false);

  const handleSnooze = (minutes: number) => {
    onSnooze(minutes);
    setShowSnoozeOptions(false);
    onClose();
  };

  const handleDismiss = () => {
    onDismiss();
    setShowDismissConfirm(false);
    onClose();
  };

  if (!currentContact) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#2f829b]" />
            Contact Added!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Success message */}
          <div className="text-sm text-[#666]">
            <span className="font-medium text-[#034863]">{currentContact.name}</span> has been added to your contacts.
          </div>

          {/* Remaining count */}
          {remainingCount > 0 && (
            <div className="bg-[#f5fafb] border border-[#ddecf0] rounded-lg p-3">
              <p className="text-sm font-medium text-[#034863]">
                {remainingCount} more contact{remainingCount !== 1 ? 's' : ''} to review
              </p>
              <p className="text-xs text-[#666] mt-1">
                Would you like to continue adding contacts now?
              </p>
            </div>
          )}

          {/* Action buttons */}
          {!showDismissConfirm && !showSnoozeOptions ? (
            <div className="space-y-2">
              {remainingCount > 0 && (
                <>
                  <Button
                    onClick={() => {
                      onContinue();
                      onClose();
                    }}
                    className="w-full bg-[#2f829b] hover:bg-[#034863]"
                  >
                    Continue to Next Contact
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowSnoozeOptions(true)}
                      variant="outline"
                      className="flex-1"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Remind Me Later
                    </Button>

                    <Button
                      onClick={() => setShowDismissConfirm(true)}
                      variant="outline"
                      className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Dismiss All
                    </Button>
                  </div>
                </>
              )}

              {remainingCount === 0 && (
                <Button
                  onClick={onClose}
                  className="w-full bg-[#2f829b] hover:bg-[#034863]"
                >
                  Done
                </Button>
              )}
            </div>
          ) : null}

          {/* Snooze options */}
          {showSnoozeOptions && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-[#034863] mb-2">
                Remind me in...
              </p>
              <Button
                onClick={() => handleSnooze(5)}
                variant="outline"
                className="w-full"
              >
                5 minutes
              </Button>
              <Button
                onClick={() => handleSnooze(10)}
                variant="outline"
                className="w-full"
              >
                10 minutes
              </Button>
              <Button
                onClick={() => handleSnooze(15)}
                variant="outline"
                className="w-full"
              >
                15 minutes
              </Button>
              <Button
                onClick={() => setShowSnoozeOptions(false)}
                variant="ghost"
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          )}

          {/* Dismiss confirmation */}
          {showDismissConfirm && (
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-sm text-[#666] bg-amber-50 border border-amber-200 rounded p-3">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-amber-900 mb-1">
                    Dismiss remaining contacts?
                  </p>
                  <p className="text-xs text-amber-700">
                    The {remainingCount} remaining contact{remainingCount !== 1 ? 's' : ''} won't be suggested again.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleDismiss}
                  variant="destructive"
                  className="flex-1"
                >
                  Yes, Dismiss All
                </Button>
                <Button
                  onClick={() => setShowDismissConfirm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}