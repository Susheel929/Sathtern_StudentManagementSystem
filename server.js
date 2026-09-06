const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');
const { seed, initialStudents } = require('./seed');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


// Validation helper
function validateStudent(data, currentId = null) {
  const errors = [];

  if (!data.first_name || !data.first_name.trim()) errors.push('First name is required.');
  if (!data.last_name || !data.last_name.trim()) errors.push('Last name is required.');
  if (!data.student_id || !data.student_id.trim()) errors.push('Student ID / Roll Number is required.');
  if (!data.email || !data.email.trim()) {
    errors.push('Email is required.');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) errors.push('Invalid email format.');
  }
  if (!data.phone || !data.phone.trim()) errors.push('Phone number is required.');
  if (!data.department || !data.department.trim()) errors.push('Department is required.');

  const sem = parseInt(data.semester, 10);
  if (isNaN(sem) || sem < 1 || sem > 8) errors.push('Semester must be an integer between 1 and 8.');

  const gpa = parseFloat(data.gpa);
  if (isNaN(gpa) || gpa < 0.0 || gpa > 4.0) errors.push('GPA must be a number between 0.00 and 4.00.');

  if (!data.enrollment_date || isNaN(Date.parse(data.enrollment_date))) {
    errors.push('Valid enrollment date is required (YYYY-MM-DD).');
  }

  // Check unique student_id
  const existingId = db.getStudentByStudentId(data.student_id.trim());
  if (existingId && (!currentId || existingId.id !== parseInt(currentId, 10))) {
    errors.push(`Student ID "${data.student_id}" is already registered.`);
  }

  // Check unique email
  const existingEmail = db.getStudentByEmail(data.email.trim());
  if (existingEmail && (!currentId || existingEmail.id !== parseInt(currentId, 10))) {
    errors.push(`Email "${data.email}" is already registered.`);
  }

  return errors;
}

// API Routes

// GET /api/students - List students with search, filter, pagination
app.get('/api/students', (req, res) => {
  try {
    const { search, department, status, sortBy, sortOrder, page, limit } = req.query;
    const result = db.getAllStudents({
      search: search || '',
      department: department || '',
      status: status || '',
      sortBy: sortBy || 'id',
      sortOrder: sortOrder || 'desc',
      page: page || 1,
      limit: limit || 50
    });
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/students/:id - Fetch student by ID
app.get('/api/students/:id', (req, res) => {
  try {
    const student = db.getStudentById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found.' });
    }
    res.json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/students - Create new student
app.post('/api/students', (req, res) => {
  try {
    const errors = validateStudent(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const newStudent = db.createStudent({
      student_id: req.body.student_id.trim(),
      first_name: req.body.first_name.trim(),
      last_name: req.body.last_name.trim(),
      email: req.body.email.trim().toLowerCase(),
      phone: req.body.phone.trim(),
      department: req.body.department.trim(),
      semester: parseInt(req.body.semester, 10),
      gpa: parseFloat(req.body.gpa),
      enrollment_date: req.body.enrollment_date,
      status: req.body.status || 'Active',
      avatar_color: req.body.avatar_color
    });

    res.status(201).json({
      success: true,
      message: 'Student record added successfully.',
      data: newStudent
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/students/:id - Update student record
app.put('/api/students/:id', (req, res) => {
  try {
    const id = req.params.id;
    const existing = db.getStudentById(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Student not found.' });
    }

    const errors = validateStudent(req.body, id);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const updated = db.updateStudent(id, {
      student_id: req.body.student_id.trim(),
      first_name: req.body.first_name.trim(),
      last_name: req.body.last_name.trim(),
      email: req.body.email.trim().toLowerCase(),
      phone: req.body.phone.trim(),
      department: req.body.department.trim(),
      semester: parseInt(req.body.semester, 10),
      gpa: parseFloat(req.body.gpa),
      enrollment_date: req.body.enrollment_date,
      status: req.body.status || 'Active'
    });

    res.json({
      success: true,
      message: 'Student record updated successfully.',
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/students/:id - Delete student record
app.delete('/api/students/:id', (req, res) => {
  try {
    const id = req.params.id;
    const deleted = db.deleteStudent(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Student not found.' });
    }
    res.json({
      success: true,
      message: `Student ${deleted.first_name} ${deleted.last_name} (${deleted.student_id}) deleted successfully.`,
      data: deleted
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/analytics - Summary metrics for dashboard
app.get('/api/analytics', (req, res) => {
  try {
    const analytics = db.getAnalytics();
    res.json({ success: true, data: analytics });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/export - Export student records as CSV
app.get('/api/export', (req, res) => {
  try {
    const { students } = db.getAllStudents({ limit: 10000 });
    const headers = ['ID', 'Student ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Department', 'Semester', 'GPA', 'Enrollment Date', 'Status', 'Created At'];
    
    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = students.map(s => [
      s.id,
      escapeCsv(s.student_id),
      escapeCsv(s.first_name),
      escapeCsv(s.last_name),
      escapeCsv(s.email),
      escapeCsv(s.phone),
      escapeCsv(s.department),
      s.semester,
      s.gpa.toFixed(2),
      s.enrollment_date,
      escapeCsv(s.status),
      s.created_at
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="sathtern_students.csv"');
    res.status(200).send(csvContent);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/clear - Clear all student records to start fresh
app.post('/api/clear', (req, res) => {
  try {
    db.clearAll();
    res.json({ success: true, message: 'All student records cleared successfully. Database is now clean.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/seed - Load default demo student records
app.post('/api/seed', (req, res) => {
  try {
    seed();
    res.json({ success: true, message: 'Demo student records loaded successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// SPA catch-all
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Sathtern Student Management System running at http://localhost:${PORT}`);
    console.log(`📁 Static files served from ./public`);
  });
}

module.exports = app;
