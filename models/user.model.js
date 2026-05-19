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

// 2. Зөрчлийн Групп
const ViolationGroup = sequelize.define("ViolationGroup", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    group_number: { type: DataTypes.STRING, allowNull: false },
    year: { type: DataTypes.INTEGER, allowNull: false },
    quarter: { type: DataTypes.STRING, allowNull: false },
    rating: { type: DataTypes.STRING }
}, { underscored: true, tableName: 'violation_groups' });

// 3. Зөрчил ба Арга хэмжээ
const Violation = sequelize.define("Violation", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    severity: { type: DataTypes.STRING },
    department: { type: DataTypes.STRING },
    action_plan: { type: DataTypes.TEXT },
    due_date: { type: DataTypes.DATEONLY },
    status: { type: DataTypes.STRING, defaultValue: "Шинэ" },
    assignee_name: { type: DataTypes.STRING },
    assignee_email: { type: DataTypes.STRING },
    manager_name: { type: DataTypes.STRING },
    execution_response: { type: DataTypes.TEXT },
    evidence_file: { type: DataTypes.STRING } // Хуучин талбар хэвээрээ үлдэнэ (Хэрэв нэг линкээр хадгалах бол)
}, { underscored: true, tableName: 'violations' });

// 🆕 4. ШИНЭ ЗУРГИЙН ХҮСНЭГТ (Олон зураг хадгалах зориулалттай)
const ViolationImage = sequelize.define("ViolationImage", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    image_data: { 
        type: DataTypes.TEXT, 
        allowNull: false,
        comment: "Cloudinary-аас ирэх бүтэн JSON объект стрингээр хадгалагдана"
    }
}, { underscored: true, tableName: 'violation_images' });

// 5. ✅ Risk — тусдаа файлаас импортлох
const Risk = require("./risk.models");

// --- Хамаарал (Associations) ---

// Групп болон Зөрчлийн холбоос
ViolationGroup.hasMany(Violation, { as: "violations", foreignKey: "group_id", onDelete: 'CASCADE' });
Violation.belongsTo(ViolationGroup, { as: "group", foreignKey: "group_id" });

// 🔥 ШИНЭ: Зөрчил болон Зургийн холбоос (One-to-Many буюу 1 зөрчил олон зурагтай байж болно)
Violation.hasMany(ViolationImage, { as: "images", foreignKey: "violation_id", onDelete: 'CASCADE' });
ViolationImage.belongsTo(Violation, { as: "violation", foreignKey: "violation_id" });


// ✅ Нэг л module.exports (Шинэ модел болох ViolationImage-ийг нэмж экспортоллоо)
module.exports = { User, ViolationGroup, Violation, ViolationImage, Risk };