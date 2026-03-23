import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card } from '../ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '../ui/select';
import { Eye, Save, ArrowLeft, Upload, CheckCircle2, Send, FileText, X } from 'lucide-react';
import { RefinedHeader } from '../shared/RefinedHeader';
import { Service } from '../../../App';

interface AuditPreConsultFormProps {
  onBack: () => void;
  onPreview: (data: AuditPreConsultData) => void;
  onSave?: () => void;
  backButtonLabel?: string;
  services?: Service[];
  linkedService?: Service;
}

export interface AuditPreConsultData {
  organizationDescription: string;
  uploadedDocuments: string[];
  productStage: string;
  auditPrompt: string;
  areasToClarity: string[];
  areasOtherText: string;
  decisionInvolvement: string;
  consultationGoals: string[];
  consultationGoalsOther: string;
  timeline: string;
  budget: string;
  howDidYouHear: string;
  howDidYouHearOther: string;
  
  // Contact info
  contactName: string;
  contactEmail: string;
  organizationName: string;
  
  // Personalization fields
  customTitle?: string;
  customSubtitle?: string;
}

const PRODUCT_STAGES = [
  'Concept / early validation',
  'MVP or pilot',
  'Live with users',
  'Scaling or iterating on an existing product'
];

const CLARITY_AREAS = [
  'Patient needs or pain points',
  'Alignment between product and real-world care journeys',
  'Adoption or engagement challenges',
  'Patient satisfaction scores',
  'Internal alignment or decision-making',
  'Something else'
];

const CONSULTATION_GOALS = [
  'To learn more about the audit process',
  'To get a preliminary expert perspective on our product or care experience patient experience challenges or current strategy',
  'To leave with more clarity about what next steps could look like',
  'Other'
];

const BUDGET_OPTIONS = [
  '$750-1,500',
  '$1,500-5,000',
  '$5,000+'
];

const HOW_DID_YOU_HEAR = [
  'Website',
  'Google',
  'LinkedIn',
  'Referral',
  'Other'
];

