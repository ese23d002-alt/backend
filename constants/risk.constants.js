const RISK_CATEGORIES = [
//   {
//     key: "financial", label: "Санхүүгийн",
//     sub_causes: [
//       { key: "internal_control_weak", label: "Дотоод хяналт сул" },
//       { key: "external_change",       label: "Гадаад орчны өөрчлөлт" },
//       { key: "other",                 label: "Бусад" }
//     ]
//   },
//   {
//     key: "operational", label: "Үйл ажиллагааны",
//     sub_causes: [
//       { key: "employee_error",        label: "Ажилтны алдаа" },
//       { key: "internal_control_weak", label: "Дотоод хяналт сул" },
//       { key: "other",                 label: "Бусад" }
//     ]
//   },
//   {
//     key: "legal", label: "Хууль, дүрмийн",
//     sub_causes: [
//       { key: "law_violation",  label: "Хууль зөрчил" },
//       { key: "external_change", label: "Гадаад орчны өөрчлөлт" },
//       { key: "other",           label: "Бусад" }
//     ]
//   },
//   {
//     key: "reputational", label: "Нэр хүндийн",
//     sub_causes: [
//       { key: "employee_error",  label: "Ажилтны алдаа" },
//       { key: "external_change", label: "Гадаад орчны өөрчлөлт" },
//       { key: "other",           label: "Бусад" }
//     ]
//   },
//   {
//     key: "technology", label: "Технологийн",
//     sub_causes: [
//       { key: "system_failure",        label: "Системийн доголдол" },
//       { key: "internal_control_weak", label: "Дотоод хяналт сул" },
//       { key: "other",                 label: "Бусад" }
//     ]
//   },
//   {
//     key: "other", label: "Бусад",
//     sub_causes: [
//       { key: "other", label: "Бусад" }
//     ]
//   }
];

const VALID_CATEGORIES    = RISK_CATEGORIES.map(c => c.label);
const VALID_SUB_CAUSES    = [...new Set(RISK_CATEGORIES.flatMap(c => c.sub_causes.map(s => s.label)))];
const get_valid_sub_causes = (category_label) => {
  const found = RISK_CATEGORIES.find(c => c.label === category_label);
  return found ? found.sub_causes.map(s => s.label) : [];
};

const RISK_LEVELS = ["low", "medium", "high", "critical"];

const RISK_LEVEL_SCORES = {
  critical: { min: 20, max: Infinity },
  high:     { min: 12, max: 19 },
  medium:   { min: 6,  max: 11 },
  low:      { min: 0,  max: 5  }
};

const RISK_SCORE_RANGE = { min: 1, max: 5 };

module.exports = {
  RISK_CATEGORIES,
  VALID_CATEGORIES,
  VALID_SUB_CAUSES,
  get_valid_sub_causes,
  RISK_LEVELS,
  RISK_LEVEL_SCORES,
  RISK_SCORE_RANGE
};