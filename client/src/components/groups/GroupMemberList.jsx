// GroupMemberList Component
// Displays list of group members

import { Link } from 'react-router-dom';
import useUsers from '../../hooks/useUsers';
import UserAvatar from '../user/UserAvatar';
import './GroupMemberList.css';

function GroupMemberList({
  groupId,
  members,
  currentUserId,
  canManage = false,
  isAdmin = false,
  isPreview = false
}) {
  const { getUser } = useUsers();

  // Sort members: admins first, then mods, then members, alphabetically within each
  const sortedMembers = [...members].sort((a, b) => {
    const roleOrder = { admin: 0, moderator: 1, member: 2 };
    const orderDiff = roleOrder[a.role] - roleOrder[b.role];
    if (orderDiff !== 0) return orderDiff;

    const userA = getUser(a.userId);
    const userB = getUser(b.userId);
    return (userA?.displayName || '').localeCompare(userB?.displayName || '');
  });

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="member-role member-role--admin">Admin</span>;
      case 'moderator':
        return <span className="member-role member-role--mod">Mod</span>;
      default:
        return null;
    }
  };

  return (
    <div className={`group-member-list ${isPreview ? 'group-member-list--preview' : ''}`}>
      {sortedMembers.map(member => {
        const user = getUser(member.userId);
        if (!user) return null;

        const isCurrentUser = member.userId === currentUserId;

        return (
          <div key={member.userId} className="member-item">
            <Link to={`/user/${member.userId}`} className="member-link">
              <UserAvatar user={user} size="small" />
              <div className="member-info">
                <span className="member-name">
                  {user.displayName}
                  {isCurrentUser && <span className="member-you">(you)</span>}
                </span>
                <span className="member-username">@{user.username}</span>
              </div>
            </Link>

            <div className="member-actions">
              {getRoleBadge(member.role)}

              {/* Role management would go here for admins */}
              {/* For now, keeping it simple */}
            </div>
          </div>
        );
      })}

      {isPreview && members.length > 5 && (
        <div className="member-list__more">
          And {members.length - 5} more members...
        </div>
      )}

      {members.length === 0 && (
        <div className="member-list__empty">
          No members yet.
        </div>
      )}
    </div>
  );
}

export default GroupMemberList;
