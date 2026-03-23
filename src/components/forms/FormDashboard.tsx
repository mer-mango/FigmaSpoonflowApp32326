import React, { useState, useEffect, useRef } from 'react';
import { FileText, Receipt, ClipboardList, Briefcase, Scale, CreditCard, GraduationCap, Lightbulb, Edit3, HelpCircle, Users, Copy, Calendar, MoreVertical, Handshake, X, Plus, Send, Save, GripVertical, Settings, Mail, Type, Layers } from 'lucide-react';
import { PageHeader_Muted } from '../PageHeader_Muted';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FlowWizard } from './FlowWizard';
import { FormTemplateManager } from './FormTemplateManager';
import { EmailTemplateEditor } from './EmailTemplateEditor';

interface FormType {
  id: string;
  templateId: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'active' | 'coming-soon';
}

interface FlowFormInstance {
  instanceId: string;
  formId: string;
  formTitle: string;
  formIcon: React.ReactNode;
}

interface Flow {
  id: string;
  name: string;
  forms: FlowFormInstance[];
  maxSlots?: number;
  emailTemplate?: string;
}

interface FormDashboardProps {
  onSelectForm: (formId: string) => void;
  onEditTemplate: (templateId: string) => void;
  onDuplicateForm: (formId: string) => void;
  onArchiveForm?: (formId: string) => void;
  onQuickAddSelect?: (type: 'task' | 'contact' | 'content' | 'voice') => void;
  onJamieAction?: (type: 'plan-day' | 'post-meeting' | 'wind-down' | 'chat') => void;
  wizardToReopen?: { flowName: string; flowForms: any[]; currentStep?: any; editedForms?: Set<string>; contactData?: any; customFlowName?: string } | null;
  onWizardReopened?: () => void;
  onWizardEditForm?: (flowName: string, flowForms: any[], formId: string, currentStep?: any, editedForms?: Set<string>, contactData?: any, customFlowName?: string) => void;
  onBack?: () => void;
}

const ITEM_TYPE = 'FORM_CARD';
const FORM_TEMPLATE_TYPE = 'FORM_TEMPLATE';
const FLOW_FORM_TYPE = 'FLOW_FORM';
const FLOW_ROW_TYPE = 'FLOW_ROW';
const STORAGE_KEY = 'empower_health_card_order';
const FLOWS_STORAGE_KEY = 'empower_health_flows';

interface DraggableCardProps {
  form: FormType;
  index: number;
  moveCard: (dragIndex: number, hoverIndex: number) => void;
  onSelectForm: (formId: string) => void;
  onEditTemplate: (templateId: string) => void;
  onDuplicateForm: (formId: string) => void;
  onArchiveForm?: (formId: string) => void;
  onRenameForm?: (formId: string) => void;
}

function DraggableCard({ form, index, moveCard, onSelectForm, onEditTemplate, onDuplicateForm, onArchiveForm, onRenameForm }: DraggableCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, preview] = useDrag({
    type: ITEM_TYPE,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ITEM_TYPE,
    hover: (item: { index: number }, monitor) => {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveCard(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  // Apply drag only to the drag handle
  drag(dragHandleRef);
  drop(ref);

  return (
    <div
      ref={ref}
      className={`relative p-3 rounded-lg border transition-all group ${
        form.status === 'active'
          ? 'bg-white border-[#a89db0] hover:shadow-lg'
          : 'bg-white/50 border-[#a89db0]/30 opacity-60'
      } ${isDragging ? 'opacity-50' : ''}`}
    >
      {form.status === 'coming-soon' && (
        <span className="absolute top-2 right-2 px-2 py-1 bg-[#ddecf0] text-[#034863] text-xs uppercase tracking-wide rounded-full font-['Poppins']">
          Coming Soon
        </span>
      )}

      <div className="flex items-center gap-3">
        {/* Drag Handle - only this part is draggable */}
        <div 
          ref={dragHandleRef}
          className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-[#a89db0] transition-colors flex-shrink-0"
        >
          <GripVertical className="w-4 h-4" />
        </div>
        
        {/* Clickable content area */}
        <div 
          onClick={() => form.status === 'active' && onSelectForm(form.id)}
          className={`flex items-center gap-3 flex-1 ${form.status === 'active' ? 'cursor-pointer' : ''}`}
        >
          <div className={`p-2 rounded-lg flex-shrink-0 flex items-center justify-center ${
            form.status === 'active' ? 'bg-[#a89db0]/10 text-[#a89db0]' : 'bg-gray-200 text-gray-400'
          }`}>
            {React.cloneElement(form.icon as React.ReactElement, { className: 'w-5 h-5' })}
          </div>
          <h3 className="font-['Lora'] text-base text-[#034863] flex-1 leading-tight">{form.title}</h3>
        </div>
        
        {form.status === 'active' && (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <button
                  className="text-[#034863] hover:bg-[#ddecf0] rounded p-1 h-auto flex-shrink-0 transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicateForm?.(form.id);
                  }}
                  className="cursor-pointer font-['Poppins']"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditTemplate?.(form.templateId);
                  }}
                  className="cursor-pointer font-['Poppins']"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                {onArchiveForm && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onArchiveForm(form.id);
                    }}
                    className="cursor-pointer font-['Poppins']"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Archive
                  </DropdownMenuItem>
                )}
                {onRenameForm && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onRenameForm(form.id);
                    }}
                    className="cursor-pointer font-['Poppins']"
                  >
                    <Type className="w-4 h-4 mr-2" />
                    Rename
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    </div>
  );
}

