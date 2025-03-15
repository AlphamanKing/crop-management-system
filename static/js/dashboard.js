// Dark Mode Toggle
const darkModeToggle = document.getElementById('darkModeToggle');
darkModeToggle.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode', darkModeToggle.checked);
    localStorage.setItem('darkMode', darkModeToggle.checked);
    updateChartColors(); // Update chart colors based on theme
});

// Load saved dark mode preference
if (localStorage.getItem('darkMode') === 'true') {
    darkModeToggle.checked = true;
    document.body.classList.add('dark-mode');
}

// Add CSS for dark mode and toggle styling
const style = document.createElement('style');
style.textContent = `
    /* Style the dark mode toggle */
    .form-check-input[type="checkbox"] {
        width: 50px;
        height: 25px;
        background-color: #ccc;
        border: none;
        cursor: pointer;
        transition: background-color 0.3s;
    }
    .form-check-input[type="checkbox"]:checked {
        background-color: #3498db;
    }
    .form-check-input[type="checkbox"]:focus {
        box-shadow: 0 0 5px rgba(52, 152, 219, 0.5);
    }
    .form-check-label {
        margin-left: 10px;
        font-weight: 500;
    }
    .form-check {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    /* Dark mode styles */
    .dark-mode {
        background: linear-gradient(135deg, #1a2a44, #2c3e50) !important;
        color: #ecf0f1 !important;
    }
    .dark-mode .card {
        background: #2c3e50;
        border: 1px solid #34495e;
    }
    .dark-mode .form-control {
        background: #34495e;
        color: #ecf0f1;
        border-color: #4a6074;
    }
    .dark-mode .form-control:focus {
        border-color: #3498db;
        box-shadow: 0 0 10px rgba(52, 152, 219, 0.3);
    }
    .dark-mode .form-label {
        color: #ecf0f1 !important; /* Ensure form labels are visible */
    }
    .dark-mode .btn-primary {
        background-color: #3498db;
        border-color: #3498db;
        color: #fff;
    }
    .dark-mode .btn-primary:hover {
        background-color: #2980b9;
        border-color: #2980b9;
    }
    .dark-mode .btn-success {
        background-color: #27ae60;
        border-color: #27ae60;
        color: #fff;
    }
    .dark-mode .btn-success:hover {
        background-color: #219653;
        border-color: #219653;
    }
    .dark-mode .btn-success:disabled {
        background-color: #1e8449;
        border-color: #1e8449;
        color: #d3d3d3;
        opacity: 0.7;
    }
    .dark-mode .btn-info {
        background-color: #17a2b8;
        border-color: #17a2b8;
        color: #fff;
    }
    .dark-mode .btn-info:hover {
        background-color: #138496;
        border-color: #138496;
    }
    .dark-mode .btn-secondary {
        background-color: #6c757d;
        border-color: #6c757d;
        color: #fff;
    }
    .dark-mode .btn-secondary:hover {
        background-color: #5a6268;
        border-color: #5a6268;
    }
    .dark-mode .lead {
        color: #ecf0f1 !important; /* Ensure recommendation text is visible */
    }
    .dark-mode h2, .dark-mode h3 {
        color: #ecf0f1 !important; /* Ensure headings are visible */
    }
    .dark-mode .table {
        background: #2c3e50;
    }
    .dark-mode .table thead th {
        background: linear-gradient(45deg, #2980b9, #1e5a8c);
    }
    .dark-mode .table-striped tbody tr:nth-of-type(odd) {
        background-color: #34495e;
    }
    .dark-mode .table-striped tbody tr:hover {
        background-color: #3d566e;
    }
    .dark-mode .alert-success {
        background: #27ae60;
        color: #ecf0f1;
        border-color: #2ecc71;
    }
    .dark-mode .alert-danger {
        background: #e74c3c;
        color: #ecf0f1;
        border-color: #c0392b;
    }
    .dark-mode .btn-link {
        color: #3498db;
    }
    .dark-mode .btn-link:hover {
        color: #5dade2;
    }
`;
document.head.appendChild(style);

