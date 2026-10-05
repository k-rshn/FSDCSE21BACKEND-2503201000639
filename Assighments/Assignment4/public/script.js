document.addEventListener('DOMContentLoaded', () => {
    const requestForm = document.getElementById('requestForm');
    const requestsList = document.getElementById('requestsList');
    const submitBtn = document.getElementById('submitBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    
    // API URL
    const API_URL = '/api/requests';

    // Fetch and display all requests
    const fetchRequests = async () => {
        try {
            const response = await fetch(API_URL);
            const requests = await response.json();
            displayRequests(requests);
        } catch (error) {
            console.error('Error fetching requests:', error);
        }
    };

    // Display requests in the UI
    const displayRequests = (requests) => {
        requestsList.innerHTML = '';
        if (requests.length === 0) {
            requestsList.innerHTML = '<p>No requests submitted yet.</p>';
            return;
        }

        requests.forEach(request => {
            const card = document.createElement('div');
            card.className = 'request-card';
            
            const priorityClass = request.priority.toLowerCase() === 'high' ? 'priority-high' : 
                                  request.priority.toLowerCase() === 'medium' ? 'priority-medium' : 'priority-low';

            card.innerHTML = `
                <div class="request-header">
                    <strong>#${request.id} - ${request.category}</strong>
                    <span class="${priorityClass}">Priority: ${request.priority}</span>
                </div>
                <p><strong>Student:</strong> ${request.studentName} (${request.email})</p>
                <p><strong>Description:</strong> ${request.problemDescription}</p>
                <p><small>Submitted: ${new Date(request.createdAt).toLocaleString()}</small></p>
                <div class="request-actions">
                    <button class="edit-btn" onclick="editRequest(${request.id})">Edit</button>
                    <button class="delete-btn" onclick="deleteRequest(${request.id})">Delete</button>
                </div>
            `;
            requestsList.appendChild(card);
        });
    };

    // Submit form (Create or Update)
    requestForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const requestId = document.getElementById('requestId').value;
        const requestData = {
            studentName: document.getElementById('studentName').value,
            email: document.getElementById('email').value,
            category: document.getElementById('category').value,
            problemDescription: document.getElementById('problemDescription').value,
            priority: document.getElementById('priority').value
        };

        try {
            if (requestId) {
                // Update
                await fetch(`${API_URL}/${requestId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestData)
                });
            } else {
                // Create
                await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestData)
                });
            }
            
            resetForm();
            fetchRequests();
        } catch (error) {
            console.error('Error saving request:', error);
        }
    });

    // Edit Request (populate form)
    window.editRequest = async (id) => {
        try {
            const response = await fetch(`${API_URL}/${id}`);
            const request = await response.json();
            
            document.getElementById('requestId').value = request.id;
            document.getElementById('studentName').value = request.studentName;
            document.getElementById('email').value = request.email;
            document.getElementById('category').value = request.category;
            document.getElementById('problemDescription').value = request.problemDescription;
            document.getElementById('priority').value = request.priority;
            
            submitBtn.textContent = 'Update Request';
            cancelBtn.style.display = 'inline-block';
            window.scrollTo(0, 0);
        } catch (error) {
            console.error('Error fetching request details:', error);
        }
    };

    // Cancel Edit
    cancelBtn.addEventListener('click', () => {
        resetForm();
    });

    // Reset Form helper
    const resetForm = () => {
        requestForm.reset();
        document.getElementById('requestId').value = '';
        submitBtn.textContent = 'Submit Request';
        cancelBtn.style.display = 'none';
    };

    // Delete Request
    window.deleteRequest = async (id) => {
        if (confirm('Are you sure you want to delete this request?')) {
            try {
                await fetch(`${API_URL}/${id}`, {
                    method: 'DELETE'
                });
                fetchRequests();
            } catch (error) {
                console.error('Error deleting request:', error);
            }
        }
    };

    // Initial fetch
    fetchRequests();
});
