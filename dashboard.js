// Main Dashboard Logic

let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Auth Check
    const storedUser = sessionStorage.getItem('gluckoUser');
    if (!storedUser) {
        window.location.href = 'index.html';
        return;
    }
    currentUser = JSON.parse(storedUser);

    // Sidebar User Profile Initialization
    if (currentUser) {
        const userInfo = document.getElementById('sidebar-user-info');
        if (userInfo) {
            userInfo.innerHTML = `
                <span class="doc-name">${currentUser.name}</span>
                <span>${currentUser.role === 'admin' ? 'Administrator' : 'Doctor (' + currentUser.id + ')'}</span>
            `;
        }
    }

    // 2. Tab Navigation Setup
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            const targetId = item.getAttribute('data-tab');
            document.querySelectorAll('.tab-pane').forEach(t => t.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');

            // Update Header Title depending on content
            if (targetId === 'tab-databases') {
                document.getElementById('page-title').textContent = 'User Access';
            } else if (targetId === 'tab-dashboard') {
                document.getElementById('page-title').textContent = 'Dashboard';
            } else {
                document.getElementById('page-title').textContent = item.textContent.trim();
            }

            // Render specific components
            if (targetId === 'tab-databases') renderEmployees();
            if (targetId === 'tab-patient-search') renderPatients(window.GluckoState.patients);
            if (targetId === 'tab-dashboard') renderHistory();
        });
    });

    // Sub-renders
    renderEmployees();
    renderHistory();
});

function logout() {
    if (confirm('Are you sure you want to sign out?')) {
        sessionStorage.removeItem('gluckoUser');
        window.location.href = 'index.html';
    }
}

// ============== DATABASES (HOSPITAL EMPLOYEES) ==============

