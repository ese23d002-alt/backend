const { RISK_LEVEL_SCORES } = require("../constants/risk.constants.js");

class BaseRisk {
    constructor(data) {
        this.name     = data.name;
        this.score    = data.score;
        this.assignee = data.assignee;
    }

    handleRiskPolicy() {
        console.log(
            ` [СТАНДАРТ БҮРТГЭЛ] Эрсдэл: "${this.name}" ` +
            `(Оноо: ${this.score}). Хариуцагч ${this.assignee} руу ердийн сануулга илгээв.`
        );
    }
}

class HighRisk extends BaseRisk {
    handleRiskPolicy() {
        console.log(
            ` [ӨНДӨР ЭРСДЭЛ] "${this.name}" оноо өндөр гарлаа ` +
            `(Оноо: ${this.score}). Долоо хоног бүрийн хурлын хэлэлцэх асуудалд автоматаар нэмэв.`
        );
    }
}

class CriticalRisk extends BaseRisk {
    handleRiskPolicy() {
        console.log(
            ` [НОЦТОЙ АЮУЛ - CRITICAL] Эрсдэлийн оноо  ` +
            `(Оноо: ${this.score}). Аудитын хороо болон Удирдах захирал руу УЛААН АНХААРУУЛГА шууд шидлээ!`
        );
    }
}

class RiskFactory {
    static create(riskData) {
        const score = riskData.score;

        // Magic number биш — constants-аас уншина
        if (score >= RISK_LEVEL_SCORES.critical.min) return new CriticalRisk(riskData);
        if (score >= RISK_LEVEL_SCORES.high.min)     return new HighRisk(riskData);
        return new BaseRisk(riskData);
    }
}

module.exports = RiskFactory;