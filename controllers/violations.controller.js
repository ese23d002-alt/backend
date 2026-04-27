// 1. Өгөгдлийн сангийн оронд ашиглах түр зуурын "Зөрчлийн жагсаалт"
let mockViolations = [
  { 
    id: 1, 
    name: 'Хурд хэтрүүлэлт', 
    type: 'Замын хөдөлгөөн', 
    severity: 'Өндөр', 
    date: '2024-04-27', 
    status: 'Шийдвэрлэгдсэн' 
  },
  { 
    id: 2, 
    name: 'Буруу зогсолт', 
    type: 'Замын хөдөлгөөн', 
    severity: 'Дунд', 
    date: '2024-04-26', 
    status: 'Хянагдаж байгаа' 
  }
];

// Бүх зөрчлийг авах (GET)
exports.getAll = async (req, res) => {
  try {
    // Бааз руу хандахгүйгээр шууд жагсаалтаа буцаана
    res.json(mockViolations);
  } catch (error) {
    res.status(500).json({ message: "Алдаа гарлаа", error: error.message });
  }
};

// Шинэ зөрчил нэмэх (POST)
exports.create = async (req, res) => {
  try {
    const { name, type, severity, date, status } = req.body;
    const newViolation = {
      id: mockViolations.length + 1, // Түр зуурын ID үүсгэх
      name, type, severity, date, status
    };
    mockViolations.push(newViolation);
    res.json({ message: 'Амжилттай нэмэгдлээ', data: newViolation });
  } catch (error) {
    res.status(500).json({ message: "Нэмэхэд алдаа гарлаа" });
  }
};

// Зөрчил засах (PUT)
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const index = mockViolations.findIndex(v => v.id == id);
    
    if (index !== -1) {
      mockViolations[index] = { id: Number(id), ...req.body };
      res.json({ message: 'Амжилттай засагдлаа' });
    } else {
      res.status(404).json({ message: 'Зөрчил олдсонгүй' });
    }
  } catch (error) {
    res.status(500).json({ message: "Засахад алдаа гарлаа" });
  }
};

// Зөрчил устгах (DELETE)
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    mockViolations = mockViolations.filter(v => v.id != id);
    res.json({ message: 'Амжилттай устгагдлаа' });
  } catch (error) {
    res.status(500).json({ message: "Устгахад алдаа гарлаа" });
  }
};