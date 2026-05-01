import React from 'react';
import { GeneralPreConsultData } from './editors/GeneralPreConsultForm';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DynamicFormRenderer } from './DynamicFormRenderer';

interface ClientFormRendererProps {
  formId: string;
  formTitle: string;
  contactData?: {
    name: string;
    email: string;
    company?: string;
  };
  onFieldChange: (fieldName: string, value: any) => void;
  formValues: Record<string, any>;
}

// Budget and referral options
const BUDGET_OPTIONS = [
  '$750-1,500',
  '$1,500-5,000',
  '$5,000+'
];

const HOW_DID_YOU_HEAR_OPTIONS = [
  'Website',
  'Google',
  'LinkedIn',
  'Referral',
  'Other'
];

export function ClientFormRenderer({ 
  formId, 
  formTitle, 
  contactData, 
  onFieldChange, 
  formValues 
}: ClientFormRendererProps) {
  
  // Use DynamicFormRenderer for all forms that have templates
  const TEMPLATE_ENABLED_FORMS = [
    'pre-consult-general',
    'pre-consult-audit',
    'pre-consult-workshop',
    'feedback-testimonial',
    'scope-of-work',
    'invoice',
    'services-brochure',
    'licensing',
    'payment-params',
    'workshop-curriculum',
    'innovation-audit',
    'scheduling'
  ];
  
  if (TEMPLATE_ENABLED_FORMS.includes(formId)) {
    return (
      <DynamicFormRenderer
        formId={formId}
        contactData={contactData}
        onFieldChange={onFieldChange}
        formValues={formValues}
      />
    );
  }
  
  // Fallback for forms without templates
  return (
    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
      <p className="text-slate-600">
        📝 Form template for "{formTitle}" will be rendered here.
      </p>
      <p className="text-sm text-slate-500 mt-2">
        Form ID: {formId}
      </p>
    </div>
  );
}