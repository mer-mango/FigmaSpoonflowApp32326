import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Eye, ArrowLeft, Save } from 'lucide-react';
import { Card } from '../ui/card';
import { DocumentFooter } from '../shared/DocumentFooter';

interface WorkshopPreConsultFormProps {
  onBack: () => void;
  onPreview: (data: WorkshopPreConsultData) => void;
  services?: Service[];
  linkedService?: Service;
}

export interface WorkshopPreConsultData {
  contactName: string;
  contactEmail: string;
  organizationName: string;
  organizationContext: string;
  organizationLinks: string;
  targetAudience: string[];
  targetAudienceOther: string;
  attendeeCount: string;
  engagementTypes: string[];
  whatPrompted: string;
  questionsToAddress: string;
  timeline: string;
  budget: string;
  howDidYouHear: string;
  howDidYouHearOther: string;
}

const BUDGET_OPTIONS = [
  '$1,000-2,500',
  '$2,500-5,000',
  '$5,000+'
];

const HOW_DID_YOU_HEAR_OPTIONS = [
  'Website',
  'Google',
  'LinkedIn',
  'Referral',
  'Other'
];

const TARGET_AUDIENCE_OPTIONS = [
  'Digital health or product teams',
  'Clinicians transitioning into health tech',
  'Founders or executive leadership',
  'Accelerator or incubator cohort',
  'Cross-functional teams',
  'Other'
];

const ATTENDEE_COUNT_OPTIONS = [
  'Under 5 people',
  '5–10 people',
  '10–20 people',
  '20–30 people',
  '30+ people'
];

const ENGAGEMENT_TYPE_OPTIONS = [
  'A one-off workshop or training session',
  'A short series or multi-module training',
  'Ongoing advisory or mentorship',
  'Not sure yet / open to recommendations'
];

