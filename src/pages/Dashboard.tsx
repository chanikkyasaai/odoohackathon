import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FuturisticNavbar } from "@/components/FuturisticNavbar";
import { GlassContainer } from "@/components/ui/glass-container";
import { StatusPill } from "@/components/ui/status-pill";
import { AvatarGroup } from "@/components/ui/avatar-group";
import { ProgressRing } from "@/components/ui/progress-ring";
import { FuturisticButton } from "@/components/ui/futuristic-button";
import { 
  CalendarDays, 
  Plus, 
  ArrowRight, 
  Bell, 
  MessageSquare, 
  Clock, 
  CheckSquare,
  Search, 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useProjects, ProjectWithMeta } from "@/hooks/useProjects";
import { useDueDateAlerts } from "@/hooks/useDueDateAlerts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Mock data
const projects = [
  {
    id: "1",
    name: "Marketing Campaign Q3",
    description: "Develop digital marketing strategy for Q3 launch",
    progress: 68,
    tasks: { completed: 24, total: 36 },
    dueDate: "2025-08-15",
    status: "active",
    team: [
      { id: "u1", name: "Alex Morgan", image: "https://i.pravatar.cc/150?img=32" },
      { id: "u2", name: "Jamie Chen", image: "https://i.pravatar.cc/150?img=29" },
      { id: "u3", name: "Taylor Kim", image: "https://i.pravatar.cc/150?img=37" },
      { id: "u4", name: "Jordan Smith", image: "https://i.pravatar.cc/150?img=13" },
    ],
    owner: { id: "u1", name: "Alex Morgan", image: "https://i.pravatar.cc/150?img=32" }
  },
  {
    id: "2",
    name: "Product Redesign",
    description: "UX/UI redesign for core product features",
    progress: 42,
    tasks: { completed: 10, total: 23 },
    dueDate: "2025-09-01",
    status: "pending",
    team: [
      { id: "u1", name: "Alex Morgan", image: "https://i.pravatar.cc/150?img=32" },
      { id: "u5", name: "Casey Jones", image: "https://i.pravatar.cc/150?img=16" },
      { id: "u6", name: "Riley Brown", image: "https://i.pravatar.cc/150?img=10" },
    ],
    owner: { id: "u1", name: "Alex Morgan", image: "https://i.pravatar.cc/150?img=32" }
  },
  {
    id: "3",
    name: "Mobile App Development",
    description: "iOS/Android app for customer engagement",
    progress: 89,
    tasks: { completed: 45, total: 51 },
    dueDate: "2025-07-22",
    status: "completed",
    team: [
      { id: "u7", name: "Sam Johnson", image: "https://i.pravatar.cc/150?img=50" },
      { id: "u8", name: "Drew Davis", image: "https://i.pravatar.cc/150?img=60" },
      { id: "u9", name: "Quinn Lee", image: "https://i.pravatar.cc/150?img=57" },
      { id: "u10", name: "Avery Smith", image: "https://i.pravatar.cc/150?img=20" },
      { id: "u11", name: "Morgan Taylor", image: "https://i.pravatar.cc/150?img=31" },
    ],
    owner: { id: "u7", name: "Sam Johnson", image: "https://i.pravatar.cc/150?img=50" }
  },
  {
    id: "4",
    name: "Client Presentation",
    description: "Prepare slides and demo for enterprise clients",
    progress: 22,
    tasks: { completed: 3, total: 14 },
    dueDate: "2025-08-07",
    status: "new",
    team: [
      { id: "u1", name: "Alex Morgan", image: "https://i.pravatar.cc/150?img=32" },
      { id: "u2", name: "Jamie Chen", image: "https://i.pravatar.cc/150?img=29" },
    ],
    owner: { id: "u1", name: "Alex Morgan", image: "https://i.pravatar.cc/150?img=32" }
  },
];

const recentActivity = [
  {
    id: "a1",
    type: "comment",
    project: "Marketing Campaign Q3",
    user: { id: "u2", name: "Jamie Chen", image: "https://i.pravatar.cc/150?img=29" },
    time: "10 minutes ago",
    content: "Added new marketing assets to the shared drive"
  },
  {
    id: "a2",
    type: "task",
    project: "Mobile App Development",
    user: { id: "u9", name: "Quinn Lee", image: "https://i.pravatar.cc/150?img=57" },
    time: "45 minutes ago",
    content: "Completed UI implementation for profile screen"
  },
  {
    id: "a3",
    type: "notification",
    project: "Product Redesign",
    user: { id: "u5", name: "Casey Jones", image: "https://i.pravatar.cc/150?img=16" },
    time: "2 hours ago",
    content: "Scheduled design review for tomorrow @ 2pm"
  }
];

