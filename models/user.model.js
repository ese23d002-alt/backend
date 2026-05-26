const { DataTypes } = require("sequelize");
const sequelize = require("../db/database");


// 1. Хэрэглэгчийн модел
const User = sequelize.define("User", {
    id:                     { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    username:               { type: DataTypes.STRING, allowNull: false, unique: true },
    email:                  { type: DataTypes.STRING, allowNull: false, unique: true },
    password:               { type: DataTypes.STRING, allowNull: false },
    reset_password_token:   { type: DataTypes.STRING },
    reset_password_expires: { type: DataTypes.DATE }
}, { underscored: true, tableName: 'users' });

// 2. Зөрчлийн Бүлэг
// files талбар: Cloudinary-д хадгалсан файлуудын JSON массив
// [{ public_id, secure_url, url, original_name, resource_type, format }, ...]
const ViolationGroup = sequelize.define("ViolationGroup", {
    id:           { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    group_number: { type: DataTypes.STRING, allowNull: false },
    year:         { type: DataTypes.INTEGER, allowNull: false },
    quarter:      { type: DataTypes.STRING, allowNull: false },
    rating:       { type: DataTypes.STRING },
    files:        { type: DataTypes.TEXT, allowNull: true } // JSON массив хэлбэрээр хадгална
}, { underscored: true, tableName: 'violation_groups' });

// 3. Зөрчил
const Violation = sequelize.define("Violation", {
    id:             { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title:          { type: DataTypes.STRING, allowNull: false },
    description:    { type: DataTypes.TEXT },
    severity:       { type: DataTypes.STRING },
    department:     { type: DataTypes.STRING },
    action_plan:    { type: DataTypes.TEXT },
    due_date:       { type: DataTypes.DATEONLY },
    status:         { type: DataTypes.STRING, defaultValue: "Шинэ" },
    assignee_name:  { type: DataTypes.STRING },
    assignee_email: { type: DataTypes.STRING },
    manager_name:   { type: DataTypes.STRING },
    image_urls:     { type: DataTypes.TEXT, allowNull: true }
}, { underscored: true, tableName: 'violations' });

// 4. Risk
const Risk = require("./risk.models");

// --- Хамаарал ---
ViolationGroup.hasMany(Violation, { as: "violations", foreignKey: "group_id", onDelete: 'CASCADE' });
Violation.belongsTo(ViolationGroup, { as: "group", foreignKey: "group_id" });

module.exports = { User, ViolationGroup, Violation, Risk };