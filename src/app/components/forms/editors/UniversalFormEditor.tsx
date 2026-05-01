import React, { useState, useEffect } from 'react';
import { ArrowLeft, Send, Save } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { TextLogo } from '../shared/TextLogo';
import { DocumentFooter } from '../shared/DocumentFooter';
import { DynamicFormRenderer } from '../DynamicFormRenderer';
import { getDefaultTemplate } from '../defaultTemplates';

interface UniversalFormEditorProps {
  formId: string;
  formTitle: string;
  onBack: () => void;
  onPreview: (data: any) => void;
  onSave?: () => void;
  backButtonLabel?: string;
  initialData?: any;
}

export function UniversalFormEditor({
  formId,
  formTitle,
  onBack,
  onPreview,
  onSave,
  backButtonLabel = 'Back to Dashboard',
  initialData = {}
}: UniversalFormEditorProps) {
  const [formValues, setFormValues] = useState<Record<string, any>>(initialData || {});
  const [template, setTemplate] = useState<any>(null);

  useEffect(() => {
    // Load template
    const templateKey = `form_template_${formId}`;
    const savedTemplate = localStorage.getItem(templateKey);
    
    if (savedTemplate) {
      setTemplate(JSON.parse(savedTemplate));
    } else {
      setTemplate(getDefaultTemplate(formId, formTitle));
    }
  }, [formId, formTitle]);

  useEffect(() => {
    // Update form values when initialData changes
    if (initialData) {
      setFormValues(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handlePreview = () => {
    onPreview(formValues);
  };

  const handleSave = () => {
    // Save to localStorage
    const storageKey = `form_data_${formId}`;
    localStorage.setItem(storageKey, JSON.stringify(formValues));
    
    if (onSave) {
      onSave();
    }
  };

  const getRequiredFieldCount = () => {
    if (!template || !template.sections) return { total: 0, completed: 0 };
    
    let total = 0;
    let completed = 0;
    
    template.sections.forEach((section: any) => {
      section.fields.forEach((field: any) => {
        if (field.required) {
          total++;
          const value = formValues[field.name];
          if (value && value.toString().trim() !== '') {
            completed++;
          }
        }
      });
    });
    
    return { total, completed };
  };

  const { total, completed } = getRequiredFieldCount();

  if (!template) {
    return (
      <div className="min-h-screen bg-[#ebeef4] flex items-center justify-center">
        <div className="text-[#034863] font-['Poppins']">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ebeef4]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={onBack}
              className="flex items-center gap-2 bg-white text-[#034863] border border-[#a89db0] hover:bg-[#ddecf0] rounded-full px-4 py-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {backButtonLabel}
            </Button>
            <h1 className="font-['Lora'] text-2xl text-[#034863]">{template.title}</h1>
          </div>
          <div className="flex items-center gap-3">
            {onSave && (
              <Button
                onClick={handleSave}
                className="flex items-center gap-2 bg-[#a89db0] text-white hover:bg-[#a89db0]/90 rounded-full px-4 py-2"
              >
                <Save className="w-4 h-4" />
                Save
              </Button>
            )}
            <Button
              onClick={handlePreview}
              className="flex items-center gap-2 bg-gradient-to-br from-[#2f829b] to-[#034863] text-white hover:shadow-lg rounded-full px-6 py-2"
            >
              <Send className="w-4 h-4" />
              Preview
            </Button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto py-8 px-6">
        <Card className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
          <TextLogo />
          
          {template.description && (
            <p className="mt-6 mb-8 text-slate-600 font-['Poppins'] leading-relaxed">
              {template.description}
            </p>
          )}

          {/* Progress Indicator */}
          {total > 0 && (
            <div className="mb-8 p-4 bg-[#f5fafb] rounded-lg border border-[#ddecf0]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-['Poppins'] text-[#034863]">
                  Required Fields: {completed}/{total} Complete
                </span>
                <span className="text-xs font-['Poppins'] text-slate-500">
                  {completed === total ? '✓ All required fields complete' : 'Please complete all required fields'}
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-[#2f829b] to-[#034863] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}

          {/* Dynamic Form Renderer */}
          <DynamicFormRenderer
            formId={formId}
            contactData={initialData}
            onFieldChange={handleFieldChange}
            formValues={formValues}
          />

          <DocumentFooter className="mt-12" />
        </Card>
      </div>
    </div>
  );
}
