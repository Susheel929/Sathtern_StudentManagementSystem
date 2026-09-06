// State
let state = {
  students: [],
  pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
  search: '',
  department: 'All',
  status: 'All',
  sortBy: 'id',
  sortOrder: 'desc',
  studentToDelete: null
};

// DOM Elements
const studentTableBody = document.getElementById('studentTableBody');
const searchInput = document.getElementById('searchInput');
const filterDepartment = document.getElementById('filterDepartment');
const filterStatus = document.getElementById('filterStatus');
const sortBy = document.getElementById('sortBy');
const btnClearFilters = document.getElementById('btnClearFilters');
const paginationInfo = document.getElementById('paginationInfo');
const paginationControls = document.getElementById('paginationControls');

// Modal Elements
const studentModal = document.getElementById('studentModal');
const modalTitle = document.getElementById('modalTitle');
const studentForm = document.getElementById('studentForm');
const studentDbId = document.getElementById('studentDbId');
const modalAlerts = document.getElementById('modalAlerts');
const btnOpenAddModal = document.getElementById('btnOpenAddModal');
const btnCloseModal = document.getElementById('btnCloseModal');
const btnCancelModal = document.getElementById('btnCancelModal');

// Form Inputs
const inputFirstName = document.getElementById('inputFirstName');
const inputLastName = document.getElementById('inputLastName');
const inputStudentId = document.getElementById('inputStudentId');
const inputEnrollDate = document.getElementById('inputEnrollDate');
const inputEmail = document.getElementById('inputEmail');
const inputPhone = document.getElementById('inputPhone');
const inputDepartment = document.getElementById('inputDepartment');
const inputSemester = document.getElementById('inputSemester');
const inputGpa = document.getElementById('inputGpa');
const inputStatus = document.getElementById('inputStatus');

// View & Delete Modals
const viewModal = document.getElementById('viewModal');
const viewModalContent = document.getElementById('viewModalContent');
const deleteModal = document.getElementById('deleteModal');
const deleteModalPrompt = document.getElementById('deleteModalPrompt');
const btnCancelDelete = document.getElementById('btnCancelDelete');
const btnConfirmDelete = document.getElementById('btnConfirmDelete');

// Top Action Buttons
const btnExportCsv = document.getElementById('btnExportCsv');
const btnLoadDemo = document.getElementById('btnLoadDemo');
const btnClearAll = document.getElementById('btnClearAll');
const clearAllModal = document.getElementById('clearAllModal');
const btnCancelClearAll = document.getElementById('btnCancelClearAll');
const btnConfirmClearAll = document.getElementById('btnConfirmClearAll');
const toastContainer = document.getElementById('toastContainer');

// Stats Elements
const statTotalStudents = document.getElementById('statTotalStudents');
const statAvgGpa = document.getElementById('statAvgGpa');
const statHonorRoll = document.getElementById('statHonorRoll');
const statActiveRatio = document.getElementById('statActiveRatio');

