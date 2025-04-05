export const calculateObjectiveProgress = (objective, tasks, completedTasks) => {
    if (!objective.tasks || objective.tasks.length === 0) {
      if (objective.completedItems && objective.completedItems.length > 0) {
        const totalPercentage = objective.completedItems.reduce((sum, item) => sum + (item.percentage || 0), 0);
        return Math.min(100, totalPercentage / objective.completedItems.length);
      }
      return objective.progress || 0;
    }
  
    const relatedTasks = tasks.filter(task => objective.tasks.includes(task.id));
    const relatedCompletedTasks = completedTasks.filter(task => objective.tasks.includes(task.id));
  
    const totalTasks = relatedTasks.length + relatedCompletedTasks.length;
    if (totalTasks === 0) return objective.progress || 0;
  
    const totalPercentage = relatedTasks.reduce((sum, task) => sum + (task.percentage || 0), 0) + 
                           relatedCompletedTasks.reduce((sum, task) => sum + (task.percentage || 100), 0);
  
    return Math.min(100, (totalPercentage / totalTasks) || 0);
  };