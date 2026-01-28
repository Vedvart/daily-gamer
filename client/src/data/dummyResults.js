// Dummy Results Generator
// Generates realistic game results for each user

import dummyUsers from './dummyUsers';

// Helper to generate a random date within the last N days
function randomDateInPastDays(days) {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * days);
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

// Helper to get a specific date N days ago
function daysAgo(n) {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return date.toISOString().split('T')[0];
}

// Helper to generate random puzzle numbers based on date
function getPuzzleNumber(gameId, date) {
  // Approximate puzzle numbers based on game start dates
  const baseNumbers = {
    wordle: 1200,
    connections: 500,
    strands: 300,
    bandle: 800,
    catfishing: 400,
    timeguessr: 600,
    travle: 700,
    flagle: 1000,
    scrandle: 200,
    dailydozen: 150,
    eruptle: 100,
    thrice: 250
  };

  const dateObj = new Date(date);
  const today = new Date();
  const daysDiff = Math.floor((today - dateObj) / (1000 * 60 * 60 * 24));

  return (baseNumbers[gameId] || 100) - daysDiff;
}

// Generate Wordle result
function generateWordleResult(date, skill) {
  const puzzleNumber = getPuzzleNumber('wordle', date);
  const skillModifier = skill === 'high' ? -1 : skill === 'low' ? 1 : 0;
  const baseScore = Math.floor(Math.random() * 4) + 2 + skillModifier;
  const score = Math.max(1, Math.min(6, baseScore));
  const won = Math.random() > (skill === 'high' ? 0.02 : skill === 'low' ? 0.15 : 0.08);
  const actualScore = won ? score : 7;

  // Generate grid
  const gridRows = won ? score : 6;
  let grid = '';
  for (let i = 0; i < gridRows; i++) {
    if (i === gridRows - 1 && won) {
      grid += '🟩🟩🟩🟩🟩\n';
    } else {
      let row = '';
      for (let j = 0; j < 5; j++) {
        const r = Math.random();
        if (r < 0.3) row += '🟩';
        else if (r < 0.5) row += '🟨';
        else row += '⬛';
      }
      grid += row + '\n';
    }
  }

  return {
    id: `wordle-${puzzleNumber}-${Date.now()}-${Math.random()}`,
    gameId: 'wordle',
    gameName: 'Wordle',
    puzzleNumber,
    date,
    score: won ? `${score}/6` : 'X/6',
    scoreValue: actualScore,
    maxScore: 6,
    won,
    grid: grid.trim(),
    rawText: `Wordle ${puzzleNumber} ${won ? score : 'X'}/6\n\n${grid}`,
    timestamp: new Date(date).getTime()
  };
}

// Generate Connections result
function generateConnectionsResult(date, skill) {
  const puzzleNumber = getPuzzleNumber('connections', date);
  const won = Math.random() > (skill === 'high' ? 0.05 : skill === 'low' ? 0.25 : 0.12);
  const mistakes = won
    ? (skill === 'high' ? Math.floor(Math.random() * 2) : Math.floor(Math.random() * 4))
    : 4;

  // Special achievements for high skill players
  const isReversePerfect = won && skill === 'high' && Math.random() < 0.15;
  const isPurpleFirst = won && !isReversePerfect && skill === 'high' && Math.random() < 0.2;

  // Generate grid
  const colors = ['🟨', '🟩', '🟦', '🟪'];
  let order = isReversePerfect ? [3, 2, 1, 0] : isPurpleFirst ? [3, 0, 1, 2] : [0, 1, 2, 3];
  if (!isReversePerfect && !isPurpleFirst && won) {
    // Shuffle for normal games
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
  }

  let grid = '';
  const completedRows = won ? 4 : Math.floor(Math.random() * 4);
  for (let i = 0; i < completedRows; i++) {
    grid += colors[order[i]].repeat(4) + '\n';
  }

  return {
    id: `connections-${puzzleNumber}-${Date.now()}-${Math.random()}`,
    gameId: 'connections',
    gameName: 'Connections',
    puzzleNumber,
    date,
    score: won ? `${4 - mistakes}/4` : 'X/4',
    scoreValue: won ? 4 - mistakes : 0,
    maxScore: 4,
    won,
    mistakes,
    isReversePerfect,
    isPurpleFirst,
    grid: grid.trim(),
    rawText: `Connections Puzzle #${puzzleNumber}\n${grid}`,
    timestamp: new Date(date).getTime()
  };
}

