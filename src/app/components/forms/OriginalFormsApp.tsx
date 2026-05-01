// Wrapper for Original Forms system - template development environment
// Independent from Flow Wizard integration

import React, { useState } from 'react';
import { TemplateEditor } from './TemplateEditor';
import { InvoiceForm } from './editors/InvoiceForm';
import { PaymentParamsForm } from './editors/PaymentParamsForm';
import { LicensingForm } from './editors/LicensingForm';
import { ScopeOfWorkForm } from './editors/ScopeOfWorkForm';
import { ScopeOfWorkMultipleOptionsForm } from './editors/ScopeOfWorkMultipleOptionsForm';
import { PreConsultGeneralForm } from './editors/PreConsultGeneralForm';
import { AuditPreConsultForm } from './editors/AuditPreConsultForm';
import { TrainingPreConsultForm } from './editors/TrainingPreConsultForm';
import { SchedulingForm } from './editors/SchedulingForm';
import { InnovationAuditForm } from './editors/InnovationAuditForm';
import { PXAuditIntakeForm } from './editors/PXAuditIntakeForm';
import { WorkshopCurriculumForm } from './editors/WorkshopCurriculumForm';
import { ServicesBrochureEditor } from './editors/ServicesBrochureEditor';
import { FeedbackTestimonialForm } from './editors/FeedbackTestimonialForm';
import { InvoiceDocument } from './documents/InvoiceDocument';
import { PaymentParamsDocument } from './documents/PaymentParamsDocument';
import { LicensingDocument } from './documents/LicensingDocument';
import { ScopeOfWorkDocument } from './documents/ScopeOfWorkDocument';
import { ScopeOfWorkMultipleOptionsDocument } from './documents/ScopeOfWorkMultipleOptionsDocument';
import { PreConsultGeneralDocument } from './documents/PreConsultGeneralDocument';
import { GeneralPreConsultPreview } from './documents/GeneralPreConsultPreview';
import { AuditPreConsultPreview } from './documents/AuditPreConsultPreview';
import { TrainingPreConsultPreview } from './documents/TrainingPreConsultPreview';
import { SchedulingDocument } from './documents/SchedulingDocument';
import { InnovationAuditDocument } from './documents/InnovationAuditDocument';
import { PXAuditIntakeDocument } from './documents/PXAuditIntakeDocument';
import { WorkshopCurriculumDocument } from './documents/WorkshopCurriculumDocument';
import { ServicesBrochureDocument } from './documents/ServicesBrochureDocument';
import { FeedbackTestimonialDocument } from './documents/FeedbackTestimonialDocument';
import { ArrowLeft, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { ServiceFormLinker } from '../../utils/serviceFormLinker';
import type { Service } from '../../App';
import { DraftsViewer } from './DraftsViewer';
import { saveDraft, getDraft, FormDraft } from '../../utils/draftsManager';

interface OriginalFormsAppProps {
  onQuickAddSelect?: (type: 'task' | 'contact' | 'content' | 'voice') => void;
  onJamieAction?: (type: 'plan-day' | 'wind-down' | 'post-meeting' | 'chat') => void;
  services?: Service[];
  contacts?: any[]; // Contact array from App
  onServiceUpdate?: (service: Service) => void;
}

interface DuplicatedForm {
  id: string;
  templateId: string;
  title: string;
  linkedServiceId: string | null;
}

export function OriginalFormsApp({ onQuickAddSelect, onJamieAction, services = [], contacts = [], onServiceUpdate }: OriginalFormsAppProps) {
  const [view, setView] = useState<'dashboard' | 'edit-template' | 'edit-form' | 'preview-document' | 'preview-template' | 'drafts'>('dashboard');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [templateEditorKey, setTemplateEditorKey] = useState(0); // Force re-mount on template navigation
  
  // Draft Management
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [initialFormData, setInitialFormData] = useState<any>(null);
  
  // Duplicated forms management
  const [duplicatedForms, setDuplicatedForms] = useState<DuplicatedForm[]>(() => {
    try {
      const saved = localStorage.getItem('original_forms_duplicates');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  // Service linking state for duplicate modal
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [pendingDuplicateForm, setPendingDuplicateForm] = useState<any>(null);
  const [duplicateFormTitle, setDuplicateFormTitle] = useState('');
  const [selectedServiceForLink, setSelectedServiceForLink] = useState<string>('');
  
  // Track for duplicated forms
  const [selectedDuplicateId, setSelectedDuplicateId] = useState<string | null>(null);

  const handleSelectForm = (formId: string) => {
    console.log('Form selected - creating new instance:', formId);
    
    // Check if this is a duplicated form
    if (formId.startsWith('duplicate-')) {
      const duplicateForm = duplicatedForms.find(f => f.id === formId);
      if (duplicateForm) {
        console.log('📋 Opening duplicated form with template:', duplicateForm.templateId);
        setSelectedFormId(duplicateForm.templateId);
        setSelectedDuplicateId(formId);
        setInitialFormData(null);
        setCurrentDraftId(null);
        setView('edit-form');
      }
      return;
    }
    
    // For all forms, open a new instance (never edit template from dashboard)
    setSelectedFormId(formId);
    setSelectedDuplicateId(null);
    setInitialFormData(null); // Start fresh
    setCurrentDraftId(null);
    setView('edit-form');
  };
  
  const handleEditTemplate = (templateId: string) => {
    // This goes to the Template Editor, not form editing
    console.log('Edit template:', templateId);
    setSelectedTemplateId(templateId);
    setTemplateEditorKey(prev => prev + 1); // Force re-mount
    setView('edit-template');
  };
  
  const handleViewDrafts = () => {
    setView('drafts');
  };
  
  const handleResumeDraft = (draft: FormDraft) => {
    console.log('Resuming draft:', draft);
    setSelectedFormId(draft.formId);
    setSelectedDuplicateId(null);
    setInitialFormData(draft.data);
    setCurrentDraftId(draft.id);
    setView('edit-form');
  };
  
  const handleSaveAndFinishLater = (formId: string, formData: any) => {
    console.log('Saving draft for:', formId);
    
    // Extract client name if available
    const clientName = formData.contactName || formData.organizationName || formData.clientName || '';
    
    const draft = saveDraft({
      id: currentDraftId || undefined,
      formId: formId,
      formTitle: getFormTitle(formId),
      data: formData,
      clientName: clientName,
      contactId: formData.contactId,
    });
    
    setCurrentDraftId(draft.id);
    alert('Draft saved! You can resume this form later from the Drafts section.');
    setView('dashboard');
  };
  
  const handleDuplicateForm = (formId: string) => {
    console.log('🔍 Duplicate form:', formId);
    
    // Find the original form to get its title and templateId
    // We'll need to pass this information from the dashboard
    const originalTitle = getFormTitle(formId);
    
    setPendingDuplicateForm(formId);
    setDuplicateFormTitle(`${originalTitle} (Copy)`);
    setShowDuplicateModal(true);
  };
  
  const getFormTitle = (formId: string): string => {
    const formTitles: Record<string, string> = {
      'scope-of-work': 'Scope of Work',
      'invoice': 'Invoice',
      'services-brochure': 'Services Brochure',
      'workshop-curriculum': 'Training Curriculum',
      'innovation-audit': 'Audit Template',
      'px-audit-intake': 'Onboarding Intake: PX & Impact Audit',
      'licensing': 'Licensing Terms',
      'payment-params': 'Payment Terms',
      'scheduling': 'Scheduling Page',
      'pre-consult-audit': 'Pre-Consultation Questionnaire: Audit',
      'pre-consult-workshop': 'Pre-Consultation Questionnaire: Training',
      'pre-consult-general': 'Pre-Consultation Questionnaire',
      'feedback-testimonial': 'Feedback & Testimonial',
    };
    return formTitles[formId] || 'Form';
  };
  
  const saveDuplicateForm = () => {
    if (!pendingDuplicateForm || !duplicateFormTitle.trim()) {
      alert('Please enter a title for the duplicated form');
      return;
    }
    
    // Create the new duplicated form
    const newDuplicatedForm: DuplicatedForm = {
      id: `duplicate-${Date.now()}`,
      templateId: pendingDuplicateForm,
      title: duplicateFormTitle,
      linkedServiceId: selectedServiceForLink || null,
    };
    
    // Add to duplicated forms list
    const newDuplicates = [...duplicatedForms, newDuplicatedForm];
    setDuplicatedForms(newDuplicates);
    
    // Save to localStorage
    localStorage.setItem('original_forms_duplicates', JSON.stringify(newDuplicates));
    
    // Link the service if selected
    if (selectedServiceForLink) {
      const service = services.find(s => s.id === selectedServiceForLink);
      console.log('✅ Form linked to service:', service?.name);
      // TODO: Track this linkage in the service object
      if (onServiceUpdate && service) {
        onServiceUpdate(service);
      }
    }
    
    // Close modal and reset state
    setShowDuplicateModal(false);
    setPendingDuplicateForm(null);
    setDuplicateFormTitle('');
    setSelectedServiceForLink('');
    
    // Force a re-render by updating the key
    setDashboardKey(prev => prev + 1);
    
    alert(`✓ "${duplicateFormTitle}" created successfully!`);
  };
  
  const [dashboardKey, setDashboardKey] = useState(0);
  
  const handleRenameForm = (formId: string, newTitle: string) => {
    console.log('Rename form:', formId, 'to:', newTitle);
    
    // Load existing custom form names
    try {
      const saved = localStorage.getItem('original_forms_custom_names');
      const customNames = saved ? JSON.parse(saved) : {};
      
      // Update with new name
      customNames[formId] = newTitle;
      
      // Save back to localStorage
      localStorage.setItem('original_forms_custom_names', JSON.stringify(customNames));
      
      // Force dashboard refresh to show new name
      setDashboardKey(prev => prev + 1);
      
      console.log('✓ Form renamed and saved to localStorage');
    } catch (error) {
      console.error('Error saving renamed form:', error);
      alert('Failed to save renamed form');
    }
  };

  const handleBackToDashboard = () => {
    setView('dashboard');
    setSelectedTemplateId(null);
    setSelectedFormId(null);
    setPreviewData(null);
  };

  const handleBackToForm = () => {
    setView('edit-form');
    setPreviewData(null);
  };

  const handleFormPreview = (data: any) => {
    console.log('Preview form data:', data);
    
    // Save form data to linked service if applicable
    if (selectedDuplicateId && onServiceUpdate) {
      const linkedServiceId = duplicatedForms.find(f => f.id === selectedDuplicateId)?.linkedServiceId;
      if (linkedServiceId) {
        const service = services.find(s => s.id === linkedServiceId);
        if (service) {
          console.log('💾 Saving form data to service:', service.name);
          // Update the service with the form data
          onServiceUpdate({
            ...service,
            ...data // Merge all form fields into the service
          });
        }
      }
    }
    
    setPreviewData(data);
    setView('preview-document');
  };

  const handleFormSave = () => {
    console.log('Form saved!');
    alert('Form saved successfully! ✓');
  };
  
  const handleTemplatePreview = (templateId: string) => {
    console.log('Preview template:', templateId);
    setSelectedTemplateId(templateId);
    setSelectedFormId(templateId); // Also set formId for routing
    setView('preview-template');
  };

  const handleArchiveForm = (formId: string) => {
    const formToArchive = allDefaultForms.find(f => f.id === formId);
    if (!formToArchive) return;
    
    const confirmed = window.confirm(`Archive "${formToArchive.title}"? It will be moved to Settings → Archive and hidden from this dashboard.`);
    if (!confirmed) return;
    
    try {
      // Get existing archived forms
      const existingArchived = JSON.parse(localStorage.getItem('archived_forms') || '[]');
      
      // Add this form to archived
      const archivedForm = {
        id: formToArchive.id,
        title: formToArchive.title,
        description: formToArchive.description,
        type: 'form-template',
        archivedAt: new Date().toISOString()
      };
      
      existingArchived.push(archivedForm);
      localStorage.setItem('archived_forms', JSON.stringify(existingArchived));
      
      // Dispatch event to update Settings page
      window.dispatchEvent(new Event('archive-updated'));
      
      // Force dashboard refresh
      setDashboardKey(prev => prev + 1);
      
      alert(`"${formToArchive.title}" has been archived. You can restore it from Settings → Archive.`);
    } catch (error) {
      console.error('Error archiving form:', error);
      alert('Error archiving form. Please try again.');
    }
  };

  // Get all default forms (needed for archive function)
  const allDefaultForms = [
    { id: 'scope-of-work', title: 'Scope of Work', description: 'Create comprehensive project proposals with single engagement option' },
    { id: 'scope-of-work-multiple', title: 'SOW: Multiple Options', description: 'Create proposals with multiple engagement options for clients to choose' },
    { id: 'invoice', title: 'Invoice', description: 'Generate professional invoices with itemized services and payment terms' },
    { id: 'services-brochure', title: 'Services Brochure', description: 'Showcase your service offerings with detailed descriptions' },
    { id: 'workshop-curriculum', title: 'Training Curriculum', description: 'Design structured learning experiences and training programs' },
    { id: 'innovation-audit', title: 'Audit Template', description: 'Evaluate organizational innovation capabilities and opportunities' },
    { id: 'px-audit-intake', title: 'Onboarding Intake: PX & Impact Audit', description: 'Patient Experience audit onboarding: understand product perception and context' },
    { id: 'licensing', title: 'Licensing Terms', description: 'Define licensing terms and intellectual property agreements' },
    { id: 'payment-params', title: 'Payment Terms', description: 'Establish payment schedules, milestones, and terms' },
    { id: 'scheduling', title: 'Scheduling Page', description: 'Create scheduling pages with Google Calendar links for consultations and calls' },
    { id: 'pre-consult-audit', title: 'Pre-Consultation Questionnaire: Audit', description: 'Pre-consultation questionnaire for prospects interested in the audit service' },
    { id: 'pre-consult-workshop', title: 'Pre-Consultation Questionnaire: Training', description: 'Pre-consultation questionnaire for prospects interested in workshop/training' },
    { id: 'pre-consult-general', title: 'Pre-Consultation Questionnaire', description: 'General pre-consultation questionnaire to learn about their organization and needs' },
    { id: 'feedback-testimonial', title: 'Feedback & Testimonial', description: 'Request feedback and testimonials from clients' }
  ];

  // Template Editor view
  if (view === 'edit-template' && selectedTemplateId) {
    return (
      <div className="h-full overflow-y-auto">
        <TemplateEditor 
          key={templateEditorKey} // Force re-mount to reload from localStorage
          templateId={selectedTemplateId}
          onBack={handleBackToDashboard}
        />
      </div>
    );
  }

  // Form Editor views
  if (view === 'edit-form' && selectedFormId) {
    // Get the linked service if this is a duplicated form
    const linkedServiceId = selectedDuplicateId 
      ? duplicatedForms.find(f => f.id === selectedDuplicateId)?.linkedServiceId 
      : null;
    const linkedService = linkedServiceId 
      ? services.find(s => s.id === linkedServiceId) 
      : undefined;
    
    if (selectedFormId === 'invoice') {
      return (
        <div className="h-full overflow-y-auto">
          <InvoiceForm
            onPreview={handleFormPreview}
            onBack={handleBackToDashboard}
            onSave={handleFormSave}
            backButtonLabel="Back to Forms Dashboard"
            linkedService={linkedService}
          />
        </div>
      );
    }

    if (selectedFormId === 'payment-params') {
      return (
        <div className="h-full overflow-y-auto">
          <PaymentParamsForm
            onPreview={handleFormPreview}
            onBack={handleBackToDashboard}
            onSave={handleFormSave}
            backButtonLabel="Back to Forms Dashboard"
          />
        </div>
      );
    }

    if (selectedFormId === 'licensing') {
      return (
        <div className="h-full overflow-y-auto">
          <LicensingForm
            onPreview={handleFormPreview}
            onBack={handleBackToDashboard}
            onSave={handleFormSave}
            backButtonLabel="Back to Forms Dashboard"
            services={services}
          />
        </div>
      );
    }

    if (selectedFormId === 'scope-of-work') {
      return (
        <div className="h-full overflow-y-auto">
          <ScopeOfWorkForm
            onPreview={handleFormPreview}
            onBack={handleBackToDashboard}
            onSave={handleFormSave}
            backButtonLabel="Back to Forms Dashboard"
            services={services}
          />
        </div>
      );
    }

    if (selectedFormId === 'scope-of-work-multiple-options' || selectedFormId === 'scope-of-work-multiple' || selectedFormId === 'sow-multiple') {
      return (
        <div className="h-full overflow-y-auto">
          <ScopeOfWorkMultipleOptionsForm
            onPreview={handleFormPreview}
            onBack={handleBackToDashboard}
            onSave={handleFormSave}
            backButtonLabel="Back to Forms Dashboard"
            services={services}
          />
        </div>
      );
    }

    if (selectedFormId === 'pre-consult-general') {
      return (
        <div className="h-full overflow-y-auto">
          <PreConsultGeneralForm
            onPreview={handleFormPreview}
            onBack={handleBackToDashboard}
            onSave={handleFormSave}
            backButtonLabel="Back to Forms Dashboard"
          />
        </div>
      );
    }

    if (selectedFormId === 'pre-consult-audit') {
      return (
        <div className="h-full overflow-y-auto">
          <AuditPreConsultForm
            onPreview={handleFormPreview}
            onBack={handleBackToDashboard}
            onSave={handleFormSave}
            backButtonLabel="Back to Forms Dashboard"
          />
        </div>
      );
    }

    if (selectedFormId === 'pre-consult-workshop') {
      return (
        <div className="h-full overflow-y-auto">
          <TrainingPreConsultForm
            onPreview={handleFormPreview}
            onBack={handleBackToDashboard}
            onSave={handleFormSave}
            backButtonLabel="Back to Forms Dashboard"
          />
        </div>
      );
    }

    if (selectedFormId === 'scheduling') {
      return (
        <div className="h-full overflow-y-auto">
          <SchedulingForm
            onPreview={handleFormPreview}
            onBack={handleBackToDashboard}
            onSave={handleFormSave}
            backButtonLabel="Back to Forms Dashboard"
          />
        </div>
      );
    }

    if (selectedFormId === 'innovation-audit') {
      return (
        <div className="h-full overflow-y-auto">
          <InnovationAuditForm
            onPreview={handleFormPreview}
            onBack={handleBackToDashboard}
            onSave={handleFormSave}
            onSaveAndFinishLater={(data) => handleSaveAndFinishLater('innovation-audit', data)}
            backButtonLabel="Back to Forms Dashboard"
            services={services}
            contacts={contacts}
          />
        </div>
      );
    }

    if (selectedFormId === 'px-audit-intake') {
      return (
        <div className="h-full overflow-y-auto">
          <PXAuditIntakeForm
            onPreview={handleFormPreview}
            onBack={handleBackToDashboard}
            onSave={handleFormSave}
            onSaveAndFinishLater={(data) => handleSaveAndFinishLater('px-audit-intake', data)}
            backButtonLabel="Back to Forms Dashboard"
            services={services}
            contacts={contacts}
          />
        </div>
      );
    }

    if (selectedFormId === 'workshop-curriculum') {
      return (
        <div className="h-full overflow-y-auto">
          <WorkshopCurriculumForm
            onPreview={handleFormPreview}
            onBack={handleBackToDashboard}
            onSave={handleFormSave}
            onSaveAndFinishLater={(data) => handleSaveAndFinishLater('workshop-curriculum', data)}
            backButtonLabel="Back to Forms Dashboard"
            services={services}
            contacts={contacts}
          />
        </div>
      );
    }

    if (selectedFormId === 'services-brochure') {
      return (
        <div className="h-full overflow-y-auto">
          <ServicesBrochureEditor
            services={services}
            onPreview={handleFormPreview}
            onBack={handleBackToDashboard}
            onSaveAndFinishLater={(config) => handleSaveAndFinishLater('services-brochure', config)}
            backButtonLabel="Back to Forms Dashboard"
            initialConfig={initialFormData}
          />
        </div>
      );
    }

    if (selectedFormId === 'feedback-testimonial') {
      return (
        <div className="h-full overflow-y-auto">
          <FeedbackTestimonialForm
            onPreview={handleFormPreview}
            onBack={handleBackToDashboard}
            onSave={handleFormSave}
            onSaveAndFinishLater={(data) => handleSaveAndFinishLater('feedback-testimonial', data)}
            backButtonLabel="Back to Forms Dashboard"
            services={services}
            contacts={contacts}
            initialData={initialFormData}
          />
        </div>
      );
    }
  }

  // Document Preview view
  if (view === 'preview-document' && previewData) {
    if (selectedFormId === 'invoice') {
      return (
        <div className="h-full overflow-y-auto">
          <InvoiceDocument
            documentData={previewData}
            onEdit={handleBackToForm}
            onBack={handleBackToDashboard}
          />
        </div>
      );
    }

    if (selectedFormId === 'payment-params') {
      return (
        <div className="h-full overflow-y-auto">
          <PaymentParamsDocument
            documentData={previewData}
            onEdit={handleBackToForm}
            onBack={handleBackToDashboard}
          />
        </div>
      );
    }

    if (selectedFormId === 'licensing') {
      return (
        <div className="h-full overflow-y-auto">
          <LicensingDocument
            documentData={previewData}
            onEdit={handleBackToForm}
            onBack={handleBackToDashboard}
          />
        </div>
      );
    }

    if (selectedFormId === 'scope-of-work') {
      return (
        <div className="h-full overflow-y-auto">
          <ScopeOfWorkDocument
            documentData={previewData}
            onEdit={handleBackToForm}
            onBack={handleBackToDashboard}
          />
        </div>
      );
    }

    if (selectedFormId === 'scope-of-work-multiple-options' || selectedFormId === 'scope-of-work-multiple' || selectedFormId === 'sow-multiple') {
      return (
        <div className="h-full overflow-y-auto">
          <ScopeOfWorkMultipleOptionsDocument
            documentData={previewData}
            onEdit={handleBackToForm}
            onBack={handleBackToDashboard}
          />
        </div>
      );
    }

    if (selectedFormId === 'pre-consult-general') {
      return (
        <div className="h-full overflow-y-auto">
          <PreConsultGeneralDocument
            documentData={previewData}
            onEdit={handleBackToForm}
            onBack={handleBackToDashboard}
          />
        </div>
      );
    }

    if (selectedFormId === 'pre-consult-audit') {
      return (
        <div className="h-full overflow-y-auto">
          <AuditPreConsultPreview
            data={previewData}
            onEdit={handleBackToForm}
            onBack={handleBackToDashboard}
          />
        </div>
      );
    }

    if (selectedFormId === 'pre-consult-workshop') {
      return (
        <div className="h-full overflow-y-auto">
          <TrainingPreConsultPreview
            data={previewData}
            onEdit={handleBackToForm}
            onBack={handleBackToDashboard}
          />
        </div>
      );
    }

    if (selectedFormId === 'scheduling') {
      return (
        <div className="h-full overflow-y-auto">
          <SchedulingDocument
            documentData={previewData}
            onEdit={handleBackToForm}
            onBack={handleBackToDashboard}
          />
        </div>
      );
    }

    if (selectedFormId === 'innovation-audit') {
      return (
        <div className="h-full overflow-y-auto">
          <InnovationAuditDocument
            documentData={previewData}
            onEdit={handleBackToForm}
            onBack={handleBackToDashboard}
          />
        </div>
      );
    }

    if (selectedFormId === 'px-audit-intake') {
      return (
        <div className="h-full overflow-y-auto">
          <PXAuditIntakeDocument
            documentData={previewData}
            onEdit={handleBackToForm}
            onBack={handleBackToDashboard}
          />
        </div>
      );
    }

    if (selectedFormId === 'workshop-curriculum') {
      return (
        <div className="h-full overflow-y-auto">
          <WorkshopCurriculumDocument
            data={previewData}
            onBack={handleBackToForm}
          />
        </div>
      );
    }

    if (selectedFormId === 'services-brochure') {
      return (
        <div className="h-full overflow-y-auto">
          <ServicesBrochureDocument
            config={previewData}
            services={services}
            onBack={handleBackToForm}
            onEdit={handleBackToForm}
          />
        </div>
      );
    }

    if (selectedFormId === 'feedback-testimonial') {
      return (
        <div className="h-full overflow-y-auto">
          <FeedbackTestimonialDocument
            data={previewData}
            onEdit={handleBackToForm}
            onBack={handleBackToDashboard}
          />
        </div>
      );
    }
  }

  // Drafts view
  if (view === 'drafts') {
    return (
      <div className="h-full overflow-y-auto relative">
        <DraftsViewer
          onBack={handleBackToDashboard}
          onResumeDraft={handleResumeDraft}
        />
      </div>
    );
  }

  // Template Preview view (for forms with template-based previews)
  if (view === 'preview-template' && selectedTemplateId) {
    // Import the TemplateBasedFormPreview component
    const { TemplateBasedFormPreview } = require('./documents/TemplateBasedFormPreview');
    
    if (selectedFormId === 'pre-consult-audit' || selectedFormId === 'pre-consult-workshop' || selectedFormId === 'pre-consult-general') {
      return (
        <div className="h-full overflow-y-auto">
          <TemplateBasedFormPreview
            templateId={selectedTemplateId}
            onBack={handleBackToDashboard}
          />
        </div>
      );
    }
  }

  // Dashboard view
  return (
    <div className="h-full overflow-y-auto relative">
      <div className="p-6 text-center text-gray-500">
        <p>Original Forms Dashboard component temporarily disabled</p>
        <p className="text-sm mt-2">OriginalFormsDashboard component was removed during cleanup</p>
        <p className="text-sm mt-2">Use FormsApp instead</p>
      </div>
      
      {/* View Drafts Floating Button */}
      <button
        onClick={handleViewDrafts}
        className="fixed bottom-8 right-8 bg-[#6b2358] hover:bg-[#6b2358]/90 text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 transition-all hover:scale-105 z-40 font-['Poppins']"
      >
        <Clock className="w-5 h-5" />
        <span>View Drafts</span>
      </button>
      
      {/* Service Link Dialog */}
      {showDuplicateModal && pendingDuplicateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="font-['Lora'] text-2xl text-[#034863] mb-4">
              Link to Service
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Would you like to link this form to a service? This will auto-populate the form with service details and track usage.
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Service (Optional)
              </label>
              <select
                value={selectedServiceForLink}
                onChange={(e) => setSelectedServiceForLink(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2f829b]/30 font-['Poppins']"
              >
                <option value="">No service (blank form)</option>
                {services.filter(s => s.isActive).map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name} - {service.price}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                New Form Title
              </label>
              <input
                type="text"
                value={duplicateFormTitle}
                onChange={(e) => setDuplicateFormTitle(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2f829b]/30 font-['Poppins']"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDuplicateModal(false);
                  setPendingDuplicateForm(null);
                  setSelectedServiceForLink('');
                }}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-['Poppins']"
              >
                Cancel
              </button>
              <button
                onClick={saveDuplicateForm}
                className="flex-1 px-4 py-3 bg-[#2f829b] text-white rounded-xl hover:bg-[#034863] transition-colors font-['Poppins']"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}