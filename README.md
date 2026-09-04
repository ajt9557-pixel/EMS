# EMS — Employee Management System

A full-stack employee management application with an **Admin dashboard** (manage employees, departments, salaries, and leave requests) and an **Employee dashboard** (apply for leave, view profile and leave history).

## Tech Stack

### Frontend (`front-end/`)
- **React 19** + **Vite**
- React Router (v7)
- Axios for API calls
- DataTables (`react-data-table-component`)
- Tailwind CSS (v4)
- Theme context (light / dark mode)

### Backend (`back-end/`)
- **Node.js** + **Express** (v5)
- **MongoDB** via Mongoose
- JWT authentication
- Multer for profile image uploads
- Bcrypt for password hashing

## Features

**Authentication**
- Login with JWT-based role separation: `admin` or `employee`

**Admin Dashboard**
- Overview summary cards (total employees, departments, leaves, etc.)
- Employee management: add, view, edit, delete, and set salary
- Department management: add / edit / list departments
- Salary management per employee
- View and manage all leave requests (approve / reject)
- Profile photo uploads stored in `back-end/uploads`

**Employee Dashboard**
- Apply for leave (sick, casual, maternity, paternity)
- View own leave history and status (pending / approved / rejected)
- View personal profile

## Project Structure

```
project/
├── front-end/                  # React + Vite SPA
│   └── src/
│       ├── components/         # employee, department, salaries, leaves, dashboards
│       ├── context/            # ThemeContext
│       ├── pages/              # Login, AdminDashboard, EmployeeDashboard
│       └── utils/              # API helpers, table config & helpers
└── back-end/                   # Express + MongoDB API
    ├── controllers/            # Business logic
    ├── routes/                 # API routes
    ├── models/                 # Mongoose schemas (User, Employee, Leave, etc.)
    ├── middleware/             # authmiddleware
    ├── db/                     # Database connection
    └── uploads/                # Uploaded profile images (persistent)
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)

### 1. Clone & install dependencies

```bash
# Backend
cd back-end
npm install

# Frontend (in a second terminal)
cd front-end
npm install
```

### 2. Configure environment variables

Create a `.env` file in `back-end/` (see `.env.example`):

```
MONGODB_URL=mongodb+srv://user:password@cluster.mongodb.net/ems
PORT=5000
JWT_KEY=your_secret_key
```

For the frontend, optionally set a `VITE_API_URL` in `front-end/` (defaults to `http://localhost:5000`).

### 3. Run the servers

```bash
# Backend (port 5000) — auto-reloads with nodemon
cd back-end
npm run dev
# or without hot reload
npm start

# Frontend (Vite dev server)
cd front-end
npm run dev
```

Open the frontend URL shown by Vite (usually `http://localhost:5173`).

## Available Scripts

### Backend
| Script | Description |
|--------|-------------|
| `npm run dev` | Start server with nodemon (auto-reload) |
| `npm start` | Start server with plain Node |

### Frontend
| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build |

## API Overview

All endpoints are prefixed with `/api` and protected by JWT auth middleware.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login and get a JWT |
| GET/POST | `/api/employee` | List / create employees |
| GET/PUT/DELETE | `/api/employee/:id` | View / update / delete an employee |
| GET | `/api/employee/department/:id` | Employees by department |
| GET | `/api/employee/my-profile` | Current user's profile |
| GET | `/api/department` | List departments |
| POST | `/api/leave` | List all leave requests (admin) |
| POST | `/api/leave/add` | Apply for leave |
| GET | `/api/leave/my-leaves` | Current user's leave history |
| GET | `/api/salary` | List salaries |
| GET | `/uploads/:file` | Serve uploaded profile images |
