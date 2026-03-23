import React from 'react';
import brandMark from 'figma:asset/6c9493d2049fedc6dcf9a1a4f4a3dbc7a26b8b77.png';

export function DocumentFooter() {
  return (
    <div className="mt-12 pt-8 border-t-2 border-[#ddecf0]">
      <p className="text-left mb-6" style={{ fontSize: '18px', color: '#000000' }}>
        Please contact{' '}
        <a 
          href="mailto:meredith@empowerhealthstrategies.com" 
          className="underline text-[#2f829b] hover:text-[#034863]"
        >
          meredith@empowerhealthstrategies.com
        </a>
        {' '}if you have any questions.
      </p>
      
      <div className="flex items-start gap-4">
        {/* Brand Mark */}
        <div className="flex-shrink-0">
          <img src={brandMark} alt="Empower Health Strategies" className="w-[70px] h-[70px] object-contain" />
        </div>
        
        <div className="text-left">
          <p className="font-['Poppins']" style={{ fontSize: '18px', color: '#000000', fontWeight: '600', marginBottom: '4px' }}>
            Empower Health Strategies, LLC
          </p>
          <a 
            href="https://www.empowerhealthstrategies.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-['Poppins'] text-[#2f829b] hover:text-[#034863] underline block"
            style={{ fontSize: '18px', marginBottom: '4px' }}
          >
            www.empowerhealthstrategies.com
          </a>
          <p className="font-['Poppins']" style={{ fontSize: '18px', color: '#034863' }}>
            © 2026 Empower Health Strategies
          </p>
        </div>
      </div>
    </div>
  );
}