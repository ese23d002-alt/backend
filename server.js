const express = require('express');
const cors    = require('cors');
const path    = require('path'); // Path-г заавал нэмнэ
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
require('dotenv').config();

const app = express();

// Портоо тодорхойлох (process.env.PORT байхгүй бол 3000-г ашиглана)
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
        url: `http://localhost:${PORT}`, // Энд PORT хувьсагчаа ашиглана
      },
    ],
  },
  // Замыг path.join ашиглаж засах (илүү найдвартай)
  apis: [path.join(__dirname, 'routes', '*.js')], 
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Middleware (CORS хамгийн дээр байх ёстой)
app.use(cors());
app.use(express.json());
app.use(express.static('frontend'));

// Үндсэн GET зам (Сервер ажиллаж байгааг шалгах)
app.get('/', (req, res) => {
  res.json({ message: "Server is running", swagger: "/api-docs" });
});

// Swagger UI-ийг /api-docs зам дээр нээх
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// API замууд
app.use('/api/auth',       require('./routes/auth.route'));
app.use('/api/violations', require('./routes/violations.route'));
app.use('/api/email',      require('./routes/email.route'));

// Серверийг асаах (PORT хувьсагчийг ашиглаж байгааг анхаарна уу)
app.listen(PORT, () =>
  console.log(`✅ Server is running at http://localhost:${PORT}`)
);