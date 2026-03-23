import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Eye, ArrowLeft, Save } from 'lucide-react';
import { Card } from '../ui/card';
import { DocumentFooter } from '../shared/DocumentFooter';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { getTemplate } from '../utils/templateStorage';
import { TemplateBasedFormPreview } from '../documents/TemplateBasedFormPreview';

interface FeedbackFormProps {
  onBack: () => void;
  onPreview: (data: FeedbackData) => void;
}

export interface FeedbackData {
  introText: string;
  question1: string;
  question2: string;
  question3: string;
  testimonialQuestion: string;
  testimonialOptions: string[];
  creditQuestion: string;
  creditOptions: string[];
  closingText: string;
  answer1: string;
  answer2: string;
  answer3: string;
  testimonialPermission: string;
  creditPreference: string;
}

export function FeedbackForm({ onBack, onPreview }: FeedbackFormProps) {
  // Template preview state
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  
  // If showing template preview, render it instead of the form
  if (showTemplatePreview) {
    return (
      <TemplateBasedFormPreview
        templateId="feedback"
        onBack={() => setShowTemplatePreview(false)}
      />
    );
  }
  
  const [introText, setIntroText] = useState('');
  const [question1, setQuestion1] = useState('');
  const [question2, setQuestion2] = useState('');
  const [question3, setQuestion3] = useState('');
  const [testimonialQuestion, setTestimonialQuestion] = useState('');
  const [testimonialOptions, setTestimonialOptions] = useState<string[]>([]);
  const [creditQuestion, setCreditQuestion] = useState('');
  const [creditOptions, setCreditOptions] = useState<string[]>([]);
  const [closingText, setClosingText] = useState('');

  // Response fields (empty for template preview)
  const [answer1, setAnswer1] = useState('');
  const [answer2, setAnswer2] = useState('');
  const [answer3, setAnswer3] = useState('');
  const [testimonialPermission, setTestimonialPermission] = useState('');
  const [creditPreference, setCreditPreference] = useState('');

  useEffect(() => {
    const template = getTemplate('feedback');
    if (template) {
      template.sections.forEach(section => {
        section.fields.forEach(field => {
          const defaultVal = field.defaultValue as string || '';
          switch (field.id) {
            case 'intro-text':
              setIntroText(defaultVal);
              break;
            case 'question-1':
              setQuestion1(defaultVal);
              break;
            case 'question-2':
              setQuestion2(defaultVal);
              break;
            case 'question-3':
              setQuestion3(defaultVal);
              break;
            case 'testimonial-question':
              setTestimonialQuestion(defaultVal);
              break;
            case 'testimonial-options':
              setTestimonialOptions(defaultVal.split(',').map(s => s.trim()));
              break;
            case 'credit-question':
              setCreditQuestion(defaultVal);
              break;
            case 'credit-options':
              setCreditOptions(defaultVal.split(',').map(s => s.trim()));
              break;
            case 'closing-text':
              setClosingText(defaultVal);
              break;
          }
        });
      });
    }
  }, []);

  const handleSubmit = () => {
    onPreview({
      introText,
      question1,
      question2,
      question3,
      testimonialQuestion,
      testimonialOptions,
      creditQuestion,
      creditOptions,
      closingText,
      answer1,
      answer2,
      answer3,
      testimonialPermission,
      creditPreference
    });
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8 mt-6">
          <div>
            <h1 className="font-['Lora'] text-4xl text-[#034863] mb-1">Feedback & Testimonial Request</h1>
            <p className="font-['Poppins'] text-lg text-[#2f829b] text-[20px]">Gather client feedback and testimonials</p>
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
              <p className="font-['Poppins'] text-[16px] text-[#034863] leading-relaxed whitespace-pre-wrap">
                {introText}
              </p>
            </div>

            {/* Question 1 */}
            <Card className="p-8 border-2 border-[#ddecf0] rounded-xl bg-white">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2f829b] text-white flex items-center justify-center text-lg font-medium">1</div>
                <div className="flex-1">
                  <label className="block font-['Poppins'] font-semibold text-[#034863] mb-2 text-[20px]">
                    {question1}
                  </label>
                  <Textarea
                    value={answer1}
                    onChange={(e) => setAnswer1(e.target.value)}
                    rows={4}
                    required
                    className="font-['Poppins']"
                    placeholder="Share your thoughts..."
                  />
                </div>
              </div>
            </Card>

            {/* Question 2 */}
            <Card className="p-8 border-2 border-[#ddecf0] rounded-xl bg-white">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2f829b] text-white flex items-center justify-center text-lg font-medium">2</div>
                <div className="flex-1">
                  <label className="block font-['Poppins'] font-semibold text-[#034863] mb-2 text-[20px]">
                    {question2}
                  </label>
                  <Textarea
                    value={answer2}
                    onChange={(e) => setAnswer2(e.target.value)}
                    rows={4}
                    required
                    className="font-['Poppins']"
                    placeholder="Share your thoughts..."
                  />
                </div>
              </div>
            </Card>

            {/* Question 3 - Optional */}
            <Card className="p-8 border-2 border-[#ddecf0] rounded-xl bg-white">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2f829b] text-white flex items-center justify-center text-lg font-medium">3</div>
                <div className="flex-1">
                  <label className="block font-['Poppins'] font-semibold text-[#034863] mb-2 text-[20px]">
                    {question3}
                  </label>
                  <Textarea
                    value={answer3}
                    onChange={(e) => setAnswer3(e.target.value)}
                    rows={4}
                    required
                    className="font-['Poppins']"
                    placeholder="Share your thoughts..."
                  />
                </div>
              </div>
            </Card>

            {/* Testimonial Permission */}
            <Card className="p-8 border-2 border-[#ddecf0] rounded-xl bg-white">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2f829b] text-white flex items-center justify-center text-lg font-medium">4</div>
                <div className="flex-1">
                  <label className="block font-['Poppins'] font-semibold text-[#034863] mb-4 text-[20px]">
                    {testimonialQuestion}
                  </label>
                  <Select value={testimonialPermission} onValueChange={setTestimonialPermission}>
                    <SelectTrigger className="w-full font-['Poppins'] text-[18px] text-[rgb(0,0,0)] border-2 border-[#ddecf0] rounded-lg h-12">
                      <SelectValue placeholder="Select an option..." />
                    </SelectTrigger>
                    <SelectContent>
                      {testimonialOptions.map((option) => (
                        <SelectItem key={option} value={option} className="font-['Poppins'] text-[18px]">
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Credit Preference */}
            <Card className="p-8 border-2 border-[#ddecf0] rounded-xl bg-white">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2f829b] text-white flex items-center justify-center text-lg font-medium">5</div>
                <div className="flex-1">
                  <label className="block font-['Poppins'] font-semibold text-[#034863] mb-4 text-[20px]">
                    {creditQuestion}
                  </label>
                  <Select value={creditPreference} onValueChange={setCreditPreference}>
                    <SelectTrigger className="w-full font-['Poppins'] text-[18px] text-[rgb(0,0,0)] border-2 border-[#ddecf0] rounded-lg h-12">
                      <SelectValue placeholder="Select an option..." />
                    </SelectTrigger>
                    <SelectContent>
                      {creditOptions.map((option) => (
                        <SelectItem key={option} value={option} className="font-['Poppins'] text-[18px]">
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Closing Message */}
            <div className="bg-[#f5fafb] p-6 rounded-lg border-2 border-[#ddecf0]">
              <p className="font-['Poppins'] text-[16px] text-[#034863] leading-relaxed whitespace-pre-wrap">
                {closingText}
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
                onClick={() => setShowTemplatePreview(true)}
                variant="outline"
                className="border-2 border-[#2f829b] text-[#2f829b] hover:bg-[#f5fafb] font-['Poppins'] rounded-lg px-8 py-3"
              >
                <FileText className="w-5 h-5 mr-2" />
                Preview Template
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-[#6b2358] hover:bg-[#6b2358]/90 text-white font-['Poppins'] rounded-lg px-8 py-3"
              >
                <Send className="w-5 h-5 mr-2" />
                Preview Form
              </Button>
            </div>
          </div>
        </div>
        <DocumentFooter />
      </div>
    </div>
  );
}