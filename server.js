const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('frontend'));

app.use('/api/auth',       require('./routes/auth.route'));
app.use('/api/violations', require('./routes/violations.route'));
app.use('/api/email',      require('./routes/email.route'));

app.listen(process.env.PORT, () =>
  console.log(`✅ Server http://localhost:${process.env.PORT}`)
);