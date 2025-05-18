
import { useState, useEffect } from 'react';
import { supabase, Task, TaskAssignee, Profile } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface TaskWithAssignees extends Task {
  assignees: Profile[];
}

export interface Column {
  id: string;
  title: string;
  tasks: TaskWithAssignees[];
}

// Predefined columns for our kanban board
const DEFAULT_COLUMNS = [
  { id: 'backlog', title: 'Backlog', tasks: [] },
  { id: 'in-progress', title: 'In Progress', tasks: [] },
  { id: 'review', title: 'Review', tasks: [] },
  { id: 'completed', title: 'Completed', tasks: [] },
];

export function useTasks(projectId: string) {
  const [columns, setColumns] = useState<Column[]>([...DEFAULT_COLUMNS]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch all tasks for a project
  const fetchTasks = async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Get all tasks for this project
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          *
        `)
        .eq('project_id', projectId)
        .order('position', { ascending: true });
      
      if (tasksError) {
        throw tasksError;
      }
      
      // Get all task assignees
      const taskIds = tasksData?.map(task => task.id) || [];
      
      if (taskIds.length === 0) {
        // No tasks, set empty columns
        setColumns([...DEFAULT_COLUMNS]);
        return;
      }
      
      const { data: assigneesData, error: assigneesError } = await supabase
        .from('task_assignees')
        .select('task_id, user_id')
        .in('task_id', taskIds);
      
      if (assigneesError) {
        throw assigneesError;
      }
      
      // Get profiles for all assignees
      const userIds = [...new Set(assigneesData?.map(a => a.user_id) || [])];
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
      
      if (profilesError) {
        throw profilesError;
      }
      
      // Map tasks to their assignees
      const tasksWithAssignees = tasksData.map(task => {
        const taskAssigneeIds = assigneesData
          ?.filter(a => a.task_id === task.id)
          .map(a => a.user_id) || [];
          
        const assignees = profilesData
          ?.filter(p => taskAssigneeIds.includes(p.id)) || [];
        
        return { ...task, assignees };
      });
      
      // Group tasks by column
      const newColumns = DEFAULT_COLUMNS.map(column => {
        const columnTasks = tasksWithAssignees
          .filter(task => task.column_id === column.id)
          .sort((a, b) => a.position - b.position);
          
        return { ...column, tasks: columnTasks };
      });
      
      setColumns(newColumns);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks');
      toast({
        title: "Error loading tasks",
        description: "There was a problem loading tasks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Create a new task
  const createTask = async (
    title: string,
    description: string,
    dueDate: string,
    status: 'new' | 'active' | 'pending' | 'completed',
    assigneeIds: string[],
  ) => {
    try {
      // Determine column based on status
      let columnId = 'backlog';
      if (status === 'active') columnId = 'in-progress';
      else if (status === 'pending') columnId = 'review';
      else if (status === 'completed') columnId = 'completed';
      
      // Get max position in the column
      const { data: maxPosData } = await supabase
        .from('tasks')
        .select('position')
        .eq('project_id', projectId)
        .eq('column_id', columnId)
        .order('position', { ascending: false })
        .limit(1)
        .single();
        
      const position = maxPosData ? maxPosData.position + 1 : 0;
      
      // Create new task
      const { data: newTask, error: taskError } = await supabase
        .from('tasks')
        .insert({
          project_id: projectId,
          title,
          description,
          status,
          column_id: columnId,
          position,
          due_date: dueDate,
        })
        .select()
        .single();
      
      if (taskError) {
        throw taskError;
      }
      
      // Assign users to the task
      if (assigneeIds.length > 0) {
        const assigneesInsert = assigneeIds.map(userId => ({
          task_id: newTask.id,
          user_id: userId,
        }));
        
        const { error: assignError } = await supabase
          .from('task_assignees')
          .insert(assigneesInsert);
        
        if (assignError) {
          throw assignError;
        }
      }
      
      // Refresh task list
      fetchTasks();
      
      toast({
        title: "Task created",
        description: `Task "${title}" has been created.`,
      });
      
      return newTask.id;
    } catch (err) {
      console.error('Error creating task:', err);
      toast({
        title: "Error creating task",
        description: "There was a problem creating this task. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  // Update task status and column
  const updateTaskStatus = async (
    taskId: string,
    newStatus: 'new' | 'active' | 'pending' | 'completed',
    newColumnId: string,
    newPosition: number
  ) => {
    try {
      // Update the task
      const { error } = await supabase
        .from('tasks')
        .update({
          status: newStatus,
          column_id: newColumnId,
          position: newPosition,
        })
        .eq('id', taskId);
      
      if (error) {
        throw error;
      }
      
      // Apply optimistic update to avoid waiting for refresh
      setColumns(prevColumns => {
        // Find the task in the old column
        let taskToMove: TaskWithAssignees | undefined;
        let oldColumnId = '';
        
        const columnsWithoutTask = prevColumns.map(column => {
          const filteredTasks = column.tasks.filter(task => {
            if (task.id === taskId) {
              taskToMove = task;
              oldColumnId = column.id;
              return false;
            }
            return true;
          });
          
          return { ...column, tasks: filteredTasks };
        });
        
        if (!taskToMove) return prevColumns;
        
        // Add task to the new column with updated properties
        return columnsWithoutTask.map(column => {
          if (column.id === newColumnId) {
            // Update the moved task
            const updatedTask = {
              ...taskToMove!,
              status: newStatus,
              column_id: newColumnId,
              position: newPosition,
            };
            
            // Reposition other tasks if needed
            const updatedTasks = [...column.tasks];
            updatedTasks.splice(newPosition, 0, updatedTask);
            
            // Recalculate positions
            const reorderedTasks = updatedTasks.map((task, idx) => ({
              ...task,
              position: idx,
            }));
            
            return { ...column, tasks: reorderedTasks };
          }
          return column;
        });
      });
      
      return true;
    } catch (err) {
      console.error('Error updating task:', err);
      toast({
        title: "Error updating task",
        description: "There was a problem updating this task. Please try again.",
        variant: "destructive",
      });
      
      // Refresh to ensure UI is in sync with database
      fetchTasks();
      return false;
    }
  };

  // Update task details
  const updateTask = async (
    taskId: string,
    updates: {
      title?: string;
      description?: string;
      status?: 'new' | 'active' | 'pending' | 'completed';
      dueDate?: string;
      assigneeIds?: string[];
    }
  ) => {
    try {
      // Prepare task updates
      const taskUpdates: any = {};
      if (updates.title !== undefined) taskUpdates.title = updates.title;
      if (updates.description !== undefined) taskUpdates.description = updates.description;
      if (updates.status !== undefined) {
        taskUpdates.status = updates.status;
        
        // Update column_id based on status if status changes
        let columnId = '';
        if (updates.status === 'new') columnId = 'backlog';
        else if (updates.status === 'active') columnId = 'in-progress';
        else if (updates.status === 'pending') columnId = 'review';
        else if (updates.status === 'completed') columnId = 'completed';
        
        if (columnId) taskUpdates.column_id = columnId;
      }
      if (updates.dueDate !== undefined) taskUpdates.due_date = updates.dueDate;
      
      // Only update task if there are changes
      if (Object.keys(taskUpdates).length > 0) {
        const { error: taskError } = await supabase
          .from('tasks')
          .update(taskUpdates)
          .eq('id', taskId);
        
        if (taskError) {
          throw taskError;
        }
      }
      
      // Update assignees if provided
      if (updates.assigneeIds !== undefined) {
        // Remove existing assignees
        const { error: removeError } = await supabase
          .from('task_assignees')
          .delete()
          .eq('task_id', taskId);
        
        if (removeError) {
          throw removeError;
        }
        
        // Add new assignees
        if (updates.assigneeIds.length > 0) {
          const assignees = updates.assigneeIds.map(userId => ({
            task_id: taskId,
            user_id: userId,
          }));
          
          const { error: assignError } = await supabase
            .from('task_assignees')
            .insert(assignees);
          
          if (assignError) {
            throw assignError;
          }
        }
      }
      
      // Refresh tasks
      fetchTasks();
      
      toast({
        title: "Task updated",
        description: "The task has been updated successfully.",
      });
      
      return true;
    } catch (err) {
      console.error('Error updating task:', err);
      toast({
        title: "Error updating task",
        description: "There was a problem updating this task. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Delete a task
  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) {
        throw error;
      }
      
      // Apply optimistic update
      setColumns(prevColumns => 
        prevColumns.map(column => ({
          ...column,
          tasks: column.tasks.filter(task => task.id !== taskId)
        }))
      );
      
      toast({
        title: "Task deleted",
        description: "The task has been deleted successfully.",
      });
      
      return true;
    } catch (err) {
      console.error('Error deleting task:', err);
      toast({
        title: "Error deleting task",
        description: "There was a problem deleting this task. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Set up real-time subscription for tasks
  useEffect(() => {
    if (!projectId) return;
    
    // Subscribe to task changes
    const taskSubscription = supabase
      .channel(`project-${projectId}-tasks`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          // Refetch tasks when changes occur
          fetchTasks();
        }
      )
      .subscribe();
    
    // Subscribe to task assignee changes
    const assigneeSubscription = supabase
      .channel(`project-${projectId}-assignees`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'task_assignees',
        },
        () => {
          // Refetch tasks when assignee changes occur
          fetchTasks();
        }
      )
      .subscribe();
    
    // Initial fetch
    fetchTasks();
    
    return () => {
      // Clean up subscriptions
      supabase.removeChannel(taskSubscription);
      supabase.removeChannel(assigneeSubscription);
    };
  }, [projectId]);

  return {
    columns,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTaskStatus,
    updateTask,
    deleteTask,
  };
}
