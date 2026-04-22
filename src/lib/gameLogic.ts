export const RARITIES = {
  CONSUMER: { id: 'consumer', name: 'Consumer Grade', color: 'text-gray-400', baseValue: 5 },
  MIL_SPEC: { id: 'mil-spec', name: 'Mil-Spec', color: 'text-blue-500', baseValue: 20 },
  RESTRICTED: { id: 'restricted', name: 'Restricted', color: 'text-purple-500', baseValue: 100 },
  CLASSIFIED: { id: 'classified', name: 'Classified', color: 'text-pink-500', baseValue: 500 },
  COVERT: { id: 'covert', name: 'Covert', color: 'text-red-500', baseValue: 2500 },
  EXCEEDINGLY_RARE: { id: 'gold', name: 'Exceedingly Rare', color: 'text-yellow-400', baseValue: 15000 }
};

export interface CaseOdds {
  rarity: typeof RARITIES.CONSUMER;
  chance: number;
}

export interface CaseType {
  id: string;
  name: string;
  category: string;
  description: string;
  cost: number;
  image: string;
  odds: CaseOdds[];
  isPremium?: boolean;
  realMoneyPrice?: number;
}

function stringToHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function makeCase(id: string, name: string, category: string, desc: string, cost: number, [c, m, r, cl, co, e]: number[], isPremium?: boolean, realMoneyPrice?: number): CaseType {
  let imagePrompt = `A 3d render of a video game loot box case themed around ${name}, ${category} category, highly detailed, glowing`;
  
  if (category === 'Automotive') {
    imagePrompt = `A 3d render of a loot box case styled like a modified ${name} drift car, carbon fiber, turbocharger, neon underglow, highly detailed, 4k`;
  } else if (category === 'CS:GO') {
    imagePrompt = `A 3d render of a military weapon case, tactical, olive drab, ${name}, highly detailed lootbox`;
  } else if (category === 'Premium') {
    imagePrompt = `A hyper-realistic 3d render of an ultra rare premium VIP loot box case themed around ${name}, glowing golden and diamonds, highest quality`;
  } else if (category === 'Random') {
    imagePrompt = `A mysterious transparent glass 3d video game loot box case containing a glowing question mark, highly detailed`;
  } else if (category === 'Technology') {
    imagePrompt = `A 3d render of a futuristic cyberpunk video game loot box case, glowing neon, circuit boards, highly detailed`;
  }

  // Multiply seed to avoid pollinations caching similar words
  const seedMultiplier = Math.abs(stringToHash(id)) * 10;

  return {
    id,
    name,
    category,
    description: desc,
    cost,
    isPremium,
    realMoneyPrice,
    image: `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=300&height=300&nologo=true&seed=${seedMultiplier}`,
    odds: [
      { rarity: RARITIES.CONSUMER, chance: c / 100 },
      { rarity: RARITIES.MIL_SPEC, chance: m / 100 },
      { rarity: RARITIES.RESTRICTED, chance: r / 100 },
      { rarity: RARITIES.CLASSIFIED, chance: cl / 100 },
      { rarity: RARITIES.COVERT, chance: co / 100 },
      { rarity: RARITIES.EXCEEDINGLY_RARE, chance: e / 100 }
    ]
  };
}

