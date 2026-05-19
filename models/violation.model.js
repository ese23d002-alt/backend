// module.exports = (sequelize, Sequelize) => {
//     const Violation = sequelize.define("violation", {
//         title: {
//             type: Sequelize.STRING,
//             allowNull: false
//         },
//         severity: {
//             type: Sequelize.STRING, // HIGH, MEDIUM, LOW
//             allowNull: false
//         },
//         type: {
//             type: Sequelize.STRING, // 'IT', 'HR', 'FINANCE' гэдгийг ялгана
//             allowNull: false
//         },
//         metadata: {
//             type: Sequelize.JSON, // IP хаяг, системийн нэр зэргийг JSON-оор хадгална
//             allowNull: true
//         }
//     });

//     return Violation;
// };