// Generate NYT Mini result
function generateMiniResult(date, skill) {
  const baseTime = skill === 'high' ? 30 : skill === 'low' ? 120 : 60;
  const variance = Math.floor(Math.random() * 60) - 30;
  const seconds = Math.max(15, baseTime + variance);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const timeStr = minutes > 0 ? `${minutes}:${secs.toString().padStart(2, '0')}` : `0:${secs.toString().padStart(2, '0')}`;

  return {
    id: `mini-${date}-${Date.now()}-${Math.random()}`,
    gameId: 'mini',
    gameName: 'NYT Mini',
    puzzleNumber: date,
    date,
    score: timeStr,
    scoreValue: seconds,
    won: true,
    rawText: `I solved the ${date} New York Times Mini Crossword in ${timeStr}!`,
    timestamp: new Date(date).getTime()
  };
}

// Generate Strands result
function generateStrandsResult(date, skill) {
  const puzzleNumber = getPuzzleNumber('strands', date);
  const hints = skill === 'high'
    ? Math.floor(Math.random() * 2)
    : skill === 'low'
      ? Math.floor(Math.random() * 4) + 1
      : Math.floor(Math.random() * 3);

  // Generate grid
  let grid = '';
  const rows = 6 + Math.floor(Math.random() * 3);
  for (let i = 0; i < rows; i++) {
    let row = '';
    for (let j = 0; j < 8; j++) {
      const r = Math.random();
      if (r < 0.6) row += '🔵';
      else if (r < 0.85) row += '🟡';
      else row += '💡';
    }
    grid += row + '\n';
  }

  return {
    id: `strands-${puzzleNumber}-${Date.now()}-${Math.random()}`,
    gameId: 'strands',
    gameName: 'Strands',
    puzzleNumber,
    date,
    score: `${hints} hints`,
    scoreValue: hints,
    won: true,
    grid: grid.trim(),
    rawText: `Strands #${puzzleNumber}\n${grid}`,
    timestamp: new Date(date).getTime()
  };
}

// Generate Bandle result
function generateBandleResult(date, skill) {
  const puzzleNumber = getPuzzleNumber('bandle', date);
  const baseScore = skill === 'high' ? 2 : skill === 'low' ? 5 : 3;
  const score = Math.max(1, Math.min(6, baseScore + Math.floor(Math.random() * 3) - 1));
  const won = Math.random() > (skill === 'high' ? 0.05 : skill === 'low' ? 0.2 : 0.1);

  const instruments = ['🎸', '🎹', '🥁', '🎺', '🎷', '🎻'];
  let grid = '';
  const rows = won ? score : 6;
  for (let i = 0; i < rows; i++) {
    grid += instruments[i] + (i < rows - 1 || !won ? '⬜⬜⬜' : '✅') + '\n';
  }

  return {
    id: `bandle-${puzzleNumber}-${Date.now()}-${Math.random()}`,
    gameId: 'bandle',
    gameName: 'Bandle',
    puzzleNumber,
    date,
    score: won ? `${score}/6` : 'X/6',
    scoreValue: won ? score : 7,
    maxScore: 6,
    won,
    grid: grid.trim(),
    rawText: `Bandle #${puzzleNumber} ${won ? score : 'x'}/6\n${grid}`,
    timestamp: new Date(date).getTime()
  };
}

