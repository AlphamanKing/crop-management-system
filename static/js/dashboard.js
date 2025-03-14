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
    const chart = window.nutrientChart;
    if (chart) {
        chart.data.datasets[0].backgroundColor = isDarkMode ? 'rgba(52, 152, 219, 0.7)' : 'rgba(66, 165, 81, 0.7)';
        chart.data.datasets[0].borderColor = isDarkMode ? 'rgba(52, 152, 219, 1)' : 'rgba(46, 125, 50, 1)';
        chart.options.scales.x.title.color = isDarkMode ? '#ecf0f1' : '#000';
        chart.options.scales.y.title.color = isDarkMode ? '#ecf0f1' : '#000';
        chart.options.scales.x.ticks.color = isDarkMode ? '#ecf0f1' : '#000';
        chart.options.scales.y.ticks.color = isDarkMode ? '#ecf0f1' : '#000';
        chart.update();
    }
}