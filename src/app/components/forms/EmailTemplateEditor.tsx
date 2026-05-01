import React, { useState, useEffect } from 'react';
import { X, Save, Mail, Info } from 'lucide-react';

interface EmailTemplateEditorProps {
  flowId: string;
  flowName: string;
  initialTemplate?: string;
  onSave: (template: string) => void;
  onClose: () => void;
}

export function EmailTemplateEditor({ flowId, flowName, initialTemplate, onSave, onClose }: EmailTemplateEditorProps) {
  const defaultTemplate = `Hi {{contactName}},

I hope this email finds you well! I'm excited to move forward with our collaboration.

I've prepared a personalized flow for you that includes all the necessary forms and information we discussed. You can access it using the secure link below:

{{flowUrl}}

This flow will guide you through:
- Completing the required forms
- Providing necessary information
- Reviewing our engagement details

The process should take about 15-20 minutes to complete. If you have any questions or need assistance, please don't hesitate to reach out.

Looking forward to working together!

Best regards,
[Your Name]
Empower Health Strategies`;

  const [template, setTemplate] = useState(initialTemplate || defaultTemplate);
  const [previewMode, setPreviewMode] = useState(false);

  // Sample data for preview
  const previewData = {
    contactName: 'Sarah Johnson',
    flowUrl: 'https://yourapp.com/?flowInstance=example-123',
    flowName: flowName,
  };

  const renderPreview = () => {
    return template
      .replace(/\{\{contactName\}\}/g, previewData.contactName)
      .replace(/\{\{flowUrl\}\}/g, previewData.flowUrl)
      .replace(/\{\{flowName\}\}/g, previewData.flowName);
  };

  const handleSave = () => {
    onSave(template);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-200 flex items-center justify-between bg-gradient-to-br from-[#f5fafb] to-white">
          <div>
            <h2 className="font-serif text-3xl text-slate-800">Edit Email Template</h2>
            <p className="text-slate-600 mt-1">{flowName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-2xl transition-colors"
          >
            <X className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        {/* Toggle Preview/Edit Mode */}
        <div className="px-8 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setPreviewMode(false)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                !previewMode
                  ? 'bg-gradient-to-br from-[#a8998f] to-[#b8a7a0] text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              Edit Template
            </button>
            <button
              onClick={() => setPreviewMode(true)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                previewMode
                  ? 'bg-gradient-to-br from-[#a8998f] to-[#b8a7a0] text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              Preview
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8">
          {!previewMode ? (
            <div className="space-y-6">
              {/* Available Variables */}
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
                <div className="flex items-start gap-2 mb-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800 mb-2">Available Variables</h4>
                    <div className="space-y-1 text-sm text-blue-700">
                      <div><code className="bg-blue-100 px-2 py-0.5 rounded">{'{{contactName}}'}</code> - Client's name</div>
                      <div><code className="bg-blue-100 px-2 py-0.5 rounded">{'{{flowUrl}}'}</code> - Unique flow URL</div>
                      <div><code className="bg-blue-100 px-2 py-0.5 rounded">{'{{flowName}}'}</code> - Name of the flow</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Template Editor */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Email Template
                </label>
                <textarea
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  className="w-full h-[400px] p-4 rounded-2xl border-2 border-slate-300 focus:border-[#a89db0] focus:outline-none focus:ring-2 focus:ring-[#a89db0]/20 resize-none font-['Poppins'] text-slate-700"
                  placeholder="Type your email template here..."
                />
                <p className="text-xs text-slate-500 mt-2">
                  Use the variables above to personalize the email. They will be automatically replaced when sending.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Preview Header */}
              <div className="p-4 bg-[#f5fafb] rounded-2xl border border-[#ddecf0]">
                <h4 className="font-medium text-[#034863] mb-3">Email Preview</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <span className="text-slate-600 font-medium">To:</span>
                    <span className="text-slate-800">{previewData.contactName} (example)</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-slate-600 font-medium">Subject:</span>
                    <span className="text-slate-800">Your {flowName} - Next Steps</span>
                  </div>
                </div>
              </div>

              {/* Preview Content */}
              <div className="p-6 bg-white rounded-2xl border-2 border-slate-200 min-h-[400px]">
                <pre className="whitespace-pre-wrap font-['Poppins'] text-slate-700 leading-relaxed">
                  {renderPreview()}
                </pre>
              </div>

              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> This preview uses sample data. Actual emails will include the real contact name and flow URL.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl font-medium bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-2xl font-medium bg-gradient-to-br from-[#a8998f] to-[#b8a7a0] text-white hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Template
          </button>
        </div>
      </div>
    </div>
  );
}