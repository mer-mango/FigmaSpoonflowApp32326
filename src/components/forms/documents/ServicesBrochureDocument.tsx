import React from 'react';
import { DocumentFooter } from '../shared/DocumentFooter';
import { RefinedHeader } from '../shared/RefinedHeader';
import { Service } from '../../../App';
import { CheckCircle2 } from 'lucide-react';

interface ServicesBrochureConfig {
  showIntro: boolean;
  introText: string;
  showFeesGlobally: boolean;
  services: Array<{
    serviceId: string;
    enabled: boolean;
    showFees: boolean;
    showTestimonials: boolean;
    order: number;
  }>;
}

interface ServicesBrochureDocumentProps {
  config: ServicesBrochureConfig;
  services: Service[];
  onBack?: () => void;
  onEdit?: () => void;
}

export function ServicesBrochureDocument({ config, services, onBack, onEdit }: ServicesBrochureDocumentProps) {
  // Get enabled services in the correct order
  const orderedServices = config.services
    .filter(sc => sc.enabled)
    .sort((a, b) => a.order - b.order)
    .map(sc => {
      const service = services.find(s => s.id === sc.serviceId);
      return { ...sc, service };
    })
    .filter(item => item.service);

  return (
    <div className="min-h-screen bg-white">
      {/* Full-width Header with Logo */}
      <RefinedHeader onBack={onBack} onEdit={onEdit} showBackButton={!!onBack} />

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Document Header */}
          <div className="mb-12">
            <h1 className="font-['Lora'] text-6xl text-[#034863] mb-4">Services</h1>
            <p className="font-['Poppins'] text-base text-[#034863]">Empower Health Strategies</p>
          </div>

          {/* Introduction Section */}
          {config.showIntro && (
            <div className="mb-12">
              <div className="bg-[#f5fafb] border-2 border-[#ddecf0] rounded-lg p-8">
                <p className="font-['Poppins'] text-lg text-[#034863] leading-relaxed">
                  {config.introText}
                </p>
              </div>
            </div>
          )}

          {/* Services */}
          <div className="space-y-16">
            {orderedServices.map((item, index) => {
              const service = item.service!;
              const showFees = config.showFeesGlobally || item.showFees;
              const showTestimonials = item.showTestimonials && service.testimonials && service.testimonials.length > 0;

              return (
                <div key={service.id}>
                  {index > 0 && <div className="border-t border-[#ddecf0] pt-16 -mt-0" />}
                  
                  {/* Service Name */}
                  <div className="mb-8">
                    <h2 className="font-['Lora'] text-4xl text-[#034863] mb-4">{service.name}</h2>
                    <p className="font-['Poppins'] text-lg text-[#034863] leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  {/* Best Fit Use Cases */}
                  {service.bestFitUseCases && service.bestFitUseCases.length > 0 && (
                    <div className="mb-8">
                      <h3 className="font-['Poppins'] font-medium text-base uppercase tracking-wide text-[#2f829b] mb-4 text-[18px]">
                        Best For
                      </h3>
                      <div className="space-y-3">
                        {service.bestFitUseCases.map((useCase, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-[#2f829b] flex-shrink-0 mt-0.5" />
                            <p className="font-['Poppins'] text-base text-[#034863]">{useCase}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Engagement Formats */}
                  {service.engagementFormats && service.engagementFormats.length > 0 && (
                    <div className="mb-8">
                      <h3 className="font-['Poppins'] font-medium text-base uppercase tracking-wide text-[#2f829b] mb-3 text-[18px]">
                        Engagement Format
                      </h3>
                      <p className="font-['Poppins'] text-base text-[#034863]">
                        {service.engagementFormats.join(' • ')}
                      </p>
                    </div>
                  )}

                  {/* Deliverables */}
                  {service.deliverables && service.deliverables.length > 0 && (
                    <div className="mb-8">
                      <h3 className="font-['Poppins'] font-medium text-base uppercase tracking-wide text-[#2f829b] mb-4 text-[18px]">
                        Key Deliverables
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {service.deliverables.map((deliverable, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#2f829b] mt-2"></div>
                            <p className="font-['Poppins'] text-base text-[#034863]">{deliverable}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Duration */}
                  {service.duration && (
                    <div className="mb-8">
                      <h3 className="font-['Poppins'] font-medium text-base uppercase tracking-wide text-[#2f829b] mb-3 text-[18px]">
                        Typical Duration
                      </h3>
                      <p className="font-['Poppins'] text-base text-[#034863]">{service.duration}</p>
                    </div>
                  )}

                  {/* Fee Information (Optional) */}
                  {showFees && (service.feeRange || service.price || service.pricingModel || service.paymentStructure) && (
                    <div className="mb-8">
                      <div className="bg-[#f8f3f7] border-2 border-[#6b2358]/30 rounded-lg p-6">
                        <h3 className="font-['Poppins'] font-medium text-base uppercase tracking-wide text-[#6b2358] mb-4 text-[18px]">
                          Investment
                        </h3>
                        <div className="space-y-3">
                          {service.pricingModel && (
                            <div>
                              <span className="font-['Poppins'] text-sm text-[#6b2358]/80 uppercase tracking-wide">Pricing Model:</span>
                              <p className="font-['Poppins'] text-base text-[#6b2358] mt-1">{service.pricingModel}</p>
                            </div>
                          )}
                          {(service.feeRange || service.price) && (
                            <div>
                              <span className="font-['Poppins'] text-sm text-[#6b2358]/80 uppercase tracking-wide">Fee Range:</span>
                              <p className="font-['Poppins'] text-lg font-medium text-[#6b2358] mt-1">
                                {service.feeRange || service.price}
                              </p>
                            </div>
                          )}
                          {service.paymentStructure && (
                            <div>
                              <span className="font-['Poppins'] text-sm text-[#6b2358]/80 uppercase tracking-wide">Payment Terms:</span>
                              <p className="font-['Poppins'] text-base text-[#6b2358] mt-1">{service.paymentStructure}</p>
                            </div>
                          )}
                          <p className="font-['Poppins'] text-sm text-[#6b2358]/70 italic mt-4">
                            Final pricing is confirmed in a detailed Scope of Work based on your specific needs and organizational context.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Testimonials (Optional) */}
                  {showTestimonials && (
                    <div className="mb-8">
                      <h3 className="font-['Poppins'] font-medium text-base uppercase tracking-wide text-[#2f829b] mb-4 text-[18px]">
                        Client Feedback
                      </h3>
                      <div className="space-y-4">
                        {service.testimonials!.map((testimonial) => (
                          <div key={testimonial.id} className="border-l-4 border-[#2f829b] pl-6 py-2">
                            <p className="font-['Poppins'] text-base text-[#034863] italic mb-3">
                              "{testimonial.quote}"
                            </p>
                            <p className="font-['Poppins'] text-sm text-[#a8998f]">
                              — {testimonial.name}
                              {testimonial.title && `, ${testimonial.title}`}
                              {testimonial.organization && ` at ${testimonial.organization}`}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Next Steps Section */}
          <div className="border-t border-[#ddecf0] pt-12 mt-16">
            <div className="bg-[#f5fafb] border-2 border-[#ddecf0] rounded-lg p-8">
              <h2 className="font-['Lora'] text-3xl text-[#034863] mb-4">Next Steps</h2>
              <p className="font-['Poppins'] text-base text-[#034863] leading-relaxed mb-6">
                Interested in exploring how these services can support your organization? Let's schedule a consultation to discuss your specific needs and develop a customized approach.
              </p>
              <p className="font-['Poppins'] text-base text-[#034863]">
                <strong>Contact:</strong> meredith@empowerhealthstrategies.com
              </p>
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
