/**
 * ================================================
 * CHARTS JAVASCRIPT - Chart.js Implementation
 * ================================================
 */

// Global Chart Variables
let tempChart = null;
let lightChart = null;

// Data Arrays
const maxDataPoints = 20; // Maksimal data point yang ditampilkan
let tempData = [];
let lightData = [];
let timeLabels = [];

// Initialize Charts
function initCharts() {
    // Common Chart Options
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    font: {
                        size: 12,
                        weight: 'bold'
                    },
                    color: '#333'
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleFont: {
                    size: 14,
                    weight: 'bold'
                },
                bodyFont: {
                    size: 13
                },
                callbacks: {
                    label: function(context) {
                        return context.dataset.label + ': ' + context.parsed.y.toFixed(1);
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                },
                ticks: {
                    font: {
                        size: 11
                    },
                    color: '#666'
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        size: 10
                    },
                    color: '#666',
                    maxRotation: 45,
                    minRotation: 45
                }
            }
        },
        animation: {
            duration: 750,
            easing: 'easeInOutQuart'
        }
    };

    // Temperature Chart
    const tempCtx = document.getElementById('tempChart').getContext('2d');
    tempChart = new Chart(tempCtx, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: [{
                label: 'Suhu (°C)',
                data: tempData,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                ...commonOptions.scales,
                y: {
                    ...commonOptions.scales.y,
                    max: 50,
                    title: {
                        display: true,
                        text: 'Suhu (°C)',
                        font: {
                            size: 13,
                            weight: 'bold'
                        },
                        color: '#667eea'
                    }
                }
            }
        }
    });

    // Light Chart
    const lightCtx = document.getElementById('lightChart').getContext('2d');
    lightChart = new Chart(lightCtx, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: [{
                label: 'Cahaya (Lux)',
                data: lightData,
                borderColor: '#f5576c',
                backgroundColor: 'rgba(245, 87, 108, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: '#f5576c',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                ...commonOptions.scales,
                y: {
                    ...commonOptions.scales.y,
                    max: 1000,
                    title: {
                        display: true,
                        text: 'Cahaya (Lux)',
                        font: {
                            size: 13,
                            weight: 'bold'
                        },
                        color: '#f5576c'
                    }
                }
            }
        }
    });

    console.log('Charts initialized successfully!');
}

// Update Charts dengan data baru
function updateCharts(temperature, light, time) {
    // Add new data
    tempData.push(temperature);
    lightData.push(light);
    timeLabels.push(time);

    // Jaga agar data tidak melebihi maxDataPoints
    if (tempData.length > maxDataPoints) {
        tempData.shift(); // Hapus data terlama
        lightData.shift();
        timeLabels.shift();
    }

    // Update charts
    if (tempChart && lightChart) {
        tempChart.update('none'); // 'none' untuk performa lebih baik
        lightChart.update('none');
    }
}

// Reset Charts (Hapus semua data)
function resetCharts() {
    tempData = [];
    lightData = [];
    timeLabels = [];
    
    if (tempChart && lightChart) {
        tempChart.update();
        lightChart.update();
    }
    
    console.log('Charts reset!');
}

// Destroy Charts (untuk cleanup)
function destroyCharts() {
    if (tempChart) {
        tempChart.destroy();
        tempChart = null;
    }
    if (lightChart) {
        lightChart.destroy();
        lightChart = null;
    }
    
    console.log('Charts destroyed!');
}

// Export chart sebagai image (optional feature)
function exportChartAsImage(chartName) {
    let chart = null;
    let filename = '';
    
    if (chartName === 'temp') {
        chart = tempChart;
        filename = 'grafik_suhu.png';
    } else if (chartName === 'light') {
        chart = lightChart;
        filename = 'grafik_cahaya.png';
    }
    
    if (chart) {
        const url = chart.toBase64Image();
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        link.click();
        
        console.log('Chart exported as image:', filename);
    }
}

// Get Chart Statistics
function getChartStatistics() {
    const stats = {
        temperature: {
            current: tempData[tempData.length - 1] || 0,
            average: tempData.length > 0 ? (tempData.reduce((a, b) => a + b, 0) / tempData.length) : 0,
            max: tempData.length > 0 ? Math.max(...tempData) : 0,
            min: tempData.length > 0 ? Math.min(...tempData) : 0
        },
        light: {
            current: lightData[lightData.length - 1] || 0,
            average: lightData.length > 0 ? (lightData.reduce((a, b) => a + b, 0) / lightData.length) : 0,
            max: lightData.length > 0 ? Math.max(...lightData) : 0,
            min: lightData.length > 0 ? Math.min(...lightData) : 0
        },
        dataPoints: tempData.length
    };
    
    return stats;
}

// Log current statistics (untuk debugging)
function logChartStatistics() {
    const stats = getChartStatistics();
    console.table({
        'Temperature Current': stats.temperature.current.toFixed(1) + '°C',
        'Temperature Average': stats.temperature.average.toFixed(1) + '°C',
        'Temperature Max': stats.temperature.max.toFixed(1) + '°C',
        'Temperature Min': stats.temperature.min.toFixed(1) + '°C',
        'Light Current': stats.light.current.toFixed(0) + ' Lux',
        'Light Average': stats.light.average.toFixed(0) + ' Lux',
        'Light Max': stats.light.max.toFixed(0) + ' Lux',
        'Light Min': stats.light.min.toFixed(0) + ' Lux',
        'Total Data Points': stats.dataPoints
    });
}