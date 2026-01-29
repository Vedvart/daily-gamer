const { query } = require('../config/database');

const User = {
  // Find user by ID
  async findById(id) {
    const result = await query(
      `SELECT id, username, display_name, email, avatar_type, avatar_value, avatar_bg, created_at, updated_at
       FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  // Find user by username
  async findByUsername(username) {
    const result = await query(
      `SELECT id, username, display_name, email, avatar_type, avatar_value, avatar_bg, created_at, updated_at
       FROM users WHERE username = $1`,
      [username]
    );
    return result.rows[0] || null;
  },

  // Find user by email
  async findByEmail(email) {
    const result = await query(
      `SELECT id, username, display_name, email, avatar_type, avatar_value, avatar_bg, created_at, updated_at
       FROM users WHERE email = $1`,
      [email]
    );
    return result.rows[0] || null;
  },

  // Get all users (with optional limit)
  async findAll(limit = 100) {
    const result = await query(
      `SELECT id, username, display_name, avatar_type, avatar_value, avatar_bg, created_at
       FROM users ORDER BY created_at DESC LIMIT $1`,
      [limit]
    );
    return result.rows;
  },

  // Create new user
  async create({ username, displayName, email = null, passwordHash = null, avatarType = 'initials', avatarValue = null, avatarBg = null }) {
    const result = await query(
      `INSERT INTO users (username, display_name, email, password_hash, avatar_type, avatar_value, avatar_bg)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, username, display_name, email, avatar_type, avatar_value, avatar_bg, created_at`,
      [username, displayName, email, passwordHash, avatarType, avatarValue, avatarBg]
    );
    return result.rows[0];
  },

  // Update user
  async update(id, updates) {
    const allowedFields = ['display_name', 'email', 'avatar_type', 'avatar_value', 'avatar_bg'];
    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    // Convert camelCase to snake_case and filter allowed fields
    const fieldMap = {
      displayName: 'display_name',
      avatarType: 'avatar_type',
      avatarValue: 'avatar_value',
      avatarBg: 'avatar_bg',
    };

    for (const [key, value] of Object.entries(updates)) {
      const dbField = fieldMap[key] || key;
      if (allowedFields.includes(dbField)) {
        setClauses.push(`${dbField} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (setClauses.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const result = await query(
      `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${paramIndex}
       RETURNING id, username, display_name, email, avatar_type, avatar_value, avatar_bg, created_at, updated_at`,
      values
    );
    return result.rows[0] || null;
  },

  // Delete user
  async delete(id) {
    const result = await query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    return result.rowCount > 0;
  },

  // Check if username is available
  async isUsernameAvailable(username, excludeId = null) {
    const queryText = excludeId
      ? 'SELECT id FROM users WHERE username = $1 AND id != $2'
      : 'SELECT id FROM users WHERE username = $1';
    const params = excludeId ? [username, excludeId] : [username];
    const result = await query(queryText, params);
    return result.rows.length === 0;
  },

  // Format user for API response
  toJSON(user) {
    if (!user) return null;
    return {
      id: user.id,
      username: user.username,
      displayName: user.display_name,
      email: user.email,
      avatar: {
        type: user.avatar_type,
        value: user.avatar_value,
        bg: user.avatar_bg,
      },
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  },
};

module.exports = User;
