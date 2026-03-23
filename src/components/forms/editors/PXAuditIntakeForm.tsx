import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card } from '../ui/card';
import { Eye, Upload, Link as LinkIcon, Clock, Save } from 'lucide-react';
import { RefinedHeader } from '../shared/RefinedHeader';
import { DocumentFooter } from '../shared/DocumentFooter';

interface PXAuditIntakeFormProps {
  onPreview: (data: any) => void;
  onBack: () => void;
  onSave?: () => void;
  onSaveAndFinishLater?: (data: any) => void;
  backButtonLabel?: string;
  initialData?: any;
  contacts?: any[];
}

export function PXAuditIntakeForm({ 
  onPreview, 
  onBack, 
  onSave, 
  onSaveAndFinishLater,
  backButtonLabel,
  initialData,
  contacts = []
}: PXAuditIntakeFormProps) {
  // Form State
  const [contactName, setContactName] = useState(initialData?.contactName || '');
  const [contactEmail, setContactEmail] = useState(initialData?.contactEmail || '');
  const [organizationName, setOrganizationName] = useState(initialData?.organizationName || '');
  const [productName, setProductName] = useState(initialData?.productName || '');
  
  // Question 1: Problem the product solves
  const [problemStatement, setProblemStatement] = useState(initialData?.problemStatement || '');
  
  // Question 2: Primary audience (multi-select)
  const [audiencePatients, setAudiencePatients] = useState(initialData?.audiencePatients || false);
  const [audienceCaregivers, setAudienceCaregivers] = useState(initialData?.audienceCaregivers || false);
  const [audienceClinicians, setAudienceClinicians] = useState(initialData?.audienceClinicians || false);
  const [audienceCareTeams, setAudienceCareTeams] = useState(initialData?.audienceCareTeams || false);
  const [audienceHealthSystem, setAudienceHealthSystem] = useState(initialData?.audienceHealthSystem || false);
  const [audienceOther, setAudienceOther] = useState(initialData?.audienceOther || false);
  const [audienceOtherText, setAudienceOtherText] = useState(initialData?.audienceOtherText || '');
  
  // Question 3: Value proposition
  const [valueProposition, setValueProposition] = useState(initialData?.valueProposition || '');
  
  // Question 4: Journey fit
  const [journeyFit, setJourneyFit] = useState(initialData?.journeyFit || '');
  
  // Question 5: What users appreciate
  const [userAppreciation, setUserAppreciation] = useState(initialData?.userAppreciation || '');
  
  // Question 6: Friction points
  const [frictionPoints, setFrictionPoints] = useState(initialData?.frictionPoints || '');
  
  // Question 7: Audit goals
  const [auditGoals, setAuditGoals] = useState(initialData?.auditGoals || '');
  
  // Question 8: Product access (file uploads and links)
  const [loginCredentials, setLoginCredentials] = useState(initialData?.loginCredentials || '');
  const [demoLinks, setDemoLinks] = useState(initialData?.demoLinks || '');
  const [documentationLinks, setDocumentationLinks] = useState(initialData?.documentationLinks || '');
  const [additionalNotes, setAdditionalNotes] = useState(initialData?.additionalNotes || '');

  const handlePreview = () => {
    const formData = {
      contactName,
      contactEmail,
      organizationName,
      productName,
      problemStatement,
      audience: {
        patients: audiencePatients,
        caregivers: audienceCaregivers,
        clinicians: audienceClinicians,
        careTeams: audienceCareTeams,
        healthSystem: audienceHealthSystem,
        other: audienceOther,
        otherText: audienceOtherText,
      },
      valueProposition,
      journeyFit,
      userAppreciation,
      frictionPoints,
      auditGoals,
      productAccess: {
        loginCredentials,
        demoLinks,
        documentationLinks,
        additionalNotes,
      },
    };
    onPreview(formData);
  };

  const handleSaveAndFinishLater = () => {
    if (onSaveAndFinishLater) {
      onSaveAndFinishLater({
        contactName,
        contactEmail,
        organizationName,
        productName,
        problemStatement,
        audiencePatients,
        audienceCaregivers,
        audienceClinicians,
        audienceCareTeams,
        audienceHealthSystem,
        audienceOther,
        audienceOtherText,
        valueProposition,
        journeyFit,
        userAppreciation,
        frictionPoints,
        auditGoals,
        loginCredentials,
        demoLinks,
        documentationLinks,
        additionalNotes,
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Action Buttons - Top Sticky Bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-8 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Button
            onClick={onBack}
            variant="outline"
            className="border-2 border-[#034863] text-[#034863] hover:bg-[#f5fafb] font-['Poppins'] rounded-lg"
          >
            {backButtonLabel || 'Save & Back'}
          </Button>
          
          <div className="flex gap-3">
            {onSaveAndFinishLater && (
              <Button
                onClick={handleSaveAndFinishLater}
                variant="outline"
                className="border-2 border-[#a8998f] text-[#a8998f] hover:bg-[#f5fafb] font-['Poppins'] rounded-lg"
              >
                <Clock className="w-4 h-4 mr-2" />
                Save & Finish Later
              </Button>
            )}
            <Button
              onClick={handlePreview}
              className="bg-[#6b2358] hover:bg-[#6b2358]/90 text-white font-['Poppins'] rounded-lg"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview Form
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-['Lora'] text-5xl text-[#034863] mb-3">Onboarding Intake: PX & Impact Audit</h1>
          <p className="font-['Poppins'] text-lg text-[#2f829b] mb-4">Patient Experience & Impact Audit</p>
          
          {/* Editable Contact Info Line */}
          <div className="flex items-center gap-3 font-['Poppins'] text-lg text-[#034863] flex-wrap">
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Contact Name"
              required
              className="border-b border-[#ddecf0] focus:border-[#2f829b] outline-none bg-transparent min-w-[120px]"
              style={{ width: `${Math.max(contactName.length || 12, 12)}ch` }}
            />
            <span className="text-[#034863]/40">|</span>
            <input
              type="text"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              placeholder="Organization"
              required
              className="border-b border-[#ddecf0] focus:border-[#2f829b] outline-none bg-transparent min-w-[120px]"
              style={{ width: `${Math.max(organizationName.length || 12, 12)}ch` }}
            />
            <span className="text-[#034863]/40">|</span>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="Email"
              required
              className="border-b border-[#ddecf0] focus:border-[#2f829b] outline-none bg-transparent min-w-[120px]"
              style={{ width: `${Math.max(contactEmail.length || 5, 5)}ch` }}
            />
            <span className="text-[#034863]/40">|</span>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Product"
              required
              className="border-b border-[#ddecf0] focus:border-[#2f829b] outline-none bg-transparent min-w-[120px]"
              style={{ width: `${Math.max(productName.length || 7, 7)}ch` }}
            />
          </div>
        </div>

        <div className="space-y-8">
          {/* Introduction - Light Blue Shaded Card */}
          <div className="bg-[#f5fafb] p-8 rounded-xl border-2 border-[#ddecf0]">
            <p className="font-['Poppins'] text-[16px] text-[#034863] leading-relaxed">
              Thank you for your interest in Empower Health Strategies. These questions help me understand how you currently think about your product and its role in patients' lives.{' '}
              <span className="font-semibold">There are no "right" answers</span>—this is about alignment, clarity, and context. This should take just a few minutes to complete.
            </p>
          </div>

          {/* Question 1 Card */}
          <Card className="p-8 border-2 border-[#ddecf0] rounded-xl bg-white">
            <div className="flex items-start gap-4 mb-4">
              <span className="flex-shrink-0 w-8 h-8 bg-[#2f829b] text-white rounded-full flex items-center justify-center font-['Poppins'] font-semibold text-sm">
                1
              </span>
              <div className="flex-1">
                <h3 className="font-['Poppins'] font-semibold text-[#034863] mb-1">
                  In your own words, what problem does your product exist to solve?
                </h3>
                <p className="text-sm text-slate-500 mb-4 italic">
                  This surfaces your primary framing and assumed pain point.
                </p>
              </div>
            </div>
            <Textarea
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              placeholder="Describe the core problem your product addresses..."
              rows={4}
              required
              className="font-['Poppins']"
            />
          </Card>

          {/* Question 2 Card */}
          <Card className="p-8 border-2 border-[#ddecf0] rounded-xl bg-white">
            <div className="flex items-start gap-4 mb-4">
              <span className="flex-shrink-0 w-8 h-8 bg-[#2f829b] text-white rounded-full flex items-center justify-center font-['Poppins'] font-semibold text-sm">
                2
              </span>
              <div className="flex-1">
                <h3 className="font-['Poppins'] font-semibold text-[#034863] mb-1">
                  Who is this product primarily designed for today?
                </h3>
                <p className="text-sm text-slate-500 mb-4 italic">
                  Select all that apply
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={audiencePatients}
                  onChange={(e) => setAudiencePatients(e.target.checked)}
                  className="w-4 h-4 text-[#2f829b] rounded border-slate-300 focus:ring-[#2f829b]"
                />
                <span className="font-['Poppins'] text-slate-700">Patients</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={audienceCaregivers}
                  onChange={(e) => setAudienceCaregivers(e.target.checked)}
                  className="w-4 h-4 text-[#2f829b] rounded border-slate-300 focus:ring-[#2f829b]"
                />
                <span className="font-['Poppins'] text-slate-700">Caregivers</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={audienceClinicians}
                  onChange={(e) => setAudienceClinicians(e.target.checked)}
                  className="w-4 h-4 text-[#2f829b] rounded border-slate-300 focus:ring-[#2f829b]"
                />
                <span className="font-['Poppins'] text-slate-700">Clinicians</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={audienceCareTeams}
                  onChange={(e) => setAudienceCareTeams(e.target.checked)}
                  className="w-4 h-4 text-[#2f829b] rounded border-slate-300 focus:ring-[#2f829b]"
                />
                <span className="font-['Poppins'] text-slate-700">Care teams / care coordinators</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={audienceHealthSystem}
                  onChange={(e) => setAudienceHealthSystem(e.target.checked)}
                  className="w-4 h-4 text-[#2f829b] rounded border-slate-300 focus:ring-[#2f829b]"
                />
                <span className="font-['Poppins'] text-slate-700">Health system or organization</span>
              </label>
              
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={audienceOther}
                  onChange={(e) => setAudienceOther(e.target.checked)}
                  className="w-4 h-4 text-[#2f829b] rounded border-slate-300 focus:ring-[#2f829b] mt-1"
                />
                <div className="flex-1">
                  <span className="font-['Poppins'] text-slate-700 block mb-2">Other:</span>
                  {audienceOther && (
                    <Input
                      value={audienceOtherText}
                      onChange={(e) => setAudienceOtherText(e.target.value)}
                      placeholder="Please specify..."
                      className="font-['Poppins']"
                    />
                  )}
                </div>
              </label>
            </div>
          </Card>

          {/* Question 3 Card */}
          <Card className="p-8 border-2 border-[#ddecf0] rounded-xl bg-white">
            <div className="flex items-start gap-4 mb-4">
              <span className="flex-shrink-0 w-8 h-8 bg-[#2f829b] text-white rounded-full flex items-center justify-center font-['Poppins'] font-semibold text-sm">
                3
              </span>
              <div className="flex-1">
                <h3 className="font-['Poppins'] font-semibold text-[#034863] mb-1">
                  How do you currently describe the value of this product to that audience?
                </h3>
                <p className="text-sm text-slate-500 mb-4 italic">
                  This is your value proposition, unfiltered.
                </p>
              </div>
            </div>
            <Textarea
              value={valueProposition}
              onChange={(e) => setValueProposition(e.target.value)}
              placeholder="Describe how you communicate the product's value..."
              rows={4}
              required
              className="font-['Poppins']"
            />
          </Card>

          {/* Question 4 Card */}
          <Card className="p-8 border-2 border-[#ddecf0] rounded-xl bg-white">
            <div className="flex items-start gap-4 mb-4">
              <span className="flex-shrink-0 w-8 h-8 bg-[#2f829b] text-white rounded-full flex items-center justify-center font-['Poppins'] font-semibold text-sm">
                4
              </span>
              <div className="flex-1">
                <h3 className="font-['Poppins'] font-semibold text-[#034863] mb-1">
                  Where do you believe this product fits into a patient's real-life health journey?
                </h3>
                <p className="text-sm text-slate-500 mb-4 italic">
                  For example: before diagnosis, during treatment, between visits, during flares, long-term management, etc.
                </p>
              </div>
            </div>
            <Textarea
              value={journeyFit}
              onChange={(e) => setJourneyFit(e.target.value)}
              placeholder="Describe where in the patient journey this product is most relevant..."
              rows={4}
              required
              className="font-['Poppins']"
            />
          </Card>

          {/* Question 5 Card */}
          <Card className="p-8 border-2 border-[#ddecf0] rounded-xl bg-white">
            <div className="flex items-start gap-4 mb-4">
              <span className="flex-shrink-0 w-8 h-8 bg-[#2f829b] text-white rounded-full flex items-center justify-center font-['Poppins'] font-semibold text-sm">
                5
              </span>
              <div className="flex-1">
                <h3 className="font-['Poppins'] font-semibold text-[#034863] mb-1">
                  What do you think patients (or end users) appreciate most about this product today?
                </h3>
                <p className="text-sm text-slate-500 mb-4 italic">
                  Your perception of what's working.
                </p>
              </div>
            </div>
            <Textarea
              value={userAppreciation}
              onChange={(e) => setUserAppreciation(e.target.value)}
              placeholder="What feedback or signals suggest users find value in this product..."
              rows={4}
              required
              className="font-['Poppins']"
            />
          </Card>

          {/* Question 6 Card */}
          <Card className="p-8 border-2 border-[#ddecf0] rounded-xl bg-white">
            <div className="flex items-start gap-4 mb-4">
              <span className="flex-shrink-0 w-8 h-8 bg-[#2f829b] text-white rounded-full flex items-center justify-center font-['Poppins'] font-semibold text-sm">
                6
              </span>
              <div className="flex-1">
                <h3 className="font-['Poppins'] font-semibold text-[#034863] mb-1">
                  Where do you suspect there may be friction, confusion, or drop-off?
                </h3>
                <p className="text-sm text-slate-500 mb-4 italic">
                  Early self-awareness of experience gaps.
                </p>
              </div>
            </div>
            <Textarea
              value={frictionPoints}
              onChange={(e) => setFrictionPoints(e.target.value)}
              placeholder="Describe areas where you suspect users might struggle or disengage..."
              rows={4}
              required
              className="font-['Poppins']"
            />
          </Card>

          {/* Question 7 Card */}
          <Card className="p-8 border-2 border-[#ddecf0] rounded-xl bg-white">
            <div className="flex items-start gap-4 mb-4">
              <span className="flex-shrink-0 w-8 h-8 bg-[#2f829b] text-white rounded-full flex items-center justify-center font-['Poppins'] font-semibold text-sm">
                7
              </span>
              <div className="flex-1">
                <h3 className="font-['Poppins'] font-semibold text-[#034863] mb-1">
                  What questions or uncertainties are you hoping this audit will help clarify?
                </h3>
                <p className="text-sm text-slate-500 mb-4 italic">
                  Aligns expectations and focus.
                </p>
              </div>
            </div>
            <Textarea
              value={auditGoals}
              onChange={(e) => setAuditGoals(e.target.value)}
              placeholder="What specific insights or clarity are you seeking from this audit..."
              rows={4}
              required
              className="font-['Poppins']"
            />
          </Card>

          {/* Question 8 - Product Access Card */}
          <Card className="p-8 border-2 border-[#ddecf0] rounded-xl bg-white">
            <div className="flex items-start gap-4 mb-6">
              <span className="flex-shrink-0 w-8 h-8 bg-[#2f829b] text-white rounded-full flex items-center justify-center font-['Poppins'] font-semibold text-sm">
                8
              </span>
              <div className="flex-1">
                <h3 className="font-['Poppins'] font-semibold text-[#034863] mb-1">
                  Product Access & Context
                </h3>
                <p className="text-sm text-slate-500 mb-4 italic">
                  Please share any relevant access or materials below.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block font-['Poppins'] text-sm font-medium text-slate-700 mb-2">
                  <Upload className="w-4 h-4 inline mr-2" />
                  Product Login or Demo Credentials
                </label>
                <Textarea
                  value={loginCredentials}
                  onChange={(e) => setLoginCredentials(e.target.value)}
                  placeholder="Username, password, or instructions to access the product..."
                  rows={3}
                  required
                  className="font-['Poppins']"
                />
              </div>

              <div>
                <label className="block font-['Poppins'] text-sm font-medium text-slate-700 mb-2">
                  <LinkIcon className="w-4 h-4 inline mr-2" />
                  Demo Links or Test Environment
                </label>
                <Textarea
                  value={demoLinks}
                  onChange={(e) => setDemoLinks(e.target.value)}
                  placeholder="Paste links to demo environment, staging site, or test accounts..."
                  rows={3}
                  required
                  className="font-['Poppins']"
                />
              </div>

              <div>
                <label className="block font-['Poppins'] text-sm font-medium text-slate-700 mb-2">
                  <LinkIcon className="w-4 h-4 inline mr-2" />
                  Product Documentation or Onboarding Materials
                </label>
                <Textarea
                  value={documentationLinks}
                  onChange={(e) => setDocumentationLinks(e.target.value)}
                  placeholder="Links to user guides, onboarding flows, help docs, etc..."
                  rows={3}
                  required
                  className="font-['Poppins']"
                />
              </div>

              <div>
                <label className="block font-['Poppins'] text-sm font-medium text-slate-700 mb-2">
                  Additional Notes or Context
                </label>
                <Textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Any other information that would be helpful for the audit..."
                  rows={3}
                  className="font-['Poppins']"
                />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Document Footer */}
      <div className="max-w-3xl mx-auto px-8 pb-12">
        <DocumentFooter />
      </div>
    </div>
  );
}