const { findRecord } = require('../utils/fileHelper');

// Simple in-memory token store: token -> user
const tokenStore = new Map();

/**
 * Generate a simple token and store the user
 */
function createToken(user) {
  const token = `token_${user.id}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  tokenStore.set(token, { id: user.id, username: user.username, name: user.name, role: user.role });
  return token;
}

/**
 * Retrieve user from token
 */
function getUserFromToken(token) {
  return tokenStore.get(token) || null;
}

/**
 * Invalidate token (logout)
 */
function removeToken(token) {
  tokenStore.delete(token);
}

/**
 * Middleware: require authentication
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. Please login.' });
  }
  const token = authHeader.slice(7);
  const user = getUserFromToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired session. Please login again.' });
  }
  req.user = user;
  next();
}

/**
 * Middleware: require admin role
 */
function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden. Admin access required.' });
    }
    next();
  });
}

module.exports = { createToken, getUserFromToken, removeToken, requireAuth, requireAdmin };
