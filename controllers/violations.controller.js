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
            title:         row['Зөрчлийн нэр'] || row['Title'] || 'Нэргүй зөрчил',
            description:   row['Тайлбар']      || row['Description'] || '',
            severity:      row['Эрсдэл']       || row['Severity'] || rating || 'low',
            status:        row['Төлөв']         || row['Status'] || 'new',
            department:    row['Хэлтэс']        || row['Department'] || '',
            action_plan:   row['Арга хэмжээ']   || row['Action'] || '',
            assignee_name: row['Хариуцагч']     || row['Assignee'] || '',
            due_date:      row['Дуусах огноо']  || row['Due Date'] || null,
            group_id:      group.id,
            image_urls:     null
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
        const page   = parseInt(req.query.page)  || 1;
        const limit  = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { status, severity, search } = req.query;
        let violationWhere = {};

        if (status)   violationWhere.status   = status;
        if (severity) violationWhere.severity = severity;
        if (search)   violationWhere.title    = { [Op.like]: `%${search}%` };

        const hasFilter = Object.keys(violationWhere).length > 0;

        const { count, rows } = await ViolationGroup.findAndCountAll({
            include: [{
                model:    Violation,
                as:       'violations',
                where:    hasFilter ? violationWhere : undefined,
                required: false
            }],
            limit,
            offset,
            order:    [['createdAt', 'DESC']],
            distinct: true
        });

        const formattedRows = rows.map(g => {
            const groupObj = g.toJSON();
            // Group-ийн files-ийг JSON объект болгоно
            try {
                if (groupObj.files) groupObj.files = JSON.parse(groupObj.files);
            } catch (e) {}
            // Violation-ийн image_urls-ийг JSON объект болгоно
            if (groupObj.violations) {
                groupObj.violations = groupObj.violations.map(v => {
                    try {
                        if (v.image_urls) v.image_urls = JSON.parse(v.image_urls);
                    } catch (e) {}
                    return v;
                });
            }
            return groupObj;
        });

        res.json({
            success:     true,
            totalItems:  count,
            totalPages:  Math.ceil(count / limit),
            currentPage: page,
            data:        formattedRows
        });
    } catch (error) {
        console.error("GetAll Error:", error);
        res.status(500).json({ message: "Жагсаалт авахад алдаа гарлаа.", error: error.message });
    }
};