export function AuditPreConsultForm({ onBack, onPreview, onSave, backButtonLabel, services, linkedService }: AuditPreConsultFormProps) {
  // Custom title/subtitle for personalization
  const [customTitle, setCustomTitle] = useState('');
  const [customSubtitle, setCustomSubtitle] = useState('');
  
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [organizationDescription, setOrganizationDescription] = useState('');
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]);
  const [productStage, setProductStage] = useState('');
  const [auditPrompt, setAuditPrompt] = useState('');
  const [areasToClarity, setAreasToClarity] = useState<string[]>([]);
  const [areasOtherText, setAreasOtherText] = useState('');
  const [decisionInvolvement, setDecisionInvolvement] = useState('');
  const [consultationGoals, setConsultationGoals] = useState<string[]>([]);
  const [consultationGoalsOther, setConsultationGoalsOther] = useState('');
  const [timeline, setTimeline] = useState('');
  const [budget, setBudget] = useState('');
  const [howDidYouHear, setHowDidYouHear] = useState('');
  const [howDidYouHearOther, setHowDidYouHearOther] = useState('');
  
  // Default titles if custom not provided
  const defaultTitle = 'Pre-Consultation Questionnaire: Audit';
  const defaultSubtitle = 'Innovation PX & Impact Audit';
  
  // Use custom or default
  const displayTitle = customTitle || defaultTitle;
  const displaySubtitle = customSubtitle || defaultSubtitle;

  const handleAreasToggle = (area: string) => {
    if (areasToClarity.includes(area)) {
      setAreasToClarity(areasToClarity.filter(a => a !== area));
    } else {
      setAreasToClarity([...areasToClarity, area]);
    }
  };

  const handleGoalsToggle = (goal: string) => {
    if (consultationGoals.includes(goal)) {
      setConsultationGoals(consultationGoals.filter(g => g !== goal));
    } else {
      setConsultationGoals([...consultationGoals, goal]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileNames = Array.from(files).map(f => f.name);
      setUploadedDocuments([...uploadedDocuments, ...fileNames]);
    }
  };

  const handleSubmit = () => {
    onPreview({
      contactName,
      contactEmail,
      organizationName,
      organizationDescription,
      uploadedDocuments,
      productStage,
      auditPrompt,
      areasToClarity,
      areasOtherText,
      decisionInvolvement,
      consultationGoals,
      consultationGoalsOther,
      timeline,
      budget,
      howDidYouHear,
      howDidYouHearOther,
      customTitle,
      customSubtitle
    });
  };

  const isFormValid = () => {
    return contactName.trim() && 
           contactEmail.trim() && 
           organizationName.trim() &&
           organizationDescription.trim() && 
           productStage && 
           auditPrompt.trim() && 
           areasToClarity.length > 0 && 
           decisionInvolvement.trim() && 
           consultationGoals.length > 0;
  };

  useEffect(() => {
    if (linkedService) {
      setContactName(linkedService.contactName || '');
      setContactEmail(linkedService.contactEmail || '');
      setOrganizationName(linkedService.organizationName || '');
      setOrganizationDescription(linkedService.organizationDescription || '');
      setUploadedDocuments(linkedService.uploadedDocuments || []);
      setProductStage(linkedService.productStage || '');
      setAuditPrompt(linkedService.auditPrompt || '');
      setAreasToClarity(linkedService.areasToClarity || []);
      setAreasOtherText(linkedService.areasOtherText || '');
      setDecisionInvolvement(linkedService.decisionInvolvement || '');
      setConsultationGoals(linkedService.consultationGoals || []);
      setConsultationGoalsOther(linkedService.consultationGoalsOther || '');
      setTimeline(linkedService.timeline || '');
      setBudget(linkedService.budget || '');
      setHowDidYouHear(linkedService.howDidYouHear || '');
      setHowDidYouHearOther(linkedService.howDidYouHearOther || '');
      setCustomTitle(linkedService.customTitle || '');
      setCustomSubtitle(linkedService.customSubtitle || '');
    }
  }, [linkedService]);

  return (
    <div className="min-h-screen bg-white">
      <RefinedHeader onBack={onBack} showBackButton={true} />

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="font-['Lora'] text-5xl text-[#034863] mb-3">{displayTitle}</h1>
            <p className="font-['Poppins'] text-lg text-[#2f829b] mb-4">{displaySubtitle}</p>
            
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
              <p className="font-['Poppins'] text-[16px] text-slate-700 leading-relaxed">
                Thank you for your interest in exploring an Innovation Patient Experience (PX) & Impact Audit. 
                The questions below help me understand your context and goals so our consultation can be as focused 
                and useful as possible. This should take just a few minutes to complete.
              </p>
            </div>

            {/* Question 1 */}
            <Card className="p-8 border-2 border-[#ddecf0] rounded-xl bg-white">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2f829b] text-white flex items-center justify-center text-lg font-medium">1</div>
                <div className="flex-1">
                  <label className="block font-['Poppins'] font-semibold text-[#034863] mb-2 text-[20px]">
                    Briefly share about your organization and the product or care experience you're working on. *
                  </label>
                  <Textarea
                    value={organizationDescription}
                    onChange={(e) => setOrganizationDescription(e.target.value)}
                    rows={5}
                    required
                    className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                    placeholder="Tell us about your organization, product, and care experience..."
                  />
                  
                  {/* File Upload Section */}
                  <div className="mt-6">
                    <label className="block font-['Poppins'] text-[16px] text-[#034863] mb-2">
                      Upload Documents (optional)
                    </label>
                    <label className="flex items-center justify-center w-full px-6 py-4 border-2 border-dashed border-[#2f829b] rounded-lg cursor-pointer hover:bg-[#f5fafb] transition-colors">
                      <Upload className="w-5 h-5 text-[#2f829b] mr-2" />
                      <span className="font-['Poppins'] text-[#2f829b]">Choose Files to Upload</span>
                      <input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    {uploadedDocuments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {uploadedDocuments.map((doc, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm font-['Poppins'] text-[#034863]">
                            <CheckCircle2 className="w-4 h-4 text-[#2f829b]" />
                            {doc}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6">
                    <label className="block font-['Poppins'] text-[16px] text-[#034863] mb-2">
                      Links or Additional Materials (optional)
                    </label>
                    <p className="font-['Poppins'] text-sm text-[#034863]/70 mb-2">
                      Examples: website link, product overview, slide deck, demo link, or other relevant materials
                    </p>
                    <Textarea
                      rows={3}
                      placeholder="Paste links or describe materials here..."
                      className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Question 2 */}
            <Card className="p-8 border-2 border-[#ddecf0] rounded-xl bg-white">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2f829b] text-white flex items-center justify-center text-lg font-medium">2</div>
                <div className="flex-1">
                  <label className="block font-['Poppins'] font-semibold text-[#034863] mb-4 text-[20px]">
                    If you're building a specific product, what stage is it currently in? *
                  </label>
                  <div className="space-y-3">
                    {PRODUCT_STAGES.map((stage) => (
                      <label
                        key={stage}
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          productStage === stage
                            ? 'border-[#6b2358] bg-[#6b2358]/5'
                            : 'border-[#ddecf0] hover:border-[#2f829b]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="productStage"
                          value={stage}
                          checked={productStage === stage}
                          onChange={(e) => setProductStage(e.target.value)}
                          className="mr-3 h-5 w-5 text-[#6b2358]"
                        />
                        <span className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]">{stage}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Question 3 */}
            <Card className="p-8 border-2 border-[#ddecf0] rounded-xl bg-white">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2f829b] text-white flex items-center justify-center text-lg font-medium">3</div>
                <div className="flex-1">
                  <label className="block font-['Poppins'] font-semibold text-[#034863] mb-2 text-[20px]">
                    What prompted you to seek a Patient Experience (PX) & Impact Audit now? *
                  </label>
                  <Textarea
                    value={auditPrompt}
                    onChange={(e) => setAuditPrompt(e.target.value)}
                    rows={4}
                    required
                    className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                    placeholder="Share what prompted your decision to seek an audit..."
                  />
                </div>
              </div>
            </Card>

            {/* Question 4 */}
            <Card className="p-8 border-2 border-[#ddecf0] rounded-xl bg-white">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2f829b] text-white flex items-center justify-center text-lg font-medium">4</div>
                <div className="flex-1">
                  <label className="block font-['Poppins'] font-semibold text-[#034863] mb-4 text-[20px]">
                    Which areas are you most hoping an audit will help clarify or improve? *
                  </label>
                  <p className="font-['Poppins'] text-sm text-[#034863]/70 mb-4">Select all that apply</p>
                  <div className="space-y-3">
                    {CLARITY_AREAS.map((area) => (
                      <label
                        key={area}
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          areasToClarity.includes(area)
                            ? 'border-[#6b2358] bg-[#6b2358]/5'
                            : 'border-[#ddecf0] hover:border-[#2f829b]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={areasToClarity.includes(area)}
                          onChange={() => handleAreasToggle(area)}
                          className="mr-3 h-5 w-5 text-[#6b2358] rounded"
                        />
                        <span className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]">{area}</span>
                      </label>
                    ))}
                  </div>
                  {areasToClarity.includes('Something else') && (
                    <div className="mt-4">
                      <Textarea
                        value={areasOtherText}
                        onChange={(e) => setAreasOtherText(e.target.value)}
                        rows={2}
                        className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                        placeholder="Please specify..."
                      />
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Question 5 */}
            <Card className="p-8 border-2 border-[#ddecf0] rounded-xl bg-white">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2f829b] text-white flex items-center justify-center text-lg font-medium">5</div>
                <div className="flex-1">
                  <label className="block font-['Poppins'] font-semibold text-[#034863] mb-2 text-[20px]">
                    Who is involved in product or experience decisions today? *
                  </label>
                  <Textarea
                    value={decisionInvolvement}
                    onChange={(e) => setDecisionInvolvement(e.target.value)}
                    rows={4}
                    required
                    className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                    placeholder="Describe the team members and their roles..."
                  />
                </div>
              </div>
            </Card>

            {/* Question 6 */}
            <Card className="p-8 border-2 border-[#ddecf0] rounded-xl bg-white">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2f829b] text-white flex items-center justify-center text-lg font-medium">6</div>
                <div className="flex-1">
                  <label className="block font-['Poppins'] font-semibold text-[#034863] mb-4 text-[20px]">
                    What would make this preliminary consultation feel successful for you? *
                  </label>
                  <p className="font-['Poppins'] text-sm text-[#034863]/70 mb-4">Select all that apply</p>
                  <div className="space-y-3">
                    {CONSULTATION_GOALS.map((goal) => (
                      <label
                        key={goal}
                        className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          consultationGoals.includes(goal)
                            ? 'border-[#6b2358] bg-[#6b2358]/5'
                            : 'border-[#ddecf0] hover:border-[#2f829b]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={consultationGoals.includes(goal)}
                          onChange={() => handleGoalsToggle(goal)}
                          className="mr-3 h-5 w-5 text-[#6b2358] rounded mt-0.5 flex-shrink-0"
                        />
                        <span className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]">{goal}</span>
                      </label>
                    ))}
                  </div>
                  {consultationGoals.includes('Other') && (
                    <div className="mt-4">
                      <Textarea
                        value={consultationGoalsOther}
                        onChange={(e) => setConsultationGoalsOther(e.target.value)}
                        rows={2}
                        className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                        placeholder="Please specify..."
                      />
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Question 7 - Timeline */}
            <Card className="p-8 border-2 border-[#ddecf0] rounded-xl bg-white">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2f829b] text-white flex items-center justify-center text-lg font-medium">7</div>
                <div className="flex-1">
                  <label className="block font-['Poppins'] font-semibold text-[#034863] mb-2 text-[20px]">
                    What's your ideal timeline for getting started?
                  </label>
                  <Textarea
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    rows={3}
                    required
                    className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                    placeholder="Share your preferred timeline or any relevant deadlines..."
                  />
                </div>
              </div>
            </Card>

            {/* Question 8 - Budget */}
            <Card className="p-8 border-2 border-[#ddecf0] rounded-xl bg-white">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2f829b] text-white flex items-center justify-center text-lg font-medium">8</div>
                <div className="flex-1">
                  <label className="block font-['Poppins'] font-semibold text-[#034863] mb-4 text-[20px]">
                    What is your budget for this audit? *
                  </label>
                  <Select value={budget} onValueChange={setBudget}>
                    <SelectTrigger className="w-full font-['Poppins'] text-[18px] text-[rgb(0,0,0)] border-2 border-[#ddecf0] rounded-lg h-12">
                      <SelectValue placeholder="Select budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUDGET_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option} className="font-['Poppins'] text-[18px]">
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Question 9 */}
            <Card className="p-8 border-2 border-[#ddecf0] rounded-xl bg-white">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2f829b] text-white flex items-center justify-center text-lg font-medium">9</div>
                <div className="flex-1">
                  <label className="block font-['Poppins'] font-semibold text-[#034863] mb-4 text-[20px]">
                    How did you hear about Empower Health Strategies? *
                  </label>
                  <Select value={howDidYouHear} onValueChange={setHowDidYouHear}>
                    <SelectTrigger className="w-full font-['Poppins'] text-[18px] text-[rgb(0,0,0)] border-2 border-[#ddecf0] rounded-lg h-12">
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      {HOW_DID_YOU_HEAR.map((option) => (
                        <SelectItem key={option} value={option} className="font-['Poppins'] text-[18px]">
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
                        className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                        placeholder="Please specify..."
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
        </div>
      </div>
    </div>
  );
}