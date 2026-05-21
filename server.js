const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
require('dotenv').config();

// 1. Өгөгдлийн сан болон Моделүүдийг импортлох (Замыг зөв тохируулсан: ./)
const sequelize = require("./db/database");
const { User, ViolationGroup, Violation, Risk } = require("./models/user.model"); 

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.SERVER_HOST || 'localhost';

// --- Swagger Тохиргоо ---
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Backend API Documentation',
      version: '1.0.0',
      description: 'Системийн API замуудын тайлбар болон туршилт',
    },
    servers: [
      { url: `http://localhost:${PORT}`, description: 'Локал' },
      { url: `http://${HOST}:${PORT}`,   description: 'Сүлжээ' }
    ],
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

// --- Middleware (Дараалал чухал!) ---
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://192.168.160.119:5173',
    'http://10.20.19.20:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());                         // ✅ 1-р: JSON задлагч
app.use(express.urlencoded({ extended: true })); // ✅ 2-р: URL задлагч
app.use(express.static('frontend'));             // ✅ 3-р: Статик файлууд

// ✅ JSON алдаа барих middleware — express.json() -НЫ ДАРАА байх ёстой
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error("❌ Ирсэн датаны JSON бүтэц эвдэрсэн байна (Malformed JSON)!");
    return res.status(400).json({
      success: false,
      message: "Илгээсэн датаны JSON формат буруу байна. Хашилт, таслал эсвэл тусгай тэмдэгтүүдээ шалгана уу!"
    });
  }
  next();
});

// --- Маршрутууд (Routes) ---
app.get('/', (req, res) => {
  res.json({ message: "Server is running", swagger: "/api-docs" });
});

app.use('/api-docs',       swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use('/api/auth',       require('./routes/auth.route'));
app.use('/api/violations', require('./routes/violations.route'));
app.use('/api/email',      require('./routes/email.route'));
app.use('/api/risks',      require('./routes/risk.route'));

// --- Ерөнхий алдаа барих Middleware (хамгийн сүүлд!) ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Сервер дээр алдаа гарлаа!' });
});

// --- 🔥 Өгөгдлийн санг холбож, бүтэцийг шинэчлэх (Alter) ---
// Энэ үйлдэл нь image_url баганыг нэмж, нөгөө хассан 2 баганыг MySQL дээрээс устгана
sequelize.sync({ alter: false }) 
  .then(() => {
    
    // --- Серверийг асаах (Бааз бэлэн болсны дараа) ---
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🚀 Backend сервер амжилттай аслаа!`);
      console.log(`➜ Local:   http://localhost:${PORT}`);
      console.log(`➜ Network: http://${HOST}:${PORT}`);
      console.log(`➜ Swagger: http://${HOST}:${PORT}/api-docs\n`);
    });
  })
  .catch(err => {
    console.error("❌ Баазыг шинэчлэх эсвэл холбоход алдаа гарлаа:", err);
  });