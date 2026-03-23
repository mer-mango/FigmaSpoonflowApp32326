import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { ArrowLeft, Edit3 } from 'lucide-react';
import { RefinedHeader } from '../shared/RefinedHeader';
import { DocumentFooter } from '../shared/DocumentFooter';
import { SOWMultipleOptions } from './SOW_MultipleOptions';

interface ScopeOfWorkMultipleOptionsDocumentProps {
  documentData: any;
  onEdit: () => void;
  onBack: () => void;
}

export function ScopeOfWorkMultipleOptionsDocument({ 
  documentData, 
  onEdit, 
  onBack 
}: ScopeOfWorkMultipleOptionsDocumentProps) {
  const [activeSection, setActiveSection] = useState('overview');
  const [showSignature, setShowSignature] = useState(false);
  const [clientSignature, setClientSignature] = useState('');
  const [clientSignatureDate, setClientSignatureDate] = useState('');
  const [consultantSignature, setConsultantSignature] = useState('Meredith Mangold, CPXP');
  const [editRequest, setEditRequest] = useState('');
  const [showEditRequest, setShowEditRequest] = useState(false);
  const [status, setStatus] = useState<'pending' | 'approved' | 'edit-requested'>('pending');
  const [selectedProjectOption, setSelectedProjectOption] = useState<string>('');
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  // Calculate section numbers dynamically based on enabled sections
  const getSectionNumber = (sectionKey: string): number => {
    const sections = [
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
      if (documentData.enabledSections?.[section]) {
        number++;
        if (section === sectionKey) return number;
      }
    }
    return number;
  };
  
  // Build navigation items based on enabled sections with dynamic numbering
  const navItems = [
    { id: 'overview', label: 'Overview', enabled: true },
    { id: 'projectOptions', label: 'Project Options', enabled: true },
    { id: 'projectDescription', label: `${getSectionNumber('projectDescription')}. Project Description`, enabled: documentData.enabledSections?.projectDescription },
    { id: 'scopeOfServices', label: `${getSectionNumber('scopeOfServices')}. Scope of Services`, enabled: documentData.enabledSections?.scopeOfServices },
    { id: 'deliverablesAndSuccess', label: `${getSectionNumber('deliverablesAndSuccess')}. Deliverables & Success`, enabled: documentData.enabledSections?.deliverablesAndSuccess },
    { id: 'timeline', label: `${getSectionNumber('timeline')}. Timeline & Milestones`, enabled: documentData.enabledSections?.timeline },
    { id: 'rolesResponsibilities', label: `${getSectionNumber('rolesResponsibilities')}. Roles & Responsibilities`, enabled: documentData.enabledSections?.rolesResponsibilities },
    { id: 'communication', label: `${getSectionNumber('communication')}. Communication`, enabled: documentData.enabledSections?.communication },
    { id: 'feesPaymentTerms', label: `${getSectionNumber('feesPaymentTerms')}. Fees & Payment`, enabled: documentData.enabledSections?.feesPaymentTerms },
    { id: 'assumptions', label: `${getSectionNumber('assumptions')}. Assumptions`, enabled: documentData.enabledSections?.assumptions },
    { id: 'inclusionsExclusions', label: `${getSectionNumber('inclusionsExclusions')}. Inclusions & Exclusions`, enabled: documentData.enabledSections?.inclusionsExclusions },
    { id: 'risksConstraints', label: `${getSectionNumber('risksConstraints')}. Risks & Constraints`, enabled: documentData.enabledSections?.risksConstraints },
    { id: 'ipUsage', label: `${getSectionNumber('ipUsage')}. IP Usage`, enabled: documentData.enabledSections?.ipUsage },
    { id: 'confidentiality', label: `${getSectionNumber('confidentiality')}. Confidentiality`, enabled: documentData.enabledSections?.confidentiality },
    { id: 'nextSteps', label: 'Next Steps', enabled: true },
    { id: 'approval', label: 'Approval & Signatures', enabled: true },
  ].filter(item => item.enabled);

  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId];
    if (element) {
      const yOffset = -100; // Offset for fixed header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  // Intersection Observer for active section highlighting
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5, rootMargin: '-100px 0px -50% 0px' }
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const handleApprove = () => {
    setShowSignature(true);
  };

  const handleSign = () => {
    if (clientSignature.trim() && clientSignatureDate.trim()) {
      setStatus('approved');
      setShowSignature(false);
      alert('Scope of Work approved and signed! Both parties will receive confirmation via email.');
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
    <div className="min-h-screen bg-white">
      {/* Content with sidebar navigation */}
      <div className="flex">
        {/* Fixed Sidebar Navigation */}
        <div className="fixed left-0 top-0 bottom-0 w-72 bg-[#f5fafb] border-r border-[#ddecf0] overflow-y-auto p-6 hidden lg:block">
          <h3 className="font-['Poppins'] text-xs uppercase tracking-wide text-[#2f829b] mb-4 font-medium">
            Document Sections
          </h3>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`w-full text-left px-4 py-2.5 rounded-lg font-['Poppins'] text-sm transition-all ${
                  activeSection === item.id
                    ? 'bg-[#2f829b] text-white font-medium'
                    : 'text-[#034863] hover:bg-white/60'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="lg:ml-72 flex-1">
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
            onEdit={onEdit}
            onBack={onBack}
            activeSection={activeSection}
            sectionRefs={sectionRefs}
            navItems={navItems}
            scrollToSection={scrollToSection}
          />
          <DocumentFooter />
        </div>
      </div>
    </div>
  );
}