import { useState, useEffect } from 'react';
import { X, Check, Mail, Calendar, Briefcase, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { PendingContact, loadQueueState, startProcessingQueue, dismissAllContacts } from '../utils/contactSuggestionQueue';
import { toast } from 'sonner@2.0.3';

interface ContactSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartAdding: (selectedEmails: string[]) => void;
}

/**
 * Modal that shows all pending contact suggestions with multi-select
 * User can check/uncheck which contacts they want to add
 */
export function ContactSuggestionModal({ 
  isOpen, 
  onClose, 
  onStartAdding 
}: ContactSuggestionModalProps) {
  const [contacts, setContacts] = useState<PendingContact[]>([]);
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());

  useEffect(() => {
    console.log('🎯 ContactSuggestionModal isOpen changed:', isOpen);
    if (isOpen) {
      const state = loadQueueState();
      console.log('🎯 Loaded queue state:', state);
      setContacts(state.pending);
      // Pre-select all contacts by default
      setSelectedEmails(new Set(state.pending.map(c => c.email)));
    }
  }, [isOpen]);

  const toggleContact = (email: string) => {
    const newSelected = new Set(selectedEmails);
    if (newSelected.has(email)) {
      newSelected.delete(email);
    } else {
      newSelected.add(email);
    }
    setSelectedEmails(newSelected);
  };

  const handleStartAdding = () => {
    if (selectedEmails.size === 0) {
      return; // Don't proceed if nothing selected
    }
    
    // Filter contacts list to only include selected
    const selectedContacts = contacts.filter(c => selectedEmails.has(c.email));
    const unselectedContacts = contacts.filter(c => !selectedEmails.has(c.email));
    
    // Update the queue to only include selected contacts
    const state = loadQueueState();
    state.pending = selectedContacts;
    state.currentIndex = 0;
    state.processing = false;
    
    // Add unselected contacts to dismissed list so they don't reappear
    unselectedContacts.forEach(contact => {
      if (!state.dismissed.includes(contact.email)) {
        state.dismissed.push(contact.email);
        console.log(`Dismissed unselected contact: ${contact.email}`);
      }
    });
    
    // Save the updated queue
    localStorage.setItem('contact_suggestion_queue', JSON.stringify(state));
    
    // Start processing
    startProcessingQueue();
    
    onStartAdding(Array.from(selectedEmails));
  };

  const handleSelectAll = () => {
    setSelectedEmails(new Set(contacts.map(c => c.email)));
  };

  const handleDeselectAll = () => {
    setSelectedEmails(new Set());
  };

  const handleDismissAllForever = () => {
    const contactCount = contacts.length;
    
    // Dismiss all contacts permanently
    dismissAllContacts();
    
    // Show confirmation toast
    toast.success('All contact suggestions dismissed', {
      description: `${contactCount} ${contactCount === 1 ? 'contact' : 'contacts'} will no longer be suggested`,
    });
    
    // Close the modal
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#034863]">
            Add Calendar Contacts to SpoonFlow
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-2">
            These people are in your upcoming calendar events but not in your SpoonFlow contacts yet. 
            Select which ones you'd like to add.
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto mt-4 space-y-3">
          {contacts.map((contact) => (
            <div
              key={contact.email}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedEmails.has(contact.email)
                  ? 'border-[#2f829b] bg-[#f5fafb]'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleContact(contact.email)}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={selectedEmails.has(contact.email)}
                  onCheckedChange={() => toggleContact(contact.email)}
                  className="mt-1"
                />
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">
                        {contact.name || contact.email}
                      </div>
                      {contact.name && (
                        <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <Mail className="w-3 h-3" />
                          {contact.email}
                        </div>
                      )}
                    </div>
                    
                    {contact.meetingIds.length > 0 && (
                      <div className="text-xs bg-[#ddecf0] text-[#034863] px-2 py-1 rounded">
                        {contact.meetingIds.length} {contact.meetingIds.length === 1 ? 'meeting' : 'meetings'}
                      </div>
                    )}
                  </div>

                  {/* Additional info if available */}
                  <div className="mt-2 space-y-1">
                    {contact.company && (
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {contact.company}
                        {contact.role && ` • ${contact.role}`}
                      </div>
                    )}
                    {contact.location && (
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {contact.location}
                      </div>
                    )}
                    {contact.nextCallDate && (
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Next call: {new Date(contact.nextCallDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    )}
                  </div>

                  {/* Meeting titles preview */}
                  {contact.meetingTitles.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      Meetings: {contact.meetingTitles.slice(0, 2).join(', ')}
                      {contact.meetingTitles.length > 2 && ` +${contact.meetingTitles.length - 2} more`}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t mt-4">
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">
              {selectedEmails.size} of {contacts.length} selected
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSelectAll}
                className="text-xs text-[#2f829b] hover:text-[#034863] underline"
              >
                Select All
              </button>
              <span className="text-xs text-gray-300">|</span>
              <button
                onClick={handleDeselectAll}
                className="text-xs text-[#2f829b] hover:text-[#034863] underline"
              >
                Deselect All
              </button>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStartAdding}
              disabled={selectedEmails.size === 0}
              className="bg-[#2f829b] hover:bg-[#034863] text-white"
            >
              Add {selectedEmails.size} {selectedEmails.size === 1 ? 'Contact' : 'Contacts'}
            </Button>
            <Button
              onClick={handleDismissAllForever}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Dismiss All Forever
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}