function renderEmployees() {
    const tbody = document.querySelector('#employees-table tbody');
    tbody.innerHTML = '';

    window.GluckoState.employees.forEach(emp => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${emp.id}</td>
            <td>${emp.name}</td>
            <td>${emp.role.charAt(0).toUpperCase() + emp.role.slice(1)}</td>
            <td>${emp.hospital ? emp.hospital : '-'}</td>
            <td>${emp.email || '-'}</td>
            <td>${emp.phone || '-'}</td>
            <td>
                <button class="btn-text" onclick="editEmployee('${emp.id}')" style="display: inline-flex; align-items: center; gap: 0.25rem; margin-right: 0.5rem;" title="Edit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    Edit
                </button>
                <button class="btn-text" style="color: var(--a1); display: inline-flex; align-items: center; gap: 0.25rem;" onclick="removeEmployee('${emp.id}')" title="Remove">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    Remove
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openAddEmployeeModal() {
    document.getElementById('em-id').value = '';
    document.getElementById('em-name').value = '';
    document.getElementById('em-phone').value = '';
    document.getElementById('em-email').value = '';
    document.getElementById('em-password').value = '';
    document.getElementById('em-title').textContent = 'Add/Edit User';

    // Setup hospital dropdown
    const hospitalSelect = document.getElementById('em-hospital');
    if (hospitalSelect) {
        hospitalSelect.innerHTML = '';
        const hospitals = window.GluckoState.hospitals || [];
        hospitals.forEach(h => {
            hospitalSelect.innerHTML += `<option value="${h}">${h}</option>`;
        });
    }

    document.getElementById('employee-modal').classList.remove('hidden');
}

function removeEmployee(id) {
    if (confirm('Are you sure you want to remove this employee profile?')) {
        window.GluckoState.employees = window.GluckoState.employees.filter(e => e.id !== id);
        renderEmployees();
    }
}

function editEmployee(id) {
    const emp = window.GluckoState.employees.find(e => e.id === id);
    if (!emp) return;
    openAddEmployeeModal();
    document.getElementById('em-id').value = emp.id;
    document.getElementById('em-name').value = emp.name;
    document.getElementById('em-phone').value = emp.phone || '';
    document.getElementById('em-email').value = emp.email || '';
    document.getElementById('em-password').value = emp.password || '';
    if (document.getElementById('em-hospital')) {
        document.getElementById('em-hospital').value = emp.hospital || '';
    }
}

function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
}

function saveEmployee() {
    const id = document.getElementById('em-id').value;
    const name = document.getElementById('em-name').value;
    const phone = document.getElementById('em-phone').value;
    const email = document.getElementById('em-email').value;
    const pwd = document.getElementById('em-password').value;
    const hosp = document.getElementById('em-hospital') ? document.getElementById('em-hospital').value : currentUser.hospital;

    const missing = [];
    if (!id) missing.push("Employee ID");
    if (!name) missing.push("Name");
    if (!hosp) missing.push("Hospital");
    if (!phone) missing.push("Phone Number");
    if (!email) missing.push("Email");
    if (!pwd) missing.push("Password");

    if (missing.length > 0) {
        alert("Please fill in the following required fields: " + missing.join(", "));
        return;
    }

    let emp = window.GluckoState.employees.find(e => e.id === id);
    if (emp) {
        emp.name = name;
        emp.phone = phone;
        emp.email = email;
        emp.password = pwd || emp.password;
        emp.hospital = hosp;
    } else {
        window.GluckoState.employees.push({
            id, name, phone, email, password: pwd, role: 'doctor', hospital: hosp || 'Unassigned'
        });
        alert('New user has been successfully added!');
    }

    renderEmployees();
    closeModal('employee-modal');
}

// ============== PATIENT SEARCH & PROFILE ==============

function renderPatients(patientArray) {
    const list = document.getElementById('patient-list');
    list.innerHTML = '';

    patientArray.forEach(p => {
        const card = document.createElement('div');
        card.className = 'card patient-card';
        card.onclick = () => viewPatientProfile(p.id);
        const statusClass = p.status === 'Stable' ? 'status-stable' : 'status-high';
        card.innerHTML = `
            <div class="pc-header">
                <h4>${p.name}</h4>
                <span class="status-indicator ${statusClass}">${p.status}</span>
            </div>
            <span class="pc-id" style="display:block; margin-top:0.25rem;">ID: ${p.id} • Age ${p.age} • Birthday: ${p.birthday || 'N/A'} • Weight: ${p.weight || 'N/A'}</span>
            <div style="display: flex; justify-content: space-between; margin-top: 1rem; align-items: flex-end;">
                <div>
                    <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--gray); letter-spacing: 0.5px; margin-bottom: 0.25rem;">LATEST GLUCOSE</div>
                    <div style="font-size: 1.25rem; font-weight: 600; color: var(--db); line-height: 1;">${p.latestGlucose} <span style="font-size: 0.85rem; font-weight: 400; color: var(--gray);">mg/dL</span></div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--gray); letter-spacing: 0.5px; margin-bottom: 0.25rem;">GMI</div>
                    <div style="font-size: 1.1rem; font-weight: 600; color: var(--db); line-height: 1;">${p.gmi || '-'}</div>
                </div>
            </div>
        `;
        list.appendChild(card);
    });
}

function searchPatients() {
    const query = document.getElementById('patient-search-input').value.toLowerCase();
    const filtered = window.GluckoState.patients.filter(p =>
        p.name.toLowerCase().includes(query) || p.id.toLowerCase().includes(query)
    );
    renderPatients(filtered);

    // Show clear search button if query is active
    if (query.trim() !== '') {
        document.getElementById('clear-search-btn').classList.remove('hidden');
    } else {
        document.getElementById('clear-search-btn').classList.add('hidden');
    }
}

function clearPatientSearch() {
    document.getElementById('patient-search-input').value = '';
    renderPatients(window.GluckoState.patients);
    document.getElementById('clear-search-btn').classList.add('hidden');
}

let activePatientProfileId = null;

function viewPatientProfile(id) {
    const patient = window.GluckoState.patients.find(p => p.id === id);
    if (!patient) return;

    activePatientProfileId = id;

    document.getElementById('patient-list').classList.add('hidden');
    document.querySelector('.search-bar').classList.add('hidden');
    document.getElementById('patient-profile-view').classList.remove('hidden');

    document.getElementById('page-title').textContent = 'Profile: ' + patient.name;

    // Profile Hierarchy
    document.getElementById('pp-name').textContent = patient.name;
    document.getElementById('pp-id').textContent = `(${patient.id})`;
    document.getElementById('pp-info').textContent = `Age: ${patient.age} • Birthday: ${patient.birthday || 'N/A'} • Weight: ${patient.weight || 'N/A'}`;
    document.getElementById('pp-medical').innerHTML = `<span style="font-weight: 600;">${patient.type}</span> — ${patient.prescribedMedication || 'None'}`;

    document.getElementById('pp-latest-glucose').textContent = patient.latestGlucose + ' mg/dL';
    document.getElementById('pp-gmi').textContent = patient.gmi || 'N/A';

    // Status Badge
    const badge = document.getElementById('pp-status-badge');
    badge.textContent = patient.status;
    badge.className = 'status-indicator ' + (patient.status === 'Stable' ? 'status-stable' : 'status-high');
    if (patient.status === 'Low') badge.style.backgroundColor = '#FEF08A'; // Yellow-ish for low
    else badge.style.backgroundColor = '';

    const recordsList = document.getElementById('pp-records');
    recordsList.innerHTML = '';
    patient.records.forEach(r => {
        if (r.type !== 'Meal') {
            recordsList.innerHTML += `<li class="record-item"><span class="ri-title">${r.type}</span><span class="ri-detail">${r.detail}</span></li>`;
        }
    });

    // Reset Dropdown logic
    const avgSelect = document.getElementById('pp-avg-select');
    if (avgSelect) avgSelect.value = 'Today';
    updateActivityAverage();

    // Render chart
    setTimeout(() => {
        renderGlucoseChart('glucose-chart', patient.latestGlucose);
    }, 100);
}

function openEditPatientModal() {
    if (!activePatientProfileId) return;
    const patient = window.GluckoState.patients.find(p => p.id === activePatientProfileId);
    if (!patient) return;

    document.getElementById('ep-name').value = patient.name || '';
    document.getElementById('ep-birthday').value = patient.birthday || '';
    document.getElementById('ep-weight').value = patient.weight || '';
    document.getElementById('ep-type').value = patient.type || '';
    document.getElementById('ep-meds').value = patient.prescribedMedication || '';

    document.getElementById('edit-patient-modal').classList.remove('hidden');
}

function saveEditPatient() {
    if (!activePatientProfileId) return;
    const patient = window.GluckoState.patients.find(p => p.id === activePatientProfileId);
    if (!patient) return;

    const name = document.getElementById('ep-name').value;
    if (!name) {
        alert("Please fill in the required field: Full Name.");
        return;
    }

    patient.name = name;
    patient.birthday = document.getElementById('ep-birthday').value;
    patient.weight = document.getElementById('ep-weight').value;
    patient.type = document.getElementById('ep-type').value;
    patient.prescribedMedication = document.getElementById('ep-meds').value;

    closeModal('edit-patient-modal');
    alert('Patient info successfully updated!');

    renderPatients(window.GluckoState.patients);
    viewPatientProfile(activePatientProfileId);
}

function updateActivityAverage() {
    const period = document.getElementById('pp-avg-select') ? document.getElementById('pp-avg-select').value : 'Today';
    const chartTitle = document.getElementById('pp-chart-title');
    if (chartTitle) chartTitle.textContent = `Glucose Chart (${period.toLowerCase()})`;

    const avgContainer = document.getElementById('pp-daily-activities');
    if (!avgContainer) return;

    if (period === 'Today') {
        avgContainer.innerHTML = `
            <div class="stat-box" style="text-align: left; background-color: var(--lb);"><strong style="display:block; font-size: 0.8rem; color: var(--gray);">Exercise</strong> 30 mins</div>
            <div class="stat-box" style="text-align: left; background-color: var(--lb);"><strong style="display:block; font-size: 0.8rem; color: var(--gray);">Water Intake</strong> 64 oz</div>
            <div class="stat-box" style="text-align: left; background-color: var(--lb);"><strong style="display:block; font-size: 0.8rem; color: var(--gray);">Food Intake</strong> 1800 kcal (Tracked)</div>
            <div class="stat-box" style="text-align: left; background-color: var(--lb);"><strong style="display:block; font-size: 0.8rem; color: var(--gray);">Sleep</strong> 7h 15m</div>
        `;
    } else {
        avgContainer.innerHTML = `
            <div class="stat-box" style="text-align: left; background-color: var(--lb);"><strong style="display:block; font-size: 0.8rem; color: var(--gray);">Exercise</strong> Avg 30 mins</div>
            <div class="stat-box" style="text-align: left; background-color: var(--lb);"><strong style="display:block; font-size: 0.8rem; color: var(--gray);">Water Intake</strong> Avg 64 oz</div>
            <div class="stat-box" style="text-align: left; background-color: var(--lb);"><strong style="display:block; font-size: 0.8rem; color: var(--gray);">Food Intake</strong> Avg 1800 kcal</div>
            <div class="stat-box" style="text-align: left; background-color: var(--lb);"><strong style="display:block; font-size: 0.8rem; color: var(--gray);">Sleep</strong> Avg 7h 15m</div>
        `;
    }

    if (typeof renderGlucoseChart === 'function') {
        const pt = window.GluckoState.patients.find(p => p.id === activePatientProfileId);
        renderGlucoseChart('glucose-chart', pt ? pt.latestGlucose : 120, period);
    }
}

function downloadHealthRecords() {
    const date = document.getElementById('hr-date').value;
    const timeframe = document.getElementById('hr-timeframe').value;
    if (!date && !timeframe) {
        alert("Please fill in the required fields: Select Date, Timeframe.");
        return;
    }
    if (!date) {
        alert("Please fill in the required field: Select Date.");
        return;
    }
    if (!timeframe) {
        alert("Please fill in the required field: Timeframe.");
        return;
    }
    alert('Health records successfully downloaded!');
}

function closePatientProfile() {
    document.getElementById('patient-profile-view').classList.add('hidden');
    document.getElementById('patient-list').classList.remove('hidden');
    document.querySelector('.search-bar').classList.remove('hidden');
    document.getElementById('page-title').textContent = 'Patient Search';
}

// ============== ADD HEALTH VISIT ==============

let selectedVisitPatient = null;

function renderPatientAutocomplete(query) {
    let container = document.getElementById('autocomplete-results');
    if (!container) {
        container = document.createElement('div');
        container.id = 'autocomplete-results';
        document.getElementById('visit-patient-search').parentNode.appendChild(container);
    }
    container.innerHTML = '';
    if (!query) return;

    const results = window.GluckoState.patients.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
    results.forEach(p => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        item.textContent = p.name;
        item.onclick = () => {
            document.getElementById('visit-patient-search').value = p.name;
            container.innerHTML = '';
        };
        container.appendChild(item);
    });
}

