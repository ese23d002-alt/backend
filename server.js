const express = require('express');
const cors    = require('cors');
const path    = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Swagger Тохиргоо
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Backend API Documentation',
      version: '1.0.0',
      description: 'Системийн API замуудын тайлбар болон туршилт',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
    // --- ЭНЭ ХЭСЭГ AUTHORIZE ТОВЧИЙГ ГАРГАЖ ИРНЭ ---
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    // ------------------------------------------
  },
  apis: [path.join(__dirname, 'routes', '*.js')], 
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

app.use(cors());
app.use(express.json());
app.use(express.static('frontend'));

app.get('/', (req, res) => {
  res.json({ message: "Server is running", swagger: "/api-docs" });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/api/auth',       require('./routes/auth.route'));
app.use('/api/violations', require('./routes/violations.route'));
app.use('/api/email',      require('./routes/email.route'));

app.listen(PORT, () =>
  console.log(`✅ Server is running at http://localhost:${PORT}`)
);