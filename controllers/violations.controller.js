const { ViolationGroup, Violation } = require("../models/user.model");
const xlsx = require('xlsx');
const { Sequelize, Op } = require("sequelize");

// 1. DASHBOARD-ИЙН СТАТИСТИК
// Dashboard дээрх нийт тоо болон картуудад өгөгдөл өгнө
exports.getGeneralStats = async (req, res) => {
    try {
        const { start, end } = req.query;
        let whereClause = {};

        if (start && end) {
            whereClause.createdAt = { [Op.between]: [new Date(start), new Date(end)] };
        }

        const total = await Violation.count({ where: whereClause });

        const statsByStatus = await Violation.findAll({
            attributes: ['status', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
            where: whereClause,
            group: ['status'],
            raw: true
        });

        const statsBySeverity = await Violation.findAll({
            attributes: ['severity', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
            where: whereClause,
            group: ['severity'],
            raw: true
        });

        res.json({ 
            success: true, 
            total, 
            byStatus: statsByStatus, 
            bySeverity: statsBySeverity 
        });
    } catch (error) {
        console.error("Stats Error:", error);
        res.status(500).json({ success: false, message: "Статистик авахад алдаа гарлаа." });
    }
};

// 2. EXCEL-ЭЭС ИМПОРТЛОХ
exports.importFromExcel = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "Excel файл оруулна уу." });

        const { group_number, year, quarter, rating } = req.body;
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

        const group = await ViolationGroup.create({
            group_number: group_number || `ЗД-${new Date().getFullYear()}-${Date.now()}`,
            year: year || new Date().getFullYear(),
            quarter: quarter || "I улирал",
            rating: rating || "Бага"
        });

        const violations = data.map(row => ({
            title: row['Зөрчлийн нэр'] || row['Title'] || 'Нэргүй зөрчил',
            description: row['Тайлбар'] || row['Description'] || '',
            severity: row['Эрсдэл'] || row['Severity'] || rating || 'low',
            status: row['Төлөв'] || row['Status'] || 'new',
            department: row['Хэлтэс'] || row['Department'] || '',
            action_plan: row['Арга хэмжээ'] || row['Action'] || '',
            assignee_name: row['Хариуцагч'] || row['Assignee'] || '',
            due_date: row['Дуусах огноо'] || row['Due Date'] || null,
            group_id: group.id
        }));

        await Violation.bulkCreate(violations);
        res.status(201).json({ success: true, count: violations.length });
    } catch (error) {
        res.status(500).json({ message: "Excel уншихад алдаа гарлаа.", error: error.message });
    }
};

// 3. БҮХ ЗӨРЧЛИЙГ ЖАГСААЛТААР АВАХ (Хуудаслалт + Шүүлтүүр)
exports.getAllViolations = async (req, res) => {
    try {
        // Хуудаслалтын параметрүүд
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10; // Нэг хуудсанд 10 дата
        const offset = (page - 1) * limit;

        const { status, severity, search } = req.query;
        let violationWhere = {};

        // Шүүлтүүрүүд
        if (status) violationWhere.status = status;
        if (severity) violationWhere.severity = severity;
        if (search) violationWhere.title = { [Op.like]: `%${search}%` };

        // findAndCountAll ашиглан нийт тоо болон датаг хамт авна
        const { count, rows } = await ViolationGroup.findAndCountAll({
            include: [{ 
                model: Violation, 
                as: 'violations',
                where: violationWhere,
                required: false 
            }],
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']],
            distinct: true // Нийт тоог зөв гаргахад чухал
        });

        res.json({
            success: true,
            totalItems: count, // Нийт 13 зөрчил гэсэн тоо эндээс гарна
            totalPages: Math.ceil(count / limit), // Нийт хуудасны тоо (жишээ нь: 2)
            currentPage: page,
            data: rows
        });
    } catch (error) {
        console.error("GetAll Error:", error);
        res.status(500).json({ message: "Жагсаалт авахад алдаа гарлаа." });
    }
};

// 4. ГАРААР БҮРТГЭХ
exports.createViolation = async (req, res) => {
    try {
        const { group_number, year, quarter, rating, violations } = req.body;
        const group = await ViolationGroup.create({ group_number, year, quarter, rating });

        if (violations && violations.length > 0) {
            const data = violations.map(v => ({ ...v, group_id: group.id }));
            await Violation.bulkCreate(data);
        }
        res.status(201).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 5. НЭГ ЗӨРЧЛИЙГ ID-ААР ХАРАХ
exports.getViolationById = async (req, res) => {
    try {
        const data = await ViolationGroup.findByPk(req.params.id, {
            include: [{ model: Violation, as: 'violations' }]
        });
        if (!data) return res.status(404).json({ message: "Олдсонгүй." });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 6. ЗӨРЧИЛ ЗАСАХ
exports.updateViolation = async (req, res) => {
    try {
        await Violation.update(req.body, { where: { id: req.params.id } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 7. ЗӨРЧИЛ УСТГАХ
exports.deleteViolation = async (req, res) => {
    try {
        await ViolationGroup.destroy({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};