const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();

// Global middleware
app.use(cors());
app.use(express.json());

// API routes
app.use('/api', routes);

module.exports = app;