export function WorkshopPreConsultForm({ onBack, onPreview, services, linkedService }: WorkshopPreConsultFormProps) {
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [organizationContext, setOrganizationContext] = useState('');
  const [organizationLinks, setOrganizationLinks] = useState('');
  const [targetAudience, setTargetAudience] = useState<string[]>([]);
  const [targetAudienceOther, setTargetAudienceOther] = useState('');
  const [attendeeCount, setAttendeeCount] = useState('');
  const [engagementTypes, setEngagementTypes] = useState<string[]>([]);
  const [whatPrompted, setWhatPrompted] = useState('');
  const [questionsToAddress, setQuestionsToAddress] = useState('');
  const [timeline, setTimeline] = useState('');
  const [budget, setBudget] = useState('');
  const [howDidYouHear, setHowDidYouHear] = useState('');
  const [howDidYouHearOther, setHowDidYouHearOther] = useState('');

  const handleTargetAudienceToggle = (option: string) => {
    if (targetAudience.includes(option)) {
      setTargetAudience(targetAudience.filter(item => item !== option));
    } else {
      setTargetAudience([...targetAudience, option]);
    }
  };

  const handleEngagementTypeToggle = (option: string) => {
    if (engagementTypes.includes(option)) {
      setEngagementTypes(engagementTypes.filter(item => item !== option));
    } else {
      setEngagementTypes([...engagementTypes, option]);
    }
  };

  const handleSubmit = () => {
    onPreview({
      contactName,
      contactEmail,
      organizationName,
      organizationContext,
      organizationLinks,
      targetAudience,
      targetAudienceOther,
      attendeeCount,
      engagementTypes,
      whatPrompted,
      questionsToAddress,
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
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8 mt-6">
          <div>
            <h1 className="font-['Lora'] text-4xl text-[#034863] mb-1">PX Strategy Workshop & Training</h1>
            <p className="font-['Poppins'] text-lg text-[#2f829b] text-[20px]">Pre-Consultation Questionnaire</p>
          </div>
          <Button
            onClick={onBack}
            variant="outline"
            className="border-2 border-[#034863] text-[#034863] hover:bg-[#f5fafb] font-['Poppins'] rounded-lg"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Flow Wizard
          </Button>
        </div>

        <div className="py-8">
          <div className="space-y-8">
            {/* Intro Text */}
            <div className="bg-[#f5fafb] p-8 rounded-xl border-2 border-[#ddecf0]">
              <p className="font-['Poppins'] text-[16px] text-[#034863] leading-relaxed">
                Thank you for your interest in exploring a Patient Experience (PX) Strategy Workshop or Training. 
                The questions below help me understand your context and goals so our consultation can be as focused 
                and useful as possible. This should take just a few minutes to complete.
              </p>
            </div>

            {/* Contact Information */}
            <Card className="p-8 border-2 border-[#ddecf0] rounded-xl bg-white">
              <h2 className="font-['Lora'] text-3xl text-[#034863] mb-6">Contact Information</h2>
              <div className="space-y-6">
                <div>
                  <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                    Your Name *
                  </label>
                  <Input
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                    className="font-['Poppins']"
                    placeholder="Your name..."
                  />
                </div>
                <div>
                  <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                    className="font-['Poppins']"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                    Organization Name *
                  </label>
                  <Input
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    required
                    className="font-['Poppins']"
                    placeholder="Organization name..."
                  />
                </div>
              </div>
            </Card>

            {/* Question 1 */}
            <Card className="p-8 border-2 border-[#ddecf0] rounded-xl bg-white">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2f829b] text-white flex items-center justify-center text-lg font-medium">1</div>
                <div className="flex-1">
                  <label className="block font-['Poppins'] font-semibold text-[#034863] mb-2 text-[20px]">
                    Briefly tell us about your organization and the work you do.
                  </label>
                  <Textarea
                    value={organizationContext}
                    onChange={(e) => setOrganizationContext(e.target.value)}
                    rows={5}
                    required
                    className="font-['Poppins']"
                    placeholder="Tell us about your organization and work..."
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
                        className="hidden"
                      />
                    </label>
                  </div>
                  
                  <div className="mt-6">
                    <label className="block font-['Poppins'] text-[16px] text-[#034863] mb-2">
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
                    Who would this virtual workshop or training be for? *
                  </label>
                  <p className="font-['Poppins'] text-sm text-[#034863]/70 mb-4">Select all that apply</p>
                  <div className="space-y-3">
                    {TARGET_AUDIENCE_OPTIONS.map((option) => (
                      <label
                        key={option}
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          targetAudience.includes(option)
                            ? 'border-[#6b2358] bg-[#6b2358]/5'
                            : 'border-[#ddecf0] hover:border-[#2f829b]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={targetAudience.includes(option)}
                          onChange={() => handleTargetAudienceToggle(option)}
                          className="mr-3 h-5 w-5 text-[#6b2358] rounded"
                        />
                        <span className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]">{option}</span>
                      </label>
                    ))}
                  </div>
                  {targetAudience.includes('Other') && (
                    <div className="mt-4">
                      <Input
                        value={targetAudienceOther}
                        onChange={(e) => setTargetAudienceOther(e.target.value)}
                        placeholder="Please specify..."
                        className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                      />
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Question 3 */}
            <Card className="p-8 border-2 border-[#ddecf0] rounded-xl bg-white">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2f829b] text-white flex items-center justify-center text-lg font-medium">3</div>
                <div className="flex-1">
                  <label className="block font-['Poppins'] font-semibold text-[#034863] mb-4 text-[20px]">
                    Approximately how many people would this workshop or training be for? *
                  </label>
                  <Select value={attendeeCount} onValueChange={setAttendeeCount}>
                    <SelectTrigger className="w-full font-['Poppins'] text-[18px] text-[rgb(0,0,0)] border-2 border-[#ddecf0] rounded-lg h-12">
                      <SelectValue placeholder="Select number of attendees..." />
                    </SelectTrigger>
                    <SelectContent>
                      {ATTENDEE_COUNT_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option} className="font-['Poppins'] text-[18px]">
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Question 4 */}
            <Card className="p-8 border-2 border-[#ddecf0] rounded-xl bg-white">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2f829b] text-white flex items-center justify-center text-lg font-medium">4</div>
                <div className="flex-1">
                  <label className="block font-['Poppins'] font-semibold text-[#034863] mb-4 text-[20px]">
                    What type(s) of engagement are you most interested in exploring? *
                  </label>
                  <p className="font-['Poppins'] text-sm text-[#034863]/70 mb-4">Select all that apply</p>
                  <div className="space-y-3">
                    {ENGAGEMENT_TYPE_OPTIONS.map((option) => (
                      <label
                        key={option}
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          engagementTypes.includes(option)
                            ? 'border-[#6b2358] bg-[#6b2358]/5'
                            : 'border-[#ddecf0] hover:border-[#2f829b]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={engagementTypes.includes(option)}
                          onChange={() => handleEngagementTypeToggle(option)}
                          className="mr-3 h-5 w-5 text-[#6b2358] rounded"
                        />
                        <span className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Question 5 */}
            <Card className="p-8 border-2 border-[#ddecf0] rounded-xl bg-white">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2f829b] text-white flex items-center justify-center text-lg font-medium">5</div>
                <div className="flex-1">
                  <label className="block font-['Poppins'] font-semibold text-[#034863] mb-2 text-[20px]">
                    What prompted you to explore a Patient Experience (PX) Strategy Workshop or Training at this time? *
                  </label>
                  <Textarea
                    value={whatPrompted}
                    onChange={(e) => setWhatPrompted(e.target.value)}
                    rows={4}
                    required
                    className="font-['Poppins']"
                    placeholder="Share what prompted your decision..."
                  />
                </div>
              </div>
            </Card>

            {/* Question 6 */}
            <Card className="p-8 border-2 border-[#ddecf0] rounded-xl bg-white">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2f829b] text-white flex items-center justify-center text-lg font-medium">6</div>
                <div className="flex-1">
                  <label className="block font-['Poppins'] font-semibold text-[#034863] mb-2 text-[20px]">
                    What questions do you hope to address during the consultation and/or is there anything else you'd like to share before we connect? *
                  </label>
                  <Textarea
                    value={questionsToAddress}
                    onChange={(e) => setQuestionsToAddress(e.target.value)}
                    rows={4}
                    required
                    className="font-['Poppins']"
                    placeholder="Share your questions and any additional information..."
                  />
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
                    className="font-['Poppins']"
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
                    What is your budget? *
                  </label>
                  <Select value={budget} onValueChange={setBudget}>
                    <SelectTrigger className="w-full font-['Poppins'] text-[18px] text-[rgb(0,0,0)] border-2 border-[#ddecf0] rounded-lg h-12">
                      <SelectValue placeholder="Select budget range..." />
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
                      <SelectValue placeholder="Select an option..." />
                    </SelectTrigger>
                    <SelectContent>
                      {HOW_DID_YOU_HEAR_OPTIONS.map((option) => (
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
                        placeholder="Please specify..."
                        className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
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
                <Save className="w-5 h-5 mr-2" />
                Submit Questionnaire
              </Button>
            </div>
          </div>
        </div>
        <DocumentFooter />
      </div>
    </div>
  );
}