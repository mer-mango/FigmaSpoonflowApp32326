import React, { useState, useEffect } from 'react';
import { X, Plus, GripVertical, Trash2, Settings } from 'lucide-react';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

// Field types available
const FIELD_TYPES = [
  { value: 'text', label: 'Text Input' },
  { value: 'email', label: 'Email' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'select', label: 'Dropdown Select' },
  { value: 'checkbox', label: 'Checkbox' },
];

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'textarea' | 'select' | 'checkbox';
  name: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select fields
  rows?: number; // For textarea
}

export interface FormSection {
  id: string;
  title: string;
  fields: FormField[];
}

export interface FormTemplate {
  id: string;
  title: string;
  description: string;
  sections: FormSection[];
}

interface FormTemplateEditorProps {
  formId: string;
  onClose: () => void;
  onSave: (template: FormTemplate) => void;
  initialTemplate?: FormTemplate;
}

export function FormTemplateEditor({ formId, onClose, onSave, initialTemplate }: FormTemplateEditorProps) {
  const [template, setTemplate] = useState<FormTemplate>(
    initialTemplate || {
      id: formId,
      title: '',
      description: '',
      sections: []
    }
  );
  
  const [editingField, setEditingField] = useState<{ sectionId: string; fieldId: string } | null>(null);

  // Add new section
  const addSection = () => {
    const newSection: FormSection = {
      id: `section_${Date.now()}`,
      title: 'New Section',
      fields: []
    };
    setTemplate({
      ...template,
      sections: [...template.sections, newSection]
    });
  };

  // Update section title
  const updateSectionTitle = (sectionId: string, title: string) => {
    setTemplate({
      ...template,
      sections: template.sections.map(section =>
        section.id === sectionId ? { ...section, title } : section
      )
    });
  };

  // Delete section
  const deleteSection = (sectionId: string) => {
    setTemplate({
      ...template,
      sections: template.sections.filter(section => section.id !== sectionId)
    });
  };

  // Add field to section
  const addField = (sectionId: string) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type: 'text',
      name: `field_${Date.now()}`,
      label: 'New Field',
      placeholder: '',
      required: false
    };
    
    setTemplate({
      ...template,
      sections: template.sections.map(section =>
        section.id === sectionId
          ? { ...section, fields: [...section.fields, newField] }
          : section
      )
    });
  };

  // Update field
  const updateField = (sectionId: string, fieldId: string, updates: Partial<FormField>) => {
    setTemplate({
      ...template,
      sections: template.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              fields: section.fields.map(field =>
                field.id === fieldId ? { ...field, ...updates } : field
              )
            }
          : section
      )
    });
  };

  // Delete field
  const deleteField = (sectionId: string, fieldId: string) => {
    setTemplate({
      ...template,
      sections: template.sections.map(section =>
        section.id === sectionId
          ? { ...section, fields: section.fields.filter(field => field.id !== fieldId) }
          : section
      )
    });
  };

  // Handle save
  const handleSave = () => {
    onSave(template);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#ddecf0]">
          <div>
            <h2 className="font-['Lora'] text-2xl text-[#034863]">Edit Form Template</h2>
            <p className="text-sm text-gray-600 mt-1">Customize fields, placeholders, and structure</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Template Info */}
          <div className="space-y-4 mb-8">
            <div>
              <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2">
                Form Title
              </label>
              <Input
                value={template.title}
                onChange={(e) => setTemplate({ ...template, title: e.target.value })}
                placeholder="Enter form title..."
                className="font-['Poppins']"
              />
            </div>
            
            <div>
              <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2">
                Form Description
              </label>
              <Textarea
                value={template.description}
                onChange={(e) => setTemplate({ ...template, description: e.target.value })}
                placeholder="Enter form description..."
                className="font-['Poppins']"
                rows={3}
              />
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-6">
            {template.sections.map((section, sectionIndex) => (
              <div key={section.id} className="bg-[#f5fafb] rounded-xl border-2 border-[#ddecf0] p-6">
                {/* Section Header */}
                <div className="flex items-center gap-3 mb-4">
                  <Input
                    value={section.title}
                    onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                    className="flex-1 font-['Poppins'] font-semibold"
                    placeholder="Section title..."
                  />
                  <button
                    onClick={() => deleteSection(section.id)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                    title="Delete section"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Fields */}
                <div className="space-y-4">
                  {section.fields.map((field, fieldIndex) => (
                    <div key={field.id} className="bg-white rounded-lg border border-[#ddecf0] p-4">
                      <div className="grid grid-cols-2 gap-4">
                        {/* Field Type */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Field Type
                          </label>
                          <Select
                            value={field.type}
                            onValueChange={(value: any) => updateField(section.id, field.id, { type: value })}
                          >
                            <SelectTrigger className="font-['Poppins']">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {FIELD_TYPES.map(type => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Field Name */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Field Name (ID)
                          </label>
                          <Input
                            value={field.name}
                            onChange={(e) => updateField(section.id, field.id, { name: e.target.value })}
                            placeholder="field_name"
                            className="font-['Poppins'] text-sm"
                          />
                        </div>

                        {/* Label */}
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Label (Question Text)
                          </label>
                          <Input
                            value={field.label}
                            onChange={(e) => updateField(section.id, field.id, { label: e.target.value })}
                            placeholder="Enter question or label..."
                            className="font-['Poppins']"
                          />
                        </div>

                        {/* Placeholder */}
                        {(field.type === 'text' || field.type === 'email' || field.type === 'textarea' || field.type === 'select') && (
                          <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Placeholder Text
                            </label>
                            <Input
                              value={field.placeholder || ''}
                              onChange={(e) => updateField(section.id, field.id, { placeholder: e.target.value })}
                              placeholder="Enter placeholder text..."
                              className="font-['Poppins']"
                            />
                          </div>
                        )}

                        {/* Options for Select */}
                        {field.type === 'select' && (
                          <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Dropdown Options (comma-separated)
                            </label>
                            <Input
                              value={field.options?.join(', ') || ''}
                              onChange={(e) => updateField(section.id, field.id, { 
                                options: e.target.value.split(',').map(opt => opt.trim()).filter(Boolean)
                              })}
                              placeholder="Option 1, Option 2, Option 3"
                              className="font-['Poppins']"
                            />
                          </div>
                        )}

                        {/* Rows for Textarea */}
                        {field.type === 'textarea' && (
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Number of Rows
                            </label>
                            <Input
                              type="number"
                              value={field.rows || 4}
                              onChange={(e) => updateField(section.id, field.id, { rows: parseInt(e.target.value) || 4 })}
                              className="font-['Poppins']"
                            />
                          </div>
                        )}

                        {/* Required */}
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => updateField(section.id, field.id, { required: e.target.checked })}
                            className="rounded"
                          />
                          <label className="text-sm text-gray-700">Required field</label>
                        </div>

                        {/* Delete Field Button */}
                        <div className="col-span-2 flex justify-end">
                          <button
                            onClick={() => deleteField(section.id, field.id)}
                            className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-['Poppins']"
                          >
                            Delete Field
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add Field Button */}
                  <button
                    onClick={() => addField(section.id)}
                    className="w-full py-3 border-2 border-dashed border-[#2f829b] rounded-lg text-[#2f829b] hover:bg-[#2f829b]/5 transition-colors font-['Poppins'] text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Field to Section
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Section Button */}
          <button
            onClick={addSection}
            className="w-full mt-6 py-4 border-2 border-dashed border-[#034863] rounded-xl text-[#034863] hover:bg-[#034863]/5 transition-colors font-['Poppins'] font-medium flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add New Section
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#ddecf0] bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg font-['Poppins'] text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-[#2f829b] text-white rounded-lg font-['Poppins'] hover:bg-[#034863] transition-colors"
          >
            Save Template
          </button>
        </div>
      </div>
    </div>
  );
}
