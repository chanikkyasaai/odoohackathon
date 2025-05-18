
-- Create profiles table (extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text not null,
  image text,
  role text not null default 'member',
  created_at timestamptz default now() not null
);

-- Create projects table
create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  start_date date not null,
  due_date date not null,
  status text not null default 'new',
  owner_id uuid references profiles(id) not null,
  created_at timestamptz default now() not null
);

-- Create project_members table (join table)
create table project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  role text not null default 'member',
  joined_at timestamptz default now() not null,
  unique(project_id, user_id)
);

-- Create tasks table
create table tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  title text not null,
  description text,
  status text not null default 'new',
  column_id text not null default 'backlog',
  position integer not null default 0,
  due_date date not null,
  created_at timestamptz default now() not null
);

-- Create task_assignees table (join table)
create table task_assignees (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  assigned_at timestamptz default now() not null,
  unique(task_id, user_id)
);

-- Create comments table
create table comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now() not null
);

-- Set up Row Level Security (RLS) on profiles
alter table profiles enable row level security;

-- Create policy to allow users to view all profiles
create policy "Profiles are viewable by all authenticated users"
  on profiles for select
  to authenticated
  using (true);

-- Create policy to allow users to insert their own profile
create policy "Users can insert their own profile"
  on profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- Create policy to allow users to update their own profile
create policy "Users can update their own profile"
  on profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Set up Row Level Security (RLS) on projects
alter table projects enable row level security;

-- Create policy for project members to view their projects
create policy "Projects are viewable by team members" 
  on projects for select 
  to authenticated 
  using (
    exists (
      select 1 from project_members
      where project_members.project_id = id
      and project_members.user_id = auth.uid()
    )
  );

-- Create policy for project owners to update their projects
create policy "Projects can be updated by owners" 
  on projects for update 
  to authenticated 
  using (
    exists (
      select 1 from project_members
      where project_members.project_id = id
      and project_members.user_id = auth.uid()
      and project_members.role = 'owner'
    )
  );

-- Create policy for project owners to delete their projects
create policy "Projects can be deleted by owners" 
  on projects for delete 
  to authenticated 
  using (
    exists (
      select 1 from project_members
      where project_members.project_id = id
      and project_members.user_id = auth.uid()
      and project_members.role = 'owner'
    )
  );

-- Set up Row Level Security (RLS) on project_members
alter table project_members enable row level security;

-- Create policy for viewing project members
create policy "Project members are viewable by team members" 
  on project_members for select 
  to authenticated 
  using (
    exists (
      select 1 from projects
      join project_members as pm on pm.project_id = projects.id
      where pm.project_id = project_members.project_id
      and pm.user_id = auth.uid()
    )
  );

-- Create policy for project owners to add members
create policy "Project members can be added by owners" 
  on project_members for insert 
  to authenticated 
  with check (
    exists (
      select 1 from project_members
      where project_members.project_id = project_id
      and project_members.user_id = auth.uid()
      and project_members.role = 'owner'
    )
  );

-- Create policy for project owners to update member roles
drop policy if exists "Project member roles can be updated by owners" on project_members;
create policy "Project member roles can be updated by owners" 
  on project_members for update 
  to authenticated 
  using (
    exists (
      select 1 from projects
      where projects.id = project_id
      and projects.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from projects
      where projects.id = project_id
      and projects.owner_id = auth.uid()
    )
  );

-- Create policy for project owners to remove members
create policy "Project members can be removed by owners" 
  on project_members for delete 
  to authenticated 
  using (
    exists (
      select 1 from project_members
      where project_members.project_id = project_id
      and project_members.user_id = auth.uid()
      and project_members.role = 'owner'
    )
    or user_id = auth.uid() -- Users can remove themselves
  );

-- Set up Row Level Security (RLS) on tasks
alter table tasks enable row level security;

-- Create policy for viewing tasks
create policy "Tasks are viewable by project members" 
  on tasks for select 
  to authenticated 
  using (
    exists (
      select 1 from project_members
      where project_members.project_id = tasks.project_id
      and project_members.user_id = auth.uid()
    )
  );

-- Create policy for project members to create tasks
create policy "Tasks can be created by project members" 
  on tasks for insert 
  to authenticated 
  with check (
    exists (
      select 1 from project_members
      where project_members.project_id = tasks.project_id
      and project_members.user_id = auth.uid()
    )
  );

-- Create policy for project members to update tasks
create policy "Tasks can be updated by project members" 
  on tasks for update 
  to authenticated 
  using (
    exists (
      select 1 from project_members
      where project_members.project_id = tasks.project_id
      and project_members.user_id = auth.uid()
    )
  );

-- Create policy for project members to delete tasks
create policy "Tasks can be deleted by project members" 
  on tasks for delete 
  to authenticated 
  using (
    exists (
      select 1 from project_members
      where project_members.project_id = tasks.project_id
      and project_members.user_id = auth.uid()
    )
  );

-- Set up Row Level Security (RLS) on task_assignees
alter table task_assignees enable row level security;

-- Create policy for viewing task assignees
create policy "Task assignees are viewable by project members" 
  on task_assignees for select 
  to authenticated 
  using (
    exists (
      select 1 from tasks
      join project_members on project_members.project_id = tasks.project_id
      where tasks.id = task_assignees.task_id
      and project_members.user_id = auth.uid()
    )
  );

-- Create policy for project members to add assignees
create policy "Task assignees can be added by project members" 
  on task_assignees for insert 
  to authenticated 
  with check (
    exists (
      select 1 from tasks
      join project_members on project_members.project_id = tasks.project_id
      where tasks.id = task_assignees.task_id
      and project_members.user_id = auth.uid()
    )
  );

-- Create policy for project members to remove assignees
create policy "Task assignees can be removed by project members" 
  on task_assignees for delete 
  to authenticated 
  using (
    exists (
      select 1 from tasks
      join project_members on project_members.project_id = tasks.project_id
      where tasks.id = task_assignees.task_id
      and project_members.user_id = auth.uid()
    )
  );

-- Set up Row Level Security (RLS) on comments
alter table comments enable row level security;

-- Create policy for viewing comments
create policy "Comments are viewable by project members" 
  on comments for select 
  to authenticated 
  using (
    exists (
      select 1 from tasks
      join project_members on project_members.project_id = tasks.project_id
      where tasks.id = comments.task_id
      and project_members.user_id = auth.uid()
    )
  );

-- Create policy for project members to add comments
create policy "Comments can be added by project members" 
  on comments for insert 
  to authenticated 
  with check (
    exists (
      select 1 from tasks
      join project_members on project_members.project_id = tasks.project_id
      where tasks.id = comments.task_id
      and project_members.user_id = auth.uid()
    )
  );

-- Create policy for users to delete their own comments
create policy "Users can delete their own comments" 
  on comments for delete 
  to authenticated 
  using (user_id = auth.uid());

-- Function to create trigger to handle user creation
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, name, image, role)
  values (
    new.id, 
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'https://i.pravatar.cc/150?img=' || floor(random() * 70)::text,
    'member'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Enable realtime for tables that need it
alter publication supabase_realtime add table tasks;
alter publication supabase_realtime add table task_assignees;
alter publication supabase_realtime add table comments;
