const { ViolationGroup, Violation } = require("../models/user.model");
const xlsx = require('xlsx');
const { Sequelize, Op } = require("sequelize");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:     process.env.CLOUDINARY_API_KEY,
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

// 3. БҮХ ЗӨРЧЛИЙГ ЖАГСААЛТААР АВАХ (Зургийн JSON-ийг Объект болгож буцаана)
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

        // Баазаас уншихдаа evidence_file стринг байвал буцаагаад JSON Объект болгоно
        const formattedRows = rows.map(g => {
            const groupObj = g.toJSON();
            if (groupObj.violations) {
                groupObj.violations = groupObj.violations.map(v => {
                    try {
                        v.evidence_file = JSON.parse(v.evidence_file);
                    } catch (e) {
                        // Текст хэвээрээ байвал хэвээр нь үлдээнэ
                    }
                    return v;
                });
            }
            return groupObj;
        });

        res.json({
            success: true,
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            data: formattedRows
        });
    } catch (error) {
        console.error("GetAll Error:", error);
        res.status(500).json({ message: "Жагсаалт авахад алдаа гарлаа." });
    }
};

// 4. EXCEL ЭКСПОРТ
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
            (g.violations || []).map(v => {
                let fileLink = "";
                try {
                    const parsed = JSON.parse(v.evidence_file);
                    fileLink = parsed.secure_url || parsed.url || v.evidence_file;
                } catch (e) {
                    fileLink = v.evidence_file || "";
                }

                return {
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
                    'Зургийн линк': fileLink
                };
            })
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

