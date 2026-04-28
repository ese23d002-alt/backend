const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

// 1. Тохиргоог унших
require('dotenv').config();

// 2. DB холболтыг дуудах
const db = require("./db/database"); 

// --- ЧУХАЛ: Моделийг синхрончлохоос өмнө заавал require хийнэ ---
const User = require("./models/user.model"); 

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
    servers: [{ url: `http://localhost:${PORT}` }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [path.join(__dirname, 'routes', '*.js')],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('frontend'));

// --- ӨГӨГДЛИЙН САН ---
// db.sync() нь бүх бүртгэгдсэн моделиудыг нэг дор 
db.sync({ alter: true }) 
  .then(() => {
    console.log('✅ Өгөгдлийн сангийн хүснэгтүүд (Users) амжилттай шалгагдлаа/үүслээ.');
  })
  .catch(err => {
    console.error('❌ Хүснэгт үүсгэхэд алдаа гарлаа:', err);
  });

// Үндсэн зам
app.get('/', (req, res) => {
  res.json({ message: "Server is running", swagger: "/api-docs" });
});

// Route-үүд
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use('/api/auth', require('./routes/auth.route'));
app.use('/api/violations', require('./routes/violations.route'));
app.use('/api/email', require('./routes/email.route'));

// Алдаа барих хэсэг
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Сервер дээр алдаа гарлаа!' });
});

// Серверийг асаах
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
  console.log(`📑 Swagger: http://localhost:${PORT}/api-docs`);
});