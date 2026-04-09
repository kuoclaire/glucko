// Glucose chart using Chart.js with target range highlight

let currentChart = null;

function renderGlucoseChart(canvasId, targetGlucose) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    // Destroy previous chart if exists
    if (currentChart) {
        currentChart.destroy();
    }

    // Mock time data for 24 hours
    const labels = [
        '12 AM', '1 AM', '2 AM', '3 AM', '4 AM', '5 AM', 
        '6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM',
        '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', 
        '6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM'
    ];
    
    // Generate some mock glucose readings, ending near targetGlucose
    const dataPoints = [
        120, 115, 110, 105, 100, 105,
        110, 140, 180, 160, 130, 120,
        125, 150, 190, 175, 140, 130,
        135, 160, 210, 180, 140, targetGlucose || 120
    ];

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
                        font: { family: 'Inter' }
                    }
                },
                x: {
                    ticks: { font: { family: 'Inter' } }
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
