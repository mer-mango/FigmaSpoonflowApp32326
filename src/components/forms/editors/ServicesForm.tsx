import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Eye, Plus, Trash2, Save, RefreshCw } from 'lucide-react';
import { Service as SettingsService } from '../../../App';

interface ServiceFeature {
  id: string;
  text: string;
}

interface BrochureService {
  id: string;
  title: string;
  description: string;
  features: ServiceFeature[];
  priceRange: string;
}

interface ServicesFormProps {
  onPreview: (data: any) => void;
  onBack: () => void;
  onSave?: () => void;
  backButtonLabel?: string;
  services?: SettingsService[];
}

export function ServicesForm({ onPreview, onBack, onSave, backButtonLabel = 'Back to Flow Wizard', services: settingsServices = [] }: ServicesFormProps) {
  // Form header
  const [brochureTitle, setBrochureTitle] = useState('Service Offerings');
  const [brochureDate, setBrochureDate] = useState('January 1, 2026');
  const [companyOverview, setCompanyOverview] = useState('Empower Health Strategies partners with healthcare organizations to transform patient experiences through strategic consulting, innovative design, and practical implementation support.');

  // Convert settings services to brochure format
  const convertSettingsServices = (): BrochureService[] => {
    return settingsServices
      .filter(s => s.isActive)
      .map(service => ({
        id: service.id,
        title: service.name,
        description: service.description,
        features: service.deliverables
          .filter(d => d.trim() !== '')
          .map((deliverable, idx) => ({
            id: `${service.id}-f${idx}`,
            text: deliverable
          })),
        priceRange: service.price
      }));
  };

  // Services - initialize from Settings if available
  const [services, setServices] = useState<BrochureService[]>(() => {
    if (settingsServices && settingsServices.length > 0) {
      return convertSettingsServices();
    }
    return [
      {
        id: 's1',
        title: 'Patient Experience Innovation Audit',
        description: 'Comprehensive assessment of your organization\'s current patient experience capabilities, identifying opportunities for improvement and innovation.',
        features: [
          { id: 'f1', text: 'Stakeholder interviews and surveys' },
          { id: 'f2', text: 'Journey mapping and touchpoint analysis' },
          { id: 'f3', text: 'Competitive benchmarking' },
          { id: 'f4', text: 'Detailed recommendations report' }
        ],
        priceRange: '$12,000 - $25,000'
      },
      {
        id: 's2',
        title: 'Digital Health Strategy & Consulting',
        description: 'Strategic guidance for developing and implementing digital health solutions that enhance patient engagement and outcomes.',
        features: [
          { id: 'f5', text: 'Digital maturity assessment' },
          { id: 'f6', text: 'Technology selection support' },
          { id: 'f7', text: 'Implementation roadmap' },
          { id: 'f8', text: 'Change management planning' }
        ],
        priceRange: '$15,000 - $40,000'
      },
      {
        id: 's3',
        title: 'Workshop & Training Programs',
        description: 'Customized workshops and training sessions to build internal capabilities in patient experience design and digital health innovation.',
        features: [
          { id: 'f9', text: 'Half-day or full-day workshops' },
          { id: 'f10', text: 'Design thinking facilitation' },
          { id: 'f11', text: 'Staff training programs' },
          { id: 'f12', text: 'Follow-up coaching sessions' }
        ],
        priceRange: '$3,500 - $12,000 per workshop'
      }
    ];
  });

  const loadFromSettings = () => {
    if (settingsServices && settingsServices.length > 0) {
      setServices(convertSettingsServices());
    }
  };

  const addService = () => {
    setServices([
      ...services,
      {
        id: `s-${Date.now()}`,
        title: 'New Service',
        description: 'Service description goes here',
        features: [],
        priceRange: '$0 - $0'
      }
    ]);
  };

  const removeService = (serviceId: string) => {
    setServices(services.filter(s => s.id !== serviceId));
  };

  const updateService = (serviceId: string, field: keyof BrochureService, value: any) => {
    setServices(services.map(s => 
      s.id === serviceId ? { ...s, [field]: value } : s
    ));
  };

  const addFeature = (serviceId: string) => {
    setServices(services.map(s => {
      if (s.id === serviceId) {
        return {
          ...s,
          features: [...s.features, { id: `f-${Date.now()}`, text: 'New feature' }]
        };
      }
      return s;
    }));
  };

  const removeFeature = (serviceId: string, featureId: string) => {
    setServices(services.map(s => {
      if (s.id === serviceId) {
        return {
          ...s,
          features: s.features.filter(f => f.id !== featureId)
        };
      }
      return s;
    }));
  };

  const updateFeature = (serviceId: string, featureId: string, text: string) => {
    setServices(services.map(s => {
      if (s.id === serviceId) {
        return {
          ...s,
          features: s.features.map(f => 
            f.id === featureId ? { ...f, text } : f
          )
        };
      }
      return s;
    }));
  };

  const handlePreview = () => {
    onPreview({
      brochureTitle,
      brochureDate,
      companyOverview,
      services
    });
  };

  return (
    <div className="min-h-screen bg-[#f5fafb]">
      {/* Header */}
      <div className="w-full bg-white border-b border-[#ddecf0] py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <img 
            src="figma:asset/35c7e77331367a5f6eb867f11816801708628944.png" 
            alt="Empower Health Strategies"
            className="h-12 mb-4"
          />
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-['Lora'] text-4xl text-[#034863] mb-1">Services Brochure Editor</h1>
              <p className="font-['Poppins'] text-lg text-[#2f829b] text-[20px]">Showcase your service offerings</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={onBack}
                variant="outline"
                className="border-2 border-[#034863] text-[#034863] hover:bg-[#f5fafb] font-['Poppins'] rounded-lg"
              >
                ← {backButtonLabel}
              </Button>
              {onSave && (
                <Button
                  onClick={onSave}
                  className="bg-[#2f829b] hover:bg-[#2f829b]/90 text-white font-['Poppins'] rounded-lg"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save & Return
                </Button>
              )}
              <Button
                onClick={handlePreview}
                className="bg-[#6b2358] hover:bg-[#6b2358]/90 text-white font-['Poppins'] rounded-lg"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview Brochure
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Brochure Header */}
          <div className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
            <h2 className="font-['Lora'] text-3xl text-[#034863] mb-6">Brochure Information</h2>
            <div className="space-y-6">
              <div>
                <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                  Brochure Title
                </label>
                <Input
                  value={brochureTitle}
                  onChange={(e) => setBrochureTitle(e.target.value)}
                  className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                />
              </div>
              <div>
                <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                  Date
                </label>
                <Input
                  value={brochureDate}
                  onChange={(e) => setBrochureDate(e.target.value)}
                  className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                />
              </div>
              <div>
                <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                  Company Overview
                </label>
                <Textarea
                  value={companyOverview}
                  onChange={(e) => setCompanyOverview(e.target.value)}
                  rows={4}
                  className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                />
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-['Lora'] text-3xl text-[#034863]">Services</h2>
            {settingsServices && settingsServices.filter(s => s.isActive).length > 0 && (
              <Button
                onClick={loadFromSettings}
                variant="outline"
                className="border-2 border-[#2f829b] text-[#2f829b] hover:bg-[#2f829b]/10 font-['Poppins'] rounded-lg"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Load from Settings ({settingsServices.filter(s => s.isActive).length} services)
              </Button>
            )}
          </div>

          {services.map((service, index) => (
            <div key={service.id} className="bg-white p-8 rounded-xl border-2 border-[#ddecf0]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-['Lora'] text-3xl text-[#034863]">Service {index + 1}</h2>
                <Button
                  onClick={() => removeService(service.id)}
                  variant="outline"
                  className="border-2 border-red-500 text-red-500 hover:bg-red-50 font-['Poppins'] rounded-lg"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove Service
                </Button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                    Service Title
                  </label>
                  <Input
                    value={service.title}
                    onChange={(e) => updateService(service.id, 'title', e.target.value)}
                    className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                  />
                </div>
                
                <div>
                  <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                    Description
                  </label>
                  <Textarea
                    value={service.description}
                    onChange={(e) => updateService(service.id, 'description', e.target.value)}
                    rows={3}
                    className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block font-['Poppins'] text-sm font-medium text-[#034863] text-[20px]">
                      Key Features
                    </label>
                    <Button
                      onClick={() => addFeature(service.id)}
                      size="sm"
                      className="bg-[#2f829b] hover:bg-[#034863] text-white font-['Poppins'] rounded-lg"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Feature
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {service.features.map((feature) => (
                      <div key={feature.id} className="flex items-center gap-2">
                        <Input
                          value={feature.text}
                          onChange={(e) => updateFeature(service.id, feature.id, e.target.value)}
                          className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                          placeholder="Feature description..."
                        />
                        <Button
                          onClick={() => removeFeature(service.id, feature.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                    Price Range
                  </label>
                  <Input
                    value={service.priceRange}
                    onChange={(e) => updateService(service.id, 'priceRange', e.target.value)}
                    className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                    placeholder="e.g., $5,000 - $15,000"
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Add Service Button */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={addService}
              className="bg-[#6b2358] hover:bg-[#6b2358]/90 text-white font-['Poppins'] text-xl rounded-lg px-12 py-6"
            >
              <Plus className="w-6 h-6 mr-2" />
              Add Service
            </Button>
          </div>

          {/* Bottom Navigation Buttons */}
          <div className="flex justify-end gap-3 pt-8">
            <Button
              onClick={onBack}
              variant="outline"
              className="border-2 border-[#034863] text-[#034863] hover:bg-[#f5fafb] font-['Poppins'] rounded-lg"
            >
              ← {backButtonLabel}
            </Button>
            <Button
              onClick={handlePreview}
              className="bg-[#6b2358] hover:bg-[#6b2358]/90 text-white font-['Poppins'] rounded-lg"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview Brochure
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}