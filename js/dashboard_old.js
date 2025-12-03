/**
 * ================================================
 * DASHBOARD PAGE JAVASCRIPT - FIXED VERSION
 * ================================================
 */

// Global Variables
let allData = [];
let isAutoMode = false;
let tempChart, lightChart;
let db; // Firebase database reference

// Check Authentication
function checkAuth() {
    if (sessionStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Initialize when page loads
window.addEventListener('load', () => {
    if (!checkAuth()) return;
    
    initDashboard();
});

// Initialize Dashboard
function initDashboard() {
    // Get Firebase database reference
    db = window.firebaseDB;
    
    if (!db) {
        console.error('Firebase database not initialized!');
        showNotification('Gagal menghubungkan ke Firebase!', 'danger');
        return;
    }
    
    console.log('✓ Firebase database ready');
    
    // Create particles
    createParticles();
    
    // Initialize charts
    initCharts();
    
    // Set default dates
    setDefaultDates();
    
    // Start clock
    updateClock();
    setInterval(updateClock, 1000);
    
    // Listen to Firebase data
    listenToFirebase();
    
    console.log('✓ Dashboard initialized successfully!');
}

// Create Particles Background
function createParticles() {
    const container = document.getElementById('particles');
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 5 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        
        container.appendChild(particle);
    }
}

// Update Clock
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    document.getElementById('currentTime').textContent = timeString;
}

// Initialize Charts
function initCharts() {
    // Temperature Chart
    const tempCtx = document.getElementById('tempChart').getContext('2d');
    tempChart = new Chart(tempCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Suhu (°C)',
                data: [],
                borderColor: 'rgb(245, 87, 108)',
                backgroundColor: 'rgba(245, 87, 108, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 50,
                    ticks: {
                        callback: function(value) {
                            return value + '°C';
                        }
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
            labels: [],
            datasets: [{
                label: 'Cahaya (Lux)',
                data: [],
                borderColor: 'rgb(255, 193, 7)',
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1000,
                    ticks: {
                        callback: function(value) {
                            return value + ' Lux';
                        }
                    }
                }
            }
        }
    });
    
    console.log('✓ Charts initialized');
}

// Update Charts
function updateCharts(temp, light, timeStr) {
    // Update Temperature Chart
    if (tempChart.data.labels.length > 20) {
        tempChart.data.labels.shift();
        tempChart.data.datasets[0].data.shift();
    }
    tempChart.data.labels.push(timeStr);
    tempChart.data.datasets[0].data.push(temp);
    tempChart.update('none');

    // Update Light Chart
    if (lightChart.data.labels.length > 20) {
        lightChart.data.labels.shift();
        lightChart.data.datasets[0].data.shift();
    }
    lightChart.data.labels.push(timeStr);
    lightChart.data.datasets[0].data.push(light);
    lightChart.update('none');
}