const upcomingTasks = [
  {
    id: "t1",
    title: "Finalize Q3 Marketing Budget",
    project: "Marketing Campaign Q3",
    dueDate: "Tomorrow, 5:00 PM",
    priority: "high"
  },
  {
    id: "t2",
    title: "Review Design Prototypes",
    project: "Product Redesign",
    dueDate: "Today, 3:00 PM",
    priority: "medium"
  },
  {
    id: "t3",
    title: "Prepare API Documentation",
    project: "Mobile App Development",
    dueDate: "Friday, 12:00 PM",
    priority: "low"
  }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects, loading, createProject } = useProjects();
  const { alerts } = useDueDateAlerts(user?.id);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [filteredProjects, setFilteredProjects] = useState<ProjectWithMeta[]>([]);
  
  // New project dialog state
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [newProjectStartDate, setNewProjectStartDate] = useState("");
  const [newProjectDueDate, setNewProjectDueDate] = useState("");
  
  // Search and filter projects
  useEffect(() => {
    if (!projects) return;
    
    const filtered = projects.filter(project => {
      // Apply text search
      if (searchTerm && 
          !project.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !project.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Apply status filter
      if (statusFilter && project.status !== statusFilter) {
        return false;
      }
      
      return true;
    });
    
    setFilteredProjects(filtered);
  }, [searchTerm, statusFilter, projects]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
  };
  
  // Handle new project creation
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProjectName || !newProjectDescription || !newProjectStartDate || !newProjectDueDate) {
      return;
    }
    
    const projectId = await createProject(
      newProjectName,
      newProjectDescription,
      newProjectStartDate,
      newProjectDueDate
    );
    
    if (projectId) {
      setIsNewProjectOpen(false);
      navigate(`/projects/${projectId}`);
    }
  };

  // If loading, show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-synergy-cyan border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-synergy-cyan">Loading projects...</p>
      </div>
    );
  }

  // If no user, redirect to login (though this should be caught by protected route)
  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Redirecting to login...</div>;
  }

  // Use Supabase user data instead of hardcoded one
  const currentUser = {
    name: user.name,
    image: user.image,
  };

  return (
    <div className="min-h-screen pb-20">
      <FuturisticNavbar currentUser={currentUser} />
      
      <main className="container pt-24 px-4 md:px-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-wider mb-2">Welcome back, {user.name.split(' ')[0]}</h1>
            <p className="text-muted-foreground">Your workspace is operating at optimal efficiency</p>
          </div>
          
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <FuturisticButton
              variant="outline"
              size="sm"
              iconLeft={<CalendarDays className="h-4 w-4" />}
            >
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </FuturisticButton>
            
            <FuturisticButton
              variant="primary"
              glow="cyan"
              iconLeft={<Plus className="h-4 w-4" />}
              onClick={() => setIsNewProjectOpen(true)}
            >
              New Project
            </FuturisticButton>
          </div>
        </div>
        
        {/* Filter & Search Bar */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4 justify-between items-start md:items-center">
            <h2 className="text-xl font-medium tracking-wide">Current Projects</h2>
            
            <div className="flex flex-wrap gap-3 items-center">
              {/* Search field */}
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-md py-2 pl-9 pr-3 text-sm"
                />
              </div>
              
              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-md py-2 px-3 text-sm"
              >
                <option value="">All Statuses</option>
                <option value="new">New</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
              
              {/* Clear filters button */}
              {(searchTerm || statusFilter) && (
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
        
        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
          {filteredProjects.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <p className="text-muted-foreground mb-4">No projects found</p>
              <FuturisticButton
                variant="outline" 
                glow="cyan"
                onClick={() => setIsNewProjectOpen(true)}
              >
                Create your first project
              </FuturisticButton>
            </div>
          ) : (
            filteredProjects.map(project => (
              <Link 
                to={`/projects/${project.id}`}
                key={project.id}
                className="group transition-transform duration-300 hover:-translate-y-1"
              >
                <GlassContainer 
                  variant={project.status === "completed" ? "cyan" : project.status === "new" ? "violet" : "light"}
                  className="p-5 h-full"
                  hover
                >
                  <div className="flex justify-between items-start mb-4">
                    <StatusPill status={project.status as any} pulse={project.status === "active"} />
                    <ProgressRing 
                      progress={project.tasks_total > 0 
                        ? Math.round((project.tasks_completed / project.tasks_total) * 100)
                        : 0
                      } 
                      color={project.status === "completed" ? "cyan" : project.status === "new" ? "violet" : "white"}
                    />
                  </div>
                  
                  <h3 className="text-lg font-medium mb-2 group-hover:text-synergy-cyan transition-colors">{project.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description}</p>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Tasks: </span>
                      <span className="font-medium">{project.tasks_completed}/{project.tasks_total}</span>
                    </div>
                    <AvatarGroup users={project.members} size="sm" />
                  </div>
                  
                  {/* Project owner label */}
                  {project.owner.id === user.id && (
                    <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                      <span className="text-xs text-synergy-cyan">You are the owner</span>
                      {project.status !== "completed" && (
                        <span className="text-xs flex items-center gap-1 text-white/60">
                          <Clock className="h-3 w-3" />
                          Due {new Date(project.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  )}
                </GlassContainer>
              </Link>
            ))
          )}
          
          {/* Create New Project Card */}
          <div onClick={() => setIsNewProjectOpen(true)} className="cursor-pointer group">
            <GlassContainer className="p-5 h-full border-dashed border-white/30 flex flex-col items-center justify-center gap-3 group-hover:border-synergy-cyan/50 transition-all group-hover:-translate-y-1 duration-300">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-synergy-cyan/20 transition-colors">
                <Plus className="h-6 w-6 text-white/70 group-hover:text-synergy-cyan transition-colors" />
              </div>
              <p className="text-white/70 group-hover:text-synergy-cyan transition-colors font-medium">Create New Project</p>
            </GlassContainer>
          </div>
        </div>
        
        {/* Due Dates Alerts Section - New Section */}
        {alerts.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-medium tracking-wide mb-4">Due Date Alerts</h2>
            <GlassContainer variant="light" className="p-5 border-l-4 border-l-yellow-500">
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3">
                    <div className={`mt-1 w-2 h-2 rounded-full ${alert.overdue ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{alert.type === 'project' ? 'Project' : 'Task'}: {alert.title}</span>
                        <StatusPill 
                          status={alert.overdue ? "overdue" : "due-soon"} 
                          className="text-xs py-0.5 px-2"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {alert.type === 'task' && <span>In project: {alert.projectName}</span>}
                        <span className="flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" />
                          {alert.overdue ? 'Was due' : 'Due'}: {new Date(alert.dueDate).toLocaleDateString()}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassContainer>
          </div>
        )}
        
        {/* Activity and Tasks - Keep Existing Layout Structure */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-medium tracking-wide mb-4">Recent Activity</h2>
            <GlassContainer className="p-5">
              <div className="space-y-5">
                {recentActivity.map(activity => (
                  <div key={activity.id} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <img 
                          src={activity.user.image} 
                          alt={activity.user.name}
                          className="w-10 h-10 rounded-full border border-white/10"
                        />
                        <div className="absolute bottom-0 right-0 rounded-full p-1 bg-synergy-navy">
                          {activity.type === "comment" && (
                            <MessageSquare className="h-3 w-3 text-synergy-cyan" />
                          )}
                          {activity.type === "task" && (
                            <CheckSquare className="h-3 w-3 text-green-400" />
                          )}
                          {activity.type === "notification" && (
                            <Bell className="h-3 w-3 text-synergy-violet" />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="font-medium">{activity.user.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {activity.time}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">{activity.content}</p>
                      <p className="text-xs mt-1">
                        <span className="text-synergy-cyan">#{activity.project}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/10">
                <Link 
                  to="/activity" 
                  className="text-sm text-synergy-cyan flex items-center justify-center gap-1 hover:text-synergy-cyan/80 transition-colors"
                >
                  View all activity
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </GlassContainer>
          </div>
          
          {/* Upcoming Tasks */}
          <div>
            <h2 className="text-xl font-medium tracking-wide mb-4">Upcoming Tasks</h2>
            <GlassContainer className="p-5">
              <div className="space-y-4">
                {upcomingTasks.map(task => (
                  <div 
                    key={task.id}
                    className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">{task.title}</h4>
                      <div 
                        className={`h-2 w-2 rounded-full ${
                          task.priority === "high" ? "bg-red-400" : 
                          task.priority === "medium" ? "bg-yellow-400" : "bg-green-400"
                        }`}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Project: {task.project}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{task.dueDate}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/10">
                <Link 
                  to="/tasks" 
                  className="text-sm text-synergy-cyan flex items-center justify-center gap-1 hover:text-synergy-cyan/80 transition-colors"
                >
                  View all tasks
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </GlassContainer>
          </div>
        </div>
      </main>
      
      {/* New Project Dialog */}
      <Dialog open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen}>
        <DialogContent className="bg-synergy-navy/95 backdrop-blur-xl border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-medium tracking-wide">Create New Project</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleCreateProject} className="space-y-4 mt-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Project Name</label>
              <input 
                className="w-full bg-white/5 border border-white/10 rounded-md p-2" 
                placeholder="Enter project name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Description</label>
              <textarea 
                className="w-full bg-white/5 border border-white/10 rounded-md p-2 h-24" 
                placeholder="Describe the project"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                required
              ></textarea>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Start Date</label>
                <input 
                  type="date" 
                  className="w-full bg-white/5 border border-white/10 rounded-md p-2" 
                  value={newProjectStartDate}
                  onChange={(e) => setNewProjectStartDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Due Date</label>
                <input 
                  type="date" 
                  className="w-full bg-white/5 border border-white/10 rounded-md p-2" 
                  value={newProjectDueDate}
                  onChange={(e) => setNewProjectDueDate(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <FuturisticButton 
                variant="ghost" 
                type="button"
                onClick={() => setIsNewProjectOpen(false)}
              >
                Cancel
              </FuturisticButton>
              <FuturisticButton 
                variant="primary"
                glow="cyan"
                iconLeft={<Plus className="h-4 w-4" />}
                type="submit"
              >
                Create Project
              </FuturisticButton>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
