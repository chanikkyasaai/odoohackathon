
import React, { useState, useEffect } from "react";
import { FuturisticNavbar } from "@/components/FuturisticNavbar";
import { GlassContainer } from "@/components/ui/glass-container";
import { StatusPill } from "@/components/ui/status-pill";
import { AvatarGroup } from "@/components/ui/avatar-group";
import { ProgressRing } from "@/components/ui/progress-ring";
import { FuturisticButton } from "@/components/ui/futuristic-button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DueDateAlert } from "@/components/ui/due-date-alert";
import { useToast } from "@/hooks/use-toast";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  Calendar, 
  ChevronLeft, 
  Clock, 
  Plus, 
  MessageSquare, 
  CalendarDays, 
  User, 
  Users, 
  Search,
  Trash,
  UserPlus,
  LogOut
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useTasks, Column, TaskWithAssignees } from "@/hooks/useTasks";

interface ProjectDetails {
  id: string;
  name: string;
  description: string;
  start_date: string;
  due_date: string;
  status: string;
  members: {
    id: string;
    name: string;
    image: string;
    role: string;
  }[];
  owner: {
    id: string;
    name: string;
    image: string;
  };
  tasks_completed: number;
  tasks_total: number;
}

export default function Project() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Task state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithAssignees | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterAssignee, setFilterAssignee] = useState<string | null>(null);
  
  // Task creation state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskStatus, setNewTaskStatus] = useState("new");
  const [newTaskAssignees, setNewTaskAssignees] = useState<string[]>([]);
  
  // Team management state
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  
  // Tasks from custom hook
  const { 
    columns, 
    loading: tasksLoading,
    createTask,
    updateTaskStatus,
    updateTask,
    deleteTask,
  } = useTasks(projectId || "");

  // Filtered columns
  const [filteredColumns, setFilteredColumns] = useState<Column[]>([]);
  
  // Apply filters when search term, status, or assignee changes
  useEffect(() => {
    const applyFilters = () => {
      const filtered = columns.map(column => {
        const filteredTasks = column.tasks.filter(task => {
          // Apply text search
          if (searchTerm && 
              !task.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
              !task.description.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
          }
          
          // Apply status filter
          if (filterStatus && task.status !== filterStatus) {
            return false;
          }
          
          // Apply assignee filter
          if (filterAssignee && 
              !task.assignees.some(assignee => assignee.id === filterAssignee)) {
            return false;
          }
          
          return true;
        });
        
        return {
          ...column,
          tasks: filteredTasks
        };
      });
      
      setFilteredColumns(filtered);
    };
    
    applyFilters();
  }, [searchTerm, filterStatus, filterAssignee, columns]);
  
  // Fetch project details
  const fetchProject = async () => {
    if (!projectId || !user) return;
    
    setLoading(true);
    
    try {
      // Check if user is a member of this project
      const { data: membership, error: memberError } = await supabase
        .from('project_members')
        .select('role')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .single();
      
      if (memberError) {
        toast({
          title: "Access denied",
          description: "You don't have access to this project",
          variant: "destructive",
        });
        navigate('/dashboard');
        return;
      }
      
      // Check if user is owner
      setIsOwner(membership?.role === 'owner');
      
      // Get project details
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select(`
          *,
          owner:owner_id(id, name, image)
        `)
        .eq('id', projectId)
        .single();
      
      if (projectError) {
        throw projectError;
      }
      
      // Get project members
      const { data: membersData, error: membersError } = await supabase
        .from('project_members')
        .select('user_id, role')
        .eq('project_id', projectId);
      
      if (membersError) {
        throw membersError;
      }
      
      // Get member profiles
      const memberIds = membersData?.map(m => m.user_id) || [];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', memberIds);
      
      if (profilesError) {
        throw profilesError;
      }
      
      // Combine member data with roles
      const membersWithRoles = profiles?.map(profile => ({
        ...profile,
        role: membersData?.find(m => m.user_id === profile.id)?.role || 'member'
      })) || [];
      
      // Get task counts
      const { count: totalTasks } = await supabase
        .from('tasks')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', projectId);
        
      const { count: completedTasks } = await supabase
        .from('tasks')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', projectId)
        .eq('status', 'completed');
      
      // Set project with combined data
      setProject({
        ...projectData,
        members: membersWithRoles,
        tasks_completed: completedTasks || 0,
        tasks_total: totalTasks || 0,
      });
    } catch (error) {
      console.error('Error fetching project:', error);
      toast({
        title: "Error loading project",
        description: "There was a problem loading the project details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Load project on mount
  useEffect(() => {
    if (projectId && user) {
      fetchProject();
    }
  }, [projectId, user]);
  
  // Handle task click
  const handleTaskClick = (task: TaskWithAssignees) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };
  
  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus(null);
    setFilterAssignee(null);
  };
  
  // Handle task creation
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTaskTitle || !newTaskDueDate) return;
    
    const status = newTaskStatus as 'new' | 'active' | 'pending' | 'completed';
    
    await createTask(
      newTaskTitle,
      newTaskDescription,
      newTaskDueDate,
      status,
      newTaskAssignees
    );
    
    // Reset form and close modal
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskDueDate("");
    setNewTaskStatus("new");
    setNewTaskAssignees([]);
    setIsTaskModalOpen(false);
  };
  
  // Handle task update
  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTask) return;
    
    await updateTask(selectedTask.id, {
      title: newTaskTitle,
      description: newTaskDescription,
      status: newTaskStatus as any,
      dueDate: newTaskDueDate,
      assigneeIds: newTaskAssignees,
    });
    
    // Close modal
    setIsTaskModalOpen(false);
  };
  
  // Handle task delete
  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    
    const confirmed = window.confirm("Are you sure you want to delete this task?");
    
    if (confirmed) {
      await deleteTask(selectedTask.id);
      setIsTaskModalOpen(false);
    }
  };
  
  // Handle invite team member
  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectId || !inviteEmail) return;
    
    try {
      // Check if user exists
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', inviteEmail)
        .single();
      
      if (userError) {
        toast({
          title: "User not found",
          description: `No user found with email ${inviteEmail}`,
          variant: "destructive",
        });
        return;
      }
      
      // Check if already a member
      const { data: existingMember, error: existingError } = await supabase
        .from('project_members')
        .select('id')
        .eq('project_id', projectId)
        .eq('user_id', userData.id)
        .single();
      
      if (!existingError && existingMember) {
        toast({
          title: "User already member",
          description: "This user is already a member of this project",
          variant: "destructive",
        });
        return;
      }
      
      // Add as member
      const { error: addError } = await supabase
        .from('project_members')
        .insert({
          project_id: projectId,
          user_id: userData.id,
          role: inviteRole,
        });
      
      if (addError) {
        throw addError;
      }
      
      // Refresh project
      fetchProject();
      
      toast({
        title: "Member added",
        description: `Successfully added ${inviteEmail} to project`,
      });
      
      // Reset form
      setInviteEmail("");
      setInviteRole("member");
    } catch (error) {
      console.error('Error inviting member:', error);
      toast({
        title: "Error adding member",
        description: "There was a problem adding this member",
        variant: "destructive",
      });
    }
  };
  
  // Handle remove team member
  const handleRemoveMember = async (memberId: string) => {
    if (!projectId || !isOwner) return;
    
    try {
      // Don't allow removing self if only owner
      if (memberId === user?.id) {
        const { data: owners } = await supabase
          .from('project_members')
          .select('user_id')
          .eq('project_id', projectId)
          .eq('role', 'owner');
          
        if (owners?.length === 1) {
          toast({
            title: "Cannot remove owner",
            description: "You cannot remove yourself as the only owner",
            variant: "destructive",
          });
          return;
        }
      }
      
      // Remove member
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', memberId);
      
      if (error) {
        throw error;
      }
      
      // Refresh project
      fetchProject();
      
      toast({
        title: "Member removed",
        description: "Team member has been removed",
      });
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Error removing member",
        description: "There was a problem removing this member",
        variant: "destructive",
      });
    }
  };
  
  // Handle leaving project
  const handleLeaveProject = async () => {
    if (!projectId || !user) return;
    
    // Confirm before leaving
    const confirmed = window.confirm("Are you sure you want to leave this project?");
    
    if (!confirmed) return;
    
    try {
      // Check if user is the only owner
      if (isOwner) {
        const { data: owners } = await supabase
          .from('project_members')
          .select('user_id')
          .eq('project_id', projectId)
          .eq('role', 'owner');
          
        if (owners?.length === 1) {
          toast({
            title: "Cannot leave project",
            description: "You are the only owner. Transfer ownership or delete the project first",
            variant: "destructive",
          });
          return;
        }
      }
      
      // Leave project
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', user.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Left project",
        description: "You have left the project successfully",
      });
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error leaving project:', error);
      toast({
        title: "Error leaving project",
        description: "There was a problem leaving the project",
        variant: "destructive",
      });
    }
  };
  
  // Handle delete project
  const handleDeleteProject = async () => {
    if (!projectId || !isOwner) return;
    
    // Confirm before deletion
    const confirmed = window.confirm("Are you sure you want to delete this project? This action cannot be undone.");
    
    if (!confirmed) return;
    
    try {
      // Delete project
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Project deleted",
        description: "The project has been deleted successfully",
      });
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error deleting project",
        description: "There was a problem deleting the project",
        variant: "destructive",
      });
    }
  };
  
  // Drag and drop handlers for tasks
  const handleDragStart = (e: React.DragEvent, taskId: string, sourceColumnId: string) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.setData('sourceColumnId', sourceColumnId);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDrop = async (e: React.DragEvent, targetColumnId: string, position: number) => {
    e.preventDefault();
    
    const taskId = e.dataTransfer.getData('taskId');
    const sourceColumnId = e.dataTransfer.getData('sourceColumnId');
    
    if (sourceColumnId === targetColumnId) return;
    
    // Find the task and its current status
    let task: TaskWithAssignees | undefined;
    let newStatus: 'new' | 'active' | 'pending' | 'completed' = 'new';
    
    columns.forEach(column => {
      column.tasks.forEach(t => {
        if (t.id === taskId) {
          task = t;
        }
      });
    });
    
    if (!task) return;
    
    // Map column ID to status
    if (targetColumnId === 'backlog') newStatus = 'new';
    else if (targetColumnId === 'in-progress') newStatus = 'active';
    else if (targetColumnId === 'review') newStatus = 'pending';
    else if (targetColumnId === 'completed') newStatus = 'completed';
    
    // Update task status
    await updateTaskStatus(taskId, newStatus, targetColumnId, position);
  };
  
  // If loading, show loading state
  if (loading || !project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-synergy-cyan border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-synergy-cyan">Loading project...</p>
      </div>
    );
  }
  
  // Initialize task modal with selected task data if editing
  const openTaskModal = (task?: TaskWithAssignees) => {
    if (task) {
      setSelectedTask(task);
      setNewTaskTitle(task.title);
      setNewTaskDescription(task.description);
      setNewTaskDueDate(task.due_date.split('T')[0]); // Format date
      setNewTaskStatus(task.status);
      setNewTaskAssignees(task.assignees.map(a => a.id));
    } else {
      setSelectedTask(null);
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskDueDate("");
      setNewTaskStatus("new");
      setNewTaskAssignees([]);
    }
    
    setIsTaskModalOpen(true);
  };
  
  return (
    <div className="min-h-screen pb-20">
      <FuturisticNavbar currentUser={{ name: user?.name || "User", image: user?.image || "" }} />
      
      <main className="container pt-24 px-4 md:px-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-muted-foreground hover:text-synergy-cyan transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold tracking-wider">{project.name}</h1>
            <StatusPill status={project.status as any} pulse={project.status === "active"} className="ml-2" />
          </div>
          
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            {isOwner && (
              <FuturisticButton
                variant="outline"
                size="sm"
                iconLeft={<Users className="h-4 w-4" />}
                onClick={() => setIsTeamModalOpen(true)}
              >
                Manage Team
              </FuturisticButton>
            )}
            
            <FuturisticButton
              variant="primary"
              glow="cyan"
              iconLeft={<Plus className="h-4 w-4" />}
              onClick={() => openTaskModal()}
            >
              Add Task
            </FuturisticButton>
          </div>
        </div>
        
        {/* Project Info Card */}
        <GlassContainer className="p-5 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <h2 className="text-lg font-medium mb-2">Project Overview</h2>
              <p className="text-muted-foreground text-sm mb-4">{project.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Start Date</p>
                  <p className="text-sm font-medium flex items-center gap-1 mt-1">
                    <CalendarDays className="h-3 w-3" />
                    {new Date(project.start_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Due Date</p>
                  <p className="text-sm font-medium flex items-center gap-1 mt-1">
                    <CalendarDays className="h-3 w-3" />
                    {new Date(project.due_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tasks</p>
                  <p className="text-sm font-medium mt-1">
                    {project.tasks_completed}/{project.tasks_total} completed
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Team</p>
                  <div className="mt-1">
                    <AvatarGroup users={project.members} size="sm" />
                  </div>
                </div>
              </div>
              
              {/* Due date alert */}
              {project.status !== 'completed' && (
                <div className="mt-4">
                  <DueDateAlert dueDate={new Date(project.due_date)} />
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-center">
              <div className="relative flex flex-col items-center">
                <ProgressRing 
                  progress={project.tasks_total > 0 
                    ? Math.round((project.tasks_completed / project.tasks_total) * 100)
                    : 0
                  }
                  size={80} 
                  strokeWidth={6} 
                  showPercentage={true}
                />
                <p className="mt-2 text-sm font-medium">Overall Progress</p>
              </div>
            </div>
          </div>
          
          {/* Project actions */}
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-end">
            {!isOwner && (
              <FuturisticButton
                variant="ghost"
                size="sm"
                iconLeft={<LogOut className="h-4 w-4" />}
                onClick={handleLeaveProject}
              >
                Leave Project
              </FuturisticButton>
            )}
            
            {isOwner && (
              <FuturisticButton
                variant="ghost"
                size="sm"
                iconLeft={<Trash className="h-4 w-4" />}
                onClick={handleDeleteProject}
                className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
              >
                Delete Project
              </FuturisticButton>
            )}
          </div>
        </GlassContainer>
        
        {/* Filter & Search Bar */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
            <h2 className="text-xl font-medium tracking-wide">Tasks</h2>
            
            <div className="flex flex-wrap gap-3 items-center">
              {/* Search field */}
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-md py-2 pl-9 pr-3 text-sm"
                />
              </div>
              
              {/* Status filter */}
              <select
                value={filterStatus || ""}
                onChange={(e) => setFilterStatus(e.target.value || null)}
                className="bg-white/5 border border-white/10 rounded-md py-2 px-3 text-sm"
              >
                <option value="">All Statuses</option>
                <option value="new">New</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
              
              {/* Assignee filter */}
              <select
                value={filterAssignee || ""}
                onChange={(e) => setFilterAssignee(e.target.value || null)}
                className="bg-white/5 border border-white/10 rounded-md py-2 px-3 text-sm"
              >
                <option value="">All Assignees</option>
                {project.members.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
              
              {/* Clear filters button */}
              {(searchTerm || filterStatus || filterAssignee) && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-synergy-cyan hover:text-synergy-cyan/80"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Kanban Board */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 overflow-x-auto pb-4">
          {filteredColumns.map(column => (
            <div 
              key={column.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id, column.tasks.length)}
            >
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-sm font-medium tracking-wider text-muted-foreground uppercase">
                  {column.title}
                </h3>
                <span className="bg-white/10 text-xs rounded-full px-2 py-0.5">
                  {column.tasks.length}
                </span>
              </div>
              
              <div className="space-y-4">
                {column.tasks.map((task, index) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id, column.id)}
                    onClick={() => handleTaskClick(task)}
                    className="glass-card p-4 cursor-pointer transform transition-all duration-300 hover:translate-y-[-4px]"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{task.title}</h4>
                      <StatusPill status={task.status} />
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
                      {task.description}
                    </p>
                    
                    {/* Due date alert for overdue or today's tasks */}
                    {task.status !== "completed" && (
                      <DueDateAlert 
                        dueDate={new Date(task.due_date)} 
                        className="mb-3 py-2"
                      />
                    )}
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(task.due_date).toLocaleDateString()}
                      </div>
                      
                      <AvatarGroup 
                        users={task.assignees} 
                        size="xs" 
                      />
                    </div>
                  </div>
                ))}
                
                {column.id === "backlog" && (
                  <button
                    onClick={() => openTaskModal()}
                    className="w-full p-2 border border-dashed border-white/20 rounded-lg flex items-center justify-center gap-1 text-sm text-muted-foreground hover:border-synergy-cyan/30 hover:text-synergy-cyan transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Add Task
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
      
      {/* Task Detail/Creation Modal */}
      <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
        <DialogContent className="bg-synergy-navy/95 backdrop-blur-xl border-white/10 text-white max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-medium tracking-wide">
              {selectedTask ? "Edit Task" : "Create New Task"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={selectedTask ? handleUpdateTask : handleCreateTask} className="mt-4">
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Title</label>
                <input 
                  className="w-full bg-white/5 border border-white/10 rounded-md p-2" 
                  placeholder="Task title"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                <textarea 
                  className="w-full bg-white/5 border border-white/10 rounded-md p-2 h-24" 
                  placeholder="Task description"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                ></textarea>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Status</label>
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-md p-2"
                    value={newTaskStatus}
                    onChange={(e) => setNewTaskStatus(e.target.value)}
                    required
                  >
                    <option value="new">New</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Due Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input 
                      type="date" 
                      className="w-full bg-white/5 border border-white/10 rounded-md p-2 pl-8" 
                      value={newTaskDueDate}
                      onChange={(e) => setNewTaskDueDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Assign To (Select multiple)</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {project.members.map(member => (
                    <label key={member.id} className="flex items-center gap-2 px-3 py-2 rounded-md bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="rounded border-white/30 bg-transparent h-4 w-4 text-synergy-cyan focus:ring-0 focus:ring-offset-0"
                        checked={newTaskAssignees.includes(member.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewTaskAssignees([...newTaskAssignees, member.id]);
                          } else {
                            setNewTaskAssignees(newTaskAssignees.filter(id => id !== member.id));
                          }
                        }}
                      />
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={member.image} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{member.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between pt-4">
                <div>
                  {selectedTask && (
                    <FuturisticButton 
                      variant="ghost" 
                      type="button"
                      onClick={handleDeleteTask}
                      className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                    >
                      Delete
                    </FuturisticButton>
                  )}
                </div>
                <div className="flex gap-3">
                  <FuturisticButton 
                    variant="ghost" 
                    type="button"
                    onClick={() => setIsTaskModalOpen(false)}
                  >
                    Cancel
                  </FuturisticButton>
                  
                  <FuturisticButton 
                    variant="primary"
                    glow="cyan"
                    iconLeft={selectedTask ? undefined : <Plus className="h-4 w-4" />}
                    type="submit"
                  >
                    {selectedTask ? "Save Changes" : "Create Task"}
                  </FuturisticButton>
                </div>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Team Management Modal */}
      <Dialog open={isTeamModalOpen} onOpenChange={setIsTeamModalOpen}>
        <DialogContent className="bg-synergy-navy/95 backdrop-blur-xl border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-medium tracking-wide">Team Members</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Manage team members for {project.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Current Team</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {project.members.map(member => (
                <div 
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-md bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.image} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">Role: {member.role}</p>
                    </div>
                  </div>
                  
                  {isOwner && member.id !== user?.id && (
                    <FuturisticButton
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      Remove
                    </FuturisticButton>
                  )}
                </div>
              ))}
            </div>
            
            {isOwner && (
              <>
                <h3 className="text-sm font-medium mt-6 mb-2">Add New Member</h3>
                <form onSubmit={handleInviteMember} className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Email Address</label>
                    <input 
                      type="email"
                      className="w-full bg-white/5 border border-white/10 rounded-md p-2" 
                      placeholder="user@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Role</label>
                    <select
                      className="w-full bg-white/5 border border-white/10 rounded-md p-2"
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                    >
                      <option value="member">Member</option>
                      <option value="owner">Owner</option>
                    </select>
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-2">
                    <FuturisticButton 
                      variant="ghost" 
                      type="button"
                      onClick={() => setIsTeamModalOpen(false)}
                    >
                      Cancel
                    </FuturisticButton>
                    <FuturisticButton 
                      variant="primary"
                      glow="cyan"
                      iconLeft={<UserPlus className="h-4 w-4" />}
                      type="submit"
                    >
                      Add Member
                    </FuturisticButton>
                  </div>
                </form>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
