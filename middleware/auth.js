const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token байхгүй' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    console.log('test',test)
    next();
  } catch {
    res.status(403).json({ message: 'Token буруу' });
  }
};