// Listen to Firebase Realtime Data
function listenToFirebase() {
    console.log('🔗 Connecting to Firebase...');
    
    // Listener real-time ke node sensors
    db.ref('sensors').on('value', (snapshot) => {
        if (!snapshot.exists()) {
            console.warn("⚠️ Data sensors tidak ditemukan di Firebase");
            document.getElementById('dataTable').innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-warning">
                        <i class="fas fa-exclamation-triangle fa-2x mb-2"></i>
                        <p>Menunggu data dari ESP32...</p>
                        <small>Pastikan ESP32 sudah terhubung ke WiFi dan mengirim data</small>
                    </td>
                </tr>
            `;
            return;
        }

        const data = snapshot.val();
        console.log("📊 Realtime Data:", data);

        // Update tampilan dashboard
        updateSensorDisplay(data);

        // Masukkan ke histori
        addDataToHistory(data);
    }, (error) => {
        console.error("❌ Firebase Error:", error);
        showNotification("Gagal terhubung ke Firebase: " + error.message, "danger");
    });

    // Listener untuk mode & LED control
    db.ref("control").on("value", (snapshot) => {
        if (snapshot.exists()) {
            console.log("🎛️ Control updated:", snapshot.val());
        }
    });
    
    console.log('✓ Firebase listeners attached');
}

// Update Sensor Display
function updateSensorDisplay(data) {
    const temp = parseFloat(data.temperature) || 0;
    const light = parseFloat(data.light) || 0;
    const ledStatus = data.ledStatus || 'off';
    const mode = data.mode || 'manual';
    
    // Update temperature
    document.getElementById('tempValue').textContent = temp.toFixed(1) + '°C';
    const tempProgress = Math.min((temp / 50) * 100, 100);
    document.getElementById('tempProgress').style.width = tempProgress + '%';
    
    // Update light
    document.getElementById('lightValue').textContent = Math.round(light) + ' Lux';
    const lightProgress = Math.min((light / 1000) * 100, 100);
    document.getElementById('lightProgress').style.width = lightProgress + '%';
    
    // Update LED status
    document.getElementById('ledSwitch').checked = (ledStatus === 'on');
    updateLEDStatus(ledStatus === 'on');
    
    // Update mode
    const modeSwitchElement = document.getElementById('modeSwitch');
    if (mode === 'auto' && !modeSwitchElement.checked) {
        modeSwitchElement.checked = true;
        updateModeDisplay(true);
    } else if (mode === 'manual' && modeSwitchElement.checked) {
        modeSwitchElement.checked = false;
        updateModeDisplay(false);
    }
    
    // Update charts
    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, '0') + ':' + 
                   now.getMinutes().toString().padStart(2, '0') + ':' +
                   now.getSeconds().toString().padStart(2, '0');
    updateCharts(temp, light, timeStr);
}

// Update Mode Display (without Firebase update)
function updateModeDisplay(isAuto) {
    isAutoMode = isAuto;
    const modeLabel = document.getElementById('modeLabel');
    const modeBadge = document.getElementById('modeBadge');
    const ledSwitch = document.getElementById('ledSwitch');
    const ledNote = document.getElementById('ledNote');
    
    if (isAuto) {
        modeLabel.textContent = 'Otomatis';
        modeBadge.textContent = 'Auto Mode';
        modeBadge.className = 'badge badge-auto mt-2';
        ledSwitch.disabled = true;
        ledNote.textContent = 'LED dikendalikan otomatis';
    } else {
        modeLabel.textContent = 'Manual';
        modeBadge.textContent = 'Manual Mode';
        modeBadge.className = 'badge badge-manual mt-2';
        ledSwitch.disabled = false;
        ledNote.textContent = 'Kontrol manual LED';
    }
}

// Add Data to History
function addDataToHistory(data) {
    const now = new Date();
    
    const newData = {
        timestamp: now.getTime(),
        time: now.toLocaleString('id-ID', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }),
        temperature: parseFloat(data.temperature) || 0,
        light: parseFloat(data.light) || 0,
        ledStatus: data.ledStatus || 'off',
        mode: data.mode || 'manual'
    };
    
    // Add to array (newest first)
    allData.unshift(newData);
    
    // Keep only last 100 records
    if (allData.length > 100) {
        allData = allData.slice(0, 100);
    }
    
    // Update table
    updateTable();
    
    // Save to Firebase history (optional)
    db.ref('history/' + now.getTime()).set(newData).catch(err => {
        console.error('Failed to save history:', err);
    });
}

// Toggle Mode (Auto/Manual)
function toggleMode() {
    const isAuto = document.getElementById('modeSwitch').checked;
    updateModeDisplay(isAuto);
    
    // Update Firebase
    db.ref('control/mode').set(isAuto ? 'auto' : 'manual')
        .then(() => {
            console.log('✓ Mode updated to:', isAuto ? 'auto' : 'manual');
            showNotification('Mode ' + (isAuto ? 'otomatis' : 'manual') + ' diaktifkan', 'success');
        })
        .catch(err => {
            console.error('❌ Failed to update mode:', err);
            showNotification('Gagal mengubah mode!', 'danger');
        });
}

// Toggle LED
function toggleLED() {
    const isOn = document.getElementById('ledSwitch').checked;
    updateLEDStatus(isOn);
    
    // Update Firebase
    db.ref('control/led').set(isOn ? 'on' : 'off')
        .then(() => {
            console.log('✓ LED updated to:', isOn ? 'on' : 'off');
            showNotification('LED ' + (isOn ? 'dinyalakan' : 'dimatikan'), 'success');
        })
        .catch(err => {
            console.error('❌ Failed to update LED:', err);
            showNotification('Gagal mengontrol LED!', 'danger');
        });
}

// Update LED Status Display
function updateLEDStatus(isOn) {
    const indicator = document.getElementById('ledIndicator');
    const status = document.getElementById('ledStatus');
    
    if (isOn) {
        indicator.classList.add('on');
        status.textContent = 'ON';
        status.style.color = '#f5576c';
    } else {
        indicator.classList.remove('on');
        status.textContent = 'OFF';
        status.style.color = '#999';
    }
}

// Update Table
function updateTable() {
    const tbody = document.getElementById('dataTable');
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    let filteredData = allData;
    
    // Filter by date if selected
    if (startDate && endDate) {
        const start = new Date(startDate).setHours(0, 0, 0, 0);
        const end = new Date(endDate).setHours(23, 59, 59, 999);
        
        filteredData = allData.filter(item => {
            return item.timestamp >= start && item.timestamp <= end;
        });
    }
    
    // Check if no data
    if (filteredData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted">
                    <i class="fas fa-inbox fa-2x mb-2"></i>
                    <p>Tidak ada data untuk ditampilkan</p>
                </td>
            </tr>
        `;
        return;
    }
    
    // Display data (max 50 rows)
    const displayData = filteredData.slice(0, 50);
    
    tbody.innerHTML = displayData.map((item, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${item.time}</td>
            <td>${item.temperature.toFixed(1)}</td>
            <td>${Math.round(item.light)}</td>
            <td>
                <span class="badge ${item.ledStatus === 'on' ? 'bg-success' : 'bg-secondary'}">
                    ${item.ledStatus.toUpperCase()}
                </span>
            </td>
            <td>
                <span class="badge ${item.mode === 'auto' ? 'badge-auto' : 'badge-manual'}">
                    ${item.mode.toUpperCase()}
                </span>
            </td>
        </tr>
    `).join('');
}

// Set Default Dates (Last 7 days)
function setDefaultDates() {
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    document.getElementById('endDate').valueAsDate = today;
    document.getElementById('startDate').valueAsDate = lastWeek;
}

// Reset Filter
function resetFilter() {
    setDefaultDates();
    updateTable();
    showNotification('Filter direset', 'info');
}

// Export to Excel
function exportToExcel() {
    if (allData.length === 0) {
        showNotification('Tidak ada data untuk di-export!', 'warning');
        return;
    }
    
    // Prepare data for export
    const exportData = allData.map((item, index) => ({
        'No': index + 1,
        'Waktu': item.time,
        'Suhu (°C)': item.temperature.toFixed(1),
        'Cahaya (Lux)': Math.round(item.light),
        'LED Status': item.ledStatus.toUpperCase(),
        'Mode': item.mode.toUpperCase()
    }));
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Sensor Data');
    
    // Generate filename with current date
    const now = new Date();
    const filename = `Smart_Farming_Data_${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,'0')}-${now.getDate().toString().padStart(2,'0')}.xlsx`;
    
    // Save file
    XLSX.writeFile(wb, filename);
    
    showNotification('Data berhasil di-export ke Excel!', 'success');
    console.log('✓ Data exported:', filename);
}

// Logout Function
function logout() {
    if (confirm('Apakah Anda yakin ingin logout?')) {
        sessionStorage.clear();
        showNotification('Logout berhasil', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

// Show Notification
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        animation: slideInRight 0.5s ease;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// Add animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {R
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Console welcome message
console.log('%c🌶️ Smart Farming Dashboard', 'color: #f5576c; font-size: 20px; font-weight: bold;');
console.log('%c✓ System ready', 'color: #28a745; font-size: 14px;');