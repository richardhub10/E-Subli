export interface AiOpponent {
  id: string;
  name: string;
  title: string;
  avatarSeed: string;
  accuracy: number; // 0.78 - 0.92
  minDelay: number; // ms to think
  maxDelay: number; // ms to think
  level?: number;
  elo?: number;
}

const FIRST_NAMES = [
  'Angelo', 'Bea', 'Christian', 'Andrea', 'Joshua', 'Sofia',
  'Gabriel', 'Katrina', 'Miguel', 'Erika', 'Patricia', 'Rafael',
  'Alyssa', 'Kenneth', 'Daniel', 'Samantha', 'Jerome', 'Clarisse',
  'John Paul', 'Kristina', 'Lean', 'Chloe', 'Karl', 'Princess',
  'Mark', 'Nicole', 'Francis', 'Hannah', 'Carlo', 'Jasmine',
  'Dave', 'Rica', 'Justin', 'Trisha', 'Alden', 'Cheska'
];

const LAST_NAMES = [
  'David', 'Santos', 'Dizon', 'Reyes', 'Gutierrez', 'Pineda',
  'Cruz', 'Ramos', 'Mercado', 'Quiambao', 'Sunga', 'Henson',
  'Ocampo', 'Morales', 'Lapid', 'Salonga', 'Manabat', 'Tolentino',
  'Garcia', 'Pangilinan', 'Paras', 'Manaloto', 'Mallari', 'Guinto',
  'Aquino', 'Castro', 'Villanueva', 'Bautista', 'Yambao', 'Capati'
];

const TITLES = [
  'Kulitan Scholar',
  'Kapampangan Scribe',
  'Active Learner',
  'Honor Student',
  'Senior Scribe',
  'Heritage Explorer',
  'Diligent Scholar',
  'Campus Quizzer',
  'Language Enthusiast',
  'Pampanga Scholar',
  'Top Student',
  'Aspiring Scribe',
];

export const PRESET_OPPONENTS: Omit<AiOpponent, 'id' | 'level' | 'elo'>[] = [
  { name: 'Angelo David', title: 'Kulitan Scholar', avatarSeed: 'angelo', accuracy: 0.88, minDelay: 1900, maxDelay: 3500 },
  { name: 'Bea Santos', title: 'Honor Student', avatarSeed: 'bea', accuracy: 0.85, minDelay: 2100, maxDelay: 3700 },
  { name: 'Christian Dizon', title: 'Senior Scribe', avatarSeed: 'christian', accuracy: 0.86, minDelay: 2000, maxDelay: 3600 },
  { name: 'Andrea Reyes', title: 'Kapampangan Scribe', avatarSeed: 'andrea', accuracy: 0.84, minDelay: 2200, maxDelay: 3900 },
  { name: 'Joshua Gutierrez', title: 'Campus Quizzer', avatarSeed: 'joshua', accuracy: 0.87, minDelay: 1800, maxDelay: 3400 },
  { name: 'Sofia Pineda', title: 'Heritage Explorer', avatarSeed: 'sofia', accuracy: 0.90, minDelay: 1900, maxDelay: 3300 },
  { name: 'Gabriel Cruz', title: 'Language Enthusiast', avatarSeed: 'gabriel', accuracy: 0.85, minDelay: 2200, maxDelay: 3800 },
  { name: 'Katrina Ramos', title: 'Top Student', avatarSeed: 'katrina', accuracy: 0.89, minDelay: 2000, maxDelay: 3500 },
  { name: 'Miguel Mercado', title: 'Active Learner', avatarSeed: 'miguel', accuracy: 0.84, minDelay: 1900, maxDelay: 3600 },
  { name: 'Erika Quiambao', title: 'Pampanga Scholar', avatarSeed: 'erika', accuracy: 0.88, minDelay: 2000, maxDelay: 3500 },
  { name: 'Rafael Henson', title: 'Diligent Scholar', avatarSeed: 'rafael', accuracy: 0.86, minDelay: 2100, maxDelay: 3700 },
  { name: 'Patricia Sunga', title: 'Aspiring Scribe', avatarSeed: 'patricia', accuracy: 0.83, minDelay: 2300, maxDelay: 4000 },
  { name: 'Daniel Lapid', title: 'Senior Scribe', avatarSeed: 'daniel', accuracy: 0.87, minDelay: 2000, maxDelay: 3600 },
  { name: 'Samantha Salonga', title: 'Honor Student', avatarSeed: 'samantha', accuracy: 0.88, minDelay: 1900, maxDelay: 3500 },
  { name: 'Jerome Manabat', title: 'Heritage Explorer', avatarSeed: 'jerome', accuracy: 0.85, minDelay: 2200, maxDelay: 3800 },
  { name: 'Clarisse Tolentino', title: 'Kulitan Scholar', avatarSeed: 'clarisse', accuracy: 0.89, minDelay: 1900, maxDelay: 3400 },
  { name: 'John Paul Garcia', title: 'Active Learner', avatarSeed: 'johnpaul', accuracy: 0.84, minDelay: 2000, maxDelay: 3700 },
  { name: 'Kristina Pangilinan', title: 'Top Student', avatarSeed: 'kristina', accuracy: 0.91, minDelay: 1800, maxDelay: 3200 },
];

export function getRandomAiOpponent(playerElo: number = 1000, playerLevel: number = 1): AiOpponent {
  let selectedName: string;
  let selectedTitle: string;
  let accuracy = 0.86;
  let minDelay = 1900;
  let maxDelay = 3600;
  let avatarSeed = 'scholar';

  if (Math.random() < 0.6) {
    const preset = PRESET_OPPONENTS[Math.floor(Math.random() * PRESET_OPPONENTS.length)];
    selectedName = preset.name;
    selectedTitle = preset.title;
    accuracy = preset.accuracy;
    minDelay = preset.minDelay;
    maxDelay = preset.maxDelay;
    avatarSeed = preset.avatarSeed;
  } else {
    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    selectedName = `${firstName} ${lastName}`;
    selectedTitle = TITLES[Math.floor(Math.random() * TITLES.length)];
    accuracy = 0.82 + Math.random() * 0.08; // 0.82 to 0.90
    minDelay = 1800 + Math.floor(Math.random() * 500);
    maxDelay = minDelay + 1400 + Math.floor(Math.random() * 600);
    avatarSeed = firstName.toLowerCase();
  }

  const eloOffset = Math.floor(Math.random() * 71) - 35; // -35 to +35 of player elo
  const levelOffset = Math.floor(Math.random() * 3) - 1; // -1 to +1 of player level

  return {
    id: `opp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: selectedName,
    title: selectedTitle,
    avatarSeed,
    accuracy,
    minDelay,
    maxDelay,
    elo: Math.max(800, playerElo + eloOffset),
    level: Math.max(1, playerLevel + levelOffset),
  };
}
