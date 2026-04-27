const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // 1. Хэрэглэгч нь 'admin' мөн эсэхийг шалгах
    if (username !== 'admin') {
      return res.status(401).json({ message: 'Хэрэглэгч олдсонгүй' });
    }

    // 2. "1234" гэдэг үгийг яг одоо Hash болгож хувиргах (Туршилтын зорилгоор)
    // Жинхэнэ систем дээр энэ hash баазад хадгалагдсан байдаг
    const mockPasswordHash = await bcrypt.hash('1234', 10);

    // 3. Оруулсан password-ыг сая үүсгэсэн hash-тай тулгах
    const isMatch = await bcrypt.compare(password, mockPasswordHash);
    
    console.log("Оруулсан нууц үг:", password);
    console.log("Таарсан уу?:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: 'Нууц үг буруу' });
    }

    // 4. Token үүсгэх
    const token = jwt.sign(
      { id: 1, username: 'admin', role: 'admin' },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '8h' }
    );

    res.json({ 
      message: "Амжилттай нэвтэрлээ",
      token: token, 
      role: 'admin', 
      username: 'admin' 
    });

  } catch (error) {
    console.error("Алдаа:", error);
    res.status(500).json({ message: "Серверийн алдаа", error: error.message });
  }
};