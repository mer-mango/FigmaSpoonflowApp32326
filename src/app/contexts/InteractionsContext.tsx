import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MeetingDossier, MeetingTask, InteractionCard } from '../types/interactions';

interface InteractionsContextType {
  // Interactions/Dossiers
  dossiers: MeetingDossier[];
  getDossierById: (id: string) => MeetingDossier | undefined;
  getDossiersByContactId: (contactId: string) => MeetingDossier[];
  getDossierByMeetingId: (meetingId: string) => MeetingDossier | undefined;
  createDossier: (dossier: Omit<MeetingDossier, 'id' | 'createdAt' | 'updatedAt'>) => MeetingDossier;
  updateDossier: (id: string, updates: Partial<MeetingDossier>) => void;
  deleteDossier: (id: string) => void;
  deleteDossiersByMeetingIds: (meetingIds: string[]) => void; // Bulk delete for calendar sync
  
  // Tasks
  tasks: MeetingTask[];
  getTaskById: (id: string) => MeetingTask | undefined;
  getTasksByContactId: (contactId: string) => MeetingTask[];
  getTasksByMeetingId: (meetingId: string) => MeetingTask[];
  createTask: (task: Omit<MeetingTask, 'id' | 'createdAt' | 'updatedAt'>) => MeetingTask;
  updateTask: (id: string, updates: Partial<MeetingTask>) => void;
  deleteTask: (id: string) => void;
  
  // Bulk operations
  createTasksForMeeting: (meetingId: string, tasks: Omit<MeetingTask, 'id' | 'createdAt' | 'updatedAt' | 'meetingId'>[]) => MeetingTask[];
  updateTasksForMeeting: (meetingId: string, tasks: Partial<MeetingTask>[]) => void;
  
  // Utility
  refreshInteractions: () => void;
}

const InteractionsContext = createContext<InteractionsContextType | undefined>(undefined);

