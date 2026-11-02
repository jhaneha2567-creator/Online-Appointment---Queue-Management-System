# QueueCare — Online Appointment & Queue Management System

> MCA Final Year Project | Full-Stack Web Application

---

## Problem Statement

Clinics and service centers often experience long waiting times because appointments and walk-in queues are poorly coordinated. This system allows patients to book appointments online, join a walk-in queue, and track their real-time queue position — while administrators manage the entire workflow from a dedicated dashboard.

---

## Features

### Patient Portal
- Book appointments (service → date → slot → confirm)
- View, cancel, and reschedule appointments
- Join the walk-in queue and get a queue number
- Live queue position tracking (auto-refresh every 5 seconds)
- In-app notifications (appointment updates, queue alerts)
- Personal dashboard with stats and upcoming appointment

### Admin Panel
- Dashboard with charts (status breakdown, service distribution, 7-day trend)
- Manage all appointments (filter, search, change status, cancel)
- Queue management: Call Next, Mark Completed, Recall, Remove
- Service management: Add, Edit, Enable/Disable, Delete
- Schedule management: Working days, hours, slot duration, capacity
- Reports & analytics: monthly trends, service breakdown, completion rates

---

## Technology Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, Vite, React Router v6     |
| Charts     | Recharts                            |
| HTTP       | Axios                               |
| Backend    | Node.js, Express.js                 |
| Storage    | Local JSON files (no database)      |
| Styling    | Plain CSS (custom design system)    |

---

## Project Structure

```
final_project/
├── server/
│   ├── data/                   # JSON data files (persistent storage)
│   │   ├── users.json
│   │   ├── appointments.json
│   │   ├── queue.json
│   │   ├── services.json
│   │   ├── notifications.json
│   │   └── schedule.json
│   ├── src/
│   │   ├── controllers/        # Route handler logic
│   │   ├── routes/             # Express route definitions
│   │   ├── middleware/         # Auth middleware
│   │   └── utils/              # fileHelper, idGenerator, notificationHelper
│   ├── server.js               # Express app entry point
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # StatusBadge, StatCard, Modal, Spinner…
│   │   │   └── layout/         # Sidebar, Header, AppLayout
│   │   ├── context/            # AuthContext, ToastContext
│   │   ├── pages/
│   │   │   ├── user/           # Dashboard, BookAppointment, Queue pages…
│   │   │   └── admin/          # AdminDashboard, Queue, Services, Reports…
│   │   ├── services/           # api.js (Axios service layer)
│   │   ├── App.jsx             # Route definitions
│   │   └── index.css           # Global design system CSS
│   └── package.json
│
└── README.md
```

---

## Installation & Running

### Prerequisites
- Node.js v18 or higher
- npm

### 1. Start the Backend

```bash
cd server
npm install
npm run dev
```

Backend runs on: **http://localhost:5000**

### 2. Start the Frontend

```bash
cd client
npm install
npm run dev
```

Frontend runs on: **http://localhost:5173**

Open **http://localhost:5173** in your browser.

---

## Demo Credentials

| Role  | Username | Password |
|-------|----------|----------|
| Admin | `admin`  | `123`    |
| User  | `user`   | `123`    |

After login:
- **Admin** → redirected to `/admin/dashboard`
- **User** → redirected to `/dashboard`

---

## API Overview

### Authentication
| Method | Endpoint          | Description     |
|--------|-------------------|-----------------|
| POST   | /api/auth/login   | Login           |
| GET    | /api/auth/me      | Current user    |
| POST   | /api/auth/logout  | Logout          |

### Appointments
| Method | Endpoint                    | Description              |
|--------|-----------------------------|--------------------------|
| GET    | /api/appointments           | Get appointments         |
| GET    | /api/appointments/:id       | Get by ID                |
| POST   | /api/appointments           | Book appointment         |
| PUT    | /api/appointments/:id       | Update / reschedule      |
| DELETE | /api/appointments/:id       | Cancel (admin)           |
| GET    | /api/appointments/slots     | Available time slots     |

### Queue
| Method | Endpoint        | Description           |
|--------|-----------------|-----------------------|
| GET    | /api/queue      | Today's queue         |
| GET    | /api/queue/my   | My queue status       |
| POST   | /api/queue/join | Join queue            |
| POST   | /api/queue/next | Call next (admin)     |
| PUT    | /api/queue/:id  | Update entry (admin)  |
| DELETE | /api/queue/:id  | Remove (admin)        |

### Other
| Method | Endpoint                   | Description         |
|--------|----------------------------|---------------------|
| GET    | /api/services              | All services        |
| POST   | /api/services              | Add service (admin) |
| GET    | /api/notifications         | User notifications  |
| PUT    | /api/notifications/read-all| Mark all read       |
| GET    | /api/admin/dashboard       | Admin stats         |
| GET    | /api/admin/reports         | Reports data        |
| GET    | /api/schedule              | Get schedule        |
| PUT    | /api/schedule              | Update schedule     |

---

## Data Persistence

All data is stored as JSON files in `server/data/`. The server reads and writes these files on every request — no external database required. Data survives server restarts.

---

*Built with React + Node.js/Express · MCA Academic Project*
