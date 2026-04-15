// Glucose chart using Chart.js with target range highlight

let currentChart = null;

function renderGlucoseChart(canvasId, targetGlucose, period = 'Today') {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    // Destroy previous chart if exists
    if (currentChart) {
        currentChart.destroy();
    }

    let labels, dataPoints;
    
    if (period === 'This week') {
        labels = ['Mon (Oct 6)', 'Tue (Oct 7)', 'Wed (Oct 8)', 'Thu (Oct 9)', 'Fri (Oct 10)', 'Sat (Oct 11)', 'Sun (Oct 12)'];
        dataPoints = [125, 140, 110, 160, 135, 185, targetGlucose || 130];
    } else if (period === 'This month') {
        labels = ['Oct 1', 'Oct 3', 'Oct 5', 'Oct 7', 'Oct 9', 'Oct 11', 'Oct 13', 'Oct 15', 'Oct 17', 'Oct 19', 'Oct 21', 'Oct 23', 'Oct 25', 'Oct 27', 'Oct 29', 'Oct 31'];
        dataPoints = [120, 110, 130, 150, 145, 160, 120, 115, 145, 180, 165, 140, 125, 145, 155, targetGlucose || 120];
    } else {
        // Mock time data for 24 hours (Today)
        labels = [
            '12 AM', '1 AM', '2 AM', '3 AM', '4 AM', '5 AM', 
            '6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM',
            '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', 
            '6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM'
        ];
        
        // Generate some mock glucose readings, ending near targetGlucose
        dataPoints = [
            120, 115, 110, 105, 100, 105,
            110, 140, 180, 160, 130, 120,
            125, 150, 190, 175, 140, 130,
            135, 160, 210, 180, 140, targetGlucose || 120
        ];
    }

    // Chart.js requires the annotation plugin which is loaded in index.html
    currentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Glucose (mg/dL)',
                data: dataPoints,
                borderColor: '#2D0101', // DB
                backgroundColor: '#81011F', // A1
                pointBackgroundColor: '#81011F',
                pointRadius: 4,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    min: 50,
                    max: 250,
                    ticks: {
                        stepSize: 50,
                        font: { family: "'Plus Jakarta Sans', sans-serif" }
                    }
                },
                x: {
                    ticks: { font: { family: "'Plus Jakarta Sans', sans-serif" } }
                }
            },
            plugins: {
                legend: { display: false },
                annotation: {
                    annotations: {
                        box1: {
                            type: 'box',
                            yMin: 70,
                            yMax: 180,
                            backgroundColor: 'rgba(129, 1, 31, 0.05)',
                            borderWidth: 0,
                            label: {
                                display: true,
                                content: 'Target Range (70-180)',
                                position: 'start',
                                color: '#8F8C8B'
                            }
                        },
                        line1: {
                            type: 'line',
                            yMin: 180,
                            yMax: 180,
                            borderColor: '#81011F',
                            borderWidth: 1,
                            borderDash: [5, 5]
                        },
                        line2: {
                            type: 'line',
                            yMin: 70,
                            yMax: 70,
                            borderColor: '#81011F',
                            borderWidth: 1,
                            borderDash: [5, 5]
                        }
                    }
                }
            }
        }
    });

    return currentChart;
}