// Generate Catfishing result
function generateCatfishingResult(date, skill) {
  const puzzleNumber = getPuzzleNumber('catfishing', date);
  const baseScore = skill === 'high' ? 8 : skill === 'low' ? 5 : 6.5;
  const variance = (Math.random() * 3) - 1.5;
  const score = Math.max(0, Math.min(10, Math.round((baseScore + variance) * 2) / 2));

  return {
    id: `catfishing-${puzzleNumber}-${Date.now()}-${Math.random()}`,
    gameId: 'catfishing',
    gameName: 'Catfishing',
    puzzleNumber,
    date,
    score: `${score}/10`,
    scoreValue: score,
    maxScore: 10,
    won: true,
    rawText: `catfishing.net #${puzzleNumber} - ${score}/10`,
    timestamp: new Date(date).getTime()
  };
}

// Generate TimeGuessr result
function generateTimeguessrResult(date, skill) {
  const puzzleNumber = getPuzzleNumber('timeguessr', date);
  const baseScore = skill === 'high' ? 40000 : skill === 'low' ? 25000 : 32000;
  const variance = Math.floor(Math.random() * 15000) - 7500;
  const score = Math.max(0, Math.min(50000, baseScore + variance));

  const stars = score >= 45000 ? '⭐⭐⭐⭐⭐' :
                score >= 35000 ? '⭐⭐⭐⭐' :
                score >= 25000 ? '⭐⭐⭐' :
                score >= 15000 ? '⭐⭐' : '⭐';

  return {
    id: `timeguessr-${puzzleNumber}-${Date.now()}-${Math.random()}`,
    gameId: 'timeguessr',
    gameName: 'TimeGuessr',
    puzzleNumber,
    date,
    score: `${score.toLocaleString()}/50,000`,
    scoreValue: score,
    maxScore: 50000,
    won: true,
    stars,
    rawText: `TimeGuessr #${puzzleNumber} ${score.toLocaleString()}/50,000\n${stars}`,
    timestamp: new Date(date).getTime()
  };
}

// Generate Travle result
function generateTravleResult(date, skill) {
  const puzzleNumber = getPuzzleNumber('travle', date);
  const extra = skill === 'high'
    ? Math.floor(Math.random() * 2)
    : skill === 'low'
      ? Math.floor(Math.random() * 5) + 2
      : Math.floor(Math.random() * 4);

  let emojis = '';
  for (let i = 0; i < 5 + extra; i++) {
    if (i < 3) emojis += '✅';
    else if (Math.random() < 0.6) emojis += '🟧';
    else emojis += '🟥';
  }

  return {
    id: `travle-${puzzleNumber}-${Date.now()}-${Math.random()}`,
    gameId: 'travle',
    gameName: 'Travle',
    puzzleNumber,
    date,
    score: `+${extra}`,
    scoreValue: extra,
    won: true,
    grid: emojis,
    rawText: `#travle #${puzzleNumber} +${extra}\n${emojis}`,
    timestamp: new Date(date).getTime()
  };
}

// Generate Flagle result
function generateFlagleResult(date, skill) {
  const puzzleNumber = getPuzzleNumber('flagle', date);
  const baseScore = skill === 'high' ? 2 : skill === 'low' ? 5 : 3;
  const score = Math.max(1, Math.min(6, baseScore + Math.floor(Math.random() * 3) - 1));
  const won = Math.random() > (skill === 'high' ? 0.08 : skill === 'low' ? 0.25 : 0.15);

  return {
    id: `flagle-${puzzleNumber}-${Date.now()}-${Math.random()}`,
    gameId: 'flagle',
    gameName: 'Flagle',
    puzzleNumber,
    date,
    score: won ? `${score}/6` : 'X/6',
    scoreValue: won ? score : 7,
    maxScore: 6,
    won,
    rawText: `#Flagle #${puzzleNumber} ${won ? score : 'X'}/6`,
    timestamp: new Date(date).getTime()
  };
}

// Generate Scrandle result
function generateScrandleResult(date, skill) {
  const puzzleNumber = getPuzzleNumber('scrandle', date);
  const baseScore = skill === 'high' ? 8 : skill === 'low' ? 5 : 7;
  const score = Math.max(0, Math.min(10, baseScore + Math.floor(Math.random() * 4) - 2));

  return {
    id: `scrandle-${puzzleNumber}-${Date.now()}-${Math.random()}`,
    gameId: 'scrandle',
    gameName: 'Scrandle',
    puzzleNumber,
    date,
    score: `${score}/10`,
    scoreValue: score,
    maxScore: 10,
    won: true,
    rawText: `Scrandle #${puzzleNumber} ${score}/10`,
    timestamp: new Date(date).getTime()
  };
}

