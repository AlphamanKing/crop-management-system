// Handle admin actions (approve, reject, suspend, unsuspend, delete)
document.querySelectorAll('.approve-btn, .reject-btn, .suspend-btn, .unsuspend-btn, .delete-btn').forEach(button => {
    button.addEventListener('click', async (e) => {
        const userId = e.target.getAttribute('data-id');
        const action = e.target.getAttribute('data-action');
        const token = localStorage.getItem('token');

        if (!token) {
            alert('Please login first.');
            window.location.href = '/admin/login';
            return;
        }

        if (confirm(`Are you sure you want to ${action} farmer with ID ${userId}?`)) {
            try {
                const response = await fetch('/api/admin/manage-farmer', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ user_id: userId, action: action }),
                    credentials: 'include'
                });
                const result = await response.json();

                if (response.ok) {
                    alert(result.message);
                    window.location.reload();
                } else {
                    alert(`Error: ${result.error}`);
                }
            } catch (error) {
                alert('An error occurred. Please try again.');
            }
        }
    });
});

// Handle View All Data button
document.getElementById('viewAllDataBtn').addEventListener('click', async () => {
    // Temporarily remove token check
    // const token = localStorage.getItem('token');
    // console.log('Token from localStorage:', token);
    //
    // if (!token) {
    //     alert('Please login first.');
    //     window.location.href = '/admin/login';
    //     return;
    // }

    try {
        const response = await fetch('/api/admin/all-data', {
            method: 'GET',
            // headers: {
            //     'Authorization': `Bearer ${token}`
            // },
            credentials: 'include'
        });
        const data = await response.json();
        console.log('Response data:', data);

        if (response.ok) {
            const tableBody = document.getElementById('allDataTableBody');
            tableBody.innerHTML = '';

            data.forEach(row => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${row.farmer_id || 'N/A'}</td>
                    <td>${row.date ? new Date(row.date).toLocaleString() : 'N/A'}</td>
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
            alert(`Error: ${data.error}`);
        }
    } catch (error) {
        console.error('Fetch error:', error);
        alert('An error occurred while fetching data. Please try again.');
    }
});