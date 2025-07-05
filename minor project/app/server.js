// server.js
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const xlsx = require('xlsx');
const path = require('path');
const app = express();

const PORT = 3000;
const EXCEL_FILE = 'users.xlsx';

app.use(bodyParser.json());
app.use(express.static('public'));

function loadUsers() {
    if (!fs.existsSync(EXCEL_FILE)) {
        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet([]);
        xlsx.utils.book_append_sheet(wb, ws, 'Users');
        xlsx.writeFile(wb, EXCEL_FILE);
    }
    const wb = xlsx.readFile(EXCEL_FILE);
    const ws = wb.Sheets['Users'];
    return xlsx.utils.sheet_to_json(ws);
}

function saveUsers(users) {
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(users);
    xlsx.utils.book_append_sheet(wb, ws, 'Users');
    xlsx.writeFile(wb, EXCEL_FILE);
}

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const users = loadUsers();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        res.json({ success: true, message: 'Login successful!',user: {
 firstName: user.firstName,
 middleName: user.middleName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
            phoneNumber: user.phoneNumber
        }
});
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});
app.post('/signup', (req, res) => {
    const userData = req.body;
    const users = loadUsers();

    if (users.some(u => u.username === userData.username)) {
        return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    users.push(userData);
    saveUsers(users);
    res.json({ success: true, message: 'Signup successful!' });
});

app.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});