export const CASES: CaseType[] = [
  makeCase('free', 'Wikipedia Roulette', 'Random', 'No filters. Absolutely anything from the 6 million+ pages', 0, [60, 25, 10, 3.5, 1.25, 0.25]),
  
  makeCase('automotive-case', 'Automotive Case', 'Automotive', 'Everything from JDM Legends, European Exotics, American Muscle, Group B, to Hypercars', 800, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('beverages-case', 'Beverages Case', 'Beverage', 'The Caffeine Rush, Discontinued Gems, and Global Imports all in one', 300, [65, 22, 8, 3.5, 1.25, 0.25]),
  makeCase('science-case', 'Science Case', 'Science', 'Nootropics, Event Horizons, Quantum Realms, and Paleontology', 1000, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('history-case', 'History Case', 'History', 'From Soft Drink Origins to Great Empires and Cold War espionage', 600, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('music-case', 'Music Case', 'Music', 'Memphis Underground, Drift Phonk, and Lofi Beats', 300, [50, 30, 14, 4.5, 1.25, 0.25]),
  makeCase('audio-case', 'Audio Case', 'Audio', 'Famous digital instruments, VST racks and synthesizers', 400, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('engineering-case', 'Engineering Case', 'Engineering', 'Mega-structures, bridges, and mixing boards', 750, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('hardware-case', 'Hardware Case', 'Hardware', 'Graphics cards, mechanical keyboards, and custom hardware', 750, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('gaming-case', 'Gaming Case', 'Gaming', 'Champion\'s Field, Fatality Lore, and Speedrun Glitches', 500, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('tech-case', 'Tech Case', 'Tech', 'Silicon Valley titans and Artificial Intelligence tech', 800, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('biology-case', 'Biology Case', 'Biology', 'Hypertrophy, muscle growth science, and physiology', 400, [50, 35, 10, 3.5, 1.25, 0.25]),
  makeCase('nature-case', 'Nature Case', 'Nature', 'The Abyssal Zone and Venomous worlds of the earth', 850, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('philosophy-case', 'Philosophy Case', 'Philosophy', 'The Stoic\'s path and the art of self-control', 300, [40, 40, 15, 4, 0.75, 0.25]),
  makeCase('geography-case', 'Geography Case', 'Geography', 'Ghost Towns, Micro-Nations, and Wonders of the World', 600, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('mystery-case', 'Mystery Case', 'Mystery', 'Unsolved Riddles and Cryptid Sightings', 1200, [75, 18, 4, 2, 0.75, 0.25]),
  makeCase('internet-case', 'Internet Case', 'Internet', 'The Meme Archive and viral moments online', 200, [40, 40, 15, 4, 0.85, 0.15]),
  makeCase('fashion-case', 'Fashion Case', 'Fashion', 'Streetwear hyper and luxury brands', 650, [65, 20, 10, 3.5, 1.25, 0.25]),
  makeCase('weather-case', 'Weather Case', 'Weather', 'Supercell Storms and extreme natural events', 700, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('crime-case', 'Crime Case', 'Crime', 'Heist Records and world history mysteries', 1200, [70, 22, 5, 2, 0.75, 0.25]),
  makeCase('military-case', 'Military Case', 'Military', 'Stealth Tech and invisible warfare', 1800, [75, 18, 4, 2, 0.75, 0.25]),
  makeCase('myth-case', 'Mythology Case', 'Myth', 'Gods & Titans of Greek, Norse, and Egyptian mythology', 2000, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('aviation-case', 'Aviation Case', 'Aviation', 'The Sound Barrier and history of supersonic jets', 1400, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('sports-case', 'Sports Case', 'Sports', 'Olympic Glory and records of the games', 500, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('anime-case', 'Anime Case', 'Anime', 'Shonen Spirit and iconic manga series', 450, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('media-case', 'Media Case', 'Media', 'Blockbuster Cinema and the highest-grossing films', 500, [60, 25, 10, 3.5, 1.25, 0.25]),
  
  makeCase('cosmic-anomalies-case', 'Cosmic Anomalies', 'Space', 'The most terrifying and mysterious objects in the observable universe', 1500, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('black-projects-case', 'Black Projects', 'Aviation', 'Secret prototypes and supersonic jets that broke world records', 1200, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('apex-predators-case', 'Apex Predators', 'Biology', 'The deadliest hunters to ever walk, swim, or fly on Earth', 800, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('rare-earth-case', 'Rare Earth', 'Geology', 'Rare gemstones and radioactive elements found deep in the crust', 1100, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('ancient-deities-case', 'Ancient Deities', 'Mythology', 'Cosmic monsters and ancient deities from world folklore', 1000, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('retro-futurism-case', 'Retro-Futurism', 'Technology', 'How the past imagined the future—vacuum tubes and flying cars', 600, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('brutalism-case', 'Brutalism', 'Architecture', 'Massive concrete structures and dystopian architectural feats', 700, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('firepower-evolution-case', 'Firepower Evolution', 'Weapons', 'The evolution of firearms from black powder to modern railguns', 950, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('particle-physics-case', 'Particle Physics', 'Physics', 'Subatomic particles and the machinery used to smash them', 1300, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('naval-leviathans-case', 'Naval Leviathans', 'Engineering', 'Massive aircraft carriers, submarines, and ghost ships', 1400, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('lost-civilizations-case', 'Lost Civilizations', 'History', 'Entire cultures that vanished without a trace into the jungle', 900, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('toxic-elements-case', 'Toxic Elements', 'Chemistry', 'The most poisonous and unstable substances known to man', 850, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('vaporware-case', 'Vaporware', 'Gaming', 'Infamous games that were announced but never released', 400, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('natural-disasters-case', 'Natural Disasters', 'Weather', 'Super-tornados, mega-tsunamis, and volcanic eruptions', 1100, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('dark-web-case', 'Dark Web', 'Cyber', 'Cryptography, hacking history, and deep-net anomalies', 1250, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('prehistoric-beasts-case', 'Prehistoric Beasts', 'Paleontology', 'Woolly Mammoths, Sabertooth Cats, and prehistoric beasts', 750, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('medical-horrors-case', 'Medical Horrors', 'Medicine', 'The history of pandemics and medieval medical horrors', 650, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('kardashev-scale-case', 'Kardashev Scale', 'Space', 'Theoretical civilizations and the Kardashev scale', 1600, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('analog-synths-case', 'Analog Synths', 'Music', 'Rare analog gear and the machines that built electronic music', 800, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('cosmic-signals-case', 'Cosmic Signals', 'Mystery', 'Numbers stations, radio anomalies, and cosmic signals', 900, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('black-ops-case', 'Black Ops', 'Military', 'Elite units, stealth gear, and classified mission history', 1150, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('carnivorous-botany-case', 'Carnivorous Botany', 'Botany', 'Plants that hunt and eat living organisms to survive', 550, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('absolute-power-case', 'Absolute Power', 'History', 'Dystopian governments and the history of absolute power', 1050, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('sentient-ai-case', 'Sentient AI', 'Tech', 'Sentient machines and the future of human-AI merging', 1350, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('abyssal-monsters-case', 'Abyssal Monsters', 'Ocean', 'Unidentified sea monsters and deep-trench exploration', 950, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('economic-ruin-case', 'Economic Ruin', 'Finance', 'Historical collapses, hyperinflation, and economic ruin', 600, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('arena-legends-case', 'Arena Legends', 'Sports', 'The history of gladiators, knights, and MMA legends', 700, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('stellar-remnants-case', 'Stellar Remnants', 'Astronomy', 'What remains after the most violent explosions in space', 1450, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('haute-couture-case', 'Haute Couture', 'Fashion', 'The most expensive and bizarre high-fashion in history', 850, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('bio-hacking-case', 'Bio-Hacking', 'Science', 'CRISPR, cloning, and the future of bio-hacking', 1200, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('infamous-crimes-case', 'Infamous Crimes', 'Crime', 'Wikipedia\'s most notorious criminal profiles and cases', 900, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('forbidden-zones-case', 'Forbidden Zones', 'Geography', 'Chernobyl, Area 51, and places humans aren\'t allowed', 1100, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('mega-skyscrapers-case', 'Mega-Skyscrapers', 'Engineering', 'Skyscrapers that touch the clouds and defy engineering', 1000, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('lost-masterpieces-case', 'Lost Masterpieces', 'Art', 'Famous paintings that were looted or vanished forever', 800, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('supercomputers-case', 'Supercomputers', 'Tech', 'Massive mainframes and the world\'s fastest processors', 1300, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('urban-legends-case', 'Urban Legends', 'Mythology', 'Local legends and terrifying creatures from rural lore', 500, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('atomic-era-case', 'Atomic Era', 'History', 'Manhattan Project, test sites, and the atomic era', 1800, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('cult-cinema-case', 'Cult Cinema', 'Media', 'Bizarre underground films that built a massive following', 450, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('barn-finds-case', 'Barn Finds', 'Automotive', 'Ultra-rare cars found rotting in abandoned garages', 1150, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('paradoxes-case', 'Paradoxes', 'Logic', 'Problems that break the rules of logic and reality', 700, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('radioactive-zones-case', 'Radioactive Zones', 'Environment', 'Places on Earth where the Geiger counter never stops', 1050, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('mars-colonization-case', 'Mars Colonization', 'Space', 'The technology and plans for the red planet\'s future', 1250, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('political-hits-case', 'Political Hits', 'History', 'The most high-stakes political hits in human history', 950, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('uncanny-valley-case', 'Uncanny Valley', 'Robotics', 'The uncanny valley of machines that look like us', 850, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('end-of-time-case', 'End of Time', 'Philosophy', 'Theories on the end of the universe and human meaning', 1400, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('extremophiles-case', 'Extremophiles', 'Science', 'Creatures that live in lava, acid, and absolute zero', 750, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('secret-societies-case', 'Secret Societies', 'History', 'The Illuminati, Freemasons, and hidden power groups', 1100, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('esports-legends-case', 'Esports Legends', 'Gaming', 'Legendarily skilled players and world-championship teams', 900, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('fusion-power-case', 'Fusion Power', 'Engineering', 'Fusion reactors and the most powerful power plants on Earth', 1500, [60, 25, 10, 3.5, 1.25, 0.25]),
  makeCase('ancient-flora-case', 'Ancient Flora', 'Nature', 'The oldest, largest, and strangest trees in the world', 500, [60, 25, 10, 3.5, 1.25, 0.25]),

  // CS:GO Cases
  makeCase('csgo-weapon', 'CS:GO Weapon Case', 'CS:GO', 'Original 2013 weapon skins and knives', 250, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0]),
  makeCase('esports-2013', 'eSports 2013 Case', 'CS:GO', 'The first eSports case that supported tournament prizepools', 250, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0]),
  makeCase('bravo', 'Operation Bravo Case', 'CS:GO', 'Released alongside Operation Bravo', 250, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0]),
  makeCase('csgo-weapon-2', 'CS:GO Weapon Case 2', 'CS:GO', 'Second edition of classic CS:GO weapon skins', 250, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0]),
  makeCase('esports-2013-winter', 'eSports 2013 Winter Case', 'CS:GO', 'Winter themed eSports support case', 250, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0]),
  makeCase('winter-offensive', 'Winter Offensive Weapon Case', 'CS:GO', 'Community winter finishes', 250, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0]),
  makeCase('csgo-weapon-3', 'CS:GO Weapon Case 3', 'CS:GO', 'Pistol focused classic weapon case', 250, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0]),
  makeCase('phoenix', 'Operation Phoenix Weapon Case', 'CS:GO', 'Highly popular Operation Phoenix skins', 250, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0]),
  makeCase('huntsman', 'Huntsman Weapon Case', 'CS:GO', 'Features the Huntsman knife finish', 250, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0]),
  makeCase('breakout', 'Operation Breakout Weapon Case', 'CS:GO', 'Introduced the Butterfly Knife', 250, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0]),
  makeCase('esports-2014-summer', 'eSports 2014 Summer Case', 'CS:GO', 'Summer action eSports case', 250, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0]),
  makeCase('vanguard', 'Operation Vanguard Weapon Case', 'CS:GO', 'Vanguard community collection', 250, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0]),
  makeCase('chroma', 'Chroma Case', 'CS:GO', 'Introduced new knife finishes like Doppler', 250, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0]),
  makeCase('chroma-2', 'Chroma 2 Case', 'CS:GO', 'Second Chroma generation', 250, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0]),
  makeCase('falchion', 'Falchion Case', 'CS:GO', 'Introduced the Falchion Knife', 250, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0]),
  makeCase('shadow', 'Shadow Case', 'CS:GO', 'Features the Shadow Daggers', 250, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0]),
  makeCase('revolver', 'Revolver Case', 'CS:GO', 'Added during the R8 Revolver update', 250, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0]),
  makeCase('wildfire', 'Operation Wildfire Case', 'CS:GO', 'Introduced the Bowie Knife', 250, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0]),
  makeCase('chroma-3', 'Chroma 3 Case', 'CS:GO', 'Third generation of Chroma skins', 250, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0]),
  makeCase('gamma', 'Gamma Case', 'CS:GO', 'Introduced Gamma Doppler knives', 250, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0]),
  makeCase('gamma-2', 'Gamma 2 Case', 'CS:GO', 'Second generation Gamma skins', 250, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0]),
  makeCase('glove', 'Glove Case', 'CS:GO', 'The first case to contain gloves instead of knives', 250, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0]),
  makeCase('spectrum', 'Spectrum Case', 'CS:GO', 'Chroma finishes for Gen 2 knives', 250, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0]),
  makeCase('hydra', 'Operation Hydra Case', 'CS:GO', 'Operation Hydra community collection', 250, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0]),
  makeCase('spectrum-2', 'Spectrum 2 Case', 'CS:GO', 'Second generation of Spectrum skins', 250, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0]),
  makeCase('clutch', 'Clutch Case', 'CS:GO', 'Introduced a massive new series of gloves', 250, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0]),
  makeCase('horizon', 'Horizon Case', 'CS:GO', 'Introduced 4 new knife types including Navaja and Talon', 250, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0]),
  makeCase('danger-zone', 'Danger Zone Case', 'CS:GO', 'Released alongside the Battle Royale mode update', 250, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0]),
  makeCase('prisma', 'Prisma Case', 'CS:GO', 'Chroma finishes for Horizon knives', 250, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0]),
  makeCase('cs20', 'CS20 Case', 'CS:GO', 'Celebrates 20 years of Counter-Strike', 250, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0]),
  makeCase('shattered-web', 'Shattered Web Case', 'CS:GO', 'Contains finishes like the Paracord and Skeleton knives', 250, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0]),
  makeCase('prisma-2', 'Prisma 2 Case', 'CS:GO', 'Anime and vivid styling aesthetics', 250, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0]),
  makeCase('fracture', 'Fracture Case', 'CS:GO', 'Shattered Web knife patterns returned', 250, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0]),
  makeCase('broken-fang', 'Operation Broken Fang Case', 'CS:GO', 'Introduced new glove finishes', 250, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0]),
  makeCase('snakebite', 'Snakebite Case', 'CS:GO', 'Community creations focusing on vibrant design', 250, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0]),
  makeCase('riptide', 'Operation Riptide Case', 'CS:GO', 'Operation Riptide collection', 250, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0]),
  makeCase('dreams-nightmares', 'Dreams & Nightmares Case', 'CS:GO', 'Art contest winner collection', 250, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0]),
  makeCase('recoil', 'Recoil Case', 'CS:GO', 'Released in 2022 featuring new community styles', 250, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0]),
  makeCase('revolution', 'Revolution Case', 'CS:GO', 'Contains highly anticipated anime skins', 250, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0]),
  makeCase('kilowatt', 'Kilowatt Case', 'CS:GO', 'First CS2 official weapon case', 250, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0]),
  makeCase('gallery', 'Gallery Case', 'CS:GO', 'Community artist showcase skins', 250, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0]),
  makeCase('fever', 'Fever Case', 'CS:GO', 'Vibrant chaotic weapon styles', 250, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0]),
  makeCase('term-genesis', 'Sealed Genesis Terminal', 'CS:GO', 'Ultra rare sealed lore terminal', 5000, [60, 20, 10, 5, 3, 2]),
  makeCase('term-dead-hand', 'Sealed Dead Hand Terminal', 'CS:GO', 'Nuclear deterrent sealed lore terminal', 5000, [60, 20, 10, 5, 3, 2]),

  // Premium Cases (cost 0, but purchased with real money or ads)
  makeCase('glass-heaven-vault', 'The Glass Heaven Vault', 'Premium', 'Transparent hardware and ethereal high-energy artifacts', 0, [20, 25, 20, 20, 10, 5], true, 0.99),
  makeCase('808-god-aura', '808 God Aura', 'Premium', 'Pure bass-boosted legendary Phonk history and rare hardware', 0, [15, 20, 25, 25, 12, 3], true, 1.49),
  makeCase('zero-day-exploit', 'Zero-Day Exploit', 'Premium', 'Unreleased tech and the most powerful digital assets on Wikipedia', 0, [10, 15, 25, 30, 15, 5], true, 2.99),
  makeCase('liquid-gold-fuel', 'Liquid Gold Fuel', 'Premium', 'The ultimate Energy Vault collection of one-of-a-kind extinct drinks', 0, [25, 25, 15, 15, 15, 5], true, 1.99),
  makeCase('hyper-drift-singularity', 'Hyper-Drift Singularity', 'Premium', 'Automotive masterpieces that exist only in theory and concept', 0, [10, 10, 30, 30, 15, 5], true, 3.49),
  makeCase('black-diamond-algorithm', 'Black Diamond Algorithm', 'Premium', 'Precision-engineered items and rare geological anomalies', 0, [5, 10, 35, 35, 10, 5], true, 4.99),
  makeCase('overclocked-reality', 'Overclocked Reality', 'Premium', 'Artifacts that push the CPU limits of the universe itself', 0, [12, 18, 20, 25, 20, 5], true, 2.49),
  makeCase('carbon-fiber-dynasty', 'Carbon Fiber Dynasty', 'Premium', 'Ultra-light, ultra-expensive racing and tech components', 0, [15, 15, 20, 30, 15, 5], true, 1.99),
  makeCase('neon-genesis-protocol', 'Neon Genesis Protocol', 'Premium', 'Futuristic city-states and cyberpunk technological breakthroughs', 0, [10, 20, 20, 30, 15, 5], true, 2.49),
  makeCase('producers-grail', 'The Producer’s Grail', 'Premium', 'The rarest synthesizers and audio gear ever documented on Wikipedia', 0, [5, 10, 20, 40, 20, 5], true, 4.99),
  makeCase('absolute-perfection', 'The Absolute Perfection', 'Premium', 'Guarantees the highest tier Exceedingly Rare items 100% of the time.', 0, [0, 0, 0, 0, 0, 100], true, 49.99),
  makeCase('covert-masterpiece', 'The Covert Masterpiece', 'Premium', 'Guarantees Covert items 100% of the time.', 0, [0, 0, 0, 0, 100, 0], true, 24.99),
];

export function getWearInfo(durability: number) {
  if (durability <= 0.07) return { label: 'Factory New', multiplier: 2.0 };
  if (durability <= 0.15) return { label: 'Minimal Wear', multiplier: 1.5 };
  if (durability <= 0.38) return { label: 'Field-Tested', multiplier: 1.0 };
  if (durability <= 0.45) return { label: 'Well-Worn', multiplier: 0.8 };
  return { label: 'Battle-Scarred', multiplier: 0.5 };
}

export function drawRarity(caseId: string) {
  const caseData = CASES.find(c => c.id === caseId) || CASES[0];
  const rand = Math.random();
  let cumulative = 0;
  for (const odd of caseData.odds) {
    cumulative += odd.chance;
    if (rand <= cumulative) {
      return odd.rarity;
    }
  }
  return caseData.odds[caseData.odds.length - 1].rarity;
}

export function generateDurability() {
  return Math.random();
}

export function calculateValue(rarityId: string, wearMultiplier: number, caseData: CaseType) {
  if (caseData && caseData.cost > 0) {
    const cost = caseData.cost;
    let baseMultiplier = 0.15;
    
    // User constraints:
    // Consumer (Gray): low return
    // Mil-Spec (Blue): ~ 1/2 to 3/5 what you payed
    // Restricted (Purple) & above: > 1 what you payed even at worst wear
    
    switch (rarityId) {
      case 'consumer':
        baseMultiplier = 0.18; // 0.18 * 0.821 (avg wear) = ~15% return
        break;
      case 'mil-spec':
        baseMultiplier = 0.75; // 0.75 * 0.821 = ~61% return
        break;
      case 'restricted':
        baseMultiplier = 6.0; // 6.0 * 0.5 (worst wear) = 3.0x return (Huge buff for purple)
        break;
      case 'classified':
        baseMultiplier = 18.0; // 18.0 * 0.5 = 9.0x return
        break;
      case 'covert':
        baseMultiplier = 60.0; // 60.0 * 0.5 = 30.0x return
        break;
      case 'gold':
        baseMultiplier = 350.0; // 350.0 * 0.5 = 175.0x return
        break;
    }
    
    // Final value is the case cost times the specific multiplier for that rarity, then multiplied by wear.
    const finalValue = cost * baseMultiplier * wearMultiplier;
    
    return Math.max(1, Math.round(finalValue));
  }

  // Fallback for free cases (cost 0)
  switch(rarityId) {
    case 'consumer': return Math.max(1, Math.round(5 * wearMultiplier));
    case 'mil-spec': return Math.max(1, Math.round(30 * wearMultiplier));
    case 'restricted': return Math.max(1, Math.round(300 * wearMultiplier));
    case 'classified': return Math.max(1, Math.round(1500 * wearMultiplier));
    case 'covert': return Math.max(1, Math.round(8000 * wearMultiplier));
    case 'gold': return Math.max(1, Math.round(40000 * wearMultiplier));
  }
  
  return 1;
}

export async function fetchRandomWikiArticle(caseCategory?: string) {
  try {
    let title = "Unknown Article";
    let image = "";
    let pageId = 0;

    // Fetch contextually relevant article via wiki search if category isn't Random
    if (caseCategory && caseCategory !== 'Random') {
      const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(caseCategory)}&srlimit=20&format=json&origin=*`);
      const searchData = await searchRes.json();
      
      if (searchData.query?.search?.length > 0) {
        const randomHit = searchData.query.search[Math.floor(Math.random() * searchData.query.search.length)];
        title = randomHit.title;
        pageId = randomHit.pageid;
        
        // Follow up to get image summary
        const summaryRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
        const summaryData = await summaryRes.json();
        
        image = summaryData.thumbnail?.source || `https://picsum.photos/seed/${encodeURIComponent(title)}/400/400`;
        
        return { title, image, pageId };
      }
    }
    
    // Fallback or purely random case
    const res = await fetch('https://en.wikipedia.org/api/rest_v1/page/random/summary');
    const data = await res.json();
    return {
      title: data.title,
      image: data.thumbnail?.source || `https://picsum.photos/seed/${encodeURIComponent(data.title)}/400/400`,
      pageId: data.pageid
    };
  } catch (error) {
    console.error("Failed to fetch wiki article", error);
    return {
      title: "Encrypted Artifact",
      image: 'https://picsum.photos/seed/encrypted/400/400',
      pageId: 0
    };
  }
}

