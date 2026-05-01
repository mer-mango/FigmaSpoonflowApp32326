import React from 'react';
import { Button } from '../ui/button';
import { FileDown, CheckCircle2, PenLine } from 'lucide-react';
import { exportToPDF } from '../utils/pdfExport';

interface PDFActionButtonsProps {
  documentTitle: string;
  position: 'top' | 'bottom';
  actionType?: 'approve' | 'sign' | 'submit';
  onAction?: () => void;
  onActionAndExport?: () => void;
}

export function PDFActionButtons({
  documentTitle,
  position,
  actionType = 'approve',
  onAction,
  onActionAndExport
}: PDFActionButtonsProps) {
  
  const handleExportPDF = () => {
    exportToPDF(documentTitle);
  };

  const handleActionAndExport = () => {
    if (onActionAndExport) {
      onActionAndExport();
    } else {
      // Default behavior
      alert(`Document ${actionType}d!`);
      exportToPDF(documentTitle);
    }
  };

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      // Default behavior
      alert(`Document ${actionType}d!`);
    }
  };

  const getActionLabel = () => {
    switch (actionType) {
      case 'sign':
        return 'Sign';
      case 'submit':
        return 'Submit';
      case 'approve':
      default:
        return 'Approve';
    }
  };

  const getActionIcon = () => {
    switch (actionType) {
      case 'sign':
        return <PenLine className="w-5 h-5 mr-2" />;
      case 'submit':
      case 'approve':
      default:
        return <CheckCircle2 className="w-5 h-5 mr-2" />;
    }
  };

  if (position === 'top') {
    return (
      <div className="py-4 px-4 sm:px-6 lg:px-8 no-print">
        <div className="max-w-5xl mx-auto flex justify-end">
          <Button
            onClick={handleExportPDF}
            className="bg-[#6b2358] hover:bg-[#6b2358]/90 text-white font-['Poppins'] rounded-lg px-6 py-2"
          >
            <FileDown className="w-5 h-5 mr-2" />
            Export as PDF
          </Button>
        </div>
      </div>
    );
  }

  // Bottom position
  return (
    <div className="mt-12 pt-8 border-t-2 border-[#ddecf0] no-print">
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Button
          onClick={handleActionAndExport}
          className="bg-[#6b2358] hover:bg-[#6b2358]/90 text-white font-['Poppins'] rounded-lg px-8 py-3 w-full sm:w-auto"
        >
          {getActionIcon()}
          {getActionLabel()} & Export as PDF
        </Button>
        <Button
          onClick={handleAction}
          className="bg-[#2f829b] hover:bg-[#2f829b]/90 text-white font-['Poppins'] rounded-lg px-8 py-3 w-full sm:w-auto"
        >
          {getActionIcon()}
          {getActionLabel()}
        </Button>
      </div>
    </div>
  );
}
