import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { getTemplate, FormTemplate } from '../utils/templateStorage';

interface TemplateBasedFormPreviewProps {
  templateId: string;
  onBack: () => void;
}

export function TemplateBasedFormPreview({ templateId, onBack }: TemplateBasedFormPreviewProps) {
  const [template, setTemplate] = useState<FormTemplate | null>(null);

  useEffect(() => {
    const loadedTemplate = getTemplate(templateId);
    if (loadedTemplate) {
      setTemplate(loadedTemplate);
    }
  }, [templateId]);

  if (!template) {
    return <div>Loading template...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5fafb] to-[#ddecf0]">
      {/* Header */}
      <div className="bg-white border-b-2 border-[#ddecf0] px-8 py-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-['Lora'] text-4xl text-[#034863] mb-1">{template.name}</h1>
            <p className="font-['Poppins'] text-lg text-[#2f829b]">{template.description}</p>
          </div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 border-2 border-[#034863] text-[#034863] hover:bg-[#f5fafb] rounded-lg font-['Poppins'] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg border-2 border-[#ddecf0] p-12">
          {/* Render all sections */}
          {template.sections
            .filter(section => section.visible !== false)
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((section) => (
              <div key={section.id} className="mb-12 last:mb-0">
                <h2 className="font-['Lora'] text-[30px] text-[#034863] mb-2">{section.title}</h2>
                {section.description && (
                  <p className="font-['Poppins'] text-[16px] text-[#2f829b] mb-6">{section.description}</p>
                )}

                {/* Render all fields */}
                <div className="space-y-6">
                  {section.fields
                    .filter(field => field.visible !== false)
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((field) => (
                      <div key={field.id}>
                        <label className="block font-['Poppins'] text-[#034863] mb-2 text-[20px]">
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {field.type === 'textarea' ? (
                          <textarea
                            placeholder={field.placeholder || field.defaultValue as string || ''}
                            rows={4}
                            className="w-full px-4 py-3 border-2 border-[#ddecf0] rounded-lg font-['Poppins'] text-[18px] text-[rgb(0,0,0)] focus:outline-none focus:ring-2 focus:ring-[#2f829b]/30 focus:border-[#2f829b]"
                            disabled
                          />
                        ) : field.type === 'select' ? (
                          <select
                            className="w-full px-4 py-3 border-2 border-[#ddecf0] rounded-lg font-['Poppins'] text-[18px] text-[rgb(0,0,0)] focus:outline-none focus:ring-2 focus:ring-[#2f829b]/30 focus:border-[#2f829b]"
                            disabled
                          >
                            <option value="">Select an option...</option>
                            {field.options?.map((option, idx) => (
                              <option key={idx} value={option}>{option}</option>
                            ))}
                          </select>
                        ) : field.type === 'checkbox' ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              defaultChecked={field.defaultValue as boolean}
                              className="w-5 h-5 rounded border-[#ddecf0] text-[#2f829b] focus:ring-[#2f829b]"
                              disabled
                            />
                            <span className="font-['Poppins'] text-[16px] text-[#034863]">
                              {field.helpText || 'Check this box'}
                            </span>
                          </div>
                        ) : (
                          <input
                            type={field.type}
                            placeholder={field.placeholder || field.defaultValue as string || ''}
                            className="w-full px-4 py-3 border-2 border-[#ddecf0] rounded-lg font-['Poppins'] text-[18px] text-[rgb(0,0,0)] focus:outline-none focus:ring-2 focus:ring-[#2f829b]/30 focus:border-[#2f829b]"
                            disabled
                          />
                        )}
                        {field.helpText && (
                          <p className="mt-1 text-sm text-[#034863]/60 font-['Poppins']">{field.helpText}</p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}

          {/* Preview notice */}
          <div className="mt-12 pt-8 border-t-2 border-[#ddecf0]">
            <p className="text-center font-['Poppins'] text-sm text-[#034863]/60">
              This is a preview of the template structure. Fields are disabled in preview mode.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
