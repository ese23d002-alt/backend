const router = require("express").Router();
const risks = require("../controllers/risk.controller.js");

/**
 * @swagger
 * components:
 *   schemas:
 *     RiskInput:
 *       type: object
 *       required:
 *         - number
 *         - date
 *         - name
 *         - category
 *         - sub_cause
 *         - probability
 *         - impact
 *         - action_plan
 *         - assignee
 *         - review_date
 *       properties:
 *         id:
 *           type: integer
 *           description: Эрсдэлийн ID (Зөвхөн засах үед илгээнэ)
 *         number:
 *           type: string
 *           example: "R-2026-001"
 *         date:
 *           type: string
 *           format: date
 *           example: "2026-05-18"
 *         name:
 *           type: string
 *           example: "Серверийн тэжээл тасрах эрсдэл"
 *         category:
 *           type: string
 *           example: "Технологийн эрсдэл"
 *         sub_cause:
 *           type: string
 *           example: "Системийн доголдол"
 *         probability:
 *           type: integer
 *           example: 4
 *         impact:
 *           type: integer
 *           example: 5
 *         current_control:
 *           type: string
 *           example: "Түрүүчийн UPS төхөөрөмж"
 *         action_plan:
 *           type: string
 *           example: "Нэмэлт үүсгүүр худалдаж авах"
 *         assignee:
 *           type: string
 *           example: "Бат-Эрдэнэ"
 *         review_date:
 *           type: string
 *           format: date
 *           example: "2026-06-18"
 */

/**
 * @swagger
 * /api/risks:
 *   get:
 *     summary: Эрсдэлийн жагсаалт шүүлтүүртэй татах
 *     tags: [Risks]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Хуудасны дугаар (Default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Нэг хуудсанд харуулах тоо (Default 10)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Нэрээр хайх утга
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Ангиллаар шүүх
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *         description: Эрсдэлийн түвшнээр шүүх
 *     responses:
 *       200:
 *         description: Амжилттай татлаа
 *   post:
 *     summary: Шинэ эрсдэл бүртгэх
 *     tags: [Risks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RiskInput'
 *     responses:
 *       201:
 *         description: Амжилттай бүртгэгдлээ
 *
 * /api/risks/{id}:
 *   put:
 *     summary: Эрсдэл засах / шинэчлэх
 *     tags: [Risks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Засах эрсдэлийн ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RiskInput'
 *     responses:
 *       200:
 *         description: Амжилттай шинэчлэгдлээ
 *   delete:
 *     summary: Эрсдэл устгах
 *     tags: [Risks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Устгах эрсдэлийн ID
 *     responses:
 *       200:
 *         description: Амжилттай устгагдлаа
 */

router.get("/", risks.getRisks);
router.post("/", risks.saveRisk);
router.put("/:id", risks.saveRisk);
router.delete("/:id", risks.deleteRisk);

module.exports = router;