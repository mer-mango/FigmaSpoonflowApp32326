import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Eye, Save, Plus, Trash2, Copy, Package } from 'lucide-react';
import { Service } from '../../../App';

// Helper functions for date format conversion
const formatDateToMMDDYYYY = (dateStr: string): string => {
  if (!dateStr) return '';
  // If already in MM-DD-YYYY format, return as is
  if (dateStr.includes('-') && dateStr.split('-')[0].length === 2) return dateStr;
  // Convert from YYYY-MM-DD to MM-DD-YYYY
  const [year, month, day] = dateStr.split('-');
  return `${month}-${day}-${year}`;
};

const formatDateToYYYYMMDD = (dateStr: string): string => {
  if (!dateStr) return '';
  // If already in YYYY-MM-DD format, return as is
  if (dateStr.includes('-') && dateStr.split('-')[0].length === 4) return dateStr;
  // Convert from MM-DD-YYYY to YYYY-MM-DD
  const [month, day, year] = dateStr.split('-');
  return `${year}-${month}-${day}`;
};

interface ProjectOption {
  id: string;
  title: string;
  subtitle: string;
  projectDescription: string;
  scopeOfServices: string;
  deliverablesAndSuccess: string;
  timeline: string;
  rolesResponsibilities: string;
  communication: string;
  feesPaymentTerms: string;
  assumptions: string;
  inclusionsExclusions: string;
  risksConstraints: string;
  ipUsage: string;
  confidentiality: string;
}

interface SectionToggles {
  projectDescription: boolean;
  scopeOfServices: boolean;
  deliverablesAndSuccess: boolean;
  timeline: boolean;
  rolesResponsibilities: boolean;
  communication: boolean;
  feesPaymentTerms: boolean;
  assumptions: boolean;
  inclusionsExclusions: boolean;
  risksConstraints: boolean;
  ipUsage: boolean;
  confidentiality: boolean;
}

interface ScopeOfWorkMultipleOptionsFormProps {
  onPreview: (data: any) => void;
  onBack: () => void;
  onSave?: () => void;
  backButtonLabel?: string;
  initialData?: any;
  services?: Service[];
  linkedService?: Service;
}

