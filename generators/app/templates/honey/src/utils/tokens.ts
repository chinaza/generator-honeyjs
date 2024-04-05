export const baseTokenCostsText = {
  SIMPLE: {
    SHORT_TEXT: 6,
    MEDIUM_TEXT: 10,
    LONG_TEXT: 35
  },
  COMPLEX: {
    SHORT_TEXT: 115,
    MEDIUM_TEXT: 175,
    LONG_TEXT: 700
  }
};

export const tokenCostsPerInputBlock = {
  SIMPLE: 5,
  COMPLEX: 100
};

export const baseTokenCostsPhotos = { DALLE: 200, STABILITY: 100 };

export const MAX_CHARS_PER_BLOCK = 8000;

export const calcTokenCost = (
  text: string,
  model: keyof typeof baseTokenCostsText,
  outputFormat: keyof typeof baseTokenCostsText.SIMPLE,
  maxCharactersPerBlock = MAX_CHARS_PER_BLOCK
): number => {
  const numBlocks = Math.ceil(text.length / maxCharactersPerBlock) || 1;
  const inputCost = tokenCostsPerInputBlock[model] * (numBlocks - 1);
  const totalCost = baseTokenCostsText[model][outputFormat] + inputCost;
  return totalCost;
};

export const getMilestoneReward = (usageCount: number) => {
  const milestoneRewards = {
    10: {
      tokens: 700,
      subject: "🌟✨ You've Hit 10 Sessions with ProMind AI!",
      message:
        "Congratulations on reaching your first 10 usage of ProMind! As a token of our appreciation, we've credited 700 free tokens to your account. Keep exploring with ProMind AI! 🚀",
      closingGreeting: 'Cheers'
    },
    100: {
      tokens: 3500,
      subject: '💥🎉 100 Sessions Milestone Achieved!',
      message:
        'Amazing work hitting 100 usage with ProMind AI! To celebrate, 3,500 free tokens are now yours. Dive deeper and see what new heights you can reach! 💥',
      closingGreeting: 'Best'
    },
    1000: {
      tokens: 7000,
      subject: '🎉👏 A Thousand Thanks for 1,000 Sessions!',
      message:
        "1,000 sessions - what an incredible journey! We've credited 7,000 free tokens to your account as a big thank you. Your curiosity and dedication inspire us. Here's to many more sessions together! 🌟",
      closingGreeting: 'With gratitude'
    },
    10000: {
      tokens: 17500,
      subject: '🚀🌠 10,000 Sessions - A Stellar Achievement!',
      message:
        "You've reached an astronomical 10,000 usage of ProMind! To honor this milestone, 17,500 free tokens have been added to your account. Your journey with ProMind AI is truly inspiring. Keep pushing boundaries!  🛸",
      closingGreeting: 'Warm regards'
    },
    100000: {
      tokens: 35000,
      subject: '🌌💫 100,000 Sessions - Beyond the Horizon!',
      message:
        "Crossing 100,000 sessions with ProMind is nothing short of legendary. As a tribute to your extraordinary journey, 35,000 free tokens await you. Your dedication is the driving force behind our innovation. Here's to exploring new galaxies together! 🌍➡️🪐",
      closingGreeting: 'With awe and respect'
    }
  };

  return milestoneRewards[usageCount as keyof typeof milestoneRewards];
};
