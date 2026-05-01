// Flow instance tracking with timestamps
// This tracks flows that have been sent to specific contacts

export interface FlowAction {
  id: string;
  timestamp: string;
  actionType: 
    | 'flow_created'
    | 'flow_sent' 
    | 'url_opened'
    | 'form_started'
    | 'form_completed'
    | 'form_edited_by_admin'
    | 'form_approved_by_admin'
    | 'flow_completed'
    | 'flow_archived'
    | 'url_resent';
  actor: 'admin' | 'client';
  details?: string;
  formId?: string; // For form-specific actions
  formName?: string;
}

export interface FlowFormStatus {
  formId: string;
  formTitle: string;
  status: 'pending' | 'in_progress' | 'completed' | 'needs_approval';
  startedAt?: string;
  completedAt?: string;
  completedBy?: 'admin' | 'client';
  lastEditedAt?: string;
  lastEditedBy?: 'admin' | 'client';
}

export interface FlowInstance {
  id: string; // Unique instance ID
  flowId: string; // Reference to the flow template ID
  flowName: string;
  customFlowName?: string; // Custom name for this specific contact (e.g., "Lisa's Pre-Consult Questionnaire")
  contactId: string;
  contactName: string;
  status: 'draft' | 'sent' | 'in_progress' | 'completed' | 'archived';
  createdAt: string;
  sentAt?: string;
  completedAt?: string;
  uniqueUrl?: string;
  forms: FlowFormStatus[];
  actions: FlowAction[];
  emailContent?: string;
  formData?: Record<string, any>; // Store submitted form data
}

const FLOW_INSTANCES_STORAGE_KEY = 'empower_health_flow_instances';

export class FlowInstanceService {
  static getAllInstances(): FlowInstance[] {
    try {
      const data = localStorage.getItem(FLOW_INSTANCES_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading flow instances:', error);
      return [];
    }
  }

  static getInstancesByContactId(contactId: string): FlowInstance[] {
    const allInstances = this.getAllInstances();
    return allInstances.filter(instance => instance.contactId === contactId);
  }

  static getInstanceById(instanceId: string): FlowInstance | null {
    const allInstances = this.getAllInstances();
    return allInstances.find(instance => instance.id === instanceId) || null;
  }

  static saveInstance(instance: FlowInstance): void {
    try {
      const allInstances = this.getAllInstances();
      const existingIndex = allInstances.findIndex(i => i.id === instance.id);
      
      if (existingIndex >= 0) {
        allInstances[existingIndex] = instance;
      } else {
        allInstances.push(instance);
      }
      
      localStorage.setItem(FLOW_INSTANCES_STORAGE_KEY, JSON.stringify(allInstances));
      
      // Dispatch custom event so components can listen for updates
      window.dispatchEvent(new CustomEvent('flowInstancesUpdated', { detail: { instanceId: instance.id } }));
    } catch (error) {
      console.error('Error saving flow instance:', error);
    }
  }

  static createInstance(data: {
    instanceId?: string; // Optional - if provided, use this instead of generating
    flowId: string;
    flowName: string;
    contactId: string;
    contactName: string;
    forms: Array<{ formId: string; formTitle: string }>;
  }): FlowInstance {
    const now = new Date().toISOString();
    const instanceId = data.instanceId || `flow-instance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const instance: FlowInstance = {
      id: instanceId,
      flowId: data.flowId,
      flowName: data.flowName,
      contactId: data.contactId,
      contactName: data.contactName,
      status: 'draft',
      createdAt: now,
      forms: data.forms.map(form => ({
        formId: form.formId,
        formTitle: form.formTitle,
        status: 'pending',
      })),
      actions: [
        {
          id: `action-${Date.now()}`,
          timestamp: now,
          actionType: 'flow_created',
          actor: 'admin',
          details: `Flow "${data.flowName}" created for ${data.contactName}`,
        },
      ],
    };
    
    this.saveInstance(instance);
    return instance;
  }

  static addAction(instanceId: string, action: Omit<FlowAction, 'id' | 'timestamp'>): void {
    const instance = this.getInstanceById(instanceId);
    if (!instance) return;
    
    const newAction: FlowAction = {
      ...action,
      id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };
    
    instance.actions.push(newAction);
    
    // Update instance status based on action
    if (action.actionType === 'flow_sent') {
      instance.status = 'sent';
      instance.sentAt = newAction.timestamp;
    } else if (action.actionType === 'url_opened') {
      if (instance.status === 'sent') {
        instance.status = 'in_progress';
      }
    } else if (action.actionType === 'flow_completed') {
      instance.status = 'completed';
      instance.completedAt = newAction.timestamp;
    } else if (action.actionType === 'flow_archived') {
      instance.status = 'archived';
    }
    
    // Update form status based on action
    if (action.formId && action.actionType === 'form_started') {
      const form = instance.forms.find(f => f.formId === action.formId);
      if (form) {
        form.status = 'in_progress';
        form.startedAt = newAction.timestamp;
      }
    } else if (action.formId && action.actionType === 'form_completed') {
      const form = instance.forms.find(f => f.formId === action.formId);
      if (form) {
        form.status = 'completed';
        form.completedAt = newAction.timestamp;
        form.completedBy = action.actor;
      }
    } else if (action.formId && action.actionType === 'form_edited_by_admin') {
      const form = instance.forms.find(f => f.formId === action.formId);
      if (form) {
        form.lastEditedAt = newAction.timestamp;
        form.lastEditedBy = 'admin';
      }
    }
    
    this.saveInstance(instance);
  }

  static updateFormStatus(instanceId: string, formId: string, status: FlowFormStatus['status']): void {
    const instance = this.getInstanceById(instanceId);
    if (!instance) return;
    
    const form = instance.forms.find(f => f.formId === formId);
    if (form) {
      form.status = status;
      this.saveInstance(instance);
    }
  }

  static deleteInstance(instanceId: string): void {
    try {
      const allInstances = this.getAllInstances();
      const filtered = allInstances.filter(i => i.id !== instanceId);
      localStorage.setItem(FLOW_INSTANCES_STORAGE_KEY, JSON.stringify(filtered));
      window.dispatchEvent(new CustomEvent('flowInstancesUpdated', { detail: { instanceId } }));
    } catch (error) {
      console.error('Error deleting flow instance:', error);
    }
  }
}