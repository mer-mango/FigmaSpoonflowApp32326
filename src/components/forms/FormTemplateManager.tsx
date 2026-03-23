import React, { useState, useEffect } from 'react';
import { MoreVertical, Eye, Copy } from 'lucide-react';
import { FormTemplateEditor, FormTemplate } from './FormTemplateEditor';
import { getDefaultTemplate } from './defaultTemplates';

interface FormTemplateManagerProps {
  formId: string;
  formTitle: string;
  onTemplateUpdate?: () => void;
}

export function FormTemplateManager({ formId, formTitle, onTemplateUpdate }: FormTemplateManagerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  // Load template from localStorage
  useEffect(() => {
    loadTemplate();
  }, [formId]);

  const loadTemplate = () => {
    setLoading(true);
    try {
      const templateKey = `form_template_${formId}`;
      const savedTemplate = localStorage.getItem(templateKey);
      
      if (savedTemplate) {
        setTemplate(JSON.parse(savedTemplate) as FormTemplate);
      } else {
        // Initialize with default template
        setTemplate(getDefaultTemplate(formId, formTitle));
      }
    } catch (error) {
      console.error('Error loading template:', error);
      setTemplate(getDefaultTemplate(formId, formTitle));
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = (newTemplate: FormTemplate) => {
    try {
      const templateKey = `form_template_${formId}`;
      localStorage.setItem(templateKey, JSON.stringify(newTemplate));
      setTemplate(newTemplate);
      
      if (onTemplateUpdate) {
        onTemplateUpdate();
      }
      
      console.log('✅ Template saved successfully');
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  if (loading) {
    return (
      <button
        className="p-2 rounded-lg bg-gray-100 text-gray-400"
        disabled
      >
        <MoreVertical className="w-4 h-4" />
      </button>
    );
  }

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsEditing(true);
        }}
        className="p-2 rounded-lg bg-[#2f829b]/10 text-[#2f829b] hover:bg-[#2f829b]/20 transition-colors"
        title="Customize Template"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isEditing && template && (
        <FormTemplateEditor
          formId={formId}
          onClose={() => setIsEditing(false)}
          onSave={saveTemplate}
          initialTemplate={template}
        />
      )}
    </>
  );
}