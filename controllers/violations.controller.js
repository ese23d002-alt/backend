const db = require('../db/database');

exports.getAll = async (req, res) => {
  const [rows] = await db.query('SELECT * FROM violations ORDER BY created_at DESC');
  res.json(rows);
};

exports.create = async (req, res) => {
  const { name, type, severity, date, status } = req.body;
  await db.query(
    'INSERT INTO violations (name,type,severity,date,status) VALUES (?,?,?,?,?)',
    [name, type, severity, date, status]
  );
  res.json({ message: 'Нэмэгдлээ' });
};

exports.update = async (req, res) => {
  const { name, type, severity, date, status } = req.body;
  await db.query(
    'UPDATE violations SET name=?,type=?,severity=?,date=?,status=? WHERE id=?',
    [name, type, severity, date, status, req.params.id]
  );
  res.json({ message: 'Засагдлаа' });
};

exports.remove = async (req, res) => {
  await db.query('DELETE FROM violations WHERE id=?', [req.params.id]);
  res.json({ message: 'Устгагдлаа' });
};