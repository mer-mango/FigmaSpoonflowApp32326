import React from 'react';
import { DocumentFooter } from '../shared/DocumentFooter';
import { RefinedHeader } from '../shared/RefinedHeader';

interface LearningObjective {
  id: string;
  text: string;
}

interface Activity {
  id: string;
  description: string;
}

interface Module {
  id: string;
  title: string;
  duration: string;
  topics: string;
  activities: Activity[];
  materials: string;
}

interface WorkshopCurriculumDocumentProps {
  data: {
    workshopTitle?: string;
    trainingTitle?: string;
    workshopDate?: string;
    trainingDate?: string;
    duration: string;
    audience: string;
    facilitator: string;
    overview: string;
    objectives: LearningObjective[];
    modules: Module[];
    prerequisites: string;
    takeaways: string;
  };
  onBack: () => void;
}

export function WorkshopCurriculumDocument({ data, onBack }: WorkshopCurriculumDocumentProps) {
  // Handle backwards compatibility - prefer trainingTitle/trainingDate
  const title = data.trainingTitle || data.workshopTitle || 'Training Curriculum';
  const date = data.trainingDate || data.workshopDate || '';
  
  return (
    <div className="min-h-screen bg-white">
      {/* Full-width Header with Logo */}
      <RefinedHeader onBack={onBack} showBackButton={true} />

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Document Header */}
          <div>
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="font-['Lora'] text-6xl text-[#034863] mb-2 pt-[0px] pr-[0px] pb-[6px] pl-[0px]">Training Curriculum</h1>
                <p className="font-['Poppins'] text-base text-black">{title}</p>
              </div>
              <div className="flex gap-5">
                <div className="px-6 py-3 bg-[#f5fafb] border-2 border-[#ddecf0] rounded-lg">
                  <p className="font-['Poppins'] font-medium text-sm uppercase tracking-wide text-[#2f829b] mb-1 text-[16px]">Date</p>
                  <p className="font-['Poppins'] text-xl text-[rgb(3,72,99)]">{date}</p>
                </div>
                <div className="px-6 py-3 bg-[#6b2358] rounded-lg">
                  <p className="font-['Poppins'] font-medium text-sm uppercase tracking-wide text-white/90 mb-1 text-[16px]">Duration</p>
                  <p className="font-['Poppins'] text-xl text-white font-medium">{data.duration}</p>
                </div>
              </div>
            </div>

            {/* Two Column Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <p className="font-['Poppins'] font-medium text-base uppercase tracking-wide text-[#2f829b] mb-4 text-[18px]">Target Audience</p>
                <div className="space-y-1 font-['Poppins'] text-black">
                  <p className="text-base text-[18px]">{data.audience}</p>
                </div>
              </div>
              <div>
                <p className="font-['Poppins'] font-medium text-base uppercase tracking-wide text-[#2f829b] mb-4 text-[18px]">Facilitator</p>
                <div className="space-y-1 font-['Poppins'] text-black">
                  <p className="text-base text-[18px]">{data.facilitator}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Overview Section */}
          <div className="border-t border-[#ddecf0] pt-12 mt-12">
            <h2 className="font-['Lora'] text-4xl text-[#034863] mb-6">Overview</h2>
            <p className="font-['Poppins'] text-lg text-[#034863] leading-relaxed">{data.overview}</p>
          </div>

          {/* Learning Objectives */}
          <div className="border-t border-[#ddecf0] pt-12 mt-12">
            <h2 className="font-['Lora'] text-4xl text-[#034863] mb-8">Learning Objectives</h2>
            <div className="space-y-4">
              {data.objectives.map((objective, index) => (
                <div key={objective.id} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#2f829b] text-white flex items-center justify-center font-['Poppins'] font-medium">
                    {index + 1}
                  </div>
                  <p className="font-['Poppins'] text-lg text-[#034863] pt-1">{objective.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Curriculum Modules */}
          <div className="border-t border-[#ddecf0] pt-12 mt-12">
            <h2 className="font-['Lora'] text-4xl text-[#034863] mb-8">Curriculum</h2>
            
            <div className="space-y-10">
              {data.modules.map((module, index) => (
                <div key={module.id} className="border-l-4 border-[#2f829b] pl-8">
                  {/* Module Header */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-4 mb-2">
                      <h3 className="font-['Lora'] text-3xl text-[#034863]">
                        Module {index + 1}: {module.title}
                      </h3>
                      <span className="font-['Poppins'] text-base text-[#2f829b] uppercase tracking-wide">
                        {module.duration}
                      </span>
                    </div>
                  </div>

                  {/* Topics */}
                  {module.topics && (
                    <div className="mb-6">
                      <p className="font-['Poppins'] font-medium text-base uppercase tracking-wide text-[#2f829b] mb-2 text-[16px]">Topics Covered</p>
                      <p className="font-['Poppins'] text-base text-[#034863] leading-relaxed">{module.topics}</p>
                    </div>
                  )}

                  {/* Activities */}
                  {module.activities.length > 0 && (
                    <div className="mb-6">
                      <p className="font-['Poppins'] font-medium text-base uppercase tracking-wide text-[#2f829b] mb-3 text-[16px]">Activities</p>
                      <div className="space-y-2">
                        {module.activities.map((activity) => (
                          <div key={activity.id} className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#2f829b] mt-2"></div>
                            <p className="font-['Poppins'] text-base text-[#034863]">{activity.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Materials */}
                  {module.materials && (
                    <div className="mb-6">
                      <p className="font-['Poppins'] font-medium text-base uppercase tracking-wide text-[#2f829b] mb-2 text-[16px]">Materials Needed</p>
                      <p className="font-['Poppins'] text-base text-[#034863] italic">{module.materials}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Prerequisites */}
          {data.prerequisites && (
            <div className="border-t border-[#ddecf0] pt-12 mt-12">
              <h2 className="font-['Lora'] text-4xl text-[#034863] mb-6">Prerequisites</h2>
              <div className="bg-[#f5fafb] border-2 border-[#ddecf0] rounded-lg p-8">
                <p className="font-['Poppins'] text-base text-[#034863] leading-relaxed text-[18px]">{data.prerequisites}</p>
              </div>
            </div>
          )}

          {/* Participant Takeaways */}
          {data.takeaways && (
            <div className="border-t border-[#ddecf0] pt-12 mt-12">
              <h2 className="font-['Lora'] text-4xl text-[#034863] mb-6">Participant Takeaways</h2>
              <div className="bg-[#f5fafb] border-2 border-[#ddecf0] rounded-lg p-8">
                <p className="font-['Poppins'] text-base text-[#034863] leading-relaxed text-[18px]">{data.takeaways}</p>
              </div>
            </div>
          )}

          {/* Approval Section */}
          <div className="border-t border-[#ddecf0] pt-12 mt-12">
            <div className="bg-[#6b2358] rounded-lg p-8">
              <h3 className="font-['Lora'] text-3xl text-white mb-4">Agreement Acceptance</h3>
              <p className="font-['Poppins'] text-base text-white/90 mb-8 text-[18px]">
                By signing below, both parties agree to the training curriculum and terms outlined in this document.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Client Signature */}
                <div>
                  <p className="font-['Poppins'] text-sm text-white/90 mb-2 uppercase tracking-wide">Client Signature *</p>
                  <input
                    type="text"
                    placeholder="Type your full name"
                    className="w-full px-4 py-3 rounded-lg border-2 border-white/20 bg-white font-['Poppins'] text-[#034863] text-base mb-3"
                  />
                  <p className="font-['Poppins'] text-sm text-white/90 mb-2 uppercase tracking-wide">Date *</p>
                  <input
                    type="date"
                    className="w-full px-4 py-3 rounded-lg border-2 border-white/20 bg-white font-['Poppins'] text-[#034863] text-base"
                  />
                </div>
                
                {/* Consultant Signature */}
                <div>
                  <p className="font-['Poppins'] text-sm text-white/90 mb-2 uppercase tracking-wide">Empower Health Strategies</p>
                  <div className="w-full px-4 py-3 rounded-lg bg-white/10 border-2 border-white/20 font-['Poppins'] text-white text-base mb-3">
                    Meredith Mangold, CPXP
                  </div>
                  <p className="font-['Poppins'] text-sm text-white/90 mb-2 uppercase tracking-wide">Date *</p>
                  <input
                    type="date"
                    className="w-full px-4 py-3 rounded-lg border-2 border-white/20 bg-white font-['Poppins'] text-[#034863] text-base"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Document Footer */}
          <div className="mt-16">
            <DocumentFooter />
          </div>
        </div>
      </div>
    </div>
  );
}