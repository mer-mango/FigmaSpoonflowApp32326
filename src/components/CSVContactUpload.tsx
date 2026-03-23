import { useState } from "react";
import { Upload, X, Check, AlertCircle, Download, Users, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "./ui/button";
import { Contact } from "./ContactsPage";
import { mutedRainbow } from "../lib/colors";

interface CSVContactUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (contacts: Partial<Contact>[]) => void;
}

export function CSVContactUpload({ isOpen, onClose, onImport }: CSVContactUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [preview, setPreview] = useState<Partial<Contact>[]>([]);
  const [error, setError] = useState<string>("");
  const [isMaximized, setIsMaximized] = useState(false);

  const colorOptions = Object.values(mutedRainbow);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      setError("Please upload a CSV file");
      return;
    }

    setFile(selectedFile);
    setError("");
    parseCSV(selectedFile);
  };

  const parseCSV = (file: File) => {
    setParsing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split("\n").filter(line => line.trim());
        
        if (lines.length < 2) {
          setError("CSV file appears to be empty");
          setParsing(false);
          return;
        }

        // Proper CSV parser that handles quoted fields with commas
        const parseCSVLine = (line: string): string[] => {
          const result: string[] = [];
          let current = '';
          let inQuotes = false;
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];
            
            if (char === '"') {
              if (inQuotes && nextChar === '"') {
                // Handle escaped quotes
                current += '"';
                i++; // Skip next quote
              } else {
                // Toggle quote state
                inQuotes = !inQuotes;
              }
            } else if (char === ',' && !inQuotes) {
              // End of field
              result.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          
          // Add the last field
          result.push(current.trim());
          return result;
        };

        // Parse header
        const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase());
        
        // Map common field names
        const fieldMap: Record<string, string> = {
          "name": "name",
          "full name": "name",
          "contact name": "name",
          "role": "role",
          "title": "role",
          "job title": "role",
          "company": "company",
          "organization": "company",
          "contact type": "contactType",
          "type": "contactType",
          "from": "from",
          "about": "about",
          "email": "email",
          "email address": "email",
          "linkedin": "linkedinUrl",
          "linkedin url": "linkedinUrl",
          "linkedin profile": "linkedinUrl",
          "linkedin profile link": "linkedinUrl",
          "linkedin profile url": "linkedinUrl",
          "city": "city",
          "state": "state",
          "phone": "phone",
          "phone number": "phone",
          "tags": "tags",
          "notes": "notes",
        };

        // Parse data rows
        const parsedContacts: Partial<Contact>[] = lines.slice(1).map((line, index) => {
          const values = parseCSVLine(line);
          const contact: Partial<Contact> = {
            color: colorOptions[index % colorOptions.length],
            contactType: 'network', // Default to network
          };

          headers.forEach((header, i) => {
            const mappedField = fieldMap[header];
            const value = values[i] || '';

            if (mappedField && value) {
              if (mappedField === "tags") {
                contact.tags = value.split(";").map(t => t.trim()).filter(t => t);
              } else if (mappedField === "contactType") {
                // Normalize contact type to valid values
                const normalized = value.toLowerCase();
                if (normalized === "prospect" || normalized === "client" || normalized === "network") {
                  contact.contactType = normalized as 'prospect' | 'client' | 'network';
                }
              } else {
                (contact as any)[mappedField] = value;
              }
            }
          });

          // Generate initials
          if (contact.name) {
            contact.initials = contact.name
              .split(" ")
              .map(n => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);
          }

          return contact;
        }).filter(c => c.name); // Only include contacts with names

        setPreview(parsedContacts);
        setParsing(false);
      } catch (err) {
        console.error("CSV parsing error:", err);
        setError("Error parsing CSV file. Please check the format.");
        setParsing(false);
      }
    };

    reader.onerror = () => {
      setError("Error reading file");
      setParsing(false);
    };

    reader.readAsText(file);
  };

  const handleImport = () => {
    onImport(preview);
    handleClose();
  };

  const handleClose = () => {
    setFile(null);
    setPreview([]);
    setError("");
    onClose();
  };

  const downloadTemplate = () => {
    const csvContent = "name,role,company,contact type,from,about,email,linkedin profile url,city,state\n" +
      "John Smith,CEO,Acme Inc,client,Referral from Jane,Great strategic thinker,john@example.com,https://linkedin.com/in/johnsmith,Boston,MA\n" +
      "Jane Doe,VP of Marketing,Tech Corp,prospect,LinkedIn,Interested in patient experience,jane@example.com,https://linkedin.com/in/janedoe,Austin,TX";
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contacts-template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
      {/* Blurred background overlay */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={handleClose}
      />
      
      {/* Modal content */}
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full flex flex-col overflow-hidden transition-all duration-300 ${
        isMaximized ? 'w-[98vw] h-[98vh] max-w-[98vw]' : 'w-[85vw] h-[90vh] max-w-[85vw]'
      }`}>
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="mb-1">Import Contacts from CSV</h2>
            <p className="text-sm text-gray-600">Upload a CSV file to bulk import contacts</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={isMaximized ? "Restore size" : "Maximize"}
            >
              {isMaximized ? (
                <Minimize2 className="w-5 h-5 text-gray-500" />
              ) : (
                <Maximize2 className="w-5 h-5 text-gray-500" />
              )}
            </button>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {!file ? (
            <div className="space-y-6">
              {/* Upload Area */}
              <label className="border-2 border-dashed border-gray-300 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                <p className="font-semibold text-gray-900 mb-1">Click to upload CSV file</p>
                <p className="text-sm text-gray-500 mb-4">or drag and drop</p>
                <p className="text-xs text-gray-400">Recommended fields: name, role, company, contact type, from, about, email, linkedin profile url, city, state</p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>

              {/* Template Download */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Download className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 mb-1">Need a template?</p>
                  <p className="text-xs text-blue-700 mb-3">Download our CSV template with sample data</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadTemplate}
                    className="rounded-xl border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Template
                  </Button>
                </div>
              </div>

              {/* Format Info */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <h3 className="font-semibold text-sm mb-3">CSV Format Guidelines</h3>
                <ul className="text-sm text-gray-600 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>First row should contain column headers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Required fields: <strong>name</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Optional fields: role, company, contact type (prospect/client/network), email, linkedin profile link, city, state, phone, tags, notes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Multiple tags should be separated by semicolons (;)</span>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* File Info */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-green-900">{file.name}</p>
                  <p className="text-sm text-green-700">
                    {parsing ? "Parsing..." : `${preview.length} contacts found`}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFile(null);
                    setPreview([]);
                    setError("");
                  }}
                  className="text-green-700 hover:text-green-800"
                >
                  Change File
                </Button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900 mb-1">Error</p>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {/* Preview */}
              {preview.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Preview ({preview.length} contacts)
                  </h3>
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="max-h-96 overflow-y-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Email</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Company</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Role</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {preview.map((contact, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                {contact.name}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {contact.email || "-"}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {contact.company || "-"}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {contact.role || "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleClose}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={preview.length === 0 || parsing}
            className="rounded-xl bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import {preview.length > 0 && `${preview.length} Contacts`}
          </Button>
        </div>
      </div>
    </div>
  );
}