// Template card that can be dragged into flows
interface TemplateCardProps {
  form: FormType;
  onSelectForm?: (formId: string) => void;
  onEditTemplate?: (templateId: string) => void;
  onDuplicateForm?: (formId: string) => void;
  onArchiveForm?: (formId: string) => void;
  onRenameForm?: (formId: string) => void;
  scrollContainerRef?: React.RefObject<HTMLDivElement>;
}

function TemplateCard({ form, onSelectForm, onEditTemplate, onDuplicateForm, onArchiveForm, onRenameForm, scrollContainerRef }: TemplateCardProps) {
  const dragHandleRef = useRef<HTMLDivElement>(null);
  
  const [{ isDragging }, drag] = useDrag({
    type: FORM_TEMPLATE_TYPE,
    item: { 
      formId: form.id,
      formTitle: form.title,
      formIcon: form.icon
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: form.status === 'active',
  });

  // Auto-scroll when dragging near edges
  useEffect(() => {
    if (!isDragging || !scrollContainerRef?.current) return;

    const SCROLL_ZONE = 100; // pixels from edge to trigger scroll
    const SCROLL_SPEED = 10; // pixels per frame

    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (!scrollContainerRef.current) return;

      const container = scrollContainerRef.current;
      const containerRect = container.getBoundingClientRect();
      const mouseY = e.clientY;

      // Calculate distance from top and bottom edges
      const distanceFromTop = mouseY - containerRect.top;
      const distanceFromBottom = containerRect.bottom - mouseY;

      const scroll = () => {
        if (!scrollContainerRef.current) return;

        if (distanceFromTop < SCROLL_ZONE && distanceFromTop > 0) {
          // Near top - scroll up
          scrollContainerRef.current.scrollTop -= SCROLL_SPEED;
          animationFrameId = requestAnimationFrame(scroll);
        } else if (distanceFromBottom < SCROLL_ZONE && distanceFromBottom > 0) {
          // Near bottom - scroll down
          scrollContainerRef.current.scrollTop += SCROLL_SPEED;
          animationFrameId = requestAnimationFrame(scroll);
        }
      };

      cancelAnimationFrame(animationFrameId);
      scroll();
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDragging, scrollContainerRef]);

  // Only make the grip icon draggable, not the whole card
  drag(dragHandleRef);

  return (
    <div
      className={`relative p-3 rounded-lg border transition-all ${
        form.status === 'active'
          ? 'bg-white border-[#a89db0] hover:shadow-lg'
          : 'bg-white/50 border-[#a89db0]/30 opacity-60'
      } ${isDragging ? 'opacity-50' : ''}`}
    >
      {form.status === 'coming-soon' && (
        <span className="absolute top-2 right-2 px-2 py-1 bg-[#ddecf0] text-[#034863] text-xs uppercase tracking-wide rounded-full font-['Poppins']">
          Coming Soon
        </span>
      )}

      <div className="flex items-center gap-3">
        {/* Drag Handle */}
        <div 
          ref={dragHandleRef}
          className={`flex-shrink-0 transition-colors ${
            form.status === 'active' 
              ? 'cursor-grab active:cursor-grabbing text-slate-400 hover:text-[#a89db0]' 
              : 'text-slate-300 cursor-not-allowed'
          }`}
        >
          <GripVertical className="w-4 h-4" />
        </div>
        
        {/* Clickable content area */}
        <div 
          onClick={() => form.status === 'active' && onSelectForm?.(form.id)}
          className={`flex items-center gap-3 flex-1 ${form.status === 'active' ? 'cursor-pointer' : 'cursor-default'}`}
        >
          <div className={`p-2 rounded-lg flex-shrink-0 flex items-center justify-center ${
            form.status === 'active' ? 'bg-[#a89db0]/10 text-[#a89db0]' : 'bg-gray-200 text-gray-400'
          }`}>
            {React.cloneElement(form.icon as React.ReactElement, { className: 'w-5 h-5' })}
          </div>
          <h3 className="font-['Lora'] text-base text-[#034863] flex-1 leading-tight">{form.title}</h3>
        </div>
        
        {form.status === 'active' && (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <button
                  className="text-[#034863] hover:bg-[#ddecf0] rounded p-1 h-auto flex-shrink-0 transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicateForm?.(form.id);
                  }}
                  className="cursor-pointer font-['Poppins']"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditTemplate?.(form.templateId);
                  }}
                  className="cursor-pointer font-['Poppins']"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                {onArchiveForm && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onArchiveForm(form.id);
                    }}
                    className="cursor-pointer font-['Poppins']"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Archive
                  </DropdownMenuItem>
                )}
                {onRenameForm && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onRenameForm(form.id);
                    }}
                    className="cursor-pointer font-['Poppins']"
                  >
                    <Type className="w-4 h-4 mr-2" />
                    Rename
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    </div>
  );
}

