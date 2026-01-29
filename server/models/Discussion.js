const { query, getClient } = require('../config/database');

const Discussion = {
  // Find thread by ID
  async findThreadById(id) {
    const result = await query(
      `SELECT dt.*, u.username as author_username, u.display_name as author_display_name,
              u.avatar_type as author_avatar_type, u.avatar_value as author_avatar_value, u.avatar_bg as author_avatar_bg,
              (SELECT COUNT(*) FROM comments c WHERE c.thread_id = dt.id AND NOT c.is_deleted) as comment_count
       FROM discussion_threads dt
       LEFT JOIN users u ON dt.created_by = u.id
       WHERE dt.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  // Get threads for a group
  async getThreads(groupId, { limit = 50, offset = 0, includeDaily = true } = {}) {
    let conditions = ['dt.group_id = $1'];
    if (!includeDaily) {
      conditions.push("dt.type = 'general'");
    }

    const result = await query(
      `SELECT dt.*, u.username as author_username, u.display_name as author_display_name,
              u.avatar_type as author_avatar_type, u.avatar_value as author_avatar_value, u.avatar_bg as author_avatar_bg,
              (SELECT COUNT(*) FROM comments c WHERE c.thread_id = dt.id AND NOT c.is_deleted) as comment_count
       FROM discussion_threads dt
       LEFT JOIN users u ON dt.created_by = u.id
       WHERE ${conditions.join(' AND ')}
       ORDER BY dt.is_pinned DESC, dt.last_activity_at DESC
       LIMIT $2 OFFSET $3`,
      [groupId, limit, offset]
    );
    return result.rows;
  },

  // Get or create daily thread
  async getOrCreateDailyThread(groupId, gameId, date, createdBy = null) {
    // Try to find existing
    const existing = await query(
      `SELECT dt.*, u.username as author_username, u.display_name as author_display_name,
              u.avatar_type as author_avatar_type, u.avatar_value as author_avatar_value, u.avatar_bg as author_avatar_bg,
              (SELECT COUNT(*) FROM comments c WHERE c.thread_id = dt.id AND NOT c.is_deleted) as comment_count
       FROM discussion_threads dt
       LEFT JOIN users u ON dt.created_by = u.id
       WHERE dt.group_id = $1 AND dt.game_id = $2 AND dt.thread_date = $3`,
      [groupId, gameId, date]
    );

    if (existing.rows.length > 0) {
      return existing.rows[0];
    }

    // Create new daily thread
    const title = `${gameId.charAt(0).toUpperCase() + gameId.slice(1)} - ${date}`;
    const result = await query(
      `INSERT INTO discussion_threads (group_id, title, type, game_id, thread_date, created_by)
       VALUES ($1, $2, 'daily', $3, $4, $5)
       RETURNING *`,
      [groupId, title, gameId, date, createdBy]
    );

    return result.rows[0];
  },

  // Create general thread
  async createThread(groupId, { title, createdBy }) {
    const result = await query(
      `INSERT INTO discussion_threads (group_id, title, type, created_by)
       VALUES ($1, $2, 'general', $3)
       RETURNING *`,
      [groupId, title, createdBy]
    );
    return result.rows[0];
  },

  // Update thread
  async updateThread(id, updates) {
    const allowedFields = ['title', 'is_pinned', 'is_locked'];
    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    const fieldMap = {
      isPinned: 'is_pinned',
      isLocked: 'is_locked',
    };

    for (const [key, value] of Object.entries(updates)) {
      const dbField = fieldMap[key] || key;
      if (allowedFields.includes(dbField)) {
        setClauses.push(`${dbField} = $${paramIndex++}`);
        values.push(value);
      }
    }

    if (setClauses.length === 0) {
      return this.findThreadById(id);
    }

    values.push(id);
    const result = await query(
      `UPDATE discussion_threads SET ${setClauses.join(', ')} WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );
    return result.rows[0] || null;
  },

  // Delete thread
  async deleteThread(id) {
    const result = await query('DELETE FROM discussion_threads WHERE id = $1 RETURNING id', [id]);
    return result.rowCount > 0;
  },

  // Get comments for a thread
  async getComments(threadId, { limit = 100, offset = 0 } = {}) {
    const result = await query(
      `SELECT c.*, u.username as author_username, u.display_name as author_display_name,
              u.avatar_type as author_avatar_type, u.avatar_value as author_avatar_value, u.avatar_bg as author_avatar_bg
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.thread_id = $1 AND NOT c.is_deleted
       ORDER BY c.created_at ASC
       LIMIT $2 OFFSET $3`,
      [threadId, limit, offset]
    );
    return result.rows;
  },

  // Find comment by ID
  async findCommentById(id) {
    const result = await query(
      `SELECT c.*, u.username as author_username, u.display_name as author_display_name
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  // Create comment
  async createComment(threadId, { userId, content, parentId = null }) {
    const result = await query(
      `INSERT INTO comments (thread_id, user_id, content, parent_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [threadId, userId, content, parentId]
    );
    return result.rows[0];
  },

  // Update comment
  async updateComment(id, content) {
    const result = await query(
      `UPDATE comments SET content = $2 WHERE id = $1 RETURNING *`,
      [id, content]
    );
    return result.rows[0] || null;
  },

  // Soft delete comment
  async deleteComment(id) {
    const result = await query(
      `UPDATE comments SET is_deleted = true, content = '[deleted]' WHERE id = $1 RETURNING id`,
      [id]
    );
    return result.rowCount > 0;
  },

  // Format thread for API response
  threadToJSON(thread) {
    if (!thread) return null;
    return {
      id: thread.id,
      groupId: thread.group_id,
      title: thread.title,
      type: thread.type,
      gameId: thread.game_id,
      threadDate: thread.thread_date,
      createdBy: thread.created_by,
      author: thread.author_username ? {
        username: thread.author_username,
        displayName: thread.author_display_name,
        avatar: {
          type: thread.author_avatar_type,
          value: thread.author_avatar_value,
          bg: thread.author_avatar_bg,
        },
      } : null,
      isPinned: thread.is_pinned,
      isLocked: thread.is_locked,
      commentCount: parseInt(thread.comment_count) || 0,
      lastActivityAt: thread.last_activity_at,
      createdAt: thread.created_at,
    };
  },

  // Format comment for API response
  commentToJSON(comment) {
    if (!comment) return null;
    return {
      id: comment.id,
      threadId: comment.thread_id,
      userId: comment.user_id,
      author: comment.author_username ? {
        username: comment.author_username,
        displayName: comment.author_display_name,
        avatar: {
          type: comment.author_avatar_type,
          value: comment.author_avatar_value,
          bg: comment.author_avatar_bg,
        },
      } : null,
      content: comment.content,
      parentId: comment.parent_id,
      isDeleted: comment.is_deleted,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
    };
  },
};

module.exports = Discussion;