export function ScopeOfWorkMultipleOptionsForm({ 
  onPreview, 
  onBack, 
  onSave, 
  backButtonLabel = 'Back to Flow Wizard',
  initialData,
  services = [],
  linkedService
}: ScopeOfWorkMultipleOptionsFormProps) {
  // Document header
  const [documentNumber, setDocumentNumber] = useState('SOW-2026-001');
  const [date, setDate] = useState('2026-01-01');
  const [engagementTitle, setEngagementTitle] = useState('Patient Experience Innovation Audit');
  
  // Client information
  const [clientName, setClientName] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  
  // Project overview (shared across all options)
  const [projectOverview, setProjectOverview] = useState('');
  
  // Project timeline
  const [startDate, setStartDate] = useState('01-15-2026');
  const [completionDate, setCompletionDate] = useState('04-30-2026');
  
  // Multiple project options
  const [projectOptions, setProjectOptions] = useState<ProjectOption[]>([
    {
      id: 'option-1',
      title: 'Comprehensive Package',
      subtitle: 'Full-service engagement with all deliverables',
      projectDescription: 'In-depth evaluation of all patient touchpoints, journey mapping, and development of an actionable strategic roadmap for experience transformation.',
      scopeOfServices: `• Patient Experience Innovation Audit Report (80-100 pages)
• Journey mapping for 3-5 key patient personas
• Competitive analysis and benchmarking study
• Strategic roadmap with 18-month implementation timeline
• Executive presentation deck
• 2 stakeholder workshops (leadership & frontline staff)`,
      deliverablesAndSuccess: `Deliverables:
• Comprehensive audit report
• Journey maps and persona profiles
• Strategic roadmap document
• Implementation toolkit

Success Criteria:
• Actionable recommendations delivered on time
• 95% stakeholder satisfaction rating
• Clear ROI projection for recommendations`,
      timeline: `Phase 1 (Weeks 1-4): Discovery & Audit
Phase 2 (Weeks 5-8): Analysis & Benchmarking
Phase 3 (Weeks 9-12): Strategy Development & Delivery`,
      rolesResponsibilities: `Client Responsibilities:
• Provide timely access to staff and data
• Assign internal project liaison
• Make patient satisfaction data available

Consultant Responsibilities:
• Lead all research and analysis activities
• Facilitate workshops and stakeholder sessions
• Deliver high-quality, actionable recommendations`,
      communication: `• Weekly progress updates via email
• Bi-weekly check-in calls (30 minutes)
• Shared project workspace for document collaboration
• 24-hour response time for urgent requests`,
      feesPaymentTerms: `Total Investment: $45,000

Payment Schedule:
• 50% ($22,500) - Upon contract signing
• 25% ($11,250) - Completion of Phase 2
• 25% ($11,250) - Final deliverable acceptance

Terms:
• Net 15 payment terms from invoice date
• Accepted methods: ACH, wire transfer, or check
• Late payments subject to 1.5% monthly interest`,
      assumptions: `• Client will provide access to necessary staff and data within agreed timelines
• Historical patient satisfaction data is available and accessible
• Key stakeholders are available for scheduled interviews and workshops
• Project scope will not expand beyond defined deliverables without formal change request`,
      inclusionsExclusions: `Inclusions:
• All research and analysis activities
• Workshop facilitation and materials
• Comprehensive documentation
• 30-day post-delivery support

Exclusions:
• Technical implementation of digital solutions
• Clinical protocol development
• Staff hiring and recruitment
• Ongoing project management beyond roadmap creation`,
      risksConstraints: `Risks:
• Stakeholder availability may impact timeline
• Data access limitations could affect analysis depth
• Organizational changes during engagement may require scope adjustment

Constraints:
• 12-week project timeline
• Budget limitations for external research resources
• Confidentiality requirements may limit benchmarking access`,
      ipUsage: `All deliverables, including reports, presentations, and strategic roadmaps, become the intellectual property of the Client upon final payment. Empower Health Strategies retains the right to use anonymized case study information for marketing purposes with prior client approval.`,
      confidentiality: `All client information, data, and materials will be kept strictly confidential. Empower Health Strategies will not disclose any proprietary information to third parties without written consent. Both parties agree to sign a separate Non-Disclosure Agreement if required.`
    },
    {
      id: 'option-2',
      title: 'Essential Package',
      subtitle: 'Core services with focused deliverables',
      projectDescription: 'Focused evaluation of key patient touchpoints and development of targeted improvement recommendations.',
      scopeOfServices: `• Patient Experience Audit Report (40-50 pages)
• Journey mapping for 2-3 key patient personas
• Targeted competitive analysis
• Strategic recommendations
• Executive summary presentation`,
      deliverablesAndSuccess: `Deliverables:
• Focused audit report
• Journey maps
• Strategic recommendations
• Executive summary

Success Criteria:
• Clear, actionable recommendations
• 90% stakeholder satisfaction rating
• Implementation roadmap clarity`,
      timeline: `Phase 1 (Weeks 1-3): Discovery & Audit
Phase 2 (Weeks 4-6): Analysis & Recommendations`,
      rolesResponsibilities: `Client Responsibilities:
• Provide timely access to staff and data
• Assign internal project liaison

Consultant Responsibilities:
• Lead all research and analysis activities
• Deliver high-quality recommendations`,
      communication: `• Bi-weekly progress updates via email
• Monthly check-in calls (30 minutes)
• Shared project workspace for document collaboration`,
      feesPaymentTerms: `Total Investment: $25,000

Payment Schedule:
• 50% ($12,500) - Upon contract signing
• 50% ($12,500) - Final deliverable acceptance

Terms:
• Net 15 payment terms from invoice date
• Accepted methods: ACH, wire transfer, or check
• Late payments subject to 1.5% monthly interest`,
      assumptions: `• Client will provide access to necessary staff and data within agreed timelines
• Key stakeholders are available for scheduled interviews
• Project scope will not expand beyond defined deliverables without formal change request`,
      inclusionsExclusions: `Inclusions:
• All research and analysis activities
• Comprehensive documentation
• 15-day post-delivery support

Exclusions:
• Technical implementation of digital solutions
• Clinical protocol development
• Staff hiring and recruitment
• Ongoing project management`,
      risksConstraints: `Risks:
• Stakeholder availability may impact timeline
• Data access limitations could affect analysis depth

Constraints:
• 6-week project timeline
• Budget limitations for external research resources`,
      ipUsage: `All deliverables, including reports and presentations, become the intellectual property of the Client upon final payment. Empower Health Strategies retains the right to use anonymized case study information for marketing purposes with prior client approval.`,
      confidentiality: `All client information, data, and materials will be kept strictly confidential. Empower Health Strategies will not disclose any proprietary information to third parties without written consent. Both parties agree to sign a separate Non-Disclosure Agreement if required.`
    }
  ]);

  const [activeOptionIndex, setActiveOptionIndex] = useState(0);
  
  // Section toggles
  const [enabledSections, setEnabledSections] = useState<SectionToggles>({
    projectDescription: true,
    scopeOfServices: true,
    deliverablesAndSuccess: true,
    timeline: true,
    rolesResponsibilities: true,
    communication: true,
    feesPaymentTerms: true,
    assumptions: true,
    inclusionsExclusions: true,
    risksConstraints: true,
    ipUsage: true,
    confidentiality: true,
  });

  const handlePreview = () => {
    const formData = {
      documentNumber,
      date,
      engagementTitle,
      clientName,
      clientContact,
      clientEmail,
      clientPhone,
      projectOverview,
      startDate,
      completionDate,
      projectOptions,
      enabledSections
    };

    // Save to localStorage before previewing
    try {
      localStorage.setItem('sow_multiple_options_draft', JSON.stringify(formData));
      console.log('✅ Multiple Options SOW form data saved to localStorage');
    } catch (error) {
      console.error('Failed to save form data:', error);
    }

    onPreview(formData);
  };

  const addProjectOption = () => {
    const newOption: ProjectOption = {
      id: `option-${Date.now()}`,
      title: `Option ${projectOptions.length + 1}`,
      subtitle: 'New engagement option',
      projectDescription: '',
      scopeOfServices: '',
      deliverablesAndSuccess: '',
      timeline: '',
      rolesResponsibilities: '',
      communication: '',
      feesPaymentTerms: '',
      assumptions: '',
      inclusionsExclusions: '',
      risksConstraints: '',
      ipUsage: '',
      confidentiality: ''
    };
    setProjectOptions([...projectOptions, newOption]);
    setActiveOptionIndex(projectOptions.length);
  };

  const duplicateOption = (index: number) => {
    const optionToDuplicate = projectOptions[index];
    const newOption: ProjectOption = {
      ...optionToDuplicate,
      id: `option-${Date.now()}`,
      title: `${optionToDuplicate.title} (Copy)`,
    };
    const newOptions = [...projectOptions];
    newOptions.splice(index + 1, 0, newOption);
    setProjectOptions(newOptions);
    setActiveOptionIndex(index + 1);
  };

  const removeOption = (index: number) => {
    if (projectOptions.length <= 2) {
      alert('You must have at least 2 options for a multiple-option SOW');
      return;
    }
    const newOptions = projectOptions.filter((_, i) => i !== index);
    setProjectOptions(newOptions);
    if (activeOptionIndex >= newOptions.length) {
      setActiveOptionIndex(newOptions.length - 1);
    }
  };

  const updateOption = (index: number, field: keyof ProjectOption, value: string) => {
    const newOptions = [...projectOptions];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setProjectOptions(newOptions);
  };

  const toggleSection = (section: keyof SectionToggles) => {
    setEnabledSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Calculate section numbers dynamically based on enabled sections
  const getSectionNumber = (sectionKey: keyof SectionToggles): number => {
    const sections: (keyof SectionToggles)[] = [
      'projectDescription',
      'scopeOfServices',
      'deliverablesAndSuccess',
      'timeline',
      'rolesResponsibilities',
      'communication',
      'feesPaymentTerms',
      'assumptions',
      'inclusionsExclusions',
      'risksConstraints',
      'ipUsage',
      'confidentiality',
    ];
    
    let number = 0;
    for (const section of sections) {
      if (enabledSections[section]) {
        number++;
        if (section === sectionKey) return number;
      }
    }
    return number;
  };

  useEffect(() => {
    console.log('🔍 Multiple Options SOW Form initialData changed:', initialData);
    
    if (initialData) {
      // Try to restore from localStorage first (preview return)
      try {
        const savedData = localStorage.getItem('sow_multiple_options_draft');
        if (savedData) {
          const parsed = JSON.parse(savedData);
          console.log('📦 Found saved Multiple Options SOW data in localStorage, restoring...');
          setDocumentNumber(parsed.documentNumber || 'SOW-2026-001');
          setDate(parsed.date || '2026-01-01');
          setEngagementTitle(parsed.engagementTitle || 'Patient Experience Innovation Audit');
          setClientName(parsed.clientName || '');
          setClientContact(parsed.clientContact || '');
          setClientEmail(parsed.clientEmail || '');
          setClientPhone(parsed.clientPhone || '');
          setProjectOverview(parsed.projectOverview || '');
          if (parsed.projectOptions) setProjectOptions(parsed.projectOptions);
          if (parsed.enabledSections) setEnabledSections(parsed.enabledSections);
          return;
        }
      } catch (error) {
        console.error('Failed to restore from localStorage:', error);
      }

      // If no localStorage, populate from wizard data
      if (initialData.name) setClientContact(initialData.name);
      if (initialData.company) setClientName(initialData.company);
      if (initialData.email) setClientEmail(initialData.email);
      if (initialData.phone) setClientPhone(initialData.phone);
    } else {
      // No initialData means fresh start - clear localStorage
      console.log('🆕 Starting fresh Multiple Options SOW - clearing localStorage draft');
      localStorage.removeItem('sow_multiple_options_draft');
    }
  }, [initialData]);

  const activeOption = projectOptions[activeOptionIndex];

  return (
    <div className="min-h-screen bg-[#f5fafb]">
      {/* Header */}
      <div className="w-full bg-white border-b border-[#ddecf0] py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-['Lora'] text-4xl text-[#034863] mb-1">Multiple Options SOW Editor</h1>
              <p className="font-['Poppins'] text-xl text-[#2f829b]">Create a SOW with multiple engagement options</p>
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
                Save & Preview
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Document Header */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <h2 className="font-['Lora'] text-3xl text-[#034863] mb-6">Document Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block font-['Poppins'] text-lg font-medium text-[#034863] mb-2">
                  Document Number
                </label>
                <Input
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  className="font-['Poppins'] text-base"
                />
              </div>
              <div>
                <label className="block font-['Poppins'] text-lg font-medium text-[#034863] mb-2">
                  Date
                </label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="font-['Poppins'] text-base"
                />
              </div>
              <div>
                <label className="block font-['Poppins'] text-lg font-medium text-[#034863] mb-2">
                  Engagement Title
                </label>
                <Input
                  value={engagementTitle}
                  onChange={(e) => setEngagementTitle(e.target.value)}
                  className="font-['Poppins'] text-base"
                />
              </div>
            </div>
          </div>

          {/* Client Information */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <h2 className="font-['Lora'] text-3xl text-[#034863] mb-6">Client Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-['Poppins'] text-lg font-medium text-[#034863] mb-2">
                  Organization Name
                </label>
                <Input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Organization name"
                  className="font-['Poppins'] text-base"
                />
              </div>
              <div>
                <label className="block font-['Poppins'] text-lg font-medium text-[#034863] mb-2">
                  Primary Contact
                </label>
                <Input
                  value={clientContact}
                  onChange={(e) => setClientContact(e.target.value)}
                  placeholder="Contact name"
                  className="font-['Poppins'] text-base"
                />
              </div>
              <div>
                <label className="block font-['Poppins'] text-lg font-medium text-[#034863] mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="font-['Poppins'] text-base"
                />
              </div>
              <div>
                <label className="block font-['Poppins'] text-lg font-medium text-[#034863] mb-2">
                  Phone
                </label>
                <Input
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="font-['Poppins'] text-base"
                />
              </div>
            </div>
          </div>

          {/* Project Overview (Shared) */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <h2 className="font-['Lora'] text-3xl text-[#034863] mb-2">Project Overview & Goals</h2>
            <p className="font-['Poppins'] text-base text-[#2f829b] mb-6">
              This overview will appear at the beginning of the SOW, before the engagement options
            </p>
            <Textarea
              value={projectOverview}
              onChange={(e) => setProjectOverview(e.target.value)}
              rows={6}
              className="font-['Poppins'] text-base"
              placeholder="Describe the overall project context, goals, and what you hope to achieve..."
            />
          </div>

          {/* Project Timeline */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <h2 className="font-['Lora'] text-3xl text-[#034863] mb-2">Project Timeline</h2>
            <p className="font-['Poppins'] text-base text-[#2f829b] mb-6">
              Define the start and completion dates for the project
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-['Poppins'] text-lg font-medium text-[#034863] mb-2">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="font-['Poppins'] text-base"
                />
              </div>
              <div>
                <label className="block font-['Poppins'] text-lg font-medium text-[#034863] mb-2">
                  Completion Date
                </label>
                <Input
                  type="date"
                  value={completionDate}
                  onChange={(e) => setCompletionDate(e.target.value)}
                  className="font-['Poppins'] text-base"
                />
              </div>
            </div>
          </div>

          {/* Project Options Manager */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-['Lora'] text-3xl text-[#034863]">Engagement Options</h2>
                <p className="font-['Poppins'] text-base text-[#2f829b] mt-1">
                  Create multiple options for the client to choose from ({projectOptions.length} options)
                </p>
              </div>
              <Button
                onClick={addProjectOption}
                className="bg-[#2f829b] hover:bg-[#034863] text-white font-['Poppins'] rounded-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Option
              </Button>
            </div>

            {/* Option Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-[#ddecf0] pb-4">
              {projectOptions.map((option, index) => (
                <div key={option.id} className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveOptionIndex(index)}
                    className={`px-4 py-2 rounded-lg font-['Poppins'] transition-all ${
                      activeOptionIndex === index
                        ? 'bg-[#6b2358] text-white'
                        : 'bg-[#f5fafb] text-[#034863] hover:bg-[#ddecf0]'
                    }`}
                  >
                    Option {index + 1}
                  </button>
                  <Button
                    onClick={() => duplicateOption(index)}
                    size="sm"
                    variant="ghost"
                    className="text-[#2f829b] hover:text-[#034863]"
                    title="Duplicate this option"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  {projectOptions.length > 2 && (
                    <Button
                      onClick={() => removeOption(index)}
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:text-red-700"
                      title="Remove this option"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Option Header */}
            <div className="bg-[#f5fafb] p-6 rounded-lg border border-[#ddecf0]">
              <h3 className="font-['Poppins'] font-medium text-[#2f829b] mb-4">Option {activeOptionIndex + 1} Details</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2">
                    Option Title
                  </label>
                  <Input
                    value={activeOption.title}
                    onChange={(e) => updateOption(activeOptionIndex, 'title', e.target.value)}
                    placeholder="e.g., Comprehensive Package"
                    className="font-['Poppins']"
                  />
                </div>
                <div>
                  <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2">
                    Option Subtitle
                  </label>
                  <Input
                    value={activeOption.subtitle}
                    onChange={(e) => updateOption(activeOptionIndex, 'subtitle', e.target.value)}
                    placeholder="e.g., Full-service engagement with all deliverables"
                    className="font-['Poppins']"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Project Description */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <div className="mb-4">
              <label className="flex items-center gap-3 font-['Poppins'] text-sm font-medium text-[#034863] cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabledSections.projectDescription}
                  onChange={() => toggleSection('projectDescription')}
                  className="w-4 h-4 rounded border-[#ddecf0] text-[#6b2358] focus:ring-[#6b2358]"
                />
                <span className="font-['Lora'] text-3xl text-[#034863]">{getSectionNumber('projectDescription')}. Project Description</span>
              </label>
            </div>
            <Textarea
              value={activeOption.projectDescription}
              onChange={(e) => updateOption(activeOptionIndex, 'projectDescription', e.target.value)}
              rows={3}
              className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
              disabled={!enabledSections.projectDescription}
            />
          </div>

          {/* Scope of Services */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <div className="mb-4">
              <label className="flex items-center gap-3 font-['Poppins'] text-sm font-medium text-[#034863] cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabledSections.scopeOfServices}
                  onChange={() => toggleSection('scopeOfServices')}
                  className="w-4 h-4 rounded border-[#ddecf0] text-[#6b2358] focus:ring-[#6b2358]"
                />
                <span className="font-['Lora'] text-3xl text-[#034863]">{getSectionNumber('scopeOfServices')}. Scope of Services</span>
              </label>
            </div>
            <Textarea
              value={activeOption.scopeOfServices}
              onChange={(e) => updateOption(activeOptionIndex, 'scopeOfServices', e.target.value)}
              rows={6}
              className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
              disabled={!enabledSections.scopeOfServices}
            />
          </div>

          {/* Deliverables and Success Criteria */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <div className="mb-4">
              <label className="flex items-center gap-3 font-['Poppins'] text-sm font-medium text-[#034863] cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabledSections.deliverablesAndSuccess}
                  onChange={() => toggleSection('deliverablesAndSuccess')}
                  className="w-4 h-4 rounded border-[#ddecf0] text-[#6b2358] focus:ring-[#6b2358]"
                />
                <span className="font-['Lora'] text-3xl text-[#034863]">{getSectionNumber('deliverablesAndSuccess')}. Deliverables and Success Criteria</span>
              </label>
            </div>
            <Textarea
              value={activeOption.deliverablesAndSuccess}
              onChange={(e) => updateOption(activeOptionIndex, 'deliverablesAndSuccess', e.target.value)}
              rows={8}
              className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
              disabled={!enabledSections.deliverablesAndSuccess}
            />
          </div>

          {/* Timeline and Milestones */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <div className="mb-4">
              <label className="flex items-center gap-3 font-['Poppins'] text-sm font-medium text-[#034863] cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabledSections.timeline}
                  onChange={() => toggleSection('timeline')}
                  className="w-4 h-4 rounded border-[#ddecf0] text-[#6b2358] focus:ring-[#6b2358]"
                />
                <span className="font-['Lora'] text-3xl text-[#034863]">{getSectionNumber('timeline')}. Timeline and Milestones</span>
              </label>
            </div>
            <Textarea
              value={activeOption.timeline}
              onChange={(e) => updateOption(activeOptionIndex, 'timeline', e.target.value)}
              rows={5}
              className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
              disabled={!enabledSections.timeline}
            />
          </div>

          {/* Roles & Responsibilities */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <div className="mb-4">
              <label className="flex items-center gap-3 font-['Poppins'] text-sm font-medium text-[#034863] cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabledSections.rolesResponsibilities}
                  onChange={() => toggleSection('rolesResponsibilities')}
                  className="w-4 h-4 rounded border-[#ddecf0] text-[#6b2358] focus:ring-[#6b2358]"
                />
                <span className="font-['Lora'] text-3xl text-[#034863]">{getSectionNumber('rolesResponsibilities')}. Roles & Responsibilities</span>
              </label>
            </div>
            <Textarea
              value={activeOption.rolesResponsibilities}
              onChange={(e) => updateOption(activeOptionIndex, 'rolesResponsibilities', e.target.value)}
              rows={6}
              className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
              disabled={!enabledSections.rolesResponsibilities}
            />
          </div>

          {/* Communication & Collaboration */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <div className="mb-4">
              <label className="flex items-center gap-3 font-['Poppins'] text-sm font-medium text-[#034863] cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabledSections.communication}
                  onChange={() => toggleSection('communication')}
                  className="w-4 h-4 rounded border-[#ddecf0] text-[#6b2358] focus:ring-[#6b2358]"
                />
                <span className="font-['Lora'] text-3xl text-[#034863]">{getSectionNumber('communication')}. Communication & Collaboration</span>
              </label>
            </div>
            <Textarea
              value={activeOption.communication}
              onChange={(e) => updateOption(activeOptionIndex, 'communication', e.target.value)}
              rows={5}
              className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
              disabled={!enabledSections.communication}
            />
          </div>

          {/* Fees & Payment Terms */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <div className="mb-4">
              <label className="flex items-center gap-3 font-['Poppins'] text-sm font-medium text-[#034863] cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabledSections.feesPaymentTerms}
                  onChange={() => toggleSection('feesPaymentTerms')}
                  className="w-4 h-4 rounded border-[#ddecf0] text-[#6b2358] focus:ring-[#6b2358]"
                />
                <span className="font-['Lora'] text-3xl text-[#034863]">{getSectionNumber('feesPaymentTerms')}. Fees & Payment Terms</span>
              </label>
            </div>
            <Textarea
              value={activeOption.feesPaymentTerms}
              onChange={(e) => updateOption(activeOptionIndex, 'feesPaymentTerms', e.target.value)}
              rows={8}
              className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
              disabled={!enabledSections.feesPaymentTerms}
            />
          </div>

          {/* Assumptions & Agreement */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <div className="mb-4">
              <label className="flex items-center gap-3 font-['Poppins'] text-sm font-medium text-[#034863] cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabledSections.assumptions}
                  onChange={() => toggleSection('assumptions')}
                  className="w-4 h-4 rounded border-[#ddecf0] text-[#6b2358] focus:ring-[#6b2358]"
                />
                <span className="font-['Lora'] text-3xl text-[#034863]">{getSectionNumber('assumptions')}. Assumptions & Agreement</span>
              </label>
            </div>
            <Textarea
              value={activeOption.assumptions}
              onChange={(e) => updateOption(activeOptionIndex, 'assumptions', e.target.value)}
              rows={5}
              className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
              disabled={!enabledSections.assumptions}
            />
          </div>

          {/* Inclusions and Exclusions */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <div className="mb-4">
              <label className="flex items-center gap-3 font-['Poppins'] text-sm font-medium text-[#034863] cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabledSections.inclusionsExclusions}
                  onChange={() => toggleSection('inclusionsExclusions')}
                  className="w-4 h-4 rounded border-[#ddecf0] text-[#6b2358] focus:ring-[#6b2358]"
                />
                <span className="font-['Lora'] text-3xl text-[#034863]">{getSectionNumber('inclusionsExclusions')}. Inclusions and Exclusions</span>
              </label>
            </div>
            <Textarea
              value={activeOption.inclusionsExclusions}
              onChange={(e) => updateOption(activeOptionIndex, 'inclusionsExclusions', e.target.value)}
              rows={7}
              className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
              disabled={!enabledSections.inclusionsExclusions}
            />
          </div>

          {/* Risks and Constraints */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <div className="mb-4">
              <label className="flex items-center gap-3 font-['Poppins'] text-sm font-medium text-[#034863] cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabledSections.risksConstraints}
                  onChange={() => toggleSection('risksConstraints')}
                  className="w-4 h-4 rounded border-[#ddecf0] text-[#6b2358] focus:ring-[#6b2358]"
                />
                <span className="font-['Lora'] text-3xl text-[#034863]">{getSectionNumber('risksConstraints')}. Risks and Constraints</span>
              </label>
            </div>
            <Textarea
              value={activeOption.risksConstraints}
              onChange={(e) => updateOption(activeOptionIndex, 'risksConstraints', e.target.value)}
              rows={6}
              className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
              disabled={!enabledSections.risksConstraints}
            />
          </div>

          {/* IP Usage */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <div className="mb-4">
              <label className="flex items-center gap-3 font-['Poppins'] text-sm font-medium text-[#034863] cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabledSections.ipUsage}
                  onChange={() => toggleSection('ipUsage')}
                  className="w-4 h-4 rounded border-[#ddecf0] text-[#6b2358] focus:ring-[#6b2358]"
                />
                <span className="font-['Lora'] text-3xl text-[#034863]">{getSectionNumber('ipUsage')}. IP Usage (if relevant)</span>
              </label>
            </div>
            <Textarea
              value={activeOption.ipUsage}
              onChange={(e) => updateOption(activeOptionIndex, 'ipUsage', e.target.value)}
              rows={4}
              className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
              disabled={!enabledSections.ipUsage}
            />
          </div>

          {/* Confidentiality */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <div className="mb-4">
              <label className="flex items-center gap-3 font-['Poppins'] text-sm font-medium text-[#034863] cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabledSections.confidentiality}
                  onChange={() => toggleSection('confidentiality')}
                  className="w-4 h-4 rounded border-[#ddecf0] text-[#6b2358] focus:ring-[#6b2358]"
                />
                <span className="font-['Lora'] text-3xl text-[#034863]">{getSectionNumber('confidentiality')}. Confidentiality</span>
              </label>
            </div>
            <Textarea
              value={activeOption.confidentiality}
              onChange={(e) => updateOption(activeOptionIndex, 'confidentiality', e.target.value)}
              rows={4}
              className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
              disabled={!enabledSections.confidentiality}
            />
          </div>

          {/* Bottom Navigation */}
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
              Save & Preview
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}