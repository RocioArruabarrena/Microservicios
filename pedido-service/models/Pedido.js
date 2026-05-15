const mongoose = require('mongoose');

const pedidoSchema = new mongoose.Schema({
  usuarioId: {
    type: String,
    required: true,
  },
  productos: [
    {
      nombre: String,
      cantidad: Number,
      precio: Number,
    },
  ],
  estado: {
    type: String,
    enum: ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'],
    default: 'pendiente',
  },
  total: {
    type: Number,
    required: true,
  },
  direccion: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Pedido', pedidoSchema);