// Generate Daily Dozen result
function generateDailydozenResult(date, skill) {
  const puzzleNumber = getPuzzleNumber('dailydozen', date);
  const baseScore = skill === 'high' ? 10 : skill === 'low' ? 6 : 8;
  const score = Math.max(0, Math.min(12, baseScore + Math.floor(Math.random() * 4) - 1));

  return {
    id: `dailydozen-${puzzleNumber}-${Date.now()}-${Math.random()}`,
    gameId: 'dailydozen',
    gameName: 'Daily Dozen',
    puzzleNumber,
    date,
    score: `${score}/12`,
    scoreValue: score,
    maxScore: 12,
    won: true,
    rawText: `Daily Dozen #${puzzleNumber} ${score}/12`,
    timestamp: new Date(date).getTime()
  };
}

// Generate More Or Less result
function generateMoreorlessResult(date, skill) {
  const baseStreak = skill === 'high' ? 15 : skill === 'low' ? 5 : 10;
  const streak = Math.max(1, baseStreak + Math.floor(Math.random() * 10) - 5);

  return {
    id: `moreorless-${date}-${Date.now()}-${Math.random()}`,
    gameId: 'moreorless',
    gameName: 'More Or Less',
    puzzleNumber: date,
    date,
    score: `${streak} streak`,
    scoreValue: streak,
    won: true,
    rawText: `More or Less ${streak} streak`,
    timestamp: new Date(date).getTime()
  };
}

// Generate Eruptle result
function generateEruptleResult(date, skill) {
  const puzzleNumber = getPuzzleNumber('eruptle', date);
  const baseScore = skill === 'high' ? 8 : skill === 'low' ? 4 : 6;
  const score = Math.max(0, Math.min(10, baseScore + Math.floor(Math.random() * 4) - 1));

  return {
    id: `eruptle-${puzzleNumber}-${Date.now()}-${Math.random()}`,
    gameId: 'eruptle',
    gameName: 'Eruptle',
    puzzleNumber,
    date,
    score: `${score}/10`,
    scoreValue: score,
    maxScore: 10,
    won: true,
    rawText: `Eruptle #${puzzleNumber} ${score}/10`,
    timestamp: new Date(date).getTime()
  };
}

// Generate Thrice result
function generateThriceResult(date, skill) {
  const puzzleNumber = getPuzzleNumber('thrice', date);
  const basePoints = skill === 'high' ? 12 : skill === 'low' ? 6 : 9;
  const points = Math.max(0, Math.min(15, basePoints + Math.floor(Math.random() * 6) - 3));

  return {
    id: `thrice-${puzzleNumber}-${Date.now()}-${Math.random()}`,
    gameId: 'thrice',
    gameName: 'Thrice',
    puzzleNumber,
    date,
    score: `${points} points`,
    scoreValue: points,
    maxScore: 15,
    won: true,
    rawText: `Thrice Game #${puzzleNumber} → ${points} points!`,
    timestamp: new Date(date).getTime()
  };
}

// User skill profiles (determines how well they typically do)
const userSkillProfiles = {
  user_001: { wordle: 'high', connections: 'high', mini: 'medium', default: 'medium' },
  user_002: { wordle: 'medium', connections: 'high', strands: 'high', default: 'medium' },
  user_003: { default: 'medium' }, // Plays everything moderately
  user_004: { mini: 'high', default: 'medium' }, // Speedrunner - fast at Mini
  user_005: { default: 'low' }, // Casual - lower scores but still plays
  user_006: { wordle: 'high', connections: 'high', mini: 'high', strands: 'high', default: 'low' },
  user_007: { wordle: 'high', default: 'medium' }, // Streak focused
  user_008: { connections: 'high', default: 'medium' },
  user_009: { mini: 'high', default: 'medium' },
  user_010: { default: 'medium' },
  user_011: { dailydozen: 'high', default: 'medium' }, // Trivia king
  user_012: { timeguessr: 'high', travle: 'high', flagle: 'high', default: 'medium' },
  user_013: { wordle: 'high', scrandle: 'high', default: 'medium' },
  user_014: { default: 'high' }, // Good at everything
  user_015: { mini: 'high', default: 'medium' },
  user_016: { connections: 'high', default: 'medium' },
  user_017: { bandle: 'high', default: 'medium' },
  user_018: { flagle: 'high', default: 'medium' },
  user_019: { travle: 'high', timeguessr: 'high', default: 'medium' },
  user_020: { default: 'high' } // All-rounder
};

