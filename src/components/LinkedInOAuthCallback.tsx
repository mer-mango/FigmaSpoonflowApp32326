import { useEffect, useState } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface LinkedInOAuthCallbackProps {
  code: string | null;
  error: string | null;
}

export function LinkedInOAuthCallback({ code, error }: LinkedInOAuthCallbackProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing LinkedIn authorization...');

  useEffect(() => {
    const exchangeCode = async () => {
      if (error) {
        console.error('❌ LinkedIn OAuth error:', error);
        setStatus('error');
        setMessage(`LinkedIn authorization failed: ${error}`);
        
        // Close after delay
        setTimeout(() => {
          window.close();
        }, 3000);
        return;
      }

      if (!code) {
        console.error('❌ No authorization code received');
        setStatus('error');
        setMessage('No authorization code received from LinkedIn');
        
        // Close after delay
        setTimeout(() => {
          window.close();
        }, 3000);
        return;
      }

      try {
        console.log('🔄 Exchanging LinkedIn authorization code...');
        
        const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-a89809a8`;
        const redirectUri = window.location.origin + '/?linkedin_callback=true';
        
        const response = await fetch(`${serverUrl}/linkedin/exchange`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            code,
            redirectUri
          })
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ LinkedIn connected successfully:', data);
          setStatus('success');
          setMessage('LinkedIn connected successfully! You can close this window.');
          
          // Notify parent window if opened in popup
          if (window.opener) {
            window.opener.postMessage({
              type: 'linkedin-oauth-success',
              data
            }, window.location.origin);
          }
          
          // Close after short delay
          setTimeout(() => {
            window.close();
          }, 2000);
        } else {
          const errorData = await response.json();
          console.error('❌ Failed to exchange LinkedIn code:', errorData);
          setStatus('error');
          setMessage(`Failed to connect LinkedIn: ${errorData.error || 'Unknown error'}`);
          
          // Close after delay
          setTimeout(() => {
            window.close();
          }, 3000);
        }
      } catch (err) {
        console.error('❌ Error during LinkedIn OAuth:', err);
        setStatus('error');
        setMessage('An error occurred during LinkedIn authorization');
        
        // Close after delay
        setTimeout(() => {
          window.close();
        }, 3000);
      }
    };

    exchangeCode();
  }, [code, error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5fafb] to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2f829b] mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-[#034863] mb-2">
              Connecting LinkedIn...
            </h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-[#034863] mb-2">
              Success!
            </h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-[#034863] mb-2">
              Connection Failed
            </h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}
      </div>
    </div>
  );
}
