import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, User, Edit, Eye, Link as LinkIcon, Mail, Check } from 'lucide-react';
import { FlowInstanceService } from '../../services/flowInstanceService';
import { sortContactsByLastName } from '../../utils/contactSorting';

interface FlowWizardProps {
  flowName: string;
  flowId?: string; // Add flowId to track which flow template this is
  flowForms: Array<{
    formId: string;
    formTitle: string;
  }>;
  onClose: () => void;
  onEditForm?: (formId: string, currentStep: WizardStep, editedForms: Set<string>, contactData?: any, customFlowName?: string) => void;
  initialStep?: WizardStep;
  initialEditedForms?: Set<string>;
  initialContactData?: any; // Add initial contact data
  initialCustomFlowName?: string; // Add initial custom flow name
  emailTemplate?: string; // Add email template from flow
}

type WizardStep = 'select-contact' | 'customize-forms' | 'preview-approve' | 'generate-url' | 'compose-email' | 'complete';

export function FlowWizard({ flowName, flowId, flowForms, onClose, onEditForm, initialStep = 'select-contact', initialEditedForms, initialContactData, initialCustomFlowName, emailTemplate }: FlowWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>(initialStep);
  const [selectedContactId, setSelectedContactId] = useState<string>(initialContactData?.id || '');
  const [selectedContact, setSelectedContact] = useState<any>(initialContactData || null);
  const [flowInstanceId, setFlowInstanceId] = useState<string>('');
  const [uniqueUrl, setUniqueUrl] = useState<string>('');
  const [emailContent, setEmailContent] = useState<string>('');
  const [editedForms, setEditedForms] = useState<Set<string>>(initialEditedForms || new Set());
  const [autoOpenPreview, setAutoOpenPreview] = useState(false);
  const [customFlowName, setCustomFlowName] = useState<string>(initialCustomFlowName || '');

  // Sync contact state when initialContactData changes
  useEffect(() => {
    if (initialContactData) {
      setSelectedContactId(initialContactData.id || '');
      setSelectedContact(initialContactData);
    }
  }, [initialContactData]);

  // Sync edited forms when initialEditedForms changes
  useEffect(() => {
    if (initialEditedForms) {
      setEditedForms(initialEditedForms);
    }
  }, [initialEditedForms]);

  // Sync current step when initialStep changes
  useEffect(() => {
    if (initialStep) {
      setCurrentStep(initialStep);
    }
  }, [initialStep]);

  // Sync custom flow name when initialCustomFlowName changes
  useEffect(() => {
    if (initialCustomFlowName) {
      setCustomFlowName(initialCustomFlowName);
    }
  }, [initialCustomFlowName]);

  // Debug logging
  console.log('FlowWizard mounted/updated:', {
    initialStep,
    currentStep,
    initialEditedForms: initialEditedForms ? Array.from(initialEditedForms) : [],
    editedForms: Array.from(editedForms),
    initialContactData,
    selectedContact,
    selectedContactId
  });

  console.log('🔍 Contact state check:', {
    hasInitialContactData: !!initialContactData,
    initialContactId: initialContactData?.id,
    initialContactName: initialContactData?.name,
    currentSelectedContactId: selectedContactId,
    currentSelectedContact: selectedContact
  });

  const steps: Array<{ id: WizardStep; label: string; icon: React.ReactNode }> = [
    { id: 'select-contact', label: 'Select Contact', icon: <User className="w-4 h-4" /> },
    { id: 'customize-forms', label: 'Customize Forms', icon: <Edit className="w-4 h-4" /> },
    { id: 'preview-approve', label: 'Preview & Approve', icon: <Eye className="w-4 h-4" /> },
    { id: 'generate-url', label: 'Generate URL', icon: <LinkIcon className="w-4 h-4" /> },
    { id: 'compose-email', label: 'Compose Email', icon: <Mail className="w-4 h-4" /> },
    { id: 'complete', label: 'Complete', icon: <Check className="w-4 h-4" /> },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-200 flex items-center justify-between bg-white">
          <div>
            <h2 className="font-serif text-3xl text-slate-800">{flowName}</h2>
            <p className="text-[#6b7b8a] mt-1">Send flow to client</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-2xl transition-colors"
          >
            <X className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-8 py-6 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="contents">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      currentStepIndex === index
                        ? 'bg-[#6b2358] text-white'
                        : currentStepIndex > index
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    {currentStepIndex > index ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <p
                    className={`mt-2 text-sm font-medium ${
                      currentStepIndex >= index ? 'text-slate-700' : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 transition-all ${
                      currentStepIndex > index ? 'bg-green-500' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8">
          {currentStep === 'select-contact' && (
            <SelectContactStep
              onSelectContact={(contact: any) => {
                setSelectedContactId(contact.id);
                setSelectedContact(contact);
              }}
              selectedContactId={selectedContactId}
            />
          )}
          {currentStep === 'customize-forms' && (
            <CustomizeFormsStep
              flowForms={flowForms}
              selectedContactId={selectedContactId}
              selectedContact={selectedContact}
              onEditForm={onEditForm}
              editedForms={editedForms}
              setEditedForms={setEditedForms}
              customFlowName={customFlowName}
              setCustomFlowName={setCustomFlowName}
              flowName={flowName}
            />
          )}
          {currentStep === 'preview-approve' && (
            <PreviewApproveStep
              flowForms={flowForms}
              selectedContactId={selectedContactId}
              onPreviewForm={onEditForm}
              editedForms={editedForms}
              selectedContact={selectedContact}
              autoOpenPreview={autoOpenPreview}
              setAutoOpenPreview={setAutoOpenPreview}
            />
          )}
          {currentStep === 'generate-url' && (
            <GenerateUrlStep
              flowName={flowName}
              flowId={flowId}
              flowForms={flowForms}
              selectedContact={selectedContact}
              selectedContactId={selectedContactId}
              onUrlGenerated={(id, url) => {
                setFlowInstanceId(id);
                setUniqueUrl(url);
              }}
              onClose={onClose}
              customFlowName={customFlowName}
            />
          )}
          {currentStep === 'compose-email' && (
            <ComposeEmailStep
              flowName={flowName}
              selectedContactId={selectedContactId}
              uniqueUrl={uniqueUrl}
              emailContent={emailContent}
              onEmailChange={setEmailContent}
              flowInstanceId={flowInstanceId}
              selectedContact={selectedContact}
              emailTemplate={emailTemplate}
            />
          )}
          {currentStep === 'complete' && (
            <CompleteStep
              selectedContactId={selectedContactId}
              uniqueUrl={uniqueUrl}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStepIndex === 0}
            className={`px-6 py-2.5 rounded-2xl font-medium flex items-center gap-2 transition-all ${
              currentStepIndex === 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <div className="text-sm text-slate-600">
            Step {currentStepIndex + 1} of {steps.length}
          </div>

          <button
            onClick={handleNext}
            disabled={currentStepIndex === steps.length - 1}
            className={`px-6 py-2.5 rounded-2xl font-medium flex items-center gap-2 transition-all ${
              currentStepIndex === steps.length - 1
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-[#a89db0] text-white hover:bg-[#9a8ea0]'
            }`}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Step 1: Select Contact
function SelectContactStep({ onSelectContact, selectedContactId }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const contacts = [
    { id: '1', name: 'Sarah Johnson', email: 'sarah@techcorp.com', company: 'TechCorp Inc' },
    { id: '2', name: 'Michael Chen', email: 'michael@innovate.com', company: 'Innovate Solutions' },
    { id: '3', name: 'Emily Davis', email: 'emily@startup.io', company: 'Startup.io' },
  ];

  // Filter contacts based on search query
  const filteredContacts = sortContactsByLastName(
    contacts.filter(contact => 
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div>
      <h3 className="font-serif text-2xl text-slate-800 mb-2">Select a Contact</h3>
      <p className="text-[#6b7b8a] mb-6">Choose who will receive this flow</p>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search contacts by name, email, or company..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#a89db0] focus:border-transparent"
        />
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {filteredContacts.length > 0 ? (
          filteredContacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => onSelectContact(contact)}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                selectedContactId === contact.id
                  ? 'border-[#a89db0] bg-[#a89db0]/5'
                  : 'border-slate-200 hover:border-[#a89db0]/50 bg-white'
              }`}
            >
              <div className="font-medium text-slate-800">{contact.name}</div>
              <div className="text-sm text-slate-600">{contact.email}</div>
              <div className="text-sm text-slate-500">{contact.company}</div>
            </button>
          ))
        ) : (
          <div className="text-center py-8 text-slate-500">
            No contacts found matching "{searchQuery}"
          </div>
        )}
      </div>

      <button
        onClick={() => alert('Add new contact functionality')}
        className="mt-4 text-[#a89db0] hover:text-[#8a7d90] font-medium"
      >
        + Add New Contact
      </button>
    </div>
  );
}

// Step 2: Customize Forms
function CustomizeFormsStep({ flowForms, selectedContactId, selectedContact, onEditForm, editedForms, setEditedForms, customFlowName, setCustomFlowName, flowName }: any) {
  // Generate default custom name if not set
  const defaultName = selectedContact ? `${selectedContact.name}'s ${flowName}` : flowName;
  
  return (
    <div>
      <h3 className="font-serif text-2xl text-slate-800 mb-2">Customize Forms</h3>
      <p className="text-[#6b7b8a] mb-6">
        Rename the flow and fill in client-specific information for {selectedContact ? selectedContact.name : 'the client'}
      </p>

      {/* Custom Flow Name Input */}
      <div className="mb-6 p-6 bg-[rgba(225,231,241,0.5)] rounded-2xl border-2 border-[#ddecf0]">
        <label className="block font-medium text-slate-700 mb-3">
          Custom Flow Name for Client
          <span className="text-sm font-normal text-slate-600 ml-2">(What the client will see)</span>
        </label>
        <input
          type="text"
          value={customFlowName || defaultName}
          onChange={(e) => setCustomFlowName(e.target.value)}
          placeholder={defaultName}
          className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#a89db0] focus:border-transparent font-['Poppins'] text-slate-800"
        />
        <p className="text-xs text-slate-500 mt-2">
          Examples: "{selectedContact?.name}'s Pre-Consult Questionnaire", "{selectedContact?.name}'s Onboarding Package", or keep the default name
        </p>
      </div>

      <div className="space-y-4">
        {flowForms.map((form: any, index: number) => {
          const isEdited = editedForms.has(form.formId);
          
          return (
            <div key={index} className={`p-6 bg-white rounded-2xl border-2 transition-all ${
              isEdited ? 'border-[#8ba5a8] bg-[#8ba5a8]/5' : 'border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h4 className="font-medium text-slate-800">{form.formTitle}</h4>
                  {isEdited && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#8ba5a8]/15 text-[#8ba5a8] rounded-full text-xs font-medium">
                      <Check className="w-3.5 h-3.5" />
                      Edited
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => {
                    if (onEditForm) {
                      onEditForm(form.formId, 'customize-forms', editedForms, selectedContact, customFlowName);
                    } else {
                      alert('Form editor integration coming soon!');
                    }
                  }}
                  className="px-3 py-1.5 bg-[#e1e7f1] hover:bg-[#e1e7f1]/80 text-[#324157] rounded-xl text-sm font-medium transition-colors"
                >
                  {isEdited ? 'Edit Again' : 'Edit Details'}
                </button>
              </div>
              <p className="text-sm text-slate-600">
                {isEdited 
                  ? 'This form has been customized. Click "Edit Again" to make changes.'
                  : 'Click "Edit Details" to fill in the template with client-specific information. Once saved, the formatted document will be part of this flow.'
                }
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-[rgba(225,231,241,0.5)] rounded-2xl border border-blue-200">
        <h4 className="font-medium mb-2 text-[rgb(50,65,87)]">💡 How it works</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li className="text-[rgb(50,65,87)]">• Edit each form template with {selectedContactId ? 'the selected contact' : 'client'}-specific details</li>
          <li className="text-[rgb(50,65,87)]">• Your edits create formatted, client-facing documents</li>
          <li className="text-[rgb(50,65,87)]">• These documents become the steps in the final flow</li>
          <li className="text-[rgb(50,65,87)]">• The client receives these beautifully formatted docs to complete</li>
        </ul>
      </div>
    </div>
  );
}

// Step 3: Preview & Approve
function PreviewApproveStep({ flowForms, selectedContactId, onPreviewForm, editedForms, selectedContact, autoOpenPreview, setAutoOpenPreview }: any) {
  return (
    <div>
      <h3 className="font-serif text-2xl text-slate-800 mb-2">Preview & Approve</h3>
      <p className="text-[#6b7b8a] mb-6">
        Review each form individually before generating the client URL
      </p>

      <div className="space-y-6">
        {/* Step-by-Step Preview */}
        <div>
          <h4 className="font-medium text-slate-700 mb-3">Individual Form Previews</h4>
          <div className="space-y-3">
            {flowForms.map((form: any, index: number) => {
              const isEdited = editedForms?.has(form.formId);
              
              return (
                <div key={index} className="p-4 bg-white rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#a89db0] text-[rgb(255,255,255)] flex items-center justify-center font-medium">
                        {index + 1}
                      </div>
                      <span className="font-medium text-slate-800">{form.formTitle}</span>
                      {!isEdited && (
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          Template default
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={() => {
                        if (onPreviewForm) {
                          // Preview works for both edited and unedited forms
                          // Unedited forms show template defaults
                          onPreviewForm(form.formId, 'preview-approve', editedForms, selectedContact);
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl text-sm font-medium transition-colors bg-[#e1e7f1] hover:bg-[#e1e7f1]/80 text-[#324157] cursor-pointer"
                    >
                      Preview
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info about complete flow preview */}
        <div>
          <h4 className="font-medium text-slate-700 mb-3">Complete Flow Preview</h4>
          <div className="p-6 bg-[#e1e7f1]/50 rounded-2xl border border-[#a8998f]/20">
            <p className="text-slate-700 mb-3">
              To see the full client experience with all forms in one continuous page:
            </p>
            <ol className="text-sm text-slate-600 space-y-2 mb-4">
              <li>1. Click <strong>Next</strong> to proceed to URL generation</li>
              <li>2. Generate the unique client URL</li>
              <li>3. Click <strong>Preview Client View</strong> to see the complete flow</li>
            </ol>
            <p className="text-xs text-slate-500">
              💡 This ensures you're previewing the actual URL that will be sent to {selectedContactId ? 'the selected contact' : 'the client'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 4: Generate URL
function GenerateUrlStep({ flowName, flowId, flowForms, selectedContact, selectedContactId, onUrlGenerated, onClose, customFlowName }: any) {
  const [isGenerated, setIsGenerated] = useState(false);
  const [url, setUrl] = useState('');
  const [instanceId, setInstanceId] = useState(''); // Add state to store instanceId

  const handleGenerate = () => {
    if (!selectedContact) {
      alert('Please select a contact first!');
      return;
    }

    // Generate unique ID and URL
    const newInstanceId = `flow-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const generatedUrl = `${window.location.origin}/?flowInstance=${newInstanceId}`;
    
    console.log('🎯 Generating flow instance...');
    console.log('🎯 Instance ID:', newInstanceId);
    console.log('🎯 Forms to save:', flowForms);
    
    // Create Flow Instance record in storage using our generated ID
    const flowInstance = FlowInstanceService.createInstance({
      instanceId: newInstanceId, // Pass the ID so it uses the same one we put in the URL
      flowId: flowId || 'unknown-flow',
      flowName,
      contactId: selectedContact.id,
      contactName: selectedContact.name,
      forms: flowForms.map((form: any) => ({
        formId: form.formId,
        formTitle: form.formTitle,
      })),
    });
    
    console.log('✅ Flow instance created:', flowInstance);
    console.log('✅ Flow instance ID:', flowInstance.id);
    console.log('✅ Flow instance forms:', flowInstance.forms);
    
    // Save the custom flow name if provided
    if (customFlowName) {
      flowInstance.customFlowName = customFlowName;
    }
    
    // Update the flow instance with the URL
    flowInstance.uniqueUrl = generatedUrl;
    flowInstance.status = 'draft'; // Still in draft until email is sent
    FlowInstanceService.saveInstance(flowInstance);
    
    console.log('💾 Flow instance saved to localStorage');
    console.log('💾 Verifying save - retrieving instance:', FlowInstanceService.getInstanceById(newInstanceId));
    
    // Add action for URL generation
    FlowInstanceService.addAction(flowInstance.id, {
      actionType: 'flow_created',
      actor: 'admin',
      details: `Flow URL generated for ${selectedContact.name}`,
    });
    
    setUrl(generatedUrl);
    setIsGenerated(true);
    setInstanceId(newInstanceId); // Store the instanceId in state
    onUrlGenerated(flowInstance.id, generatedUrl);
    
    console.log('✅ Flow instance creation complete');
  };

  const handleCopy = () => {
    // Use fallback method directly since Clipboard API is blocked
    const textArea = document.createElement('textarea');
    textArea.value = url;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        console.log('URL copied to clipboard');
      }
    } catch (err) {
      console.error('Copy failed:', err);
    }
    document.body.removeChild(textArea);
  };

  return (
    <div>
      <h3 className="font-serif text-2xl text-slate-800 mb-2">Generate Unique URL</h3>
      <p className="text-slate-600 mb-6">
        Create a secure link for {selectedContactId ? 'the selected contact' : 'the client'} to access this flow
      </p>

      {!isGenerated ? (
        <div className="p-8 bg-[rgba(225,231,241,0.5)] rounded-2xl border border-slate-200 text-center">
          <p className="text-slate-700 mb-6">
            This will create a unique, secure URL that {selectedContactId ? 'the selected contact' : 'the client'} can use to complete the flow.
          </p>
          <button
            onClick={handleGenerate}
            className="px-6 py-3 bg-[#a89db0] text-white rounded-2xl font-medium hover:bg-[#9a8ea0] transition-all"
          >
            <LinkIcon className="w-4 h-4 inline-block mr-2" />
            Generate URL
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-6 bg-green-50 rounded-2xl border border-green-200">
            <div className="flex items-center gap-2 mb-3">
              <Check className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">URL Generated Successfully!</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-green-200 font-mono text-sm text-slate-700 break-all mb-3">{url}</div>
            <div className="flex gap-3">
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-white border border-green-300 text-green-700 rounded-xl font-medium hover:bg-green-50 transition-colors"
              >
                Copy URL
              </button>
              <button
                onClick={() => {
                  if (!instanceId) {
                    alert('Please generate a URL first!');
                    return;
                  }
                  
                  // Open preview in a new window so wizard state is preserved
                  window.open(`?flowInstance=${instanceId}&preview=true`, '_blank');
                }}
                className="px-4 py-2 bg-[#a89db0] text-white rounded-xl font-medium hover:bg-[#9a8ea0] transition-all flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Preview Client View
              </button>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200">
            <h4 className="font-medium text-slate-800 mb-2">Flow Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Flow Name:</span>
                <span className="font-medium text-slate-800">{flowName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Recipient:</span>
                <span className="font-medium text-slate-800">{selectedContactId ? 'the selected contact' : 'the client'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Number of Forms:</span>
                <span className="font-medium text-slate-800">{flowForms.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Step 5: Compose Email
function ComposeEmailStep({ flowName, selectedContactId, uniqueUrl, emailContent, onEmailChange, flowInstanceId, selectedContact, emailTemplate }: any) {
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

  // Use the custom email template if provided, otherwise use default
  const templateToUse = emailTemplate || defaultTemplate;
  
  // Replace template variables with actual values
  const populatedTemplate = templateToUse
    .replace(/\{\{contactName\}\}/g, selectedContact?.name || '[Name]')
    .replace(/\{\{flowUrl\}\}/g, uniqueUrl)
    .replace(/\{\{flowName\}\}/g, flowName);

  const [email, setEmail] = useState(emailContent || populatedTemplate);

  const handleCopyAndOpen = () => {
    // Mark flow as "sent" in the flow instance
    if (flowInstanceId) {
      FlowInstanceService.addAction(flowInstanceId, {
        actionType: 'flow_sent',
        actor: 'admin',
        details: `Flow email sent to ${selectedContact?.name || 'client'}`,
      });
      console.log('✅ Flow marked as sent');
    }
    
    // Copy email to clipboard using fallback method
    const textArea = document.createElement('textarea');
    textArea.value = email;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        console.log('Email copied to clipboard');
      }
    } catch (err) {
      console.error('Copy failed:', err);
    }
    document.body.removeChild(textArea);
    
    // Open Gmail compose with pre-filled content
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(selectedContact?.email || '')}&su=${encodeURIComponent(`Your ${flowName} - Next Steps`)}&body=${encodeURIComponent(email)}`;
    window.open(gmailUrl, '_blank');
  };

  return (
    <div>
      <h3 className="font-serif text-2xl text-slate-800 mb-2">Compose Email</h3>
      <p className="text-slate-600 mb-6">
        Customize the email message before sending to {selectedContactId ? 'the selected contact' : 'the client'}
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Email Template
          </label>
          <textarea
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              onEmailChange(e.target.value);
            }}
            className="w-full h-96 p-4 rounded-2xl border border-slate-200 focus:border-[#a8998f] focus:outline-none focus:ring-2 focus:ring-[#a8998f]/20 resize-none font-['Poppins']"
          />
        </div>

        <div className="p-4 bg-[rgba(225,231,241,0.5)] rounded-2xl border border-blue-200">
          <h4 className="font-medium text-[rgb(50,65,87)] mb-2">Email Details</h4>
          <div className="space-y-1 text-sm">
            <div className="flex gap-2">
              <span className="text-[rgb(50,65,87)]">To:</span>
              <span className="text-[rgb(50,65,87)]">{selectedContactId ? 'the selected contact' : ''}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-[rgb(50,65,87)]">Subject:</span>
              <span className="text-[rgb(50,65,87)]">Your {flowName} - Next Steps</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleCopyAndOpen}
          className="w-full px-6 py-3 bg-[#a89db0] text-white rounded-2xl font-medium hover:bg-[#9a8ea0] transition-all flex items-center justify-center gap-2"
        >
          <Mail className="w-5 h-5" />
          Copy Email & Open in Gmail
        </button>
      </div>
    </div>
  );
}

// Step 6: Complete
function CompleteStep({ selectedContactId, uniqueUrl }: any) {
  return (
    <div className="text-center py-12">
      <div className="w-20 h-20 rounded-full bg-[rgb(139,164,168)] flex items-center justify-center mx-auto mb-6">
        <Check className="w-10 h-10 text-white" />
      </div>
      
      <h3 className="font-serif text-3xl text-slate-800 mb-3">Flow Ready to Send!</h3>
      <p className="text-slate-600 mb-8 max-w-md mx-auto">
        Your flow has been prepared and the email is ready. Send it from Gmail, and you'll be notified when {selectedContactId ? 'the selected contact' : 'the client'} completes their submission.
      </p>

      <div className="max-w-lg mx-auto space-y-4">
        <div className="p-6 bg-[rgba(225,231,241,0.5)] rounded-2xl border border-slate-200">
          <h4 className="font-medium text-slate-800 mb-4">What happens next?</h4>
          <ul className="space-y-3 text-left">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#a89db0] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-medium">1</span>
              </div>
              <span className="text-slate-700">Client receives your email with the unique flow link</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#a89db0] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-medium">2</span>
              </div>
              <span className="text-slate-700">They complete the forms in the guided flow experience</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#a89db0] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-medium">3</span>
              </div>
              <span className="text-slate-700">You receive notifications in the app and via email</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#a89db0] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-medium">4</span>
              </div>
              <span className="text-slate-700">Review their submissions in your dashboard</span>
            </li>
          </ul>
        </div>

        <div className="p-4 bg-[rgba(225,231,241,0.5)] rounded-2xl border border-[#e1e7f1] text-left">
          <p className="text-sm text-[#324157]">
            <strong>Note:</strong> The flow link is unique to {selectedContactId ? 'the selected contact' : 'the client'} and can be used multiple times if they need to make updates.
          </p>
        </div>
      </div>
    </div>
  );
}