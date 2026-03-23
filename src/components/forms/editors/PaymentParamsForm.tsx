import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Eye, Plus, Trash2, Save } from 'lucide-react';
import { Service } from '../../../App';

interface PaymentMilestone {
  id: string;
  description: string;
  dueDate: string;
  amount: number;
  percentage: number;
}

interface PaymentMethod {
  id: string;
  method: string;
  details: string;
}

interface PaymentParamsFormProps {
  onPreview: (data: any) => void;
  onBack: () => void;
  onSave?: () => void;
  backButtonLabel?: string;
  initialData?: any;
  services?: Service[];
  linkedService?: Service;
}

export function PaymentParamsForm({ onPreview, onBack, onSave, backButtonLabel = 'Back to Flow Wizard', initialData, services = [], linkedService }: PaymentParamsFormProps) {
  // Agreement header
  const [agreementTitle, setAgreementTitle] = useState('Payment Schedule & Terms');
  const [agreementDate, setAgreementDate] = useState('2026-01-01');
  
  // Project information
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [totalProjectValue, setTotalProjectValue] = useState(50000);

  // Payment milestones
  const [milestones, setMilestones] = useState<PaymentMilestone[]>([
    {
      id: 'm1',
      description: 'Initial deposit upon contract signing',
      dueDate: 'Upon signing',
      amount: 15000,
      percentage: 30
    },
    {
      id: 'm2',
      description: 'Completion of discovery and assessment phase',
      dueDate: '30 days after start',
      amount: 12500,
      percentage: 25
    },
    {
      id: 'm3',
      description: 'Delivery of strategic recommendations',
      dueDate: '60 days after start',
      amount: 12500,
      percentage: 25
    },
    {
      id: 'm4',
      description: 'Final implementation support and project completion',
      dueDate: '90 days after start',
      amount: 10000,
      percentage: 20
    }
  ]);

  // Payment methods
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: 'pm1',
      method: 'ACH/Wire Transfer',
      details: 'Bank details will be provided on invoice'
    },
    {
      id: 'pm3',
      method: 'Credit Card',
      details: 'Processing fee of 3% applies'
    }
  ]);

  // Terms and conditions
  const [paymentTerms, setPaymentTerms] = useState('Payment is due within 15 days of invoice date unless otherwise specified in milestone schedule. Late payments will incur a 1.5% monthly interest charge.');
  const [cancellationPolicy, setCancellationPolicy] = useState('Either party may terminate this agreement with 30 days written notice. Client is responsible for payment of work completed through the termination date.');
  const [additionalNotes, setAdditionalNotes] = useState('All fees are in USD. Travel expenses, if applicable, will be billed separately with prior approval.');

  // Update form fields when initialData changes (e.g., when returning from preview)
  useEffect(() => {
    console.log('PaymentParamsForm - initialData changed:', initialData);
    if (initialData) {
      if (initialData.clientName || initialData.clientContact || initialData.name) {
        const newClientName = initialData.clientName || initialData.clientContact || initialData.name || '';
        console.log('PaymentParamsForm - setting clientName to:', newClientName);
        setClientName(newClientName);
      }
      if (initialData.projectName !== undefined) {
        setProjectName(initialData.projectName);
      }
      if (initialData.totalProjectValue !== undefined) {
        setTotalProjectValue(initialData.totalProjectValue);
      }
      if (initialData.agreementTitle) {
        setAgreementTitle(initialData.agreementTitle);
      }
      if (initialData.agreementDate) {
        setAgreementDate(initialData.agreementDate);
      }
      if (initialData.milestones) {
        setMilestones(initialData.milestones);
      }
      if (initialData.paymentMethods) {
        setPaymentMethods(initialData.paymentMethods);
      }
      if (initialData.paymentTerms) {
        setPaymentTerms(initialData.paymentTerms);
      }
      if (initialData.cancellationPolicy) {
        setCancellationPolicy(initialData.cancellationPolicy);
      }
      if (initialData.additionalNotes) {
        setAdditionalNotes(initialData.additionalNotes);
      }
    }
  }, [initialData]);

  const addMilestone = () => {
    setMilestones([
      ...milestones,
      {
        id: `m-${Date.now()}`,
        description: 'New milestone',
        dueDate: '',
        amount: 0,
        percentage: 0
      }
    ]);
  };

  const removeMilestone = (id: string) => {
    setMilestones(milestones.filter(m => m.id !== id));
  };

  const updateMilestone = (id: string, field: keyof PaymentMilestone, value: any) => {
    setMilestones(milestones.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  const addPaymentMethod = () => {
    setPaymentMethods([
      ...paymentMethods,
      {
        id: `pm-${Date.now()}`,
        method: 'New payment method',
        details: ''
      }
    ]);
  };

  const removePaymentMethod = (id: string) => {
    setPaymentMethods(paymentMethods.filter(pm => pm.id !== id));
  };

  const updatePaymentMethod = (id: string, field: 'method' | 'details', value: string) => {
    setPaymentMethods(paymentMethods.map(pm => 
      pm.id === id ? { ...pm, [field]: value } : pm
    ));
  };

  const handlePreview = () => {
    onPreview({
      agreementTitle,
      agreementDate,
      projectName,
      clientName,
      totalProjectValue,
      milestones,
      paymentMethods,
      paymentTerms,
      cancellationPolicy,
      additionalNotes
    });
  };

  return (
    <div className="min-h-screen bg-[#f5fafb]">
      {/* Header */}
      <div className="w-full bg-white border-b border-[#ddecf0] py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <img 
            src="figma:asset/35c7e77331367a5f6eb867f11816801708628944.png" 
            alt="Empower Health Strategies"
            className="h-12 mb-4"
          />
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-['Lora'] text-4xl text-[#034863] mb-1">Payment Terms Editor</h1>
              <p className="font-['Poppins'] text-lg text-[#2f829b] text-[20px]">Establish payment schedules and terms</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={onBack}
                variant="outline"
                className="border-2 border-[#034863] text-[#034863] hover:bg-[#f5fafb] font-['Poppins'] rounded-lg"
              >
                ← {backButtonLabel}
              </Button>
              <Button
                onClick={handlePreview}
                className="bg-[#6b2358] hover:bg-[#6b2358]/90 text-white font-['Poppins'] rounded-lg"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview Payment Terms
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Service Linked Banner */}
          {linkedService && (
            <div className="p-4 bg-gradient-to-r from-[#2f829b]/10 to-[#6b2358]/10 border-2 border-[#2f829b]/30 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-[#2f829b] rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-['Poppins'] font-medium text-[#034863] text-lg">
                    🔗 Linked to Service
                  </h3>
                  <p className="font-['Poppins'] text-sm text-[#2f829b]">
                    {linkedService.name} • {linkedService.price} • {linkedService.duration}
                  </p>
                </div>
                <div className="px-3 py-1 bg-[#2f829b]/20 text-[#034863] rounded-full text-sm font-['Poppins'] font-medium">
                  Auto-populated
                </div>
              </div>
            </div>
          )}

          {/* Document Header */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <h2 className="font-['Lora'] text-3xl text-[#034863] mb-6">Document Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                  Agreement Title
                </label>
                <Input
                  value={agreementTitle}
                  onChange={(e) => setAgreementTitle(e.target.value)}
                  className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                />
              </div>
              <div>
                <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                  Date
                </label>
                <Input
                  type="date"
                  value={agreementDate}
                  onChange={(e) => setAgreementDate(e.target.value)}
                  className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                />
              </div>
            </div>
          </div>

          {/* Project Information */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <h2 className="font-['Lora'] text-3xl text-[#034863] mb-6">Project Information</h2>
            <div className="space-y-6">
              <div>
                <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                  Project Name
                </label>
                {services && services.filter(s => s.isActive).length > 0 ? (
                  <select
                    value={projectName}
                    onChange={(e) => {
                      setProjectName(e.target.value);
                      // Auto-populate total project value if service is selected
                      const service = services.find(s => s.name === e.target.value);
                      if (service && service.price) {
                        const priceNumeric = parseFloat(service.price.replace(/[^0-9.-]+/g, ''));
                        if (!isNaN(priceNumeric)) {
                          setTotalProjectValue(priceNumeric);
                        }
                      }
                    }}
                    className="w-full px-3 py-2 border border-[#ddecf0] focus:border-[#2f829b] focus:ring-[#2f829b] rounded-lg bg-white font-['Poppins'] text-[18px]"
                  >
                    <option value="">Select a service or type custom...</option>
                    {services.filter(s => s.isActive).map(service => (
                      <option key={service.id} value={service.name}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Enter project name"
                    className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                  />
                )}
                {services && services.filter(s => s.isActive).length > 0 && projectName && !services.some(s => s.name === projectName) && (
                  <p className="text-xs text-[#2f829b] mt-1">
                    💡 This is a custom project name. You can also select from your saved services in Settings.
                  </p>
                )}
              </div>
              <div>
                <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                  Client Name
                </label>
                <Input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Enter client name"
                  className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                />
              </div>
              <div>
                <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                  Total Project Value ($)
                </label>
                <Input
                  type="number"
                  value={totalProjectValue}
                  onChange={(e) => {
                    const value = e.target.value;
                    setTotalProjectValue(value === '' ? 0 : Number(value));
                  }}
                  className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                />
              </div>
            </div>
          </div>

          {/* Payment Milestones */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-['Lora'] text-3xl text-[#034863]">Payment Milestones</h2>
              <Button
                onClick={addMilestone}
                className="bg-[#2f829b] hover:bg-[#034863] text-white font-['Poppins'] rounded-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Milestone
              </Button>
            </div>
            <div className="space-y-6">
              {milestones.map((milestone, index) => (
                <div key={milestone.id} className="p-6 border-2 border-[#ddecf0] rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-['Poppins'] font-medium text-lg text-[#034863]">Milestone {index + 1}</h3>
                    <Button
                      onClick={() => removeMilestone(milestone.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                        Description
                      </label>
                      <Input
                        value={milestone.description}
                        onChange={(e) => updateMilestone(milestone.id, 'description', e.target.value)}
                        className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                        placeholder="Milestone description..."
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                          Due Date
                        </label>
                        <Input
                          value={milestone.dueDate}
                          onChange={(e) => updateMilestone(milestone.id, 'dueDate', e.target.value)}
                          className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                          placeholder="e.g., Upon signing"
                        />
                      </div>
                      <div>
                        <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                          Amount ($)
                        </label>
                        <Input
                          type="number"
                          value={milestone.amount}
                          onChange={(e) => {
                            const value = e.target.value;
                            updateMilestone(milestone.id, 'amount', value === '' ? 0 : Number(value));
                          }}
                          className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                        />
                      </div>
                      <div>
                        <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                          Percentage (%)
                        </label>
                        <Input
                          type="number"
                          value={milestone.percentage}
                          onChange={(e) => {
                            const value = e.target.value;
                            updateMilestone(milestone.id, 'percentage', value === '' ? 0 : Number(value));
                          }}
                          className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-['Lora'] text-3xl text-[#034863]">Accepted Payment Methods</h2>
              <Button
                onClick={addPaymentMethod}
                className="bg-[#2f829b] hover:bg-[#034863] text-white font-['Poppins'] rounded-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Method
              </Button>
            </div>
            <div className="space-y-4">
              {paymentMethods.map((pm) => (
                <div key={pm.id} className="p-4 border-2 border-[#ddecf0] rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-3">
                      <Input
                        value={pm.method}
                        onChange={(e) => updatePaymentMethod(pm.id, 'method', e.target.value)}
                        className="font-['Poppins'] font-medium text-[18px] text-[rgb(0,0,0)]"
                        placeholder="Payment method name..."
                      />
                      <Input
                        value={pm.details}
                        onChange={(e) => updatePaymentMethod(pm.id, 'details', e.target.value)}
                        className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                        placeholder="Additional details..."
                      />
                    </div>
                    <Button
                      onClick={() => removePaymentMethod(pm.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <h2 className="font-['Lora'] text-3xl text-[#034863] mb-6">Terms & Conditions</h2>
            <div className="space-y-6">
              <div>
                <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                  Payment Terms
                </label>
                <Textarea
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  rows={3}
                  className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                />
              </div>
              <div>
                <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                  Cancellation Policy
                </label>
                <Textarea
                  value={cancellationPolicy}
                  onChange={(e) => setCancellationPolicy(e.target.value)}
                  rows={3}
                  className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                />
              </div>
              <div>
                <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                  Additional Notes
                </label>
                <Textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  rows={3}
                  className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                />
              </div>
            </div>
          </div>

          {/* Bottom Navigation Buttons */}
          <div className="flex justify-end gap-3 pt-8">
            <Button
              onClick={onBack}
              variant="outline"
              className="border-2 border-[#034863] text-[#034863] hover:bg-[#f5fafb] font-['Poppins'] rounded-lg"
            >
              ← {backButtonLabel}
            </Button>
            <Button
              onClick={handlePreview}
              className="bg-[#6b2358] hover:bg-[#6b2358]/90 text-white font-['Poppins'] rounded-lg"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview Payment Terms
            </Button>
            {onSave && (
              <Button
                onClick={onSave}
                className="bg-[#034863] hover:bg-[#034863]/90 text-white font-['Poppins'] rounded-lg"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Payment Terms
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}