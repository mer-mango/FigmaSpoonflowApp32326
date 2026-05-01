import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card } from '../ui/card';
import { Send, Upload, CheckCircle2, FileText, X } from 'lucide-react';
import { RefinedHeader } from '../shared/RefinedHeader';
import { DocumentFooter } from '../shared/DocumentFooter';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface PreConsultGeneralFormProps {
  onBack: () => void;
  onPreview: (data: PreConsultGeneralData) => void;
  onSave?: () => void;
  backButtonLabel?: string;
}

export interface PreConsultGeneralData {
  contactName: string;
  contactEmail: string;
  organizationName: string;
  organizationDescription: string;
  uploadedDocuments: string[];
  organizationLinks: string;
  whatBringsYou: string;
  successLooksLike: string;
  alreadyTried: string;
  keyStakeholders: string;
  timeline: string;
  budget: string;
  howDidYouHear: string;
  howDidYouHearOther: string;
}

const BUDGET_OPTIONS = [
  '$750-1,500',
  '$1,500-5,000',
  '$5,000+'
];

const HOW_DID_YOU_HEAR_OPTIONS = [
  'Website',
  'Google',
  'LinkedIn',
  'Referral',
  'Other'
];

export function PreConsultGeneralForm({ onBack, onPreview, onSave, backButtonLabel = "Back to Dashboard" }: PreConsultGeneralFormProps) {
  // Template preview state
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [organizationDescription, setOrganizationDescription] = useState('');
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]);
  const [organizationLinks, setOrganizationLinks] = useState('');
  const [whatBringsYou, setWhatBringsYou] = useState('');
  const [successLooksLike, setSuccessLooksLike] = useState('');
  const [alreadyTried, setAlreadyTried] = useState('');
  const [keyStakeholders, setKeyStakeholders] = useState('');
  const [timeline, setTimeline] = useState('');
  const [budget, setBudget] = useState('');
  const [howDidYouHear, setHowDidYouHear] = useState('');
  const [howDidYouHearOther, setHowDidYouHearOther] = useState('');

  // If showing template preview, render it instead of the form
  if (showTemplatePreview) {
    return (
      <TemplateBasedFormPreview
        templateId="pre-consult-general"
        onBack={() => setShowTemplatePreview(false)}
      />
    );
  }
  
  const handleSubmit = () => {
    onPreview({
      contactName,
      contactEmail,
      organizationName,
      organizationDescription,
      uploadedDocuments,
      organizationLinks,
      whatBringsYou,
      successLooksLike,
      alreadyTried,
      keyStakeholders,
      timeline,
      budget,
      howDidYouHear,
      howDidYouHearOther
    });
  };

  const isFormValid = () => {
    return contactName.trim() && 
           contactEmail.trim() && 
           organizationName.trim();
  };

  return (
    <div className="min-h-screen bg-white">
      <RefinedHeader onBack={onBack} showBackButton={true} />

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="font-['Lora'] text-5xl text-[#034863] mb-3">Pre-Consult Questionnaire</h1>
            <p className="font-['Poppins'] text-lg text-[#2f829b] mb-4">Preliminary Consultation</p>
            
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
            </div>
          </div>

          <div className="space-y-8">
            {/* Intro Text */}
            <div className="bg-[#f5fafb] p-8 rounded-xl border-2 border-[#ddecf0]">
              <p className="font-['Poppins'] text-[16px] text-[#034863] leading-relaxed">
                Thank you for your interest in Empower Health Strategies. The questions below help me understand 
                your context and goals so our consultation can be as focused and useful as possible. This should 
                take just a few minutes to complete.
              </p>
            </div>

            {/* Question 1 */}
            <Card className="p-8 border-2 border-[#ddecf0] rounded-xl bg-white">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2f829b] text-white flex items-center justify-center font-medium">1</div>
                <div className="flex-1">
                  <label className="block font-['Poppins'] font-semibold text-[#034863] mb-2">
                    Briefly tell us about your organization and the work you do.
                  </label>
                  <Textarea
                    value={organizationDescription}
                    onChange={(e) => setOrganizationDescription(e.target.value)}
                    rows={5}
                    required
                    className="font-['Poppins']"
                    placeholder="Tell us about your organization and work..."
                  />
                  
                  {/* File Upload Section */}
                  <div className="mt-6">
                    <label className="block font-['Poppins'] text-[#034863] mb-2">
                      Upload Documents (optional)
                    </label>
                    <label className="flex items-center justify-center w-full px-6 py-4 border-2 border-dashed border-[#2f829b] rounded-lg cursor-pointer hover:bg-[#f5fafb] transition-colors">
                      <Upload className="w-5 h-5 text-[#2f829b] mr-2" />
                      <span className="font-['Poppins'] text-[#2f829b]">Choose Files to Upload</span>
                      <input
                        type="file"
                        multiple
                        className="hidden"
                      />
                    </label>
                  </div>
                  
                  <div className="mt-6">
                    <label className="block font-['Poppins'] text-[#034863] mb-2">
                      Links or Additional Materials (optional)
                    </label>
                    <p className="font-['Poppins'] text-sm text-[#034863]/70 mb-2">
                      Examples: website link, product overview, slide deck, demo link, or other relevant materials
                    </p>
                    <Textarea
                      value={organizationLinks}
                      onChange={(e) => setOrganizationLinks(e.target.value)}
                      rows={3}
                      placeholder="Paste links or describe materials here..."
                      className="font-['Poppins']"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Question 2 */}
            <Card className="p-8 border-2 border-[#ddecf0] rounded-xl bg-white">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2f829b] text-white flex items-center justify-center font-medium">2</div>
                <div className="flex-1">
                  <label className="block font-['Poppins'] font-semibold text-[#034863] mb-2">
                    What brings you to Empower Health Strategies right now?
                  </label>
                  <Textarea
                    value={whatBringsYou}
                    onChange={(e) => setWhatBringsYou(e.target.value)}
                    rows={4}
                    required
                    className="font-['Poppins']"
                    placeholder="Share what prompted you to reach out..."
                  />
                </div>
              </div>
            </Card>

            {/* Question 3 */}
            <Card className="p-8 border-2 border-[#ddecf0] rounded-xl bg-white">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2f829b] text-white flex items-center justify-center font-medium">3</div>
                <div className="flex-1">
                  <label className="block font-['Poppins'] font-semibold text-[#034863] mb-2">
                    What would success look like for you?
                  </label>
                  <Textarea
                    value={successLooksLike}
                    onChange={(e) => setSuccessLooksLike(e.target.value)}
                    rows={4}
                    required
                    className="font-['Poppins']"
                    placeholder="Describe your desired outcomes..."
                  />
                </div>
              </div>
            </Card>

            {/* Question 4 */}
            <Card className="p-8 border-2 border-[#ddecf0] rounded-xl bg-white">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2f829b] text-white flex items-center justify-center font-medium">4</div>
                <div className="flex-1">
                  <label className="block font-['Poppins'] font-semibold text-[#034863] mb-2">
                    What have you already tried or explored to address this?
                  </label>
                  <Textarea
                    value={alreadyTried}
                    onChange={(e) => setAlreadyTried(e.target.value)}
                    rows={4}
                    required
                    className="font-['Poppins']"
                    placeholder="Share your past efforts and experiences..."
                  />
                </div>
              </div>
            </Card>

            {/* Question 5 */}
            <Card className="p-8 border-2 border-[#ddecf0] rounded-xl bg-white">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2f829b] text-white flex items-center justify-center font-medium">5</div>
                <div className="flex-1">
                  <label className="block font-['Poppins'] font-semibold text-[#034863] mb-2">
                    Who are the key stakeholders or decision-makers involved in this work?
                  </label>
                  <Textarea
                    value={keyStakeholders}
                    onChange={(e) => setKeyStakeholders(e.target.value)}
                    rows={4}
                    required
                    className="font-['Poppins']"
                    placeholder="Identify the key people involved..."
                  />
                </div>
              </div>
            </Card>

            {/* Question 6 - Timeline */}
            <Card className="p-8 border-2 border-[#ddecf0] rounded-xl bg-white">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2f829b] text-white flex items-center justify-center font-medium">6</div>
                <div className="flex-1">
                  <label className="block font-['Poppins'] font-semibold text-[#034863] mb-2">
                    What's your ideal timeline for getting started?
                  </label>
                  <Textarea
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    rows={3}
                    required
                    className="font-['Poppins']"
                    placeholder="Share your preferred timeline or any relevant deadlines..."
                  />
                </div>
              </div>
            </Card>

            {/* Question 7 - Budget */}
            <Card className="p-8 border-2 border-[#ddecf0] rounded-xl bg-white">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2f829b] text-white flex items-center justify-center font-medium">7</div>
                <div className="flex-1">
                  <label className="block font-['Poppins'] font-semibold text-[#034863] mb-4">
                    What's your estimated budget range for this work? *
                  </label>
                  <Select value={budget} onValueChange={setBudget}>
                    <SelectTrigger className="w-full font-['Poppins'] border-2 border-[#ddecf0] rounded-lg h-12">
                      <SelectValue placeholder="Select budget range..." />
                    </SelectTrigger>
                    <SelectContent>
                      {BUDGET_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option} className="font-['Poppins']">
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Question 8 - How did you hear */}
            <Card className="p-8 border-2 border-[#ddecf0] rounded-xl bg-white">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2f829b] text-white flex items-center justify-center font-medium">8</div>
                <div className="flex-1">
                  <label className="block font-['Poppins'] font-semibold text-[#034863] mb-4">
                    How did you hear about Empower Health Strategies? *
                  </label>
                  <Select value={howDidYouHear} onValueChange={setHowDidYouHear}>
                    <SelectTrigger className="w-full font-['Poppins'] border-2 border-[#ddecf0] rounded-lg h-12">
                      <SelectValue placeholder="Select an option..." />
                    </SelectTrigger>
                    <SelectContent>
                      {HOW_DID_YOU_HEAR_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option} className="font-['Poppins']">
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {howDidYouHear === 'Other' && (
                    <div className="mt-4">
                      <Input
                        value={howDidYouHearOther}
                        onChange={(e) => setHowDidYouHearOther(e.target.value)}
                        placeholder="Please specify..."
                        className="font-['Poppins']"
                      />
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Closing Message */}
            <div className="bg-[#f5fafb] p-6 rounded-lg border-2 border-[#ddecf0]">
              <p className="font-['Poppins'] text-[16px] text-[#034863] leading-relaxed">
                Thanks for taking the time to share this context. I'll review your responses ahead of our conversation 
                so we can make the most of our time together. Please don't hesitate to email me at{' '}
                <a 
                  href="mailto:meredith@empowerhealthstrategies.com" 
                  className="text-[#2f829b] underline hover:text-[#034863]"
                >
                  meredith@empowerhealthstrategies.com
                </a>
                {' '}if you have any questions or have additional information to share.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                onClick={onBack}
                variant="outline"
                className="border-2 border-[#034863] text-[#034863] hover:bg-[#f5fafb] font-['Poppins'] rounded-lg px-8 py-3"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!isFormValid()}
                className="bg-[#6b2358] hover:bg-[#6b2358]/90 text-white font-['Poppins'] rounded-lg px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5 mr-2" />
                Submit Questionnaire
              </Button>
            </div>
          </div>

          <DocumentFooter />
        </div>
      </div>
    </div>
  );
}