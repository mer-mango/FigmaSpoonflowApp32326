import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card } from '../ui/card';
import { Eye, Plus, Trash2, Upload, Video, Image as ImageIcon, GripVertical, FileText, BarChart3, Link as LinkIcon, Package, Save, Clock } from 'lucide-react';
import { Service } from '../../../App';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ContactSelector } from '../shared/ContactSelector';
import { ServiceSelector } from '../shared/ServiceSelector';
import { MultiSelectDropdown } from '../shared/MultiSelectDropdown';

// Widget Types
type WidgetType = 'qualitative' | 'quantitative' | 'screenshot' | 'video-link' | 'text-block';

interface BaseWidget {
  id: string;
  type: WidgetType;
}

interface QualitativeWidget extends BaseWidget {
  type: 'qualitative';
  question: string;
  description: string;
}

interface QuantitativeWidget extends BaseWidget {
  type: 'quantitative';
  question: string;
  description: string;
  scaleType: '1-5' | '1-10';
  scaleLabels: {
    min: string;
    max: string;
  };
}

interface ScreenshotWidget extends BaseWidget {
  type: 'screenshot';
  imageUrl?: string;
  caption: string;
}

interface VideoLinkWidget extends BaseWidget {
  type: 'video-link';
  url: string;
  description: string;
}

interface TextBlockWidget extends BaseWidget {
  type: 'text-block';
  content: string;
}

type Widget = QualitativeWidget | QuantitativeWidget | ScreenshotWidget | VideoLinkWidget | TextBlockWidget;

interface InnovationAuditFormProps {
  onPreview: (data: any) => void;
  onBack: () => void;
  onSave?: () => void;
  onSaveAndFinishLater?: (data: any) => void;
  backButtonLabel?: string;
  initialData?: any;
  services?: Service[];
  contacts?: any[]; // Contact array from App
}

