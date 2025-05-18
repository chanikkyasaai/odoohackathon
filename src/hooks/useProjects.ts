import { useState, useEffect } from 'react';
import { supabase, Project, ProjectMember, Profile } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ProjectWithMeta extends Project {
  owner: Profile;
  members: Profile[];
  tasks_completed: number;
  tasks_total: number;
}

export function useProjects() {
  const [projects, setProjects] = useState<ProjectWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch projects for the current user
  const fetchProjects = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Get all projects where the user is a member
      const { data: memberProjects, error: memberError } = await supabase
        .from('project_members')
        .select('project_id')
        .eq('user_id', user.id);
      
      if (memberError) {
        throw memberError;
      }
      
      if (!memberProjects.length) {
        setProjects([]);
        return;
      }
      
      // Get project ids
      const projectIds = memberProjects.map(mp => mp.project_id);
      
      // Get project details
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          *,
          owner:owner_id(id, name, image)
        `)
        .in('id', projectIds);
        
      if (projectsError) {
        throw projectsError;
      }

      // Extend project data with members and task counts
      const extendedProjects = await Promise.all(projectsData.map(async (project) => {
        // Get project members
        const { data: membersData } = await supabase
          .from('project_members')
          .select('user_id')
          .eq('project_id', project.id);
        
        // Get user profiles for members
        const memberIds = membersData?.map(m => m.user_id) || [];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .in('id', memberIds);

        // Get task statistics
        const { count: totalTasks } = await supabase
          .from('tasks')
          .select('id', { count: 'exact', head: true })
          .eq('project_id', project.id);
          
        const { count: completedTasks } = await supabase
          .from('tasks')
          .select('id', { count: 'exact', head: true })
          .eq('project_id', project.id)
          .eq('status', 'completed');
        
        return {
          ...project,
          members: profiles || [],
          tasks_completed: completedTasks || 0,
          tasks_total: totalTasks || 0,
        };
      }));
      
      setProjects(extendedProjects as ProjectWithMeta[]);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects');
      toast({
        title: "Error loading projects",
        description: "There was a problem loading your projects. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create a new project
  const createProject = async (
    name: string,
    description: string,
    startDate: string,
    dueDate: string,
    tags: string[] = [],
    priority: string = 'medium',
    manager_id: string | null = null,
    image: string | null = null
  ): Promise<string | null> => {
    if (!user) return null;
    try {
      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert({
          name,
          description,
          start_date: startDate,
          due_date: dueDate,
          status: 'new',
          owner_id: user.id,
          tags,
          priority,
          manager_id,
          image
        })
        .select()
        .single();
      if (projectError) {
        throw projectError;
      }
      // Add current user as project member with owner role
      const { error: memberError } = await supabase
        .from('project_members')
        .insert({
          project_id: newProject.id,
          user_id: user.id,
          role: 'owner',
        });
      if (memberError) {
        throw memberError;
      }
      fetchProjects();
      toast({
        title: "Project created",
        description: `Your new project "${name}" has been created.`,
      });
      return newProject.id;
    } catch (err) {
      console.error('Error creating project:', err);
      toast({
        title: "Error creating project",
        description: "There was a problem creating your project. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  // Add member to project
  const addProjectMember = async (projectId: string, email: string, role: 'owner' | 'member' = 'member') => {
    try {
      // Check if user exists
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();
      
      if (userError) {
        toast({
          title: "User not found",
          description: `No user found with email ${email}`,
          variant: "destructive",
        });
        return false;
      }
      
      // Check if already a member
      const { data: existingMember, error: existingError } = await supabase
        .from('project_members')
        .select('id')
        .eq('project_id', projectId)
        .eq('user_id', userData.id)
        .single();
      
      if (existingMember) {
        toast({
          title: "User already member",
          description: "This user is already a member of this project",
          variant: "destructive",
        });
        return false;
      }
      
      // Add as member
      const { error: addError } = await supabase
        .from('project_members')
        .insert({
          project_id: projectId,
          user_id: userData.id,
          role,
        });
      
      if (addError) {
        throw addError;
      }
      
      // Refresh projects
      fetchProjects();
      
      toast({
        title: "Member added",
        description: `Successfully added ${email} to project`,
      });
      
      return true;
    } catch (err) {
      console.error('Error adding project member:', err);
      toast({
        title: "Error adding member",
        description: "There was a problem adding this member. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Remove member from project
  const removeProjectMember = async (projectId: string, userId: string) => {
    try {
      // Only allow removal if current user is owner
      const isOwner = await supabase
        .from('project_members')
        .select('role')
        .eq('project_id', projectId)
        .eq('user_id', user?.id)
        .eq('role', 'owner')
        .single();
        
      if (!isOwner) {
        toast({
          title: "Permission denied",
          description: "Only project owners can remove members",
          variant: "destructive",
        });
        return false;
      }
      
      // Don't allow removing the last owner
      if (isOwner) {
        const { data: owners } = await supabase
          .from('project_members')
          .select('user_id')
          .eq('project_id', projectId)
          .eq('role', 'owner');
          
        if (owners?.length === 1 && owners[0].user_id === userId) {
          toast({
            title: "Cannot remove owner",
            description: "You cannot remove the last owner of a project",
            variant: "destructive",
          });
          return false;
        }
      }
      
      // Remove member
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', userId);
      
      if (error) {
        throw error;
      }
      
      // Refresh projects
      fetchProjects();
      
      toast({
        title: "Member removed",
        description: "Project member has been removed",
      });
      
      return true;
    } catch (err) {
      console.error('Error removing project member:', err);
      toast({
        title: "Error removing member",
        description: "There was a problem removing this member. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Delete project
  const deleteProject = async (projectId: string) => {
    try {
      // Check ownership
      const { data: membership, error: memberError } = await supabase
        .from('project_members')
        .select('role')
        .eq('project_id', projectId)
        .eq('user_id', user?.id)
        .single();
      
      if (memberError || membership?.role !== 'owner') {
        toast({
          title: "Permission denied",
          description: "Only project owners can delete projects",
          variant: "destructive",
        });
        return false;
      }
      
      // Delete project
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);
      
      if (error) {
        throw error;
      }
      
      // Refresh projects list
      fetchProjects();
      
      toast({
        title: "Project deleted",
        description: "The project has been deleted successfully",
      });
      
      return true;
    } catch (err) {
      console.error('Error deleting project:', err);
      toast({
        title: "Error deleting project",
        description: "There was a problem deleting the project. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Load projects on user change
  useEffect(() => {
    if (user) {
      fetchProjects();
    } else {
      setProjects([]);
      setLoading(false);
    }
  }, [user]);

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    addProjectMember,
    removeProjectMember,
    deleteProject,
  };
}

// Ensure that the RLS policies for the 'project_members' table do not reference themselves in a way that causes recursion.
// This might involve checking the Supabase dashboard or the SQL setup for the database.

// Ensure that all API requests include the necessary authentication headers or parameters to avoid 500 errors.
// This might involve checking the Supabase client setup or the network requests being made.
