import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function CalendarOAuthLauncher() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initiateOAuth = async () => {
      try {
        const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-a89809a8`;
        
        console.log('📅 Fetching Calendar OAuth URL from server...');
        
        // Use POST to get the OAuth URL (with proper Authorization header)
        const response = await fetch(`${serverUrl}/calendar/authorize`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || `Server error: ${response.status}`);
        }

        const data = await response.json();
        console.log('📅 Got OAuth URL, redirecting to Google...');
        
        // Redirect to Google's OAuth page
        window.location.href = data.authUrl;
      } catch (err) {
        console.error('OAuth initiation error:', err);
        setError(err instanceof Error ? err.message : 'Failed to connect');
      }
    };

    initiateOAuth();
  }, []);

  if (error) {
    return (
      <div style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        margin: 0,
        background: 'linear-gradient(135deg, #4285f4 0%, #34a853 100%)'
      }}>
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '12px',
          maxWidth: '400px',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#dc2626', marginTop: 0 }}>Connection Error</h2>
          <p style={{ color: '#6b7280' }}>{error}</p>
          <button
            onClick={() => window.close()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: '#EA4335',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      margin: 0,
      background: 'linear-gradient(135deg, #4285f4 0%, #34a853 100%)'
    }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <div style={{
          border: '3px solid rgba(255,255,255,0.3)',
          borderTop: '3px solid white',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }} />
        <p>Connecting to Google Calendar...</p>
      </div>
    </div>
  );
}