// Toast Notification
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  const bgColors = {
    success: 'bg-emerald-600 text-white shadow-emerald-200',
    error: 'bg-rose-600 text-white shadow-rose-200',
    info: 'bg-indigo-600 text-white shadow-indigo-200'
  };
  const icons = {
    success: 'fa-circle-check',
    error: 'fa-circle-exclamation',
    info: 'fa-circle-info'
  };

  toast.className = `toast-item pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-xs font-semibold ${bgColors[type] || bgColors.info}`;
  toast.innerHTML = `
    <i class="fa-solid ${icons[type] || icons.info}"></i>
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s, transform 0.3s';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Fetch Analytics
async function fetchAnalytics() {
  try {
    const res = await fetch('/api/analytics');
    const json = await res.json();
    if (json.success) {
      const data = json.data;
      statTotalStudents.textContent = data.totalStudents;
      statAvgGpa.textContent = data.averageGpa ? data.averageGpa.toFixed(2) : '0.00';
      statHonorRoll.textContent = data.gpaDistribution.honorRoll || 0;
      const activeCount = data.statusStats?.Active || 0;
      statActiveRatio.textContent = `${activeCount} Active`;
    }
  } catch (err) {
    console.error('Failed to load analytics:', err);
  }
}

// Fetch Students
async function fetchStudents() {
  try {
    const params = new URLSearchParams({
      search: state.search,
      department: state.department,
      status: state.status,
      sortBy: state.sortBy,
      sortOrder: state.sortBy === 'name' ? 'asc' : 'desc',
      page: state.pagination.page,
      limit: state.pagination.limit
    });

    const res = await fetch(`/api/students?${params.toString()}`);
    const json = await res.json();

    if (json.success) {
      state.students = json.data.students;
      state.pagination = json.data.pagination;
      renderTable();
      renderPagination();
    } else {
      showToast(json.error || 'Failed to fetch student records', 'error');
    }
  } catch (err) {
    console.error('Fetch error:', err);
    showToast('Network error while fetching student data', 'error');
  }
}

// Render Table
function renderTable() {
  if (!state.students || state.students.length === 0) {
    const isFiltered = Boolean(state.search || (state.department && state.department !== 'All') || (state.status && state.status !== 'All'));

    if (isFiltered) {
      studentTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-12 text-slate-400">
            <div class="w-12 h-12 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400 mb-2">
              <i class="fa-solid fa-filter-circle-xmark text-xl"></i>
            </div>
            <p class="font-medium text-slate-700">No matching student records found</p>
            <p class="text-xs text-slate-400 mt-0.5">Try adjusting or clearing your search criteria</p>
            <button onclick="document.getElementById('btnClearFilters').click()" class="mt-3 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition">
              <i class="fa-solid fa-filter-circle-xmark mr-1"></i> Clear Filters
            </button>
          </td>
        </tr>
      `;
    } else {
      studentTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-14 px-4">
            <div class="max-w-md mx-auto space-y-3">
              <div class="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center text-2xl shadow-xs">
                <i class="fa-solid fa-graduation-cap"></i>
              </div>
              <div>
                <h4 class="font-bold text-base text-slate-900">No Student Records Yet</h4>
                <p class="text-xs text-slate-500 mt-1 leading-relaxed">
                  Start adding real student records from scratch, or load demo sample data anytime to test and showcase features.
                </p>
              </div>
              <div class="flex items-center justify-center gap-3 pt-2">
                <button onclick="document.getElementById('btnOpenAddModal').click()" class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 active:bg-indigo-800 transition shadow-sm shadow-indigo-200">
                  <i class="fa-solid fa-user-plus"></i>
                  <span>Add First Record</span>
                </button>
                <button onclick="loadDemoData()" class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 active:bg-indigo-200 transition">
                  <i class="fa-solid fa-wand-magic-sparkles text-indigo-600"></i>
                  <span>Load Demo Data</span>
                </button>
              </div>
            </div>
          </td>
        </tr>
      `;
    }
    paginationInfo.textContent = '0 of 0';
    return;
  }

  studentTableBody.innerHTML = state.students.map(s => {
    const initials = `${s.first_name[0] || ''}${s.last_name[0] || ''}`.toUpperCase();
    
    // Status Badge colors
    let statusClass = 'bg-slate-100 text-slate-700 border-slate-200';
    if (s.status === 'Active') statusClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (s.status === 'Graduated') statusClass = 'bg-blue-50 text-blue-700 border-blue-200';
    if (s.status === 'On Leave') statusClass = 'bg-amber-50 text-amber-700 border-amber-200';
    if (s.status === 'Suspended') statusClass = 'bg-rose-50 text-rose-700 border-rose-200';

    // GPA badge colors
    let gpaClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    let gpaTag = 'Honor Roll';
    if (s.gpa < 3.7 && s.gpa >= 3.0) {
      gpaClass = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      gpaTag = 'Good';
    } else if (s.gpa < 3.0 && s.gpa >= 2.0) {
      gpaClass = 'bg-amber-50 text-amber-700 border-amber-200';
      gpaTag = 'Average';
    } else if (s.gpa < 2.0) {
      gpaClass = 'bg-rose-50 text-rose-700 border-rose-200';
      gpaTag = 'Needs Help';
    }

    return `
      <tr class="hover:bg-slate-50/70 transition">
        <!-- Student Identity -->
        <td class="py-3.5 px-4 sm:px-6">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-2xs" style="background-color: ${s.avatar_color || '#4f46e5'}">
              ${initials}
            </div>
            <div>
              <div class="font-semibold text-slate-900">${escapeHtml(s.first_name)} ${escapeHtml(s.last_name)}</div>
              <div class="text-xs text-slate-500">${escapeHtml(s.email)}</div>
            </div>
          </div>
        </td>

        <!-- Student ID -->
        <td class="py-3.5 px-4">
          <span class="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
            ${escapeHtml(s.student_id)}
          </span>
        </td>

        <!-- Department & Semester -->
        <td class="py-3.5 px-4">
          <div class="font-medium text-slate-800 text-xs">${escapeHtml(s.department)}</div>
          <div class="text-xs text-slate-400">Semester ${s.semester}</div>
        </td>

        <!-- GPA -->
        <td class="py-3.5 px-4">
          <div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-bold border ${gpaClass}">
            <i class="fa-solid fa-star text-[10px]"></i>
            <span>${Number(s.gpa).toFixed(2)}</span>
          </div>
        </td>

        <!-- Status -->
        <td class="py-3.5 px-4">
          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${statusClass}">
            ${s.status}
          </span>
        </td>

        <!-- Actions -->
        <td class="py-3.5 px-4 text-right pr-6">
          <div class="inline-flex items-center gap-1">
            <button onclick="viewStudent(${s.id})" class="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition" title="View Profile">
              <i class="fa-solid fa-eye text-xs"></i>
            </button>
            <button onclick="editStudent(${s.id})" class="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-100 transition" title="Edit Student">
              <i class="fa-solid fa-pen text-xs"></i>
            </button>
            <button onclick="confirmDelete(${s.id}, '${escapeHtml(s.first_name)} ${escapeHtml(s.last_name)}', '${escapeHtml(s.student_id)}')" class="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition" title="Delete Student">
              <i class="fa-solid fa-trash-can text-xs"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  const start = (state.pagination.page - 1) * state.pagination.limit + 1;
  const end = Math.min(state.pagination.page * state.pagination.limit, state.pagination.total);
  paginationInfo.textContent = `${state.pagination.total > 0 ? start : 0}-${end} of ${state.pagination.total}`;
}

