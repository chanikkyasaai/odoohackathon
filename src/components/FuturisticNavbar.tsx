
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, LayoutDashboard, Settings, LogOut, Bell, Menu, Search, X } from "lucide-react";
import { GlassContainer } from "./ui/glass-container";
import { useAuth } from "@/context/AuthContext";

interface NavbarProps {
  currentUser: {
    name: string;
    image: string;
  };
}

export function FuturisticNavbar({ currentUser }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4">
      <GlassContainer className="flex items-center justify-between h-16 px-4 md:px-6 border-white/10">
        <div className="flex items-center space-x-4">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="relative flex items-center">
              <div className="h-8 w-8 bg-gradient-to-br from-synergy-cyan to-synergy-violet rounded-lg rotate-12"></div>
              <div className="h-8 w-8 bg-gradient-to-tr from-synergy-cyan/50 to-synergy-violet/50 rounded-lg -rotate-12 absolute top-0 left-0"></div>
            </div>
            <span className="hidden md:inline-block text-xl font-bold tracking-wider">SynergySphere</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-1">
          <Link 
            to="/dashboard" 
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
              isActive('/dashboard') 
                ? 'bg-white/10 text-synergy-cyan' 
                : 'hover:bg-white/5 text-white/70 hover:text-white'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          <Link 
            to="/projects" 
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
              isActive('/projects') 
                ? 'bg-white/10 text-synergy-cyan' 
                : 'hover:bg-white/5 text-white/70 hover:text-white'
            }`}
          >
            <Home className="h-4 w-4" />
            <span>Projects</span>
          </Link>
          <Link 
            to="/settings" 
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
              isActive('/settings') 
                ? 'bg-white/10 text-synergy-cyan' 
                : 'hover:bg-white/5 text-white/70 hover:text-white'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <button className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <Search className="h-4 w-4 text-white/70" />
            <span className="text-sm text-white/70">Search...</span>
          </button>
          
          {/* Notifications */}
          <div className="relative">
            <button 
              className={`p-2 rounded-lg ${isNotificationsOpen ? 'bg-white/10 text-synergy-cyan' : 'hover:bg-white/5 text-white/70 hover:text-white'}`}
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-synergy-cyan"></span>
            </button>
          </div>
          
          {/* User Menu */}
          <div className="flex items-center space-x-2">
            <img 
              src={currentUser.image}
              alt={currentUser.name}
              className="h-8 w-8 rounded-full border border-white/30"
            />
            <div className="hidden md:block">
              <p className="text-sm font-medium">{currentUser.name}</p>
              <button 
                onClick={logout}
                className="text-xs text-white/50 hover:text-synergy-cyan flex items-center space-x-1 transition-colors"
              >
                <LogOut className="h-3 w-3" />
                <span>Logout</span>
              </button>
            </div>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="p-2 rounded-lg md:hidden hover:bg-white/5 text-white/70 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </GlassContainer>
      
      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <GlassContainer className="mt-2 p-4">
            <nav className="flex flex-col space-y-2">
              <Link 
                to="/dashboard" 
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  isActive('/dashboard') 
                    ? 'bg-white/10 text-synergy-cyan' 
                    : 'hover:bg-white/5 text-white/70'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <Link 
                to="/projects" 
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  isActive('/projects') 
                    ? 'bg-white/10 text-synergy-cyan' 
                    : 'hover:bg-white/5 text-white/70'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home className="h-4 w-4" />
                <span>Projects</span>
              </Link>
              <Link 
                to="/settings" 
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  isActive('/settings') 
                    ? 'bg-white/10 text-synergy-cyan' 
                    : 'hover:bg-white/5 text-white/70'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
              <button 
                className="px-4 py-2 rounded-lg flex items-center space-x-2 text-red-400 hover:bg-red-400/10"
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </nav>
          </GlassContainer>
        </div>
      )}
      
      {/* Notifications Panel */}
      {isNotificationsOpen && (
        <div className="absolute right-4 mt-2 w-80">
          <GlassContainer className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Notifications</h3>
              <button 
                className="text-xs text-white/50 hover:text-white"
                onClick={() => setIsNotificationsOpen(false)}
              >
                Mark all as read
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-synergy-cyan/20 flex items-center justify-center">
                    <Bell className="h-4 w-4 text-synergy-cyan" />
                  </div>
                  <div>
                    <p className="text-sm">New comment on <span className="text-synergy-cyan">Marketing Campaign</span></p>
                    <p className="text-xs text-white/50 mt-1">2 minutes ago</p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-synergy-violet/20 flex items-center justify-center">
                    <Bell className="h-4 w-4 text-synergy-violet" />
                  </div>
                  <div>
                    <p className="text-sm">Task assigned to you in <span className="text-synergy-violet">Product Redesign</span></p>
                    <p className="text-xs text-white/50 mt-1">1 hour ago</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-white/10">
              <button className="w-full text-center text-sm text-synergy-cyan hover:underline">
                View all notifications
              </button>
            </div>
          </GlassContainer>
        </div>
      )}
    </header>
  );
}