// Draggable Widget Template Card (Left Panel)
function WidgetTemplateCard({ type, icon, label, description }: { type: WidgetType; icon: React.ReactNode; label: string; description: string }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'WIDGET',
    item: { widgetType: type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`bg-white border-2 border-[#ddecf0] rounded-lg p-4 cursor-move hover:border-[#2f829b] hover:shadow-md transition-all ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="text-[#2f829b]">{icon}</div>
        <h4 className="font-['Poppins'] font-medium text-sm text-[#034863]">{label}</h4>
      </div>
      <p className="font-['Poppins'] text-xs text-[#034863]/70">{description}</p>
    </div>
  );
}

// Drop Zone Component
function DropZone({ onDrop, children, index }: { onDrop: (type: WidgetType, index: number) => void; children?: React.ReactNode; index: number }) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'WIDGET',
    drop: (item: { widgetType: WidgetType }) => {
      onDrop(item.widgetType, index);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`min-h-[80px] border-2 border-dashed rounded-lg transition-all ${
        isOver 
          ? 'border-[#6b2358] bg-[#6b2358]/10' 
          : 'border-[#ddecf0] bg-[#f5fafb]/50'
      }`}
    >
      {children || (
        <div className="flex items-center justify-center h-20">
          <p className="font-['Poppins'] text-sm text-[#034863]/50">
            {isOver ? 'Drop widget here' : 'Drag widgets here'}
          </p>
        </div>
      )}
    </div>
  );
}

// Widget Display Component
function WidgetDisplay({ widget, onUpdate, onDelete }: { widget: Widget; onUpdate: (updates: Partial<Widget>) => void; onDelete: () => void }) {
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate({ imageUrl: reader.result as string } as any);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white border-2 border-[#ddecf0] rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-[#034863]/40" />
          <span className={`px-3 py-1 rounded-full text-xs uppercase tracking-wide font-['Poppins'] ${
            widget.type === 'quantitative' ? 'bg-[#2f829b] text-white' :
            widget.type === 'qualitative' ? 'bg-[#6b2358] text-white' :
            widget.type === 'screenshot' ? 'bg-orange-500 text-white' :
            widget.type === 'video-link' ? 'bg-blue-500 text-white' :
            'bg-gray-500 text-white'
          }`}>
            {widget.type}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {widget.type === 'qualitative' && (
        <div className="space-y-3">
          <Input
            value={widget.question}
            onChange={(e) => onUpdate({ question: e.target.value })}
            placeholder="Enter qualitative question"
            className="font-['Poppins']"
          />
          <Textarea
            value={widget.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Question guidance or description"
            rows={2}
            className="font-['Poppins'] text-sm"
          />
        </div>
      )}

      {widget.type === 'quantitative' && (
        <div className="space-y-3">
          <Input
            value={widget.question}
            onChange={(e) => onUpdate({ question: e.target.value })}
            placeholder="Enter quantitative question"
            className="font-['Poppins']"
          />
          <Textarea
            value={widget.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Question guidance or description"
            rows={2}
            className="font-['Poppins'] text-sm"
          />
          <div className="bg-[#f5fafb] p-4 rounded-lg space-y-3">
            <div>
              <label className="font-['Poppins'] text-xs text-[#034863] mb-2 block">Scale Type</label>
              <select
                value={widget.scaleType}
                onChange={(e) => onUpdate({ scaleType: e.target.value as '1-5' | '1-10' })}
                className="w-full px-3 py-2 border border-[#ddecf0] rounded-lg font-['Poppins'] text-sm"
              >
                <option value="1-5">1-5 Scale</option>
                <option value="1-10">1-10 Scale</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-['Poppins'] text-xs text-[#034863] mb-1 block">Min Label</label>
                <Input
                  value={widget.scaleLabels.min}
                  onChange={(e) => onUpdate({ scaleLabels: { ...widget.scaleLabels, min: e.target.value } })}
                  placeholder="e.g., Not Present"
                  className="font-['Poppins'] text-sm"
                />
              </div>
              <div>
                <label className="font-['Poppins'] text-xs text-[#034863] mb-1 block">Max Label</label>
                <Input
                  value={widget.scaleLabels.max}
                  onChange={(e) => onUpdate({ scaleLabels: { ...widget.scaleLabels, max: e.target.value } })}
                  placeholder="e.g., Optimized"
                  className="font-['Poppins'] text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {widget.type === 'screenshot' && (
        <div className="space-y-3">
          <Input
            value={widget.caption}
            onChange={(e) => onUpdate({ caption: e.target.value })}
            placeholder="Screenshot caption or description"
            className="font-['Poppins']"
          />
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id={`image-${widget.id}`}
            />
            <label
              htmlFor={`image-${widget.id}`}
              className="px-4 py-2 bg-[#2f829b] text-white rounded-lg cursor-pointer hover:bg-[#034863] transition-colors font-['Poppins'] text-sm flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {widget.imageUrl ? 'Change Image' : 'Upload Image'}
            </label>
            {widget.imageUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onUpdate({ imageUrl: undefined })}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </Button>
            )}
          </div>
          {widget.imageUrl && (
            <div className="mt-3">
              <img src={widget.imageUrl} alt="Screenshot" className="max-w-full rounded-lg border border-[#ddecf0]" />
            </div>
          )}
        </div>
      )}

      {widget.type === 'video-link' && (
        <div className="space-y-3">
          <Input
            value={widget.url}
            onChange={(e) => onUpdate({ url: e.target.value })}
            placeholder="https://www.loom.com/share/abc123?t=30s"
            className="font-['Poppins']"
          />
          <Input
            value={widget.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Video description"
            className="font-['Poppins'] text-sm"
          />
        </div>
      )}

      {widget.type === 'text-block' && (
        <div>
          <Textarea
            value={widget.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            placeholder="Add notes, context, or additional information..."
            rows={4}
            className="font-['Poppins']"
          />
        </div>
      )}
    </div>
  );
}

function InnovationAuditFormInner({ onPreview, onBack, onSave, onSaveAndFinishLater, backButtonLabel, initialData, services = [], contacts = [] }: InnovationAuditFormProps) {
  // Contact and Service Linking
  const [selectedContactId, setSelectedContactId] = useState<string>(initialData?.contactId || '');
  const [showContactInDocument, setShowContactInDocument] = useState<boolean>(initialData?.showContactInDocument || false);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(initialData?.serviceId || '');

  // Audit Classification (Multi-Select Fields)
  const [auditFocus, setAuditFocus] = useState<string[]>(initialData?.auditFocus || []);
  const [innovationType, setInnovationType] = useState<string[]>(initialData?.innovationType || []);
  const [endUser, setEndUser] = useState<string[]>(initialData?.endUser || []);

  // Audit header (consistent for all clients)
  const [auditTitle, setAuditTitle] = useState(initialData?.auditTitle || 'Patient Experience Innovation Audit');
  const [date, setDate] = useState(initialData?.date || 'January 1, 2026');
  const [auditor, setAuditor] = useState(initialData?.auditor || '');
  const [organization, setOrganization] = useState(initialData?.organization || '');
  
  // Organization information
  const [organizationName, setOrganizationName] = useState(initialData?.organizationName || '');
  const [organizationType, setOrganizationType] = useState(initialData?.organizationType || '');
  const [contactName, setContactName] = useState(initialData?.contactName || '');
  const [contactEmail, setContactEmail] = useState(initialData?.contactEmail || '');
  const [auditPurpose, setAuditPurpose] = useState(initialData?.auditPurpose || 'This innovation audit assesses your organization\'s current capabilities, culture, and readiness for patient experience innovation. The results will identify strengths, opportunities, and actionable recommendations for improvement.');

  // Widgets in the audit
  const [widgets, setWidgets] = useState<Widget[]>(initialData?.widgets || []);

  const createWidget = (type: WidgetType): Widget => {
    const baseWidget = {
      id: `widget-${Date.now()}-${Math.random()}`,
      type,
    };

    switch (type) {
      case 'qualitative':
        return {
          ...baseWidget,
          type: 'qualitative',
          question: 'New qualitative question',
          description: '',
        } as QualitativeWidget;
      case 'quantitative':
        return {
          ...baseWidget,
          type: 'quantitative',
          question: 'New quantitative question',
          description: '',
          scaleType: '1-5',
          scaleLabels: { min: 'Not Present', max: 'Optimized' },
        } as QuantitativeWidget;
      case 'screenshot':
        return {
          ...baseWidget,
          type: 'screenshot',
          caption: '',
        } as ScreenshotWidget;
      case 'video-link':
        return {
          ...baseWidget,
          type: 'video-link',
          url: '',
          description: '',
        } as VideoLinkWidget;
      case 'text-block':
        return {
          ...baseWidget,
          type: 'text-block',
          content: '',
        } as TextBlockWidget;
      default:
        return baseWidget as Widget;
    }
  };

  const handleDrop = (type: WidgetType, index: number) => {
    const newWidget = createWidget(type);
    const newWidgets = [...widgets];
    newWidgets.splice(index, 0, newWidget);
    setWidgets(newWidgets);
  };

  const updateWidget = (id: string, updates: Partial<Widget>) => {
    setWidgets(widgets.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  const deleteWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
  };

  const handlePreview = () => {
    onPreview({
      // Contact and Service Linking
      contactId: selectedContactId,
      showContactInDocument,
      serviceId: selectedServiceId,
      // Audit Classification
      auditFocus,
      innovationType,
      endUser,
      // Audit Header
      auditTitle,
      date,
      auditor,
      organization,
      organizationName,
      organizationType,
      contactName,
      contactEmail,
      auditPurpose,
      widgets
    });
  };
  
  const handleSaveAndFinishLater = () => {
    if (onSaveAndFinishLater) {
      onSaveAndFinishLater({
        // Contact and Service Linking
        contactId: selectedContactId,
        showContactInDocument,
        serviceId: selectedServiceId,
        // Audit Classification
        auditFocus,
        innovationType,
        endUser,
        // Audit Header
        auditTitle,
        date,
        auditor,
        organization,
        organizationName,
        organizationType,
        contactName,
        contactEmail,
        auditPurpose,
        widgets
      });
    }
  };

  const loadServiceFromSettings = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      setSelectedServiceId(serviceId);
      setAuditTitle(service.name);
      setAuditPurpose(service.description || 'This innovation audit assesses your organization\'s current capabilities, culture, and readiness for patient experience innovation.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f5fafb]">
      <div className="flex">
        {/* Left Panel - Widget Library (Sticky) */}
        <div className="w-80 shrink-0">
          <div className="sticky top-0 h-screen overflow-y-auto bg-white border-r-2 border-[#ddecf0] p-6">
            <div className="mb-6">
              <h2 className="font-['Lora'] text-2xl text-[#034863] mb-2">Widget Library</h2>
              <p className="font-['Poppins'] text-sm text-[#034863]/70">Drag widgets to build your audit</p>
            </div>

            <div className="space-y-3">
              <WidgetTemplateCard
                type="qualitative"
                icon={<FileText className="w-5 h-5" />}
                label="Qualitative Question"
                description="Open-ended question with free-text response"
              />
              <WidgetTemplateCard
                type="quantitative"
                icon={<BarChart3 className="w-5 h-5" />}
                label="Quantitative Question"
                description="Scaled rating question (1-5 or 1-10)"
              />
              <WidgetTemplateCard
                type="screenshot"
                icon={<ImageIcon className="w-5 h-5" />}
                label="Screenshot"
                description="Upload and display an image with caption"
              />
              <WidgetTemplateCard
                type="video-link"
                icon={<Video className="w-5 h-5" />}
                label="Video Link"
                description="Add a Loom or video URL with description"
              />
              <WidgetTemplateCard
                type="text-block"
                icon={<LinkIcon className="w-5 h-5" />}
                label="Text Block"
                description="Add notes, context, or additional info"
              />
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          <div className="max-w-5xl mx-auto py-8 px-6">
            {/* Header Info Card */}
            <div className="bg-white rounded-xl p-8 shadow-sm border-2 border-[#ddecf0] mb-6">
              <img 
                src="figma:asset/35c7e77331367a5f6eb867f11816801708628944.png" 
                alt="Empower Health Strategies"
                className="h-12 mb-4"
              />
              
              <div className="flex items-center justify-between mb-6">
                <h1 className="font-['Lora'] text-4xl text-[#034863]">Innovation Audit Builder</h1>
                <div className="flex gap-3">
                  <Button
                    onClick={onBack}
                    variant="outline"
                    className="border-2 border-[#034863] text-[#034863] hover:bg-[#f5fafb] font-['Poppins'] rounded-lg"
                  >
                    {backButtonLabel || '← Back to Flow Wizard'}
                  </Button>
                  {onSaveAndFinishLater && (
                    <Button
                      onClick={handleSaveAndFinishLater}
                      variant="outline"
                      className="border-2 border-[#a8998f] text-[#a8998f] hover:bg-[#f5fafb] font-['Poppins'] rounded-lg"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Save & Finish Later
                    </Button>
                  )}
                  <Button
                    onClick={handlePreview}
                    className="bg-[#6b2358] hover:bg-[#6b2358]/90 text-white font-['Poppins'] rounded-lg"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview Audit
                  </Button>
                  {onSave && (
                    <Button
                      onClick={onSave}
                      className="bg-[#2f829b] hover:bg-[#2f829b]/90 text-white font-['Poppins'] rounded-lg"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Audit
                    </Button>
                  )}
                </div>
              </div>

              {/* Contact and Service Linking */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <ContactSelector
                  contacts={contacts}
                  selectedContactId={selectedContactId}
                  onSelectContact={setSelectedContactId}
                  showInDocument={showContactInDocument}
                  onToggleShowInDocument={setShowContactInDocument}
                />
                <ServiceSelector
                  services={services}
                  selectedServiceId={selectedServiceId}
                  onSelectService={setSelectedServiceId}
                  onLoadServiceData={() => loadServiceFromSettings(selectedServiceId)}
                />
              </div>

              {/* Audit Classification */}
              <div className="bg-white border-2 border-[#ddecf0] rounded-lg p-6 mb-6">
                <h3 className="font-['Poppins'] font-medium text-[#034863] mb-4">Audit Classification</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <MultiSelectDropdown
                    label="Audit Focus"
                    selectedValues={auditFocus}
                    onSelectionChange={setAuditFocus}
                    storageKey="audit-focus-options"
                    defaultOptions={['Usability', 'Holistic PX', 'Fit & Alignment']}
                    placeholder="Select focus areas..."
                    color="#2f829b"
                  />
                  <MultiSelectDropdown
                    label="Innovation Type"
                    selectedValues={innovationType}
                    onSelectionChange={setInnovationType}
                    storageKey="innovation-type-options"
                    defaultOptions={['Mobile App', 'Portal', 'Website']}
                    placeholder="Select innovation types..."
                    color="#6b2358"
                  />
                  <MultiSelectDropdown
                    label="End User"
                    selectedValues={endUser}
                    onSelectionChange={setEndUser}
                    storageKey="end-user-options"
                    defaultOptions={['DTC (patient)', 'B2B (patient)', 'Patient & HCP-facing']}
                    placeholder="Select end users..."
                    color="#034863"
                  />
                </div>
              </div>

              {/* Audit Header Info */}
              <div className="bg-white p-6 rounded-xl border-2 border-[#ddecf0] space-y-4">
                <div>
                  <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                    Audit Title
                  </label>
                  <Input
                    value={auditTitle}
                    onChange={(e) => setAuditTitle(e.target.value)}
                    className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                  />
                </div>
                <div>
                  <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                    Organization
                  </label>
                  <Input
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                      Date
                    </label>
                    <Input
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                    />
                  </div>
                  <div>
                    <label className="block font-['Poppins'] text-sm font-medium text-[#034863] mb-2 text-[20px]">
                      Auditor
                    </label>
                    <Input
                      value={auditor}
                      onChange={(e) => setAuditor(e.target.value)}
                      className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                    />
                  </div>
                </div>
              </div>

              {/* Organization Information */}
              <div className="border-t border-[#ddecf0] pt-6 space-y-4">
                <h3 className="font-['Lora'] text-2xl text-[#034863] mb-4">Organization Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-['Poppins'] text-sm text-[#034863] mb-2 block text-[20px]">Organization Name</label>
                    <Input
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                    />
                  </div>
                  <div>
                    <label className="font-['Poppins'] text-sm text-[#034863] mb-2 block text-[20px]">Organization Type</label>
                    <Input
                      value={organizationType}
                      onChange={(e) => setOrganizationType(e.target.value)}
                      placeholder="e.g., Hospital, Health System"
                      className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                    />
                  </div>
                  <div>
                    <label className="font-['Poppins'] text-sm text-[#034863] mb-2 block text-[20px]">Contact Name</label>
                    <Input
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                    />
                  </div>
                  <div>
                    <label className="font-['Poppins'] text-sm text-[#034863] mb-2 block text-[20px]">Contact Email</label>
                    <Input
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      type="email"
                      className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                    />
                  </div>
                </div>
              </div>

              {/* Audit Purpose */}
              <div className="border-t border-[#ddecf0] pt-6 mt-6">
                <label className="font-['Poppins'] text-sm text-[#034863] mb-2 block text-[20px]">Audit Purpose</label>
                <Textarea
                  value={auditPurpose}
                  onChange={(e) => setAuditPurpose(e.target.value)}
                  rows={3}
                  className="font-['Poppins'] text-[18px] text-[rgb(0,0,0)]"
                />
              </div>
            </div>

            {/* Audit Content Area - Drag & Drop */}
            <div className="bg-white rounded-xl p-8 shadow-sm border-2 border-[#ddecf0] mb-6">
              <h2 className="font-['Lora'] text-2xl text-[#034863] mb-6">Audit Content</h2>
              
              <div className="space-y-4">
                {/* Initial drop zone */}
                {widgets.length === 0 && (
                  <DropZone onDrop={handleDrop} index={0} />
                )}

                {/* Existing widgets with drop zones between them */}
                {widgets.map((widget, index) => (
                  <div key={widget.id} className="space-y-4">
                    {index > 0 && <DropZone onDrop={handleDrop} index={index} />}
                    <WidgetDisplay
                      widget={widget}
                      onUpdate={(updates) => updateWidget(widget.id, updates)}
                      onDelete={() => deleteWidget(widget.id)}
                    />
                  </div>
                ))}

                {/* Final drop zone */}
                {widgets.length > 0 && (
                  <DropZone onDrop={handleDrop} index={widgets.length} />
                )}
              </div>
            </div>

            {/* Bottom Navigation Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                onClick={onBack}
                variant="outline"
                className="border-2 border-[#034863] text-[#034863] hover:bg-[#f5fafb] font-['Poppins'] rounded-lg"
              >
                {backButtonLabel || '← Back to Flow Wizard'}
              </Button>
              {onSaveAndFinishLater && (
                <Button
                  onClick={handleSaveAndFinishLater}
                  variant="outline"
                  className="border-2 border-[#a8998f] text-[#a8998f] hover:bg-[#f5fafb] font-['Poppins'] rounded-lg"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Save & Finish Later
                </Button>
              )}
              <Button
                onClick={handlePreview}
                className="bg-[#6b2358] hover:bg-[#6b2358]/90 text-white font-['Poppins'] rounded-lg"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview Audit
              </Button>
              {onSave && (
                <Button
                  onClick={onSave}
                  className="bg-[#2f829b] hover:bg-[#2f829b]/90 text-white font-['Poppins'] rounded-lg"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Audit
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function InnovationAuditForm(props: InnovationAuditFormProps) {
  return (
    <DndProvider backend={HTML5Backend}>
      <InnovationAuditFormInner {...props} />
    </DndProvider>
  );
}