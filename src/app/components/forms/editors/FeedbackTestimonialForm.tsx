import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Eye, Save } from 'lucide-react';
import { ServiceSelector } from '../shared/ServiceSelector';

interface FeedbackTestimonialFormProps {
  onPreview: (data: FeedbackTestimonialData) => void;
  onBack: () => void;
  onSave?: () => void;
  onSaveAndFinishLater?: (data: FeedbackTestimonialData) => void;
  backButtonLabel?: string;
  services?: Service[];
  initialData?: FeedbackTestimonialData;
}

export interface FeedbackTestimonialData {
  // Linking
  serviceId: string;
  serviceName: string;
  
  // Intro/Outro
  introText: string;
  closingText: string;
  
  // Questions (customizable)
  question1: string;
  question2: string;
  question3: string;
  
  // Responses (empty in editor, filled by client)
  answer1?: string;
  answer2?: string;
  answer3?: string;
  
  // Testimonial Permission
  testimonialQuestion: string;
  testimonialPermission?: string;
  
  // Credit Preference
  creditQuestion: string;
  creditPreference?: string;
}

export function FeedbackTestimonialForm({
  onPreview,
  onBack,
  onSave,
  onSaveAndFinishLater,
  backButtonLabel = 'Back to Forms Dashboard',
  services = [],
  initialData
}: FeedbackTestimonialFormProps) {
  // Linking
  const [serviceId, setServiceId] = useState(initialData?.serviceId || '');

  // Intro/Outro
  const [introText, setIntroText] = useState(
    initialData?.introText ||
      'Thank you for partnering with Empower Health Strategies. Your feedback helps me continuously improve and better serve healthcare organizations like yours.\n\nThis brief questionnaire will take about 10 minutes. Your responses are invaluable for understanding what worked well and where there are opportunities to refine the experience.'
  );

  const [closingText, setClosingText] = useState(
    initialData?.closingText ||
      'Thank you for taking the time to share your feedback. Your insights are deeply appreciated and will help shape the work I do with future clients.\n\nIf you have any additional thoughts or questions, feel free to reach out anytime at meredith@empowerhealthstrategies.com.'
  );

  // Questions
  const [question1, setQuestion1] = useState(
    initialData?.question1 ||
      'What were the most valuable outcomes or deliverables from our work together?'
  );

  const [question2, setQuestion2] = useState(
    initialData?.question2 ||
      'Was there anything you wished had been different about the process, timeline, or deliverables?'
  );

  const [question3, setQuestion3] = useState(
    initialData?.question3 ||
      'Is there anything else you would like to share about your experience working with Empower Health Strategies?'
  );

  const [testimonialQuestion] = useState(
    'May I use your feedback as a testimonial on my website, in proposals, or in marketing materials?'
  );

  const [creditQuestion] = useState(
    'If yes, how would you like to be credited?'
  );

  const handlePreview = () => {
    const selectedService = services.find(s => s.id === serviceId);

    if (onSave) {
      onSave();
    }

    onPreview({
      serviceId,
      serviceName: selectedService?.name || '',
      introText,
      closingText,
      question1,
      question2,
      question3,
      testimonialQuestion,
      creditQuestion,
    });
  };

  const handleSaveAndFinishLater = () => {
    const selectedService = services.find(s => s.id === serviceId);

    if (onSaveAndFinishLater) {
      onSaveAndFinishLater({
        serviceId,
        serviceName: selectedService?.name || '',
        introText,
        closingText,
        question1,
        question2,
        question3,
        testimonialQuestion,
        creditQuestion,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f5fafb]">
      {/* Header */}
      <div className="w-full bg-white border-b border-[#ddecf0] py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-['Lora'] text-4xl text-[#034863] mb-1">Feedback & Testimonial Request</h1>
              <p className="font-['Poppins'] text-lg text-[#2f829b] text-[20px]">
                Gather client feedback and testimonials
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={onBack}
                variant="outline"
                className="border-2 border-[#034863] text-[#034863] hover:bg-[#f5fafb] font-['Poppins'] rounded-lg"
              >
                ← {backButtonLabel}
              </Button>
              {onSaveAndFinishLater && (
                <Button
                  onClick={handleSaveAndFinishLater}
                  className="bg-[#2f829b] hover:bg-[#034863] text-white font-['Poppins'] rounded-lg"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save and Finish Later
                </Button>
              )}
              <Button
                onClick={handlePreview}
                className="bg-[#6b2358] hover:bg-[#6b2358]/90 text-white font-['Poppins'] rounded-lg"
              >
                <Eye className="w-4 h-4 mr-2" />
                Save and Preview
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Service Linking */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <h2 className="font-['Lora'] text-3xl text-[#034863] mb-6">Link to Service</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ServiceSelector
                services={services}
                selectedServiceId={serviceId}
                onSelectService={setServiceId}
                label="Select Service"
              />
            </div>
          </div>

          {/* Introduction Text */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <h2 className="font-['Lora'] text-3xl text-[#034863] mb-6">Introduction</h2>
            <p className="font-['Poppins'] text-base text-[#a8998f] mb-4">
              Set the context for the client about why their feedback matters.
            </p>
            <Textarea
              value={introText}
              onChange={(e) => setIntroText(e.target.value)}
              rows={4}
              required
              className="font-['Poppins']"
              placeholder="Example: Your input helps me improve my services and better serve future clients. I'd love to hear about your experience working together."
            />
          </div>

          {/* Question 1 */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2f829b] text-white flex items-center justify-center text-lg font-medium">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-['Lora'] text-2xl text-[#034863] mb-2">Feedback Question 1</h3>
                <p className="font-['Poppins'] text-base text-[#a8998f] mb-4">
                  Ask about positive outcomes and value delivered.
                </p>
              </div>
            </div>
            <Textarea
              value={question1}
              onChange={(e) => setQuestion1(e.target.value)}
              rows={3}
              required
              className="font-['Poppins']"
              placeholder="Example: What challenge or need led you to seek support?"
            />
          </div>

          {/* Question 2 */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2f829b] text-white flex items-center justify-center text-lg font-medium">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-['Lora'] text-2xl text-[#034863] mb-2">Feedback Question 2</h3>
                <p className="font-['Poppins'] text-base text-[#a8998f] mb-4">
                  Ask about areas for improvement or what could have been different.
                </p>
              </div>
            </div>
            <Textarea
              value={question2}
              onChange={(e) => setQuestion2(e.target.value)}
              rows={3}
              required
              className="font-['Poppins']"
              placeholder="Example: What stood out most about our work together?"
            />
          </div>

          {/* Question 3 */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2f829b] text-white flex items-center justify-center text-lg font-medium">
                3
              </div>
              <div className="flex-1">
                <h3 className="font-['Lora'] text-2xl text-[#034863] mb-2">Feedback Question 3</h3>
                <p className="font-['Poppins'] text-base text-[#a8998f] mb-4">
                  Open-ended question for any additional thoughts (optional for client).
                </p>
              </div>
            </div>
            <Textarea
              value={question3}
              onChange={(e) => setQuestion3(e.target.value)}
              rows={3}
              required
              className="font-['Poppins']"
              placeholder="Example: Would you recommend my services to others in your field? Why or why not?"
            />
          </div>

          {/* Testimonial Permission Info */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#6b2358] text-white flex items-center justify-center text-lg font-medium">
                4
              </div>
              <div className="flex-1">
                <h3 className="font-['Lora'] text-2xl text-[#034863] mb-2">Testimonial Permission</h3>
                <p className="font-['Poppins'] text-base text-[#a8998f] mb-4">
                  Request permission to use their feedback as a testimonial.
                </p>
                <div className="bg-[#f5fafb] border-2 border-[#ddecf0] rounded-lg p-6">
                  <p className="font-['Poppins'] text-[18px] text-[#034863] font-medium">
                    {testimonialQuestion}
                  </p>
                  <p className="font-['Poppins'] text-sm text-[#a8998f] mt-3">
                    Client will select: Yes (with attribution) / Yes (anonymously) / No
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Credit Preference Info */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#6b2358] text-white flex items-center justify-center text-lg font-medium">
                5
              </div>
              <div className="flex-1">
                <h3 className="font-['Lora'] text-2xl text-[#034863] mb-2">Credit Preference</h3>
                <p className="font-['Poppins'] text-base text-[#a8998f] mb-4">
                  How they'd like to be credited if permission is granted.
                </p>
                <div className="bg-[#f5fafb] border-2 border-[#ddecf0] rounded-lg p-6">
                  <p className="font-['Poppins'] text-[18px] text-[#034863] font-medium">
                    {creditQuestion}
                  </p>
                  <p className="font-['Poppins'] text-sm text-[#a8998f] mt-3">
                    Client will select: Full name and title / First name and organization / First name only / Anonymous
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Closing Text */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <h2 className="font-['Lora'] text-3xl text-[#034863] mb-6">Closing Message</h2>
            <p className="font-['Poppins'] text-base text-[#a8998f] mb-4">
              Thank the client and provide next steps or contact information.
            </p>
            <Textarea
              value={closingText}
              onChange={(e) => setClosingText(e.target.value)}
              rows={4}
              required
              className="font-['Poppins']"
              placeholder="Example: Thank you for taking the time to share your feedback. I truly appreciate it. Feel free to reach out anytime at [email]."
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
            {onSaveAndFinishLater && (
              <Button
                onClick={handleSaveAndFinishLater}
                className="bg-[#2f829b] hover:bg-[#034863] text-white font-['Poppins'] rounded-lg"
              >
                <Save className="w-4 h-4 mr-2" />
                Save and Finish Later
              </Button>
            )}
            <Button
              onClick={handlePreview}
              className="bg-[#6b2358] hover:bg-[#6b2358]/90 text-white font-['Poppins'] rounded-lg"
            >
              <Eye className="w-4 h-4 mr-2" />
              Save and Preview
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}