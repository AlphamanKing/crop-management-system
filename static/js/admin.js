// Handle admin actions (approve, reject, suspend, unsuspend, delete)
document.querySelectorAll('.approve-btn, .reject-btn, .suspend-btn, .unsuspend-btn, .delete-btn').forEach(button => {
    button.addEventListener('click', async (e) => {
        const userId = e.target.getAttribute('data-id');
        const action = e.target.getAttribute('data-action');

        if (confirm(`Are you sure you want to ${action} farmer with ID ${userId}?`)) {
            try {
                const response = await fetch('/api/admin/manage-farmer', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ user_id: userId, action: action }),
                    credentials: 'include'
                });
                const result = await response.json();

                if (response.ok) {
                    alert(result.message);
                    window.location.reload();
                } else {
                    if (response.status === 401) {
                        alert('Session expired. Please login again.');
                        window.location.href = '/admin/login';
                    } else {
                        alert(`Error: ${result.error}`);
                    }
                }
            } catch (error) {
                alert('An error occurred. Please try again.');
            }
        }
    });
});

// When displaying the date in the modal
function formatDate(dateString) {
    try {
        // Parse the MySQL timestamp directly without adding 'Z'
        const date = new Date(dateString);
        
        // Subtract 3 hours to match local time
        date.setHours(date.getHours() - 3);
        
        return date.toLocaleString('en-GB', { 
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    } catch (error) {
        console.error('Date formatting error:', error);
        return dateString || 'Invalid Date';
    }
}

// Handle View All Data button
document.getElementById('viewAllDataBtn').addEventListener('click', async () => {
    try {
        const response = await fetch('/api/admin/all-data', {
            method: 'GET',
            credentials: 'include'
        });
        const data = await response.json();

        if (response.ok) {
            const tableBody = document.getElementById('allDataTableBody');
            tableBody.innerHTML = '';

            data.forEach(row => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${row.farmer_id || 'N/A'}</td>
                    <td>${row.date ? formatDate(row.date) : 'N/A'}</td>
                    <td>${row.nitrogen || 'N/A'}</td>
                    <td>${row.phosphorus || 'N/A'}</td>
                    <td>${row.potassium || 'N/A'}</td>
                    <td>${row.temperature || 'N/A'}</td>
                    <td>${row.humidity || 'N/A'}</td>
                    <td>${row.ph || 'N/A'}</td>
                    <td>${row.rainfall || 'N/A'}</td>
                    <td>${row.moisture || 'N/A'}</td>
                    <td>${row.soil_type || 'N/A'}</td>
                    <td>${row.crop || 'N/A'}</td>
                    <td>${row.fertilizer || 'N/A'}</td>
                `;
                tableBody.appendChild(tr);
            });

            new bootstrap.Modal(document.getElementById('allDataModal')).show();
        } else {
            if (response.status === 401) {
                alert('Session expired. Please login again.');
                window.location.href = '/admin/login';
            } else {
                alert(`Error: ${data.error}`);
            }
        }
    } catch (error) {
        console.error('Fetch error:', error);
        alert('An error occurred while fetching data. Please try again.');
    }
});