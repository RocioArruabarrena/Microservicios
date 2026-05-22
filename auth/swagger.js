const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const API_VERSION = process.env.API_VERSION || 'v1';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Auth Service API',
      version: '1.0.0',
      description: `
## Microservicio de Autenticación Centralizado

Gestiona la creación de usuarios y la emisión de tokens JWT.
Los demás microservicios (User Service, Order Service) validan sus tokens
contra la clave secreta compartida \`JWT_SECRET\`.

### Flujo de autenticación
\`\`\`
1. POST /create-user  → crear cuenta
2. POST /login        → obtener JWT
3. Usar JWT en Authorization: Bearer <token> en User/Order Service
\`\`\`

### Payload del token
\`\`\`json
{
  "id": "user-xxx",
  "email": "user@example.com",
  "role": "user",
  "iat": 1700000000,
  "exp": 1700604800
}
\`\`\`
      `,
    },
    servers: [
      { url: `http://localhost:3000/api/${API_VERSION}`, description: 'Auth Service directo' },
      { url: `http://localhost:80/api/${API_VERSION}`, description: 'Via API Gateway (Nginx)' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        CreateUserRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', minLength: 2, example: 'María García' },
            email: { type: 'string', format: 'email', example: 'maria@example.com' },
            password: { type: 'string', minLength: 6, example: 'Secret123!' },
            role: { type: 'string', enum: ['user', 'admin'], default: 'user' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'maria@example.com' },
            password: { type: 'string', example: 'Secret123!' },
          },
        },
        TokenResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Login exitoso' },
            data: {
              type: 'object',
              properties: {
                token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                expiresIn: { type: 'string', example: '7d' },
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    email: { type: 'string' },
                    role: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        ValidateTokenRequest: {
          type: 'object',
          required: ['token'],
          properties: {
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Registro, login y validación de tokens' },
      { name: 'Health', description: 'Estado del servicio' },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = { swaggerUi, swaggerSpec };