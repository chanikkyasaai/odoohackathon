-- USERS (Profiles, extends auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null unique,
  name text not null,
  image text,
  role text not null default 'member',
  created_at timestamptz default now() not null
);

-- PROJECTS
delete from projects;
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  start_date date not null,
  due_date date not null,
  status text not null default 'new',
  owner_id uuid references profiles(id) not null,
  image text,
  tags text[],
  priority text not null default 'medium',
  manager_id uuid references profiles(id),
  created_at timestamptz default now() not null
);

-- PROJECT MEMBERS
create table if not exists project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  role text not null default 'member',
  joined_at timestamptz default now() not null,
  unique(project_id, user_id)
);

-- TASKS
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  title text not null,
  description text,
  status text not null default 'new',
  column_id text not null default 'backlog',
  position integer not null default 0,
  due_date date not null,
  image text,
  tags text[],
  priority text not null default 'medium',
  created_at timestamptz default now() not null
);

-- TASK ASSIGNEES (many-to-many)
create table if not exists task_assignees (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  assigned_at timestamptz default now() not null,
  unique(task_id, user_id)
);

-- COMMENTS (threaded, for tasks)
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  parent_id uuid references comments(id) on delete cascade,
  created_at timestamptz default now() not null
);

-- NOTIFICATIONS (optional, for future)
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  type text not null,
  message text not null,
  read boolean default false,
  created_at timestamptz default now() not null
);

-- =========================
-- RLS (Row Level Security)
-- =========================

-- PROFILES
alter table profiles enable row level security;
create policy "Profiles are viewable by all authenticated users"
  on profiles for select using (auth.role() = 'authenticated');
create policy "Users can insert their own profile"
  on profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

-- PROJECTS
alter table projects enable row level security;
create policy "Projects are viewable by team members"
  on projects for select using (
    owner_id = auth.uid()
    or manager_id = auth.uid()
    or exists (
      select 1 from project_members
      where project_members.project_id = projects.id
      and project_members.user_id = auth.uid()
    )
  );
create policy "Projects can be inserted by owners"
  on projects for insert with check (owner_id = auth.uid());
create policy "Projects can be updated by owners and managers"
  on projects for update using (
    owner_id = auth.uid()
    or manager_id = auth.uid()
    or exists (
      select 1 from project_members
      where project_members.project_id = projects.id
      and project_members.user_id = auth.uid()
      and project_members.role in ('owner', 'manager')
    )
  );
create policy "Projects can be deleted by owners"
  on projects for delete using (
    owner_id = auth.uid()
    or exists (
      select 1 from project_members
      where project_members.project_id = projects.id
      and project_members.user_id = auth.uid()
      and project_members.role = 'owner'
    )
  );

-- PROJECT MEMBERS
alter table project_members enable row level security;
create or replace policy "Project members are viewable by team members"
  on project_members for select using (
    exists (
      select 1 from projects
      where projects.id = project_members.project_id
      and (
        projects.owner_id = auth.uid()
        or projects.manager_id = auth.uid()
      )
    )
    or user_id = auth.uid()
  );
create policy "Project members can be added by owners and managers"
  on project_members for insert with check (
    exists (
      select 1 from projects
      where projects.id = project_members.project_id
      and (
        projects.owner_id = auth.uid()
        or projects.manager_id = auth.uid()
        or exists (
          select 1 from project_members pm
          where pm.project_id = projects.id
          and pm.user_id = auth.uid()
          and pm.role in ('owner', 'manager')
        )
      )
    )
  );
create policy "Project member roles can be updated by owners and managers"
  on project_members for update using (
    exists (
      select 1 from projects
      where projects.id = project_members.project_id
      and (
        projects.owner_id = auth.uid()
        or projects.manager_id = auth.uid()
        or exists (
          select 1 from project_members pm
          where pm.project_id = projects.id
          and pm.user_id = auth.uid()
          and pm.role in ('owner', 'manager')
        )
      )
    )
  );
create policy "Project members can be removed by owners and managers"
  on project_members for delete using (
    exists (
      select 1 from projects
      where projects.id = project_members.project_id
      and (
        projects.owner_id = auth.uid()
        or projects.manager_id = auth.uid()
        or exists (
          select 1 from project_members pm
          where pm.project_id = projects.id
          and pm.user_id = auth.uid()
          and pm.role in ('owner', 'manager')
        )
      )
    )
    or user_id = auth.uid()
  );

-- TASKS
alter table tasks enable row level security;
create policy "Tasks are viewable by project members"
  on tasks for select using (
    exists (
      select 1 from project_members
      where project_members.project_id = tasks.project_id
      and project_members.user_id = auth.uid()
    )
  );
create policy "Tasks can be created by project members"
  on tasks for insert with check (
    exists (
      select 1 from project_members
      where project_members.project_id = tasks.project_id
      and project_members.user_id = auth.uid()
    )
  );
create policy "Tasks can be updated by project members"
  on tasks for update using (
    exists (
      select 1 from project_members
      where project_members.project_id = tasks.project_id
      and project_members.user_id = auth.uid()
    )
  );
create policy "Tasks can be deleted by project members"
  on tasks for delete using (
    exists (
      select 1 from project_members
      where project_members.project_id = tasks.project_id
      and project_members.user_id = auth.uid()
    )
  );

-- TASK ASSIGNEES
alter table task_assignees enable row level security;
create policy "Task assignees are viewable by project members"
  on task_assignees for select using (
    exists (
      select 1 from tasks
      join project_members on project_members.project_id = tasks.project_id
      where tasks.id = task_assignees.task_id
      and project_members.user_id = auth.uid()
    )
  );
create policy "Task assignees can be added by project members"
  on task_assignees for insert with check (
    exists (
      select 1 from tasks
      join project_members on project_members.project_id = tasks.project_id
      where tasks.id = task_assignees.task_id
      and project_members.user_id = auth.uid()
    )
  );
create policy "Task assignees can be removed by project members"
  on task_assignees for delete using (
    exists (
      select 1 from tasks
      join project_members on project_members.project_id = tasks.project_id
      where tasks.id = task_assignees.task_id
      and project_members.user_id = auth.uid()
    )
  );

-- COMMENTS
alter table comments enable row level security;
create policy "Comments are viewable by project members"
  on comments for select using (
    exists (
      select 1 from tasks
      join project_members on project_members.project_id = tasks.project_id
      where tasks.id = comments.task_id
      and project_members.user_id = auth.uid()
    )
  );
create policy "Comments can be added by project members"
  on comments for insert with check (
    exists (
      select 1 from tasks
      join project_members on project_members.project_id = tasks.project_id
      where tasks.id = comments.task_id
      and project_members.user_id = auth.uid()
    )
  );
create policy "Users can delete their own comments"
  on comments for delete using (user_id = auth.uid());

-- TRIGGER: Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'name')
  on conflict do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Enable realtime for tables that need it
alter publication supabase_realtime add table tasks;
alter publication supabase_realtime add table task_assignees;
alter publication supabase_realtime add table comments;
