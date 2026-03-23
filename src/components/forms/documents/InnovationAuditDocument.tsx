import React from 'react';
import { Button } from '../ui/button';
import { Edit, CheckCircle2, Video, ExternalLink } from 'lucide-react';
import { DocumentFooter } from '../shared/DocumentFooter';
import { RefinedHeader } from '../shared/RefinedHeader';

interface InnovationAuditDocumentProps {
  documentData: any;
  onEdit: () => void;
}

export function InnovationAuditDocument({ documentData, onEdit }: InnovationAuditDocumentProps) {
  const {
    auditTitle,
    auditDate,
    loomVideoUrl,
    organizationName,
    organizationType,
    contactName,
    contactEmail,
    auditPurpose,
    auditFocus = [],
    innovationType = [],
    endUser = [],
    widgets = []
  } = documentData;

  return (
    <div className="min-h-screen bg-white">
      <RefinedHeader onEdit={onEdit} showBackButton={false} />

      {/* Document Content */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Document Header */}
          <div className="mb-12">
            <h1 className="font-['Lora'] text-2xl text-[#034863] mb-3">{auditTitle}</h1>
            <p className="font-['Poppins'] text-lg text-[#2f829b]">{auditDate}</p>
            
            {/* Audit Classification Tags */}
            {(auditFocus.length > 0 || innovationType.length > 0 || endUser.length > 0) && (
              <div className="mt-6 space-y-3">
                {auditFocus.length > 0 && (
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="font-['Poppins'] text-sm font-medium text-[#034863]/70">Focus:</span>
                    {auditFocus.map((focus, index) => (
                      <span key={index} className="px-3 py-1 bg-[#2f829b] text-white text-sm font-['Poppins'] rounded-full">
                        {focus}
                      </span>
                    ))}
                  </div>
                )}
                {innovationType.length > 0 && (
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="font-['Poppins'] text-sm font-medium text-[#034863]/70">Type:</span>
                    {innovationType.map((type, index) => (
                      <span key={index} className="px-3 py-1 bg-[#6b2358] text-white text-sm font-['Poppins'] rounded-full">
                        {type}
                      </span>
                    ))}
                  </div>
                )}
                {endUser.length > 0 && (
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="font-['Poppins'] text-sm font-medium text-[#034863]/70">End User:</span>
                    {endUser.map((user, index) => (
                      <span key={index} className="px-3 py-1 bg-[#034863] text-white text-sm font-['Poppins'] rounded-full">
                        {user}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Loom Video Overview - Light Blue Box */}
          {loomVideoUrl && (
            <div className="mb-12">
              <div className="bg-[#e3f2f7] p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Video className="w-6 h-6 text-[#2f829b]" />
                  <h3 className="font-['Poppins'] font-medium text-lg text-[#034863]">Video Overview</h3>
                </div>
                <a 
                  href={loomVideoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-['Poppins'] text-base text-[#2f829b] hover:underline flex items-center gap-2"
                >
                  Watch the audit overview video
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}

          {/* Organization Information - Light Blue Box */}
          <div className="mb-12">
            <h2 className="font-['Lora'] text-4xl text-[#034863] mb-6">Organization Information</h2>
            <div className="bg-[#e3f2f7] p-6 rounded-lg space-y-3">
              <div>
                <span className="font-['Poppins'] font-medium text-base text-[#2f829b]">Organization: </span>
                <span className="font-['Poppins'] text-base text-[#034863]">
                  {organizationName || '[Organization Name]'}
                </span>
              </div>
              <div>
                <span className="font-['Poppins'] font-medium text-base text-[#2f829b]">Type: </span>
                <span className="font-['Poppins'] text-base text-[#034863]">
                  {organizationType || '[Organization Type]'}
                </span>
              </div>
              <div>
                <span className="font-['Poppins'] font-medium text-base text-[#2f829b]">Primary Contact: </span>
                <span className="font-['Poppins'] text-base text-[#034863]">
                  {contactName || '[Contact Name]'}
                </span>
              </div>
              <div>
                <span className="font-['Poppins'] font-medium text-base text-[#2f829b]">Email: </span>
                <span className="font-['Poppins'] text-base text-[#034863]">
                  {contactEmail || '[Email Address]'}
                </span>
              </div>
            </div>
          </div>

          {/* Audit Purpose */}
          <div className="mb-12">
            <h2 className="font-['Lora'] text-4xl text-[#034863] mb-4">Purpose</h2>
            <p className="font-['Poppins'] text-lg text-black leading-relaxed">
              {auditPurpose}
            </p>
          </div>

          {/* Audit Content - Widgets */}
          <div className="mb-12">
            <h2 className="font-['Lora'] text-4xl text-[#034863] mb-8">Assessment</h2>
            <div className="space-y-6">
              {widgets.map((widget: any, index: number) => (
                <div key={widget.id}>
                  {/* Qualitative Question Widget */}
                  {widget.type === 'qualitative' && (
                    <div className="bg-white border-l-4 border-[#6b2358] pl-6 py-4">
                      <div className="mb-3">
                        <span className="px-3 py-1 rounded-full text-xs uppercase tracking-wide font-['Poppins'] bg-[#6b2358] text-white">
                          Qualitative
                        </span>
                      </div>
                      <h4 className="font-['Poppins'] font-medium text-xl text-[#034863] mb-2">
                        {widget.question}
                      </h4>
                      {widget.description && (
                        <p className="font-['Poppins'] text-base text-[#034863]/70 mb-4">
                          {widget.description}
                        </p>
                      )}
                      <div className="mt-4">
                        <p className="font-['Poppins'] text-sm font-medium text-[#034863] mb-2">Response:</p>
                        <div className="bg-[#f5fafb] rounded-lg p-4 min-h-[120px]">
                          <span className="font-['Poppins'] text-sm text-[#034863]/40">
                            Provide detailed qualitative assessment here...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quantitative Question Widget */}
                  {widget.type === 'quantitative' && (
                    <div className="bg-white border-l-4 border-[#2f829b] pl-6 py-4">
                      <div className="mb-3">
                        <span className="px-3 py-1 rounded-full text-xs uppercase tracking-wide font-['Poppins'] bg-[#2f829b] text-white">
                          Quantitative
                        </span>
                      </div>
                      <h4 className="font-['Poppins'] font-medium text-xl text-[#034863] mb-2">
                        {widget.question}
                      </h4>
                      {widget.description && (
                        <p className="font-['Poppins'] text-base text-[#034863]/70 mb-4">
                          {widget.description}
                        </p>
                      )}
                      <div className="mb-4 p-4 bg-[#f5fafb] rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-['Poppins'] text-sm text-[#034863]">
                            {widget.scaleLabels?.min || 'Low'}
                          </span>
                          <span className="font-['Poppins'] text-sm text-[#034863]">
                            {widget.scaleLabels?.max || 'High'}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {Array.from({ length: widget.scaleType === '1-10' ? 10 : 5 }, (_, i) => i + 1).map((score) => (
                            <div
                              key={score}
                              className="flex-1 h-12 border-2 border-[#ddecf0] rounded flex items-center justify-center font-['Poppins'] text-sm text-[#034863] hover:border-[#2f829b] hover:bg-[#2f829b]/5 transition-colors cursor-pointer"
                            >
                              {score}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="font-['Poppins'] text-sm font-medium text-[#034863] mb-2">Notes & Observations:</p>
                        <div className="bg-[#f5fafb] rounded-lg p-4 min-h-[80px]">
                          <span className="font-['Poppins'] text-sm text-[#034863]/40">
                            Add context, evidence, or observations to support your rating...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Screenshot Widget */}
                  {widget.type === 'screenshot' && (
                    <div className="bg-white py-4">
                      <div className="mb-3">
                        <span className="px-3 py-1 rounded-full text-xs uppercase tracking-wide font-['Poppins'] bg-orange-500 text-white">
                          Screenshot
                        </span>
                      </div>
                      {widget.imageUrl && (
                        <div className="mb-3">
                          <img 
                            src={widget.imageUrl} 
                            alt="Screenshot" 
                            className="w-full rounded-lg border border-[#ddecf0]" 
                          />
                        </div>
                      )}
                      {widget.caption && (
                        <p className="font-['Poppins'] text-base text-[#034863] italic">
                          {widget.caption}
                        </p>
                      )}
                      {!widget.imageUrl && (
                        <div className="bg-[#f5fafb] border-2 border-dashed border-[#ddecf0] rounded-lg p-8 text-center">
                          <p className="font-['Poppins'] text-sm text-[#034863]/50">
                            Screenshot will appear here
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Video Link Widget */}
                  {widget.type === 'video-link' && widget.url && (
                    <div className="bg-[#e3f2f7] p-6 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <Video className="w-5 h-5 text-[#2f829b]" />
                        <span className="px-3 py-1 rounded-full text-xs uppercase tracking-wide font-['Poppins'] bg-blue-500 text-white">
                          Video Link
                        </span>
                      </div>
                      {widget.description && (
                        <p className="font-['Poppins'] text-base text-[#034863] mb-3">
                          {widget.description}
                        </p>
                      )}
                      <a 
                        href={widget.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-['Poppins'] text-base text-[#2f829b] hover:underline flex items-center gap-2"
                      >
                        Watch video
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}

                  {/* Text Block Widget */}
                  {widget.type === 'text-block' && widget.content && (
                    <div className="bg-white py-4">
                      <div className="mb-3">
                        <span className="px-3 py-1 rounded-full text-xs uppercase tracking-wide font-['Poppins'] bg-gray-500 text-white">
                          Notes
                        </span>
                      </div>
                      <p className="font-['Poppins'] text-lg text-black whitespace-pre-wrap leading-relaxed">
                        {widget.content}
                      </p>
                    </div>
                  )}
                </div>
              ))}

              {widgets.length === 0 && (
                <div className="bg-[#f5fafb] border-2 border-dashed border-[#ddecf0] rounded-lg p-12 text-center">
                  <p className="font-['Poppins'] text-base text-[#034863]/50">
                    No content added yet. Use the editor to drag and drop widgets.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Overall Summary Section - Plum Box */}
          <div className="mb-12 bg-[#6b2358] p-8 rounded-lg">
            <h2 className="font-['Lora'] text-4xl text-white mb-6">Overall Assessment Summary</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-['Poppins'] font-medium text-lg text-white mb-2">
                  Key Strengths
                </h3>
                <div className="bg-white/10 rounded-lg p-4 min-h-[100px]"></div>
              </div>
              
              <div>
                <h3 className="font-['Poppins'] font-medium text-lg text-white mb-2">
                  Priority Opportunities for Improvement
                </h3>
                <div className="bg-white/10 rounded-lg p-4 min-h-[100px]"></div>
              </div>
              
              <div>
                <h3 className="font-['Poppins'] font-medium text-lg text-white mb-2">
                  Recommended Next Steps
                </h3>
                <div className="bg-white/10 rounded-lg p-4 min-h-[100px]"></div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <DocumentFooter />
        </div>
      </div>
    </div>
  );
}