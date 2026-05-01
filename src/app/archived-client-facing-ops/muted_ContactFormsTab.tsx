import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Send, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  Circle,
  AlertCircle,
  Archive,
  Eye,
  Edit2,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  User,
  Sparkles
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { FlowInstance, FlowInstanceService, FlowAction } from '../services/flowInstanceService';

interface ContactFormsTabProps {
  contactId: string;
  contactName: string;
  onSendFlow: () => void; // Opens Flow Wizard with contact pre-selected
}

export function ContactFormsTab({ contactId, contactName, onSendFlow }: ContactFormsTabProps) {
  const [flowInstances, setFlowInstances] = useState<FlowInstance[]>([]);
  const [expandedFlowId, setExpandedFlowId] = useState<string | null>(null);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);

  // Load flow instances for this contact
  useEffect(() => {
    loadFlowInstances();
    
    // Listen for updates
    const handleUpdate = () => {
      loadFlowInstances();
    };
    
    window.addEventListener('flowInstancesUpdated', handleUpdate);
    return () => window.removeEventListener('flowInstancesUpdated', handleUpdate);
  }, [contactId]);

  const loadFlowInstances = () => {
    const instances = FlowInstanceService.getInstancesByContactId(contactId);
    // Sort by creation date, newest first
    instances.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setFlowInstances(instances);
  };

  const handleResendLink = (instance: FlowInstance) => {
    if (instance.uniqueUrl) {
      FlowInstanceService.addAction(instance.id, {
        actionType: 'url_resent',
        actor: 'admin',
        details: `Flow link resent to ${contactName}`,
      });
      // In a real app, this would trigger email sending
      alert(`Link resent! URL: ${instance.uniqueUrl}`);
    }
  };

  const handleArchiveFlow = (instanceId: string) => {
    if (confirm('Archive this flow? It will still be visible in archived flows.')) {
      FlowInstanceService.addAction(instanceId, {
        actionType: 'flow_archived',
        actor: 'admin',
        details: 'Flow archived',
      });
    }
  };

  const handleViewUrl = (url: string) => {
    window.open(url, '_blank');
  };

  const getStatusColor = (status: FlowInstance['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'sent': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'in_progress': return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'completed': return 'bg-green-100 text-green-700 border-green-300';
      case 'archived': return 'bg-slate-100 text-slate-600 border-slate-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getFormStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'in_progress': return <AlertCircle className="w-4 h-4 text-amber-600" />;
      case 'needs_approval': return <Eye className="w-4 h-4 text-blue-600" />;
      default: return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getActionIcon = (actionType: FlowAction['actionType']) => {
    switch (actionType) {
      case 'flow_created': return <Plus className="w-4 h-4" />;
      case 'flow_sent': return <Send className="w-4 h-4" />;
      case 'url_opened': return <ExternalLink className="w-4 h-4" />;
      case 'form_started': return <Edit2 className="w-4 h-4" />;
      case 'form_completed': return <CheckCircle2 className="w-4 h-4" />;
      case 'form_edited_by_admin': return <Edit2 className="w-4 h-4" />;
      case 'form_approved_by_admin': return <CheckCircle2 className="w-4 h-4" />;
      case 'flow_completed': return <CheckCircle2 className="w-4 h-4" />;
      case 'flow_archived': return <Archive className="w-4 h-4" />;
      case 'url_resent': return <Send className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getActionColor = (actor: 'admin' | 'client') => {
    return actor === 'admin' 
      ? 'bg-purple-50 border-purple-200' 
      : 'bg-blue-50 border-blue-200';
  };

  if (flowInstances.length === 0) {
    return (
      <div>
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="flex items-center gap-2 mb-2">
              <FileText className="w-6 h-6 text-[#8ba5a8]" />
              <span>Client Forms & Flows</span>
            </h3>
            <p className="text-sm text-gray-600">
              Send customized form flows and track completion for {contactName}
            </p>
          </div>
          <Button 
            className="bg-[#8ba5a8] hover:bg-[#7a9497] text-white"
            onClick={onSendFlow}
          >
            <Plus className="w-4 h-4 mr-2" />
            Send Flow
          </Button>
        </div>

        {/* Empty State */}
        <div className="text-center py-16 bg-gradient-to-br from-[#8ba5a8]/5 to-transparent rounded-2xl border-2 border-dashed border-[#8ba5a8]/30">
          <FileText className="w-16 h-16 mx-auto mb-4 text-[#8ba5a8]/40" />
          <h3 className="font-serif text-xl text-gray-700 mb-2">No flows sent yet</h3>
          <p className="text-gray-500 mb-6">Create a flow to send forms to {contactName}</p>
          <Button 
            className="bg-[#8ba5a8] hover:bg-[#7a9497] text-white"
            onClick={onSendFlow}
          >
            <Plus className="w-4 h-4 mr-2" />
            Send Your First Flow
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 mb-2">
            <FileText className="w-6 h-6 text-[#8ba5a8]" />
            <span>Client Forms & Flows</span>
          </h3>
          <p className="text-sm text-gray-600">
            {flowInstances.length} {flowInstances.length === 1 ? 'flow' : 'flows'} sent to {contactName}
          </p>
        </div>
        <Button 
          className="bg-[#8ba5a8] hover:bg-[#7a9497] text-white"
          onClick={onSendFlow}
        >
          <Plus className="w-4 h-4 mr-2" />
          Send Flow
        </Button>
      </div>

      {/* Flow Instances List */}
      <div className="space-y-4">
        {flowInstances.map((instance) => (
          <div 
            key={instance.id}
            className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:border-[#8ba5a8]/50 transition-all"
          >
            {/* Flow Header */}
            <div className="p-5 bg-gradient-to-r from-[#8ba5a8]/5 to-transparent">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-serif text-lg text-gray-900">{instance.flowName}</h4>
                    <Badge className={`${getStatusColor(instance.status)} border font-medium`}>
                      {instance.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Created {formatTimestamp(instance.createdAt)}
                    </span>
                    {instance.sentAt && (
                      <span className="flex items-center gap-1">
                        <Send className="w-4 h-4" />
                        Sent {formatTimestamp(instance.sentAt)}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {instance.uniqueUrl && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewUrl(instance.uniqueUrl!)}
                        className="text-[#8ba5a8] border-[#8ba5a8]/30 hover:bg-[#8ba5a8]/10"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View URL
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResendLink(instance)}
                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                      >
                        <Send className="w-4 h-4 mr-1" />
                        Resend
                      </Button>
                    </>
                  )}
                  {instance.status !== 'archived' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleArchiveFlow(instance.id)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <Archive className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Forms Progress */}
              <div className="space-y-2">
                {instance.forms.map((form) => (
                  <div 
                    key={form.formId}
                    className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      {getFormStatusIcon(form.status)}
                      <span className="text-gray-700">{form.formTitle}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {form.completedAt && (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {formatTimestamp(form.completedAt)}
                        </span>
                      )}
                      {form.completedBy && (
                        <Badge variant="outline" className="text-xs">
                          {form.completedBy === 'admin' ? 'You' : contactName}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Expand/Collapse Button */}
              <button
                onClick={() => setExpandedHistoryId(expandedHistoryId === instance.id ? null : instance.id)}
                className="mt-3 flex items-center gap-2 text-sm text-[#8ba5a8] hover:text-[#7a9497] transition-colors"
              >
                {expandedHistoryId === instance.id ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Hide Activity History
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    View Activity History ({instance.actions.length} {instance.actions.length === 1 ? 'action' : 'actions'})
                  </>
                )}
              </button>
            </div>

            {/* Activity History */}
            {expandedHistoryId === instance.id && (
              <div className="p-5 bg-gray-50 border-t border-gray-200">
                <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Activity Timeline
                </h5>
                <div className="space-y-2">
                  {instance.actions.slice().reverse().map((action) => (
                    <div
                      key={action.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${getActionColor(action.actor)}`}
                    >
                      <div className="mt-0.5">
                        {getActionIcon(action.actionType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {action.details || action.actionType.replace(/_/g, ' ')}
                          </span>
                          {action.formName && (
                            <Badge variant="outline" className="text-xs">
                              {action.formName}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            {action.actor === 'admin' ? (
                              <>
                                <User className="w-3 h-3" />
                                You
                              </>
                            ) : (
                              <>
                                <User className="w-3 h-3" />
                                {contactName}
                              </>
                            )}
                          </span>
                          <span>•</span>
                          <span>{formatTimestamp(action.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
