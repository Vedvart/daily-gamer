// Seed Data Initializer
// Initializes localStorage with dummy users and their results

import dummyUsers from './dummyUsers';
import { generateAllUserResults } from './dummyResults';

const STORAGE_KEYS = {
  USERS: 'dailygamer_users',
  CURRENT_USER: 'dailygamer_current_user',
  GROUPS: 'dailygamer_groups',
  SEEDED: 'dailygamer_seeded'
};

// Get storage key for a user's results
export function getResultsKey(userId) {
  return `dailygamer_results_${userId}`;
}

// Get storage key for group members
export function getGroupMembersKey(groupId) {
  return `dailygamer_group_members_${groupId}`;
}

// Get storage key for group discussions
export function getDiscussionsKey(groupId) {
  return `dailygamer_discussions_${groupId}`;
}

// Check if data has been seeded
export function isSeeded() {
  return localStorage.getItem(STORAGE_KEYS.SEEDED) === 'true';
}

// Seed all dummy data
export function seedDummyData(force = false) {
  if (isSeeded() && !force) {
    console.log('Data already seeded, skipping...');
    return false;
  }

  console.log('Seeding dummy data...');

  // Clear old data if forcing
  if (force) {
    clearAllData();
  }

  // Seed users
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(dummyUsers));

  // Set default current user (first user)
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({
    userId: dummyUsers[0].id,
    isDemo: true
  }));

  // Generate and seed results for each user
  const allResults = generateAllUserResults(14); // 2 weeks of data
  for (const [userId, results] of Object.entries(allResults)) {
    localStorage.setItem(getResultsKey(userId), JSON.stringify({ results }));
  }

  // Migrate existing results to first user if they exist
  migrateExistingResults();

  // Mark as seeded
  localStorage.setItem(STORAGE_KEYS.SEEDED, 'true');

  console.log('Dummy data seeded successfully!');
  return true;
}

// Migrate existing results from old storage format to first user
function migrateExistingResults() {
  const oldResults = localStorage.getItem('dailygamer_results');
  if (oldResults) {
    try {
      const parsed = JSON.parse(oldResults);
      if (parsed.results && parsed.results.length > 0) {
        // Merge with first user's results
        const firstUserId = dummyUsers[0].id;
        const existingKey = getResultsKey(firstUserId);
        const existing = JSON.parse(localStorage.getItem(existingKey) || '{"results":[]}');

        // Add old results, avoiding duplicates
        for (const result of parsed.results) {
          const isDuplicate = existing.results.some(
            r => r.gameId === result.gameId && r.puzzleNumber === result.puzzleNumber
          );
          if (!isDuplicate) {
            existing.results.push(result);
          }
        }

        localStorage.setItem(existingKey, JSON.stringify(existing));
        console.log('Migrated existing results to first user');
      }
    } catch (e) {
      console.error('Failed to migrate existing results:', e);
    }
  }
}

// Clear all seeded data
export function clearAllData() {
  // Remove all user result keys
  for (const user of dummyUsers) {
    localStorage.removeItem(getResultsKey(user.id));
  }

  // Remove user data
  localStorage.removeItem(STORAGE_KEYS.USERS);
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  localStorage.removeItem(STORAGE_KEYS.GROUPS);
  localStorage.removeItem(STORAGE_KEYS.SEEDED);

  // Clear any group-related keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('dailygamer_group_') || key.startsWith('dailygamer_discussions_'))) {
      localStorage.removeItem(key);
      i--; // Adjust index since we removed an item
    }
  }

  console.log('All data cleared');
}

// Reset to fresh state with new seed
export function resetData() {
  clearAllData();
  seedDummyData(true);
}

export default seedDummyData;
