const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Microservicio de Usuarios',
      version: '1.0.0',
      description: 'API para gestionar la información de usuarios',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Desarrollo',
      },
    ],
    components: {
      schemas: {
        Usuario: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
            },
            nombre: {
              type: 'string',
              example: 'Juan Pérez',
            },
            email: {
              type: 'string',
              example: 'juan@example.com',
            },
            contraseña: {
              type: 'string',
              example: 'password123',
            },
            telefono: {
              type: 'string',
              example: '+34 123 456 789',
            },
            activo: {
              type: 'boolean',
              example: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
  },
  apis: ['./routes/usuarios.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
