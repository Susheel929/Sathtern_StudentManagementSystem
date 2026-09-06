const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const DB_PATH = path.join(__dirname, 'students.db');

class StudentDatabase {
  constructor(dbPath = DB_PATH) {
    this.db = new DatabaseSync(dbPath);
    this.init();
  }

  init() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id TEXT UNIQUE NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT NOT NULL,
        department TEXT NOT NULL,
        semester INTEGER NOT NULL,
        gpa REAL NOT NULL,
        enrollment_date TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Active',
        avatar_color TEXT DEFAULT '#4f46e5',
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_students_search ON students(first_name, last_name, email, student_id);
      CREATE INDEX IF NOT EXISTS idx_students_dept ON students(department);
      CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
    `);
  }

  getAllStudents({ search = '', department = '', status = '', sortBy = 'id', sortOrder = 'desc', page = 1, limit = 50 } = {}) {
    let whereClauses = [];
    let params = [];

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      whereClauses.push(`(
        first_name LIKE ? OR 
        last_name LIKE ? OR 
        email LIKE ? OR 
        student_id LIKE ? OR 
        department LIKE ?
      )`);
      params.push(term, term, term, term, term);
    }

    if (department && department.trim() !== '' && department !== 'All') {
      whereClauses.push('department = ?');
      params.push(department.trim());
    }

    if (status && status.trim() !== '' && status !== 'All') {
      whereClauses.push('status = ?');
      params.push(status.trim());
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Total count for pagination
    const countSql = `SELECT COUNT(*) AS total FROM students ${whereSql}`;
    const totalRow = this.db.prepare(countSql).get(...params);
    const total = totalRow ? Number(totalRow.total) : 0;

    // Sorting safe whitelist
    const validSortCols = {
      id: 'id',
      name: 'first_name',
      student_id: 'student_id',
      gpa: 'gpa',
      semester: 'semester',
      enrollment_date: 'enrollment_date'
    };
    const sortCol = validSortCols[sortBy] || 'id';
    const direction = (sortOrder || '').toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const querySql = `
      SELECT * FROM students 
      ${whereSql} 
      ORDER BY ${sortCol} ${direction} 
      LIMIT ? OFFSET ?
    `;

    const students = this.db.prepare(querySql).all(...params, parseInt(limit, 10), offset);

    return {
      students,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / parseInt(limit, 10)) || 1
      }
    };
  }

  getStudentById(id) {
    return this.db.prepare('SELECT * FROM students WHERE id = ?').get(id) || null;
  }

  getStudentByStudentId(studentId) {
    return this.db.prepare('SELECT * FROM students WHERE student_id = ?').get(studentId) || null;
  }

  getStudentByEmail(email) {
    return this.db.prepare('SELECT * FROM students WHERE LOWER(email) = LOWER(?)').get(email) || null;
  }

  createStudent(data) {
    const avatarColors = ['#4f46e5', '#0284c7', '#059669', '#d97706', '#dc2626', '#7c3aed', '#db2777', '#0891b2'];
    const randomColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];

    const stmt = this.db.prepare(`
      INSERT INTO students (
        student_id, first_name, last_name, email, phone, 
        department, semester, gpa, enrollment_date, status, avatar_color
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.student_id,
      data.first_name,
      data.last_name,
      data.email,
      data.phone,
      data.department,
      parseInt(data.semester, 10),
      parseFloat(data.gpa),
      data.enrollment_date,
      data.status || 'Active',
      data.avatar_color || randomColor
    );

    return this.getStudentById(result.lastInsertRowid);
  }

  updateStudent(id, data) {
    const stmt = this.db.prepare(`
      UPDATE students 
      SET student_id = ?, first_name = ?, last_name = ?, email = ?, phone = ?, 
          department = ?, semester = ?, gpa = ?, enrollment_date = ?, status = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `);

    stmt.run(
      data.student_id,
      data.first_name,
      data.last_name,
      data.email,
      data.phone,
      data.department,
      parseInt(data.semester, 10),
      parseFloat(data.gpa),
      data.enrollment_date,
      data.status || 'Active',
      id
    );

    return this.getStudentById(id);
  }

  deleteStudent(id) {
    const student = this.getStudentById(id);
    if (!student) return null;
    this.db.prepare('DELETE FROM students WHERE id = ?').run(id);
    return student;
  }

  getAnalytics() {
    const totalRow = this.db.prepare('SELECT COUNT(*) AS count, AVG(gpa) AS avg_gpa FROM students').get();
    const total = totalRow ? Number(totalRow.count) : 0;
    const avgGpa = totalRow && totalRow.avg_gpa !== null ? Number(parseFloat(totalRow.avg_gpa).toFixed(2)) : 0;

    const deptRows = this.db.prepare(`
      SELECT department, COUNT(*) AS count, AVG(gpa) AS avg_gpa 
      FROM students 
      GROUP BY department 
      ORDER BY count DESC
    `).all();

    const statusRows = this.db.prepare(`
      SELECT status, COUNT(*) AS count 
      FROM students 
      GROUP BY status
    `).all();

    const gpaBrackets = this.db.prepare(`
      SELECT 
        SUM(CASE WHEN gpa >= 3.7 THEN 1 ELSE 0 END) AS honor_roll,
        SUM(CASE WHEN gpa >= 3.0 AND gpa < 3.7 THEN 1 ELSE 0 END) AS good_standing,
        SUM(CASE WHEN gpa >= 2.0 AND gpa < 3.0 THEN 1 ELSE 0 END) AS average,
        SUM(CASE WHEN gpa < 2.0 THEN 1 ELSE 0 END) AS needs_improvement
      FROM students
    `).get();

    return {
      totalStudents: total,
      averageGpa: avgGpa,
      departmentStats: deptRows.map(r => ({
        department: r.department,
        count: Number(r.count),
        avgGpa: Number(parseFloat(r.avg_gpa || 0).toFixed(2))
      })),
      statusStats: statusRows.reduce((acc, r) => {
        acc[r.status] = Number(r.count);
        return acc;
      }, {}),
      gpaDistribution: {
        honorRoll: Number(gpaBrackets?.honor_roll || 0),
        goodStanding: Number(gpaBrackets?.good_standing || 0),
        average: Number(gpaBrackets?.average || 0),
        needsImprovement: Number(gpaBrackets?.needs_improvement || 0)
      }
    };
  }

  clearAll() {
    this.db.exec("DELETE FROM students;");
    try {
      this.db.exec("DELETE FROM sqlite_sequence WHERE name = 'students';");
    } catch (_) {}
  }
}

module.exports = new StudentDatabase();
module.exports.StudentDatabase = StudentDatabase;
