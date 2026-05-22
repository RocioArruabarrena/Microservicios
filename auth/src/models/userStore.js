/**
 * In-memory user store for the Auth Service.
 * As required by the exercise, users are stored in memory (no DB needed).
 * In production, this would be backed by a database.
 */
const bcrypt = require('bcryptjs');

// Initial seed users (passwords are hashed at startup)
const users = new Map();

// Seed an admin user on startup
(async () => {
  const adminHash = await bcrypt.hash('admin123', 12);
  users.set('admin@example.com', {
    id: 'seed-admin-001',
    name: 'Admin',
    email: 'admin@example.com',
    password: adminHash,
    role: 'admin',
    createdAt: new Date().toISOString(),
  });
  console.log('✅ Auth Store inicializado con usuario admin (admin@example.com / admin123)');
})();

const findByEmail = (email) => users.get(email.toLowerCase()) || null;

const findById = (id) => {
  for (const user of users.values()) {
    if (user.id === id) return user;
  }
  return null;
};

const create = async ({ name, email, password, role = 'user' }) => {
  const normalized = email.toLowerCase();
  if (users.has(normalized)) return null; // already exists

  const hashed = await bcrypt.hash(password, 12);
  const user = {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    email: normalized,
    password: hashed,
    role,
    createdAt: new Date().toISOString(),
  };
  users.set(normalized, user);
  return user;
};

const toPublic = (user) => {
  if (!user) return null;
  const { password, ...pub } = user;
  return pub;
};

module.exports = { findByEmail, findById, create, toPublic };