// Render Pagination Buttons
function renderPagination() {
  const { page, totalPages } = state.pagination;
  paginationControls.innerHTML = '';

  if (totalPages <= 1) return;

  const btnPrev = document.createElement('button');
  btnPrev.className = `px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-medium ${page <= 1 ? 'opacity-40 cursor-not-allowed bg-slate-50' : 'hover:bg-slate-100 text-slate-700 bg-white'}`;
  btnPrev.innerHTML = '<i class="fa-solid fa-chevron-left mr-1"></i> Prev';
  btnPrev.disabled = page <= 1;
  btnPrev.onclick = () => {
    if (page > 1) {
      state.pagination.page--;
      fetchStudents();
    }
  };
  paginationControls.appendChild(btnPrev);

  for (let i = 1; i <= totalPages; i++) {
    const btnPage = document.createElement('button');
    btnPage.className = `w-7 h-7 rounded-lg text-xs font-semibold ${i === page ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700'}`;
    btnPage.textContent = i;
    btnPage.onclick = () => {
      state.pagination.page = i;
      fetchStudents();
    };
    paginationControls.appendChild(btnPage);
  }

  const btnNext = document.createElement('button');
  btnNext.className = `px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-medium ${page >= totalPages ? 'opacity-40 cursor-not-allowed bg-slate-50' : 'hover:bg-slate-100 text-slate-700 bg-white'}`;
  btnNext.innerHTML = 'Next <i class="fa-solid fa-chevron-right ml-1"></i>';
  btnNext.disabled = page >= totalPages;
  btnNext.onclick = () => {
    if (page < totalPages) {
      state.pagination.page++;
      fetchStudents();
    }
  };
  paginationControls.appendChild(btnNext);
}

// Open Add Modal
btnOpenAddModal.addEventListener('click', () => {
  studentDbId.value = '';
  modalTitle.textContent = 'Add New Student';
  modalAlerts.classList.add('hidden');
  modalAlerts.innerHTML = '';
  studentForm.reset();

  // Set default enrollment date to today
  const today = new Date().toISOString().split('T')[0];
  inputEnrollDate.value = today;
  inputStatus.value = 'Active';
  inputSemester.value = '1';

  // Suggest next student ID
  const nextIdNum = state.pagination.total + 1;
  inputStudentId.value = `STU-2026-${String(nextIdNum).padStart(3, '0')}`;

  studentModal.classList.remove('hidden');
  inputFirstName.focus();
});

// Close Add/Edit Modal
function closeModal() {
  studentModal.classList.add('hidden');
}
btnCloseModal.addEventListener('click', closeModal);
btnCancelModal.addEventListener('click', closeModal);

