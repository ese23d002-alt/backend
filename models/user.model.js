const { DataTypes } = require("sequelize");
const sequelize = require("../db/database");

// 1. Хэрэглэгчийн модел
const User = sequelize.define("User", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    reset_password_token: { type: DataTypes.STRING },
    reset_password_expires: { type: DataTypes.DATE }
}, { underscored: true, tableName: 'users' });

// 2. Зөрчлийн Групп (Дугаар, Жил, Улирал, Үнэлгээ)
const ViolationGroup = sequelize.define("ViolationGroup", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    group_number: { type: DataTypes.STRING, allowNull: false }, // ЗД-2026-001
    year: { type: DataTypes.INTEGER, allowNull: false },        // 2026
    quarter: { type: DataTypes.STRING, allowNull: false },      // "I улирал" (Зураг дээрхтэй тааруулав)
    rating: { type: DataTypes.STRING }                          // Бага, Дунд, Их
}, { underscored: true, tableName: 'violation_groups' });

// 3. Зөрчил ба Арга хэмжээ
const Violation = sequelize.define("Violation", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },        // Зөрчлийн нэр
    description: { type: DataTypes.TEXT },                      // Тайлбар
    severity: { type: DataTypes.STRING },                       // Эрсдэл
    department: { type: DataTypes.STRING },                     // Хэлтэс
    action_plan: { type: DataTypes.TEXT },                      // Авах арга хэмжээ
    due_date: { type: DataTypes.DATEONLY },                      // Дуусах огноо (Зураг дээрх Date picker)
    status: { type: DataTypes.STRING, defaultValue: "Шинэ" },
    assignee_name: { type: DataTypes.STRING },                  // Хариуцагч
    assignee_email: { type: DataTypes.STRING },
    manager_name: { type: DataTypes.STRING },
    execution_response: { type: DataTypes.TEXT },
    evidence_file: { type: DataTypes.STRING }
}, { underscored: true, tableName: 'violations' });

// --- Хамаарал тохируулах (Association) ---
// Групп устгахад хамааралтай бүх зөрчил хамт устахаар (onDelete: 'CASCADE') тохируулав
ViolationGroup.hasMany(Violation, { as: "violations", foreignKey: "group_id", onDelete: 'CASCADE' });
Violation.belongsTo(ViolationGroup, { as: "group", foreignKey: "group_id" });

module.exports = { User, ViolationGroup, Violation };