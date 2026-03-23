/**
 * Jamie's Time Estimation Learning System
 * 
 * This utility helps Jamie learn how long tasks actually take based on completion history,
 * so she can provide better time estimates for future tasks.
 */

export interface TaskCompletionData {
  taskId: string;
  taskTitle: string;
  taskType: string; // e.g., "nurture-email", "linkedin-post", "blog-post", "client-call-prep", etc.
  estimatedTime: number; // in minutes
  actualTime: number; // in minutes
  completedAt: Date;
  startedAt: Date;
}

export interface TimeEstimates {
  count: number;
  total: number;
  average: number;
  min: number;
  max: number;
}

/**
 * Get Jamie's learned time estimate for a specific task type
 * @param taskType The type of task (e.g., "nurture-email", "linkedin-post")
 * @returns The learned average time in minutes, or null if no data exists
 */
export function getLearnedTimeEstimate(taskType: string): number | null {
  try {
    const estimatesData = localStorage.getItem('jamie_learned_time_estimates');
    if (!estimatesData) return null;
    
    const estimates = JSON.parse(estimatesData);
    const taskEstimate = estimates[taskType];
    
    if (!taskEstimate || taskEstimate.count === 0) return null;
    
    return taskEstimate.average;
  } catch (error) {
    console.error('Error getting learned time estimate:', error);
    return null;
  }
}

/**
 * Get all learned time estimates for all task types
 * @returns Object with task types as keys and time estimate data as values
 */
export function getAllLearnedEstimates(): Record<string, TimeEstimates> {
  try {
    const estimatesData = localStorage.getItem('jamie_learned_time_estimates');
    if (!estimatesData) return {};
    
    return JSON.parse(estimatesData);
  } catch (error) {
    console.error('Error getting all learned estimates:', error);
    return {};
  }
}

/**
 * Get the complete task completion history
 * @returns Array of all completed tasks with timing data
 */
export function getTaskCompletionHistory(): TaskCompletionData[] {
  try {
    const historyData = localStorage.getItem('jamie_task_completion_history');
    if (!historyData) return [];
    
    return JSON.parse(historyData);
  } catch (error) {
    console.error('Error getting task completion history:', error);
    return [];
  }
}

/**
 * Get completion history for a specific task type
 * @param taskType The type of task to filter by
 * @returns Array of completed tasks of that type
 */
export function getCompletionHistoryByType(taskType: string): TaskCompletionData[] {
  try {
    const history = getTaskCompletionHistory();
    return history.filter(task => task.taskType === taskType);
  } catch (error) {
    console.error('Error getting completion history by type:', error);
    return [];
  }
}

/**
 * Get a smart time estimate using Jamie's learned data with fallback to defaults
 * @param taskType The type of task
 * @param defaultEstimate The default estimate to use if no learned data exists
 * @returns The best time estimate in minutes
 */
export function getSmartTimeEstimate(taskType: string, defaultEstimate: number = 30): number {
  const learned = getLearnedTimeEstimate(taskType);
  
  // If Jamie has learned data for this task type, use it
  if (learned !== null) {
    return learned;
  }
  
  // Otherwise, use the default estimate
  return defaultEstimate;
}

/**
 * Get statistics about Jamie's learning for a specific task type
 * @param taskType The type of task
 * @returns Statistics object with count, average, min, max, and accuracy
 */
export function getTaskTypeStatistics(taskType: string): {
  count: number;
  average: number;
  min: number;
  max: number;
  accuracy: number; // percentage of how close estimates were to actual times
} | null {
  try {
    const estimates = getAllLearnedEstimates();
    const taskEstimate = estimates[taskType];
    
    if (!taskEstimate || taskEstimate.count === 0) return null;
    
    // Calculate accuracy by comparing estimated vs actual times
    const history = getCompletionHistoryByType(taskType);
    let totalAccuracy = 0;
    
    history.forEach(task => {
      const difference = Math.abs(task.estimatedTime - task.actualTime);
      const accuracy = 100 - (difference / task.estimatedTime * 100);
      totalAccuracy += Math.max(0, accuracy); // Don't allow negative accuracy
    });
    
    const averageAccuracy = history.length > 0 ? totalAccuracy / history.length : 0;
    
    return {
      count: taskEstimate.count,
      average: taskEstimate.average,
      min: taskEstimate.min,
      max: taskEstimate.max,
      accuracy: Math.round(averageAccuracy)
    };
  } catch (error) {
    console.error('Error getting task type statistics:', error);
    return null;
  }
}

/**
 * Get a summary of Jamie's overall learning progress
 * @returns Summary object with total tasks tracked and overall accuracy
 */
export function getLearningSummary(): {
  totalTasksTracked: number;
  uniqueTaskTypes: number;
  mostCommonTaskType: string | null;
  overallAccuracy: number;
} {
  try {
    const history = getTaskCompletionHistory();
    const estimates = getAllLearnedEstimates();
    
    // Count unique task types
    const uniqueTypes = Object.keys(estimates).length;
    
    // Find most common task type
    const typeCounts: Record<string, number> = {};
    history.forEach(task => {
      typeCounts[task.taskType] = (typeCounts[task.taskType] || 0) + 1;
    });
    
    let mostCommonType: string | null = null;
    let maxCount = 0;
    Object.entries(typeCounts).forEach(([type, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommonType = type;
      }
    });
    
    // Calculate overall accuracy
    let totalAccuracy = 0;
    history.forEach(task => {
      const difference = Math.abs(task.estimatedTime - task.actualTime);
      const accuracy = 100 - (difference / task.estimatedTime * 100);
      totalAccuracy += Math.max(0, accuracy);
    });
    
    const overallAccuracy = history.length > 0 ? totalAccuracy / history.length : 0;
    
    return {
      totalTasksTracked: history.length,
      uniqueTaskTypes: uniqueTypes,
      mostCommonTaskType: mostCommonType,
      overallAccuracy: Math.round(overallAccuracy)
    };
  } catch (error) {
    console.error('Error getting learning summary:', error);
    return {
      totalTasksTracked: 0,
      uniqueTaskTypes: 0,
      mostCommonTaskType: null,
      overallAccuracy: 0
    };
  }
}

/**
 * Clear all learned time estimate data (use with caution!)
 */
export function clearLearnedData() {
  try {
    localStorage.removeItem('jamie_learned_time_estimates');
    localStorage.removeItem('jamie_task_completion_history');
    console.log('Jamie\'s learned time estimate data has been cleared');
  } catch (error) {
    console.error('Error clearing learned data:', error);
  }
}
