import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Eye, Save, Package } from 'lucide-react';
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

interface ScopeOfWorkFormProps {
  onPreview: (data: any) => void;
  onBack: () => void;
  onSave?: () => void;
  backButtonLabel?: string;
  initialData?: any;
  services?: Service[];
  linkedService?: Service;
}

export function ScopeOfWorkForm({ 
  onPreview, 
  onBack, 
  onSave, 
  backButtonLabel = 'Back to Flow Wizard',
  initialData,
  services = [],
  linkedService
}: ScopeOfWorkFormProps) {
  // Section toggles - all enabled by default
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

  const toggleSection = (section: keyof SectionToggles) => {
    setEnabledSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
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

  // Document header info
  const [documentNumber, setDocumentNumber] = useState('SOW-2026-001');
  const [date, setDate] = useState('2026-01-01');
  const [engagementTitle, setEngagementTitle] = useState('Patient Experience Innovation Audit');
  
  // Client information
  const [clientName, setClientName] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  // Service linking
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [serviceName, setServiceName] = useState('');

  // General project overview
  const [projectOverview, setProjectOverview] = useState('Comprehensive assessment of current patient experience touchpoints across the organization, including digital and in-person interactions. Development of a strategic roadmap to enhance patient satisfaction, streamline care coordination, and implement evidence-based experience improvements.');

  // Project timeline
  const [startDate, setStartDate] = useState('2026-01-15');
  const [endDate, setEndDate] = useState('2026-04-30');

  // Single package fields
  const [packageTitle, setPackageTitle] = useState('Innovation Audit & Strategic Roadmap');
  const [packageSubtitle, setPackageSubtitle] = useState('Comprehensive assessment with actionable roadmap');
  
  // Section content
  const [projectDescription, setProjectDescription] = useState('In-depth evaluation of all patient touchpoints, journey mapping, and development of an actionable strategic roadmap for experience transformation.');
  const [scopeOfServices, setScopeOfServices] = useState(`• Patient Experience Innovation Audit Report (80-100 pages)
• Journey mapping for 3-5 key patient personas
• Competitive analysis and benchmarking study
• Strategic roadmap with 18-month implementation timeline
• Executive presentation deck
• 2 stakeholder workshops (leadership & frontline staff)`);
  const [deliverablesAndSuccess, setDeliverablesAndSuccess] = useState(`Deliverables:
• Comprehensive audit report
• Journey maps and persona profiles
• Strategic roadmap document
• Implementation toolkit

Success Criteria:
• Actionable recommendations delivered on time
• 95% stakeholder satisfaction rating
• Clear ROI projection for recommendations`);
  const [timeline, setTimeline] = useState(`Phase 1 (Weeks 1-4): Discovery & Audit
Phase 2 (Weeks 5-8): Analysis & Benchmarking
Phase 3 (Weeks 9-12): Strategy Development & Delivery`);
  const [rolesResponsibilities, setRolesResponsibilities] = useState(`Client Responsibilities:
• Provide timely access to staff and data
• Assign internal project liaison
• Make patient satisfaction data available

Consultant Responsibilities:
• Lead all research and analysis activities
• Facilitate workshops and stakeholder sessions
• Deliver high-quality, actionable recommendations`);
  const [communication, setCommunication] = useState(`• Weekly progress updates via email
• Bi-weekly check-in calls (30 minutes)
• Shared project workspace for document collaboration
• 24-hour response time for urgent requests`);
  const [feesPaymentTerms, setFeesPaymentTerms] = useState(`Total Investment: $45,000

Payment Schedule:
• 50% ($22,500) - Upon contract signing
• 25% ($11,250) - Completion of Phase 2
• 25% ($11,250) - Final deliverable acceptance

Terms:
• Net 15 payment terms from invoice date
• Accepted methods: ACH, wire transfer, or check
• Late payments subject to 1.5% monthly interest`);
  const [assumptions, setAssumptions] = useState(`• Client will provide access to necessary staff and data within agreed timelines
• Historical patient satisfaction data is available and accessible
• Key stakeholders are available for scheduled interviews and workshops
• Project scope will not expand beyond defined deliverables without formal change request`);
  const [inclusionsExclusions, setInclusionsExclusions] = useState(`Inclusions:
• All research and analysis activities
• Workshop facilitation and materials
• Comprehensive documentation
• 30-day post-delivery support

Exclusions:
• Technical implementation of digital solutions
• Clinical protocol development
• Staff hiring and recruitment
• Ongoing project management beyond roadmap creation`);
  const [risksConstraints, setRisksConstraints] = useState(`Risks:\n• Stakeholder availability may impact timeline\n• Data access limitations could affect analysis depth\n• Organizational changes during engagement may require scope adjustment\n\nConstraints:\n• 12-week project timeline\n• Budget limitations for external research resources\n• Confidentiality requirements may limit benchmarking access`);
  const [ipUsage, setIpUsage] = useState(`All deliverables, including reports, presentations, and strategic roadmaps, become the intellectual property of the Client upon final payment. Empower Health Strategies retains the right to use anonymized case study information for marketing purposes with prior client approval.`);
  const [confidentiality, setConfidentiality] = useState(`All client information, data, and materials will be kept strictly confidential. Empower Health Strategies will not disclose any proprietary information to third parties without written consent. Both parties agree to sign a separate Non-Disclosure Agreement if required.`);
  const [nextSteps, setNextSteps] = useState(`1. Review this Scope of Work
Please review all sections carefully and note any questions or clarifications needed.

2. Schedule Discovery Call
Let's discuss any questions and finalize project details before moving forward.

3. Sign & Return
Once approved, sign below and return to initiate the project kickoff.`);

  const loadServiceFromSettings = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      setSelectedServiceId(serviceId);
      setServiceName(service.name);
      setPackageTitle(service.name);
      setProjectDescription(service.description || '');
      
      // Load SOW template data if available
      if (service.sowTemplates) {
        if (service.sowTemplates.projectDescription) setProjectDescription(service.sowTemplates.projectDescription);
        if (service.sowTemplates.scopeOfServices) setScopeOfServices(service.sowTemplates.scopeOfServices);
        if (service.sowTemplates.timeline) setTimeline(service.sowTemplates.timeline);
        if (service.sowTemplates.rolesResponsibilities) setRolesResponsibilities(service.sowTemplates.rolesResponsibilities);
        if (service.sowTemplates.communication) setCommunication(service.sowTemplates.communication);
        if (service.sowTemplates.feesPaymentTerms) setFeesPaymentTerms(service.sowTemplates.feesPaymentTerms);
        if (service.sowTemplates.assumptions) setAssumptions(service.sowTemplates.assumptions);
        if (service.sowTemplates.inclusionsExclusions) setInclusionsExclusions(service.sowTemplates.inclusionsExclusions);
        if (service.sowTemplates.risksConstraints) setRisksConstraints(service.sowTemplates.risksConstraints);
        if (service.sowTemplates.ipUsage) setIpUsage(service.sowTemplates.ipUsage);
        if (service.sowTemplates.confidentiality) setConfidentiality(service.sowTemplates.confidentiality);
        if (service.sowTemplates.deliverablesAndSuccess) setDeliverablesAndSuccess(service.sowTemplates.deliverablesAndSuccess);
      } else {
        // Fallback: Generate basic sections from service info if no templates exist
        const feeText = `Total Investment: ${service.price}\n\nPayment Schedule:\n• 50% - Upon contract signing\n• 25% - Midpoint milestone\n• 25% - Final deliverable acceptance\n\nTerms:\n• Net 15 payment terms from invoice date\n• Accepted methods: ACH, wire transfer, or check\n• Late payments subject to 1.5% monthly interest`;
        
        setFeesPaymentTerms(feeText);
        
        // Set timeline based on duration
        if (service.duration) {
          setTimeline(`Project Duration: ${service.duration}\n\nTimeline details to be finalized during kickoff meeting.`);
        }
        
        // Set deliverables from service
        if (service.deliverables && service.deliverables.length > 0) {
          const deliverablesList = service.deliverables.map(d => `• ${d}`).join('\n');
          setDeliverablesAndSuccess(`Deliverables:\n${deliverablesList}\n\nSuccess Criteria:\n• Deliverables completed within agreed timeline\n• High-quality, actionable recommendations\n• Positive client satisfaction rating`);
        }
      }
    }
  };

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
      endDate,
      packageTitle,
      packageSubtitle,
      projectDescription,
      scopeOfServices,
      deliverablesAndSuccess,
      timeline,
      rolesResponsibilities,
      communication,
      feesPaymentTerms,
      assumptions,
      inclusionsExclusions,
      risksConstraints,
      ipUsage,
      confidentiality,
      serviceName,
      selectedServiceId,
      enabledSections,
      nextSteps,
    };
    
    // Save to localStorage before previewing
    try {
      localStorage.setItem('sow_form_draft', JSON.stringify(formData));
      console.log('✅ SOW form data saved to localStorage');
    } catch (error) {
      console.error('Failed to save form data:', error);
    }
    
    onPreview(formData);
  };

  useEffect(() => {
    console.log('🔍 SOW Form initialData changed:', initialData);
    
    // If there's initialData, we're either:
    // 1. Coming back from preview (restore from localStorage)
    // 2. Loading wizard data (populate from initialData)
    if (initialData) {
      // Try to restore from localStorage first (preview return)
      try {
        const savedData = localStorage.getItem('sow_form_draft');
        if (savedData) {
          const parsed = JSON.parse(savedData);
          console.log('📦 Found saved SOW data in localStorage, restoring...');
          setDocumentNumber(parsed.documentNumber || 'SOW-2026-001');
          setDate(parsed.date || '2026-01-01');
          setEngagementTitle(parsed.engagementTitle || 'Patient Experience Innovation Audit');
          setClientName(parsed.clientName || '');
          setClientContact(parsed.clientContact || '');
          setClientEmail(parsed.clientEmail || '');
          setClientPhone(parsed.clientPhone || '');
          setProjectOverview(parsed.projectOverview || '');
          setStartDate(parsed.startDate || '2026-01-15');
          setEndDate(parsed.endDate || '2026-04-30');
          setPackageTitle(parsed.packageTitle || '');
          setPackageSubtitle(parsed.packageSubtitle || '');
          setProjectDescription(parsed.projectDescription || '');
          setScopeOfServices(parsed.scopeOfServices || '');
          setDeliverablesAndSuccess(parsed.deliverablesAndSuccess || '');
          setTimeline(parsed.timeline || '');
          setRolesResponsibilities(parsed.rolesResponsibilities || '');
          setCommunication(parsed.communication || '');
          setFeesPaymentTerms(parsed.feesPaymentTerms || '');
          setAssumptions(parsed.assumptions || '');
          setInclusionsExclusions(parsed.inclusionsExclusions || '');
          setRisksConstraints(parsed.risksConstraints || '');
          setIpUsage(parsed.ipUsage || '');
          setConfidentiality(parsed.confidentiality || '');
          setServiceName(parsed.serviceName || '');
          setSelectedServiceId(parsed.selectedServiceId || '');
          setNextSteps(parsed.nextSteps || `1. Review this Scope of Work\nPlease review all sections carefully and note any questions or clarifications needed.\n\n2. Schedule Discovery Call\nLet's discuss any questions and finalize project details before moving forward.\n\n3. Sign & Return\nOnce approved, sign below and return to initiate the project kickoff.`);
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
      // No initialData means fresh start from template - clear localStorage
      console.log('🆕 Starting fresh SOW - clearing localStorage draft');
      localStorage.removeItem('sow_form_draft');
    }
  }, [initialData]);

  return (
    <div className="min-h-screen bg-[#f5fafb]">
      {/* Header */}
      <div className="w-full bg-white border-b border-[#ddecf0] py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mt-6">
            <div>
              <h1 className="font-['Lora'] text-4xl text-[#034863] mb-1">Scope of Work Editor</h1>
              <p className="font-['Poppins'] text-lg text-[#2f829b] text-[20px]">Create professional project proposals</p>
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
                <Save className="w-4 h-4 mr-2" />
                Save & Preview
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Document Header */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <h2 className="font-['Lora'] text-3xl text-[#034863] mb-6">Document Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                  Document Number
                </label>
                <Input
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                />
              </div>
              <div>
                <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                  Date
                </label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                  Engagement Title
                </label>
                <Input
                  value={engagementTitle}
                  onChange={(e) => setEngagementTitle(e.target.value)}
                  className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                />
              </div>
            </div>
          </div>

          {/* Client Information */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <h2 className="font-['Lora'] text-3xl text-[#034863] mb-6">Client Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                  Organization Name
                </label>
                <Input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Client organization"
                  className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                />
              </div>
              <div>
                <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                  Contact Name
                </label>
                <Input
                  value={clientContact}
                  onChange={(e) => setClientContact(e.target.value)}
                  placeholder="Primary contact"
                  className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                />
              </div>
              <div>
                <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                  Email
                </label>
                <Input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                />
              </div>
              <div>
                <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                  Phone
                </label>
                <Input
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                />
              </div>
            </div>
          </div>

          {/* Service Selection */}
          {services.length > 0 && (
            <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-['Lora'] text-3xl text-[#034863]">Link to Service</h2>
                <select
                  value={selectedServiceId}
                  onChange={(e) => loadServiceFromSettings(e.target.value)}
                  className="px-4 py-2 border-2 border-[#2f829b] rounded-lg font-['Poppins'] text-[#034863] bg-white hover:bg-[#f5fafb] transition-colors"
                >
                  <option value="">Select from Services...</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name} - {service.price}
                    </option>
                  ))}
                </select>
              </div>
              {serviceName && (
                <div className="bg-[#2f829b]/10 border-l-4 border-[#2f829b] p-4 rounded">
                  <p className="font-['Poppins'] text-sm text-[#034863]">
                    <Package className="w-4 h-4 inline mr-2 text-[#2f829b]" />
                    This SOW is linked to: <span className="font-medium text-[#2f829b]">{serviceName}</span>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Project Timeline */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <h2 className="font-['Lora'] text-3xl text-[#034863] mb-6">Project Timeline</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                />
              </div>
              <div>
                <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                  Completion Date
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                />
              </div>
            </div>
          </div>

          {/* General Project Overview */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <h2 className="font-['Lora'] text-3xl text-[#034863] mb-6">Project Overview, Goals & Objectives</h2>
            <Textarea
              value={projectOverview}
              onChange={(e) => setProjectOverview(e.target.value)}
              rows={4}
              className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
            />
          </div>

          {/* Package Details */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <h2 className="font-['Lora'] text-3xl text-[#034863] mb-6">Package Details</h2>
            <div className="space-y-6">
              <div>
                <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                  Package Title
                </label>
                <Input
                  value={packageTitle}
                  onChange={(e) => setPackageTitle(e.target.value)}
                  placeholder="e.g., Innovation Audit & Strategic Roadmap"
                  className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                />
              </div>
              <div>
                <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                  Package Subtitle
                </label>
                <Input
                  value={packageSubtitle}
                  onChange={(e) => setPackageSubtitle(e.target.value)}
                  placeholder="Brief description"
                  className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                />
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
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
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
              value={scopeOfServices}
              onChange={(e) => setScopeOfServices(e.target.value)}
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
              value={deliverablesAndSuccess}
              onChange={(e) => setDeliverablesAndSuccess(e.target.value)}
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
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
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
              value={rolesResponsibilities}
              onChange={(e) => setRolesResponsibilities(e.target.value)}
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
              value={communication}
              onChange={(e) => setCommunication(e.target.value)}
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
              value={feesPaymentTerms}
              onChange={(e) => setFeesPaymentTerms(e.target.value)}
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
              value={assumptions}
              onChange={(e) => setAssumptions(e.target.value)}
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
              value={inclusionsExclusions}
              onChange={(e) => setInclusionsExclusions(e.target.value)}
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
              value={risksConstraints}
              onChange={(e) => setRisksConstraints(e.target.value)}
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
              value={ipUsage}
              onChange={(e) => setIpUsage(e.target.value)}
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
              value={confidentiality}
              onChange={(e) => setConfidentiality(e.target.value)}
              rows={4}
              className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
              disabled={!enabledSections.confidentiality}
            />
          </div>

          {/* Next Steps */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <h2 className="font-['Lora'] text-3xl text-[#034863] mb-6">Next Steps</h2>
            <Textarea
              value={nextSteps}
              onChange={(e) => setNextSteps(e.target.value)}
              rows={6}
              className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
            />
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
              <Save className="w-4 h-4 mr-2" />
              Save & Preview
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}