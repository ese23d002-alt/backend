const express = require('express');
const cors    = require('cors');
const path    = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

// 1. dotenv-ийг хамгийн дээр дуудах нь бусад файлууд .env-ийг уншихад тусална
require('dotenv').config();

// 2. Өгөгдлийн сангийн холболтыг дуудах
const db = require("./db/database"); 

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
  },
  apis: [path.join(__dirname, 'routes', '*.js')], 
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Нэмэлтээр формын дата уншихад хэрэгтэй
app.use(express.static('frontend'));

// Өгөгдлийн сангийн холболтыг баталгаажуулах (Authentication)
db.authenticate()
  .then(() => {
    console.log('✅ MySQL Database холбогдлоо.');
    // Хүснэгтүүдийг синхрончлох (Сонголтоор: db.sync() ашиглаж болно)
  })
  .catch(err => {
    console.error('❌ MySQL холболтын алдаа:', err);
  });

// Үндсэн зам
app.get('/', (req, res) => {
  res.json({ message: "Server is running", swagger: "/api-docs" });
});

// Swagger болон бусад Route-үүд
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/api/auth',       require('./routes/auth.route'));
app.use('/api/violations', require('./routes/violations.route'));
app.use('/api/email',      require('./routes/email.route'));

// Алдаа барих хэсэг (Error Handling Middleware)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Ямар нэг зүйл буруу боллоо!');
});

app.listen(PORT, () =>
  console.log(`🚀 Server is running at http://localhost:${PORT}`)
);