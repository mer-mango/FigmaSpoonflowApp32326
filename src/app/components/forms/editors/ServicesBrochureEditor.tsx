import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Eye, Save, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { TextLogo } from '../shared/TextLogo';
import { Service } from '../../../App';

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

interface ServicesBrochureEditorProps {
  services: Service[];
  onPreview: (config: ServicesBrochureConfig) => void;
  onBack: () => void;
  onSaveAndFinishLater?: (config: ServicesBrochureConfig) => void;
  backButtonLabel?: string;
  initialConfig?: ServicesBrochureConfig;
}

export function ServicesBrochureEditor({
  services,
  onPreview,
  onBack,
  onSaveAndFinishLater,
  backButtonLabel = 'Back to Forms Dashboard',
  initialConfig
}: ServicesBrochureEditorProps) {
  const [showIntro, setShowIntro] = useState(initialConfig?.showIntro ?? true);
  const [introText, setIntroText] = useState(
    initialConfig?.introText ||
      'Empower Health Strategies partners with healthcare organizations to design and implement patient-centered experiences that drive engagement, satisfaction, and outcomes. Below is an overview of our core services. Pricing varies based on organizational scope and customization needs—final fees are confirmed in a detailed Scope of Work.'
  );

  const [showFeesGlobally, setShowFeesGlobally] = useState(initialConfig?.showFeesGlobally ?? false);

  // Initialize service configurations
  const [serviceConfigs, setServiceConfigs] = useState(() => {
    if (initialConfig?.services) {
      return initialConfig.services;
    }
    return services
      .filter(s => s.isActive)
      .map((s, index) => ({
        serviceId: s.id,
        enabled: true,
        showFees: false,
        showTestimonials: true,
        order: index,
      }));
  });

  // Reorder service
  const moveService = (index: number, direction: 'up' | 'down') => {
    const newConfigs = [...serviceConfigs];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newConfigs.length) return;

    [newConfigs[index], newConfigs[targetIndex]] = [newConfigs[targetIndex], newConfigs[index]];
    
    // Update order values
    newConfigs.forEach((config, idx) => {
      config.order = idx;
    });

    setServiceConfigs(newConfigs);
  };

  const toggleServiceEnabled = (serviceId: string) => {
    setServiceConfigs(prev =>
      prev.map(sc =>
        sc.serviceId === serviceId ? { ...sc, enabled: !sc.enabled } : sc
      )
    );
  };

  const toggleServiceFees = (serviceId: string) => {
    setServiceConfigs(prev =>
      prev.map(sc =>
        sc.serviceId === serviceId ? { ...sc, showFees: !sc.showFees } : sc
      )
    );
  };

  const toggleServiceTestimonials = (serviceId: string) => {
    setServiceConfigs(prev =>
      prev.map(sc =>
        sc.serviceId === serviceId ? { ...sc, showTestimonials: !sc.showTestimonials } : sc
      )
    );
  };

  const getCurrentConfig = (): ServicesBrochureConfig => ({
    showIntro,
    introText,
    showFeesGlobally,
    services: serviceConfigs,
  });

  const handlePreview = () => {
    onPreview(getCurrentConfig());
  };

  const handleSaveAndFinishLater = () => {
    if (onSaveAndFinishLater) {
      onSaveAndFinishLater(getCurrentConfig());
    }
  };

  return (
    <div className="min-h-screen bg-[#f5fafb]">
      {/* Header */}
      <div className="w-full bg-white border-b border-[#ddecf0] py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <TextLogo />
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-['Lora'] text-4xl text-[#034863] mb-1">Services Brochure Editor</h1>
              <p className="font-['Poppins'] text-lg text-[#2f829b] text-[20px]">Configure your services brochure</p>
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
          {/* Intro Section */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-['Lora'] text-3xl text-[#034863]">Introduction Section</h2>
              <label className="flex items-center gap-3 cursor-pointer">
                <span className="font-['Poppins'] text-base text-[#034863]">Show Introduction</span>
                <input
                  type="checkbox"
                  checked={showIntro}
                  onChange={(e) => setShowIntro(e.target.checked)}
                  className="w-5 h-5 rounded border-2 border-[#2f829b] text-[#2f829b] focus:ring-[#2f829b]"
                />
              </label>
            </div>
            {showIntro && (
              <div>
                <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                  Introduction Text
                </label>
                <Textarea
                  value={introText}
                  onChange={(e) => setIntroText(e.target.value)}
                  rows={4}
                  className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                  placeholder="Introduce your services and how this brochure should be used..."
                />
              </div>
            )}
          </div>

          {/* Global Fee Toggle */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-['Lora'] text-3xl text-[#034863] mb-2">Pricing Display</h2>
                <p className="font-['Poppins'] text-base text-[#a8998f]">
                  Control whether pricing information appears in the brochure. You can toggle globally or per service.
                </p>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <span className="font-['Poppins'] text-base text-[#034863]">Show All Fees</span>
                <input
                  type="checkbox"
                  checked={showFeesGlobally}
                  onChange={(e) => setShowFeesGlobally(e.target.checked)}
                  className="w-5 h-5 rounded border-2 border-[#2f829b] text-[#2f829b] focus:ring-[#2f829b]"
                />
              </label>
            </div>
          </div>

          {/* Service Configuration */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <h2 className="font-['Lora'] text-3xl text-[#034863] mb-6">Configure Services</h2>
            <p className="font-['Poppins'] text-base text-[#a8998f] mb-8">
              All service content is managed in Settings → Services. Here you can control visibility, order, and display options.
            </p>

            <div className="space-y-4">
              {serviceConfigs.map((config, index) => {
                const service = services.find(s => s.id === config.serviceId);
                if (!service) return null;

                return (
                  <div
                    key={config.serviceId}
                    className={`border-2 rounded-lg p-6 transition-all ${
                      config.enabled
                        ? 'border-[#2f829b] bg-white'
                        : 'border-[#ddecf0] bg-[#f5fafb] opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Reorder Buttons */}
                      <div className="flex flex-col gap-1 pt-1">
                        <button
                          onClick={() => moveService(index, 'up')}
                          disabled={index === 0}
                          className="text-[#034863] hover:text-[#2f829b] disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronUp className="w-5 h-5" />
                        </button>
                        <GripVertical className="w-5 h-5 text-[#a8998f]" />
                        <button
                          onClick={() => moveService(index, 'down')}
                          disabled={index === serviceConfigs.length - 1}
                          className="text-[#034863] hover:text-[#2f829b] disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronDown className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Service Info */}
                      <div className="flex-1">
                        <h3 className="font-['Lora'] text-2xl text-[#034863] mb-2">{service.name}</h3>
                        <p className="font-['Poppins'] text-base text-[#a8998f] mb-4 line-clamp-2">
                          {service.description}
                        </p>

                        {/* Toggles */}
                        <div className="flex flex-wrap gap-6">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={config.enabled}
                              onChange={() => toggleServiceEnabled(config.serviceId)}
                              className="w-4 h-4 rounded border-2 border-[#2f829b] text-[#2f829b] focus:ring-[#2f829b]"
                            />
                            <span className="font-['Poppins'] text-sm text-[#034863]">Include in Brochure</span>
                          </label>

                          {config.enabled && (
                            <>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={showFeesGlobally || config.showFees}
                                  onChange={() => toggleServiceFees(config.serviceId)}
                                  disabled={showFeesGlobally}
                                  className="w-4 h-4 rounded border-2 border-[#2f829b] text-[#2f829b] focus:ring-[#2f829b] disabled:opacity-50"
                                />
                                <span className="font-['Poppins'] text-sm text-[#034863]">Show Pricing</span>
                              </label>

                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={config.showTestimonials}
                                  onChange={() => toggleServiceTestimonials(config.serviceId)}
                                  className="w-4 h-4 rounded border-2 border-[#2f829b] text-[#2f829b] focus:ring-[#2f829b]"
                                />
                                <span className="font-['Poppins'] text-sm text-[#034863]">Show Testimonials</span>
                              </label>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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
