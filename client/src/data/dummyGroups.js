// Dummy Groups for Testing
// Sample groups with various configurations

const dummyGroups = [
  {
    id: 'group_001',
    name: 'NYT Puzzle Squad',
    description: 'For fans of all NYT games - Wordle, Connections, Mini, and Strands!',
    createdBy: 'user_001',
    createdAt: '2025-11-01T10:00:00Z',
    membership: {
      type: 'open',
      password: null,
      inviteCode: null
    },
    visibility: 'public',
    layout: {
      sections: [
        { type: 'pinned-games', visible: true, order: 0 },
        { type: 'daily-leaderboard', visible: true, order: 1 },
        { type: 'historical-leaderboard', visible: true, order: 2 },
        { type: 'discussions', visible: true, order: 3 },
        { type: 'members', visible: true, order: 4 }
      ],
      enabledGames: ['wordle', 'connections', 'mini', 'strands'],
      pinnedGames: ['wordle', 'connections']
    }
  },
  {
    id: 'group_002',
    name: 'Geography Gurus',
    description: 'Test your world knowledge with TimeGuessr, Travle, and Flagle.',
    createdBy: 'user_012',
    createdAt: '2025-11-15T14:30:00Z',
    membership: {
      type: 'open',
      password: null,
      inviteCode: null
    },
    visibility: 'public',
    layout: {
      sections: [
        { type: 'daily-leaderboard', visible: true, order: 0 },
        { type: 'pinned-games', visible: true, order: 1 },
        { type: 'discussions', visible: true, order: 2 },
        { type: 'historical-leaderboard', visible: true, order: 3 },
        { type: 'members', visible: true, order: 4 }
      ],
      enabledGames: ['timeguessr', 'travle', 'flagle'],
      pinnedGames: ['timeguessr']
    }
  },
  {
    id: 'group_003',
    name: 'Wordle Warriors',
    description: 'Dedicated to the classic 5-letter word game.',
    createdBy: 'user_007',
    createdAt: '2025-12-01T09:00:00Z',
    membership: {
      type: 'password',
      password: 'wordle123',
      inviteCode: null
    },
    visibility: 'public',
    layout: {
      sections: [
        { type: 'pinned-games', visible: true, order: 0 },
        { type: 'daily-leaderboard', visible: true, order: 1 },
        { type: 'discussions', visible: true, order: 2 },
        { type: 'historical-leaderboard', visible: true, order: 3 },
        { type: 'members', visible: true, order: 4 }
      ],
      enabledGames: ['wordle'],
      pinnedGames: ['wordle']
    }
  },
  {
    id: 'group_004',
    name: 'Music Lovers',
    description: 'Bandle enthusiasts unite! Guess the song from the instruments.',
    createdBy: 'user_017',
    createdAt: '2025-12-10T16:45:00Z',
    membership: {
      type: 'open',
      password: null,
      inviteCode: null
    },
    visibility: 'public',
    layout: {
      sections: [
        { type: 'pinned-games', visible: true, order: 0 },
        { type: 'daily-leaderboard', visible: true, order: 1 },
        { type: 'members', visible: true, order: 2 },
        { type: 'discussions', visible: true, order: 3 },
        { type: 'historical-leaderboard', visible: false, order: 4 }
      ],
      enabledGames: ['bandle'],
      pinnedGames: ['bandle']
    }
  },
  {
    id: 'group_005',
    name: 'Private Puzzle Club',
    description: 'An exclusive group for serious puzzle solvers.',
    createdBy: 'user_014',
    createdAt: '2026-01-05T11:00:00Z',
    membership: {
      type: 'invite-only',
      password: null,
      inviteCode: 'PUZZLE2026'
    },
    visibility: 'private',
    layout: {
      sections: [
        { type: 'daily-leaderboard', visible: true, order: 0 },
        { type: 'historical-leaderboard', visible: true, order: 1 },
        { type: 'pinned-games', visible: true, order: 2 },
        { type: 'discussions', visible: true, order: 3 },
        { type: 'members', visible: true, order: 4 }
      ],
      enabledGames: ['wordle', 'connections', 'mini', 'strands', 'bandle', 'catfishing'],
      pinnedGames: ['wordle', 'connections', 'mini']
    }
  },
  {
    id: 'group_006',
    name: 'Trivia Time',
    description: 'Daily Dozen and other trivia games.',
    createdBy: 'user_011',
    createdAt: '2026-01-10T08:00:00Z',
    membership: {
      type: 'open',
      password: null,
      inviteCode: null
    },
    visibility: 'public',
    layout: {
      sections: [
        { type: 'pinned-games', visible: true, order: 0 },
        { type: 'daily-leaderboard', visible: true, order: 1 },
        { type: 'discussions', visible: true, order: 2 },
        { type: 'members', visible: true, order: 3 },
        { type: 'historical-leaderboard', visible: true, order: 4 }
      ],
      enabledGames: ['dailydozen', 'thrice'],
      pinnedGames: ['dailydozen']
    }
  },
  {
    id: 'group_007',
    name: 'Office Puzzlers',
    description: 'Our office group for daily puzzle competitions. Password shared at work.',
    createdBy: 'user_003',
    createdAt: '2026-01-15T13:00:00Z',
    membership: {
      type: 'password',
      password: 'office2026',
      inviteCode: null
    },
    visibility: 'unlisted',
    layout: {
      sections: [
        { type: 'daily-leaderboard', visible: true, order: 0 },
        { type: 'pinned-games', visible: true, order: 1 },
        { type: 'members', visible: true, order: 2 },
        { type: 'discussions', visible: true, order: 3 },
        { type: 'historical-leaderboard', visible: true, order: 4 }
      ],
      enabledGames: ['wordle', 'connections', 'mini'],
      pinnedGames: ['wordle']
    }
  },
  {
    id: 'group_008',
    name: 'All Games Challenge',
    description: 'Play every daily game! For the completionists among us.',
    createdBy: 'user_020',
    createdAt: '2026-01-20T10:30:00Z',
    membership: {
      type: 'open',
      password: null,
      inviteCode: null
    },
    visibility: 'public',
    layout: {
      sections: [
        { type: 'pinned-games', visible: true, order: 0 },
        { type: 'daily-leaderboard', visible: true, order: 1 },
        { type: 'historical-leaderboard', visible: true, order: 2 },
        { type: 'discussions', visible: true, order: 3 },
        { type: 'members', visible: true, order: 4 }
      ],
      enabledGames: ['wordle', 'connections', 'mini', 'strands', 'bandle', 'catfishing', 'timeguessr', 'travle', 'flagle', 'scrandle', 'dailydozen', 'moreorless', 'eruptle', 'thrice'],
      pinnedGames: ['wordle', 'connections', 'mini', 'strands']
    }
  }
];

