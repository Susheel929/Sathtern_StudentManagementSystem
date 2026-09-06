const http = require('http');
const app = require('./server');
const db = require('./db');
const { seed } = require('./seed');

const PORT = 3099;
let server;

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: PORT,
      ...options
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body: json });
        } catch (_) {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });

    req.on('error', reject);

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting Sathtern Student Management System Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // Start temporary server
  await new Promise((resolve) => {
    server = app.listen(PORT, resolve);
  });

  try {
    // 1. Reset database
    seed();

    // 2. Test GET /api/students
    console.log('\n--- 1. Testing GET /api/students ---');
    const resList = await request({ path: '/api/students', method: 'GET' });
    assert(resList.status === 200, 'Returns HTTP 200 OK');
    assert(resList.body.success === true, 'Response marked as success');
    assert(resList.body.data.students.length > 0, 'Returns list of students');
    assert(resList.body.data.pagination.total >= 12, 'Default seed records loaded');

    // 3. Test Search & Filter
    console.log('\n--- 2. Testing Search and Filtering ---');
    const resSearch = await request({ path: '/api/students?search=Aarav', method: 'GET' });
    assert(resSearch.body.data.students.length >= 1, 'Search query "Aarav" finds student');
    assert(resSearch.body.data.students[0].first_name === 'Aarav', 'Student name matches search');

    const resFilterDept = await request({ path: '/api/students?department=Computer%20Science', method: 'GET' });
    assert(resFilterDept.body.data.students.every(s => s.department === 'Computer Science'), 'Department filter restricts to Computer Science');

    // 4. Test POST /api/students (Add new student)
    console.log('\n--- 3. Testing POST /api/students (Create Student) ---');
    const newStudent = {
      student_id: 'STU-TEST-999',
      first_name: 'Test',
      last_name: 'Intern',
      email: 'test.intern@sathtern.edu',
      phone: '+91 90000 00000',
      department: 'Data Science',
      semester: 3,
      gpa: 3.90,
      enrollment_date: '2025-01-10',
      status: 'Active'
    };

    const resCreate = await request({
      path: '/api/students',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, newStudent);

    assert(resCreate.status === 201, 'Returns HTTP 201 Created');
    assert(resCreate.body.success === true, 'Student created successfully');
    const createdId = resCreate.body.data.id;
    assert(createdId > 0, 'Created student has valid database ID');

    // 5. Test Validation Failures
    console.log('\n--- 4. Testing Input Validation ---');
    const dupStudent = { ...newStudent }; // Duplicate email and ID
    const resDup = await request({
      path: '/api/students',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, dupStudent);
    assert(resDup.status === 400, 'Rejects duplicate student_id/email with HTTP 400');
    assert(resDup.body.errors && resDup.body.errors.length > 0, 'Returns specific validation error messages');

    // 6. Test PUT /api/students/:id (Update student)
    console.log('\n--- 5. Testing PUT /api/students/:id (Update Student) ---');
    const updatePayload = {
      ...newStudent,
      gpa: 3.98,
      status: 'Graduated'
    };
    const resUpdate = await request({
      path: `/api/students/${createdId}`,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, updatePayload);

    assert(resUpdate.status === 200, 'Returns HTTP 200 on update');
    assert(resUpdate.body.data.gpa === 3.98, 'GPA updated to 3.98');
    assert(resUpdate.body.data.status === 'Graduated', 'Status updated to Graduated');

    // 7. Test GET /api/analytics
    console.log('\n--- 6. Testing GET /api/analytics ---');
    const resAnalytics = await request({ path: '/api/analytics', method: 'GET' });
    assert(resAnalytics.status === 200, 'Returns HTTP 200 for analytics');
    assert(resAnalytics.body.data.totalStudents >= 13, 'Analytics reflects new total students count');
    assert(resAnalytics.body.data.averageGpa > 0, 'Average GPA calculated accurately');
    assert(Array.isArray(resAnalytics.body.data.departmentStats), 'Department distribution provided');

    // 8. Test GET /api/export (CSV export)
    console.log('\n--- 7. Testing CSV Export ---');
    const resExport = await request({ path: '/api/export', method: 'GET' });
    assert(resExport.status === 200, 'Returns HTTP 200 for export');
    assert(resExport.headers['content-type'].includes('text/csv'), 'Content-Type is text/csv');
    assert(resExport.body.includes('Student ID,First Name,Last Name'), 'Contains standard CSV headers');
    assert(resExport.body.includes('STU-TEST-999'), 'Includes test student in exported CSV');

    // 9. Test DELETE /api/students/:id
    console.log('\n--- 8. Testing DELETE /api/students/:id ---');
    const resDelete = await request({ path: `/api/students/${createdId}`, method: 'DELETE' });
    assert(resDelete.status === 200, 'Returns HTTP 200 on deletion');
    assert(resDelete.body.success === true, 'Deletion confirmed');

    // Verify it was deleted
    const resGetDeleted = await request({ path: `/api/students/${createdId}`, method: 'GET' });
    assert(resGetDeleted.status === 404, 'Deleted student returns HTTP 404 Not Found');

    // 10. Test POST /api/clear (Clear All Records)
    console.log('\n--- 9. Testing POST /api/clear (Start Fresh) ---');
    const resClear = await request({ path: '/api/clear', method: 'POST' });
    assert(resClear.status === 200, 'Returns HTTP 200 on clear');
    assert(resClear.body.success === true, 'Clear endpoint confirms success');

    const resEmptyList = await request({ path: '/api/students', method: 'GET' });
    assert(resEmptyList.body.data.pagination.total === 0, 'Database is verified completely empty (0 records)');

    // 11. Test adding record from starting into clean database
    console.log('\n--- 10. Testing Adding Record From Starting (Clean Slate) ---');
    const firstRealRecord = {
      student_id: 'STU-2026-001',
      first_name: 'Real',
      last_name: 'Student',
      email: 'real.student@sathtern.edu',
      phone: '+91 91234 56789',
      department: 'Computer Science',
      semester: 1,
      gpa: 4.0,
      enrollment_date: '2026-09-01',
      status: 'Active'
    };
    const resAddFirst = await request({
      path: '/api/students',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, firstRealRecord);
    assert(resAddFirst.status === 201, 'Creates first real student in empty database');
    assert(resAddFirst.body.data.student_id === 'STU-2026-001', 'First student has correct student ID');

    // 12. Test POST /api/seed (Load Demo Data On-Demand)
    console.log('\n--- 11. Testing POST /api/seed (Load Demo Data) ---');
    const resSeed = await request({ path: '/api/seed', method: 'POST' });
    assert(resSeed.status === 200, 'Returns HTTP 200 on demo seed');
    assert(resSeed.body.success === true, 'Demo seed endpoint reports success');

    const resDemoList = await request({ path: '/api/students', method: 'GET' });
    assert(resDemoList.body.data.pagination.total >= 12, 'Demo student records loaded successfully');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    server.close();
  }

  console.log(`\n========================================`);
  console.log(`🎯 Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
