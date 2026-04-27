const express = require('express');
const cors    = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
require('dotenv').config();

const app = express();

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
        url: `http://localhost:${process.env.PORT || 5000}`,
      },
    ],
  },
  // Таны route файлууд хаана байгааг зааж өгнө
  apis: ['./routes/*.js'], 
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

app.use(cors());
app.use(express.json());
app.use(express.static('frontend'));

// Swagger UI-ийг /api-docs зам дээр нээх
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// API замууд
app.use('/api/auth',       require('./routes/auth.route'));
app.use('/api/violations', require('./routes/violations.route'));
app.use('/api/email',      require('./routes/email.route'));

app.listen(process.env.PORT, () =>
  console.log(`✅ Server http://localhost:${process.env.PORT}`)
);