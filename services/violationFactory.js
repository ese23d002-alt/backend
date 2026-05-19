// ЭЦЭГ КЛАСС
class BaseViolation {
    constructor(data) {
        this.title = data.title;
        this.severity = data.severity;
        this.metadata = data.metadata;
    }
    // Олон хэлбэржилт ашиглах үндсэн функц
    notify() {
        console.log("Ерөнхий мэдэгдэл илгээгдлэгдлээ.");
    }
}

// ХҮҮ КЛАСС 1: IT Зөрчил (Имэйл илгээнэ)
class ITViolation extends BaseViolation {
    notify() {
        const ip = this.metadata?.ipAddress || "Үл мэдэгдэх IP";
        console.log(`📧 [EMAIL ИЛГЭЭВ] IT хэлтэст мэдэгдэл очив! Системд ${ip} хаягнаас алдаа гарлаа.`);
        // Энд өөрийн nodemailer кодыг дуудаж болно
    }
}

// ХҮҮ КЛАСС 2: HR Зөрчил (Slack руу илгээнэ)
class HRViolation extends BaseViolation {
    notify() {
        console.log(`💬 [SLACK ИЛГЭЭВ] HR хэлтэст мэдэгдэл очив! Ажилтан дүрэм зөрчлөө.`);
    }
}

// Полиморфизмыг удирдаж, зөв классыг буцаах үйлдвэр (Factory)
class ViolationFactory {
    static create(violationData) {
        if (violationData.type === 'IT') return new ITViolation(violationData);
        if (violationData.type === 'HR') return new HRViolation(violationData);
        return new BaseViolation(violationData);
    }
}

module.exports = ViolationFactory;