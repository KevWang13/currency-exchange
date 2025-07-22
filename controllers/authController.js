const db = require('../models/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 注册功能
exports.register = (req, res) => {
  const { username, email, password } = req.body;
  const hashed = bcrypt.hashSync(password, 10);
  db.query(
    'INSERT INTO users (username, email, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, 0, NOW(), NOW())',
    [username, email, hashed],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'User registered successfully' });
    }
  );
};

// 登录功能
exports.login = (req, res) => {
  const { username, password } = req.body;

  db.query(
    'SELECT * FROM users WHERE username = ?',
    [username],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (results.length === 0) return res.status(401).json({ error: 'User not found' });

      const user = results[0];
      const isValid = bcrypt.compareSync(password, user.password_hash);
      if (!isValid) return res.status(401).json({ error: 'Invalid password' });

      const token = jwt.sign(
        { id: user.user_id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
      );

      res.json({ token });
    }
  );
};
