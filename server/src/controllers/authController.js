const { findRecord } = require('../utils/fileHelper');
const { createToken, removeToken } = require('../middleware/auth');

const login = (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }
  const user = findRecord('users.json', (u) => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }
  const token = createToken(user);
  res.json({
    token,
    user: { id: user.id, username: user.username, name: user.name, role: user.role },
  });
};

const me = (req, res) => {
  res.json({ user: req.user });
};

const logout = (req, res) => {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    removeToken(authHeader.slice(7));
  }
  res.json({ message: 'Logged out successfully.' });
};

module.exports = { login, me, logout };
