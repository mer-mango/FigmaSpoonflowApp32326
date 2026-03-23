import React from 'react';
import logo from 'figma:asset/c4b42eda92a6395a0d27891152702b904ad22088.png';

export function TextLogo() {
  return (
    <div className="mb-8">
      <img src={logo} alt="Empower Health Strategies" className="h-12 w-auto object-contain" />
    </div>
  );
}