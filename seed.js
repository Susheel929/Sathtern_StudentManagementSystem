const db = require('./db');

const initialStudents = [
  {
    student_id: "STU-2026-001",
    first_name: "Aarav",
    last_name: "Sharma",
    email: "aarav.sharma@sathtern.edu",
    phone: "+91 98765 43210",
    department: "Computer Science",
    semester: 6,
    gpa: 3.85,
    enrollment_date: "2023-08-15",
    status: "Active",
    avatar_color: "#4f46e5"
  },
  {
    student_id: "STU-2026-002",
    first_name: "Diya",
    last_name: "Patel",
    email: "diya.patel@sathtern.edu",
    phone: "+91 98765 43211",
    department: "Data Science",
    semester: 4,
    gpa: 3.92,
    enrollment_date: "2024-08-10",
    status: "Active",
    avatar_color: "#059669"
  },
  {
    student_id: "STU-2026-003",
    first_name: "Rohan",
    last_name: "Verma",
    email: "rohan.verma@sathtern.edu",
    phone: "+91 98765 43212",
    department: "Information Technology",
    semester: 8,
    gpa: 3.45,
    enrollment_date: "2022-08-20",
    status: "Graduated",
    avatar_color: "#0284c7"
  },
  {
    student_id: "STU-2026-004",
    first_name: "Ananya",
    last_name: "Iyer",
    email: "ananya.iyer@sathtern.edu",
    phone: "+91 98765 43213",
    department: "Computer Science",
    semester: 2,
    gpa: 3.78,
    enrollment_date: "2025-08-18",
    status: "Active",
    avatar_color: "#7c3aed"
  },
  {
    student_id: "STU-2026-005",
    first_name: "Vikram",
    last_name: "Reddy",
    email: "vikram.reddy@sathtern.edu",
    phone: "+91 98765 43214",
    department: "Electronics & Communication",
    semester: 5,
    gpa: 3.15,
    enrollment_date: "2023-08-15",
    status: "Active",
    avatar_color: "#d97706"
  },
  {
    student_id: "STU-2026-006",
    first_name: "Sneha",
    last_name: "Mukherjee",
    email: "sneha.m@sathtern.edu",
    phone: "+91 98765 43215",
    department: "Business Administration",
    semester: 3,
    gpa: 3.65,
    enrollment_date: "2024-08-10",
    status: "Active",
    avatar_color: "#db2777"
  },
  {
    student_id: "STU-2026-007",
    first_name: "Kabir",
    last_name: "Mehta",
    email: "kabir.mehta@sathtern.edu",
    phone: "+91 98765 43216",
    department: "Mechanical Engineering",
    semester: 7,
    gpa: 2.95,
    enrollment_date: "2022-08-20",
    status: "On Leave",
    avatar_color: "#dc2626"
  },
  {
    student_id: "STU-2026-008",
    first_name: "Pooja",
    last_name: "Nair",
    email: "pooja.nair@sathtern.edu",
    phone: "+91 98765 43217",
    department: "Data Science",
    semester: 6,
    gpa: 3.88,
    enrollment_date: "2023-08-15",
    status: "Active",
    avatar_color: "#0891b2"
  },
  {
    student_id: "STU-2026-009",
    first_name: "Aditya",
    last_name: "Kulkarni",
    email: "aditya.k@sathtern.edu",
    phone: "+91 98765 43218",
    department: "Computer Science",
    semester: 4,
    gpa: 3.52,
    enrollment_date: "2024-08-10",
    status: "Active",
    avatar_color: "#4f46e5"
  },
  {
    student_id: "STU-2026-010",
    first_name: "Meera",
    last_name: "Chopra",
    email: "meera.chopra@sathtern.edu",
    phone: "+91 98765 43219",
    department: "Business Administration",
    semester: 1,
    gpa: 3.40,
    enrollment_date: "2026-01-15",
    status: "Active",
    avatar_color: "#9333ea"
  },
  {
    student_id: "STU-2026-011",
    first_name: "Siddharth",
    last_name: "Rao",
    email: "sid.rao@sathtern.edu",
    phone: "+91 98765 43220",
    department: "Information Technology",
    semester: 5,
    gpa: 2.80,
    enrollment_date: "2023-08-15",
    status: "Active",
    avatar_color: "#ea580c"
  },
  {
    student_id: "STU-2026-012",
    first_name: "Tanvi",
    last_name: "Deshmukh",
    email: "tanvi.d@sathtern.edu",
    phone: "+91 98765 43221",
    department: "Electronics & Communication",
    semester: 8,
    gpa: 3.96,
    enrollment_date: "2022-08-20",
    status: "Graduated",
    avatar_color: "#16a34a"
  }
];

function seed() {
  console.log('🌱 Seeding Student Management System database...');
  db.clearAll();

  for (const s of initialStudents) {
    db.createStudent(s);
  }

  const analytics = db.getAnalytics();
  console.log(`✅ Successfully seeded ${analytics.totalStudents} student records.`);
  console.log(`📊 Average GPA: ${analytics.averageGpa}`);
  console.log('🏛️ Departments:', analytics.departmentStats.map(d => `${d.department} (${d.count})`).join(', '));
}

if (require.main === module) {
  seed();
}

module.exports = { seed, initialStudents };