function simulateSelectPatientForVisit(btnElement) {
    const searchStr = document.getElementById('visit-patient-search').value.toLowerCase();
    const patient = window.GluckoState.patients.find(p => p.id.toLowerCase() === searchStr || p.name.toLowerCase() === searchStr);

    if (btnElement) {
        btnElement.classList.add('clicked-state');
        setTimeout(() => {
            btnElement.classList.remove('clicked-state');
        }, 500);
    }

    if (patient) {
        selectedVisitPatient = patient;
        document.getElementById('visit-form-container').classList.remove('hidden');
        document.getElementById('visit-patient-name').textContent = `Selected: ${patient.name} (${patient.id})`;

        let pInfoPanel = document.getElementById('visit-patient-info');
        if (!pInfoPanel) {
            pInfoPanel = document.createElement('div');
            pInfoPanel.id = 'visit-patient-info';
            pInfoPanel.style.cssText = 'background: var(--lb); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; font-size: 0.9rem; color: var(--db);';
            document.getElementById('visit-patient-name').insertAdjacentElement('afterend', pInfoPanel);
        }
        pInfoPanel.innerHTML = `
            <strong>Basic Info:</strong> Age: ${patient.age} | Birthday: ${patient.birthday || 'N/A'} | Weight: ${patient.weight || 'N/A'}<br>
            <strong style="margin-top: 0.5rem; display: inline-block;">Medical:</strong> ${patient.type} | Meds: ${patient.prescribedMedication || 'None'}
        `;

        // Populate checkmarks based on generic rule to demonstrate data flow
        document.getElementById('reviewed-glucose').checked = true;
    } else {
        alert('Patient not found. Please try "P-1234" or "John Doe".');
    }
}

