import React from 'react';
import { FileText, CheckCircle2, Edit3, Building2, Mail, Phone, User, Calendar, ArrowRight, DollarSign, Target, Briefcase, Award, Users, MessageSquare, FileCheck, ListCheck, TriangleAlert, Copyright, ShieldCheck, Download, Send, FileDown, PenLine } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { RefinedHeader } from '../shared/RefinedHeader';
import { DocumentFooter } from '../shared/DocumentFooter';
import { PDFActionButtons } from '../shared/PDFActionButtons';
import { exportToPDF } from '../utils/pdfExport';

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

interface SingleOptionProps {
  documentData: any;
  status: 'pending' | 'approved' | 'edit-requested';
  showSignature: boolean;
  showEditRequest: boolean;
  clientSignature: string;
  clientSignatureDate: string;
  consultantSignature: string;
  editRequest: string;
  setClientSignature: (val: string) => void;
  setClientSignatureDate: (val: string) => void;
  setEditRequest: (val: string) => void;
  handleApprove: () => void;
  handleSign: () => void;
  handleRequestEdits: () => void;
  handleSubmitEdits: () => void;
  setShowSignature: (val: boolean) => void;
  setShowEditRequest: (val: boolean) => void;
  onEdit?: () => void;
  onBack?: () => void;
}