// Function to update chart colors based on theme
function updateChartColors() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    const chart = window.farmingDataChart;
    if (chart) {
        // Update chart colors
        chart.data.datasets[0].backgroundColor = isDarkMode ? 'rgba(52, 152, 219, 0.2)' : 'rgba(66, 165, 81, 0.2)';
        chart.data.datasets[0].borderColor = isDarkMode ? 'rgba(52, 152, 219, 1)' : 'rgba(46, 125, 50, 1)';
        chart.data.datasets[0].pointBackgroundColor = isDarkMode ? 'rgba(52, 152, 219, 1)' : 'rgba(46, 125, 50, 1)';
        
        // Update axes colors
        chart.options.scales.x.title.color = isDarkMode ? '#ecf0f1' : '#2c3e50';
        chart.options.scales.y.title.color = isDarkMode ? '#ecf0f1' : '#2c3e50';
        chart.options.scales.x.ticks.color = isDarkMode ? '#ecf0f1' : '#2c3e50';
        chart.options.scales.y.ticks.color = isDarkMode ? '#ecf0f1' : '#2c3e50';
        chart.options.scales.x.grid.color = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        chart.options.scales.y.grid.color = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        
        // Update legend colors
        chart.options.plugins.legend.labels.color = isDarkMode ? '#ecf0f1' : '#2c3e50';
        
        chart.update();
    }
}

// Handle adding farming data
document.getElementById('addFarmingDataBtn').addEventListener('click', () => {
    const farmingDataModal = new bootstrap.Modal(document.getElementById('farmingDataModal'));
    farmingDataModal.show();
});

// Initialize modal for adding new data
document.getElementById('addFarmingDataBtn').addEventListener('click', () => {
    // Reset form
    document.getElementById('farmingDataForm').reset();
    
    // Reset save button to default state
    const saveButton = document.getElementById('saveFarmingDataBtn');
    saveButton.textContent = 'Save Data';
    
    // Set default click handler for new data
    saveButton.onclick = async () => {
        const year = document.getElementById('year').value;
        const crop = document.getElementById('crop').value;
        const fertilizer = document.getElementById('fertilizer').value;
        const output = document.getElementById('output').value;

        if (!year || !crop || !fertilizer || !output) {
            alert('Please fill all fields');
            return;
        }

        try {
            const response = await fetch('/api/save-farming-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ year, crop, fertilizer, output })
            });
            const result = await response.json();

            if (response.ok) {
                // Close modal first
                const farmingDataModal = bootstrap.Modal.getInstance(document.getElementById('farmingDataModal'));
                farmingDataModal.hide();
                
                // Show success toast
                const successToast = new bootstrap.Toast(document.getElementById('successToast'), {
                    autohide: true,
                    delay: 3000
                });
                successToast.show();
                
                // Reset form and cleanup
                document.getElementById('farmingDataForm').reset();
                cleanupModal();
                fetchFarmingData();
            } else {
                alert(`Error: ${result.error}`);
            }
        } catch (error) {
            console.error('Error saving farming data:', error);
            alert('An error occurred while saving farming data.');
        }
    };

    // Show the modal
    const farmingDataModal = new bootstrap.Modal(document.getElementById('farmingDataModal'));
    farmingDataModal.show();
});

// Fetch and display farming data
async function fetchFarmingData() {
    try {
        const response = await fetch('/api/get-farming-data');
        const data = await response.json();
        console.log('Farming data from backend:', data); // Debugging

        if (response.ok) {
            const tableBody = document.getElementById('farmingDataTableBody');
            tableBody.innerHTML = ''; // Clear existing rows

            data.forEach(row => {
                console.log('Row ID:', row.id); // Debugging
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${row.year}</td>
                    <td>${row.crop}</td>
                    <td>${row.fertilizer}</td>
                    <td>${row.output}</td>
                    <td>
                        <button class="btn btn-warning btn-sm edit-btn" data-id="${row.id}">Edit</button>
                        <button class="btn btn-danger btn-sm delete-btn" data-id="${row.id}">Delete</button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });

            // Attach event listeners to the new buttons
            attachEditDeleteListeners();

            // Render the chart
            renderFarmingDataChart(data);
        } else {
            alert(`Error: ${data.error}`);
        }
    } catch (error) {
        console.error('Error fetching farming data:', error);
        alert('An error occurred while fetching farming data.');
    }
}

// Attach event listeners to edit and delete buttons
function attachEditDeleteListeners() {
    // Remove existing event listeners to avoid duplicates
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.removeEventListener('click', handleEditClick);
    });
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.removeEventListener('click', handleDeleteClick);
    });

    // Add new event listeners
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', handleEditClick);
    });

    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', handleDeleteClick);
    });
}

