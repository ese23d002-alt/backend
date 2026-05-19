const { DataTypes } = require("sequelize");
const sequelize = require("../db/database");

const Risk = sequelize.define("Risk", {
    id:              { type: DataTypes.INTEGER,  autoIncrement: true, primaryKey: true },
    number:          { type: DataTypes.STRING,   allowNull: false },
    date:            { type: DataTypes.DATEONLY, allowNull: false },
    name:            { type: DataTypes.STRING,   allowNull: false },
    category:        { type: DataTypes.STRING,   allowNull: false },
    sub_cause:       { type: DataTypes.STRING,   allowNull: false },
    probability:     { type: DataTypes.INTEGER,  allowNull: false },
    impact:          { type: DataTypes.INTEGER,  allowNull: false },
    score:           { type: DataTypes.INTEGER,  allowNull: false },
    current_control: { type: DataTypes.TEXT,     allowNull: true  },
    action_plan:     { type: DataTypes.TEXT,     allowNull: false },
    assignee:        { type: DataTypes.STRING,   allowNull: false },
    review_date:     { type: DataTypes.DATEONLY, allowNull: false }
}, { underscored: true, tableName: "risks" });

module.exports = Risk;