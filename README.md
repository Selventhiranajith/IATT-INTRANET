# IATT Intranet Portal

A premium and modern Corporate Intranet Portal designed for internal team collaboration, employee management, and organizational culture building. Built with a high-performance React frontend and a robust Node.js backend.

--- 

## 🚀 Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Vanilla CSS
- **UI Components**: Shadcn / UI (Radix UI)
- **Icons**: Lucide React
- **Animations**: CSS Animations & Framer Motion (for smooth transitions)
- **Data Management**: React Context API & Local Storage

### Backend
- **Framework**: Node.js with Express
- **Database**: MySQL (using `mysql2` for performance)
- **Authentication**: JWT (JSON Web Tokens) with `bcryptjs` for security
- **Media Handling**: Multer (for multi-image and video uploads)
- **Environment**: Dotenv for secure configuration

---

## 🛠️ Key Modules & Working Flows

### 1. Authentication & Role-Based Access
- **Flow**: High-security login system using JWT.
- **Roles**:
  - **Employee**: Can view events, post ideas, and manage their own attendance.
  - **Admin**: Can manage specific branch content (Thoughts, Events, Attendance logs).
  - **SuperAdmin**: Global access to all branch data and system-wide configurations.

### 2. Dashboard Integration
- **Central Hub**: Dynamic welcome section that changes based on the user's branch.
- **Recent Members**: Carousel of recently joined employees fetched from the database.
- **Upcoming Birthdays**: Integrated birthday tracking to celebrate team milestones.
- **Thought of the Day**: Branch-specific inspiration managed by admins.

### 3. Attendance Management (Session-Based)
- **Manual Flow**: 
  - Employees can perform multiple "Sessions" in a single day (e.g., Working, Lunch Break).
  - **Check-In**: Creates an `active` session with a server-side timestamp and remark.
  - **Check-Out**: Closes the active session and automatically calculates the `duration_minutes`.
- **Total Hours**: The system dynamically calculates the total working time by summing up all completed sessions and adding the "live" time of any currently active session.

### 4. Event Management (Multimedia Ready)
- **Creation**: Admins can create events with multiple **Images** and **Videos**.
- **Cover Selection**: A unique feature allowing admins to select a specific upload as the primary "Cover Image" for the card view.
- **Gallery**: Users can view an immersive media gallery for each event.
- **Media Logic**: Videos support auto-play on hover for a premium UX experience.

### 5. Ideas Hub (Engagement)
- **Collaboration**: Employees share innovative ideas with descriptions and media.
- **Engagement**: Integrated "Like" and "Comment" systems to foster internal discussion.
- **Ownership**: Only the original author can edit or delete their ideas, enforced at both frontend and backend levels.

---

## 📦 Setup & Installation

### Prerequisites
- Node.js (v18+)
- MySQL Server

### 1. Database Configuration
Run the provided SQL migration scripts located in `/backend/migrations/` to set up your tables:
- `create_ideas_tables.sql`
- `create_thoughts_table.sql`
- `create_holidays_table.sql`
- `add_birth_date_column.sql`

### 2. Backend Setup
1. Open the `/backend` directory.
2. Create a `.env` file from `.env.example`.
3. Configure your `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, and `JWT_SECRET`.
4. Run:
   ```bash
   npm install
   npm run dev
   ```

### 3. Frontend Setup
1. Open the root directory.
2. Run:
   ```bash
   npm install
   npm run dev
   ```

---

## 📂 Directory Structure

- `src/pages`: Individual module implementations (Attendance, Events, Ideas, etc.)
- `src/contexts`: Global state management for Authentication.
- `backend/controllers`: Business logic and API endpoints.
- `backend/models`: Direct database interactions and queries.
- `backend/uploads`: Local storage for event and idea media.