// Form Submit (Create or Update)
studentForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  modalAlerts.classList.add('hidden');
  modalAlerts.innerHTML = '';

  const id = studentDbId.value;
  const isEditing = Boolean(id);

  const payload = {
    first_name: inputFirstName.value.trim(),
    last_name: inputLastName.value.trim(),
    student_id: inputStudentId.value.trim(),
    enrollment_date: inputEnrollDate.value,
    email: inputEmail.value.trim(),
    phone: inputPhone.value.trim(),
    department: inputDepartment.value,
    semester: parseInt(inputSemester.value, 10),
    gpa: parseFloat(inputGpa.value),
    status: inputStatus.value
  };

  try {
    const url = isEditing ? `/api/students/${id}` : '/api/students';
    const method = isEditing ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.success) {
      closeModal();
      showToast(isEditing ? 'Student updated successfully!' : 'Student record created successfully!', 'success');
      fetchStudents();
      fetchAnalytics();
    } else {
      const errList = data.errors ? data.errors.map(e => `<li>• ${escapeHtml(e)}</li>`).join('') : `<li>• ${escapeHtml(data.error || 'Operation failed')}</li>`;
      modalAlerts.innerHTML = `<ul class="space-y-1">${errList}</ul>`;
      modalAlerts.classList.remove('hidden');
    }
  } catch (err) {
    console.error('Submit error:', err);
    modalAlerts.innerHTML = `<li>• Network error. Please try again.</li>`;
    modalAlerts.classList.remove('hidden');
  }
});

// Edit Student
window.editStudent = async function(id) {
  try {
    const res = await fetch(`/api/students/${id}`);
    const json = await res.json();

    if (!json.success || !json.data) {
      showToast('Could not load student record', 'error');
      return;
    }

    const s = json.data;
    studentDbId.value = s.id;
    modalTitle.textContent = `Edit Student: ${s.first_name} ${s.last_name}`;
    modalAlerts.classList.add('hidden');

    inputFirstName.value = s.first_name;
    inputLastName.value = s.last_name;
    inputStudentId.value = s.student_id;
    inputEnrollDate.value = s.enrollment_date;
    inputEmail.value = s.email;
    inputPhone.value = s.phone;
    inputDepartment.value = s.department;
    inputSemester.value = s.semester;
    inputGpa.value = s.gpa;
    inputStatus.value = s.status;

    studentModal.classList.remove('hidden');
  } catch (err) {
    showToast('Failed to retrieve student details', 'error');
  }
};

// View Student Profile Modal
window.viewStudent = async function(id) {
  try {
    const res = await fetch(`/api/students/${id}`);
    const json = await res.json();
    if (!json.success || !json.data) {
      showToast('Could not load student profile', 'error');
      return;
    }

    const s = json.data;
    const initials = `${s.first_name[0] || ''}${s.last_name[0] || ''}`.toUpperCase();

    viewModalContent.innerHTML = `
      <div class="p-6 text-center border-b border-slate-100 bg-slate-50/60">
        <div class="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white font-extrabold text-xl shadow-md mb-3" style="background-color: ${s.avatar_color || '#4f46e5'}">
          ${initials}
        </div>
        <h3 class="font-bold text-lg text-slate-900">${escapeHtml(s.first_name)} ${escapeHtml(s.last_name)}</h3>
        <p class="text-xs font-mono text-indigo-600 font-semibold mt-0.5">${escapeHtml(s.student_id)}</p>
        <div class="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          ${escapeHtml(s.department)} • Sem ${s.semester}
        </div>
      </div>

      <div class="p-6 space-y-3 text-xs">
        <div class="flex justify-between py-1.5 border-b border-slate-100">
          <span class="text-slate-500 font-medium">Email</span>
          <span class="font-semibold text-slate-800">${escapeHtml(s.email)}</span>
        </div>
        <div class="flex justify-between py-1.5 border-b border-slate-100">
          <span class="text-slate-500 font-medium">Phone</span>
          <span class="font-semibold text-slate-800">${escapeHtml(s.phone)}</span>
        </div>
        <div class="flex justify-between py-1.5 border-b border-slate-100">
          <span class="text-slate-500 font-medium">Cumulative GPA</span>
          <span class="font-bold text-emerald-600">${Number(s.gpa).toFixed(2)} / 4.00</span>
        </div>
        <div class="flex justify-between py-1.5 border-b border-slate-100">
          <span class="text-slate-500 font-medium">Status</span>
          <span class="font-semibold text-slate-800">${s.status}</span>
        </div>
        <div class="flex justify-between py-1.5 border-b border-slate-100">
          <span class="text-slate-500 font-medium">Enrollment Date</span>
          <span class="font-semibold text-slate-800">${s.enrollment_date}</span>
        </div>
        <div class="flex justify-between py-1.5">
          <span class="text-slate-500 font-medium">Record Created</span>
          <span class="text-slate-600">${s.created_at}</span>
        </div>
      </div>

      <div class="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
        <button onclick="document.getElementById('viewModal').classList.add('hidden')" class="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 bg-white border border-slate-200 rounded-xl transition">
          Close
        </button>
      </div>
    `;

    viewModal.classList.remove('hidden');
  } catch (err) {
    showToast('Failed to view student', 'error');
  }
};

