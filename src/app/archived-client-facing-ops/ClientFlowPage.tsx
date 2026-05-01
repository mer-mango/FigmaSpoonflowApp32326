import React, { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { ChevronRight, ChevronLeft, Check, FileText, Clock, AlertCircle, ArrowLeft, Edit2 } from 'lucide-react';
import { FlowInstanceService } from '../services/flowInstanceService';
import { DocumentFooter } from '../components/forms/shared/DocumentFooter';
import { ClientFormRenderer } from '../components/forms/ClientFormRenderer';
import { getDefaultTemplate } from '../components/forms/defaultTemplates';
import logo from 'figma:asset/c4b42eda92a6395a0d27891152702b904ad22088.png';

interface ClientFlowPageProps {
  instanceId: string;
}

export function ClientFlowPage({ instanceId }: ClientFlowPageProps) {
  const [flowInstance, setFlowInstance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requiredFieldNames, setRequiredFieldNames] = useState<string[]>([]);
  const [completedRequiredFields, setCompletedRequiredFields] = useState<Set<string>>(new Set());
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editingFormIndex, setEditingFormIndex] = useState<number | null>(null);
  const [editedFormTitle, setEditedFormTitle] = useState('');
  const [renderKey, setRenderKey] = useState(0);
  const [showContent, setShowContent] = useState(false);
  
  // Check if we're in preview mode
  const urlParams = new URLSearchParams(window.location.search);
  const isPreviewMode = urlParams.get('preview') === 'true';

  console.log('🎬 ClientFlowPage component mounted with instanceId:', instanceId);
  console.log('🎬 renderKey:', renderKey);

  useEffect(() => {
    // Load flow instance from storage
    const loadFlowInstance = () => {
      try {
        console.log('🔍 [1/10] Starting loadFlowInstance function');
        console.log('🔍 Loading flow instance:', instanceId);
        console.log('🔍 Current URL:', window.location.href);
        console.log('🔍 URL search params:', window.location.search);
        
        // Check if we have flow data encoded in the URL (for preview mode)
        const urlParams = new URLSearchParams(window.location.search);
        console.log('🔍 [2/10] Created URLSearchParams');
        
        const encodedFlowData = urlParams.get('flowData');
        
        console.log('🔍 [3/10] Encoded flow data exists:', !!encodedFlowData);
        
        if (encodedFlowData) {
          // Decode the flow data from the URL
          console.log('📦 [4/10] Found encoded flow data in URL, decoding...');
          try {
            console.log(' [5/10] About to parse and decode...');
            const decodedData = JSON.parse(atob(encodedFlowData));
            console.log(' [6/10] Decoded flow data:', decodedData);
            setFlowInstance(decodedData);
            console.log('✅ [7/10] Set flow instance state');
            
            // Extract required fields
            const allRequiredFields: string[] = [];
            console.log('✅ [8/10] About to iterate through', decodedData.forms.length, 'forms');
            
            decodedData.forms.forEach((form: any, formIndex: number) => {
              console.log(`✅ [8.${formIndex + 1}] Processing form:`, form.formId, form.formTitle);
              
              const templateKey = `form_template_${form.formId}`;
              const savedTemplate = localStorage.getItem(templateKey);
              
              console.log(`✅ [8.${formIndex + 1}.1] Template key:`, templateKey, 'Found in localStorage:', !!savedTemplate);
              
              let template;
              if (savedTemplate) {
                template = JSON.parse(savedTemplate);
                console.log(`✅ [8.${formIndex + 1}.2] Using saved template`);
              } else {
                console.log(`✅ [8.${formIndex + 1}.2] Getting default template for:`, form.formId);
                template = getDefaultTemplate(form.formId);
                console.log(`✅ [8.${formIndex + 1}.3] Got default template`);
              }
              
              // Extract required field names
              console.log(`✅ [8.${formIndex + 1}.4] Extracting required fields from`, template.sections.length, 'sections');
              template.sections.forEach((section: any, sectionIndex: number) => {
                section.fields.forEach((field: any, fieldIndex: number) => {
                  if (field.required) {
                    allRequiredFields.push(field.name);
                    console.log(`✅ [8.${formIndex + 1}.5.${sectionIndex}.${fieldIndex}] Added required field:`, field.name);
                  }
                });
              });
            });
            
            console.log('✅ [9/10] All required fields extracted:', allRequiredFields);
            setRequiredFieldNames(allRequiredFields);
            setLoading(false);
            
            // Force immediate DOM manipulation to trigger browser paint
            setTimeout(() => {
              const root = document.getElementById('root');
              if (root) {
                root.style.opacity = '0.9999';
                setTimeout(() => {
                  root.style.opacity = '1';
                }, 0);
              }
            }, 0);
            
            console.log('✅ [10/10] Loading complete!');
            return;
          } catch (decodeError) {
            console.error('❌ Error decoding flow data:', decodeError);
            // Fall through to try loading from localStorage
          }
        }
        
        // Try loading from localStorage
        console.log('📦 All instances in storage:', FlowInstanceService.getAllInstances());
        
        const instance = FlowInstanceService.getInstanceById(instanceId);
        console.log('📦 Flow instance loaded:', instance);
        
        if (!instance) {
          console.log('❌ Flow instance not found');
          console.log('❌ Looking for instanceId:', instanceId);
          console.log('❌ Available instances:', FlowInstanceService.getAllInstances().map(i => i.id));
          setError('Flow not found. Please check your link or contact the sender.');
          setLoading(false);
          return;
        }

        console.log('✅ Setting flow instance state');
        setFlowInstance(instance);
        
        // Extract all required field names from all forms in the flow
        const allRequiredFields: string[] = [];
        instance.forms.forEach((form: any) => {
          const templateKey = `form_template_${form.formId}`;
          const savedTemplate = localStorage.getItem(templateKey);
          
          let template;
          if (savedTemplate) {
            template = JSON.parse(savedTemplate);
          } else {
            template = getDefaultTemplate(form.formId);
          }
          
          // Extract required field names
          template.sections.forEach((section: any) => {
            section.fields.forEach((field: any) => {
              if (field.required) {
                allRequiredFields.push(field.name);
              }
            });
          });
        });
        
        setRequiredFieldNames(allRequiredFields);
        console.log('📋 Required fields:', allRequiredFields);
        
        setLoading(false);
        
        // Track that client viewed the flow (only if not in preview mode)
        if (!isPreviewMode) {
          FlowInstanceService.addAction(instanceId, {
            actionType: 'url_opened',
            actor: 'client',
            details: 'Client opened the flow',
          });
        }
      } catch (err) {
        console.error('❌ Error loading flow instance:', err);
        setError('Unable to load flow. Please try again later.');
        setLoading(false);
      }
    };

    loadFlowInstance();
  }, [instanceId, isPreviewMode]);

  const handleInputChange = (fieldName: string, value: any) => {
    setFormValues(prev => ({ ...prev, [fieldName]: value }));
    
    // Track completed required fields
    const isComplete = value !== '' && value !== null && value !== undefined;
    const isRequiredField = requiredFieldNames.includes(fieldName);
    
    if (isRequiredField) {
      setCompletedRequiredFields(prev => {
        const newSet = new Set(prev);
        if (isComplete) {
          newSet.add(fieldName);
        } else {
          newSet.delete(fieldName);
        }
        return newSet;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Save form data to flow instance
      const instance = FlowInstanceService.getInstanceById(instanceId);
      if (instance) {
        instance.formData = formValues;
        instance.status = 'completed';
        instance.completedAt = new Date().toISOString();
        FlowInstanceService.saveInstance(instance);
      }
      
      // Track submission
      FlowInstanceService.addAction(instanceId, {
        actionType: 'flow_completed',
        actor: 'client',
        details: 'Client submitted the flow',
      });

      // Show success message
      alert('Thank you! Your submission has been received. You can now close this page.');
      
    } catch (err) {
      console.error('Error submitting flow:', err);
      alert('There was an error submitting your response. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get display name - use custom name if set, otherwise use template name
  const displayName = flowInstance?.customFlowName || flowInstance?.flowName || 'Loading...';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5fafb] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2f829b] mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your flow...</p>
        </div>
      </div>
    );
  }

  if (error || !flowInstance) {
    return (
      <div className="min-h-screen bg-[#f5fafb] flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="font-serif text-2xl text-slate-800 mb-2">Unable to Load Flow</h1>
          <p className="text-slate-600">{error || 'Flow not found. Please check your link.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5fafb] relative" style={{ animation: 'fadeIn 0.3s ease-in' }}>
      {/* Header with Logo */}
      <div className="bg-[#f5fafb] py-2 sticky top-0 z-10 border-b border-[#ddecf0]">
        <div className="max-w-4xl mx-auto px-6">
          <img src={logo} alt="Empower Health Strategies" className="h-20 w-auto object-contain" />
        </div>
      </div>

      {/* Title & Subtitle - Sticky below header */}
      <div className="bg-[#f5fafb] sticky top-[84px] z-10 border-b border-[#ddecf0]">
        <div className="max-w-4xl mx-auto px-6 py-6">
          {/* Editable Title */}
          {isEditingTitle ? (
            <div className="flex items-center gap-3 mb-3">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={() => {
                  // Save the edited title to the flow instance
                  const instance = FlowInstanceService.getInstanceById(instanceId);
                  if (instance) {
                    instance.customFlowName = editedTitle;
                    FlowInstanceService.saveInstance(instance);
                    setFlowInstance(instance);
                  }
                  setIsEditingTitle(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                  }
                }}
                className="font-serif text-4xl text-[#034863] border-2 border-[#2f829b] rounded-xl px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[#2f829b]/20 flex-1"
                autoFocus
              />
              <button
                onClick={() => setIsEditingTitle(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 mb-3 group">
              <h1 className="font-serif text-4xl text-[#034863]">{displayName}</h1>
              {isPreviewMode && (
                <button
                  onClick={() => {
                    setEditedTitle(displayName);
                    setIsEditingTitle(true);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-2 hover:bg-[#2f829b]/10 rounded-lg transition-all"
                  title="Edit title"
                >
                  <Edit2 className="w-5 h-5 text-[#2f829b]" />
                </button>
              )}
            </div>
          )}
          <p className="text-slate-600">
            Please complete the information below. All fields are required unless marked as optional.
          </p>
        </div>
      </div>

      {/* Progress Bar - Sticky below title/subtitle */}
      <div className="bg-[#f5fafb] border-b border-[#ddecf0] sticky top-[192px] z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          {/* Back to Wizard button - Show in preview mode OR when there's navigation history */}
          {(isPreviewMode || window.history.length > 1 || window.opener) && (
            <button
              onClick={() => {
                // If we're in preview mode, go back in browser history
                if (isPreviewMode) {
                  // Use browser back to return to wizard
                  window.history.back();
                  return;
                }
                
                // If this window was opened from the wizard (has opener), close it
                // Otherwise, go back in history
                if (window.opener) {
                  window.close();
                } else if (window.history.length > 1) {
                  window.history.back();
                } else {
                  // If no history, go to home
                  window.location.href = '/';
                }
              }}
              className="mb-4 flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#2f829b] text-[#2f829b] rounded-xl hover:bg-[#2f829b]/5 transition-all font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              {window.opener ? 'Close Preview' : (isPreviewMode ? 'Back to Wizard' : 'Back')}
            </button>
          )}
          
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#2f829b]">
              {completedRequiredFields.size}/{requiredFieldNames.length} Complete
            </span>
          </div>
          <div className="w-full h-2 bg-[#ddecf0] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#2f829b] transition-all duration-300 ease-out rounded-full"
              style={{ width: `${(completedRequiredFields.size / requiredFieldNames.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content - Single Unified Form */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Unified Form Content */}
          <div className="bg-white rounded-2xl border border-[#ddecf0] p-8">
            {/* Render all forms from the flow instance */}
            {flowInstance.forms.map((form: any, index: number) => (
              <div key={index} className={index > 0 ? 'mt-12 pt-12 border-t-2 border-[#ddecf0]' : ''}>
                {/* Optional: Show form title as section divider for multi-form flows */}
                {flowInstance.forms.length > 1 && (
                  <div className="mb-8">
                    {editingFormIndex === index ? (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#2f829b]/10 text-[#2f829b] flex items-center justify-center font-medium flex-shrink-0">
                          {index + 1}
                        </div>
                        <input
                          type="text"
                          value={editedFormTitle}
                          onChange={(e) => setEditedFormTitle(e.target.value)}
                          onBlur={() => {
                            // Save the edited form title to the flow instance
                            const instance = FlowInstanceService.getInstanceById(instanceId);
                            if (instance) {
                              instance.forms[index].formTitle = editedFormTitle;
                              FlowInstanceService.saveInstance(instance);
                              setFlowInstance(instance);
                            }
                            setEditingFormIndex(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.currentTarget.blur();
                            }
                          }}
                          className="font-['Lora'] text-2xl text-[#034863] border-2 border-[#2f829b] rounded-xl px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[#2f829b]/20 flex-1"
                          autoFocus
                        />
                        <button
                          onClick={() => setEditingFormIndex(null)}
                          className="text-slate-400 hover:text-slate-600 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 group">
                        <div className="w-8 h-8 rounded-full bg-[#2f829b]/10 text-[#2f829b] flex items-center justify-center font-medium">
                          {index + 1}
                        </div>
                        <h2 className="font-['Lora'] text-2xl text-[#034863]">{form.formTitle}</h2>
                        {isPreviewMode && (
                          <button
                            onClick={() => {
                              setEditedFormTitle(form.formTitle);
                              setEditingFormIndex(index);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-2 hover:bg-[#2f829b]/10 rounded-lg transition-all"
                            title="Edit form title"
                          >
                            <Edit2 className="w-4 h-4 text-[#2f829b]" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Render the actual form */}
                <ClientFormRenderer
                  formId={form.formId}
                  formTitle={form.formTitle}
                  contactData={{
                    name: flowInstance.contactName,
                    email: '', // We don't have email in the mock contacts
                    company: ''
                  }}
                  onFieldChange={handleInputChange}
                  formValues={formValues}
                />
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="space-y-4">
            {/* Completion Stats */}
            {completedRequiredFields.size > 0 && (
              <div className="p-4 bg-[#f5fafb] rounded-2xl border border-[#ddecf0]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-[#2f829b]" />
                    <span className="text-sm text-[#034863] font-medium">
                      {completedRequiredFields.size} field{completedRequiredFields.size !== 1 ? 's' : ''} completed
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    Keep going! 🎉
                  </span>
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-8 py-3 rounded-2xl font-medium transition-all ${
                  isSubmitting
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-[#6b2358] text-white hover:shadow-lg hover:bg-[#5a1d48]'
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="bg-white py-8 mt-12">
        <div className="max-w-4xl mx-auto px-6">
          <DocumentFooter />
        </div>
      </div>
    </div>
  );
}
