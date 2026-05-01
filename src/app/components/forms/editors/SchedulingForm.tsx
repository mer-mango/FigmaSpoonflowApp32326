import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Eye, ArrowLeft, Calendar, Clock, MapPin, Info } from 'lucide-react';
import { Card } from '../ui/card';

interface SchedulingFormProps {
  onBack: () => void;
  onPreview: (data: SchedulingData) => void;
  onSave?: () => void;
  backButtonLabel?: string;
  initialData?: any;
}

export interface SchedulingData {
  schedulingType: string;
  schedulingLink: string;
  additionalInstructions: string;
}

export function SchedulingForm({ onBack, onPreview, onSave, backButtonLabel, initialData }: SchedulingFormProps) {
  const [schedulingType, setSchedulingType] = useState(initialData?.schedulingType || 'Free Consultation');
  const [schedulingLink, setSchedulingLink] = useState(initialData?.schedulingLink || 'https://calendar.app.google/iEPmH9yKwFELkus89');
  const [additionalInstructions, setAdditionalInstructions] = useState(initialData?.additionalInstructions || '');

  const handlePreview = () => {
    onPreview({
      schedulingType,
      schedulingLink,
      additionalInstructions
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5fafb] to-[#ddecf0] p-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex items-center justify-between mb-6 mt-6">
          <div>
            <h1 className="font-['Lora'] text-4xl text-[#034863] mb-1">Scheduler: Preliminary Consultation</h1>
            <p className="font-['Poppins'] text-lg text-[#2f829b]">
              Embed your Google Calendar for easy appointment booking
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={onBack}
              variant="outline"
              className="border-2 border-[#034863] text-[#034863] hover:bg-[#f5fafb] font-['Poppins'] rounded-lg"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {backButtonLabel || 'Back'}
            </Button>
            <Button
              onClick={handlePreview}
              className="bg-[#2f829b] hover:bg-[#034863] text-white font-['Poppins'] rounded-lg"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview Page
            </Button>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Instructions Card */}
          <Card className="p-6 border-2 border-[#2f829b] bg-[#f5fafb]">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-[#2f829b] flex-shrink-0 mt-1" />
              <div className="font-['Poppins'] text-[16px] text-[#034863] space-y-2">
                <p className="font-semibold">How to get your Google Calendar link:</p>
                <ol className="list-decimal ml-5 space-y-1">
                  <li>Go to <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer" className="text-[#2f829b] underline">Google Calendar</a></li>
                  <li>Create or select an appointment schedule</li>
                  <li>Click "Share" and copy the booking page URL</li>
                  <li>Paste the full URL below (it should start with https://calendar.google.com/calendar/appointments/...)</li>
                </ol>
              </div>
            </div>
          </Card>

          {/* Scheduling Details */}
          <Card className="p-8 border border-[#ddecf0] rounded-lg bg-white">
            <h2 className="font-['Lora'] text-[30px] text-[#034863] mb-6">Scheduling Details</h2>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="font-['Poppins'] text-[20px] text-[#034863]">
                  Meeting Type *
                </label>
                <p className="font-['Poppins'] text-sm text-[#034863]/70 mb-2">
                  This appears in the header as "Schedule Your [Meeting Type]"
                </p>
                <Input
                  value={schedulingType}
                  onChange={(e) => setSchedulingType(e.target.value)}
                  placeholder="e.g., Free Consultation, Strategy Call, Audit Debrief"
                  className="border-[#ddecf0] focus:border-[#2f829b] focus:ring-[#2f829b] rounded-lg font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setSchedulingType('Free Consultation')}
                    className="px-3 py-1 bg-[#f5fafb] text-[#034863] rounded-full text-sm font-['Poppins'] hover:bg-[#ddecf0] transition-colors"
                  >
                    Free Consultation
                  </button>
                  <button
                    type="button"
                    onClick={() => setSchedulingType('Strategy Session')}
                    className="px-3 py-1 bg-[#f5fafb] text-[#034863] rounded-full text-sm font-['Poppins'] hover:bg-[#ddecf0] transition-colors"
                  >
                    Strategy Session
                  </button>
                  <button
                    type="button"
                    onClick={() => setSchedulingType('Audit Debrief')}
                    className="px-3 py-1 bg-[#f5fafb] text-[#034863] rounded-full text-sm font-['Poppins'] hover:bg-[#ddecf0] transition-colors"
                  >
                    Audit Debrief
                  </button>
                  <button
                    type="button"
                    onClick={() => setSchedulingType('Workshop Planning')}
                    className="px-3 py-1 bg-[#f5fafb] text-[#034863] rounded-full text-sm font-['Poppins'] hover:bg-[#ddecf0] transition-colors"
                  >
                    Workshop Planning
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-['Poppins'] text-[20px] text-[#034863]">
                  Google Calendar Link *
                </label>
                <p className="font-['Poppins'] text-sm text-[#034863]/70 mb-2">
                  Paste your Google Calendar scheduling/booking page link here
                </p>
                <Input
                  value={schedulingLink}
                  onChange={(e) => setSchedulingLink(e.target.value)}
                  placeholder="https://calendar.google.com/calendar/appointments/schedules/..."
                  className="border-[#ddecf0] focus:border-[#2f829b] focus:ring-[#2f829b] rounded-lg font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                />
                {schedulingLink && !schedulingLink.includes('calendar.google.com') && (
                  <p className="text-sm text-orange-600 flex items-center gap-2 mt-2">
                    <Info className="w-4 h-4" />
                    This doesn't look like a Google Calendar link. Make sure it starts with "https://calendar.google.com/"
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="font-['Poppins'] text-[20px] text-[#034863]">
                  Additional Instructions (Optional)
                </label>
                <p className="font-['Poppins'] text-sm text-[#034863]/70 mb-2">
                  Add any meeting-specific context or preparation instructions
                </p>
                <Textarea
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                  placeholder="e.g., Please have your audit report handy for our discussion..."
                  rows={4}
                  className="border-[#ddecf0] focus:border-[#2f829b] focus:ring-[#2f829b] rounded-lg font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                />
              </div>
            </div>
          </Card>

          {/* What's Included Preview */}
          <Card className="p-8 border border-[#ddecf0] rounded-lg bg-[#f5fafb]">
            <h3 className="font-['Lora'] text-xl text-[#034863] mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              What's Automatically Included
            </h3>
            <div className="font-['Poppins'] text-[16px] text-[#034863] space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-[#2f829b] mt-1">✓</span>
                <p>Step-by-step "What to Expect" instructions</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#2f829b] mt-1">✓</span>
                <p>Embedded Google Calendar for easy booking</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#2f829b] mt-1">✓</span>
                <p>Confirmation email instructions</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#2f829b] mt-1">✓</span>
                <p>Your contact information and website links</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#2f829b] mt-1">✓</span>
                <p>Professional branding with your brand colors</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}