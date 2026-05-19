const { ViolationGroup, Violation } = require("../models/user.model");
const xlsx = require('xlsx');
const { Sequelize, Op } = require("sequelize");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 1. DASHBOARD-ИЙН СТАТИСТИК
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

// 3. БҮХ ЗӨРЧЛИЙГ ЖАГСААЛТААР АВАХ
exports.getAllViolations = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { status, severity, search } = req.query;
        let violationWhere = {};

        if (status) violationWhere.status = status;
        if (severity) violationWhere.severity = severity;
        if (search) violationWhere.title = { [Op.like]: `%${search}%` };

        const { count, rows } = await ViolationGroup.findAndCountAll({
            include: [{
                model: Violation,
                as: 'violations',
                where: violationWhere,
                required: false
            }],
            limit,
            offset,
            order: [['createdAt', 'DESC']],
            distinct: true
        });

        res.json({
            success: true,
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            data: rows
        });
    } catch (error) {
        console.error("GetAll Error:", error);
        res.status(500).json({ message: "Жагсаалт авахад алдаа гарлаа." });
    }
};

// EXCEL ЭКСПОРТ
exports.exportExcel = async (req, res) => {
    try {
        const { quarter, year, department } = req.query;

        let groupWhere = {};
        if (quarter) groupWhere.quarter = quarter;
        if (year) groupWhere.year = parseInt(year);

        let violationWhere = {};
        if (department) violationWhere.department = { [Op.like]: `%${department}%` };

        const groups = await ViolationGroup.findAll({
            where: groupWhere,
            include: [{
                model: Violation,
                as: 'violations',
                where: Object.keys(violationWhere).length ? violationWhere : undefined,
                required: false
            }],
            order: [['createdAt', 'DESC']]
        });

        const allViolations = groups.flatMap(g =>
            (g.violations || []).map(v => ({
                'Бүлгийн дугаар': g.group_number,
                'Жил': g.year,
                'Улирал': g.quarter,
                'Зөрчлийн нэр': v.title,
                'Тайлбар': v.description || '',
                'Хэлтэс': v.department || '',
                'Түвшин': v.severity,
                'Төлөв': v.status,
                'Хариуцагч': v.assignee_name || '',
                'Арга хэмжээ': v.action_plan || '',
                'Дуусах огноо': v.due_date ? v.due_date.toString().split('T')[0] : '',
            }))
        );

        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(allViolations);
        xlsx.utils.book_append_sheet(wb, ws, 'Тайлан');

        const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', 'attachment; filename=report.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (error) {
        res.status(500).json({ message: 'Excel экспортлоход алдаа гарлаа.', error: error.message });
    }
};

// PDF ЭКСПОРТ
exports.exportPdf = async (req, res) => {
    try {
        const { quarter, year, department } = req.query;

        let groupWhere = {};
        if (quarter) groupWhere.quarter = quarter;
        if (year) groupWhere.year = parseInt(year);

        let violationWhere = {};
        if (department) violationWhere.department = { [Op.like]: `%${department}%` };

        const groups = await ViolationGroup.findAll({
            where: groupWhere,
            include: [{
                model: Violation,
                as: 'violations',
                where: Object.keys(violationWhere).length ? violationWhere : undefined,
                required: false
            }],
            order: [['createdAt', 'DESC']]
        });

        const allViolations = groups.flatMap(g => g.violations || []);

        const rows = allViolations.map((v, i) => {
            const group = groups.find(g => g.id === v.group_id);
            return `
                <tr>
                    <td>${i + 1}</td>
                    <td>${group?.group_number || ''}</td>
                    <td>${v.title}</td>
                    <td>${v.department || ''}</td>
                    <td>${v.severity}</td>
                    <td>${v.status}</td>
                    <td>${v.assignee_name || ''}</td>
                    <td>${v.due_date ? v.due_date.toString().split('T')[0] : ''}</td>
                </tr>
            `;
        }).join('');

        const html = `
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; font-size: 12px; }
                    h2 { text-align: center; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th { background: #3498db; color: white; padding: 8px; text-align: left; }
                    td { padding: 6px 8px; border-bottom: 1px solid #eee; }
                    tr:nth-child(even) { background: #f9f9f9; }
                </style>
            </head>
            <body>
                <h2>Зөрчлийн тайлан</h2>
                <p>Нийт: ${allViolations.length} зөрчил</p>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Бүлэг</th>
                            <th>Зөрчлийн нэр</th>
                            <th>Хэлтэс</th>
                            <th>Түвшин</th>
                            <th>Төлөв</th>
                            <th>Хариуцагч</th>
                            <th>Дуусах огноо</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </body>
            </html>
        `;

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(html);
    } catch (error) {
        res.status(500).json({ message: 'PDF экспортлоход алдаа гарлаа.', error: error.message });
    }
};

// 🚀 4. ГАРААР БҮРТГЭХ (ЗАСВАР ОРСОН ХЭСЭГ - ФАЙЛЫГ АВТОМАТАР ХАДГАЛНА)
exports.createViolation = async (req, res) => {
    try {
        const { group_number, year, quarter, rating } = req.body;
        let { violations } = req.body;

        // FormData-аар жагсаалт нь Стринг болж ирдэг тул объект руу хөрвүүлнэ
        if (typeof violations === 'string') {
            violations = JSON.parse(violations);
        }

        // 1. Эхлээд Зөрчлийн Бүлгийг үүсгэнэ
        const group = await ViolationGroup.create({ group_number, year, quarter, rating });

        // 2. Хэрэв дэд зөрчлүүд байвал бааз руу хуулна
        if (violations && violations.length > 0) {
            const data = violations.map((v, index) => {
                const item = { ...v, group_id: group.id };
                
                // 🔥 УХААЛАГ АВТОМАТ ЛОГИК: Хэрэв хэрэглэгч файл хавсаргасан бол
                // Хамгийн эхний (index === 0) зөрчил дээр Cloudinary URL-ийг автоматаар зоож өгнө
                if (req.file && index === 0) {
                    item.evidence_file = req.file.path;
                }
                return item;
            });
            
            await Violation.bulkCreate(data);
        }
        
        res.status(201).json({ success: true, message: "Зөрчил болон баримт амжилттай бүртгэгдлээ." });
    } catch (error) {
        console.error("Create Violation Error:", error);
        res.status(500).json({ success: false, error: error.message });
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
        const { id } = req.params;
        const deleted_count = await ViolationGroup.destroy({ where: { id } });

        if (deleted_count === 0) {
            return res.status(404).json({ success: false, message: "Устгах өгөгдөл олдсонгүй." });
        }

        res.json({ success: true, message: "Амжилттай устгагдлаа." });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 8. ТАЙЛАНГИЙН ӨГӨГДӨЛ АВАХ
exports.getReport = async (req, res) => {
    try {
        const { quarter, year, department } = req.query;

        let groupWhere = {};
        if (quarter) groupWhere.quarter = quarter;
        if (year) groupWhere.year = parseInt(year);

        let violationWhere = {};
        if (department) violationWhere.department = { [Op.like]: `%${department}%` };

        const groups = await ViolationGroup.findAll({
            where: groupWhere,
            include: [{
                model: Violation,
                as: 'violations',
                where: Object.keys(violationWhere).length ? violationWhere : undefined,
                required: false
            }],
            order: [['createdAt', 'DESC']]
        });

        const allViolations = groups.flatMap(g => g.violations || []);

        const stats = {
            total:    allViolations.length,
            new:      allViolations.filter(v => v.status === 'new').length,
            pending:  allViolations.filter(v => v.status === 'pending').length,
            resolved: allViolations.filter(v => v.status === 'resolved').length,
            critical: allViolations.filter(v => v.severity === 'critical').length,
            high:     allViolations.filter(v => v.severity === 'high').length,
            medium:   allViolations.filter(v => v.severity === 'medium').length,
            low:      allViolations.filter(v => v.severity === 'low').length,
        };

        const by_department = allViolations.reduce((acc, v) => {
            const dep = v.department || 'Тодорхойгүй';
            acc[dep] = (acc[dep] || 0) + 1;
            return acc;
        }, {});

        res.json({
            success: true,
            stats,
            by_department,
            groups,
            violations: allViolations
        });
    } catch (error) {
        console.error("Report Error:", error);
        res.status(500).json({ message: "Тайлан авахад алдаа гарлаа.", error: error.message });
    }
};

// 9. СУУРЬ ФАЙЛ ХУУЛАХ (Дангаар нь дуудахад ажиллана)
exports.uploadFile = async (req, res) => {
  try {
    console.log("📁 req.file:", req.file);
    if (!req.file) return res.status(400).json({ success: false, message: "Файл илгээгдээгүй." });

    const result_url = req.file.path;
    console.log("✅ Cloudinary URL:", result_url);

    await Violation.update(
      { evidence_file: result_url },
      { where: { id: req.params.id } }
    );

    res.json({ success: true, file_url: result_url });
  } catch (error) {
    console.error("❌ uploadFile алдаа:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 10. ЗУРАГ / ФАЙЛ УСТГАХ (Cloudinary)
exports.deleteFile = async (req, res) => {
    try {
        const { id } = req.params;
        const violation = await Violation.findByPk(id);

        if (!violation || !violation.evidence_file) {
            return res.status(404).json({ success: false, message: "Файл олдсонгүй." });
        }

        const public_id = violation.evidence_file
            .split("/").slice(-2).join("/")   
            .replace(/\.[^.]+$/, "");         

        await cloudinary.uploader.destroy(public_id);

        await Violation.update(
            { evidence_file: null },
            { where: { id } }
        );

        res.json({ success: true, message: "Файл амжилттай устгагдлаа." });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};