function handleEditClick(e) {
    const recordId = e.target.getAttribute('data-id');
    console.log('Edit button clicked, recordId:', recordId); // Debugging
    if (!recordId) {
        console.error('Record ID is undefined');
        alert('Error: Record ID is missing.');
        return;
    }
    console.log('Editing record ID:', recordId); // Debugging
    editFarmingData(recordId);
}

function handleDeleteClick(e) {
    const recordId = e.target.getAttribute('data-id');
    if (!recordId) {
        console.error('Record ID is undefined');
        alert('Error: Record ID is missing.');
        return;
    }
    console.log('Deleting record ID:', recordId); // Debugging
    deleteFarmingData(recordId);
}

// Edit farming data
async function editFarmingData(recordId) {
    try {
        const response = await fetch(`/api/get-farming-data/${recordId}`);
        const data = await response.json();

        if (response.ok) {
            // Reset and populate form
            document.getElementById('farmingDataForm').reset();
            document.getElementById('year').value = data.year;
            document.getElementById('crop').value = data.crop;
            document.getElementById('fertilizer').value = data.fertilizer;
            document.getElementById('output').value = data.output;

            // Configure save button for update operation
            const saveButton = document.getElementById('saveFarmingDataBtn');
            saveButton.textContent = 'Update Data';
            
            // Set new click handler for update operation
            saveButton.onclick = async () => {
                const year = document.getElementById('year').value;
                const crop = document.getElementById('crop').value;
                const fertilizer = document.getElementById('fertilizer').value;
                const output = document.getElementById('output').value;

                if (!year || !crop || !fertilizer || !output) {
                    alert('Please fill all fields');
                    return;
                }

                try {
                    const response = await fetch(`/api/update-farming-data/${recordId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ year, crop, fertilizer, output })
                    });
                    const result = await response.json();

                    if (response.ok) {
                        // Close modal first
                        const farmingDataModal = bootstrap.Modal.getInstance(document.getElementById('farmingDataModal'));
                        farmingDataModal.hide();
                        
                        // Show success toast
                        const successToast = new bootstrap.Toast(document.getElementById('successToast'), {
                            autohide: true,
                            delay: 3000
                        });
                        successToast.show();
                        
                        // Reset form and cleanup
                        document.getElementById('farmingDataForm').reset();
                        cleanupModal();
                        fetchFarmingData();
                    } else {
                        alert(`Error: ${result.error}`);
                    }
                } catch (error) {
                    console.error('Error updating farming data:', error);
                    alert('An error occurred while updating farming data.');
                }
            };

            // Show the modal
            const farmingDataModal = new bootstrap.Modal(document.getElementById('farmingDataModal'));
            farmingDataModal.show();
        } else {
            alert(`Error: ${data.error}`);
        }
    } catch (error) {
        console.error('Error fetching farming data:', error);
        alert('An error occurred while fetching farming data.');
    }
}

// Update farming data
async function updateFarmingData(recordId) {
    const year = document.getElementById('year').value;
    const crop = document.getElementById('crop').value;
    const fertilizer = document.getElementById('fertilizer').value;
    const output = document.getElementById('output').value;

    if (!year || !crop || !fertilizer || !output) {
        alert('Please fill all fields');
        return;
    }

    try {
        const response = await fetch(`/api/update-farming-data/${recordId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ year, crop, fertilizer, output })
        });
        const result = await response.json();

        if (response.ok) {
            // Show success toast
            const successToast = new bootstrap.Toast(document.getElementById('successToast'));
            successToast.show();

            // Reset the form
            document.getElementById('farmingDataForm').reset();

            // Close the modal
            const farmingDataModal = bootstrap.Modal.getInstance(document.getElementById('farmingDataModal'));
            if (farmingDataModal) {
                farmingDataModal.dispose(); // Properly dispose of the modal
            }
            cleanupModal();

            // Fetch and update farming data
            fetchFarmingData();
        } else {
            alert(`Error: ${result.error}`);
        }
    } catch (error) {
        console.error('Error updating farming data:', error);
        alert('An error occurred while updating farming data.');
    }
}

// Delete farming data
async function deleteFarmingData(recordId) {
    if (confirm('Are you sure you want to delete this record?')) {
        try {
            const response = await fetch(`/api/delete-farming-data/${recordId}`, {
                method: 'DELETE'
            });
            const result = await response.json();

            if (response.ok) {
                // Show success toast
                const successToast = new bootstrap.Toast(document.getElementById('successToast'));
                successToast.show();

                // Fetch and update farming data
                fetchFarmingData();
            } else {
                alert(`Error: ${result.error}`);
            }
        } catch (error) {
            console.error('Error deleting farming data:', error);
            alert('An error occurred while deleting farming data.');
        }
    }
}

// Render farming data chart
function renderFarmingDataChart(data) {
    const canvas = document.getElementById('farmingDataChart');
    if (!canvas) {
        console.error('Farming data chart canvas not found');
        return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Failed to get 2D context for farming data chart canvas');
        return;
    }

    // Destroy existing chart only if it exists
    if (window.farmingDataChart && typeof window.farmingDataChart.destroy === 'function') {
        window.farmingDataChart.destroy();
    }

    const labels = data.map(row => row.year);
    const outputs = data.map(row => row.output);
    const isDarkMode = document.body.classList.contains('dark-mode');

    window.farmingDataChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Crop Output',
                data: outputs,
                backgroundColor: isDarkMode ? 'rgba(52, 152, 219, 0.2)' : 'rgba(66, 165, 81, 0.2)',
                borderColor: isDarkMode ? 'rgba(52, 152, 219, 1)' : 'rgba(46, 125, 50, 1)',
                borderWidth: 2,
                pointBackgroundColor: isDarkMode ? 'rgba(52, 152, 219, 1)' : 'rgba(46, 125, 50, 1)',
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Output (kg)',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        color: isDarkMode ? '#ecf0f1' : '#2c3e50'
                    },
                    ticks: {
                        color: isDarkMode ? '#ecf0f1' : '#2c3e50'
                    },
                    grid: {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Year',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        color: isDarkMode ? '#ecf0f1' : '#2c3e50'
                    },
                    ticks: {
                        color: isDarkMode ? '#ecf0f1' : '#2c3e50'
                    },
                    grid: {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const dataIndex = context.dataIndex;
                            const crop = data[dataIndex].crop;
                            const output = context.parsed.y;
                            return [`Crop: ${crop}`, `Output: ${output} kg`];
                        }
                    }
                },
                legend: {
                    labels: {
                        color: isDarkMode ? '#ecf0f1' : '#2c3e50'
                    }
                }
            }
        }
    });
}

