const { query, getClient } = require('../config/database');

const Group = {
  // Find group by ID
  async findById(id) {
    const result = await query(
      `SELECT * FROM groups WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  // Find group by invite code
  async findByInviteCode(code) {
    const result = await query(
      `SELECT * FROM groups WHERE invite_code = $1`,
      [code]
    );
    return result.rows[0] || null;
  },

  // Search public groups
  async search({ search, visibility = 'public', limit = 50, offset = 0 }) {
    let params = [limit, offset];
    let conditions = ['visibility = $3'];
    params.push(visibility);

    if (search) {
      conditions.push(`(name ILIKE $4 OR description ILIKE $4)`);
      params.push(`%${search}%`);
    }

    const result = await query(
      `SELECT g.*, COUNT(gm.id) as member_count
       FROM groups g
       LEFT JOIN group_members gm ON g.id = gm.group_id
       WHERE ${conditions.join(' AND ')}
       GROUP BY g.id
       ORDER BY g.created_at DESC
       LIMIT $1 OFFSET $2`,
      params
    );
    return result.rows;
  },

  // Get groups for a user
  async findByUser(userId) {
    const result = await query(
      `SELECT g.*, gm.role, COUNT(all_members.id) as member_count
       FROM groups g
       JOIN group_members gm ON g.id = gm.group_id AND gm.user_id = $1
       LEFT JOIN group_members all_members ON g.id = all_members.group_id
       GROUP BY g.id, gm.role
       ORDER BY gm.joined_at DESC`,
      [userId]
    );
    return result.rows;
  },

  // Create new group
  async create({ name, description, visibility = 'public', joinPolicy = 'open', passwordHash = null, inviteCode = null, layoutConfig = [], pinnedGames = [], trackedGames = [], createdBy }) {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      // Create the group
      const groupResult = await client.query(
        `INSERT INTO groups (name, description, visibility, join_policy, password_hash, invite_code, layout_config, pinned_games, tracked_games, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [name, description, visibility, joinPolicy, passwordHash, inviteCode, JSON.stringify(layoutConfig), JSON.stringify(pinnedGames), JSON.stringify(trackedGames), createdBy]
      );
      const group = groupResult.rows[0];

      // Add creator as admin
      await client.query(
        `INSERT INTO group_members (group_id, user_id, role)
         VALUES ($1, $2, 'admin')`,
        [group.id, createdBy]
      );

      await client.query('COMMIT');
      return group;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Update group
  async update(id, updates) {
    const allowedFields = ['name', 'description', 'visibility', 'join_policy', 'password_hash', 'invite_code', 'layout_config', 'pinned_games', 'tracked_games'];
    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    const fieldMap = {
      joinPolicy: 'join_policy',
      passwordHash: 'password_hash',
      inviteCode: 'invite_code',
      layoutConfig: 'layout_config',
      pinnedGames: 'pinned_games',
      trackedGames: 'tracked_games',
    };

    for (const [key, value] of Object.entries(updates)) {
      const dbField = fieldMap[key] || key;
      if (allowedFields.includes(dbField)) {
        setClauses.push(`${dbField} = $${paramIndex++}`);
        // JSON fields need to be stringified
        if (['layout_config', 'pinned_games', 'tracked_games'].includes(dbField)) {
          values.push(JSON.stringify(value));
        } else {
          values.push(value);
        }
      }
    }

    if (setClauses.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const result = await query(
      `UPDATE groups SET ${setClauses.join(', ')} WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );
    return result.rows[0] || null;
  },

  // Delete group
  async delete(id) {
    const result = await query('DELETE FROM groups WHERE id = $1 RETURNING id', [id]);
    return result.rowCount > 0;
  },

  // Get members of a group
  async getMembers(groupId) {
    const result = await query(
      `SELECT gm.*, u.username, u.display_name, u.avatar_type, u.avatar_value, u.avatar_bg
       FROM group_members gm
       JOIN users u ON gm.user_id = u.id
       WHERE gm.group_id = $1
       ORDER BY
         CASE gm.role WHEN 'admin' THEN 1 WHEN 'moderator' THEN 2 ELSE 3 END,
         gm.joined_at ASC`,
      [groupId]
    );
    return result.rows;
  },

  // Get member IDs only
  async getMemberIds(groupId) {
    const result = await query(
      `SELECT user_id FROM group_members WHERE group_id = $1`,
      [groupId]
    );
    return result.rows.map(r => r.user_id);
  },

  // Check if user is a member
  async getMembership(groupId, userId) {
    const result = await query(
      `SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2`,
      [groupId, userId]
    );
    return result.rows[0] || null;
  },

  // Add member to group
  async addMember(groupId, userId, role = 'member') {
    const result = await query(
      `INSERT INTO group_members (group_id, user_id, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (group_id, user_id) DO NOTHING
       RETURNING *`,
      [groupId, userId, role]
    );
    return result.rows[0] || null;
  },

  // Update member role
  async updateMemberRole(groupId, userId, role) {
    const result = await query(
      `UPDATE group_members SET role = $3
       WHERE group_id = $1 AND user_id = $2
       RETURNING *`,
      [groupId, userId, role]
    );
    return result.rows[0] || null;
  },

  // Remove member from group
  async removeMember(groupId, userId) {
    const result = await query(
      `DELETE FROM group_members WHERE group_id = $1 AND user_id = $2 RETURNING *`,
      [groupId, userId]
    );
    return result.rowCount > 0;
  },

  // Get pending invites for a group
  async getInvites(groupId) {
    const result = await query(
      `SELECT gi.*, u.username, u.display_name, u.avatar_type, u.avatar_value, u.avatar_bg
       FROM group_invites gi
       JOIN users u ON gi.invited_user_id = u.id
       WHERE gi.group_id = $1 AND gi.status = 'pending'
       ORDER BY gi.created_at DESC`,
      [groupId]
    );
    return result.rows;
  },

  // Create invite
  async createInvite(groupId, invitedUserId, invitedBy) {
    const result = await query(
      `INSERT INTO group_invites (group_id, invited_user_id, invited_by)
       VALUES ($1, $2, $3)
       ON CONFLICT (group_id, invited_user_id)
       DO UPDATE SET status = 'pending', invited_by = $3, created_at = NOW()
       RETURNING *`,
      [groupId, invitedUserId, invitedBy]
    );
    return result.rows[0];
  },

  // Get user's pending invites
  async getUserInvites(userId) {
    const result = await query(
      `SELECT gi.*, g.name as group_name, g.description as group_description,
              inviter.username as inviter_username, inviter.display_name as inviter_display_name
       FROM group_invites gi
       JOIN groups g ON gi.group_id = g.id
       LEFT JOIN users inviter ON gi.invited_by = inviter.id
       WHERE gi.invited_user_id = $1 AND gi.status = 'pending'
       ORDER BY gi.created_at DESC`,
      [userId]
    );
    return result.rows;
  },

  // Accept or decline invite
  async respondToInvite(groupId, userId, accept) {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      // Update invite status
      await client.query(
        `UPDATE group_invites SET status = $3
         WHERE group_id = $1 AND invited_user_id = $2`,
        [groupId, userId, accept ? 'accepted' : 'declined']
      );

      if (accept) {
        // Add as member
        await client.query(
          `INSERT INTO group_members (group_id, user_id, role)
           VALUES ($1, $2, 'member')
           ON CONFLICT (group_id, user_id) DO NOTHING`,
          [groupId, userId]
        );
      }

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Generate unique invite code
  async generateInviteCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code;
    let isUnique = false;

    while (!isUnique) {
      code = '';
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      const existing = await this.findByInviteCode(code);
      isUnique = !existing;
    }

    return code;
  },

  // Format group for API response
  toJSON(group, userRole = null) {
    if (!group) return null;
    return {
      id: group.id,
      name: group.name,
      description: group.description,
      visibility: group.visibility,
      joinPolicy: group.join_policy,
      hasPassword: !!group.password_hash,
      inviteCode: group.invite_code,
      layoutConfig: group.layout_config,
      pinnedGames: group.pinned_games,
      trackedGames: group.tracked_games,
      createdBy: group.created_by,
      createdAt: group.created_at,
      updatedAt: group.updated_at,
      memberCount: group.member_count ? parseInt(group.member_count) : undefined,
      userRole: userRole || group.role,
    };
  },
};

module.exports = Group;
