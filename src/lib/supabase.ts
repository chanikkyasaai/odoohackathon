
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://uoigmnjxfncpwaepnuhd.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvaWdtbmp4Zm5jcHdhZXBudWhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1NDI2OTMsImV4cCI6MjA2MzExODY5M30.TerA0Ndh8jqwfhg2T4NG81Gtyoi2GhPpphTG1ef0Uq4";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your Lovable project settings.');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// Database types based on our schema
export type Profile = {
  id: string;
  email: string;
  name: string;
  image: string;
  role: string;
  created_at: string;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  start_date: string;
  due_date: string;
  status: 'new' | 'active' | 'pending' | 'completed';
  owner_id: string;
  created_at: string;
};

export type ProjectMember = {
  id: string;
  project_id: string;
  user_id: string;
  role: 'owner' | 'member';
  joined_at: string;
};

export type Task = {
  id: string;
  project_id: string;
  title: string;
  description: string;
  status: 'new' | 'active' | 'pending' | 'completed';
  column_id: string;
  position: number;
  due_date: string;
  created_at: string;
};

export type TaskAssignee = {
  id: string;
  task_id: string;
  user_id: string;
  assigned_at: string;
};

export type Comment = {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
};
