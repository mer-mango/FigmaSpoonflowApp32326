// Drafts Viewer - Shows all saved partial forms
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { ArrowLeft, Clock, Trash2, FileText, User } from 'lucide-react';
import { getAllDrafts, deleteDraft, formatLastModified, FormDraft } from '../../utils/draftsManager';

interface DraftsViewerProps {
  onBack: () => void;
  onResumeDraft: (draft: FormDraft) => void;
}

export function DraftsViewer({ onBack, onResumeDraft }: DraftsViewerProps) {
  const [drafts, setDrafts] = useState<FormDraft[]>([]);

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = () => {
    const allDrafts = getAllDrafts();
    // Sort by most recent first
    allDrafts.sort((a, b) => b.lastModified - a.lastModified);
    setDrafts(allDrafts);
  };

  const handleDelete = (draftId: string) => {
    if (confirm('Are you sure you want to delete this draft? This cannot be undone.')) {
      deleteDraft(draftId);
      loadDrafts();
    }
  };

  return (
    <div className="min-h-screen bg-[#f5fafb] py-8 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={onBack}
            variant="outline"
            className="mb-4 border-[#034863] text-[#034863] hover:bg-[#f5fafb]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Forms
          </Button>
          <h1 className="font-['Lora'] text-4xl text-[#034863] mb-2">Saved Drafts</h1>
          <p className="font-['Poppins'] text-[#034863]/70">
            Resume working on partially completed forms
          </p>
        </div>

        {/* Drafts List */}
        {drafts.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border-2 border-[#ddecf0]">
            <FileText className="w-16 h-16 mx-auto mb-4 text-[#034863]/30" />
            <h3 className="font-['Lora'] text-xl text-[#034863] mb-2">No saved drafts</h3>
            <p className="font-['Poppins'] text-sm text-[#034863]/70">
              When you save a form for later, it will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="bg-white rounded-xl p-6 border-2 border-[#ddecf0] hover:border-[#2f829b] transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-['Lora'] text-xl text-[#034863]">
                        {draft.formTitle}
                      </h3>
                      <span className="px-3 py-1 bg-[#2f829b]/10 text-[#2f829b] rounded-full text-xs uppercase tracking-wide font-['Poppins']">
                        Draft
                      </span>
                    </div>

                    <div className="space-y-2">
                      {draft.clientName && (
                        <div className="flex items-center gap-2 text-sm text-[#034863]/70">
                          <User className="w-4 h-4" />
                          <span className="font-['Poppins']">{draft.clientName}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-[#034863]/70">
                        <Clock className="w-4 h-4" />
                        <span className="font-['Poppins']">
                          Last edited {formatLastModified(draft.lastModified)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      onClick={() => onResumeDraft(draft)}
                      className="bg-[#2f829b] hover:bg-[#034863] text-white"
                    >
                      Resume
                    </Button>
                    <Button
                      onClick={() => handleDelete(draft.id)}
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
