const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'requests.json');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Helper to read data
const readData = () => {
    if (!fs.existsSync(DATA_FILE)) {
        return [];
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data || '[]');
};

// Helper to write data
const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
};

// GET /api/requests
app.get('/api/requests', (req, res) => {
    const data = readData();
    res.json(data);
});

// GET /api/requests/:id
app.get('/api/requests/:id', (req, res) => {
    const data = readData();
    const reqId = parseInt(req.params.id, 10);
    const request = data.find(r => r.id === reqId);
    
    if (request) {
        res.json(request);
    } else {
        res.status(404).json({ error: 'Request not found' });
    }
});

// POST /api/requests
app.post('/api/requests', (req, res) => {
    const data = readData();
    const newRequest = {
        id: data.length > 0 ? data[data.length - 1].id + 1 : 1,
        studentName: req.body.studentName,
        email: req.body.email,
        category: req.body.category,
        problemDescription: req.body.problemDescription,
        priority: req.body.priority,
        status: 'Open',
        createdAt: new Date().toISOString()
    };
    
    data.push(newRequest);
    writeData(data);
    res.status(201).json(newRequest);
});

// PUT /api/requests/:id
app.put('/api/requests/:id', (req, res) => {
    const data = readData();
    const reqId = parseInt(req.params.id, 10);
    const index = data.findIndex(r => r.id === reqId);
    
    if (index !== -1) {
        const updatedRequest = {
            ...data[index],
            ...req.body,
            id: reqId // Ensure ID cannot be changed
        };
        data[index] = updatedRequest;
        writeData(data);
        res.json(updatedRequest);
    } else {
        res.status(404).json({ error: 'Request not found' });
    }
});

// DELETE /api/requests/:id
app.delete('/api/requests/:id', (req, res) => {
    let data = readData();
    const reqId = parseInt(req.params.id, 10);
    const initialLength = data.length;
    
    data = data.filter(r => r.id !== reqId);
    
    if (data.length < initialLength) {
        writeData(data);
        res.json({ message: 'Request deleted successfully' });
    } else {
        res.status(404).json({ error: 'Request not found' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
