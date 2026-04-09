// Global mock state for Glucko App
window.GluckoState = {
    currentUser: null,

    // Database of employees/doctors
    employees: [
        { id: 'admin', role: 'admin', code: '123456', password: 'password', name: 'System Admin' },
        { id: 'DOC-101', role: 'doctor', hospital: 'hoshp-1', name: 'Dr. John Smith', phone: '555-0100', email: 'smith@gmh.com' },
        { id: 'DOC-102', role: 'doctor', hospital: 'hoshp-2', name: 'Dr. Sarah Connor', phone: '555-0200', email: 'sconnor@wc.com' }
    ],

    // Database of Patients
    patients: [
        { 
            id: 'P-1234', 
            name: 'John Doe', 
            age: 42, 
            birthday: '1984-05-12',
            weight: '185 lbs',
            prescribedMedication: 'Humalog (12u before meals), Lantus (20u night)',
            type: 'Type 1 Diabetes', 
            status: 'Stable',
            latestGlucose: 110,
            gmi: '6.0%',
            records: [
                { type: 'Glucose', detail: 'Checked at 8:00 AM - 110 mg/dL' },
                { type: 'Medication', detail: 'Insulin (12 units) at 8:15 AM' },
                { type: 'Meal', detail: 'Breakfast (45g carbs)' }
            ]
        },
        { 
            id: 'P-5678', 
            name: 'Jane Smith', 
            age: 28,
            birthday: '1996-02-15',
            weight: '140 lbs',
            prescribedMedication: 'Metformin 500mg (Daily)',
            type: 'Type 2 Diabetes', 
            status: 'High',
            latestGlucose: 215,
            gmi: '7.8%',
            records: [
                { type: 'Alert', detail: 'High Glucose reading at 2:00 PM - 215 mg/dL' },
                { type: 'Glucose', detail: 'Checked at 10:00 AM - 180 mg/dL' }
            ]
        },
        { 
            id: 'P-9101', 
            name: 'Robert Brown', 
            age: 55, 
            birthday: '1969-11-03',
            weight: '210 lbs',
            prescribedMedication: 'Ozempic (0.5mg Weekly)',
            type: 'Type 2 Diabetes', 
            status: 'Stable',
            latestGlucose: 130,
            gmi: '6.5%',
            records: [
                { type: 'Activity', detail: '30 mins walking at 7:00 AM' },
                { type: 'Glucose', detail: 'Checked at 8:00 AM - 130 mg/dL' }
            ]
        },
        { 
            id: 'P-1122', 
            name: 'Sarah Jenkins', 
            age: 34,
            type: 'Type 1 Diabetes',
            status: 'Stable',
            latestGlucose: 105,
            phone: '555-0111',
            email: 'sarah.j@example.com',
            records: []
        },
        { 
            id: 'P-3344', 
            name: 'Michael Chen', 
            age: 45,
            type: 'Type 2 Diabetes',
            status: 'High',
            latestGlucose: 190,
            phone: '555-0222',
            email: 'mchen@example.com',
            records: []
        },
        { 
            id: 'P-5566', 
            name: 'David Smith', 
            age: 60,
            type: 'Type 2 Diabetes',
            status: 'Stable',
            latestGlucose: 125,
            phone: '555-0333',
            email: 'dsmith@example.com',
            records: []
        }
    ],

    // Upcoming Appointments
    upcomingAppointments: [
        { patientId: 'P-1122', time: '10:00 AM', date: 'Oct 12, 2025' },
        { patientId: 'P-3344', time: '1:30 PM', date: 'Oct 12, 2025' },
        { patientId: 'P-5566', time: '9:00 AM', date: 'Oct 13, 2025' }
    ],
    
    // Past Appointments
    pastAppointments: [
        { patientId: 'P-1234', time: '11:00 AM', date: 'Oct 01, 2025', reviewed: 'Glucose', rx: 'Increased Lantus to 22u.', notes: 'Patient is stable.' },
        { patientId: 'P-5678', time: '2:00 PM', date: 'Oct 02, 2025', reviewed: '', rx: '', notes: 'Routine checkup.' },
        { patientId: 'P-9101', time: '9:30 AM', date: 'Oct 05, 2025', reviewed: 'Meals', rx: 'Refilled Metformin.', notes: 'Discussed diet plan.' }
    ],

    // Activity History
    history: [
        { date: '2026-04-07 09:15 AM', type: 'Viewed Chart', patientId: 'P-1234', details: 'Reviewed glucose trends for the past week.' },
        { date: '2026-04-07 10:30 AM', type: 'Health Visit', patientId: 'P-5678', details: 'Added new visit. Prescribed new insulin ratio.' }
    ]
};
