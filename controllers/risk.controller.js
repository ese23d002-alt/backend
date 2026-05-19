// controllers/risk.controller.js
const { Risk } = require("../models/user.model");
const { Op } = require("sequelize");
const RiskFactory = require("../services/riskFactory");
 
// 1. ЭРСДЭЛ ХАДГАЛАХ БОЛОН ШИНЭЧЛЭХ (saveRisk)
exports.saveRisk = async (req, res) => {
    try {
        const id = req.params.id || req.body.id; // URI эсвэл Body-ийн алинаас ч ID-ийг барьж авна
        const { 
            number, date, name, category, sub_cause, 
            probability, impact, current_control, action_plan, assignee, review_date 
        } = req.body;
 
        // Бэкэнд дээр оноог заавал давхар бодож баталгаажуулна (Хамгаалалт)
        const score = Number(probability) * Number(impact);
 
        const payload = {
            number,
            date,
            name,
            category,
            sub_cause,
            probability: Number(probability),
            impact: Number(impact),
            score,
            current_control: current_control || null,
            action_plan,
            assignee,
            review_date
        };
 
        let risk;
        if (id) {
            // --- PUT / PATCH: Засах логик ---
            await Risk.update(payload, { where: { id: id } });
            risk = await Risk.findByPk(id);
            // Зассан үед Polymorphism ажиллуулах
            if (risk) {
                const riskHandler = RiskFactory.create(risk);
                if (riskHandler && typeof riskHandler.handleRiskPolicy === "function") {
                    riskHandler.handleRiskPolicy();
                }
            }
            return res.status(200).json({ success: true, message: "Амжилттай шинэчлэгдлээ.", data: risk });
        } else {
            // --- POST: Шинээр үүсгэх логик ---
            risk = await Risk.create(payload);
            // Шинээр үүссэн үед Polymorphism ажиллуулах
            const riskHandler = RiskFactory.create(risk);
            if (riskHandler && typeof riskHandler.handleRiskPolicy === "function") {
                riskHandler.handleRiskPolicy();
            }
 
            return res.status(201).json({ success: true, message: "Амжилттай бүртгэгдлээ.", data: risk });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
 
// 2. ЖАГСААЛТ ТАТАХ (getRisks - Шүүлтүүртэй)
exports.getRisks = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const { search, category, level } = req.query;
 
        let whereClause = {};
 
        if (search) whereClause.name = { [Op.like]: `%${search}%` };
        if (category) whereClause.category = category;
        // Эрсдэлийн түвшнээр шүүх (Онооны интервалаар баазаас шүүнэ)
        if (level) {
            if (level === "critical") whereClause.score = { [Op.gte]: 20 };
            else if (level === "high") whereClause.score = { [Op.between]: [12, 19] };
            else if (level === "medium") whereClause.score = { [Op.between]: [6, 11] };
            else if (level === "low") whereClause.score = { [Op.lt]: 6 };
        }
 
        const { count, rows } = await Risk.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });
 
        res.json({
            success: true,
            totalItems: count,
            totalPages: Math.ceil(count / limit) || 1,
            currentPage: page,
            data: rows
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
 
// 3. УСТГАХ (deleteRisk)
exports.deleteRisk = async (req, res) => {
    try {
        const { id } = req.params;
        await Risk.destroy({ where: { id } });
        res.json({ success: true, message: "Амжилттай устлаа." });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};