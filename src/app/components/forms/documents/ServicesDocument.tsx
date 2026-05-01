import React from 'react';
import { ArrowLeft, Download, Eye, Briefcase, Package } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { RefinedHeader } from '../shared/RefinedHeader';
import { DocumentFooter } from '../shared/DocumentFooter';

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: string;
  duration: string;
  deliverables: string[];
}

interface ServicesData {
  documentNumber: string;
  date: string;
  clientName: string;
  clientContact: string;
  clientEmail: string;
  clientPhone: string;
  services: ServiceItem[];
  introduction?: string;
  conclusion?: string;
}

interface ServicesDocumentProps {
  servicesData: ServicesData;
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
}

export function ServicesDocument(props: ServicesDocumentProps) {
  const { servicesData, status, showSignature, showEditRequest, clientSignature, clientSignatureDate, consultantSignature, editRequest } = props;

  return (
    <div className="min-h-screen bg-white">
      <RefinedHeader onEdit={props.onEdit} onBack={undefined} showBackButton={false} />

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Introduction */}
          {servicesData.introduction && (
            <div className="border-t border-[#c5dce2] pt-12">
              <p className="font-['Poppins'] text-lg text-black leading-relaxed whitespace-pre-wrap">{servicesData.introduction}</p>
            </div>
          )}

          {/* Services */}
          {servicesData.services.map((service, index) => (
            <div key={service.id} className="border-t border-[#c5dce2] pt-12">
              <div className="flex items-center gap-3 mb-6">
                <Briefcase className="w-7 h-7 text-[#2f829b]" />
                <h2 className="font-['Lora'] text-4xl text-[#034863]">{index + 1}. {service.name}</h2>
              </div>
              
              <p className="font-['Poppins'] text-lg text-black leading-relaxed mb-6">{service.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                <div>
                  <p className="font-['Poppins'] font-medium text-base uppercase tracking-wide text-[#2f829b] mb-2">Investment</p>
                  <p className="font-['Poppins'] text-2xl text-[#6b2358]">{service.price}</p>
                </div>
                <div>
                  <p className="font-['Poppins'] font-medium text-base uppercase tracking-wide text-[#2f829b] mb-2">Timeline</p>
                  <p className="font-['Poppins'] text-2xl text-[#034863]">{service.duration}</p>
                </div>
              </div>
              
              {service.deliverables.length > 0 && (
                <div>
                  <p className="font-['Poppins'] font-medium text-base uppercase tracking-wide text-[#2f829b] mb-3">Key Deliverables</p>
                  <ul className="space-y-2 font-['Poppins'] text-lg text-black">
                    {service.deliverables.map((deliverable, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#2f829b] mt-1 flex-shrink-0" />
                        <span>{deliverable}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}

          {/* Conclusion */}
          {servicesData.conclusion && (
            <div className="border-t border-[#c5dce2] pt-12">
              <div className="flex items-center gap-3 mb-6">
                <ArrowRight className="w-7 h-7 text-[#2f829b]" />
                <h2 className="font-['Lora'] text-4xl text-[#034863]">Next Steps</h2>
              </div>
              <p className="font-['Poppins'] text-lg text-black leading-relaxed whitespace-pre-wrap">{servicesData.conclusion}</p>
            </div>
          )}

          {/* Approval & Signatures Section */}
          <div id="approval-section" className="border-t border-[#ddecf0] pt-12">
            {!showEditRequest && (
              <div className="p-10 bg-[#6b2358] rounded-lg">
                <div className="flex items-center gap-3 mb-6">
                  <Edit3 className="w-7 h-7 text-white" />
                  <h2 className="font-['Lora'] text-5xl text-white text-[36px]">Approval & Signatures</h2>
                </div>
                
                {!showSignature && status === 'pending' && (
                  <div className="space-y-6">
                    <p className="font-['Poppins'] text-white text-xl">
                      Please review the services overview above. You may approve and sign, or request edits.
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
                          {servicesData.date}
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
        </div>
      </div>
    </div>
  );
}