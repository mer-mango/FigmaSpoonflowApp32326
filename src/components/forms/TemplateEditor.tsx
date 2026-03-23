import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, RotateCcw, Trash2, Plus } from 'lucide-react';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { FormTemplate, FormSection, FormField, getTemplate, saveTemplate, resetTemplate } from './utils/templateStorage';

interface TemplateEditorProps {
  templateId: string;
  onBack: () => void;
}

export function TemplateEditor({ templateId, onBack }: TemplateEditorProps) {
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const loadedTemplate = getTemplate(templateId);
    if (loadedTemplate) {
      setTemplate(loadedTemplate);
    }
  }, [templateId]);

  if (!template) {
    return <div>Loading template...</div>;
  }

  const handleSave = () => {
    const templateToSave = {
      ...template,
      lastModified: new Date().toISOString()
    };
    console.log('💾 Saving template with updated timestamp:', {
      name: templateToSave.name,
      description: templateToSave.description,
      lastModified: templateToSave.lastModified
    });
    saveTemplate(templateToSave);
    setTemplate(templateToSave);
    setHasChanges(false);
    alert('Template saved successfully! ✓');
  };

  const handleReset = () => {
    if (confirm('Reset this template to default settings? All customizations will be lost.')) {
      resetTemplate(templateId);
      const resetTemplateData = getTemplate(templateId);
      if (resetTemplateData) {
        setTemplate(resetTemplateData);
        setHasChanges(false);
      }
    }
  };

  const updateTemplate = (updates: Partial<FormTemplate>) => {
    console.log('📝 Updating template with:', updates);
    const newTemplate = { ...template, ...updates };
    console.log('📝 New template state:', {
      name: newTemplate.name,
      description: newTemplate.description,
      sectionsCount: newTemplate.sections?.length || 0
    });
    setTemplate(newTemplate);
    setHasChanges(true);
  };

  const updateSection = (sectionId: string, updates: Partial<FormSection>) => {
    const updatedSections = template.sections.map(section =>
      section.id === sectionId ? { ...section, ...updates } : section
    );
    updateTemplate({ sections: updatedSections });
  };

  const deleteSection = (sectionId: string) => {
    if (confirm('Delete this section?')) {
      const updatedSections = template.sections
        .filter(s => s.id !== sectionId)
        .map((s, idx) => ({ ...s, order: idx + 1 }));
      updateTemplate({ sections: updatedSections });
    }
  };

  const updateField = (sectionId: string, fieldId: string, updates: Partial<FormField>) => {
    const section = template.sections.find(s => s.id === sectionId);
    if (!section) return;

    const updatedFields = section.fields.map(field =>
      field.id === fieldId ? { ...field, ...updates } : field
    );

    updateSection(sectionId, { fields: updatedFields });
  };

  const deleteField = (sectionId: string, fieldId: string) => {
    if (confirm('Delete this field?')) {
      const section = template.sections.find(s => s.id === sectionId);
      if (!section) return;

      const updatedFields = section.fields
        .filter(f => f.id !== fieldId)
        .map((f, idx) => ({ ...f, order: idx + 1 }));

      updateSection(sectionId, { fields: updatedFields });
    }
  };

  const addSection = (insertAfterOrder?: number) => {
    const newSection: FormSection = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      description: '',
      order: 0, // Will be recalculated below
      visible: true,
      fields: []
    };
    
    let updatedSections;
    if (insertAfterOrder !== undefined) {
      // Insert after the specified order
      updatedSections = [...template.sections, newSection]
        .sort((a, b) => a.order - b.order)
        .map((section, idx) => {
          if (section.id === newSection.id) {
            return { ...section, order: insertAfterOrder + 1 };
          } else if (section.order > insertAfterOrder) {
            return { ...section, order: section.order + 1 };
          }
          return section;
        })
        .sort((a, b) => a.order - b.order)
        .map((s, idx) => ({ ...s, order: idx + 1 }));
    } else {
      // Add to end
      newSection.order = template.sections.length + 1;
      updatedSections = [...template.sections, newSection];
    }
    
    updateTemplate({ sections: updatedSections });
  };

  const addField = (sectionId: string) => {
    const section = template.sections.find(s => s.id === sectionId);
    if (!section) return;

    const newField: FormField = {
      id: `field-${Date.now()}`,
      label: 'New Field',
      type: 'text',
      visible: true,
      required: false,
      order: section.fields.length + 1,
      defaultValue: ''
    };

    const updatedFields = [...section.fields, newField];
    updateSection(sectionId, { fields: updatedFields });
  };

  const SaveButton = () => (
    <button
      onClick={handleSave}
      disabled={!hasChanges}
      className={`${
        hasChanges ? 'bg-[#6b2358] hover:bg-[#6b2358]/90' : 'bg-gray-400'
      } text-white font-['Poppins'] rounded-lg px-8 py-6 text-lg flex items-center gap-2 transition-colors`}
    >
      <Save className="w-5 h-5" />
      {hasChanges ? 'Save Changes' : 'No Changes'}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5fafb] to-[#ddecf0] p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 mt-6">
          <div>
            <h1 className="font-['Lora'] text-4xl text-[#034863] mb-1">Edit Template</h1>
            <p className="font-['Poppins'] text-lg text-[#2f829b] text-[24px]">
              {template.name}
            </p>
            <p className="font-['Poppins'] text-sm text-[#034863]/60 mt-1">
              Last updated: {new Date(template.lastModified).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="border-2 border-[#034863] text-[#034863] hover:bg-[#f5fafb] font-['Poppins'] rounded-lg px-4 py-2 flex items-center gap-2 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              Reset
            </button>
            <button
              onClick={onBack}
              className="border-2 border-[#034863] text-[#034863] hover:bg-[#f5fafb] font-['Poppins'] rounded-lg px-4 py-2 flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          </div>
        </div>

        {/* Top Save Button */}
        <div className="mb-6">
          <SaveButton />
        </div>

        {/* Template Info */}
        <div className="bg-white p-6 rounded-lg border-2 border-[#ddecf0] mb-6">
          <h2 className="font-['Lora'] text-2xl text-[#034863] mb-4 text-[30px]">Template Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block font-['Poppins'] text-[#034863] mb-2 text-[20px]">
                Template Name
              </label>
              <Input
                value={template.name}
                onChange={(e) => updateTemplate({ name: e.target.value })}
                className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
              />
            </div>
            <div>
              <label className="block font-['Poppins'] text-[#034863] mb-2 text-[20px]">
                Description
              </label>
              <Input
                value={template.description}
                onChange={(e) => updateTemplate({ description: e.target.value })}
                className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
              />
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-0">
          {/* Add section at the beginning */}
          <div className="group relative h-3 -mb-3">
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => addSection(0)}
                className="bg-[#2f829b] hover:bg-[#034863] text-white font-['Poppins'] rounded-lg px-4 py-2 text-sm shadow-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Section Here
              </button>
            </div>
          </div>

          {template.sections
            .sort((a, b) => a.order - b.order)
            .map((section, index) => (
              <div key={section.id}>
                <div className="bg-white p-6 rounded-lg border-2 border-[#ddecf0] my-6">
                  {/* Section Header */}
                  <div className="flex items-start justify-between mb-4 pb-4 border-b border-[#ddecf0]">
                    <div className="flex-1">
                      <Input
                        value={section.title}
                        onChange={(e) => updateSection(section.id, { title: e.target.value })}
                        className="font-['Lora'] text-[#034863] mb-2 border-0 px-0 focus:ring-0"
                        style={{ fontSize: '30px' }}
                        placeholder="Section Title"
                      />
                      {section.description !== undefined && (
                        <Input
                          value={section.description}
                          onChange={(e) => updateSection(section.id, { description: e.target.value })}
                          className="font-['Poppins'] text-[16px] text-[#2f829b] border-0 px-0 focus:ring-0"
                          placeholder="Section description (optional)"
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={section.visible}
                          onChange={(e) => updateSection(section.id, { visible: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 text-[#2f829b] focus:ring-[#2f829b]"
                        />
                        <span className="font-['Poppins'] text-sm text-[#034863]">Visible</span>
                      </label>
                      <button
                        onClick={() => deleteSection(section.id)}
                        className="text-red-500 hover:bg-red-50 border border-red-300 rounded-lg p-2 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Fields */}
                  <div className="space-y-4">
                    {section.fields
                      .sort((a, b) => a.order - b.order)
                      .map((field) => (
                        <div key={field.id} className="p-4 bg-[#f5fafb] rounded-lg">
                          <div className="flex items-start gap-4">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-3 text-[18px]">
                                <Input
                                  value={field.label}
                                  onChange={(e) => updateField(section.id, field.id, { label: e.target.value })}
                                  className="flex-1 font-['Poppins'] text-[18px] bg-[#2f829b] text-white placeholder:text-white/70"
                                  placeholder="Field Label"
                                />
                                <select
                                  value={field.type}
                                  onChange={(e) => updateField(section.id, field.id, { type: e.target.value as FormField['type'] })}
                                  className="w-32 h-10 px-3 border-2 border-[#ddecf0] rounded-lg font-['Poppins'] text-[14px] text-[rgb(0,0,0)] bg-white"
                                >
                                  <option value="text">Text</option>
                                  <option value="textarea">Textarea</option>
                                  <option value="number">Number</option>
                                  <option value="date">Date</option>
                                  <option value="email">Email</option>
                                  <option value="select">Select</option>
                                </select>
                              </div>

                              {field.defaultValue !== undefined && (
                                <div>
                                  <label className="block font-['Poppins'] text-xs text-[#034863] mb-1 text-[16px]">
                                    Default Value
                                  </label>
                                  {field.type === 'textarea' ? (
                                    <Textarea
                                      value={field.defaultValue as string}
                                      onChange={(e) => updateField(section.id, field.id, { defaultValue: e.target.value })}
                                      className="font-['Poppins'] text-[16px] text-[rgb(0,0,0)]"
                                      rows={3}
                                    />
                                  ) : (
                                    <Input
                                      value={field.defaultValue as string}
                                      onChange={(e) => updateField(section.id, field.id, { defaultValue: e.target.value })}
                                      className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                                    />
                                  )}
                                </div>
                              )}

                              <div className="flex gap-4">
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={field.visible}
                                    onChange={(e) => updateField(section.id, field.id, { visible: e.target.checked })}
                                    className="w-4 h-4 rounded border-gray-300 text-[#2f829b] focus:ring-[#2f829b]"
                                  />
                                  <span className="font-['Poppins'] text-sm text-[#034863]">Visible</span>
                                </label>
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={field.required || false}
                                    onChange={(e) => updateField(section.id, field.id, { required: e.target.checked })}
                                    className="w-4 h-4 rounded border-gray-300 text-[#2f829b] focus:ring-[#2f829b]"
                                  />
                                  <span className="font-['Poppins'] text-sm text-[#034863]">Required</span>
                                </label>
                              </div>
                            </div>

                            <button
                              onClick={() => deleteField(section.id, field.id)}
                              className="text-red-500 hover:bg-red-50 border border-transparent rounded-lg p-2 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Add Field Button */}
                  <div className="mt-4">
                    <button
                      onClick={() => addField(section.id)}
                      className="border-2 border-[#034863] text-[#034863] hover:bg-[#f5fafb] font-['Poppins'] rounded-lg px-4 py-2 flex items-center gap-2 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      Add Field
                    </button>
                  </div>
                </div>

                {/* Hover zone to add section after this one */}
                <div className="group relative h-6 -my-3">
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                      onClick={() => addSection(section.order)}
                      className="bg-[#2f829b] hover:bg-[#034863] text-white font-['Poppins'] rounded-lg px-4 py-2 text-sm shadow-lg flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Section Here
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Add Section Button */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => addSection()}
            className="bg-[#2f829b] hover:bg-[#2f829b]/90 text-white font-['Poppins'] rounded-lg px-8 py-6 text-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Section
          </button>
        </div>

        {/* Bottom Save Button */}
        <div className="mt-8 flex justify-center">
          <SaveButton />
        </div>
      </div>
    </div>
  );
}