// Delete Confirmation
window.confirmDelete = function(id, name, studentId) {
  state.studentToDelete = id;
  deleteModalPrompt.innerHTML = `Are you sure you want to delete <strong class="text-slate-900">${name}</strong> (${studentId})? This action cannot be undone.`;
  deleteModal.classList.remove('hidden');
};

btnCancelDelete.addEventListener('click', () => {
  state.studentToDelete = null;
  deleteModal.classList.add('hidden');
});

btnConfirmDelete.addEventListener('click', async () => {
  if (!state.studentToDelete) return;
  const id = state.studentToDelete;

  try {
    const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
    const json = await res.json();

    if (json.success) {
      deleteModal.classList.add('hidden');
      state.studentToDelete = null;
      showToast(json.message || 'Student deleted successfully', 'success');
      fetchStudents();
      fetchAnalytics();
    } else {
      showToast(json.error || 'Failed to delete student', 'error');
    }
  } catch (err) {
    showToast('Error communicating with server', 'error');
  }
});

// Search input with debounce
let searchTimer = null;
searchInput.addEventListener('input', (e) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    state.search = e.target.value;
    state.pagination.page = 1;
    fetchStudents();
  }, 250);
});

// Filter change listeners
filterDepartment.addEventListener('change', (e) => {
  state.department = e.target.value;
  state.pagination.page = 1;
  fetchStudents();
});

filterStatus.addEventListener('change', (e) => {
  state.status = e.target.value;
  state.pagination.page = 1;
  fetchStudents();
});

sortBy.addEventListener('change', (e) => {
  state.sortBy = e.target.value;
  fetchStudents();
});

// Clear filters
btnClearFilters.addEventListener('click', () => {
  searchInput.value = '';
  filterDepartment.value = 'All';
  filterStatus.value = 'All';
  sortBy.value = 'id';

  state.search = '';
  state.department = 'All';
  state.status = 'All';
  state.sortBy = 'id';
  state.pagination.page = 1;

  fetchStudents();
});

// Export CSV
btnExportCsv.addEventListener('click', () => {
  window.location.href = '/api/export';
  showToast('Downloading CSV export...', 'info');
});

// Load Demo Data
window.loadDemoData = async function() {
  try {
    const res = await fetch('/api/seed', { method: 'POST' });
    const json = await res.json();
    if (json.success) {
      showToast(json.message || 'Demo student records loaded successfully!', 'success');
      state.pagination.page = 1;
      fetchStudents();
      fetchAnalytics();
    } else {
      showToast('Failed to load demo data', 'error');
    }
  } catch (err) {
    showToast('Network error while loading demo data', 'error');
  }
};

if (btnLoadDemo) {
  btnLoadDemo.addEventListener('click', () => {
    if (state.pagination.total > 0) {
      if (!confirm('Load demo student records? This will reload the standard sample dataset.')) return;
    }
    loadDemoData();
  });
}

// Clear All Records (Start Fresh)
if (btnClearAll) {
  btnClearAll.addEventListener('click', () => {
    if (state.pagination.total === 0) {
      showToast('Database is already clean and empty.', 'info');
      return;
    }
    if (clearAllModal) {
      clearAllModal.classList.remove('hidden');
    } else if (confirm('Clear all student records to start fresh with real data?')) {
      executeClearAll();
    }
  });
}

if (btnCancelClearAll) {
  btnCancelClearAll.addEventListener('click', () => {
    clearAllModal?.classList.add('hidden');
  });
}

async function executeClearAll() {
  try {
    const res = await fetch('/api/clear', { method: 'POST' });
    const json = await res.json();
    if (json.success) {
      clearAllModal?.classList.add('hidden');
      showToast('All records cleared! You can now add real records from scratch.', 'success');
      state.pagination.page = 1;
      fetchStudents();
      fetchAnalytics();
    } else {
      showToast('Failed to clear records', 'error');
    }
  } catch (err) {
    showToast('Network error while clearing records', 'error');
  }
}

if (btnConfirmClearAll) {
  btnConfirmClearAll.addEventListener('click', executeClearAll);
}

// Utility: Escape HTML to prevent XSS
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
  fetchAnalytics();
  fetchStudents();
});