// 4. EXCEL ЭКСПОРТ
exports.exportExcel = async (req, res) => {
    try {
        const { quarter, year, department } = req.query;

        let groupWhere     = {};
        let violationWhere = {};

        if (quarter)    groupWhere.quarter    = quarter;
        if (year)       groupWhere.year       = parseInt(year);
        if (department) violationWhere.department = { [Op.like]: `%${department}%` };

        const groups = await ViolationGroup.findAll({
            where: groupWhere,
            include: [{
                model:    Violation,
                as:       'violations',
                where:    Object.keys(violationWhere).length ? violationWhere : undefined,
                required: false
            }],
            order: [['createdAt', 'DESC']]
        });

        const allViolations = groups.flatMap(g =>
            (g.violations || []).map(v => {
                let fileLink = "";
                try {
                    if (v.image_urls) {
                        const parsed = JSON.parse(v.image_urls);
                        fileLink = parsed.secure_url || parsed.url || v.image_urls;
                    }
                } catch (e) {
                    fileLink = v.image_urls || "";
                }

                return {
                    'Бүлгийн дугаар': g.group_number,
                    'Жил':            g.year,
                    'Улирал':         g.quarter,
                    'Зөрчлийн нэр':   v.title,
                    'Тайлбар':        v.description    || '',
                    'Хэлтэс':         v.department     || '',
                    'Түвшин':         v.severity,
                    'Төлөв':          v.status,
                    'Хариуцагч':      v.assignee_name  || '',
                    'Арга хэмжээ':    v.action_plan    || '',
                    'Дуусах огноо':   v.due_date ? v.due_date.toString().split('T')[0] : '',
                    'Зургийн линк':   fileLink
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

// 5. PDF ЭКСПОРТ
exports.exportPdf = async (req, res) => {
    try {
        const { quarter, year, department } = req.query;

        let groupWhere     = {};
        let violationWhere = {};

        if (quarter)    groupWhere.quarter        = quarter;
        if (year)       groupWhere.year           = parseInt(year);
        if (department) violationWhere.department = { [Op.like]: `%${department}%` };

        const groups = await ViolationGroup.findAll({
            where: groupWhere,
            include: [{
                model:    Violation,
                as:       'violations',
                where:    Object.keys(violationWhere).length ? violationWhere : undefined,
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
                            <th>#</th><th>Бүлэг</th><th>Зөрчлийн нэр</th>
                            <th>Хэлтэс</th><th>Түвшин</th><th>Төлөв</th>
                            <th>Хариуцагч</th><th>Дуусах огноо</th>
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

// 6. ШИНЭ ЗӨРЧИЛ БҮРТГЭХ — зурагтай хамт (multipart/form-data)
// Frontend: FormData-д violations JSON string болгон, file-г binary болгон илгээнэ
exports.createViolation = async (req, res) => {
    try {
        const { group_number, year, quarter, rating, violations } = req.body;

        // Файлуудыг group-т хадгална
        let filesData = null;
        if (req.files && req.files.length > 0) {
            filesData = JSON.stringify(req.files.map(f => ({
                public_id:     f.filename,
                secure_url:    f.path,
                url:           f.path,
                original_name: f.originalname,
                resource_type: f.mimetype.startsWith('video/') ? 'video'
                             : f.mimetype === 'application/pdf'  ? 'raw'
                             : 'image',
                format: f.originalname.split('.').pop()
            })));
        }

        const group = await ViolationGroup.create({ group_number, year, quarter, rating, files: filesData });

        let savedViolations = [];

        if (violations) {
            let cloudinaryResult = null; // violation-д файл хадгалахгүй

            let parsedViolations;
            try {
                parsedViolations = typeof violations === 'string'
                    ? JSON.parse(violations)
                    : violations;
            } catch (e) {
                return res.status(400).json({
                    success: false,
                    message: "violations талбар зөв JSON биш байна. JSON.stringify() ашиглан илгээнэ үү.",
                    error: e.message
                });
            }

            const data = parsedViolations.map((v, index) => {
                let imageData = null;

                if (v.image_urls && typeof v.image_urls === 'object') {
                    imageData = JSON.stringify(v.image_urls);
                } else if (v.image_urls) {
                    imageData = v.image_urls;
                }

                return {
                    title:         v.title         || 'Нэргүй зөрчил',
                    description:   v.description   || '',
                    severity:      v.severity      || rating || 'low',
                    status:        v.status        || 'new',
                    department:    v.department    || '',
                    action_plan:   v.action_plan   || '',
                    assignee_name: v.assignee_name || '',
                    due_date:      v.due_date      || null,
                    group_id:      group.id,
                    image_urls:     imageData
                };
            });

            savedViolations = await Violation.bulkCreate(data);
        }

        const formattedViolations = savedViolations.map(v => {
            const item = v.toJSON();
            try {
                if (item.image_urls) item.image_urls = JSON.parse(item.image_urls);
            } catch (e) {}
            return item;
        });

        res.status(201).json({
            success: true,
            message: "Зөрчил болон зураг амжилттай хамт бүртгэгдлээ.",
            data:    { group, violations: formattedViolations }
        });
    } catch (error) {
        console.error("Create Violation Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// 7. НЭГ ЗӨРЧЛИЙГ ID-ААР ХАРАХ
exports.getViolationById = async (req, res) => {
    try {
        const data = await ViolationGroup.findByPk(req.params.id, {
            include: [{ model: Violation, as: 'violations' }]
        });
        if (!data) return res.status(404).json({ message: "Олдсонгүй." });

        const groupObj = data.toJSON();
        if (groupObj.violations) {
            groupObj.violations = groupObj.violations.map(v => {
                try {
                    if (v.image_urls) v.image_urls = JSON.parse(v.image_urls);
                } catch (e) {}
                return v;
            });
        }
        res.json(groupObj);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 8. ЗӨРЧИЛ ЗАСАХ
exports.updateViolation = async (req, res) => {
    try {
        let updateData = { ...req.body };
        if (updateData.image_urls && typeof updateData.image_urls === 'object') {
            updateData.image_urls = JSON.stringify(updateData.image_urls);
        }
        await Violation.update(updateData, { where: { id: req.params.id } });
        res.json({ success: true, message: "Зөрчил амжилттай засагдлаа." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 9. ЗӨРЧИЛ УСТГАХ (Cloudinary зургуудыг хамт устгана)
exports.deleteViolation = async (req, res) => {
    try {
        const { id } = req.params;

        const group = await ViolationGroup.findByPk(id, {
            include: [{ model: Violation, as: 'violations' }]
        });

        if (!group) {
            return res.status(404).json({ success: false, message: "Устгах өгөгдөл олдсонгүй." });
        }

        // Group-ийн файлуудыг Cloudinary-аас устгана
        if (group.files) {
            try {
                const files = JSON.parse(group.files);
                for (const file of files) {
                    if (file?.public_id) {
                        await cloudinary.uploader.destroy(file.public_id, {
                            resource_type: file.resource_type || 'image'
                        });
                    }
                }
            } catch (e) {}
        }

        await group.destroy();

        res.json({ success: true, message: "Зөрчил болон зураг амжилттай устгагдлаа." });
    } catch (error) {
        console.error("deleteViolation алдаа:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// 10. ТАЙЛАНГИЙН ӨГӨГДӨЛ АВАХ
exports.getReport = async (req, res) => {
    try {
        const { quarter, year, department } = req.query;

        let groupWhere     = {};
        let violationWhere = {};

        if (quarter)    groupWhere.quarter        = quarter;
        if (year)       groupWhere.year           = parseInt(year);
        if (department) violationWhere.department = { [Op.like]: `%${department}%` };

        const groups = await ViolationGroup.findAll({
            where: groupWhere,
            include: [{
                model:    Violation,
                as:       'violations',
                where:    Object.keys(violationWhere).length ? violationWhere : undefined,
                required: false
            }],
            order: [['createdAt', 'DESC']]
        });

        const allViolations = groups.flatMap(g => g.violations || []);

        const formattedViolations = allViolations.map(v => {
            const item = v.toJSON();
            try {
                if (item.image_urls) item.image_urls = JSON.parse(item.image_urls);
            } catch (e) {}
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