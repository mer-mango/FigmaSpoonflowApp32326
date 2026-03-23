import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Eye, Save, Plus, Trash2, Package } from 'lucide-react';
import { Service } from '../../../App';

interface LicenseRight {
  id: string;
  text: string;
}

interface LicenseTermSection {
  id: string;
  title: string;
  content: string;
}

interface LicensingFormProps {
  onPreview: (data: any) => void;
  onBack: () => void;
  onSave?: () => void;
  backButtonLabel?: string;
  initialData?: any;
  services?: Service[];
  linkedService?: Service;
}

export function LicensingForm({ onPreview, onBack, onSave, backButtonLabel = 'Back to Flow Wizard', initialData, services = [], linkedService }: LicensingFormProps) {
  // Agreement header
  const [agreementTitle, setAgreementTitle] = useState('Licensing Agreement');
  const [agreementDate, setAgreementDate] = useState('2026-01-01');
  
  // Licensee information
  const [licenseeName, setLicenseeName] = useState('');
  const [licenseeOrganization, setLicenseeOrganization] = useState('');
  const [licenseeEmail, setLicenseeEmail] = useState('');

  // License details
  const [licenseType, setLicenseType] = useState('Enterprise License');
  const [licenseScope, setLicenseScope] = useState('Non-exclusive license to use proprietary methodologies, frameworks, and materials');
  const [territory, setTerritory] = useState('United States');
  const [duration, setDuration] = useState('12 months from effective date');
  const [licenseFee, setLicenseFee] = useState('$25,000 annually');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [serviceName, setServiceName] = useState('');

  // Usage rights
  const [usageRights, setUsageRights] = useState<LicenseRight[]>([
    { id: 'r1', text: 'Right to use licensed materials for internal training and education' },
    { id: 'r2', text: 'Right to adapt materials for organization-specific use cases' },
    { id: 'r3', text: 'Right to make copies for authorized users within the organization' },
    { id: 'r4', text: 'Access to updated versions and materials during license term' }
  ]);

  // Restrictions
  const [restrictions, setRestrictions] = useState<LicenseRight[]>([
    { id: 'res1', text: 'No redistribution or resale of licensed materials' },
    { id: 'res2', text: 'No modification of branding or attribution' },
    { id: 'res3', text: 'No sublicensing to third parties without written consent' },
    { id: 'res4', text: 'Materials must not be used for competitive purposes' }
  ]);

  // Terms sections
  const [termsSections, setTermsSections] = useState<LicenseTermSection[]>([
    {
      id: 't1',
      title: 'Payment Terms',
      content: 'License fee is payable annually in advance. Renewal fees are subject to adjustment with 60 days notice. Late payments incur a 1.5% monthly interest charge.'
    },
    {
      id: 't2',
      title: 'Intellectual Property',
      content: 'All intellectual property rights remain with Empower Health Strategies. Licensee acknowledges that no ownership rights are transferred under this agreement.'
    },
    {
      id: 't3',
      title: 'Confidentiality',
      content: 'Licensed materials contain proprietary information and must be treated as confidential. Disclosure is limited to authorized personnel with a legitimate need to access.'
    }
  ]);

  const addUsageRight = () => {
    setUsageRights([...usageRights, { id: `r-${Date.now()}`, text: 'New usage right' }]);
  };

  const removeUsageRight = (id: string) => {
    setUsageRights(usageRights.filter(r => r.id !== id));
  };

  const updateUsageRight = (id: string, text: string) => {
    setUsageRights(usageRights.map(r => r.id === id ? { ...r, text } : r));
  };

  const addRestriction = () => {
    setRestrictions([...restrictions, { id: `res-${Date.now()}`, text: 'New restriction' }]);
  };

  const removeRestriction = (id: string) => {
    setRestrictions(restrictions.filter(r => r.id !== id));
  };

  const updateRestriction = (id: string, text: string) => {
    setRestrictions(restrictions.map(r => r.id === id ? { ...r, text } : r));
  };

  const addTermsSection = () => {
    setTermsSections([...termsSections, { id: `t-${Date.now()}`, title: 'New Term', content: '' }]);
  };

  const removeTermsSection = (id: string) => {
    setTermsSections(termsSections.filter(t => t.id !== id));
  };

  const updateTermsSection = (id: string, field: 'title' | 'content', value: string) => {
    setTermsSections(termsSections.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    ));
  };

  const handlePreview = () => {
    const formData = {
      agreementTitle,
      agreementDate,
      licenseeName,
      licenseeOrganization,
      licenseeEmail,
      licenseType,
      licenseScope,
      territory,
      duration,
      licenseFee,
      serviceName: serviceName,
      selectedServiceId,
      usageRights,
      restrictions,
      termsSections
    };

    // Save to localStorage before previewing
    try {
      localStorage.setItem('licensing_form_draft', JSON.stringify(formData));
      console.log('✅ Licensing form data saved to localStorage');
    } catch (error) {
      console.error('Failed to save form data:', error);
    }

    onPreview(formData);
  };

  const loadServiceFromSettings = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      setSelectedServiceId(serviceId);
      setServiceName(service.name);
      setLicenseType(service.name);
      setLicenseScope(service.description || 'Non-exclusive license to use proprietary methodologies, frameworks, and materials');
      
      // Handle price - it might be a string or number
      const priceValue = typeof service.price === 'number' 
        ? service.price.toFixed(2) 
        : service.price;
      setLicenseFee(`$${priceValue} ${service.billingCycle}`);
      
      // Set duration based on billing cycle
      if (service.billingCycle === 'monthly') {
        setDuration('30 days from effective date');
      } else if (service.billingCycle === 'annually') {
        setDuration('12 months from effective date');
      } else if (service.billingCycle === 'one-time') {
        setDuration('Perpetual license');
      }
    }
  };

  useEffect(() => {
    console.log('🔍 Licensing Form initialData changed:', initialData);
    
    // If there's initialData, we're coming back from preview - restore localStorage
    if (initialData) {
      // Try to restore from localStorage first (preview return)
      try {
        const savedData = localStorage.getItem('licensing_form_draft');
        if (savedData) {
          const parsed = JSON.parse(savedData);
          console.log('📦 Found saved Licensing data in localStorage, restoring...');
          setAgreementTitle(parsed.agreementTitle || 'Licensing Agreement');
          setAgreementDate(parsed.agreementDate || '2026-01-01');
          setLicenseeName(parsed.licenseeName || '');
          setLicenseeOrganization(parsed.licenseeOrganization || '');
          setLicenseeEmail(parsed.licenseeEmail || '');
          setLicenseType(parsed.licenseType || '');
          setLicenseScope(parsed.licenseScope || '');
          setTerritory(parsed.territory || '');
          setDuration(parsed.duration || '');
          setLicenseFee(parsed.licenseFee || '');
          setServiceName(parsed.serviceName || '');
          setSelectedServiceId(parsed.selectedServiceId || '');
          if (parsed.usageRights) setUsageRights(parsed.usageRights);
          if (parsed.restrictions) setRestrictions(parsed.restrictions);
          if (parsed.termsSections) setTermsSections(parsed.termsSections);
          return;
        }
      } catch (error) {
        console.error('Failed to restore from localStorage:', error);
      }
      
      // If no localStorage, populate contact information from wizard
      if (initialData.name) setLicenseeName(initialData.name);
      if (initialData.company) setLicenseeOrganization(initialData.company);
      if (initialData.email) setLicenseeEmail(initialData.email);
      
      // If returning from preview, restore all form state
      if (initialData.agreementTitle) {
        setAgreementTitle(initialData.agreementTitle);
        setAgreementDate(initialData.agreementDate);
        setLicenseType(initialData.licenseType);
        setLicenseScope(initialData.licenseScope);
        setTerritory(initialData.territory);
        setDuration(initialData.duration);
        setLicenseFee(initialData.licenseFee);
        setUsageRights(initialData.usageRights);
        setRestrictions(initialData.restrictions);
        setTermsSections(initialData.termsSections);
      }
    } else {
      // No initialData means fresh start - clear localStorage
      console.log('🆕 Starting fresh Licensing - clearing localStorage draft');
      localStorage.removeItem('licensing_form_draft');
    }
  }, [initialData]);

  return (
    <div className="min-h-screen bg-[#f5fafb]">
      {/* Header */}
      <div className="w-full bg-white border-b border-[#ddecf0] py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-['Lora'] text-4xl text-[#034863] mb-1">Licensing Terms Editor</h1>
              <p className="font-['Poppins'] text-lg text-[#2f829b] text-[20px]">Define licensing terms and IP agreements</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={onBack}
                variant="outline"
                className="border-2 border-[#034863] text-[#034863] hover:bg-[#f5fafb] font-['Poppins'] rounded-lg"
              >
                ← {backButtonLabel}
              </Button>
              {onSave && (
                <Button
                  onClick={onSave}
                  className="bg-[#2f829b] hover:bg-[#2f829b]/90 text-white font-['Poppins'] rounded-lg"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save & Return
                </Button>
              )}
              <Button
                onClick={handlePreview}
                className="bg-[#6b2358] hover:bg-[#6b2358]/90 text-white font-['Poppins'] rounded-lg"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview Agreement
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

          {/* Agreement Header */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <h2 className="font-['Lora'] text-3xl text-[#034863] mb-6">Agreement Information</h2>
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
                  Effective Date
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

          {/* Licensee Information */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <h2 className="font-['Lora'] text-3xl text-[#034863] mb-6">Licensee Information</h2>
            <div className="space-y-6">
              <div>
                <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                  Licensee Name
                </label>
                <Input
                  value={licenseeName}
                  onChange={(e) => setLicenseeName(e.target.value)}
                  placeholder="Full name of licensee"
                  className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                />
              </div>
              <div>
                <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                  Organization
                </label>
                <Input
                  value={licenseeOrganization}
                  onChange={(e) => setLicenseeOrganization(e.target.value)}
                  placeholder="Organization name"
                  className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                />
              </div>
              <div>
                <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={licenseeEmail}
                  onChange={(e) => setLicenseeEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="font-['Poppins'] text-[18px]"
                />
              </div>
            </div>
          </div>

          {/* Service Selection */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-['Lora'] text-3xl text-[#034863]">Service</h2>
              {services.length > 0 && (
                <div className="flex items-center gap-3">
                  <select
                    value={selectedServiceId}
                    onChange={(e) => loadServiceFromSettings(e.target.value)}
                    className="px-4 py-2 border-2 border-[#2f829b] rounded-lg font-['Poppins'] text-[#034863] bg-white hover:bg-[#f5fafb] transition-colors"
                  >
                    <option value="">Select from Services...</option>
                    {services.map(service => (
                      <option key={service.id} value={service.id}>
                        {service.name} - ${service.price} {service.billingCycle}
                      </option>
                    ))}
                  </select>
                  <Button
                    onClick={() => {
                      if (selectedServiceId) {
                        loadServiceFromSettings(selectedServiceId);
                      }
                    }}
                    disabled={!selectedServiceId}
                    className="bg-[#2f829b] hover:bg-[#034863] text-white font-['Poppins'] rounded-lg"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Load Service
                  </Button>
                </div>
              )}
            </div>
            <div>
              <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                Service Name
              </label>
              <Input
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="Enter service name or select from dropdown above"
                className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
              />
              {serviceName && (
                <div className="mt-3 bg-[#2f829b]/10 border-l-4 border-[#2f829b] p-3 rounded">
                  <p className="font-['Poppins'] text-sm text-[#034863]">
                    <Package className="w-4 h-4 inline mr-2 text-[#2f829b]" />
                    Licensing agreement linked to: <span className="font-medium text-[#2f829b]">{serviceName}</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* License Details */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <h2 className="font-['Lora'] text-3xl text-[#034863] mb-6">License Details</h2>
            <div className="space-y-6">
              <div>
                <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                  License Type
                </label>
                <Input
                  value={licenseType}
                  onChange={(e) => setLicenseType(e.target.value)}
                  className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                />
              </div>
              <div>
                <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                  License Scope
                </label>
                <Textarea
                  value={licenseScope}
                  onChange={(e) => setLicenseScope(e.target.value)}
                  rows={3}
                  className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                    Territory
                  </label>
                  <Input
                    value={territory}
                    onChange={(e) => setTerritory(e.target.value)}
                    className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                  />
                </div>
                <div>
                  <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                    Duration
                  </label>
                  <Input
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                  />
                </div>
                <div>
                  <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                    License Fee
                  </label>
                  <Input
                    value={licenseFee}
                    onChange={(e) => setLicenseFee(e.target.value)}
                    className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Usage Rights */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-['Lora'] text-3xl text-[#034863]">Usage Rights</h2>
              <Button
                onClick={addUsageRight}
                className="bg-[#2f829b] hover:bg-[#034863] text-white font-['Poppins'] rounded-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Right
              </Button>
            </div>
            <div className="space-y-3">
              {usageRights.map((right) => (
                <div key={right.id} className="flex items-center gap-2">
                  <Input
                    value={right.text}
                    onChange={(e) => updateUsageRight(right.id, e.target.value)}
                    className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                  />
                  <Button
                    onClick={() => removeUsageRight(right.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Restrictions */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-['Lora'] text-3xl text-[#034863]">Restrictions</h2>
              <Button
                onClick={addRestriction}
                className="bg-[#2f829b] hover:bg-[#034863] text-white font-['Poppins'] rounded-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Restriction
              </Button>
            </div>
            <div className="space-y-3">
              {restrictions.map((restriction) => (
                <div key={restriction.id} className="flex items-center gap-2">
                  <Input
                    value={restriction.text}
                    onChange={(e) => updateRestriction(restriction.id, e.target.value)}
                    className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                  />
                  <Button
                    onClick={() => removeRestriction(restriction.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Terms & Conditions Sections */}
          {termsSections.map((section) => (
            <div key={section.id} className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
              <div className="flex items-center justify-between mb-6">
                <Input
                  value={section.title}
                  onChange={(e) => updateTermsSection(section.id, 'title', e.target.value)}
                  className="font-['Lora'] text-3xl text-[#034863] flex-1 mr-4 text-[30px]"
                  placeholder="Section title..."
                />
                <Button
                  onClick={() => removeTermsSection(section.id)}
                  variant="outline"
                  className="border-2 border-red-500 text-red-500 hover:bg-red-50 font-['Poppins'] rounded-lg"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </div>
              <Textarea
                value={section.content}
                onChange={(e) => updateTermsSection(section.id, 'content', e.target.value)}
                rows={4}
                className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                placeholder="Section content..."
              />
            </div>
          ))}

          {/* Add Terms Section Button */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={addTermsSection}
              className="bg-[#6b2358] hover:bg-[#6b2358]/90 text-white font-['Poppins'] text-xl rounded-lg px-12 py-6"
            >
              <Plus className="w-6 h-6 mr-2" />
              Add Terms Section
            </Button>
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
              Preview Agreement
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}