// Export Data to Excel
function exportToExcel() {
    // Check if data available
    if (!allData || allData.length === 0) {
        alert('Tidak ada data untuk diekspor!');
        showNotification('Tidak ada data untuk diekspor!', 'warning');
        return;
    }

    try {
        // Get filtered data berdasarkan tanggal
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        let exportData = allData;

        // Filter by date if selected
        if (startDate && endDate) {
            const start = new Date(startDate).setHours(0, 0, 0, 0);
            const end = new Date(endDate).setHours(23, 59, 59, 999);
            
            exportData = allData.filter(item => {
                return item.timestamp >= start && item.timestamp <= end;
            });
        }

        if (exportData.length === 0) {
            alert('Tidak ada data dalam rentang tanggal yang dipilih!');
            showNotification('Tidak ada data untuk diekspor!', 'warning');
            return;
        }

        // Prepare Excel data
        const excelData = prepareExcelData(exportData);
        
        // Create workbook
        const wb = XLSX.utils.book_new();
        
        // Create worksheet from data
        const ws = XLSX.utils.aoa_to_sheet(excelData);
        
        // Set column widths
        ws['!cols'] = [
            {wch: 5},   // No
            {wch: 22},  // Waktu
            {wch: 12},  // Suhu
            {wch: 15},  // Cahaya
            {wch: 12},  // LED Status
            {wch: 12}   // Mode
        ];
        
        // Merge cells untuk header
        ws['!merges'] = [
            {s: {r: 0, c: 0}, e: {r: 0, c: 5}}, // Title
            {s: {r: 1, c: 0}, e: {r: 1, c: 5}}  // Export info
        ];
        
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, "Data Sensor");
        
        // Add summary sheet
        addSummarySheet(wb, exportData);
        
        // Generate filename dengan timestamp
        const now = new Date();
        const filename = `Smart_Farming_${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}_${now.getHours()}${now.getMinutes()}.xlsx`;
        
        // Write file
        XLSX.writeFile(wb, filename);
        
        showNotification(`Data berhasil diekspor! (${exportData.length} baris)`, 'success');
        console.log(`Exported ${exportData.length} rows to ${filename}`);
        
    } catch (error) {
        console.error('Export error:', error);
        alert('Gagal mengekspor data! Silakan coba lagi.');
        showNotification('Gagal mengekspor data!', 'danger');
    }
}

// Prepare data untuk Excel
function prepareExcelData(data) {
    // Header section
    const excelData = [
        ['SMART FARMING CABAI RAWIT - DATA EXPORT'],
        [`Tanggal Export: ${new Date().toLocaleString('id-ID')}`],
        [`Total Data: ${data.length} baris`],
        [], // Empty row
        ['No', 'Waktu', 'Suhu (°C)', 'Cahaya (Lux)', 'LED Status', 'Mode']
    ];

    // Data rows
    data.forEach((item, index) => {
        excelData.push([
            index + 1,
            item.time,
            item.temperature.toFixed(1),
            Math.round(item.light),
            item.ledStatus.toUpperCase(),
            item.mode.toUpperCase()
        ]);
    });

    return excelData;
}

