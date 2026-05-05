const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
require('dotenv').config();

// 1. Өгөгдлийн сан болон Моделүүдийг импортлох
const sequelize = require("./db/database");
// Моделүүдийг заавал энд дуудаж өгснөөр sequelize.sync() ажиллахдаа тэдгээрийг таньж баазад үүсгэнэ.
const { User, ViolationGroup, Violation } = require("./models/user.model"); 
const { error } = require('console');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Swagger Тохиргоо ---
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

// --- Middleware ---
app.use(cors({
  origin: ['http://172.16.101.73:5173', 'http://localhost:5173', 'http://172.16.101.72:3000', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('frontend'));  
sequelize.sync({ alter: true }) 
  .then(() => {
    console.log("✅ Бааз амжилттай шинэчлэгдлээ. (Users, ViolationGroups, Violations)");
  })
  .catch(err => {
    console.error("❌ Өгөгдлийн сангийн синхрончлолын алдаа:", err);
  });

// --- Маршрутууд (Routes) ---
app.get('/', (req, res) => {
  res.json({ message: "Server is running", swagger: "/api-docs" });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use('/api/auth', require('./routes/auth.route'));
app.use('/api/violations', require('./routes/violations.route'));
app.use('/api/email', require('./routes/email.route'));

// --- Алдаа барих Middleware ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Сервер дээр алдаа гарлаа!' });
}); 

// --- Серверийг асаах ---
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
  console.log(`📑 Swagger: http://localhost:${PORT}/api-docs`);
});