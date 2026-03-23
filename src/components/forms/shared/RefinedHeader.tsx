import React from 'react';
import { Button } from '../ui/button';
import { Edit, Download, ArrowLeft } from 'lucide-react';
import logo from 'figma:asset/c4b42eda92a6395a0d27891152702b904ad22088.png';

interface RefinedHeaderProps {
  onEdit?: () => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

export function RefinedHeader({ onEdit, onBack, showBackButton = false }: RefinedHeaderProps) {
  return (
    <div className="w-full bg-white border-b border-[#ddecf0] pt-6 pb-3 px-4 sm:px-6 lg:px-8 print:hidden">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <img 
            src={logo} 
            alt="Empower Health Strategies"
            className="h-24"
            style={{ imageRendering: 'crisp-edges' }}
          />
          <div className="flex items-center gap-3">
            {showBackButton && onBack && (
              <Button
                onClick={onBack}
                variant="outline"
                className="border-2 border-[#034863] text-[#034863] hover:bg-[#f5fafb] font-['Poppins'] rounded-lg"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            {onEdit && (
              <Button
                onClick={onEdit}
                variant="outline"
                className="border-2 border-[#034863] text-[#034863] hover:bg-[#f5fafb] font-['Poppins'] rounded-lg"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Document
              </Button>
            )}
            <Button
              onClick={() => window.print()}
              className="bg-[#6b2358] hover:bg-[#6b2358]/90 text-white font-['Poppins'] rounded-lg"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}