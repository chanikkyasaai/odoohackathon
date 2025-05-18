
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface DueDateAlert {
  id: string;
  title: string;
  projectId: string;
  projectName: string;
  dueDate: string;
  overdue: boolean;
  type: 'project' | 'task';
}

export function useDueDateAlerts(userId: string | undefined) {
  const [alerts, setAlerts] = useState<DueDateAlert[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;
    
    const checkForAlerts = async () => {
      try {
        const today = new Date();
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(today.getDate() + 3);
        
        // Get user's projects
        const { data: projectMembers } = await supabase
          .from('project_members')
          .select('project_id')
          .eq('user_id', userId);
        
        if (!projectMembers || projectMembers.length === 0) return;
        
        const projectIds = projectMembers.map(pm => pm.project_id);
        
        // Get projects with upcoming due dates
        const { data: projects } = await supabase
          .from('projects')
          .select('id, name, due_date')
          .in('id', projectIds)
          .or(`due_date.lte.${threeDaysFromNow.toISOString()}`);
        
        // Get tasks assigned to user with upcoming due dates
        const { data: taskAssignees } = await supabase
          .from('task_assignees')
          .select('task_id')
          .eq('user_id', userId);
        
        if (!taskAssignees || taskAssignees.length === 0) return;
        
        const taskIds = taskAssignees.map(ta => ta.task_id);
        
        // Get tasks with upcoming due dates
        const { data: tasks } = await supabase
          .from('tasks')
          .select('id, title, project_id, due_date')
          .in('id', taskIds)
          .or(`due_date.lte.${threeDaysFromNow.toISOString()}`);
        
        // Get project names for tasks
        const taskProjectIds = [...new Set(tasks?.map(t => t.project_id) || [])];
        
        const { data: taskProjects } = await supabase
          .from('projects')
          .select('id, name')
          .in('id', taskProjectIds);
        
        const projectMap = Object.fromEntries(
          taskProjects?.map(p => [p.id, p.name]) || []
        );
        
        // Combine alerts
        const newAlerts: DueDateAlert[] = [];
        
        // Add project alerts
        if (projects) {
          projects.forEach(project => {
            const dueDate = new Date(project.due_date);
            const overdue = dueDate < today;
            const soonDue = !overdue && dueDate <= threeDaysFromNow;
            
            if (overdue || soonDue) {
              newAlerts.push({
                id: `project-${project.id}`,
                title: project.name,
                projectId: project.id,
                projectName: project.name,
                dueDate: project.due_date,
                overdue,
                type: 'project'
              });
              
              // Show toast for overdue or today's projects
              if (overdue || isToday(dueDate)) {
                toast({
                  title: overdue ? "Project Overdue" : "Project Due Today",
                  description: `${project.name} is ${overdue ? 'overdue' : 'due today'} (${new Date(project.due_date).toLocaleDateString()})`,
                  variant: overdue ? "destructive" : "default",
                });
              }
            }
          });
        }
        
        // Add task alerts
        if (tasks) {
          tasks.forEach(task => {
            const dueDate = new Date(task.due_date);
            const overdue = dueDate < today;
            const soonDue = !overdue && dueDate <= threeDaysFromNow;
            
            if (overdue || soonDue) {
              newAlerts.push({
                id: `task-${task.id}`,
                title: task.title,
                projectId: task.project_id,
                projectName: projectMap[task.project_id] || "Unknown Project",
                dueDate: task.due_date,
                overdue,
                type: 'task'
              });
              
              // Show toast for overdue or today's tasks
              if (overdue || isToday(dueDate)) {
                toast({
                  title: overdue ? "Task Overdue" : "Task Due Today",
                  description: `Task "${task.title}" in ${projectMap[task.project_id]} is ${overdue ? 'overdue' : 'due today'}`,
                  variant: overdue ? "destructive" : "default",
                });
              }
            }
          });
        }
        
        setAlerts(newAlerts);
      } catch (error) {
        console.error('Error checking due dates:', error);
      }
    };
    
    // Helper to check if date is today
    const isToday = (date: Date) => {
      const today = new Date();
      return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
    };
    
    // Check immediately on mount
    checkForAlerts();
    
    // Check periodically (every 12 hours)
    const interval = setInterval(checkForAlerts, 12 * 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [userId, toast]);

  return { alerts };
}
