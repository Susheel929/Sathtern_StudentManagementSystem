# Sathtern_StudentManagementSystem

> **Sathtern Virtual Internship Program — Task 1 Deliverable**  
> **Domain:** Full Stack Development  
> **Repository Format:** `Sathtern_StudentManagementSystem`

---

## 📌 Project Overview

**Sathtern Student Management System** is a full-stack web application developed as part of the Sathtern Virtual Internship Program. It provides educational institutions and administrators with an intuitive, responsive dashboard to manage student records, track academic progress, search and filter enrollment data, visualize department distributions, and export data.

---

## 🚀 Features Required & Implemented

| Requirement | Implementation Details | Status |
| :--- | :--- | :---: |
| **Add Student Records** | Modal form with instant validation (first/last name, roll number, email, phone, department, semester 1–8, GPA 0.00–4.00, enrollment date, status). | ✅ Complete |
| **Update Student Information** | Pre-populated modal editor with duplicate checks and audit timestamp tracking (`updated_at`). | ✅ Complete |
| **Delete Student Records** | Confirmation dialog with student name safety check, instantaneous UI sync and database deletion. | ✅ Complete |
| **Search Students** | Debounced real-time search across names, student roll IDs, emails, and departments. | ✅ Complete |
| **Database Integration** | Persistent SQLite database schema with indexes on search terms, departments, and status; zero-config setup. | ✅ Complete |
| **Responsive User Interface** | Tailwind CSS responsive layout with statistics cards, data tables, modals, badges, toast notifications, and mobile drawer support. | ✅ Complete |

### 🌟 Additional Enhancements
- **Real Records & Clean Slate**: Starts clean ready to add real student records from scratch without forced dummy data.
- **On-Demand Demo Data**: Instant 1-click **"Load Demo Data"** button to load 12 realistic sample student records whenever needed for demonstration.
- **Clear All / Start Fresh**: One-click database reset to wipe records and start adding new student records from scratch anytime.
- **Analytics Dashboard**: Instant statistics for Total Enrolled, Average GPA, Honor Roll students (GPA &ge; 3.70), and Active status counts.
- **CSV Data Export**: One-click data download formatted for Excel/Google Sheets (`/api/export`).
- **Automated Test Suite**: 34 unit and integration test assertions covering all API endpoints and validation logic (`npm test`).

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, Modern CSS / Tailwind CSS (CDN), FontAwesome 6, Google Fonts (Plus Jakarta Sans).
- **Backend**: Node.js, Express.js, CORS.
- **Database**: SQLite (Node native synchronous database engine with indexed schemas).
- **Testing**: Node.js Automated Test Suite (`test.js`).

---

## 📁 Directory Structure

```
Sathtern_StudentManagementSystem/
├── package.json              # Project dependencies & scripts
├── server.js                 # Express application & REST API routing
├── db.js                     # SQLite database schema, queries, and helper layer
├── seed.js                   # Pre-seeded database generator with realistic students
├── test.js                   # Automated test suite (26 assertions)
├── README.md                 # Project documentation & usage guide
├── LINKEDIN_POST.md          # Ready-to-use LinkedIn announcement template
├── students.db               # SQLite database file (created automatically)
└── public/
    ├── index.html            # Responsive single-page dashboard
    ├── app.js                # Frontend state management, AJAX CRUD, search/filter
    └── style.css             # UI styling & animations
```

---

## ⚡ Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended; built-in SQLite supported on Node 22+)
- [Git](https://git-scm.com/)

### 1. Installation
Navigate to the project directory and install the required dependencies:
```bash
cd Sathtern_StudentManagementSystem
npm install
```

### 2. Seed Sample Data (Optional)
To preload sample student records:
```bash
npm run seed
```

### 3. Run the Application
Start the local Express server:
```bash
npm start
```
Open your browser and navigate to:
```
http://localhost:3001
```

### 4. Run Automated Tests
Execute the end-to-end API test suite:
```bash
npm test
```

---

## 📡 REST API Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/students` | Get paginated list of students. Query params: `search`, `department`, `status`, `sortBy`, `sortOrder`, `page`, `limit`. |
| `GET` | `/api/students/:id` | Retrieve a single student's details by database ID. |
| `POST` | `/api/students` | Add a new student record (JSON body with validation). |
| `PUT` | `/api/students/:id` | Update an existing student record. |
| `DELETE` | `/api/students/:id` | Remove a student record from the database. |
| `GET` | `/api/analytics` | Summary stats (total students, avg GPA, department breakdown, GPA brackets). |
| `GET` | `/api/export` | Download full student database as a `.csv` file. |
| `POST` | `/api/seed` | Load and populate database with standard demo student records. |
| `POST` | `/api/clear` | Clear all student records to start fresh from scratch. |

### Sample JSON Request Payload (`POST /api/students`)
```json
{
  "student_id": "STU-2026-042",
  "first_name": "Priya",
  "last_name": "Kapur",
  "email": "priya.kapur@sathtern.edu",
  "phone": "+91 98765 12345",
  "department": "Computer Science",
  "semester": 4,
  "gpa": 3.82,
  "enrollment_date": "2024-08-15",
  "status": "Active"
}
```

---

## 🎓 Sathtern Virtual Internship Submission

- **Internship Domain**: Full Stack Development
- **Task Number**: Task 1 (Student Management System)
- **GitHub Repository Tag**: `Sathtern_StudentManagementSystem`
- **Submission Requirements**: Refer to `LINKEDIN_POST.md` for the LinkedIn post template and demo instructions.
