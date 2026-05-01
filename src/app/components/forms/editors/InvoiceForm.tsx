import React, { useState, useEffect } from 'react';
import { ArrowLeft, Eye, Plus, Trash2, Save } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Service } from '../../../App';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number | string;
  rate: number | string;
}

interface InvoiceFormProps {
  onPreview: (data: any) => void;
  onBack: () => void;
  onSave?: () => void;
  backButtonLabel?: string;
  initialData?: any;
  services?: Service[];
  linkedService?: Service;
}

export function InvoiceForm({ onPreview, onBack, onSave, backButtonLabel = 'Back to Flow Wizard', initialData, services = [], linkedService }: InvoiceFormProps) {
  // Invoice header info
  const [invoiceNumber, setInvoiceNumber] = useState(initialData?.invoiceNumber || 'INV-2026-001');
  const [date, setInvoiceDate] = useState(initialData?.date || initialData?.invoiceDate || '2026-01-01');
  const [dueDate, setDueDate] = useState(initialData?.dueDate || '2026-01-31');

  // Client info
  const [clientCompany, setClientCompany] = useState(initialData?.clientName || initialData?.clientCompany || '');
  const [clientName, setClientName] = useState(initialData?.clientContact || initialData?.clientName || '');
  const [clientRole, setClientRole] = useState(initialData?.clientRole || '');
  const [clientEmail, setClientEmail] = useState(initialData?.clientEmail || '');
  const [clientPhone, setClientPhone] = useState(initialData?.clientPhone || '');
  const [clientAddress, setClientAddress] = useState(initialData?.clientAddress || '');

  // Display options
  const [showQuantityRate, setShowQuantityRate] = useState(() => {
    // Try to restore from localStorage first
    try {
      const savedData = localStorage.getItem('invoice_form_draft');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.showQuantityRate !== undefined) {
          return parsed.showQuantityRate;
        }
      }
    } catch (error) {
      console.error('Failed to restore showQuantityRate from localStorage:', error);
    }
    return initialData?.showQuantityRate ?? true;
  });

  // Line items - convert from lineItems format if needed
  const getInitialItems = () => {
    // If there's a linked service, use it as the first line item
    if (linkedService && !initialData) {
      const priceNumeric = parseFloat(linkedService.price.replace(/[^0-9.-]+/g, '')) || 0;
      return [{
        id: '1',
        description: linkedService.name,
        quantity: 1,
        rate: priceNumeric
      }];
    }
    
    if (initialData?.lineItems) {
      return initialData.lineItems.map((item: any) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        rate: item.unitPrice
      }));
    }
    if (initialData?.items) {
      return initialData.items;
    }
    return [
      { id: '1', description: 'Patient Experience Innovation Audit - Discovery Phase', quantity: 1, rate: 8500 },
      { id: '2', description: 'Stakeholder Interviews and Analysis (8 sessions)', quantity: 8, rate: 450 },
      { id: '3', description: 'Journey Mapping Workshop Facilitation', quantity: 1, rate: 3200 }
    ];
  };

  const [items, setItems] = useState<InvoiceItem[]>(getInitialItems());

  // Payment terms
  const [paymentTerms, setPaymentTerms] = useState(initialData?.paymentTerms || 'Please refer to your "Payment Terms" document. Payment is due within 14 days of invoice date. Late payments will incur a 5% monthly interest charge. Payment can be made via ACH transfer or credit card.');
  const [notes, setNotes] = useState(initialData?.notes || 'Thank you for partnering with Empower Health Strategies. We look forward to continuing our work together to transform patient experiences at your organization.');

  // Restore from localStorage
  useEffect(() => {
    console.log('🔍 Invoice Form initialData changed:', initialData);
    
    // If there's initialData, we're coming back from preview - restore localStorage
    if (initialData) {
      try {
        const savedData = localStorage.getItem('invoice_form_draft');
        if (savedData && !linkedService) { // Don't restore if there's a linked service
          const parsed = JSON.parse(savedData);
          console.log('📦 Found saved Invoice data in localStorage, restoring...');
          setInvoiceNumber(parsed.invoiceNumber || 'INV-2026-001');
          setInvoiceDate(parsed.date || '2026-01-01');
          setDueDate(parsed.dueDate || '2026-01-31');
          setClientCompany(parsed.clientName || '');
          setClientName(parsed.clientContact || '');
          setClientRole(parsed.clientRole || '');
          setClientEmail(parsed.clientEmail || '');
          setClientPhone(parsed.clientPhone || '');
          setClientAddress(parsed.clientAddress || '');
          if (parsed.items) setItems(parsed.items);
          setPaymentTerms(parsed.paymentTerms || '');
          setNotes(parsed.notes || '');
          if (parsed.showQuantityRate !== undefined) setShowQuantityRate(parsed.showQuantityRate);
          return;
        }
      } catch (error) {
        console.error('Failed to restore from localStorage:', error);
      }
    } else {
      // No initialData means fresh start - clear localStorage
      console.log('🆕 Starting fresh Invoice - clearing localStorage draft');
      localStorage.removeItem('invoice_form_draft');
    }
  }, [initialData, linkedService]);

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), description: '', quantity: 1, rate: 0 }]);
  };

  const addServiceAsItem = (service: Service) => {
    const priceNumeric = parseFloat(service.price.replace(/[^0-9.-]+/g, '')) || 0;
    setItems([...items, { 
      id: Date.now().toString(), 
      description: service.name, 
      quantity: 1, 
      rate: priceNumeric 
    }]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => {
      const qty = Number(item.quantity) || 0;
      const rt = Number(item.rate) || 0;
      return sum + (qty * rt);
    }, 0);
  };

  const handlePreview = () => {
    const lineItems = items.map(item => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.rate,
      amount: item.quantity * item.rate
    }));

    const subtotal = calculateSubtotal();
    const total = subtotal;

    const formData = {
      invoiceNumber,
      date,
      dueDate,
      clientName: clientCompany,
      clientContact: clientName,
      clientEmail,
      clientPhone,
      clientAddress,
      lineItems,
      items, // Save raw items for editing
      subtotal,
      total,
      notes,
      paymentTerms,
      showQuantityRate
    };

    // Save to localStorage before previewing
    try {
      localStorage.setItem('invoice_form_draft', JSON.stringify(formData));
      console.log('✅ Invoice form data saved to localStorage');
    } catch (error) {
      console.error('Failed to save form data:', error);
    }

    onPreview(formData);
  };

  const handleSave = () => {
    // Also update the preview when saving
    handlePreview();
    // Then call the onSave callback if provided
    if (onSave) {
      onSave();
    }
  };

  const handleSaveOnly = () => {
    // Update the preview data
    handlePreview();
    // Show success message
    alert('Invoice saved successfully! You can now preview the updated document.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5fafb] to-[#ddecf0] p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Service Linked Banner */}
        {linkedService && (
          <div className="mt-6 mb-4 p-4 bg-gradient-to-r from-[#2f829b]/10 to-[#6b2358]/10 border-2 border-[#2f829b]/30 rounded-xl">
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
        
        <div className="flex items-center justify-between mb-8 mt-6">
          <div>
            <h1 className="font-['Lora'] text-4xl text-[#034863] mb-1">Invoice Editor</h1>
            <p className="font-['Poppins'] text-lg text-[#2f829b] text-[20px]">Create professional invoices for your services</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={onBack}
              variant="outline"
              className="border-2 border-[#034863] text-[#034863] hover:bg-[#f5fafb] font-['Poppins'] rounded-lg"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              {backButtonLabel}
            </Button>
            {onSave && (
              <Button
                onClick={handleSave}
                className="bg-[#2f829b] hover:bg-[#2f829b]/90 text-white font-['Poppins'] rounded-lg"
              >
                <Save className="w-5 h-5 mr-2" />
                Save & Return
              </Button>
            )}
            <Button
              onClick={handlePreview}
              className="bg-[#6b2358] hover:bg-[#6b2358]/90 text-white font-['Poppins'] rounded-lg"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview Invoice
            </Button>
          </div>
        </div>
      </div>

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Invoice Information */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <h2 className="font-['Lora'] text-3xl text-[#034863] mb-6">Invoice Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                  Invoice Number
                </label>
                <Input
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                />
              </div>
              <div>
                <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                  Invoice Date
                </label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                />
              </div>
              <div>
                <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                  Due Date
                </label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                />
              </div>
            </div>
          </div>

          {/* Client Information */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <h2 className="font-['Lora'] text-3xl text-[#034863] mb-6">Bill To</h2>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                  Client Company
                </label>
                <Input
                  value={clientCompany}
                  onChange={(e) => setClientCompany(e.target.value)}
                  className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                />
              </div>
              <div>
                <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                  Client Name
                </label>
                <Input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                />
              </div>
              <div>
                <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                  Client Role
                </label>
                <Input
                  value={clientRole}
                  onChange={(e) => setClientRole(e.target.value)}
                  className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                />
              </div>
              <div>
                <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                  Client Email
                </label>
                <Input
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  type="email"
                  className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                />
              </div>
              <div>
                <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                  Client Phone
                </label>
                <Input
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  type="tel"
                  className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                />
              </div>
              <div>
                <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                  Client Address
                </label>
                <Input
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-['Lora'] text-3xl text-[#034863]">Services & Items</h2>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showQuantityRate}
                    onChange={(e) => setShowQuantityRate(e.target.checked)}
                    className="w-4 h-4 text-[#2f829b] border-[#ddecf0] rounded focus:ring-[#2f829b]"
                  />
                  <span className="font-['Poppins'] text-sm text-[#034863]">Show Quantity & Rate</span>
                </label>
                {services && services.filter(s => s.isActive).length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="font-['Poppins'] text-sm text-[#034863]">Quick add:</span>
                    <select
                      onChange={(e) => {
                        const service = services.find(s => s.id === e.target.value);
                        if (service) {
                          addServiceAsItem(service);
                          e.target.value = '';
                        }
                      }}
                      className="px-3 py-2 border border-[#ddecf0] rounded-lg text-sm bg-white"
                    >
                      <option value="">Select a service...</option>
                      {services.filter(s => s.isActive).map(service => (
                        <option key={service.id} value={service.id}>
                          {service.name} - {service.price}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <Button
                  onClick={addItem}
                  className="bg-[#2f829b] hover:bg-[#034863] text-white font-['Poppins'] rounded-lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Item
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="p-4 border-2 border-[#ddecf0] rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-4">
                      <div>
                        <label className="block font-['Poppins'] text-xs font-medium text-[#034863] mb-1 text-[20px]">
                          Description
                        </label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          placeholder="Service or item description"
                          className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                        />
                      </div>
                      {showQuantityRate ? (
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block font-['Poppins'] text-xs font-medium text-[#034863] mb-1">
                              Quantity
                            </label>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => {
                                const value = e.target.value;
                                updateItem(item.id, 'quantity', value === '' ? '' : parseFloat(value));
                              }}
                              className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                            />
                          </div>
                          <div>
                            <label className="block font-['Poppins'] text-xs font-medium text-[#034863] mb-1">
                              Rate ($)
                            </label>
                            <Input
                              type="number"
                              value={item.rate}
                              onChange={(e) => {
                                const value = e.target.value;
                                updateItem(item.id, 'rate', value === '' ? '' : parseFloat(value));
                              }}
                              className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                            />
                          </div>
                          <div>
                            <label className="block font-['Poppins'] text-xs font-medium text-[#034863] mb-1">
                              Amount
                            </label>
                            <div className="h-10 flex items-center font-['Poppins'] text-lg font-medium text-[#034863]">
                              ${((Number(item.quantity) || 0) * (Number(item.rate) || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="block font-['Poppins'] text-xs font-medium text-[#034863] mb-1">
                            Amount ($)
                          </label>
                          <Input
                            type="number"
                            value={item.quantity * item.rate}
                            onChange={(e) => {
                              const amount = parseFloat(e.target.value) || 0;
                              updateItem(item.id, 'rate', amount);
                              updateItem(item.id, 'quantity', 1);
                            }}
                            className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                          />
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => removeItem(item.id)}
                      variant="ghost"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t-2 border-[#ddecf0] flex justify-end">
              <div className="w-64">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-['Poppins'] text-lg text-[#034863] text-[20px]">Subtotal:</span>
                  <span className="font-['Poppins'] text-xl font-medium text-[#034863]">
                    ${calculateSubtotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-[#ddecf0]">
                  <span className="font-['Poppins'] text-2xl font-medium text-[#6b2358] text-[20px]">Total Due:</span>
                  <span className="font-['Poppins'] text-3xl font-medium text-[#6b2358] text-[24px]">
                    ${calculateSubtotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Terms */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <h2 className="font-['Lora'] text-3xl text-[#034863] mb-6">Payment Terms</h2>
            <Textarea
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              rows={4}
              className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
            />
          </div>

          {/* Notes */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <h2 className="font-['Lora'] text-3xl text-[#034863] mb-6">Notes</h2>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
              placeholder="Additional notes or thank you message..."
            />
          </div>

          {/* Bottom Navigation Buttons */}
          <div className="flex justify-end gap-3 pt-8">
            <Button
              onClick={onBack}
              variant="outline"
              className="border-2 border-[#034863] text-[#034863] hover:bg-[#f5fafb] font-['Poppins'] rounded-lg"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              {backButtonLabel}
            </Button>
            <Button
              onClick={handleSaveOnly}
              className="bg-[#2f829b] hover:bg-[#2f829b]/90 text-white font-['Poppins'] rounded-lg"
            >
              <Save className="w-5 h-5 mr-2" />
              Save
            </Button>
            <Button
              onClick={handlePreview}
              className="bg-[#6b2358] hover:bg-[#6b2358]/90 text-white font-['Poppins'] rounded-lg"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview Invoice
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}