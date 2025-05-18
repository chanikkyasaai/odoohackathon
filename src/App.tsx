import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Projects from "./pages/Projects";
import Project from "./pages/Project";
import MyTasks from "./pages/MyTasks";
import ProjectCreateEdit from "./pages/ProjectCreateEdit";
import TaskCreateEdit from "./pages/TaskCreateEdit";
import Settings from "./pages/Settings";
import Empty from "./pages/Empty";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ForgotPassword from "./pages/ForgotPassword";

// Define QueryClient with better error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Protected route component with role-based access control
const ProtectedRoute = ({ 
  children,
  requiredRole
}: { 
  children: JSX.Element;
  requiredRole?: "owner" | "member";
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-synergy-navy">
        <div className="w-12 h-12 border-4 border-synergy-cyan border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // For role-based checks - implemented with Supabase
  if (requiredRole && user && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/projects" />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<Project />} />
            <Route path="/my-tasks" element={<MyTasks />} />
            <Route path="/projects/new" element={<ProjectCreateEdit />} />
            <Route path="/projects/:id/edit" element={<ProjectCreateEdit />} />
            <Route path="/tasks/new" element={<TaskCreateEdit />} />
            <Route path="/tasks/:id/edit" element={<TaskCreateEdit />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/empty" element={<Empty />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