export function SOWSingleOption(props: SingleOptionProps) {
  const { documentData, status, showSignature, showEditRequest, clientSignature, clientSignatureDate, consultantSignature, editRequest } = props;

  const projectOptions: ProjectOption[] = documentData.projectOptions || [];
  const option = projectOptions[0];
  const enabledSections: SectionToggles = documentData.enabledSections || {
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
  };

  if (!option) return null;

  // Calculate section number dynamically based on enabled sections
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

  // Helper function to render text with styled subheaders
  const renderTextWithSubheaders = (text: string) => {
    if (!text) return null;
    
    const lines = text.split('\n');
    return lines.map((line, index) => {
      // Check if line ends with colon (potential subheader)
      const isSubheader = line.trim().match(/^[A-Z][^:]+:$/);
      const isTotalInvestment = line.trim().match(/^Total Investment:/i);
      
      if (isTotalInvestment) {
        return (
          <p key={index} className="font-medium text-2xl text-[#2f829b] mt-4 mb-2">
            {line}
          </p>
        );
      }
      
      if (isSubheader) {
        return (
          <p key={index} className="font-medium text-xl text-[#2f829b] mt-4 mb-2">
            {line}
          </p>
        );
      }
      
      return <p key={index}>{line || '\u00A0'}</p>;
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <RefinedHeader onEdit={props.onEdit} onBack={props.onBack} showBackButton={true} />

      {/* Top PDF Export Button */}
      <PDFActionButtons documentTitle="Scope-of-Work" position="top" />

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Document Header */}
          <div className="mb-12">
            <h1 className="font-['Lora'] text-6xl text-[#034863] mb-3">Scope of Work</h1>
            <p className="font-['Poppins'] text-2xl text-[#2f829b]">{option.title}</p>
            <p className="font-['Poppins'] text-lg text-[#034863]/70 mt-2">{option.subtitle}</p>
          </div>

          {/* Main Content */}
          <div className="space-y-14">
            {/* Project Description */}
            {enabledSections.projectDescription && option.projectDescription && (
              <div className="border-t border-[#034863]/50 pt-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2f829b] text-white flex items-center justify-center text-lg font-medium">
                    {getSectionNumber('projectDescription')}
                  </div>
                  <h2 className="font-['Lora'] text-4xl text-[#034863]">Project Description</h2>
                </div>
                <div className="font-['Poppins'] text-lg text-black leading-relaxed">
                  {renderTextWithSubheaders(option.projectDescription)}
                </div>
              </div>
            )}

            {/* Scope of Services */}
            {enabledSections.scopeOfServices && option.scopeOfServices && (
              <div className="border-t border-[#034863]/50 pt-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2f829b] text-white flex items-center justify-center text-lg font-medium">
                    {getSectionNumber('scopeOfServices')}
                  </div>
                  <h2 className="font-['Lora'] text-4xl text-[#034863]">Scope of Services</h2>
                </div>
                <div className="font-['Poppins'] text-lg text-black leading-relaxed">
                  {renderTextWithSubheaders(option.scopeOfServices)}
                </div>
              </div>
            )}

            {/* Deliverables & Success */}
            {enabledSections.deliverablesAndSuccess && option.deliverablesAndSuccess && (
              <div className="border-t border-[#034863]/50 pt-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2f829b] text-white flex items-center justify-center text-lg font-medium">
                    {getSectionNumber('deliverablesAndSuccess')}
                  </div>
                  <h2 className="font-['Lora'] text-4xl text-[#034863]">Deliverables & Success Criteria</h2>
                </div>
                <div className="font-['Poppins'] text-lg text-black leading-relaxed">
                  {renderTextWithSubheaders(option.deliverablesAndSuccess)}
                </div>
              </div>
            )}

            {/* Timeline & Milestones */}
            {enabledSections.timeline && option.timeline && (
              <div className="border-t border-[#034863]/50 pt-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2f829b] text-white flex items-center justify-center text-lg font-medium">
                    {getSectionNumber('timeline')}
                  </div>
                  <h2 className="font-['Lora'] text-4xl text-[#034863]">Timeline & Milestones</h2>
                </div>
                <div className="font-['Poppins'] text-lg text-black leading-relaxed">
                  {renderTextWithSubheaders(option.timeline)}
                </div>
              </div>
            )}

            {/* Roles & Responsibilities */}
            {enabledSections.rolesResponsibilities && option.rolesResponsibilities && (
              <div className="border-t border-[#034863]/50 pt-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2f829b] text-white flex items-center justify-center text-lg font-medium">
                    {getSectionNumber('rolesResponsibilities')}
                  </div>
                  <h2 className="font-['Lora'] text-4xl text-[#034863]">Roles & Responsibilities</h2>
                </div>
                <div className="font-['Poppins'] text-lg text-black leading-relaxed">
                  {renderTextWithSubheaders(option.rolesResponsibilities)}
                </div>
              </div>
            )}

            {/* Communication */}
            {enabledSections.communication && option.communication && (
              <div className="border-t border-[#034863]/50 pt-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2f829b] text-white flex items-center justify-center text-lg font-medium">
                    {getSectionNumber('communication')}
                  </div>
                  <h2 className="font-['Lora'] text-4xl text-[#034863]">Communication</h2>
                </div>
                <div className="font-['Poppins'] text-lg text-black leading-relaxed">
                  {renderTextWithSubheaders(option.communication)}
                </div>
              </div>
            )}

            {/* Fees & Payment Terms */}
            {enabledSections.feesPaymentTerms && option.feesPaymentTerms && (
              <div className="border-t border-[#034863]/50 pt-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2f829b] text-white flex items-center justify-center text-lg font-medium">
                    {getSectionNumber('feesPaymentTerms')}
                  </div>
                  <h2 className="font-['Lora'] text-4xl text-[#034863]">Fees & Payment Terms</h2>
                </div>
                <div className="font-['Poppins'] text-lg text-black leading-relaxed">
                  {renderTextWithSubheaders(option.feesPaymentTerms)}
                </div>
              </div>
            )}

            {/* Assumptions */}
            {enabledSections.assumptions && option.assumptions && (
              <div className="border-t border-[#034863]/50 pt-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2f829b] text-white flex items-center justify-center text-lg font-medium">
                    {getSectionNumber('assumptions')}
                  </div>
                  <h2 className="font-['Lora'] text-4xl text-[#034863]">Assumptions</h2>
                </div>
                <div className="font-['Poppins'] text-lg text-black leading-relaxed">
                  {renderTextWithSubheaders(option.assumptions)}
                </div>
              </div>
            )}

            {/* Inclusions & Exclusions */}
            {enabledSections.inclusionsExclusions && option.inclusionsExclusions && (
              <div className="border-t border-[#034863]/50 pt-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2f829b] text-white flex items-center justify-center text-lg font-medium">
                    {getSectionNumber('inclusionsExclusions')}
                  </div>
                  <h2 className="font-['Lora'] text-4xl text-[#034863]">Inclusions & Exclusions</h2>
                </div>
                <div className="font-['Poppins'] text-lg text-black leading-relaxed">
                  {renderTextWithSubheaders(option.inclusionsExclusions)}
                </div>
              </div>
            )}

            {/* Risks & Constraints */}
            {enabledSections.risksConstraints && option.risksConstraints && (
              <div className="border-t border-[#034863]/50 pt-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2f829b] text-white flex items-center justify-center text-lg font-medium">
                    {getSectionNumber('risksConstraints')}
                  </div>
                  <h2 className="font-['Lora'] text-4xl text-[#034863]">Risks & Constraints</h2>
                </div>
                <div className="font-['Poppins'] text-lg text-black leading-relaxed">
                  {renderTextWithSubheaders(option.risksConstraints)}
                </div>
              </div>
            )}

            {/* IP Usage */}
            {enabledSections.ipUsage && option.ipUsage && (
              <div className="border-t border-[#034863]/50 pt-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2f829b] text-white flex items-center justify-center text-lg font-medium">
                    {getSectionNumber('ipUsage')}
                  </div>
                  <h2 className="font-['Lora'] text-4xl text-[#034863]">Intellectual Property Usage</h2>
                </div>
                <div className="font-['Poppins'] text-lg text-black leading-relaxed">
                  {renderTextWithSubheaders(option.ipUsage)}
                </div>
              </div>
            )}

            {/* Confidentiality */}
            {enabledSections.confidentiality && option.confidentiality && (
              <div className="border-t border-[#034863]/50 pt-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2f829b] text-white flex items-center justify-center text-lg font-medium">
                    {getSectionNumber('confidentiality')}
                  </div>
                  <h2 className="font-['Lora'] text-4xl text-[#034863]">Confidentiality</h2>
                </div>
                <div className="font-['Poppins'] text-lg text-black leading-relaxed">
                  {renderTextWithSubheaders(option.confidentiality)}
                </div>
              </div>
            )}
          </div>

          {/* Next Steps */}
          <div className="border-t border-[#034863]/50 pt-14 mt-14">
            <div className="flex items-center gap-3 mb-6">
              <ArrowRight className="w-7 h-7 text-[#6b2358]" />
              <h2 className="font-['Lora'] text-4xl text-[#034863]">Next Steps</h2>
            </div>
            <div className="space-y-4 font-['Poppins'] text-black">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#6b2358] text-white flex items-center justify-center text-lg font-medium">1</div>
                <div>
                  <p className="font-medium text-xl text-[#6b2358] mb-1">Review Engagement Details</p>
                  <p className="text-lg text-black">Carefully review all sections of this scope of work.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#6b2358] text-white flex items-center justify-center text-lg font-medium">2</div>
                <div>
                  <p className="font-medium text-xl text-[#6b2358] mb-1">Sign the Scope of Work</p>
                  <p className="text-lg text-black">Once you've reviewed all details, sign the document below to formalize our partnership.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#6b2358] text-white flex items-center justify-center text-lg font-medium">3</div>
                <div>
                  <p className="font-medium text-xl text-[#6b2358] mb-1">Project Kickoff Meeting</p>
                  <p className="text-lg text-black">We'll schedule a kickoff meeting within 5 business days to align on project goals, introduce the team, and confirm timelines.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#6b2358] text-white flex items-center justify-center text-lg font-medium">4</div>
                <div>
                  <p className="font-medium text-xl text-[#6b2358] mb-1">Begin Engagement</p>
                  <p className="text-lg text-black">Work commences on the agreed start date with regular check-ins and transparent communication throughout the engagement.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Approval & Signatures Section */}
          <div id="approval-section" className="border-t border-[#034863]/50 pt-14 mt-14">
            {!showEditRequest && (
              <div className="p-10 bg-[#6b2358] rounded-lg">
                <div className="flex items-center gap-3 mb-6">
                  <Edit3 className="w-7 h-7 text-white" />
                  <h2 className="font-['Lora'] text-5xl text-white text-[36px]">Approval & Signatures</h2>
                </div>
                
                {!showSignature && status === 'pending' && (
                  <div className="space-y-6">
                    <p className="font-['Poppins'] text-white text-xl">
                      Please review the scope of work above. You may approve and sign, or request edits.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button
                        onClick={props.handleApprove}
                        className="bg-white text-[#6b2358] hover:bg-white/80 font-['Poppins'] text-xl rounded-lg px-8 py-6 flex-1"
                      >
                        <CheckCircle2 className="w-6 h-6 mr-2" />
                        Approve & Sign
                      </Button>
                      <Button
                        onClick={props.handleRequestEdits}
                        className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#6b2358] font-['Poppins'] text-xl rounded-lg px-8 py-6 flex-1 transition-colors"
                      >
                        <Edit3 className="w-6 h-6 mr-2" />
                        Request Edits
                      </Button>
                    </div>
                  </div>
                )}

                {showSignature && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="font-['Poppins'] font-medium text-white text-xl">Client Signature *</label>
                        <input
                          type="text"
                          value={clientSignature}
                          onChange={(e) => props.setClientSignature(e.target.value)}
                          placeholder="Type your full name"
                          className="w-full px-4 py-4 border-2 border-white/20 rounded-lg focus:border-white focus:ring-white font-['Poppins'] italic bg-white text-[#034863] text-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="font-['Poppins'] font-medium text-white text-xl">Date *</label>
                        <input
                          type="date"
                          value={clientSignatureDate}
                          onChange={(e) => props.setClientSignatureDate(e.target.value)}
                          className="w-full px-4 py-4 border-2 border-white/20 rounded-lg focus:border-white focus:ring-white font-['Poppins'] bg-white text-[#034863] text-xl"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="font-['Poppins'] font-medium text-white text-xl">Consultant Signature</label>
                        <div className="w-full px-4 py-4 border-2 border-white/20 rounded-lg bg-white/10 font-['Poppins'] italic text-white text-xl">
                          {consultantSignature}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="font-['Poppins'] font-medium text-white text-xl">Date</label>
                        <div className="w-full px-4 py-4 border-2 border-white/20 rounded-lg bg-white/10 font-['Poppins'] text-white text-xl">
                          {documentData.date}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <Button
                        onClick={() => props.setShowSignature(false)}
                        className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#6b2358] font-['Poppins'] text-lg rounded-lg px-6 py-3 transition-colors"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={props.handleSign}
                        disabled={!clientSignature.trim() || !clientSignatureDate.trim()}
                        className="bg-white text-[#6b2358] hover:bg-[#f5fafb] font-['Poppins'] text-lg rounded-lg px-6 py-3 disabled:opacity-50"
                      >
                        Confirm Signature
                      </Button>
                    </div>
                  </div>
                )}

                {status === 'approved' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-white/10 rounded-lg">
                      <p className="font-['Poppins'] text-base text-white/80 mb-2">Client</p>
                      <p className="font-['Poppins'] italic text-white text-2xl border-b-2 border-white pb-2">{clientSignature}</p>
                    </div>
                    <div className="p-6 bg-white/10 rounded-lg">
                      <p className="font-['Poppins'] text-base text-white/80 mb-2">Consultant</p>
                      <p className="font-['Poppins'] italic text-white text-2xl border-b-2 border-white pb-2">{consultantSignature}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {showEditRequest && (
              <div className="p-10 bg-[#6b2358] rounded-lg">
                <div className="flex items-center gap-3 mb-6">
                  <Edit3 className="w-7 h-7 text-white" />
                  <h2 className="font-['Lora'] text-5xl text-white">Request Edits</h2>
                </div>
                <Textarea
                  value={editRequest}
                  onChange={(e) => props.setEditRequest(e.target.value)}
                  rows={6}
                  className="border-2 border-white/20 rounded-lg focus:border-white focus:ring-white font-['Poppins'] resize-none bg-white text-[#034863] mb-4 text-lg"
                  placeholder="Describe the changes you'd like..."
                />
                <div className="flex gap-4">
                  <Button
                    onClick={() => props.setShowEditRequest(false)}
                    className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#6b2358] font-['Poppins'] text-lg rounded-lg px-6 py-3 transition-colors"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={props.handleSubmitEdits}
                    className="bg-white text-[#6b2358] hover:bg-[#f5fafb] font-['Poppins'] text-lg rounded-lg px-6 py-3"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Submit Request
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          {status === 'pending' && !showSignature && !showEditRequest && (
            <div className="flex justify-end gap-4 pt-8">
              <Button
                onClick={props.onEdit}
                variant="outline"
                className="border-2 border-[#034863] text-[#034863] hover:bg-[#f5fafb] font-['Poppins'] text-lg rounded-lg px-6 py-3"
              >
                <Edit3 className="w-5 h-5 mr-2" />
                Edit
              </Button>
              <Button className="bg-[#034863] hover:bg-[#034863]/90 text-white font-['Poppins'] text-lg rounded-lg px-6 py-3">
                <Download className="w-5 h-5 mr-2" />
                Download PDF
              </Button>
            </div>
          )}

          {/* Footer */}
          <DocumentFooter />

          {/* Bottom PDF Action Buttons */}
          <PDFActionButtons documentTitle="Scope-of-Work" position="bottom" actionType="sign" />
        </div>
      </div>
    </div>
  );
}