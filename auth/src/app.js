require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { swaggerUi, swaggerSpec } = require('./config/swagger');
const authRoutes = require('./routes/auth.routes');

const app = express();
const API_VERSION = process.env.API_VERSION || 'v1';
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 50 }));

// Swagger Docs
app.use(
  `/api/${API_VERSION}/docs`,
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Auth Service API Docs',
  })
);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: process.env.SERVICE_NAME || 'auth-service',
    version: API_VERSION,
    timestamp: new Date().toISOString(),
    note: 'Almacenamiento en memoria — los usuarios se reinician con el servicio',
  });
});

// Routes
app.use(`/api/${API_VERSION}/auth`, authRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint no encontrado' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[Auth Service Error]', err.message);
  res.status(500).json({ success: false, message: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`✅ Auth Service corriendo en puerto ${PORT}`);
  console.log(`📚 Swagger docs: http://localhost:${PORT}/api/${API_VERSION}/docs`);
});

module.exports = app;
