import React, { useState } from 'react';
import { Search, Upload, Download, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Contact {
  id: string;
  name: string;
  email?: string;
  company?: string;
  phone?: string;
  role?: string;
  title?: string;
  tags?: string[];
  notes?: string;
  color?: string;
  starred?: boolean;
  contactType?: 'network';
}

interface ContactRecoveryToolProps {
  onRestore: (contacts: Contact[]) => void;
}

export function ContactRecoveryTool({ onRestore }: ContactRecoveryToolProps) {
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [manualImport, setManualImport] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const searchBackups = async () => {
    setSearching(true);
    setStatus(null);
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/debug/contact-backups`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to search backups: ${response.status}`);
      }

      const data = await response.json();
      setSearchResults(data);
      
      // Check if any backups were found
      const foundBackup = Object.values(data.specificKeys).some((result: any) => result.found);
      
      if (foundBackup) {
        setStatus({
          type: 'success',
          message: 'Found contact backups! Check the results below to restore.'
        });
      } else {
        setStatus({
          type: 'info',
          message: 'No backups found in the backend. You can manually import contacts using JSON below.'
        });
      }
    } catch (error) {
      console.error('Error searching backups:', error);
      setStatus({
        type: 'error',
        message: `Failed to search for backups: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setSearching(false);
    }
  };

  const restoreFromBackup = async (key: string) => {
    setStatus(null);
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/kv/${key}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch backup: ${response.status}`);
      }

      const data = await response.json();
      const contacts = Array.isArray(data.value) ? data.value : [];
      
      if (contacts.length === 0) {
        setStatus({
          type: 'error',
          message: 'No contacts found in this backup'
        });
        return;
      }

      // Restore contacts
      onRestore(contacts);
      
      setStatus({
        type: 'success',
        message: `Successfully restored ${contacts.length} contacts!`
      });
    } catch (error) {
      console.error('Error restoring from backup:', error);
      setStatus({
        type: 'error',
        message: `Failed to restore: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  };

  const handleManualImport = () => {
    setStatus(null);
    
    try {
      const contacts = JSON.parse(manualImport);
      
      if (!Array.isArray(contacts)) {
        throw new Error('Import data must be an array of contacts');
      }
      
      // Validate contacts have required fields
      const validContacts = contacts.filter(c => c.id && c.name);
      
      if (validContacts.length === 0) {
        throw new Error('No valid contacts found. Each contact must have at least an "id" and "name"');
      }
      
      onRestore(validContacts);
      setManualImport('');
      
      setStatus({
        type: 'success',
        message: `Successfully imported ${validContacts.length} contacts!`
      });
    } catch (error) {
      console.error('Error importing contacts:', error);
      setStatus({
        type: 'error',
        message: `Import failed: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  };

  const checkLocalStorage = () => {
    try {
      const stored = localStorage.getItem('spoonflow_contacts');
      if (stored) {
        const contacts = JSON.parse(stored);
        setStatus({
          type: 'info',
          message: `Found ${contacts.length} contacts in localStorage`
        });
        setManualImport(JSON.stringify(contacts, null, 2));
      } else {
        setStatus({
          type: 'info',
          message: 'No contacts found in localStorage'
        });
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Failed to read from localStorage'
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Search className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold">Contact Recovery Tool</h2>
        </div>

        {status && (
          <div className={`mb-4 p-4 rounded-lg flex items-start gap-3 ${
            status.type === 'success' ? 'bg-green-50 text-green-800' :
            status.type === 'error' ? 'bg-red-50 text-red-800' :
            'bg-blue-50 text-blue-800'
          }`}>
            {status.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" /> :
             status.type === 'error' ? <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" /> :
             <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
            <p>{status.message}</p>
          </div>
        )}

        {/* Search Backend Backups */}
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Step 1: Search Backend Backups</h3>
            <button
              onClick={searchBackups}
              disabled={searching}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {searching ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Search for Backups
                </>
              )}
            </button>
          </div>

          {searchResults && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <h4 className="font-medium">Search Results:</h4>
              
              {/* Specific Keys */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Specific backup keys:</p>
                <div className="space-y-2">
                  {Object.entries(searchResults.specificKeys).map(([key, result]: [string, any]) => (
                    <div key={key} className="flex items-center justify-between bg-white p-3 rounded border">
                      <div>
                        <code className="text-sm font-mono">{key}</code>
                        {result.found && (
                          <span className="ml-2 text-sm text-green-600">
                            ({result.count} contacts)
                          </span>
                        )}
                      </div>
                      {result.found ? (
                        <button
                          onClick={() => restoreFromBackup(key)}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          Restore
                        </button>
                      ) : (
                        <span className="text-sm text-gray-400">Not found</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Prefix Search */}
              {searchResults.prefixSearch.count > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Keys with "contact" prefix: ({searchResults.prefixSearch.count})
                  </p>
                  <div className="space-y-2">
                    {searchResults.prefixSearch.keys.map((item: any) => (
                      <div key={item.key} className="flex items-center justify-between bg-white p-3 rounded border">
                        <div>
                          <code className="text-sm font-mono">{item.key}</code>
                          {item.count !== 'N/A' && (
                            <span className="ml-2 text-sm text-green-600">
                              ({item.count} contacts)
                            </span>
                          )}
                        </div>
                        {item.hasValue && (
                          <button
                            onClick={() => restoreFromBackup(item.key)}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                          >
                            Restore
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Check localStorage */}
          <div className="pt-4 border-t">
            <h3 className="font-medium mb-2">Step 2: Check Local Browser Storage</h3>
            <button
              onClick={checkLocalStorage}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <Download className="w-4 h-4" />
              Check localStorage
            </button>
          </div>

          {/* Manual Import */}
          <div className="pt-4 border-t">
            <h3 className="font-medium mb-2">Step 3: Manual Import (JSON)</h3>
            <p className="text-sm text-gray-600 mb-2">
              If you have a backup JSON file, paste it here:
            </p>
            <textarea
              value={manualImport}
              onChange={(e) => setManualImport(e.target.value)}
              placeholder='[{"id": "1", "name": "John Doe", "email": "john@example.com"}, ...]'
              className="w-full h-40 p-3 border border-gray-300 rounded-lg font-mono text-sm"
            />
            <button
              onClick={handleManualImport}
              disabled={!manualImport.trim()}
              className="mt-2 flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4" />
              Import Contacts
            </button>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-medium text-yellow-900 mb-2">💡 Tips</h3>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• The backend backup runs automatically when you save contacts</li>
          <li>• Check your browser's localStorage first - it's the primary storage</li>
          <li>• If you have a JSON export from before, you can paste it in the manual import section</li>
          <li>• After restoring, your contacts will be automatically saved to both localStorage and backend</li>
        </ul>
      </div>
    </div>
  );
}
