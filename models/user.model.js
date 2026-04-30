const { DataTypes } = require("sequelize");
const sequelize = require("../db/database");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  gender: {
    allowNull: true,
    type: DataTypes.STRING
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  // --- НУУЦ ҮГ СЭРГЭЭХ ХЭСЭГ (Шинээр нэмэх) ---
  reset_password_token: {
    type: DataTypes.STRING,
    allowNull: true, // Зөвхөн нууц үг сэргээх хүсэлт гаргахад утга авна
  },
  reset_password_expires: {
    type: DataTypes.DATE,
    allowNull: true, // Код хүчинтэй байх хугацаа
  },
  // ----------------------------------------

  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: "created_at",
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: "updated_at",
  },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = User;