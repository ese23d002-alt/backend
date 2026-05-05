const { Violation } = require("../models/user.model");
const { Sequelize, Op } = require("sequelize");

exports.getGeneralStats = async (req, res) => {
    try {
        // 1. Фронтендээс ирүүлсэн хугацааг query-ээс авах
        // Хэрэв хугацаа ирээгүй бол default-оор энэ оны эхнээс өнөөдрийг хүртэл авна
        const { start, end } = req.query;

        const startDate = start ? new Date(start) : new Date(new Date().getFullYear(), 0, 1);
        const endDate = end ? new Date(end) : new Date();

        // 2. Статусаар бүлэглэх
        const statusStats = await Violation.findAll({
            attributes: [
                'status',
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
            ],
            where: {
                createdAt: {
                    [Op.between]: [startDate, endDate]
                }
            },
            group: ['status'],
            raw: true
        });

        // 3. Эрсдэлээр бүлэглэх
        const severityStats = await Violation.findAll({
            attributes: [
                'severity',
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
            ],
            where: {
                createdAt: {
                    [Op.between]: [startDate, endDate]
                }
            },
            group: ['severity'],
            raw: true
        });

        // 4. Нийт тоо
        const total = await Violation.count({
            where: {
                createdAt: { [Op.between]: [startDate, endDate] }
            }
        });

        res.json({
            success: true,
            filter: { startDate, endDate },
            total,
            byStatus: statusStats,
            bySeverity: severityStats
        });

    } catch (error) {
        console.error("Stats Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Статистик авахад алдаа гарлаа.",
            error: error.message 
        });
    }
};