// Ensure DOM elements are loaded before adding event listeners
document.addEventListener("DOMContentLoaded", function () {
    // Remove any existing event listeners first
    const cropButton = document.getElementById("crop-recommend-btn");
    const fertilizerButton = document.getElementById("fertilizer-recommend-btn");

    if (cropButton) {
        // Remove existing listeners before adding new one
        const newCropButton = cropButton.cloneNode(true);
        cropButton.parentNode.replaceChild(newCropButton, cropButton);
        newCropButton.addEventListener("click", getCropRecommendation, { once: true });
    } else {
        console.error("Crop Recommendation button not found.");
    }

    if (fertilizerButton) {
        // Remove existing listeners before adding new one
        const newFertilizerButton = fertilizerButton.cloneNode(true);
        fertilizerButton.parentNode.replaceChild(newFertilizerButton, fertilizerButton);
        newFertilizerButton.addEventListener("click", getFertilizerRecommendation, { once: true });
    } else {
        console.error("Fertilizer Recommendation button not found.");
    }

    // Only fetch farming data once
    if (!window.farmingDataFetched) {
        fetchFarmingData();
        window.farmingDataFetched = true;
    }
});

function cleanupModal() {
    // Remove modal backdrop
    const modalBackdrops = document.querySelectorAll('.modal-backdrop');
    modalBackdrops.forEach(backdrop => backdrop.remove());

    // Reset body styles and classes
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('padding-right');
    document.body.classList.remove('modal-open');

    // Force reflow
    window.setTimeout(() => {
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto';
    }, 100);
}

// Add this after your existing modal initialization code

document.getElementById('farmingDataModal').addEventListener('hidden.bs.modal', function () {
    // Remove modal backdrop
    const modalBackdrops = document.querySelectorAll('.modal-backdrop');
    modalBackdrops.forEach(backdrop => backdrop.remove());
    
    // Reset body styles
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
});

// Update the close button click handler
document.querySelector('[data-bs-dismiss="modal"]').addEventListener('click', function() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('farmingDataModal'));
    if (modal) {
        modal.hide();
    }
});