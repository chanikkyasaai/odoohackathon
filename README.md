# SynergySphere

SynergySphere is a modern team collaboration platform that helps teams organize projects, assign tasks, communicate, and stay on top of deadlines—all in one place. It works on both desktop and mobile.

## 🎥 Video Presentation

Check out our project demonstration and walkthrough:
[Watch the video presentation](https://drive.google.com/drive/folders/1PCYccJhO_9f_SqqcW_VIP-k1N1m6HBjy?usp=drive_link)


## 🌟 What Can You Do With SynergySphere?

- **Sign Up & Log In:**
  - Create an account or log in securely.
  - Forgot your password? Easily reset it via email.

- **Create & Manage Projects:**
  - Start a new project with a name, description, start/due dates, tags, priority, and (optionally) a project manager and image.
  - See all your projects in a dashboard.

- **Add Team Members:**
  - Invite teammates to your project by email.
  - Assign roles (owner, manager, member).

- **Assign & Track Tasks:**
  - Create tasks for your project, set deadlines, assign to team members, and set priority.
  - Move tasks through statuses (To-Do, In Progress, Done, etc.).
  - See all your assigned tasks in "My Tasks".

- **Collaborate & Communicate:**
  - Comment on tasks (threaded discussions supported).
  - Get notified when you're assigned a task or someone replies to your comment.

- **Stay Informed:**
  - See project progress at a glance (progress bars, stats).
  - Get notifications for important events.

- **Profile & Settings:**
  - Update your name, profile image, and notification preferences.
  - Log out securely.

## 🚀 How Does It Work? (The Flow)

1. **Sign Up / Log In**
   - New users sign up with email and password. A profile is created automatically.
   - Existing users log in. If you forget your password, use the "Forgot Password" link.

2. **Create a Project**
   - Click "+ New Project" and fill in the details (name, description, dates, etc.).
   - You become the project owner.

3. **Invite Team Members**
   - Add teammates by their email. They'll get access to the project.
   - Assign roles (owner, manager, member).

4. **Add Tasks**
   - Create tasks for your project, assign them to team members, set deadlines and priorities.
   - Tasks can be moved between statuses (To-Do, In Progress, Done, etc.).

5. **Collaborate**
   - Team members can comment on tasks, reply to each other, and keep discussions organized.
   - All comments are threaded for clarity.

6. **Track Progress**
   - See project progress bars and stats on the dashboard.
   - Each member can see their own assigned tasks in "My Tasks".

7. **Notifications**
   - Get notified when you're assigned a task, added to a project, or someone replies to your comment.
   - Mark notifications as read when you view them.

8. **Profile & Settings**
   - Update your profile info and notification preferences in the Settings page.
   - Log out when you're done.

## 🛠️ Quick Start

### 1. Backend (Supabase)
- Go to your Supabase project's SQL editor.
- Paste the contents of `src/lib/schema.sql` and run it.
- Enable email/password authentication in Supabase Auth settings.

### 2. Frontend (React + Vite)
- Clone this repo and install dependencies:
  ```bash
  npm install
  ```
- Add your Supabase project URL and anon key to a `.env` file:
  ```env
  VITE_SUPABASE_URL=your-supabase-url
  VITE_SUPABASE_ANON_KEY=your-anon-key
  ```
- Start the app:
  ```bash
  npm run dev
  ```
- Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📱 Mobile Friendly
- All pages and forms are responsive and work great on mobile devices.

## 💡 Tech Stack
- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Supabase (Postgres, Auth, Realtime)

## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

**SynergySphere: Helping teams work smarter, together.**
