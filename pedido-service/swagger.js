const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Microservicio de Pedidos',
      version: '1.0.0',
      description: 'API para gestionar pedidos de usuarios',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:3002',
        description: 'Desarrollo',
      },
    ],
    components: {
      schemas: {
        Pedido: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
            },
            usuarioId: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            productos: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  nombre: {
                    type: 'string',
                    example: 'Laptop',
                  },
                  cantidad: {
                    type: 'number',
                    example: 1,
                  },
                  precio: {
                    type: 'number',
                    example: 999.99,
                  },
                },
              },
            },
            estado: {
              type: 'string',
              enum: ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'],
              example: 'pendiente',
            },
            total: {
              type: 'number',
              example: 999.99,
            },
            direccion: {
              type: 'string',
              example: 'Calle Principal 123, Madrid',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
  },
  apis: ['./routes/pedidos.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