// Group member assignments
const groupMemberships = {
  group_001: [
    { userId: 'user_001', role: 'admin', joinedAt: '2025-11-01T10:00:00Z' },
    { userId: 'user_002', role: 'member', joinedAt: '2025-11-02T14:00:00Z' },
    { userId: 'user_003', role: 'member', joinedAt: '2025-11-03T09:30:00Z' },
    { userId: 'user_006', role: 'moderator', joinedAt: '2025-11-05T16:00:00Z' },
    { userId: 'user_007', role: 'member', joinedAt: '2025-11-08T11:00:00Z' },
    { userId: 'user_009', role: 'member', joinedAt: '2025-11-10T08:00:00Z' },
    { userId: 'user_013', role: 'member', joinedAt: '2025-11-15T13:00:00Z' },
    { userId: 'user_016', role: 'member', joinedAt: '2025-11-20T15:00:00Z' },
    { userId: 'user_020', role: 'member', joinedAt: '2025-12-01T10:00:00Z' }
  ],
  group_002: [
    { userId: 'user_012', role: 'admin', joinedAt: '2025-11-15T14:30:00Z' },
    { userId: 'user_019', role: 'moderator', joinedAt: '2025-11-16T10:00:00Z' },
    { userId: 'user_018', role: 'member', joinedAt: '2025-11-18T14:00:00Z' },
    { userId: 'user_003', role: 'member', joinedAt: '2025-11-20T09:00:00Z' },
    { userId: 'user_014', role: 'member', joinedAt: '2025-11-25T16:00:00Z' },
    { userId: 'user_020', role: 'member', joinedAt: '2025-12-05T11:00:00Z' }
  ],
  group_003: [
    { userId: 'user_007', role: 'admin', joinedAt: '2025-12-01T09:00:00Z' },
    { userId: 'user_001', role: 'member', joinedAt: '2025-12-02T10:00:00Z' },
    { userId: 'user_013', role: 'member', joinedAt: '2025-12-03T14:00:00Z' },
    { userId: 'user_002', role: 'member', joinedAt: '2025-12-05T11:00:00Z' },
    { userId: 'user_008', role: 'member', joinedAt: '2025-12-10T09:00:00Z' }
  ],
  group_004: [
    { userId: 'user_017', role: 'admin', joinedAt: '2025-12-10T16:45:00Z' },
    { userId: 'user_010', role: 'member', joinedAt: '2025-12-11T20:00:00Z' },
    { userId: 'user_002', role: 'member', joinedAt: '2025-12-12T15:00:00Z' },
    { userId: 'user_014', role: 'member', joinedAt: '2025-12-15T10:00:00Z' }
  ],
  group_005: [
    { userId: 'user_014', role: 'admin', joinedAt: '2026-01-05T11:00:00Z' },
    { userId: 'user_020', role: 'moderator', joinedAt: '2026-01-06T09:00:00Z' },
    { userId: 'user_001', role: 'member', joinedAt: '2026-01-07T14:00:00Z' }
  ],
  group_006: [
    { userId: 'user_011', role: 'admin', joinedAt: '2026-01-10T08:00:00Z' },
    { userId: 'user_003', role: 'member', joinedAt: '2026-01-11T10:00:00Z' },
    { userId: 'user_002', role: 'member', joinedAt: '2026-01-12T14:00:00Z' },
    { userId: 'user_014', role: 'member', joinedAt: '2026-01-13T09:00:00Z' },
    { userId: 'user_020', role: 'member', joinedAt: '2026-01-15T16:00:00Z' }
  ],
  group_007: [
    { userId: 'user_003', role: 'admin', joinedAt: '2026-01-15T13:00:00Z' },
    { userId: 'user_004', role: 'member', joinedAt: '2026-01-16T09:00:00Z' },
    { userId: 'user_005', role: 'member', joinedAt: '2026-01-17T10:00:00Z' },
    { userId: 'user_009', role: 'member', joinedAt: '2026-01-18T08:00:00Z' },
    { userId: 'user_015', role: 'member', joinedAt: '2026-01-19T11:00:00Z' }
  ],
  group_008: [
    { userId: 'user_020', role: 'admin', joinedAt: '2026-01-20T10:30:00Z' },
    { userId: 'user_014', role: 'moderator', joinedAt: '2026-01-21T09:00:00Z' },
    { userId: 'user_003', role: 'member', joinedAt: '2026-01-22T14:00:00Z' },
    { userId: 'user_001', role: 'member', joinedAt: '2026-01-23T10:00:00Z' },
    { userId: 'user_002', role: 'member', joinedAt: '2026-01-24T15:00:00Z' },
    { userId: 'user_006', role: 'member', joinedAt: '2026-01-25T11:00:00Z' },
    { userId: 'user_012', role: 'member', joinedAt: '2026-01-26T09:00:00Z' }
  ]
};

export { dummyGroups, groupMemberships };
export default dummyGroups;
