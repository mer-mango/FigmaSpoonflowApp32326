import React, { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { FormTemplate, FormField } from './FormTemplateEditor';
import { getDefaultTemplate } from './defaultTemplates';

interface DynamicFormRendererProps {
  formId: string;
  contactData?: {
    name: string;
    email: string;
    company?: string;
  };
  onFieldChange: (fieldName: string, value: any) => void;
  formValues: Record<string, any>;
}

export function DynamicFormRenderer({ 
  formId, 
  contactData, 
  onFieldChange, 
  formValues 
}: DynamicFormRendererProps) {
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [loading, setLoading] = useState(true);

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
        // Use default template as fallback
        console.log(`Using default template for ${formId}`);
        setTemplate(getDefaultTemplate(formId));
      }
    } catch (error) {
      console.error('Error loading template:', error);
      setTemplate(getDefaultTemplate(formId));
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = formValues[field.name] || '';
    const prefillValue = getPrefillValue(field.name, contactData);
    const displayValue = value || prefillValue || '';

    switch (field.type) {
      case 'text':
        return (
          <Input
            value={displayValue}
            onChange={(e) => onFieldChange(field.name, e.target.value)}
            className="font-['Poppins']"
            placeholder={field.placeholder || ''}
          />
        );

      case 'email':
        return (
          <Input
            type="email"
            value={displayValue}
            onChange={(e) => onFieldChange(field.name, e.target.value)}
            className="font-['Poppins']"
            placeholder={field.placeholder || ''}
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={displayValue}
            onChange={(e) => onFieldChange(field.name, e.target.value)}
            className="font-['Poppins'] text-[16px] resize-none"
            rows={field.rows || 4}
            placeholder={field.placeholder || ''}
          />
        );

      case 'select':
        return (
          <Select
            value={displayValue}
            onValueChange={(val) => onFieldChange(field.name, val)}
          >
            <SelectTrigger className="w-full font-['Poppins']">
              <SelectValue placeholder={field.placeholder || 'Select an option'} />
            </SelectTrigger>
            <SelectContent>
              {(field.options || []).map((option) => (
                <SelectItem key={option} value={option} className="font-['Poppins']">
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'checkbox':
        return (
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={!!value}
                onChange={(e) => onFieldChange(field.name, e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm text-blue-800">
                {field.label}
              </span>
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  const getPrefillValue = (fieldName: string, contactData?: any) => {
    if (!contactData) return '';
    
    const mapping: Record<string, string> = {
      'contactName': contactData.name || '',
      'contactEmail': contactData.email || '',
      'organizationName': contactData.company || '',
      'organization': contactData.company || ''
    };
    
    return mapping[fieldName] || '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading form template...</div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
        <p className="text-slate-600">
          📝 Form template not configured yet. Please use the template editor to set up this form.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Description */}
      {template.description && (
        <div className="bg-[#f5fafb] p-6 rounded-xl border-2 border-[#ddecf0]">
          <p className="font-['Poppins'] text-[16px] text-[#034863] leading-relaxed">
            {template.description}
          </p>
        </div>
      )}

      {/* Sections */}
      {template.sections.map((section) => (
        <div key={section.id}>
          <h2 className="font-['Lora'] text-2xl text-[#034863] mb-6">{section.title}</h2>
          <div className="space-y-6">
            {section.fields.map((field) => (
              <div key={field.id}>
                {field.type !== 'checkbox' && (
                  <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2">
                    {field.label}
                  </label>
                )}
                {renderField(field)}
                
                {/* Conditional "Other" field for select dropdowns */}
                {field.type === 'select' && 
                 formValues[field.name] === 'Other' && 
                 field.name === 'howDidYouHear' && (
                  <div className="mt-4">
                    <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2">
                      Please specify
                    </label>
                    <Input
                      value={formValues['howDidYouHearOther'] || ''}
                      onChange={(e) => onFieldChange('howDidYouHearOther', e.target.value)}
                      className="font-['Poppins']"
                      placeholder="How did you hear about us?"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}