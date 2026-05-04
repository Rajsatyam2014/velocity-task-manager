# 🚀 Velocity — Enterprise Task Management Platform

<div align="center">

![Velocity Banner](https://img.shields.io/badge/VELOCITY-Task%20Manager-00f0ff?style=for-the-badge&labelColor=0a0a0f&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMGYwZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWdvbiBwb2ludHM9IjEzIDIgMyAxNCA5IDIwIDIyIDggMTIgOCI+PC9wb2x5Z29uPjwvc3ZnPg==)

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind](https://img.shields.io/badge/Tailwind%20CSS-3.4-38BDF8?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**A production-grade, full-stack SaaS Task Management application with a futuristic glassmorphic UI, real-time messaging, Kanban boards, team management, and notification system.**

[Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [Usage Guide](#-step-by-step-usage-guide) · [API Reference](#-api-endpoints) · [Architecture](#-architecture)

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Default Login Credentials](#-default-login-credentials)
- [Step-by-Step Usage Guide](#-step-by-step-usage-guide)
- [API Endpoints](#-api-endpoints)
- [Database Schema](#-database-schema)
- [Architecture](#-architecture)
- [Screenshots](#-screenshots)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication with 7-day token expiry
- Role-based access control (ADMIN / MEMBER)
- Secure password hashing with bcrypt
- Protected routes with middleware guards

### 📊 Dashboard & Analytics
- Real-time task statistics (Total, Completed, Pending, Overdue)
- Interactive 7-day task completion chart (Recharts)
- Active project overview with progress bars
- Due date tracking with color-coded alerts

### 📁 Project Management
- Create, view, and delete projects (Admin only for create/delete)
- Auto-computed task progress percentages
- Nearest due date tracking per project
- Color-coded project status indicators

### 📋 Kanban Board
- **Drag-and-drop** task management across 4 columns: `To Do → In Progress → Testing → Done`
- Task creation with title, description, priority, due date, and **assignee selection**
- Priority badges (HIGH / MEDIUM / LOW) with color coding
- Overdue task highlighting with smart date labels
- One-click task deletion
- Real-time status sync with backend

### 💬 Real-Time Messaging System
- **Full messaging system** with database persistence
- Conversation list grouped by chat partner
- Real-time message thread view with auto-scroll
- Unread message count badges
- Send messages from Team page or Messages page
- 5-second auto-polling for new messages

### 🔔 Notification System
- **Automatic notifications** for:
  - New messages received
  - Task assignments
  - Team member invitations
  - System events
- Notification bell with real-time unread count
- Click-to-navigate deep links
- Mark individual or all notifications as read
- 15-second auto-polling for new notifications

### 👥 Team Management
- View all team members with roles and join dates
- **Send messages** directly from the Team page (persisted to DB)
- **Assign/reassign tasks** — select a project, pick tasks with checkboxes, assign to member
- **Invite new members** — creates account with temporary password `Welcome@123`
- Member summary card with stats

### ⚙️ Settings (Fully Functional)
| Tab | Functionality |
|-----|---------------|
| **Profile** | Update display name & bio → saved to database via API |
| **Notifications** | Toggle preferences (task assigned, overdue, messages, email digest) → saved to localStorage |
| **Security** | Change password with current password verification → bcrypt-hashed in DB |
| **Appearance** | Theme selection (Cyber Dark, Midnight Blue, Matrix Green, Sunset Warm) → saved to localStorage |

### 🔍 Global Search
- Live search across **projects, tasks, and team members**
- Debounced search (300ms) for performance
- Search results grouped by category with icons
- Click to navigate directly to project/task/member

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion |
| **UI Components** | Glassmorphic design, Recharts, @hello-pangea/dnd |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL (Railway-hosted) |
| **ORM** | Prisma |
| **Authentication** | JWT (jsonwebtoken), bcrypt |
| **HTTP Client** | Axios |
| **Routing** | React Router v6 |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **PostgreSQL** database (local or cloud — Railway, Supabase, Neon, etc.)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Rajsatyam2014/velocity-task-manager.git
cd velocity-task-manager

# 2. Install backend dependencies
cd backend
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET

# 4. Push database schema
npx prisma db push

# 5. Generate Prisma client
npx prisma generate

# 6. Start backend server
npm run dev
# Server runs on http://localhost:5000

# 7. Install frontend dependencies (new terminal)
cd ../frontend
npm install

# 8. Start frontend development server
npm run dev
# App runs on http://localhost:5173
```

### Environment Variables

Create `backend/.env` file:

```env
PORT=5000
DATABASE_URL="postgresql://username:password@host:port/database"
JWT_SECRET="your-secret-jwt-key-here"
```

---

## 🔑 Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@example.com` | `password123` |

> **Note:** The admin account is created during initial signup. If this is a fresh database, navigate to the login page and use the signup form to create the first admin account with these credentials. Set role as `ADMIN`.

### Invited Member Default Password

When inviting new members via the Team page, they receive:
- **Default Password:** `Welcome@123`
- Members should change their password in **Settings → Security** after first login.

---

## 📖 Step-by-Step Usage Guide

### Step 1: Login / Signup
1. Open the app → You'll see a **futuristic welcome animation** (3 seconds)
2. Enter credentials: `admin@example.com` / `password123`
3. Click **"INITIALIZE SESSION"** to log in
4. You're now on the **Dashboard**

### Step 2: Explore the Dashboard
- **Top row:** 4 stat cards showing Total Tasks, Completed, Pending, and Overdue counts
- **Left panel:** Interactive bar chart showing 7-day task completion velocity
- **Right panel:** Active projects with progress bars and due dates
- Click any project to jump directly to its Kanban board

### Step 3: Create a Project
1. Click **"Projects"** in the sidebar
2. Click the **"CREATE NEW PROJECT"** button (top-right)
3. Fill in project name and description
4. Click **"Create Project"**
5. The project appears as a card with 0% progress

### Step 4: Manage Tasks on the Kanban Board
1. Click on any project card → Opens the **Kanban Board**
2. Click **"ADD TASK"** button
3. Fill in:
   - **Title** — e.g., "Implement Login API"
   - **Description** — Optional task details
   - **Priority** — LOW / MEDIUM / HIGH
   - **Due Date** — Optional deadline
   - **Assign To** — Select a team member from the dropdown
4. Click **"Create Task"** → Task appears in the "To Do" column
5. **Drag and drop** tasks between columns: `To Do → In Progress → Testing → Done`
6. Hover over a task to reveal the **delete button** (trash icon)

### Step 5: Send Messages
1. Click **"Messages"** in the sidebar
2. Click the **chat bubble icon** (top-right of conversations list) to start a new conversation
3. Search for a team member and click their name
4. Type your message and click **Send** (or press Enter)
5. Messages are **persisted in the database** and the receiver gets a notification
6. The conversation auto-refreshes every 5 seconds

**Alternative:** On the **Team page**, click the **message icon** next to any member to send them a quick message.

### Step 6: Manage Your Team
1. Click **"Team"** in the sidebar
2. **Invite a member:** Click **"INVITE MEMBER"** → fill in name, email, role → click **"Send Invite"**
   - The new member can log in with password: `Welcome@123`
3. **Assign tasks:** Click the **edit icon** next to a member → select a project → check tasks to assign → click **"Assign Tasks"**
4. **Send message:** Click the **message icon** next to a member → type message → click **"Send Message"**

### Step 7: Notifications
- The **bell icon** in the top-right navbar shows unread notification count
- Click to open the dropdown — see all notifications with timestamps
- Notifications are auto-created when:
  - Someone sends you a message
  - A task is assigned to you
  - A new member is invited
- Click **"Mark all read"** to clear the badge

### Step 8: Global Search
- Click the **search bar** in the top navbar
- Type 2+ characters to search across:
  - 📁 Projects (by name)
  - ✅ Tasks (by title or description)
  - 👤 Members (by name or email)
- Click any result to navigate directly

### Step 9: Settings
1. Click **"Settings"** in the sidebar
2. **Profile tab:** Update your display name and bio → Click **"SAVE PROFILE"**
3. **Notifications tab:** Toggle notification preferences on/off → Click **"SAVE PREFERENCES"**
4. **Security tab:** Change your password (enter current + new password) → Click **"CHANGE PASSWORD"**
5. **Appearance tab:** Select a color theme → preference is saved automatically

### Step 10: Logout
- Click the **"Logout"** button at the bottom of the sidebar
- You'll be redirected to the login page

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/auth/me` | Get current user profile |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List all projects with task stats |
| POST | `/api/projects` | Create a new project (Admin only) |
| GET | `/api/projects/:id` | Get project details with tasks |
| DELETE | `/api/projects/:id` | Delete a project (Admin only) |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks/project/:id` | Get all tasks for a project |
| POST | `/api/tasks` | Create a new task |
| PUT | `/api/tasks/:id` | Update task (status, assignee, etc.) |
| DELETE | `/api/tasks/:id` | Delete a task |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages` | Get conversation list |
| GET | `/api/messages/:userId` | Get message thread with user |
| POST | `/api/messages` | Send a message |
| PUT | `/api/messages/:id/read` | Mark message as read |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get all notifications |
| GET | `/api/notifications/unread-count` | Get unread count |
| PUT | `/api/notifications/:id/read` | Mark one as read |
| PUT | `/api/notifications/read-all` | Mark all as read |

### Users & Team
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all team members |
| GET | `/api/users/analytics` | Dashboard analytics |
| PUT | `/api/users/profile` | Update profile (name, bio) |
| PUT | `/api/users/password` | Change password |
| POST | `/api/users/invite` | Invite new team member |
| GET | `/api/users/search?q=` | Global search |

---

## 🗃 Database Schema

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│     User     │     │   Project    │     │     Task     │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id           │◄────│ createdById  │     │ id           │
│ name         │     │ id           │◄────│ projectId    │
│ email        │     │ name         │     │ title        │
│ password     │     │ description  │     │ description  │
│ role         │     │ createdAt    │     │ status       │
│ bio          │     │ updatedAt    │     │ priority     │
│ createdAt    │     └──────────────┘     │ dueDate      │
└──────┬───────┘                          │ assignedTo   │──► User
       │                                  │ createdAt    │
       │                                  │ updatedAt    │
       │                                  └──────────────┘
       │
       ├──────────────────────────────┐
       │                              │
┌──────▼───────┐              ┌───────▼──────┐
│   Message    │              │ Notification │
├──────────────┤              ├──────────────┤
│ id           │              │ id           │
│ content      │              │ type         │
│ senderId     │──► User      │ content      │
│ receiverId   │──► User      │ userId       │──► User
│ read         │              │ read         │
│ createdAt    │              │ link         │
└──────────────┘              │ createdAt    │
                              └──────────────┘
```

---

## 🏗 Architecture

```
velocity-task-manager/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database models
│   ├── src/
│   │   ├── index.js               # Express server entry
│   │   ├── prismaClient.js        # Prisma singleton
│   │   ├── middleware/
│   │   │   └── auth.js            # JWT & admin middleware
│   │   └── routes/
│   │       ├── auth.js            # Login / Signup / Me
│   │       ├── projects.js        # Project CRUD
│   │       ├── tasks.js           # Task CRUD + assign notifications
│   │       ├── users.js           # Team, profile, password, invite, search
│   │       ├── messages.js        # Messaging system
│   │       └── notifications.js   # Notification system
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                # Routes & auth guard
│   │   ├── main.jsx               # React entry
│   │   ├── index.css              # Global styles & design tokens
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Auth state management
│   │   ├── services/
│   │   │   └── api.js             # Axios instance + interceptors
│   │   ├── components/
│   │   │   ├── Layout.jsx         # Shell (navbar, search, notifications)
│   │   │   ├── Sidebar.jsx        # Navigation sidebar
│   │   │   └── WelcomeScreen.jsx  # 3D entry animation
│   │   └── pages/
│   │       ├── Dashboard.jsx      # Analytics & stats
│   │       ├── Projects.jsx       # Project cards
│   │       ├── KanbanBoard.jsx    # Drag-and-drop board
│   │       ├── Messages.jsx       # Chat conversations
│   │       ├── Team.jsx           # Member management
│   │       └── Settings.jsx       # Profile, security, prefs
│   ├── tailwind.config.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🌐 Deployment

### Railway (Recommended)

#### Backend:
1. Push code to GitHub
2. Create a new project on [Railway](https://railway.app)
3. Add a **PostgreSQL** service
4. Add a **Node.js** service linked to `backend/` directory
5. Set environment variables:
   - `DATABASE_URL` → from Railway PostgreSQL
   - `JWT_SECRET` → your secret key
   - `PORT` → 5000
6. Set build command: `npx prisma generate && npx prisma db push`
7. Set start command: `node src/index.js`

#### Frontend:
1. Add another service linked to `frontend/` directory
2. Set environment variable:
   - `VITE_API_URL` → your backend Railway URL + `/api`
3. Set build command: `npm run build`
4. Set start command: `npx serve dist -l $PORT`

### Vercel (Frontend Only)
```bash
cd frontend
npx vercel --prod
# Set VITE_API_URL in Vercel env vars
```

---

## 🎨 Design Philosophy

- **Glassmorphic UI** — Frosted glass panels with subtle blur and transparency
- **Neon Accent System** — Primary (Cyan #00f0ff), Accent (Purple #9d00ff), Secondary (Red #ff003c)
- **Micro-animations** — Framer Motion for page transitions, hover effects, and modal reveals
- **Dark-first design** — Optimized for extended use with low eye strain
- **Responsive layout** — Works on 1280px+ screens (desktop-first for a SaaS dashboard)

---

## 👨‍💻 Author

**Raj Satyam**  
Chandigarh University  

---

## 📄 License

This project is built as an academic assignment / portfolio project.

---

<div align="center">

**Built with ❤️ using React, Node.js, PostgreSQL & Prisma**

</div>
