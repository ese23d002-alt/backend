const { DataTypes } = require("sequelize");
const sequelize = require("../db/database"); // Холболтыг импортлов
// 1. Хэрэглэгчийн модел
const User = sequelize.define("User", {
id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
username: { type: DataTypes.STRING, allowNull: false, unique: true },
email: { type: DataTypes.STRING, allowNull: false, unique: true },
password: { type: DataTypes.STRING, allowNull: false },
reset_password_token: { type: DataTypes.STRING },
reset_password_expires: { type: DataTypes.DATE }
}, { underscored: true });
// 2. Зөрчлийн Групп (Дугаар, Жил, Улирал, Үнэлгээ)
const ViolationGroup = sequelize.define("ViolationGroup", {
group_number: { type: DataTypes.STRING, allowNull: false },
year: { type: DataTypes.INTEGER, allowNull: false },
quarter: { type: DataTypes.INTEGER, allowNull: false },
rating: { type: DataTypes.STRING }
}, { underscored: true, tableName: 'violation_groups' });
// 3. Зөрчил ба Арга хэмжээ
const Violation = sequelize.define("Violation", {
title: { type: DataTypes.STRING, allowNull: false },
description: { type: DataTypes.TEXT },
severity: { type: DataTypes.STRING },
department: { type: DataTypes.STRING },
action_plan: { type: DataTypes.TEXT },
due_date: { type: DataTypes.DATE },
status: { type: DataTypes.STRING, defaultValue: "Шинэ" },
assignee_name: { type: DataTypes.STRING },
assignee_email: { type: DataTypes.STRING },
manager_name: { type: DataTypes.STRING },
execution_response: { type: DataTypes.TEXT },
evidence_file: { type: DataTypes.STRING }
}, { underscored: true, tableName: 'violations' });

// Хамаарал тохируулах
ViolationGroup.hasMany(Violation, { as: "violations", foreignKey: "group_id" });
Violation.belongsTo(ViolationGroup, { as: "group", foreignKey: "group_id" });
module.exports = { User, ViolationGroup, Violation };