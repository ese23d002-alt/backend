// ЭЦЭГ КЛАСС: Бага болон Дунд эрсдэл
class BaseRisk {
    constructor(data) {
        this.name = data.name;
        this.score = data.score;
        this.assignee = data.assignee;
    }
    // Олон хэлбэржилт ажиллах функц
    handleRiskPolicy() {
        console.log(`ℹ️ [СТАНДАРТ БҮРТГЭЛ] Эрсдэл: "${this.name}" (Оноо: ${this.score}). Хариуцагч ${this.assignee} руу ердийн сануулга илгээв.`);
    }
}

// ХҮҮ КЛАСС 1: Өндөр эрсдэл (High Risk)
class HighRisk extends BaseRisk {
    handleRiskPolicy() {
        console.log(`⚠️ [ӨНДӨР ЭРСДЭЛ] "${this.name}" оноо өндөр гарлаа (Оноо: ${this.score}). Долоо хоног бүрийн хурлын хэлэлцэх асуудалд автоматаар нэмэв.`);
    }
}

// ХҮҮ КЛАСС 2: Ноцтой эрсдэл (Critical Risk)
class CriticalRisk extends BaseRisk {
    handleRiskPolicy() {
        console.log(`🚨 [НОЦТОЙ АЮУЛ - CRITICAL] Эрсдэлийн оноо туйлшрав! (Оноо: ${this.score}). Аудитын хороо болон Удирдах захирал руу УЛААН АНХААРУУЛГА шууд шидлээ!`);
    }
}

// ҮЙЛДВЭР (Factory)
class RiskFactory {
    static create(riskData) {
        const score = riskData.score;
        // Frontend-ийн RISK_LEVEL логиктой яг ижилхэн оноогоор нь класс үүсгэнэ
        if (score >= 20) return new CriticalRisk(riskData);
        if (score >= 12) return new HighRisk(riskData);
        return new BaseRisk(riskData);
    }
}

module.exports = RiskFactory;