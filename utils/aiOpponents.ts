export interface AiOpponent {
  id: string;
  name: string;
  title: string;
  avatarSeed: string;
  accuracy: number; // 0.65 - 0.85
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
  { name: 'Angelo David', title: 'Kulitan Scholar', avatarSeed: 'angelo', accuracy: 0.82, minDelay: 3100, maxDelay: 5800 },
  { name: 'Bea Santos', title: 'Honor Student', avatarSeed: 'bea', accuracy: 0.78, minDelay: 3300, maxDelay: 6100 },
  { name: 'Christian Dizon', title: 'Senior Scribe', avatarSeed: 'christian', accuracy: 0.80, minDelay: 3200, maxDelay: 5900 },
  { name: 'Andrea Reyes', title: 'Kapampangan Scribe', avatarSeed: 'andrea', accuracy: 0.75, minDelay: 3400, maxDelay: 6300 },
  { name: 'Joshua Gutierrez', title: 'Campus Quizzer', avatarSeed: 'joshua', accuracy: 0.79, minDelay: 2900, maxDelay: 5500 },
  { name: 'Sofia Pineda', title: 'Heritage Explorer', avatarSeed: 'sofia', accuracy: 0.84, minDelay: 3000, maxDelay: 5600 },
  { name: 'Gabriel Cruz', title: 'Language Enthusiast', avatarSeed: 'gabriel', accuracy: 0.77, minDelay: 3500, maxDelay: 6400 },
  { name: 'Katrina Ramos', title: 'Top Student', avatarSeed: 'katrina', accuracy: 0.81, minDelay: 3100, maxDelay: 5700 },
  { name: 'Miguel Mercado', title: 'Active Learner', avatarSeed: 'miguel', accuracy: 0.76, minDelay: 2800, maxDelay: 5300 },
  { name: 'Erika Quiambao', title: 'Pampanga Scholar', avatarSeed: 'erika', accuracy: 0.83, minDelay: 3000, maxDelay: 5600 },
  { name: 'Rafael Henson', title: 'Diligent Scholar', avatarSeed: 'rafael', accuracy: 0.78, minDelay: 3300, maxDelay: 6000 },
  { name: 'Patricia Sunga', title: 'Aspiring Scribe', avatarSeed: 'patricia', accuracy: 0.74, minDelay: 3500, maxDelay: 6500 },
  { name: 'Daniel Lapid', title: 'Senior Scribe', avatarSeed: 'daniel', accuracy: 0.80, minDelay: 3200, maxDelay: 5800 },
  { name: 'Samantha Salonga', title: 'Honor Student', avatarSeed: 'samantha', accuracy: 0.79, minDelay: 3100, maxDelay: 5900 },
  { name: 'Jerome Manabat', title: 'Heritage Explorer', avatarSeed: 'jerome', accuracy: 0.77, minDelay: 3400, maxDelay: 6200 },
  { name: 'Clarisse Tolentino', title: 'Kulitan Scholar', avatarSeed: 'clarisse', accuracy: 0.82, minDelay: 3000, maxDelay: 5700 },
  { name: 'John Paul Garcia', title: 'Active Learner', avatarSeed: 'johnpaul', accuracy: 0.76, minDelay: 2900, maxDelay: 5400 },
  { name: 'Kristina Pangilinan', title: 'Top Student', avatarSeed: 'kristina', accuracy: 0.85, minDelay: 2800, maxDelay: 5200 },
];

export function getRandomAiOpponent(playerElo: number = 1000, playerLevel: number = 1): AiOpponent {
  let selectedName: string;
  let selectedTitle: string;
  let accuracy = 0.78;
  let minDelay = 3000;
  let maxDelay = 6000;
  let avatarSeed = 'scholar';

  // 60% chance to pick from preset, 40% chance to generate random realistic combination
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
    accuracy = 0.72 + Math.random() * 0.12; // 0.72 to 0.84
    minDelay = 2800 + Math.floor(Math.random() * 700);
    maxDelay = minDelay + 2500 + Math.floor(Math.random() * 1000);
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
