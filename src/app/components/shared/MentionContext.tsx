import React, { createContext, useContext, ReactNode } from 'react';

export type MentionableType = 'routine' | 'task' | 'contact' | 'playlist' | 'tag';

export interface MentionableEntity {
  id: string;
  name: string;
  type: MentionableType;
  icon?: string;
  color?: string;
  metadata?: any;
}

interface MentionContextValue {
  entities: MentionableEntity[];
}

const MentionContext = createContext<MentionContextValue | undefined>(undefined);

interface MentionProviderProps {
  children: ReactNode;
  routines?: any[];
  tasks?: any[];
  contacts?: any[];
  playlists?: any[];
  tags?: any[];
}

export function MentionProvider({ 
  children, 
  routines = [], 
  tasks = [], 
  contacts = [], 
  playlists = [],
  tags = [],
}: MentionProviderProps) {
  const entities: MentionableEntity[] = [
    ...routines.map(r => ({
      id: r.id,
      name: r.name,
      type: 'routine' as MentionableType,
      icon: getRoutineIcon(r.type),
      color: '#2f829b',
      metadata: r,
    })),
    ...tasks.map(t => ({
      id: t.id,
      name: t.title,
      type: 'task' as MentionableType,
      icon: 'check-square',
      color: '#6b2358',
      metadata: t,
    })),
    ...contacts.map(c => ({
      id: c.id,
      name: c.name,
      type: 'contact' as MentionableType,
      icon: 'user',
      color: c.color || '#6b7b98',
      metadata: c,
    })),
    ...playlists.map(p => ({
      id: p.id,
      name: p.name,
      type: 'playlist' as MentionableType,
      icon: 'list',
      color: '#034863',
      metadata: p,
    })),
    ...tags.map(tag => ({
      id: tag.id || tag.name,
      name: tag.name,
      type: 'tag' as MentionableType,
      icon: 'tag',
      color: '#a89bb4',
      metadata: tag,
    })),
  ];

  // Debug logging
  console.log('🔍 MentionProvider - Entity Counts:', {
    routines: routines.length,
    tasks: tasks.length,
    contacts: contacts.length,
    playlists: playlists.length,
    tags: tags.length,
    totalEntities: entities.length
  });
  
  console.log('🔍 MentionProvider - Sample Entities:', {
    firstRoutine: entities.find(e => e.type === 'routine'),
    firstTask: entities.find(e => e.type === 'task'),
    firstContact: entities.find(e => e.type === 'contact'),
    firstPlaylist: entities.find(e => e.type === 'playlist'),
  });

  return (
    <MentionContext.Provider value={{ entities }}>
      {children}
    </MentionContext.Provider>
  );
}

export function useMentions() {
  const context = useContext(MentionContext);
  if (!context) {
    return { entities: [] }; // Return empty array if no provider
  }
  return context;
}

function getRoutineIcon(type: string): string {
  const iconMap: Record<string, string> = {
    // Routine types from RoutineType union
    'self-directed': 'circle',
    'task-playlist': 'check-square',
    'content-playlist': 'pen-tool',
    'nurture-list': 'heart',
    // Legacy icon mappings (for backward compatibility)
    'admin': 'mail',
    'break': 'coffee',
    'learning': 'book-open',
    'health': 'activity',
    'meeting': 'calendar',
  };
  return iconMap[type] || 'circle';
}