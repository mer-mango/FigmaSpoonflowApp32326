import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface GmailOAuthCallbackProps {
  code: string | null;
  error: string | null;
}

export function GmailOAuthCallback({ code, error }: GmailOAuthCallbackProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const exchangeCode = async () => {
      if (error) {
        setStatus('error');
        setMessage(`Authorization failed: ${error}`);
        return;
      }

      if (!code) {
        setStatus('error');
        setMessage('No authorization code received');
        return;
      }

      try {
        console.log('📧 Exchanging OAuth code for tokens...');
        
        const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-a89809a8`;
        const response = await fetch(`${serverUrl}/gmail/exchange`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ code })
        });

        if (response.ok) {
          const data = await response.json();
          setStatus('success');
          setMessage('Gmail connected successfully!');
          
          // Notify parent window and close
          if (window.opener) {
            window.opener.postMessage({ 
              type: 'gmail-connected',
              email: data.email 
            }, '*');
          }
          
          // Redirect to main app after short delay
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        } else {
          const errorData = await response.json();
          setStatus('error');
          setMessage(`Failed to connect: ${errorData.error || 'Unknown error'}`);
          console.error('❌ Exchange failed:', errorData);
        }
      } catch (err) {
        setStatus('error');
        setMessage(`Connection failed: ${err instanceof Error ? err.message : String(err)}`);
        console.error('❌ Error exchanging code:', err);
      }
    };

    exchangeCode();
  }, [code, error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Connecting Gmail...</h2>
            <p className="text-gray-600">Please wait while we complete the connection.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Successfully Connected!</h2>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500 mt-4">Redirecting...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Connection Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to App
            </button>
          </>
        )}
      </div>
    </div>
  );
}