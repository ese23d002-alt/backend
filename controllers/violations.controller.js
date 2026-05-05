const { ViolationGroup, Violation } = require("../models/user.model");
const xlsx = require('xlsx');

// 1. EXCEL-ЭЭС ИМПОРТЛОХ
exports.importFromExcel = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Excel файл оруулна уу." });
        }

        // Frontend-ийн формын дээд хэсгээс ирэх өгөгдөл
        const { group_number, year, quarter, rating } = req.body;

        // Excel файлыг унших
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        // Header буюу Групп үүсгэх
        const group = await ViolationGroup.create({
            group_number: group_number || `ЗД-${new Date().getFullYear()}-${Date.now()}`,
            year: year || new Date().getFullYear(),
            quarter: quarter || "I улирал",
            rating: rating || "Бага"
        });

        // Excel-ийн мөр бүрийг баазын талбарт тааруулах
        const violations = data.map(row => ({
            title: row['Зөрчлийн нэр'] || row['Title'] || 'Нэргүй зөрчил',
            description: row['Тайлбар'] || row['Description'] || '',
            severity: row['Эрсдэл'] || row['Severity'] || rating,
            department: row['Хэлтэс'] || row['Department'] || '',
            action_plan: row['Арга хэмжээ'] || row['Action'] || '',
            assignee_name: row['Хариуцагч'] || row['Assignee'] || '',
            due_date: row['Дуусах огноо'] || row['Due Date'] || null, // Зураг дээрх "Дуусах огноо"
            group_id: group.id
        }));

        await Violation.bulkCreate(violations);

        res.status(201).json({ 
            success: true, 
            message: `${violations.length} зөрчлийг амжилттай импортлолоо.`,
            groupId: group.id
        });
    } catch (error) {
        console.error("Excel Import Error:", error);
        res.status(500).json({ message: "Excel уншихад алдаа гарлаа.", error: error.message });
    }
};

// 2. ГАРААР БҮРТГЭХ (Frontend-ээс JSON-оор ирэх үед)
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
        res.status(500).json({ message: "Бүртгэх явцад алдаа гарлаа.", error: error.message });
    }
};

// 3. БҮХ ЗӨРЧЛИЙГ ЖАГСААЛТААР АВАХ
exports.getAllViolations = async (req, res) => {
    try {
        const data = await ViolationGroup.findAll({
            include: [{ 
                model: Violation, 
                as: 'violations' // Модел дээр тохируулсан 'as' нэр
            }],
            order: [['createdAt', 'DESC']]
        });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Жагсаалт авахад алдаа гарлаа.", error: error.message });
    }
};

// 4. НЭГ ЗӨРЧЛИЙГ ID-ААР ХАРАХ
exports.getViolationById = async (req, res) => {
    try {
        const data = await ViolationGroup.findByPk(req.params.id, {
            include: [{ model: Violation, as: 'violations' }]
        });
        if (!data) return res.status(404).json({ message: "Зөрчил олдсонгүй." });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Мэдээлэл авахад алдаа гарлаа.", error: error.message });
    }
};

// 5. ЗӨРЧИЛ ЗАСАХ / ШИНЭЧЛЭХ
exports.updateViolation = async (req, res) => {
    try {
        const { id } = req.params;
        // Зөвхөн нэг мөрийг (Violation) засах бол:
        await Violation.update(req.body, { where: { id } });
        res.json({ success: true, message: "Амжилттай шинэчлэгдлээ." });
    } catch (error) {
        res.status(500).json({ message: "Засахад алдаа гарлаа.", error: error.message });
    }
};

// 6. ЗӨРЧИЛ УСТГАХ
exports.deleteViolation = async (req, res) => {
    try {
        // Группээр нь устгавал хамааралтай бүх зөрчлүүд устана (Cascade)
        await ViolationGroup.destroy({ where: { id: req.params.id } });
        res.json({ success: true, message: "Мэдээлэл бүрэн устгагдлаа." });
    } catch (error) {
        res.status(500).json({ message: "Устгахад алдаа гарлаа.", error: error.message });
    }
};