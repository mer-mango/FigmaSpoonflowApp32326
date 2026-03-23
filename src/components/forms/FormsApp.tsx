import React, { useState } from 'react';
import { FormDashboard, defaultForms } from './FormDashboard';
import { ScopeOfWorkForm } from './editors/ScopeOfWorkForm';
import { ScopeOfWorkMultipleOptionsForm } from './editors/ScopeOfWorkMultipleOptionsForm';
import { UniversalFormEditor } from './editors/UniversalFormEditor';
import { SchedulingForm } from './editors/SchedulingForm';
import { InnovationAuditForm } from './editors/InnovationAuditForm';
import { TemplateEditor } from './TemplateEditor';
import { SOWMultipleOptions } from './documents/SOW_MultipleOptions';
import { SOWSingleOption } from './documents/SOW_SingleOption';
import { ScopeOfWorkMultipleOptionsDocument } from './documents/ScopeOfWorkMultipleOptionsDocument';
import { InvoiceDocument } from './documents/InvoiceDocument';
import { ServicesDocument } from './documents/ServicesDocument';
import { LicensingDocument } from './documents/LicensingDocument';
import { PaymentParamsDocument } from './documents/PaymentParamsDocument';
import { WorkshopCurriculumDocument } from './documents/WorkshopCurriculumDocument';
import { InnovationAuditDocument } from './documents/InnovationAuditDocument';
import { GeneralPreConsultPreview } from './documents/GeneralPreConsultPreview';
import { SchedulingDocument } from './documents/SchedulingDocument';
import { FeedbackPreview } from './documents/FeedbackPreview';
import { ServiceFormLinker } from '../../utils/serviceFormLinker';
import type { Service } from '../../App';

type FormMode = 'dashboard' | 'form' | 'document' | 'template-editor';
type FormType = 'scope-of-work' | 'scope-of-work-multiple' | 'invoice' | 'services-brochure' | 'licensing' | 'payment-params' | 'workshop-curriculum' | 'innovation-audit' | 'pre-consult-audit' | 'pre-consult-workshop' | 'pre-consult-general' | 'scheduling' | 'feedback-testimonial' | null;

interface FormsAppProps {
  onQuickAddSelect?: (type: 'task' | 'contact' | 'content' | 'voice') => void;
  onJamieAction?: (type: 'plan-day' | 'post-meeting' | 'wind-down' | 'chat') => void;
  services?: Service[];
  contacts?: any[]; // Contact array from App
}

