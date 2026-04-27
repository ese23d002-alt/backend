const db     = require('../db/database');
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE username=?', [username]);
    if (!rows.length) return res.status(401).json({ message: 'Хэрэглэгч олдсонгүй' });

    const ok = await bcrypt.compare(password, rows[0].password);
    if (!ok) return res.status(401).json({ message: 'Нууц үг буруу' });

    const token = jwt.sign(
      { id: rows[0].id, username: rows[0].username, role: rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ token, role: rows[0].role, username: rows[0].username });
  } catch (e) {
    res.status(500).json({ message: 'Серверийн алдаа', error: e.message });
  }
};