import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface CalendarOAuthCallbackProps {
  code: string | null;
  error: string | null;
}

export function CalendarOAuthCallback({ code, error }: CalendarOAuthCallbackProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  // Send debug info to parent immediately
  useEffect(() => {
    const debugInfo = {
      type: 'calendar-debug',
      code: code?.substring(0, 30) + '...', 
      error,
      hasOpener: !!window.opener,
      timestamp: new Date().toISOString()
    };
    console.log('🎯 CalendarOAuthCallback rendered with:', debugInfo);
    
    if (window.opener) {
      window.opener.postMessage(debugInfo, '*');
    }
  }, []);

  useEffect(() => {
    const exchangeCode = async () => {
      if (error) {
        console.error('❌ OAuth error received:', error);
        setStatus('error');
        setMessage(`Authorization failed: ${error}`);
        return;
      }

      if (!code) {
        console.error('❌ No code provided to CalendarOAuthCallback');
        setStatus('error');
        setMessage('No authorization code received');
        
        // Notify parent of failure
        if (window.opener) {
          window.opener.postMessage({ 
            type: 'calendar-error',
            error: 'No authorization code received'
          }, '*');
        }
        return;
      }

      try {
        console.log('📅 CalendarOAuthCallback: Exchanging Calendar OAuth code for tokens...');
        console.log('📅 CalendarOAuthCallback: Code:', code);
        
        const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-a89809a8`;
        console.log('📅 CalendarOAuthCallback: Calling:', `${serverUrl}/calendar/exchange`);
        
        const response = await fetch(`${serverUrl}/calendar/exchange`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ code })
        });
        
        console.log('📅 CalendarOAuthCallback: Exchange response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('📅 CalendarOAuthCallback: Exchange response data:', data);
          setStatus('success');
          setMessage('Google Calendar connected successfully!');
          
          // Notify parent window
          if (window.opener) {
            window.opener.postMessage({ 
              type: 'calendar-connected',
              email: data.email 
            }, '*');
            
            // Close the popup after notifying parent
            setTimeout(() => {
              window.close();
            }, 1500);
          } else {
            // If no opener (opened directly), redirect to settings
            setTimeout(() => {
              window.location.href = '/?page=settings&tab=integrations';
            }, 2000);
          }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Connecting Google Calendar...</h2>
            <p className="text-gray-600">Please wait while we complete the connection.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Successfully Connected!</h2>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500 mt-4">Redirecting to Settings...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Connection Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => window.location.href = '/?page=settings&tab=integrations'}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Settings
            </button>
          </>
        )}
      </div>
    </div>
  );
}