export function FormsApp({ onQuickAddSelect, onJamieAction, services = [], contacts = [] }: FormsAppProps = {}) {
  const [currentView, setCurrentView] = useState<FormMode>('dashboard');
  const [currentFormType, setCurrentFormType] = useState<FormType>(null);
  const [documentData, setDocumentData] = useState<any>(null);
  
  // Template editor state
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editingTemplateName, setEditingTemplateName] = useState<string>('');
  
  // Flow wizard state tracking
  const [returnToWizard, setReturnToWizard] = useState(false);
  const [wizardData, setWizardData] = useState<{ 
    flowName: string; 
    flowForms: any[];
    currentStep?: any;
    editedForms?: Set<string>;
    contactData?: any;
    customFlowName?: string;
  } | null>(null);
  
  // Track navigation source for smart back button
  const [navigationSource, setNavigationSource] = useState<'dashboard' | 'wizard'>('dashboard');
  
  // SOW-specific state
  const [showSignature, setShowSignature] = useState(false);
  const [clientSignature, setClientSignature] = useState('');
  const [clientSignatureDate, setClientSignatureDate] = useState('');
  const [consultantSignature, setConsultantSignature] = useState('Meredith Mangold, CPXP');
  const [editRequest, setEditRequest] = useState('');
  const [showEditRequest, setShowEditRequest] = useState(false);
  const [status, setStatus] = useState<'pending' | 'approved' | 'edit-requested'>('pending');
  const [selectedProjectOption, setSelectedProjectOption] = useState<string>('');
  
  // Service linking state
  const [showServiceLinkDialog, setShowServiceLinkDialog] = useState(false);
  const [pendingDuplicateFormId, setPendingDuplicateFormId] = useState<string | null>(null);
  const [selectedServiceForLink, setSelectedServiceForLink] = useState<string>('');

  const handleSelectForm = (formId: string) => {
    console.log('🔍 handleSelectForm called with formId:', formId);
    setCurrentFormType(formId as FormType);
    setCurrentView('form');
    console.log('🔍 currentView set to:', 'form', 'currentFormType set to:', formId);
    // Track that we came from dashboard if not from wizard
    if (!returnToWizard) {
      setNavigationSource('dashboard');
    } else {
      setNavigationSource('wizard');
    }
    // Reset document-specific state
    setDocumentData(null);
    setShowSignature(false);
    setClientSignature('');
    setClientSignatureDate('');
    setEditRequest('');
    setShowEditRequest(false);
    setStatus('pending');
    setSelectedProjectOption('');
  };

  const handleEditTemplate = (templateId: string) => {
    // Open the template editor for this specific template
    const form = defaultForms.find(f => f.templateId === templateId);
    if (form) {
      setEditingTemplateId(templateId);
      setEditingTemplateName(form.title);
      setCurrentView('template-editor');
    }
  };

  const handleDuplicateForm = (formId: string) => {
    console.log('🔍 handleDuplicateForm called with:', formId);
    console.log('🔍 Services available:', services);
    console.log('🔍 Active services count:', services?.filter(s => s.isActive).length);
    
    // ALWAYS show the dialog for testing
    console.log('✅ Setting state to show dialog...');
    setPendingDuplicateFormId(formId);
    setShowServiceLinkDialog(true);
    console.log('✅ State set! showServiceLinkDialog should be true');
  };
  
  const proceedWithDuplicate = (formId: string, serviceId: string | null) => {
    setCurrentFormType(formId as FormType);
    setCurrentView('form');
    
    // If a service was selected, pre-populate form with service data
    if (serviceId) {
      const service = services.find(s => s.id === serviceId);
      if (service) {
        // Store service data to auto-populate the form
        setDocumentData({
          linkedServiceId: serviceId,
          linkedServiceName: service.name,
          linkedServiceData: service
        });
      }
    } else {
      // Reset document-specific state
      setDocumentData(null);
    }
    
    setShowSignature(false);
    setClientSignature('');
    setClientSignatureDate('');
    setEditRequest('');
    setShowEditRequest(false);
    setStatus('pending');
    setSelectedProjectOption('');
    setShowServiceLinkDialog(false);
    setPendingDuplicateFormId(null);
    setSelectedServiceForLink('');
  };

  const handleArchiveForm = (formId: string) => {
    // Show confirmation
    const confirmed = window.confirm('Are you sure you want to archive this form template? You can restore it from the Archive section in Settings.');
    if (confirmed) {
      try {
        // Get existing archived forms
        const archivedForms = JSON.parse(localStorage.getItem('archived_forms') || '[]');
        
        // Find the form to get its title
        const formToArchive = defaultForms.find(f => f.id === formId);
        
        // Add the form ID with timestamp
        const archivedItem = {
          id: formId,
          type: 'form-template',
          archivedAt: new Date().toISOString(),
          title: formToArchive?.title || formId
        };
        
        archivedForms.push(archivedItem);
        localStorage.setItem('archived_forms', JSON.stringify(archivedForms));
        
        // Dispatch event to notify other components
        window.dispatchEvent(new Event('archive-updated'));
        
        // Force refresh by navigating away and back
        alert('Form template archived successfully! You can restore it from Settings > Archive.');
        handleBackToDashboard();
      } catch (error) {
        console.error('Error archiving form:', error);
        alert('Error archiving form. Please try again.');
      }
    }
  };

  const handleBackToDashboard = () => {
    // If we came from the wizard, trigger a return to wizard instead
    if (returnToWizard && wizardData) {
      setReturnToWizard(false);
      // Don't clear wizard data yet - FormDashboard will need it
    }
    setCurrentView('dashboard');
    setCurrentFormType(null);
    setDocumentData(null);
  };

  const handleSaveAndReturn = () => {
    // Save the form (in a real app, this would save to database)
    alert('Form saved successfully!');
    
    // If we're in wizard mode, mark the form as edited
    if (returnToWizard && wizardData && currentFormType) {
      setWizardData({
        ...wizardData,
        editedForms: new Set([...(wizardData.editedForms || new Set()), currentFormType])
      });
    }
    
    // Return to dashboard/wizard
    handleBackToDashboard();
  };

  const handlePreview = (data: any) => {
    console.log('Preview data received:', data);
    setDocumentData(data);
    setCurrentView('document');
    
    // If we're in wizard mode, mark the form as edited since they filled it out
    if (returnToWizard && wizardData && currentFormType) {
      setWizardData({
        ...wizardData,
        editedForms: new Set([...(wizardData.editedForms || new Set()), currentFormType])
      });
    }
  };

  const handleEdit = () => {
    setCurrentView('form');
  };

  const handleApprove = () => {
    setShowSignature(true);
  };

  const handleSign = () => {
    if (clientSignature.trim() && clientSignatureDate.trim()) {
      setStatus('approved');
      setShowSignature(false);
      alert('Document approved and signed! Both parties will receive confirmation via email.');
    }
  };

  const handleRequestEdits = () => {
    setShowEditRequest(true);
  };

  const handleSubmitEdits = () => {
    if (editRequest.trim()) {
      setStatus('edit-requested');
      setShowEditRequest(false);
      alert('Edit request sent to Empower Health Strategies. You will receive a revised version shortly.');
    }
  };

  return (
    <div className="h-full overflow-auto bg-[#ebeef4]">
      {/* Dashboard */}
      {currentView === 'dashboard' && (
        <FormDashboard 
          onSelectForm={handleSelectForm}
          onEditTemplate={handleEditTemplate}
          onDuplicateForm={handleDuplicateForm}
          onArchiveForm={handleArchiveForm}
          onQuickAddSelect={onQuickAddSelect}
          onJamieAction={onJamieAction}
          wizardToReopen={wizardData}
          onWizardReopened={() => setWizardData(null)}
          onWizardEditForm={(flowName: string, flowForms: any[], formId: string, currentStep?: any, editedForms?: Set<string>, contactData?: any, customFlowName?: string) => {
            // Store wizard data with current step and edited forms for return
            console.log('🔥 FormsApp - onWizardEditForm called!');
            console.log('🔥 Contact data:', contactData);
            console.log('🔥 Current step:', currentStep);
            console.log('🔥 Edited forms:', editedForms);
            console.log('🔥 Custom flow name:', customFlowName);
            setWizardData({ flowName, flowForms, currentStep, editedForms, contactData, customFlowName });
            setReturnToWizard(true);
            setNavigationSource('wizard');
            // Open the form editor
            handleSelectForm(formId);
          }}
        />
      )}

      {/* Form Editors */}
      {currentView === 'form' && currentFormType === 'scope-of-work' && (
        <ScopeOfWorkForm 
          onPreview={handlePreview} 
          onBack={handleBackToDashboard} 
          onSave={handleSaveAndReturn}
          backButtonLabel={navigationSource === 'wizard' ? 'Back to Flow Wizard' : 'Back to Dashboard'}
          initialData={wizardData?.contactData || documentData}
          services={services}
        />
      )}
      {currentView === 'form' && currentFormType === 'scope-of-work-multiple' && (
        <ScopeOfWorkMultipleOptionsForm 
          onPreview={handlePreview} 
          onBack={handleBackToDashboard} 
          onSave={handleSaveAndReturn}
          backButtonLabel={navigationSource === 'wizard' ? 'Back to Flow Wizard' : 'Back to Dashboard'}
          initialData={wizardData?.contactData || documentData}
          services={services}
        />
      )}
      {currentView === 'form' && currentFormType === 'invoice' && (
        <UniversalFormEditor 
          formId="invoice"
          formTitle="Invoice"
          onPreview={handlePreview} 
          onBack={handleBackToDashboard} 
          onSave={handleSaveAndReturn}
          backButtonLabel={navigationSource === 'wizard' ? 'Back to Flow Wizard' : 'Back to Dashboard'}
          initialData={wizardData?.contactData || documentData}
        />
      )}
      {currentView === 'form' && currentFormType === 'services-brochure' && (
        <UniversalFormEditor 
          formId="services-brochure"
          formTitle="Services Brochure"
          onPreview={handlePreview} 
          onBack={handleBackToDashboard} 
          onSave={handleSaveAndReturn}
          backButtonLabel={navigationSource === 'wizard' ? 'Back to Flow Wizard' : 'Back to Dashboard'}
          initialData={wizardData?.contactData || documentData}
        />
      )}
      {currentView === 'form' && currentFormType === 'licensing' && (
        <UniversalFormEditor 
          formId="licensing"
          formTitle="Licensing Terms"
          onPreview={handlePreview} 
          onBack={handleBackToDashboard}
          onSave={handleSaveAndReturn}
          backButtonLabel={navigationSource === 'wizard' ? 'Back to Flow Wizard' : 'Back to Dashboard'}
          initialData={wizardData?.contactData || documentData}
        />
      )}
      {currentView === 'form' && currentFormType === 'payment-params' && (
        <UniversalFormEditor 
          formId="payment-params"
          formTitle="Payment Terms"
          onPreview={handlePreview} 
          onBack={handleBackToDashboard} 
          onSave={handleSaveAndReturn}
          backButtonLabel={navigationSource === 'wizard' ? 'Back to Flow Wizard' : 'Back to Dashboard'}
          initialData={wizardData?.contactData || documentData}
        />
      )}
      {currentView === 'form' && currentFormType === 'workshop-curriculum' && (
        <UniversalFormEditor 
          formId="workshop-curriculum"
          formTitle="Training Curriculum"
          onPreview={handlePreview} 
          onBack={handleBackToDashboard}
          onSave={handleSaveAndReturn}
          backButtonLabel={navigationSource === 'wizard' ? 'Back to Flow Wizard' : 'Back to Dashboard'}
          initialData={wizardData?.contactData || documentData}
        />
      )}
      {currentView === 'form' && currentFormType === 'innovation-audit' && (
        <InnovationAuditForm
          onPreview={handlePreview} 
          onBack={handleBackToDashboard} 
          onSave={handleSaveAndReturn}
          backButtonLabel={navigationSource === 'wizard' ? 'Back to Flow Wizard' : 'Back to Dashboard'}
          initialData={wizardData?.contactData || documentData}
          services={services}
          contacts={contacts}
        />
      )}
      {currentView === 'form' && currentFormType === 'pre-consult-audit' && (
        <UniversalFormEditor 
          formId="pre-consult-audit"
          formTitle="Pre-Consult Q: Audit"
          onPreview={handlePreview} 
          onBack={handleBackToDashboard} 
          onSave={handleSaveAndReturn}
          backButtonLabel={navigationSource === 'wizard' ? 'Back to Flow Wizard' : 'Back to Dashboard'}
          initialData={wizardData?.contactData || documentData}
        />
      )}
      {currentView === 'form' && currentFormType === 'pre-consult-workshop' && (
        <UniversalFormEditor 
          formId="pre-consult-workshop"
          formTitle="Pre-Consult Q: Training"
          onPreview={handlePreview} 
          onBack={handleBackToDashboard} 
          onSave={handleSaveAndReturn}
          backButtonLabel={navigationSource === 'wizard' ? 'Back to Flow Wizard' : 'Back to Dashboard'}
          initialData={wizardData?.contactData || documentData}
        />
      )}
      {currentView === 'form' && currentFormType === 'pre-consult-general' && (
        <UniversalFormEditor 
          formId="pre-consult-general"
          formTitle="Pre-Consult Q: Neutral"
          onPreview={handlePreview} 
          onBack={handleBackToDashboard} 
          onSave={handleSaveAndReturn}
          backButtonLabel={navigationSource === 'wizard' ? 'Back to Flow Wizard' : 'Back to Dashboard'}
          initialData={wizardData?.contactData || documentData}
        />
      )}
      {currentView === 'form' && currentFormType === 'scheduling' && (
        <SchedulingForm
          onPreview={handlePreview} 
          onBack={handleBackToDashboard} 
          onSave={handleSaveAndReturn}
          backButtonLabel={navigationSource === 'wizard' ? 'Back to Flow Wizard' : 'Back to Dashboard'}
          initialData={wizardData?.contactData || documentData}
        />
      )}
      {currentView === 'form' && currentFormType === 'feedback-testimonial' && (
        <UniversalFormEditor 
          formId="feedback-testimonial"
          formTitle="Feedback & Testimonial"
          onPreview={handlePreview} 
          onBack={handleBackToDashboard} 
          onSave={handleSaveAndReturn}
          backButtonLabel={navigationSource === 'wizard' ? 'Back to Flow Wizard' : 'Back to Dashboard'}
          initialData={wizardData?.contactData || documentData}
        />
      )}

      {/* Document Previews */}
      {currentView === 'document' && currentFormType === 'scope-of-work' && documentData && (() => {
        // Automatically determine view based on number of options
        const isSingleOption = documentData.projectOptions?.length === 1;
        
        return isSingleOption ? (
          <SOWSingleOption
            documentData={documentData}
            status={status}
            showSignature={showSignature}
            showEditRequest={showEditRequest}
            clientSignature={clientSignature}
            clientSignatureDate={clientSignatureDate}
            consultantSignature={consultantSignature}
            editRequest={editRequest}
            setClientSignature={setClientSignature}
            setClientSignatureDate={setClientSignatureDate}
            setEditRequest={setEditRequest}
            handleApprove={handleApprove}
            handleSign={handleSign}
            handleRequestEdits={handleRequestEdits}
            handleSubmitEdits={handleSubmitEdits}
            setShowSignature={setShowSignature}
            setShowEditRequest={setShowEditRequest}
            onEdit={handleEdit}
          />
        ) : (
          <SOWMultipleOptions
            documentData={documentData}
            status={status}
            showSignature={showSignature}
            showEditRequest={showEditRequest}
            clientSignature={clientSignature}
            clientSignatureDate={clientSignatureDate}
            consultantSignature={consultantSignature}
            editRequest={editRequest}
            selectedProjectOption={selectedProjectOption}
            setClientSignature={setClientSignature}
            setClientSignatureDate={setClientSignatureDate}
            setEditRequest={setEditRequest}
            setSelectedProjectOption={setSelectedProjectOption}
            handleApprove={handleApprove}
            handleSign={handleSign}
            handleRequestEdits={handleRequestEdits}
            handleSubmitEdits={handleSubmitEdits}
            setShowSignature={setShowSignature}
            setShowEditRequest={setShowEditRequest}
            onEdit={handleEdit}
          />
        );
      })()}

      {currentView === 'document' && currentFormType === 'scope-of-work-multiple' && documentData && (
        <ScopeOfWorkMultipleOptionsDocument documentData={documentData} onEdit={handleEdit} onBack={handleBackToDashboard} />
      )}

      {currentView === 'document' && currentFormType === 'invoice' && documentData && (
        <InvoiceDocument documentData={documentData} onEdit={handleEdit} />
      )}

      {currentView === 'document' && currentFormType === 'services-brochure' && documentData && (
        <ServicesDocument documentData={documentData} onEdit={handleEdit} />
      )}

      {currentView === 'document' && currentFormType === 'licensing' && documentData && (
        <LicensingDocument documentData={documentData} onEdit={handleEdit} />
      )}

      {currentView === 'document' && currentFormType === 'payment-params' && documentData && (
        <PaymentParamsDocument documentData={documentData} onEdit={handleEdit} />
      )}

      {currentView === 'document' && currentFormType === 'workshop-curriculum' && documentData && (
        <WorkshopCurriculumDocument documentData={documentData} onEdit={handleEdit} />
      )}

      {currentView === 'document' && currentFormType === 'innovation-audit' && documentData && (
        <InnovationAuditDocument documentData={documentData} onEdit={handleEdit} />
      )}

      {currentView === 'document' && currentFormType === 'pre-consult-general' && documentData && (
        <GeneralPreConsultPreview data={documentData} onEdit={handleEdit} onBack={handleBackToDashboard} />
      )}

      {currentView === 'document' && currentFormType === 'scheduling' && documentData && (
        <SchedulingDocument documentData={documentData} onEdit={handleEdit} />
      )}

      {currentView === 'document' && currentFormType === 'feedback-testimonial' && documentData && (
        <FeedbackPreview data={documentData} onEdit={handleEdit} onBack={handleBackToDashboard} />
      )}

      {/* Template Editor */}
      {currentView === 'template-editor' && editingTemplateId && (
        <TemplateEditor
          templateId={editingTemplateId}
          templateName={editingTemplateName}
          onBack={handleBackToDashboard}
        />
      )}
      
      {/* Service Link Dialog */}
      {showServiceLinkDialog && pendingDuplicateFormId && (
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
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowServiceLinkDialog(false);
                  setPendingDuplicateFormId(null);
                  setSelectedServiceForLink('');
                }}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-['Poppins']"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (pendingDuplicateFormId) {
                    proceedWithDuplicate(pendingDuplicateFormId, selectedServiceForLink || null);
                  }
                }}
                className="flex-1 px-4 py-3 bg-[#2f829b] text-white rounded-xl hover:bg-[#034863] transition-colors font-['Poppins']"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Debug indicator */}
      {showServiceLinkDialog && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded z-[10000]">
          Dialog State: TRUE - pendingForm: {pendingDuplicateFormId}
        </div>
      )}
    </div>
  );
}