export function InteractionsProvider({ children }: { children: ReactNode }) {
  const [dossiers, setDossiers] = useState<MeetingDossier[]>([]);
  const [tasks, setTasks] = useState<MeetingTask[]>([]);
  
  // Load from localStorage on mount
  useEffect(() => {
    const storedDossiers = localStorage.getItem('meeting_dossiers');
    const storedTasks = localStorage.getItem('meeting_tasks');
    
    console.log('🔍 [InteractionsContext] Loading from localStorage...');
    console.log('   - meeting_dossiers:', storedDossiers ? `${JSON.parse(storedDossiers).length} dossiers` : 'none');
    
    if (storedDossiers) {
      try {
        const parsed = JSON.parse(storedDossiers);
        console.log('✅ [InteractionsContext] Loaded dossiers:', parsed);
        setDossiers(parsed);
      } catch (e) {
        console.error('Failed to parse dossiers from localStorage', e);
      }
    }
    
    if (storedTasks) {
      try {
        setTasks(JSON.parse(storedTasks));
      } catch (e) {
        console.error('Failed to parse tasks from localStorage', e);
      }
    }
  }, []);
  
  // Save to localStorage whenever dossiers change
  useEffect(() => {
    localStorage.setItem('meeting_dossiers', JSON.stringify(dossiers));
  }, [dossiers]);
  
  // Save to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('meeting_tasks', JSON.stringify(tasks));
  }, [tasks]);
  
  // Dossier methods
  const getDossierById = (id: string) => {
    return dossiers.find(d => d.id === id);
  };
  
  const getDossiersByContactId = (contactId: string) => {
    return dossiers.filter(d => d.contactId === contactId);
  };
  
  const getDossierByMeetingId = (meetingId: string) => {
    return dossiers.find(d => d.meetingId === meetingId);
  };
  
  const createDossier = (dossierData: Omit<MeetingDossier, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Check if a dossier already exists for this meeting
    const existingDossier = dossiers.find(d => d.meetingId === dossierData.meetingId);
    
    if (existingDossier) {
      // Update existing dossier instead of creating a duplicate
      console.log('📝 [InteractionsContext] Dossier already exists for meeting, updating instead:', dossierData.meetingId);
      const updatedDossier = {
        ...existingDossier,
        ...dossierData,
        updatedAt: new Date().toISOString(),
      };
      console.log('   Updated dossier data:', updatedDossier);
      setDossiers(prev => prev.map(d => 
        d.id === existingDossier.id ? updatedDossier : d
      ));
      return updatedDossier;
    }
    
    const newDossier: MeetingDossier = {
      ...dossierData,
      id: `dossier-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    console.log('✅ [InteractionsContext] Creating new dossier:', newDossier);
    setDossiers(prev => [...prev, newDossier]);
    return newDossier;
  };
  
  const updateDossier = (id: string, updates: Partial<MeetingDossier>) => {
    console.log(`📝 [InteractionsContext] Updating dossier ${id}:`, updates);
    console.log(`📝 [InteractionsContext] actionItems in updates:`, updates.actionItems);
    
    setDossiers(prev => prev.map(d => {
      if (d.id === id) {
        const updated = { ...d, ...updates, updatedAt: new Date().toISOString() };
        console.log(`✅ [InteractionsContext] Dossier updated. actionItems now:`, updated.actionItems);
        return updated;
      }
      return d;
    }));
  };
  
  const deleteDossier = (id: string) => {
    setDossiers(prev => prev.filter(d => d.id !== id));
    // Also delete associated tasks
    setTasks(prev => prev.filter(t => t.meetingId !== id));
  };
  
  const deleteDossiersByMeetingIds = (meetingIds: string[]) => {
    setDossiers(prev => prev.filter(d => !meetingIds.includes(d.meetingId)));
    // Also delete associated tasks
    setTasks(prev => prev.filter(t => !meetingIds.includes(t.meetingId)));
  };
  
  // Task methods
  const getTaskById = (id: string) => {
    return tasks.find(t => t.id === id);
  };
  
  const getTasksByContactId = (contactId: string) => {
    return tasks.filter(t => t.contactId === contactId);
  };
  
  const getTasksByMeetingId = (meetingId: string) => {
    return tasks.filter(t => t.meetingId === meetingId);
  };
  
  const createTask = (taskData: Omit<MeetingTask, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: MeetingTask = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setTasks(prev => [...prev, newTask]);
    
    // If this task is linked to a meeting, add it to the dossier's taskIds
    if (newTask.meetingId) {
      updateDossier(newTask.meetingId, {
        taskIds: [...(getDossierById(newTask.meetingId)?.taskIds || []), newTask.id]
      });
    }
    
    return newTask;
  };
  
  const updateTask = (id: string, updates: Partial<MeetingTask>) => {
    setTasks(prev => prev.map(t => 
      t.id === id 
        ? { ...t, ...updates, updatedAt: new Date().toISOString() }
        : t
    ));
  };
  
  const deleteTask = (id: string) => {
    const task = getTaskById(id);
    setTasks(prev => prev.filter(t => t.id !== id));
    
    // Remove from dossier if linked
    if (task?.meetingId) {
      const dossier = getDossierById(task.meetingId);
      if (dossier) {
        updateDossier(task.meetingId, {
          taskIds: dossier.taskIds.filter(tid => tid !== id)
        });
      }
    }
  };
  
  // Bulk operations
  const createTasksForMeeting = (
    meetingId: string, 
    tasksData: Omit<MeetingTask, 'id' | 'createdAt' | 'updatedAt' | 'meetingId'>[]
  ) => {
    const newTasks = tasksData.map(taskData => 
      createTask({ ...taskData, meetingId })
    );
    return newTasks;
  };
  
  const updateTasksForMeeting = (meetingId: string, taskUpdates: Partial<MeetingTask>[]) => {
    taskUpdates.forEach(update => {
      if (update.id) {
        updateTask(update.id, update);
      }
    });
  };
  
  // Utility
  const refreshInteractions = () => {
    const storedDossiers = localStorage.getItem('meeting_dossiers');
    const storedTasks = localStorage.getItem('meeting_tasks');
    
    if (storedDossiers) {
      try {
        setDossiers(JSON.parse(storedDossiers));
      } catch (e) {
        console.error('Failed to parse dossiers from localStorage', e);
      }
    }
    
    if (storedTasks) {
      try {
        setTasks(JSON.parse(storedTasks));
      } catch (e) {
        console.error('Failed to parse tasks from localStorage', e);
      }
    }
  };
  
  const value: InteractionsContextType = {
    dossiers,
    getDossierById,
    getDossiersByContactId,
    getDossierByMeetingId,
    createDossier,
    updateDossier,
    deleteDossier,
    deleteDossiersByMeetingIds,
    tasks,
    getTaskById,
    getTasksByContactId,
    getTasksByMeetingId,
    createTask,
    updateTask,
    deleteTask,
    createTasksForMeeting,
    updateTasksForMeeting,
    refreshInteractions,
  };
  
  return (
    <InteractionsContext.Provider value={value}>
      {children}
    </InteractionsContext.Provider>
  );
}

export function useInteractions() {
  const context = useContext(InteractionsContext);
  if (!context) {
    throw new Error('useInteractions must be used within an InteractionsProvider');
  }
  return context;
}