// Games each user tends to play (not everyone plays everything)
const userGamePreferences = {
  user_001: ['wordle', 'connections', 'mini', 'strands'],
  user_002: ['wordle', 'connections', 'strands', 'bandle', 'catfishing'],
  user_003: ['wordle', 'connections', 'mini', 'bandle', 'timeguessr', 'travle', 'flagle', 'dailydozen'],
  user_004: ['mini', 'wordle', 'connections'],
  user_005: ['wordle', 'connections'],
  user_006: ['wordle', 'connections', 'mini', 'strands'],
  user_007: ['wordle', 'connections', 'mini'],
  user_008: ['connections', 'strands', 'wordle'],
  user_009: ['mini', 'wordle', 'connections', 'strands'],
  user_010: ['wordle', 'bandle', 'catfishing', 'timeguessr'],
  user_011: ['dailydozen', 'wordle', 'connections', 'thrice'],
  user_012: ['timeguessr', 'travle', 'flagle', 'wordle'],
  user_013: ['wordle', 'scrandle', 'connections', 'strands'],
  user_014: ['wordle', 'connections', 'mini', 'strands', 'bandle', 'catfishing', 'timeguessr', 'travle', 'flagle', 'dailydozen', 'eruptle', 'thrice'],
  user_015: ['mini', 'wordle', 'connections'],
  user_016: ['connections', 'wordle', 'strands'],
  user_017: ['bandle', 'wordle', 'connections'],
  user_018: ['flagle', 'travle', 'wordle', 'connections'],
  user_019: ['travle', 'timeguessr', 'flagle', 'wordle'],
  user_020: ['wordle', 'connections', 'mini', 'strands', 'bandle', 'catfishing', 'timeguessr', 'travle', 'flagle', 'scrandle', 'dailydozen', 'moreorless', 'eruptle', 'thrice']
};

// Generator functions map
const generators = {
  wordle: generateWordleResult,
  connections: generateConnectionsResult,
  mini: generateMiniResult,
  strands: generateStrandsResult,
  bandle: generateBandleResult,
  catfishing: generateCatfishingResult,
  timeguessr: generateTimeguessrResult,
  travle: generateTravleResult,
  flagle: generateFlagleResult,
  scrandle: generateScrandleResult,
  dailydozen: generateDailydozenResult,
  moreorless: generateMoreorlessResult,
  eruptle: generateEruptleResult,
  thrice: generateThriceResult
};

// Generate all results for a user
export function generateUserResults(userId, daysBack = 14) {
  const results = [];
  const profile = userSkillProfiles[userId] || { default: 'medium' };
  const games = userGamePreferences[userId] || ['wordle', 'connections', 'mini'];

  for (let d = 0; d < daysBack; d++) {
    const date = daysAgo(d);

    // Each user doesn't play every day, simulate ~70-90% play rate
    const playRate = userId === 'user_005' ? 0.5 : 0.8; // Casual plays less

    for (const gameId of games) {
      // Random chance they played this game today
      if (Math.random() < playRate) {
        const skill = profile[gameId] || profile.default || 'medium';
        const generator = generators[gameId];
        if (generator) {
          results.push(generator(date, skill));
        }
      }
    }
  }

  return results;
}

// Generate results for all users
export function generateAllUserResults(daysBack = 14) {
  const allResults = {};

  for (const user of dummyUsers) {
    allResults[user.id] = generateUserResults(user.id, daysBack);
  }

  return allResults;
}

export default generateAllUserResults;
