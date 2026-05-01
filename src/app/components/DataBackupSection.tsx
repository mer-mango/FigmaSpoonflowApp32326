import { useState } from 'react';
import { Download, Upload, Database, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function DataBackupSection() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // Fetch all data from the server
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/export-data`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const data = await response.json();
      
      // Create a downloadable JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `spoonflow-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Send data to server for import
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/import-data`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to import data');
      }

      toast.success('Data imported successfully. Please refresh the page.');
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import data. Please check the file format.');
    } finally {
      setIsImporting(false);
      // Reset the file input
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Backup & Restore</h3>
        <p className="text-sm text-gray-600">
          Export your SpoonFlow data for backup or import previously exported data.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <p className="font-medium mb-1">Important Notes:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Importing data will overwrite existing data with the same keys</li>
            <li>Make sure to refresh the page after importing to see changes</li>
            <li>Keep your backup files in a safe location</li>
          </ul>
        </div>
      </div>

      <div className="space-y-4">
        {/* Export Section */}
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Download className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-1">Export Data</h4>
              <p className="text-sm text-gray-600 mb-4">
                Download all your SpoonFlow data as a JSON file.
              </p>
              <button
                onClick={handleExportData}
                disabled={isExporting}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                {isExporting ? 'Exporting...' : 'Export Data'}
              </button>
            </div>
          </div>
        </div>

        {/* Import Section */}
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-1">Import Data</h4>
              <p className="text-sm text-gray-600 mb-4">
                Restore your SpoonFlow data from a previously exported JSON file.
              </p>
              <label className="inline-block">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  disabled={isImporting}
                  className="hidden"
                />
                <span className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  {isImporting ? 'Importing...' : 'Import Data'}
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Database className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-700">
            <p className="font-medium mb-1">What's included in backups:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Tasks and to-dos</li>
              <li>Contacts and relationships</li>
              <li>Content pieces and drafts</li>
              <li>Calendar events and time blocks</li>
              <li>Settings and preferences</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}