// Flow form instance in a flow row
interface FlowFormCardProps {
  form: FlowFormInstance;
  flowId: string;
  index: number;
  moveFormInFlow: (flowId: string, dragIndex: number, hoverIndex: number) => void;
  removeFormFromFlow: (flowId: string, instanceId: string) => void;
}

function FlowFormCard({ form, flowId, index, moveFormInFlow, removeFormFromFlow }: FlowFormCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: FLOW_FORM_TYPE,
    item: { flowId, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: FLOW_FORM_TYPE,
    hover: (item: { flowId: string; index: number }, monitor) => {
      if (!ref.current || item.flowId !== flowId) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientX = clientOffset!.x - hoverBoundingRect.left;

      if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) {
        return;
      }

      moveFormInFlow(flowId, dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={`relative p-3 rounded-lg border bg-white border-[#a89db0] hover:shadow-lg transition-all group ${
        isDragging ? 'opacity-50' : ''
      }`}
      style={{ cursor: isDragging ? 'grabbing' : 'grab', minWidth: '160px' }}
    >
      <button
        onClick={() => removeFormFromFlow(flowId, form.instanceId)}
        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
      >
        <X className="w-3 h-3" />
      </button>
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg flex-shrink-0 flex items-center justify-center bg-[#a89db0]/10 text-[#a89db0]">
          {React.cloneElement(form.formIcon as React.ReactElement, { className: 'w-4 h-4' })}
        </div>
        <span className="font-['Lora'] text-sm text-[#034863] leading-tight">{form.formTitle}</span>
      </div>
    </div>
  );
}

// Drop zone for adding forms to flows
interface DropZoneProps {
  flowId: string;
  position: number;
  addFormToFlow: (flowId: string, form: Omit<FlowFormInstance, 'instanceId'>, position: number) => void;
}

function DropZone({ flowId, position, addFormToFlow }: DropZoneProps) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: FORM_TEMPLATE_TYPE,
    drop: (item: { formId: string; formTitle: string; formIcon: React.ReactNode }) => {
      addFormToFlow(flowId, {
        formId: item.formId,
        formTitle: item.formTitle,
        formIcon: item.formIcon,
      }, position);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <div
      ref={drop}
      className={`w-[160px] h-[60px] rounded-lg border-2 border-dashed transition-all flex items-center justify-center ${
        isOver && canDrop
          ? 'border-[#a89db0] bg-[#a89db0]/10'
          : 'border-slate-300 bg-slate-50/50'
      }`}
    >
      {isOver && canDrop ? (
        <Plus className="w-5 h-5 text-[#a89db0]" />
      ) : (
        <Plus className="w-5 h-5 text-slate-400" />
      )}
    </div>
  );
}

// Flow row component
interface FlowRowProps {
  flow: Flow;
  index: number;
  addFormToFlow: (flowId: string, form: Omit<FlowFormInstance, 'instanceId'>, position: number) => void;
  moveFormInFlow: (flowId: string, dragIndex: number, hoverIndex: number) => void;
  removeFormFromFlow: (flowId: string, instanceId: string) => void;
  deleteFlow: (flowId: string) => void;
  addSlotToFlow: (flowId: string) => void;
  moveFlow: (dragIndex: number, hoverIndex: number) => void;
  onSelectForm: (formId: string) => void;
  onOpenWizard: (flowId: string, flowName: string, flowForms: any[]) => void;
  onEditEmailTemplate: (flowId: string, flowName: string, currentTemplate?: string) => void;
  forms: FormType[];
}

function FlowRow({ flow, index, addFormToFlow, moveFormInFlow, removeFormFromFlow, deleteFlow, addSlotToFlow, moveFlow, onSelectForm, onOpenWizard, onEditEmailTemplate, forms }: FlowRowProps) {
  const maxSlots = flow.maxSlots || 8;
  const ref = useRef<HTMLDivElement>(null);
  
  const [{ isDragging }, drag] = useDrag({
    type: FLOW_ROW_TYPE,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: FLOW_ROW_TYPE,
    hover: (item: { index: number }, monitor) => {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveFlow(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));
  
  // Only show send button if flow has at least one form
  const hasforms = flow.forms.filter(f => f).length > 0;
  
  return (
    <>
      <div 
        ref={ref}
        className={`mb-4 p-4 bg-white/50 rounded-xl border border-slate-200 relative transition-all ${
          isDragging ? 'opacity-50' : ''
        }`}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div className="flex items-center gap-4 mb-3">
          <h3 className="font-['Lora'] text-lg text-[#034863] min-w-[200px]">{flow.name}</h3>
          {hasforms && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenWizard(flow.id, flow.name, flow.forms.filter(f => f).map(f => ({
                  formId: f.formId,
                  formTitle: f.formTitle,
                })));
              }}
              className="px-3 py-1.5 bg-[#a89db0] text-white rounded-2xl text-sm font-medium hover:bg-[#9a8ea0] transition-all flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              Send to Client
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Delete flow "${flow.name}"?`)) {
                deleteFlow(flow.id);
              }
            }}
            className="text-slate-400 hover:text-red-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex-1" />
          {/* Edit Email Template button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditEmailTemplate(flow.id, flow.name, flow.emailTemplate);
            }}
            className="p-1.5 rounded-lg bg-[#2f829b]/10 text-[rgb(168,157,176)] hover:bg-[#2f829b]/20 transition-colors flex items-center justify-center bg-[rgba(168,157,176,0.1)]"
            title="Edit email template"
          >
            <Mail className="w-4 h-4" />
          </button>
          {/* Save flow button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Flows are already auto-saving to localStorage
              alert('Flow saved successfully!');
            }}
            className="p-1.5 rounded-lg bg-[#a89db0]/10 text-[#a89db0] hover:bg-[#a89db0]/20 transition-colors flex items-center justify-center"
            title="Save flow"
          >
            <Save className="w-4 h-4" />
          </button>
          {/* Add slot button in upper right */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              addSlotToFlow(flow.id);
            }}
            className="p-1.5 rounded-lg bg-[#a89db0]/10 text-[#a89db0] hover:bg-[#a89db0]/20 transition-colors flex items-center justify-center"
            title="Add more slots"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {Array.from({ length: maxSlots }).map((_, idx) => {
            const formAtPosition = flow.forms[idx];
            
            if (formAtPosition) {
              return (
                <FlowFormCard
                  key={formAtPosition.instanceId}
                  form={formAtPosition}
                  flowId={flow.id}
                  index={idx}
                  moveFormInFlow={moveFormInFlow}
                  removeFormFromFlow={removeFormFromFlow}
                />
              );
            }
            
            return (
              <DropZone
                key={`drop-${flow.id}-${idx}`}
                flowId={flow.id}
                position={idx}
                addFormToFlow={addFormToFlow}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}

// Default forms data - moved here to be accessible before component initialization
export const defaultForms: FormType[] = [
  {
    id: 'scope-of-work',
    templateId: 'sow',
    title: 'Scope of Work',
    description: 'Create comprehensive project proposals with single engagement option',
    icon: <FileText className="w-8 h-8" />,
    status: 'active'
  },
  {
    id: 'scope-of-work-multiple',
    templateId: 'sow-multiple',
    title: 'SOW: Multiple Options',
    description: 'Create proposals with multiple engagement options for clients to choose',
    icon: <Layers className="w-8 h-8" />,
    status: 'active'
  },
  {
    id: 'invoice',
    templateId: 'invoice',
    title: 'Invoice',
    description: 'Generate professional invoices with itemized services and payment terms',
    icon: <Receipt className="w-8 h-8" />,
    status: 'active'
  },
  {
    id: 'services-brochure',
    templateId: 'sow',
    title: 'Services Brochure',
    description: 'Showcase your service offerings with detailed descriptions',
    icon: <Briefcase className="w-8 h-8" />,
    status: 'active'
  },
  {
    id: 'workshop-curriculum',
    templateId: 'workshop',
    title: 'Training Curriculum',
    description: 'Design structured learning experiences and training programs',
    icon: <GraduationCap className="w-8 h-8" />,
    status: 'active'
  },
  {
    id: 'innovation-audit',
    templateId: 'innovation',
    title: 'Audit Template',
    description: 'Evaluate organizational innovation capabilities and opportunities',
    icon: <Lightbulb className="w-8 h-8" />,
    status: 'active'
  },
  {
    id: 'licensing',
    templateId: 'licensing',
    title: 'Licensing Terms',
    description: 'Define licensing terms and intellectual property agreements',
    icon: <Scale className="w-8 h-8" />,
    status: 'active'
  },
  {
    id: 'payment-params',
    templateId: 'payment',
    title: 'Payment Terms',
    description: 'Establish payment schedules, milestones, and terms',
    icon: <CreditCard className="w-8 h-8" />,
    status: 'active'
  },
  {
    id: 'scheduling',
    templateId: 'scheduling',
    title: 'Scheduling Page',
    description: 'Create scheduling pages with Google Calendar links for consultations and calls',
    icon: <Calendar className="w-8 h-8" />,
    status: 'active'
  },
  {
    id: 'pre-consult-audit',
    templateId: 'pre-consult-audit',
    title: 'Pre-Consult Q: Audit',
    description: 'Pre-consultation questionnaire for prospects interested in the audit service',
    icon: <ClipboardList className="w-8 h-8" />,
    status: 'active'
  },
  {
    id: 'pre-consult-workshop',
    templateId: 'pre-consult-workshop',
    title: 'Pre-Consult Q: Training',
    description: 'Pre-consultation questionnaire for prospects interested in workshop/training',
    icon: <GraduationCap className="w-8 h-8" />,
    status: 'active'
  },
  {
    id: 'pre-consult-general',
    templateId: 'pre-consult-general',
    title: 'Pre-Consult Q: Neutral',
    description: 'General pre-consultation questionnaire to learn about their organization and needs',
    icon: <HelpCircle className="w-8 h-8" />,
    status: 'active'
  },
  {
    id: 'feedback-testimonial',
    templateId: 'feedback',
    title: 'Feedback & Testimonial',
    description: 'Request feedback and testimonials from clients',
    icon: <Handshake className="w-8 h-8" />,
    status: 'active'
  }
];

// Default flows data
const defaultFlows: Flow[] = [
  { id: 'prospect-pre-consult', name: 'Prospect: Pre-Consult (Neutral)', forms: [] },
  { id: 'prospect-pre-consult-audit', name: 'Prospect: Pre-Consult (Audit)', forms: [] },
  { id: 'prospect-pre-consult-training', name: 'Prospect: Pre-Consult (Training)', forms: [] },
  { id: 'prospect-post-consult', name: 'Prospect: Post-Consult', forms: [] },
  { id: 'client-audit-onboarding', name: 'Client (Audit): Onboarding', forms: [] },
  { id: 'client-training-onboarding', name: 'Client (Training): Onboarding', forms: [] },
];

function FormDashboardContent({ onSelectForm, onEditTemplate, onDuplicateForm, onArchiveForm, onQuickAddSelect, onJamieAction, wizardToReopen, onWizardReopened, onWizardEditForm, onBack }: FormDashboardProps) {
  const [forms, setForms] = useState<FormType[]>(defaultForms);
  const [flows, setFlows] = useState<Flow[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardFlowData, setWizardFlowData] = useState<{ flowId?: string; flowName: string; flowForms: any[]; currentStep?: any; editedForms?: Set<string>; contactData?: any; customFlowName?: string } | null>(null);
  
  // Email Template Editor state
  const [showEmailEditor, setShowEmailEditor] = useState(false);
  const [emailEditorData, setEmailEditorData] = useState<{ flowId: string; flowName: string; currentTemplate?: string } | null>(null);
  
  // Ref for the scrollable container
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollIntervalRef = useRef<number | null>(null);
  
  // Load custom form names from localStorage
  const [customFormNames, setCustomFormNames] = useState<{ [key: string]: string }>(() => {
    try {
      const saved = localStorage.getItem('custom_form_names');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  
  // Save custom form names whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('custom_form_names', JSON.stringify(customFormNames));
    } catch (error) {
      console.error('Error saving custom form names:', error);
    }
  }, [customFormNames]);

  // Load flows from localStorage on mount
  useEffect(() => {
    try {
      const savedFlows = localStorage.getItem(FLOWS_STORAGE_KEY);
      if (savedFlows) {
        const parsedFlows = JSON.parse(savedFlows);
        // Restore icons for each form in the flows
        const flowsWithIcons = parsedFlows.map((flow: Flow) => ({
          ...flow,
          forms: flow.forms.map(form => ({
            ...form,
            formIcon: getIconForForm(form.formId)
          }))
        }));
        setFlows(flowsWithIcons);
      }
    } catch (error) {
      console.error('Error loading flows from localStorage:', error);
    }
  }, []);

  // Load custom form names and filter archived forms
  useEffect(() => {
    const filterArchivedForms = () => {
      try {
        const archivedForms = JSON.parse(localStorage.getItem('archived_forms') || '[]');
        const archivedFormIds = archivedForms.map((form: any) => form.id);
        
        console.log('🔍 Total defaultForms:', defaultForms.length);
        console.log('🔍 Archived form IDs:', archivedFormIds);
        console.log('🔍 All form IDs:', defaultForms.map(f => f.id));
        
        // Filter out archived forms and apply custom names
        const activeForms = defaultForms
          .filter(form => !archivedFormIds.includes(form.id))
          .map(form => ({
            ...form,
            title: customFormNames[form.id] || form.title
          }));
        
        console.log('🔍 Active forms after filter:', activeForms.length);
        console.log('🔍 Active form IDs:', activeForms.map(f => f.id));
        
        setForms(activeForms);
      } catch (error) {
        console.error('Error filtering archived forms:', error);
        // Apply custom names even to default forms on error
        const formsWithCustomNames = defaultForms.map(form => ({
          ...form,
          title: customFormNames[form.id] || form.title
        }));
        setForms(formsWithCustomNames);
      }
    };

    filterArchivedForms();

    // Listen for archive updates
    const handleArchiveUpdate = () => {
      filterArchivedForms();
    };

    window.addEventListener('archive-updated', handleArchiveUpdate);
    return () => window.removeEventListener('archive-updated', handleArchiveUpdate);
  }, [customFormNames]); // Re-run when custom names change

  // Helper function to get icon by form ID
  const getIconForForm = (formId: string): React.ReactNode => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'scope-of-work': <FileText className="w-8 h-8" />,
      'scope-of-work-multiple': <FileText className="w-8 h-8" />,
      'invoice': <Receipt className="w-8 h-8" />,
      'services-brochure': <Briefcase className="w-8 h-8" />,
      'workshop-curriculum': <GraduationCap className="w-8 h-8" />,
      'innovation-audit': <Lightbulb className="w-8 h-8" />,
      'licensing': <Scale className="w-8 h-8" />,
      'payment-params': <CreditCard className="w-8 h-8" />,
      'scheduling': <Calendar className="w-8 h-8" />,
      'pre-consult-audit': <ClipboardList className="w-8 h-8" />,
      'pre-consult-workshop': <GraduationCap className="w-8 h-8" />,
      'pre-consult-general': <HelpCircle className="w-8 h-8" />,
      'feedback-testimonial': <Handshake className="w-8 h-8" />,
    };
    return iconMap[formId] || <FileText className="w-8 h-8" />;
  };

  const moveCard = (dragIndex: number, hoverIndex: number) => {
    setForms((prevForms) => {
      const newForms = [...prevForms];
      const [removed] = newForms.splice(dragIndex, 1);
      newForms.splice(hoverIndex, 0, removed);
      
      // Save new order to localStorage
      try {
        const orderIds = newForms.map(f => f.id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(orderIds));
      } catch (error) {
        console.error('Error saving card order:', error);
      }
      
      return newForms;
    });
  };

  const handleNewFormTemplate = () => {
    const templateName = prompt('Enter a name for your new form template:');
    if (templateName && templateName.trim()) {
      const newForm: FormType = {
        id: `custom-${Date.now()}`,
        templateId: `custom-template-${Date.now()}`,
        title: templateName.trim(),
        description: 'Custom form template',
        icon: <FileText className="w-8 h-8" />,
        status: 'active'
      };
      
      setForms(prev => [newForm, ...prev]);
      
      // Save to localStorage
      try {
        const orderIds = [newForm, ...forms].map(f => f.id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(orderIds));
      } catch (error) {
        console.error('Error saving new form:', error);
      }
    }
  };

  const addFormToFlow = (flowId: string, form: Omit<FlowFormInstance, 'instanceId'>, position: number) => {
    setFlows(prevFlows =>
      prevFlows.map(flow => {
        if (flow.id !== flowId) return flow;
        
        const newForm: FlowFormInstance = {
          instanceId: `${flowId}-${form.formId}-${Date.now()}`,
          formId: form.formId,
          formTitle: form.formTitle,
          formIcon: form.formIcon, // This will be in memory but not saved to localStorage
        };
        
        const newForms = [...flow.forms];
        newForms[position] = newForm;
        
        return { ...flow, forms: newForms };
      })
    );
  };

  const moveFormInFlow = (flowId: string, dragIndex: number, hoverIndex: number) => {
    setFlows(prevFlows =>
      prevFlows.map(flow => {
        if (flow.id !== flowId) return flow;
        
        const newForms = [...flow.forms];
        const [removed] = newForms.splice(dragIndex, 1);
        newForms.splice(hoverIndex, 0, removed);
        
        return { ...flow, forms: newForms };
      })
    );
  };

  const removeFormFromFlow = (flowId: string, instanceId: string) => {
    setFlows(prevFlows =>
      prevFlows.map(flow => {
        if (flow.id !== flowId) return flow;
        
        return {
          ...flow,
          forms: flow.forms.filter(f => f.instanceId !== instanceId)
        };
      })
    );
  };

  const createNewFlow = () => {
    const flowName = prompt('Enter a name for your new flow:');
    if (flowName && flowName.trim()) {
      const newFlow: Flow = {
        id: `flow-${Date.now()}`,
        name: flowName.trim(),
        forms: []
      };
      setFlows(prev => [...prev, newFlow]);
    }
  };

  const deleteFlow = (flowId: string) => {
    setFlows(prev => prev.filter(f => f.id !== flowId));
  };

  const addSlotToFlow = (flowId: string) => {
    setFlows(prevFlows =>
      prevFlows.map(flow => {
        if (flow.id !== flowId) return flow;
        
        return {
          ...flow,
          maxSlots: (flow.maxSlots || 8) + 1
        };
      })
    );
  };

  const moveFlow = (dragIndex: number, hoverIndex: number) => {
    setFlows((prevFlows) => {
      const newFlows = [...prevFlows];
      const [removed] = newFlows.splice(dragIndex, 1);
      newFlows.splice(hoverIndex, 0, removed);
      
      return newFlows;
    });
  };
  
  const handleRenameForm = (formId: string) => {
    const form = forms.find(f => f.id === formId);
    if (!form) return;
    
    const currentName = form.title;
    const newName = prompt(`Rename "${currentName}" to:`, currentName);
    
    if (newName && newName.trim() && newName !== currentName) {
      setCustomFormNames(prev => ({
        ...prev,
        [formId]: newName.trim()
      }));
    }
  };

  useEffect(() => {
    if (wizardToReopen) {
      console.log('🎯 FormDashboard - Reopening wizard with data:', wizardToReopen);
      console.log('🎯 Contact data in wizardToReopen:', wizardToReopen.contactData);
      setWizardFlowData(wizardToReopen);
      setShowWizard(true);
      onWizardReopened?.();
    }
  }, [wizardToReopen, onWizardReopened]);

  return (
    <div className="h-full flex flex-col bg-[#ebeef4] overflow-hidden">
      {/* Header */}
      <PageHeader_Muted
        title="Forms & Flows"
        newButtonLabel="New Form Template"
        newButtonColor="#a89db0"
        backgroundColor="#ebedf5"
        onNewClick={handleNewFormTemplate}
        onQuickAddSelect={onQuickAddSelect}
        onJamieAction={onJamieAction}
        onBack={onBack}
        showBackButton={!!onBack}
      />
      
      {/* Debug/Reset Button - temporary */}
      <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
        <button
          onClick={() => {
            if (confirm('Clear archived forms cache? This will show all form templates.')) {
              localStorage.removeItem('archived_forms');
              window.location.reload();
            }
          }}
          className="text-sm text-yellow-800 hover:text-yellow-900 underline"
        >
          🔧 Reset Form Cache (click if SOW: Multiple Options card is missing)
        </button>
      </div>

      {/* Main Content Area */}
      <div ref={scrollContainerRef} className="flex-1 overflow-auto bg-[#ebeef4]">
        <div className="max-w-7xl mx-auto p-8 space-y-12">
          {/* Forms Grid */}
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {forms.map((form, index) => (
                <TemplateCard
                  key={form.id}
                  form={form}
                  onSelectForm={onSelectForm}
                  onEditTemplate={onEditTemplate}
                  onDuplicateForm={onDuplicateForm}
                  onArchiveForm={onArchiveForm}
                  onRenameForm={handleRenameForm}
                  scrollContainerRef={scrollContainerRef}
                />
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-300/50" />

          {/* Flows Section */}
          <div>
            <h2 className="font-['Lora'] text-2xl text-[#034863] mb-6">Flows</h2>
            <div className="space-y-4">
              {flows.map((flow, index) => (
                <FlowRow
                  key={flow.id}
                  flow={flow}
                  index={index}
                  addFormToFlow={addFormToFlow}
                  moveFormInFlow={moveFormInFlow}
                  removeFormFromFlow={removeFormFromFlow}
                  deleteFlow={deleteFlow}
                  addSlotToFlow={addSlotToFlow}
                  moveFlow={moveFlow}
                  onSelectForm={(formId) => {
                    if (onWizardEditForm && wizardFlowData) {
                      onWizardEditForm(wizardFlowData.flowName, wizardFlowData.flowForms, formId, wizardFlowData.currentStep, wizardFlowData.editedForms, wizardFlowData.contactData, wizardFlowData.customFlowName);
                    } else {
                      onSelectForm(formId);
                    }
                  }}
                  onOpenWizard={(flowId, flowName, flowForms) => {
                    // Find the flow to get its email template
                    const flow = flows.find(f => f.id === flowId);
                    setWizardFlowData({ flowId, flowName, flowForms, emailTemplate: flow?.emailTemplate });
                    setShowWizard(true);
                  }}
                  onEditEmailTemplate={(flowId, flowName, currentTemplate) => {
                    // Handle email template editing
                    console.log('Editing email template for flow:', flowName);
                    // You can open a modal or a new page to edit the email template
                    setEmailEditorData({ flowId, flowName, currentTemplate });
                    setShowEmailEditor(true);
                  }}
                  forms={forms}
                />
              ))}
              
              {/* Create New Flow Button */}
              <button
                onClick={createNewFlow}
                className="w-full p-4 bg-white/50 rounded-xl border border-dashed border-[#a89db0] hover:border-[#a89db0] hover:bg-[#a89db0]/5 transition-all flex items-center gap-3"
              >
                <div className="p-2 rounded-lg flex-shrink-0 flex items-center justify-center bg-[#a89db0]/10 text-[#a89db0]">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="font-['Lora'] text-lg text-[#034863]">Create New Flow</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Global Flow Wizard Modal */}
      {showWizard && wizardFlowData && (
        <FlowWizard
          key={`wizard-${wizardFlowData.flowName}-${wizardFlowData.contactData?.id || 'no-contact'}`}
          flowId={wizardFlowData.flowId}
          flowName={wizardFlowData.flowName}
          flowForms={wizardFlowData.flowForms}
          initialStep={wizardFlowData.currentStep}
          initialEditedForms={wizardFlowData.editedForms}
          initialContactData={wizardFlowData.contactData}
          initialCustomFlowName={wizardFlowData.customFlowName}
          onClose={() => {
            setShowWizard(false);
            setWizardFlowData(null);
          }}
          onEditForm={(formId, currentStep, editedForms, contactData, customFlowName) => {
            // Store the current wizard state before closing
            console.log('📝 Saving wizard state with contact:', contactData);
            console.log('📝 Saving custom flow name:', customFlowName);
            setWizardFlowData({
              ...wizardFlowData,
              currentStep,
              editedForms: new Set([...editedForms, formId]), // Mark this form as edited
              contactData, // Store contact data for autopopulation
              customFlowName // Store custom flow name
            });
            setShowWizard(false);
            if (onWizardEditForm && wizardFlowData) {
              onWizardEditForm(wizardFlowData.flowName, wizardFlowData.flowForms, formId, currentStep, editedForms, contactData, customFlowName);
            } else {
              onSelectForm(formId);
            }
          }}
        />
      )}
      
      {/* Email Template Editor Modal */}
      {showEmailEditor && emailEditorData && (
        <EmailTemplateEditor
          flowId={emailEditorData.flowId}
          flowName={emailEditorData.flowName}
          initialTemplate={emailEditorData.currentTemplate}
          onClose={() => {
            setShowEmailEditor(false);
            setEmailEditorData(null);
          }}
          onSave={(newTemplate) => {
            // Update the flow with the new email template
            setFlows(prevFlows =>
              prevFlows.map(flow => {
                if (flow.id !== emailEditorData.flowId) return flow;
                
                return {
                  ...flow,
                  emailTemplate: newTemplate
                };
              })
            );
            setShowEmailEditor(false);
            setEmailEditorData(null);
          }}
        />
      )}
    </div>
  );
}

export function FormDashboard({ onSelectForm, onEditTemplate, onDuplicateForm, onArchiveForm, onQuickAddSelect, onJamieAction, wizardToReopen, onWizardReopened, onWizardEditForm, onBack }: FormDashboardProps) {
  return (
    <DndProvider backend={HTML5Backend}>
      <FormDashboardContent 
        onSelectForm={onSelectForm}
        onEditTemplate={onEditTemplate}
        onDuplicateForm={onDuplicateForm}
        onArchiveForm={onArchiveForm}
        onQuickAddSelect={onQuickAddSelect}
        onJamieAction={onJamieAction}
        wizardToReopen={wizardToReopen}
        onWizardReopened={onWizardReopened}
        onWizardEditForm={onWizardEditForm}
        onBack={onBack}
      />
    </DndProvider>
  );
}