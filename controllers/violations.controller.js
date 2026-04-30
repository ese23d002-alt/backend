const { ViolationGroup, Violation } = require("../models/user.model");
const xlsx = require('xlsx');

exports.importFromExcel = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Excel файл оруулна уу." });
        }

        // 1. Файлыг унших
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        // 2. Групп мэдээллийг авч үүсгэх (Жишээ нь Excel-ийн эхний мөрнөөс)
        // Энд та өөрийн Excel-ийн бүтцэд тааруулж өөрчилж болно
        const group = await ViolationGroup.create({
            group_number: req.body.group_number || "EXP-" + Date.now(),
            year: req.body.year || new Date().getFullYear(),
            quarter: req.body.quarter || 1
        });

        // 3. Зөрчлүүдийг бэлдэх
        const violations = data.map(row => ({
            title: row['Зөрчлийн нэр'] || row['Title'],
            description: row['Тайлбар'] || row['Description'],
            severity: row['Эрсдэл'] || row['Severity'],
            department: row['Хэлтэс'] || row['Department'],
            action_plan: row['Арга хэмжээ'] || row['Action'],
            assignee_name: row['Хариуцагч'] || row['Assignee'],
            group_id: group.id
        }));

        await Violation.bulkCreate(violations);

        res.status(201).json({ 
            success: true, 
            message: `${violations.length} зөрчлийг амжилттай импортлолоо.` 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Excel уншихад алдаа гарлаа." });
    }
};

// 1. Шинэ зөрчил бүртгэх (Header + Details)
exports.createViolation = async (req, res) => {
    try {
        const { group_number, year, quarter, rating, violations } = req.body;

        const group = await ViolationGroup.create({
            group_number, year, quarter, rating
        });

        if (violations && violations.length > 0) {
            const data = violations.map(v => ({ ...v, group_id: group.id }));
            await Violation.bulkCreate(data);
        }

        res.status(201).json({ success: true, message: "Амжилттай бүртгэгдлээ." });
    } catch (error) {
        res.status(500).json({ message: "Алдаа гарлаа.", error: error.message });
    }
};

// 2. Бүх зөрчлийг жагсаалтаар авах
exports.getAllViolations = async (req, res) => {
    try {
        const data = await ViolationGroup.findAll({
            include: [{ model: Violation, as: 'violations' }]
        });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Жагсаалт авахад алдаа гарлаа.", error: error.message });
    }
};

// 3. Нэг зөрчлийг ID-аар харах
exports.getViolationById = async (req, res) => {
    try {
        const data = await Violation.findByPk(req.params.id, {
            include: [{ model: ViolationGroup, as: 'group' }]
        });
        if (!data) return res.status(404).json({ message: "Зөрчил олдсонгүй." });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Алдаа гарлаа.", error: error.message });
    }
};

// 4. Зөрчил засах / Хэрэгжилтийн хариу бичих
exports.updateViolation = async (req, res) => {
    try {
        const { id } = req.params;
        await Violation.update(req.body, { where: { id } });
        res.json({ success: true, message: "Амжилттай шинэчлэгдлээ." });
    } catch (error) {
        res.status(500).json({ message: "Засахад алдаа гарлаа.", error: error.message });
    }
};

// 5. Зөрчил устгах
exports.deleteViolation = async (req, res) => {
    try {
        await Violation.destroy({ where: { id: req.params.id } });
        res.json({ success: true, message: "Устгагдлаа." });
    } catch (error) {
        res.status(500).json({ message: "Устгахад алдаа гарлаа.", error: error.message });
    }
};