function submitHealthVisit() {
    if (!selectedVisitPatient) return;

    const pres = document.getElementById('visit-prescription').value;
    const notes = document.getElementById('visit-notes').value;

    const now = new Date();
    const dateStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0') + ' ' + String(now.getHours() % 12 || 12).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0') + (now.getHours() >= 12 ? ' PM' : ' AM');

    window.GluckoState.history.push({
        date: dateStr,
        patientId: selectedVisitPatient.id,
        reviewed: [
            document.getElementById('reviewed-glucose').checked ? 'Glucose' : '',
            document.getElementById('reviewed-meds').checked ? 'Meds' : '',
            document.getElementById('reviewed-meals').checked ? 'Meals' : ''
        ].filter(Boolean).join(', ') || 'None',
        rx: pres || 'None',
        notes: notes || 'None'
    });

    // Add to Past Appointments
    window.GluckoState.pastAppointments.push({
        patientId: selectedVisitPatient.id,
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: now.toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' }),
        reviewed: [
            document.getElementById('reviewed-glucose').checked ? 'Glucose' : '',
            document.getElementById('reviewed-meds').checked ? 'Meds' : '',
            document.getElementById('reviewed-meals').checked ? 'Meals' : ''
        ].filter(Boolean).join(', ') || 'None',
        rx: pres || 'None',
        notes: notes || 'None'
    });

    alert("The visit was saved and an email has been sent to the patient's email.");

    // Reset Form
    document.getElementById('health-visit-form').reset();
    document.getElementById('visit-form-container').classList.add('hidden');
    document.getElementById('visit-patient-search').value = '';
    selectedVisitPatient = null;

    // Refresh history to show new past appointment
    renderHistory();
}