// Add Summary Sheet
function addSummarySheet(workbook, data) {
    if (data.length === 0) return;

    // Calculate statistics
    const temperatures = data.map(d => d.temperature);
    const lights = data.map(d => d.light);
    
    const tempAvg = temperatures.reduce((a, b) => a + b, 0) / temperatures.length;
    const tempMax = Math.max(...temperatures);
    const tempMin = Math.min(...temperatures);
    
    const lightAvg = lights.reduce((a, b) => a + b, 0) / lights.length;
    const lightMax = Math.max(...lights);
    const lightMin = Math.min(...lights);
    
    const ledOnCount = data.filter(d => d.ledStatus === 'on').length;
    const ledOffCount = data.filter(d => d.ledStatus === 'off').length;
    
    const autoModeCount = data.filter(d => d.mode === 'auto').length;
    const manualModeCount = data.filter(d => d.mode === 'manual').length;

    // Create summary data
    const summaryData = [
        ['RINGKASAN STATISTIK'],
        [`Periode: ${data[data.length-1].time} s/d ${data[0].time}`],
        [],
        ['SUHU (°C)'],
        ['Rata-rata', tempAvg.toFixed(1)],
        ['Maksimum', tempMax.toFixed(1)],
        ['Minimum', tempMin.toFixed(1)],
        [],
        ['CAHAYA (Lux)'],
        ['Rata-rata', lightAvg.toFixed(0)],
        ['Maksimum', lightMax.toFixed(0)],
        ['Minimum', lightMin.toFixed(0)],
        [],
        ['STATUS LED'],
        ['LED ON', ledOnCount, `${((ledOnCount/data.length)*100).toFixed(1)}%`],
        ['LED OFF', ledOffCount, `${((ledOffCount/data.length)*100).toFixed(1)}%`],
        [],
        ['MODE KONTROL'],
        ['Auto Mode', autoModeCount, `${((autoModeCount/data.length)*100).toFixed(1)}%`],
        ['Manual Mode', manualModeCount, `${((manualModeCount/data.length)*100).toFixed(1)}%`],
        [],
        ['TOTAL DATA', data.length]
    ];

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Set column widths
    ws['!cols'] = [
        {wch: 20},
        {wch: 15},
        {wch: 10}
    ];

    // Add to workbook
    XLSX.utils.book_append_sheet(workbook, ws, "Ringkasan");
}

// Export Current View as Excel (hanya data yang terlihat di tabel)
function exportCurrentView() {
    const table = document.getElementById('dataTable');
    const rows = table.querySelectorAll('tr');
    
    if (rows.length === 0 || rows[0].cells.length < 6) {
        alert('Tidak ada data untuk diekspor!');
        return;
    }

    const excelData = [
        ['SMART FARMING CABAI RAWIT - CURRENT VIEW'],
        [`Tanggal Export: ${new Date().toLocaleString('id-ID')}`],
        [],
        ['No', 'Waktu', 'Suhu (°C)', 'Cahaya (Lux)', 'LED Status', 'Mode']
    ];

    rows.forEach(row => {
        const cells = row.cells;
        if (cells.length >= 6) {
            excelData.push([
                cells[0].textContent,
                cells[1].textContent,
                cells[2].textContent,
                cells[3].textContent,
                cells[4].textContent.trim(),
                cells[5].textContent.trim()
            ]);
        }
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    
    ws['!cols'] = [
        {wch: 5},
        {wch: 22},
        {wch: 12},
        {wch: 15},
        {wch: 12},
        {wch: 12}
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, "Data Sensor");
    
    const filename = `Smart_Farming_View_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, filename);
    
    showNotification('View berhasil diekspor!', 'success');
}

// Export with custom date range
function exportCustomRange(startDate, endDate) {
    if (!startDate || !endDate) {
        alert('Silakan pilih rentang tanggal terlebih dahulu!');
        return;
    }
    
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    
    const filteredData = allData.filter(item => {
        return item.timestamp >= start && item.timestamp <= end;
    });
    
    if (filteredData.length === 0) {
        alert('Tidak ada data dalam rentang tanggal yang dipilih!');
        return;
    }
    
    // Use main export function with filtered data
    const tempAllData = allData;
    allData = filteredData;
    exportToExcel();
    allData = tempAllData;
}

// Quick Export Templates
function quickExportToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const filteredData = allData.filter(item => {
        return item.timestamp >= today.getTime();
    });
    
    if (filteredData.length === 0) {
        alert('Tidak ada data hari ini!');
        return;
    }
    
    const tempAllData = allData;
    allData = filteredData;
    exportToExcel();
    allData = tempAllData;
}

function quickExportWeek() {
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    lastWeek.setHours(0, 0, 0, 0);
    
    const filteredData = allData.filter(item => {
        return item.timestamp >= lastWeek.getTime();
    });
    
    if (filteredData.length === 0) {
        alert('Tidak ada data minggu ini!');
        return;
    }
    
    const tempAllData = allData;
    allData = filteredData;
    exportToExcel();
    allData = tempAllData;
}

// Console helper
console.log('Export functions loaded. Available functions:');
console.log('- exportToExcel() - Export all/filtered data');
console.log('- exportCurrentView() - Export visible table data');
console.log('- quickExportToday() - Export today\'s data');
console.log('- quickExportWeek() - Export last 7 days data');
