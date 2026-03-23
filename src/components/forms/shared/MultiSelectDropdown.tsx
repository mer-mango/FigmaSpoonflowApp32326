import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Archive, ChevronDown } from 'lucide-react';

interface MultiSelectOption {
  id: string;
  label: string;
  archived?: boolean;
}

interface MultiSelectDropdownProps {
  label: string;
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  storageKey: string; // For localStorage persistence of options
  defaultOptions: string[]; // Initial options if none exist
  placeholder?: string;
  color?: string; // Tag color
}

export function MultiSelectDropdown({
  label,
  selectedValues,
  onSelectionChange,
  storageKey,
  defaultOptions,
  placeholder = 'Select options...',
  color = '#2f829b'
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<MultiSelectOption[]>([]);
  const [newOptionText, setNewOptionText] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load options from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      setOptions(JSON.parse(stored));
    } else {
      // Initialize with default options
      const initialOptions = defaultOptions.map((label, index) => ({
        id: `${storageKey}-${index}`,
        label,
        archived: false
      }));
      setOptions(initialOptions);
      localStorage.setItem(storageKey, JSON.stringify(initialOptions));
    }
  }, [storageKey, defaultOptions]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowArchived(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Save options to localStorage whenever they change
  useEffect(() => {
    if (options.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(options));
    }
  }, [options, storageKey]);

  const handleToggleOption = (optionId: string) => {
    const option = options.find(o => o.id === optionId);
    if (!option) return;

    if (selectedValues.includes(option.label)) {
      // Remove from selection
      onSelectionChange(selectedValues.filter(v => v !== option.label));
    } else {
      // Add to selection
      onSelectionChange([...selectedValues, option.label]);
    }
  };

  const handleAddNewOption = () => {
    if (newOptionText.trim()) {
      const newOption: MultiSelectOption = {
        id: `${storageKey}-${Date.now()}`,
        label: newOptionText.trim(),
        archived: false
      };
      setOptions([...options, newOption]);
      setNewOptionText('');
      // Auto-select the new option
      onSelectionChange([...selectedValues, newOption.label]);
    }
  };

  const handleArchiveOption = (optionId: string) => {
    setOptions(options.map(opt => 
      opt.id === optionId ? { ...opt, archived: true } : opt
    ));
    // Remove from selection if it was selected
    const option = options.find(o => o.id === optionId);
    if (option && selectedValues.includes(option.label)) {
      onSelectionChange(selectedValues.filter(v => v !== option.label));
    }
  };

  const handleUnarchiveOption = (optionId: string) => {
    setOptions(options.map(opt => 
      opt.id === optionId ? { ...opt, archived: false } : opt
    ));
  };

  const handleRemoveSelected = (value: string) => {
    onSelectionChange(selectedValues.filter(v => v !== value));
  };

  const activeOptions = options.filter(o => !o.archived);
  const archivedOptions = options.filter(o => o.archived);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2">
        {label}
      </label>

      {/* Selected Tags Display */}
      <div 
        className="min-h-[44px] w-full px-3 py-2 border-2 border-[#ddecf0] rounded-lg bg-white cursor-pointer hover:border-[#2f829b] transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-2 items-center">
          {selectedValues.length === 0 ? (
            <span className="text-[#034863]/50 font-['Poppins'] text-sm">{placeholder}</span>
          ) : (
            selectedValues.map((value, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-['Poppins'] text-white"
                style={{ backgroundColor: color }}
              >
                {value}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveSelected(value);
                  }}
                  className="hover:bg-white/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          )}
          <ChevronDown className={`w-4 h-4 text-[#034863]/50 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white border-2 border-[#ddecf0] rounded-lg shadow-lg max-h-[300px] overflow-y-auto">
          {/* Active Options */}
          <div className="p-2">
            {activeOptions.map((option) => (
              <div
                key={option.id}
                className="flex items-center justify-between px-3 py-2 hover:bg-[#f5fafb] rounded cursor-pointer group"
                onClick={() => handleToggleOption(option.id)}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.label)}
                    onChange={() => {}}
                    className="w-4 h-4 text-[#2f829b] border-[#ddecf0] rounded focus:ring-[#2f829b]"
                  />
                  <span className="font-['Poppins'] text-sm text-[#034863]">{option.label}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleArchiveOption(option.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#ddecf0] rounded transition-opacity"
                  title="Archive option"
                >
                  <Archive className="w-3.5 h-3.5 text-[#034863]/60" />
                </button>
              </div>
            ))}
          </div>

          {/* Add New Option */}
          <div className="border-t-2 border-[#ddecf0] p-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={newOptionText}
                onChange={(e) => setNewOptionText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddNewOption();
                  }
                }}
                placeholder="Add new option..."
                className="flex-1 px-3 py-2 border border-[#ddecf0] rounded font-['Poppins'] text-sm focus:border-[#2f829b] focus:ring-0"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddNewOption();
                }}
                className="px-3 py-2 bg-[#2f829b] text-white rounded hover:bg-[#034863] transition-colors"
                title="Add option"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Archived Options */}
          {archivedOptions.length > 0 && (
            <div className="border-t-2 border-[#ddecf0]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowArchived(!showArchived);
                }}
                className="w-full px-3 py-2 text-left font-['Poppins'] text-xs text-[#034863]/60 hover:bg-[#f5fafb] flex items-center gap-2"
              >
                <Archive className="w-3.5 h-3.5" />
                {showArchived ? 'Hide' : 'Show'} Archived ({archivedOptions.length})
              </button>
              
              {showArchived && (
                <div className="p-2 bg-[#f5fafb]/50">
                  {archivedOptions.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center justify-between px-3 py-2 hover:bg-white rounded"
                    >
                      <span className="font-['Poppins'] text-sm text-[#034863]/60 line-through">
                        {option.label}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnarchiveOption(option.id);
                        }}
                        className="px-2 py-1 text-xs bg-[#2f829b] text-white rounded hover:bg-[#034863] transition-colors"
                      >
                        Restore
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
