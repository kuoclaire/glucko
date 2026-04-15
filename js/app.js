// Login authentication logic for index.html

function handleLogin(e) {
    e.preventDefault();
    const role = document.getElementById('role-select').value;
    const errorMsg = document.getElementById('login-error');
    errorMsg.textContent = '';

    if (role === 'admin') {
        const code = document.getElementById('admin-code').value;
        const pass = document.getElementById('admin-password').value;

        let found = false;
        for (const emp of window.GluckoState.employees) {
            if (emp.role === 'admin' && emp.code === code && emp.password === pass) {
                found = true;
                sessionStorage.setItem('gluckoUser', JSON.stringify(emp));
                window.location.href = 'dashboard.html';
                break;
            }
        }
        if (!found) {
            errorMsg.textContent = 'Invalid Admin Code or Password.';
        }

    } else if (role === 'doctor') {
        const hospitalSelect = document.getElementById('hospital-select');
        const hospital = hospitalSelect.value;
        const hospitalName = hospitalSelect.options[hospitalSelect.selectedIndex].text;
        const empId = document.getElementById('employee-id').value;
        const pass = document.getElementById('doctor-password').value;
        
        let found = false;
        for (const emp of window.GluckoState.employees) {
            if (emp.role === 'doctor' && emp.hospital === hospital && emp.id === empId && emp.password === pass) {
                found = true;
                emp.hospitalName = hospitalName;
                sessionStorage.setItem('gluckoUser', JSON.stringify(emp));
                window.location.href = 'dashboard.html';
                break;
            }
        }
        if (!found) {
            errorMsg.textContent = 'Invalid Employee ID or Password for this Hospital.';
        }
    }
}
