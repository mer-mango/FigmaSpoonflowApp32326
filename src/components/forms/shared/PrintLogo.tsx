import React from 'react';
import logo from 'figma:asset/c4b42eda92a6395a0d27891152702b904ad22088.png';

export function PrintLogo() {
  return (
    <div className="hidden print-only-logo mb-8 pb-4 border-b border-[#ddecf0]">
      <img 
        src={logo} 
        alt="Empower Health Strategies"
        className="h-16"
        style={{ imageRendering: 'crisp-edges' }}
      />
    </div>
  );
}