// ============== APPOINTMENTS BOARD ==============

function switchAppointmentTab(tab) {
    document.getElementById('appointments-upcoming').classList.add('hidden');
    document.getElementById('appointments-past').classList.add('hidden');
    document.getElementById('tab-upcoming-btn').classList.remove('active');
    document.getElementById('tab-past-btn').classList.remove('active');

    document.getElementById('upcoming-controls').classList.add('hidden');
    document.getElementById('past-controls').classList.add('hidden');

    document.getElementById('appointments-' + tab).classList.remove('hidden');
    document.getElementById('tab-' + tab + '-btn').classList.add('active');
    document.getElementById(tab + '-controls').classList.remove('hidden');

    if (tab === 'past') {
        document.getElementById('appointments-section-title').textContent = 'Past Appointments';
        document.getElementById('recent-activities-section').classList.add('hidden');
    } else {
        document.getElementById('appointments-section-title').textContent = 'Appointments';
        document.getElementById('recent-activities-section').classList.remove('hidden');
    }
}

function renderHistory() {
    // 1. Render Upcoming
    const upcomingContainer = document.getElementById('appointments-upcoming');
    upcomingContainer.innerHTML = '';

    let upcomingData = [...(window.GluckoState.upcomingAppointments || [])];

    const sortElem = document.getElementById('upcoming-sort');
    const sortVal = sortElem ? sortElem.value : 'time';

    upcomingData.sort((a, b) => {
        if (sortVal === 'name') {
            const patientA = window.GluckoState.patients.find(p => p.id === a.patientId);
            const patientB = window.GluckoState.patients.find(p => p.id === b.patientId);
            const nameA = patientA ? patientA.name : '';
            const nameB = patientB ? patientB.name : '';
            return nameA.localeCompare(nameB);
        } else {
            return new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time);
        }
    });

    upcomingData.forEach(up => {
        const patient = window.GluckoState.patients.find(p => p.id === up.patientId);
        const name = patient ? patient.name : 'Unknown Patient';
        const phone = patient ? patient.phone : '';
        const email = patient ? patient.email : '';

        // Handle undefined emails and phones
        const emailBtn = email ? `
            <button class="btn-text" style="font-size: 0.85rem; padding: 6px 10px; border: none; background: none; max-width: 50%; display: flex; align-items: center; gap: 0.35rem;" onclick="window.location.href='mailto:${email}'" title="Email: ${email}">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                ${email}
            </button>` : '';

        const phoneBtn = phone ? `
            <button class="btn-text" style="font-size: 0.85rem; padding: 6px 10px; border: none; background: none; max-width: 50%; display: flex; align-items: center; gap: 0.35rem;" onclick="window.location.href='tel:${phone}'" title="Call: ${phone}">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                ${phone}
            </button>` : '';

        upcomingContainer.innerHTML += `
            <div class="appointment-card">
                <h4 style="margin-bottom: 0;">${name}</h4>
                <div class="ac-date" style="display: flex; justify-content: flex-start; gap: 1rem; align-items: center; margin-bottom: 0.25rem; color: var(--gray);">
                    <span style="display: flex; align-items: center; gap: 0.35rem;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        ${up.date}
                    </span>
                    <span style="color: var(--gray); font-weight: 600;">${up.time}</span>
                </div>
                <div style="color: var(--gray); font-size: 0.85rem; margin-bottom: 0.25rem;">ID: ${up.patientId}</div>
                <div class="ac-actions" style="justify-content: flex-start; gap: 0.5rem; border-top: none; padding-top: 0; margin-top: auto;">
                    ${emailBtn}
                    ${phoneBtn}
                    ${(!email && !phone) ? '<span style="font-size: 0.85rem; color: var(--gray); padding: 6px 0;">No contact info available</span>' : ''}
                </div>
            </div>
        `;
    });

    // 2. Render Past
    const pastContainer = document.getElementById('appointments-past');
    pastContainer.innerHTML = '';

    let pastData = [...(window.GluckoState.pastAppointments || [])];

    const searchElem = document.getElementById('past-search');
    const searchVal = searchElem ? searchElem.value.toLowerCase() : '';
    if (searchVal) {
        pastData = pastData.filter(app => {
            const patient = window.GluckoState.patients.find(p => p.id === app.patientId) || { name: '' };
            return patient.name.toLowerCase().includes(searchVal) || app.patientId.toLowerCase().includes(searchVal);
        });
    }

    const dateElem = document.getElementById('past-date');
    const dateVal = dateElem && dateElem.value ? dateElem.value : '';
    if (dateVal) {
        pastData = pastData.filter(app => {
            const dateObj = new Date(app.date);
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');
            const year = dateObj.getFullYear();
            const formattedDate = `${year}-${month}-${day}`;
            return formattedDate === dateVal;
        });
    }

    if (pastData.length === 0) {
        pastContainer.innerHTML = '<p class="subtitle" style="grid-column: 1 / -1; padding-top: 1rem;">No past appointments logged.</p>';
    }

    pastData.forEach((up) => {
        const trueIndex = window.GluckoState.pastAppointments.findIndex(p => p === up);
        const patient = window.GluckoState.patients.find(p => p.id === up.patientId);
        const name = patient ? patient.name : 'Unknown Patient';
        const phone = patient ? patient.phone : '';
        const email = patient ? patient.email : '';

        const emailBtn = email ? `
             <button class="btn-text" style="font-size: 0.85rem; padding: 6px 10px; border: none; background: none; display: flex; align-items: center; gap: 0.35rem; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" onclick="window.location.href='mailto:${email}'" title="Email: ${email}">
                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                 ${email}
             </button>` : '';

        const phoneBtn = phone ? `
             <button class="btn-text" style="font-size: 0.85rem; padding: 6px 10px; border: none; background: none; display: flex; align-items: center; gap: 0.35rem; max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" onclick="window.location.href='tel:${phone}'" title="Call: ${phone}">
                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                 ${phone}
             </button>` : '';

        pastContainer.innerHTML += `
            <div class="appointment-card">
                <h4 style="margin-bottom: 0;">${name}</h4>
                <div class="ac-date" style="display: flex; justify-content: flex-start; gap: 1rem; align-items: center; margin-bottom: 0.25rem; color: var(--gray);">
                    <span style="display: flex; align-items: center; gap: 0.35rem;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        ${up.date}
                    </span>
                    <span style="color: var(--gray); font-weight: 400;">${up.time}</span>
                </div>
                <div style="color: var(--gray); font-size: 0.85rem; margin-bottom: 0.25rem;">ID: ${up.patientId}</div>
                <div class="ac-actions" style="justify-content: space-between; gap: 0.5rem; border-top: none; padding-top: 0; margin-top: auto; display: flex;">
                    <div style="display: flex; gap: 0.5rem; flex: 1;">
                        ${emailBtn}
                        ${phoneBtn}
                        ${(!email && !phone) ? '<span style="font-size: 0.85rem; color: var(--gray); padding: 6px 0;">No contact info</span>' : ''}
                    </div>
                    <button class="btn-secondary" style="font-size: 0.8rem; padding: 6px 12px; margin: 0; min-width: auto;" onclick="editActivity(${trueIndex}, 'past')">Edit Log</button>
                </div>
            </div>
        `;
    });

    // 3. Render Recent Activities List
    const recentContainer = document.getElementById('recent-activities-list');
    if (recentContainer) {
        recentContainer.innerHTML = '';
        const recentSorted = [...window.GluckoState.history].reverse();

        if (recentSorted.length === 0) {
            recentContainer.innerHTML = '<div style="padding: 1.5rem;"><p class="subtitle">No recent activity found.</p></div>';
        }

        recentSorted.forEach((hist, displayIdx) => {
            const trueIndex = window.GluckoState.history.length - 1 - displayIdx;
            const patient = window.GluckoState.patients.find(p => p.id === hist.patientId) || { name: hist.patientId };
            let titleDesc = '';
            if (hist.type === 'Viewed Chart') titleDesc = 'Viewed chart for';
            else if (hist.type === 'Health Visit' || hist.rx || hist.notes) titleDesc = 'Logged appointment with';
            else titleDesc = 'Interacted with';

            recentContainer.innerHTML += `
                <div class="record-item" style="padding: 1.25rem 1.75rem; display: flex; justify-content: space-between; border-bottom: 1px solid var(--light-gray); align-items: center;">
                    <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                        <span style="font-weight: 500; font-size: 1.05rem; color: var(--db);">${titleDesc} ${patient.name}</span>
                        <span style="color: var(--gray); font-size: 0.85rem;">${hist.details || hist.notes || 'Routine check.'}</span>
                    </div>
                    <div style="text-align: right; color: var(--gray); font-size: 0.85rem;">
                        <span style="color: var(--gray);">${hist.date}</span><br>
                        <span style="color: var(--gray);">ID: ${hist.patientId}</span>
                        <div style="margin-top: 0.5rem;">
                            <button class="btn-text" style="font-size: 0.85rem; padding: 0;" onclick="editActivity(${trueIndex})">Edit Log</button>
                        </div>
                    </div>
                </div>
            `;
        });

        // Remove trailing border for the last item
        const lastChild = recentContainer.lastElementChild;
        if (lastChild) lastChild.style.borderBottom = 'none';
    }
}

