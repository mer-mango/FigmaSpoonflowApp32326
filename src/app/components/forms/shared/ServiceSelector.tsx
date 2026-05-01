import React from 'react';
import { Package, FileText } from 'lucide-react';
import { Service } from '../../../App';

interface ServiceSelectorProps {
  services: Service[];
  selectedServiceId: string;
  onSelectService: (serviceId: string) => void;
  onLoadServiceData?: () => void; // Optional callback to load service data into form
  label?: string;
  showLoadButton?: boolean; // Whether to show "Load from Service" button
}

export function ServiceSelector({
  services,
  selectedServiceId,
  onSelectService,
  onLoadServiceData,
  label = 'Link to Service',
  showLoadButton = true
}: ServiceSelectorProps) {
  const selectedService = services.find(s => s.id === selectedServiceId);

  return (
    <div className="bg-white border-2 border-[#ddecf0] rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-['Poppins'] font-medium text-[#034863] flex items-center gap-2">
          <Package className="w-5 h-5 text-[#2f829b]" />
          {label}
        </h3>
        {showLoadButton && selectedService && onLoadServiceData && (
          <button
            onClick={onLoadServiceData}
            className="px-3 py-1.5 bg-[#6b2358] text-white rounded-lg text-sm font-['Poppins'] hover:bg-[#6b2358]/90 transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Load from Service
          </button>
        )}
      </div>

      <select
        value={selectedServiceId}
        onChange={(e) => onSelectService(e.target.value)}
        className="w-full px-4 py-3 border-2 border-[#ddecf0] rounded-lg font-['Poppins'] text-[16px] text-[#034863] focus:border-[#2f829b] focus:ring-0 transition-colors"
      >
        <option value="">Select a service...</option>
        {services
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(service => (
            <option key={service.id} value={service.id}>
              {service.name}
            </option>
          ))}
      </select>

      {selectedService && (
        <div className="mt-4 p-4 bg-[#f5fafb] rounded-lg space-y-2">
          <div className="flex items-start gap-2">
            <Package className="w-4 h-4 text-[#2f829b] mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-['Poppins'] font-medium text-[#034863] mb-1">
                {selectedService.name}
              </div>
              {selectedService.description && (
                <div className="font-['Poppins'] text-sm text-[#034863]/70">
                  {selectedService.description}
                </div>
              )}
            </div>
          </div>
          {selectedService.category && (
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-1 bg-[#2f829b]/10 text-[#2f829b] rounded font-['Poppins']">
                {selectedService.category}
              </span>
            </div>
          )}
        </div>
      )}

      {showLoadButton && selectedService && (
        <div className="mt-3 p-3 bg-[#6b2358]/5 border border-[#6b2358]/20 rounded-lg">
          <p className="font-['Poppins'] text-xs text-[#034863]/70">
            💡 Click "Load from Service" to auto-populate this form with service details from Settings
          </p>
        </div>
      )}
    </div>
  );
}
