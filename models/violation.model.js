module.exports = (sequelize, DataTypes) => {
    const Violation = sequelize.define('Violation', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        severity: {
            type: DataTypes.STRING,
            allowNull: true
        },
        status: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 'new'
        },
        department: {
            type: DataTypes.STRING,
            allowNull: true
        },
        action_plan: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        assignee_name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        due_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        image_urls: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        group_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        // 🚨 ШИНЭЭР НЭМЭГДСЭН ТАЛБАРУУД:
        parent_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'violations',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        },
        is_duplicate: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        }
    }, {
        tableName: 'violations',
        underscored: true,
        timestamps: true
    });

    return Violation;
};