// 🚀 4. ШИНЭЧИЛСЭН ГАРААР БҮРТГЭХ (Бүтэн JSON объектыг баазад хадгална)
exports.createViolation = async (req, res) => {
    try {
        const { group_number, year, quarter, rating, violations } = req.body;

        const group = await ViolationGroup.create({ group_number, year, quarter, rating });

        let savedViolations = [];

        if (violations && violations.length > 0) {
            const parsedViolations = typeof violations === 'string' ? JSON.parse(violations) : violations;

            const data = parsedViolations.map(v => {
                let evidenceData = null;

                // 🔥 Хэрэв Frontend-ээс зургийн бүтэн объект ирвэл Стринг болгоно
                if (v.evidence_file && typeof v.evidence_file === 'object') {
                    evidenceData = JSON.stringify(v.evidence_file);
                } else if (v.evidence_file) {
                    evidenceData = v.evidence_file;
                }

                return {
                    title: v.title || 'Нэргүй зөрчил',
                    description: v.description || '',
                    severity: v.severity || rating || 'low',
                    status: v.status || 'new',
                    department: v.department || '',
                    action_plan: v.action_plan || '',
                    assignee_name: v.assignee_name || '',
                    due_date: v.due_date || null,
                    group_id: group.id,
                    evidence_file: evidenceData
                };
            });
            
            savedViolations = await Violation.bulkCreate(data);
        }
        
        // Буцаахдаа объект хэлбэрээр гоё болгож буцаана
        const formattedViolations = savedViolations.map(v => {
            const item = v.toJSON();
            try {
                item.evidence_file = JSON.parse(item.evidence_file);
            } catch (e) {}
            return item;
        });

        res.status(201).json({ 
            success: true, 
            message: "Зөрчил болон баримт амжилттай бүртгэгдлээ.",
            data: {
                group: group,
                violations: formattedViolations
            }
        });
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
        
        const groupObj = data.toJSON();
        if (groupObj.violations) {
            groupObj.violations = groupObj.violations.map(v => {
                try { v.evidence_file = JSON.parse(v.evidence_file); } catch (e) {}
                return v;
            });
        }
        res.json(groupObj);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 6. ЗӨРЧИЛ ЗАСАХ
exports.updateViolation = async (req, res) => {
    try {
        let updateData = { ...req.body };
        if (updateData.evidence_file && typeof updateData.evidence_file === 'object') {
            updateData.evidence_file = JSON.stringify(updateData.evidence_file);
        }
        await Violation.update(updateData, { where: { id: req.params.id } });
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

        const formattedViolations = allViolations.map(v => {
            const item = v.toJSON();
            try { item.evidence_file = JSON.parse(item.evidence_file); } catch (e) {}
            return item;
        });

        const stats = {
            total:    formattedViolations.length,
            new:      formattedViolations.filter(v => v.status === 'new').length,
            pending:  formattedViolations.filter(v => v.status === 'pending').length,
            resolved: formattedViolations.filter(v => v.status === 'resolved').length,
            critical: formattedViolations.filter(v => v.severity === 'critical').length,
            high:     formattedViolations.filter(v => v.severity === 'high').length,
            medium:   formattedViolations.filter(v => v.severity === 'medium').length,
            low:      formattedViolations.filter(v => v.severity === 'low').length,
        };

        const by_department = formattedViolations.reduce((acc, v) => {
            const dep = v.department || 'Тодорхойгүй';
            acc[dep] = (acc[dep] || 0) + 1;
            return acc;
        }, {});

        res.json({
            success: true,
            stats,
            by_department,
            groups,
            violations: formattedViolations
        });
    } catch (error) {
        console.error("Report Error:", error);
        res.status(500).json({ message: "Тайлан авахад алдаа гарлаа.", error: error.message });
    }
};

// 9. СУУРЬ ФАЙЛ ХУУЛАХ (Дангаар нь дуудахад ажиллана)
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "Файл илгээгдээгүй." });

    const { id } = req.params;
    const violation = await Violation.findByPk(id);
    if (!violation) return res.status(404).json({ success: false, message: "Зөрчил олдсонгүй." });

    const result_url = req.file.path;

    await Violation.update(
      { evidence_file: result_url },
      { where: { id } }
    );

    res.json({ success: true, file_url: result_url });
  } catch (error) {
    console.error("❌ uploadFile алдаа:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 🚀 10. УХААЛАГ ЗУРАГ / ФАЙЛ УСТГАХ (JSON дотроос public_id уншина)
exports.deleteFile = async (req, res) => {
    try {
        const { id } = req.params;
        const violation = await Violation.findByPk(id);

        // Хамгаалалт 1: Зөрчил баазад байхгүй бол 404 өгнө (Унахгүй)
        if (!violation) {
            return res.status(404).json({ success: false, message: "Ийм ID-тай зөрчил олдсонгүй." });
        }

        // Хамгаалалт 2: Хэрэв файл нь аль хэдийн хоосон бол шууд амжилттай буцна
        if (!violation.evidence_file) {
            return res.status(444).json({ success: false, message: "Файл аль хэдийн устсан эсвэл хоосон байна." });
        }

        let public_id = null;

        try {
            // Баазаас ирсэн өгөгдлийг JSON объект мөн эсэхийг шалгана
            const fileObj = JSON.parse(violation.evidence_file);
            if (fileObj && fileObj.public_id) {
                public_id = fileObj.public_id; // 🔥 Frontend-ийн явуулсан объектоос шууд авлаа!
            }
        } catch (e) {
            // Хэрэв хуучин дата буюу цэвэр стринг URL байвал split хийж авна
            public_id = violation.evidence_file.split("/").slice(-2).join("/").replace(/\.[^.]+$/, "");
        }

        // Cloudinary-аас устгах
        if (public_id) {
            console.log(" Cloudinary-аас устгаж буй public_id:", public_id);
            await cloudinary.uploader.destroy(public_id);
        }

        // Баазад талбарыг null болгож шинэчлэх
        await Violation.update(
            { evidence_file: null },
            { where: { id } }
        );

        res.json({ success: true, message: "Файл амжилттай устгагдлаа." });
    } catch (error) {
        console.error(" deleteFile алдаа:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};