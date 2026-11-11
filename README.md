# HRMS - Human Resource Management System

A full-stack Human Resource Management System built with React (Vite + Tailwind CSS) and Node.js (Express + MongoDB).

---

## 📁 Project Structure

```
HRMS/
├── package.json              # Root scripts to run both frontend & backend concurrently
├── README.md
│
├── frontend/                 # React 19 + Vite 8 + Tailwind CSS v4
│   ├── .env                  # Frontend environment variables (VITE_API_URL)
│   ├── .env.example
│   ├── vite.config.js        # Vite config with Tailwind & proxy
│   └── src/
│       ├── main.jsx          # React DOM entry
│       ├── App.jsx           # React Router setup (/login & /)
│       ├── index.css         # Tailwind directives
│       ├── components/
│       │   ├── Logo.jsx                 # Unique geometric HRMS brand logo
│       │   ├── Sidebar.jsx              # Collapsible sidebar (icons-only when closed)
│       │   ├── TabView.jsx              # Active tab view router
│       │   ├── ProtectedRoute.jsx       # Route guard checking token
│       │   ├── ConfirmModal.jsx         # Modern UI confirmation dialog (replaces browser alerts)
│       │   └── AddEditEmployeeModal.jsx # Add & Edit employee modal with credentials
│       ├── views/
│       │   ├── EmployeesView.jsx        # Full Employee Directory & Management
│       │   └── HolidaysView.jsx         # 2026 Company Holiday Calendar & Add modal
│       ├── pages/
│       │   ├── LoginPage.jsx            # Admin & Employee tabbed login
│       │   └── HomePage.jsx             # Protected dashboard with collapsible sidebar & header
│       └── services/
│           ├── api.js                   # Auth API calls & localStorage token helpers
│           ├── employeeService.js       # Employee CRUD API helpers
│           └── holidayService.js        # Holiday calendar API helpers
│
└── backend/                  # Node.js Express REST API (ES Modules)
    ├── .env                  # Port, MongoDB URI, Admin Credentials, JWT Secret
    ├── .env.example
    └── src/
        ├── server.js         # Express app entry & seed admin / sample employees
        ├── config/
        │   └── db.js         # Mongoose MongoDB connection
        ├── models/
        │   ├── User.js       # User schema with bcrypt hashing
        │   ├── Employee.js   # Employee schema with bcrypt password for login
        │   └── Holiday.js    # 2026 Company holiday schema
        ├── controllers/
        │   ├── authController.js     # Admin & Employee login handler
        │   ├── employeeController.js # Employee CRUD handlers
        │   └── holidayController.js  # Holiday calendar handlers
        └── routes/
            ├── authRoutes.js     # POST /api/auth/login
            ├── employeeRoutes.js # GET/POST/PUT/DELETE /api/employees
            └── holidayRoutes.js  # GET/POST/DELETE /api/holidays
```

---

## 🚫 No Browser Native Alerts (`ConfirmModal`)

All confirmation dialogs use a modern dark-themed modal (`ConfirmModal.jsx`):
- Translucent backdrop blur with smooth scale-up animation.
- Destructive warning icons and clear confirmation copy.
- Keyboard accessible (closes on `Escape`).
- Supports loading states during backend deletion.

---

## 🧭 Navigation & Sidebar Tabs

1. **Dashboard** → System overview & workforce metrics.
2. **Employees** → Staff directory with Add/Edit/Delete, live search, department filter, and login password creation.
3. **Holidays** → 2026 company holiday schedule with month badges and Add Holiday modal.
4. **Leaves** → Leave tracker and balance quotas.
5. **Payroll** → Salary structures and pay period details.

---

## 🚀 Running the Project

From root (`d:\HRMS`):
```bash
npm run dev
```

* **Frontend**: [http://localhost:3000](http://localhost:3000)
* **Backend API**: [http://localhost:5000](http://localhost:5000)
