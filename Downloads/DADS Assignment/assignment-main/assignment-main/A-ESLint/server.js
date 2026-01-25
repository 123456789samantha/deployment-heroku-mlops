const express =  require('express')
const path    = require('path');
const app     =  express()
const PORT    =  3000

// Middleware
app.use(express.json());
app.use(express.static('public')); // Serve static files

// Simple in-memory "database"
let users   =  {};
let nextId  =  1;

// A simple function to be unit tested with Jest
const add       = (a, b) => a + b;
const substract = (a, b) => a - b; 

// --- API Endpoints ---

// GET (Read All): Get all users
app.get('/api/users', (req, res) => {
  res.status(200).json(Object.values(users));
});

// POST (Create): Create a new user
app.post('/api/users', (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
    }
    const newUser      =  { id: nextId++, name, email };
    users[newUser.id]  =  newUser;
    res.status(201).json(newUser);
});

// GET (Read One): Get a single user by ID
app.get('/api/users/:id', (req, res) => {
    const user = users[parseInt(req.params.id)];
    user ? res.status(200).json(user) : res.status(404).json({ error: 'User not found' });
});

// PUT (Update/Replace): Replace a user's record
app.put('/api/users/:id', (req, res) => {
    const id = parseInt(req.params.id);
    if (!users[id]) return res.status(404).json({ error: 'User not found' });
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Full name and email are required' });
    users[id] = { id, name, email };
    res.status(200).json(users[id]);
});

// PATCH (Partial Update): Update one or more fields
app.patch('/api/users/:id', (req, res) => {
    const id = parseInt(req.params.id);
    if (!users[id]) return res.status(404).json({ error: 'User not found' })
    if (req.body.name) users[id].name    =  req.body.name
    if (req.body.email) users[id].email  =  req.body.email
    res.status(200).json(users[id]);
});

// DELETE: Remove a user
app.delete('/api/users/:id', (req, res) => {
    const id = parseInt(req.params.id)
    if (users[id]) {
        delete users[id]
        res.status(204).send()
    } else {
        res.status(404).json({ error: 'User not found' })
    }
});

// --- Server Start ---
let server
if (require.main === module) {
    server = app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`)
    });
}

module.exports = { app, server, add, substract }