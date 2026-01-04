# todoit - Task Management Application

todoit is a modern task management application built with Next.js, Convex, and TypeScript. Organize your life, one task at a time.

## 🚀 Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## ✨ Current Features

### ✅ Implemented Functionality

- **Basic CRUD Operations** - Create, read, update, and delete tasks
- **Projects & Labels** - Organize tasks into projects and categorize with labels
- **Sub-tasks** - Break down tasks into smaller sub-tasks
- **Priorities** - Task priorities with visual color-coded flags (P1: red, P2: orange, P3: yellow, P4: gray)
- **Due Dates** - Set and view due dates for tasks (visible in dialog)
- **Rich Text Editor** - Enhanced task descriptions with formatting, lists, and image embedding (Tiptap)
- **Semantic Search** - AI-powered vector search across all tasks and projects
- **Filtering** - Filter tasks by: Today, Upcoming, Projects, Inbox
- **Completed Tasks** - Track and view completed tasks
- **Animations & UX** - Smooth animations for task check/uncheck with sound effects
- **Loading States** - Skeleton loaders and loading indicators for better UX
- **Google OAuth** - Authentication via Google
- **Push Notifications** - Infrastructure for push notifications (VAPID)
- **PWA Support** - Progressive Web App capabilities
- **Marketing Homepage** - Beautiful landing page with features showcase
- **Responsive Design** - Works on mobile and desktop

## 🎯 Missing Features / Roadmap

### High Priority

1. ~~**Visual Priority Indicators in Task List**~~ ✅ **COMPLETED**
   - ~~Color-coded priority flags/icons next to task names~~
   - ~~Colors: P1 (red), P2 (orange), P3 (yellow), P4 (gray)~~
   - ✅ Implemented: Priority flags now displayed next to task names with color coding

2. **Task Sorting** ✅
   - ~~Sort by: date, priority, name, project~~
   - ~~Ascending/descending options~~
   - ~~UI: Dropdown with sorting options~~
   - ✅ Implemented: Dropdown with sort by (date/priority/name/project) and sort order toggle (asc/desc) available in all task views

3. **Advanced Filtering**
   - Filter by: priority, label, project, status
   - Multiple filters combination
   - UI: Sidebar with filters or dropdown

4. **Visual Indicators in List** ✅
   - Date icons (today, tomorrow, overdue) - ✅ Implemented
   - Color-coded priority flags - ✅ Implemented
   - Label indicators (colored dots) - ✅ Implemented
   - Sub-task count indicators - ✅ Implemented
   - Desktop view shows additional info: project, date, subtask count

5. **Quick Actions**
   - Quick priority change (hover menu)
   - Quick move to project
   - Quick date assignment
   - Quick label assignment

### Medium Priority

6. **Drag & Drop**
   - Reorder tasks
   - Move between projects
   - Change date by dragging

7. **Bulk Actions**
   - Multi-select tasks
   - Bulk: delete, change project, change label, change priority
   - Checkboxes for selection

8. **Recurring Tasks**
   - Daily, weekly, monthly recurrence
   - Automatic creation of next instances

9. **Reminders/Notifications**
   - Notifications before due date
   - Leverage existing push notification infrastructure

10. **Alternative Views**
    - Kanban board (To Do, In Progress, Done)
    - Calendar view
    - Timeline view

### Low Priority

11. **Keyboard Shortcuts**
    - `Cmd/Ctrl + K` - Command palette
    - `N` - New task
    - `Esc` - Close dialog
    - `Enter` - Check/uncheck task

12. **Quick Add**
    - Quick add field at top
    - Natural language parsing (e.g., "Task tomorrow P1 #Project")

13. **Task Archiving**
    - Archive tasks instead of deleting
    - Archive view
    - Restore tasks

14. **Statistics & Productivity**
    - Dashboard with statistics
    - Completed tasks charts
    - Streak (days with completed tasks)

15. **UX Improvements**
    - Better overdue task indicators
    - Visual grouping by dates
    - Collapse/expand sections
    - Better mobile experience

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Backend**: Convex (real-time database)
- **Authentication**: NextAuth.js v5 with Google OAuth
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI
- **Rich Text Editor**: Tiptap
- **State Management**: Zustand
- **Forms**: React Hook Form
- **Date Handling**: Moment.js, date-fns

## 📦 Project Structure

```
├── app/                    # Next.js app directory
│   ├── loggedin/          # Protected routes
│   │   ├── today/        # Today's tasks view
│   │   ├── upcoming/     # Upcoming tasks view
│   │   ├── projects/     # Projects views
│   │   └── search/       # Search functionality
│   └── page.tsx          # Marketing homepage
├── components/            # React components
│   ├── layout/           # Layout components (Sidebar, Tasks, etc.)
│   ├── functional/       # Functional components (Login, TaskDataLoader)
│   └── ui/               # Reusable UI components
├── convex/               # Convex backend
│   ├── tasks.ts          # Task queries and mutations
│   ├── projects.ts       # Project queries and mutations
│   ├── labels.ts         # Label queries and mutations
│   ├── search.ts         # Semantic search
│   └── schema.ts        # Database schema
├── stores/               # Zustand stores
└── hooks/                # Custom React hooks
```

## 🚢 Deployment

### Deploy to Vercel

1. **Prepare Convex for production:**
   ```bash
   npx convex deploy --prod
   ```

2. **Set environment variables in Vercel:**
   - `NEXT_PUBLIC_CONVEX_URL` - Convex deployment URL
   - `CONVEX_AUTH_PRIVATE_KEY` - Private key from Convex Dashboard
   - `JWKS` - JWKS URL from Convex Dashboard
   - `GOOGLE_CLIENT_ID` - Google OAuth Client ID
   - `GOOGLE_CLIENT_SECRET` - Google OAuth Client Secret
   - `NEXTAUTH_URL` - Your app URL (e.g., `https://your-app.vercel.app`)
   - `NEXTAUTH_SECRET` - Random secret (generate with `openssl rand -base64 32`)

3. **Deploy:**
   - Connect GitHub repository to Vercel
   - Add all environment variables
   - Vercel will automatically build and deploy

## 📝 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Convex Documentation](https://docs.convex.dev)
- [NextAuth.js Documentation](https://next-auth.js.org)

## 📄 License

This project is private and proprietary.