let currentEditIndex = -1;
let currentEditSource = 'history';

function editActivity(index, source = 'history') {
    currentEditIndex = index;
    currentEditSource = source;

    let hist;
    if (source === 'past') {
        hist = window.GluckoState.pastAppointments[index];
    } else {
        hist = window.GluckoState.history[index];
    }

    document.getElementById('ea-index').value = index;
    document.getElementById('ea-rx').value = hist.rx || '';
    document.getElementById('ea-notes').value = hist.notes || hist.details || '';

    document.getElementById('edit-activity-modal').classList.remove('hidden');
    document.getElementById('ea-title').textContent = 'Edit Log';

    const revStr = hist.reviewed || '';
    document.getElementById('ea-reviewed-glucose').checked = revStr.includes('Glucose');
    document.getElementById('ea-reviewed-meds').checked = revStr.includes('Meds');
    document.getElementById('ea-reviewed-meals').checked = revStr.includes('Meals') || revStr.includes('Activity');

    // auto trigger resize for textareas
    setTimeout(() => {
        ['ea-rx', 'ea-notes'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.style.height = 'auto';
                el.style.height = (el.scrollHeight) + 'px';
            }
        });
    }, 10);
}

function saveActivity() {
    if (currentEditIndex < 0) return;

    let hist;
    if (currentEditSource === 'past') {
        hist = window.GluckoState.pastAppointments[currentEditIndex];
    } else {
        hist = window.GluckoState.history[currentEditIndex];
    }

    const glucose = document.getElementById('ea-reviewed-glucose').checked ? 'Glucose' : '';
    const meds = document.getElementById('ea-reviewed-meds').checked ? 'Meds' : '';
    const meals = document.getElementById('ea-reviewed-meals').checked ? 'Meals' : '';
    hist.reviewed = [glucose, meds, meals].filter(Boolean).join(', ') || 'None';

    hist.rx = document.getElementById('ea-rx').value;
    hist.notes = document.getElementById('ea-notes').value;

    renderHistory();
    closeModal('edit-activity-modal');
    setTimeout(() => {
        alert('Changes saved successfully!');
    }, 100);
}
