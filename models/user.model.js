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

  // createdAt
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: "created_at", // DB дээр created_at нэртэй хадгалагдана
  },

  // updatedAt
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: "updated_at", // DB дээр updated_at нэртэй хадгалагдана
  },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = User;