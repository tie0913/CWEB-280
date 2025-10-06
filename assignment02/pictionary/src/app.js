require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const pinoHttp = require('pino-http')();

const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(pinoHttp);

// Health check
app.get('/healthz', (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

// example api
app.get('/api/v1/hello', (req, res) => {
  res.status(200).json({ message: 'Hello, JSON only interface' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: { message: 'Not Found' } });
});

// uniform error execution
app.use((err, req, res, next) => {
  req.log?.error(err);
  res.status(500).json({ error: { message: 'Internal Server Error' } });
});

module.exports = app;
