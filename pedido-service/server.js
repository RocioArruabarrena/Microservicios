const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const pedidosRoutes = require('./routes/pedidos');

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongodb:27017/pedidos', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✓ Conectado a MongoDB - Pedidos'))
.catch(err => console.log('✗ Error conexión MongoDB:', err));

// Routes
app.use('/api/pedidos', pedidosRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Pedido service is running' });
});

const PORT = process.env.PORT || 8002;
app.listen(PORT, () => {
  console.log(`🚀 Pedido Service ejecutándose en puerto ${PORT}`);
  console.log(`📚 Documentación Swagger: http://localhost:${PORT}/api-docs`);
});
