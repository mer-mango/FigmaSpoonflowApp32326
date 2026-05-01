/**
 * Integrations Settings
 * Manage external service integrations
 */

import React from 'react';
import { Check, X } from 'lucide-react';
import { Button } from './ui/button';

interface Integration {
  id: string;
  name: string;
  description: string;
  connected: boolean;
  icon?: string;
}

interface MutedIntegrationsSettingsProps {
  integrations?: Integration[];
  onConnect?: (integrationId: string) => void;
  onDisconnect?: (integrationId: string) => void;
}

export function MutedIntegrationsSettings({
  integrations = [],
  onConnect,
  onDisconnect
}: MutedIntegrationsSettingsProps) {
  const defaultIntegrations: Integration[] = [
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: 'Sync your calendar events and meetings',
      connected: false
    },
    {
      id: 'gmail',
      name: 'Gmail',
      description: 'Send emails and track communications',
      connected: false
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      description: 'Import connections and track interactions',
      connected: false
    },
    {
      id: 'fathom',
      name: 'Fathom',
      description: 'Import meeting notes and recordings',
      connected: false
    }
  ];

  const displayIntegrations = integrations.length > 0 ? integrations : defaultIntegrations;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Integrations</h3>
        <p className="text-sm text-gray-600">
          Connect external services to enhance your workflow.
        </p>
      </div>

      <div className="space-y-4">
        {displayIntegrations.map((integration) => (
          <div
            key={integration.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex-1">
              <h4 className="font-medium">{integration.name}</h4>
              <p className="text-sm text-gray-600">{integration.description}</p>
            </div>
            <div className="flex items-center gap-3">
              {integration.connected ? (
                <>
                  <span className="flex items-center text-green-600 text-sm">
                    <Check className="h-4 w-4 mr-1" />
                    Connected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDisconnect?.(integration.id)}
                  >
                    Disconnect
                  </Button>
                </>
              ) : (
                <>
                  <span className="flex items-center text-gray-400 text-sm">
                    <X className="h-4 w-4 mr-1" />
                    Not connected
                  </span>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onConnect?.(integration.id)}
                  >
                    Connect
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}