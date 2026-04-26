import { Item } from '../types';

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

export interface CaseFocus {
  id: string;
  name: string;
  searchQuery: string;
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
  focuses?: CaseFocus[];
  csgoDrops?: Record<string, {name: string, image: string}[]>;
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

function makeCase(id: string, name: string, category: string, desc: string, cost: number, [c, m, r, cl, co, e]: number[], isPremium?: boolean, realMoneyPrice?: number, focuses?: CaseFocus[], csgoDrops?: Record<string, {name: string, image: string}[]>): CaseType {
  let imagePrompt = `A 3d render of a video game loot box case themed around ${name}, ${category} category, highly detailed, glowing`;
  
  if (category === 'Transport') {
    imagePrompt = `A 3d render of a loot box case styled like a high performance vehicle, carbon fiber, neon underglow, highly detailed, 4k`;
  } else if (category === 'CS:GO') {
    imagePrompt = `A 3d render of a military weapon case, tactical, olive drab, ${name}, highly detailed lootbox`;
  } else if (category === 'Premium') {
    imagePrompt = `A hyper-realistic 3d render of an ultra rare premium VIP loot box case themed around ${name}, glowing golden and diamonds, highest quality`;
  } else if (category === 'Random') {
    imagePrompt = `A mysterious transparent glass 3d video game loot box case containing a glowing question mark, highly detailed`;
  } else if (category === 'Tech') {
    imagePrompt = `A 3d render of a futuristic cyberpunk video game loot box case, glowing neon, circuit boards, highly detailed`;
  } else if (category === 'Mystery') {
    imagePrompt = `A 3d render of a shadowy, supernatural, encrypted loot box case, cinematic lighting, lovecraftian geometry, highly detailed`;
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
    focuses,
    csgoDrops,
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

export const SECRET_BILLION_CASE: CaseType = makeCase(
  'secret-billion', 
  'The Sovereign Reliquary', 
  'Secret', 
  'A case forged in the heart of a dying star. Only for the true elite.', 
  1000000000, 
  [0, 50, 25, 15, 8, 2]
);

export const CASES: CaseType[] = [

  makeCase('free', 'Wikipedia Roulette', 'Random', 'The ultimate random drop generator', 0, [60, 25, 10, 3.5, 1.25, 0.25], false, undefined, [
    { id: 'f1', name: 'Completely Random', searchQuery: '' },
    { id: 'f2', name: 'Niche: Obscure European Authors', searchQuery: 'incategory:"Albanian_writers" OR incategory:"Romanian_writers"' },
    { id: 'f3', name: 'Niche: Extinct Oddities', searchQuery: 'incategory:"Extinct_animals"' },
    { id: 'f4', name: 'Niche: Unsolved Local Mysteries', searchQuery: 'incategory:"Unexplained_disappearances"' },
    { id: 'f5', name: 'Niche: Discontinued Snacks', searchQuery: 'incategory:"Defunct_consumer_brands" OR incategory:"Discontinued_foods"' },
    { id: 'f6', name: 'Niche: Failed Local Inventions', searchQuery: 'incategory:"Obsolete_technologies" OR incategory:"Failed_inventions"' }
  ]),

  makeCase('wiki-enhanced', 'Wiki Roulette+', 'Random', 'Better odds than the basic roulette, at a small price.', 150, [50, 25, 15, 6, 3, 1], false, undefined, [
    { id: 'we1', name: 'Random Selection', searchQuery: '' },
    { id: 'we2', name: 'Elite Hardware', searchQuery: 'incategory:"Spacecraft" OR incategory:"Supercomputers"' },
    { id: 'we3', name: 'Precious Stones', searchQuery: 'incategory:"Gemstones" OR incategory:"Minerals"' },
    { id: 'we4', name: 'Experimental Tech', searchQuery: 'incategory:"Neurotechnology" OR incategory:"Stealth_aircraft"' },
    { id: 'we5', name: 'Luxury Icons', searchQuery: 'incategory:"Luxury_brands" OR incategory:"Haute_couture"' }
  ]),
  makeCase('wiki-professional', 'Wiki Roulette Pro', 'Random', 'Significantly boosted odds for high-tier Wikipedia drops.', 750, [30, 30, 20, 10, 7, 3], false, undefined, [
    { id: 'wp1', name: 'Professional Random', searchQuery: '' },
    { id: 'wp2', name: 'Quantum Realm', searchQuery: 'incategory:"Quantum_physics" OR "Schrödinger\'s cat"' },
    { id: 'wp3', name: 'Hyper-Engineering', searchQuery: 'incategory:"Particle_accelerators" OR incategory:"Megastructures"' },
    { id: 'wp4', name: 'Astrophysical Wonders', searchQuery: 'incategory:"Quasars" OR incategory:"Pulsars"' },
    { id: 'wp5', name: 'Synthesized Rarity', searchQuery: 'incategory:"Synthetic_elements" OR incategory:"Isotopes"' }
  ]),
  makeCase('wiki-god-tier', 'Wiki Roulette Ultra', 'Random', 'The ultimate Wikipedia experience. Zero common drops guaranteed.', 3000, [0, 20, 30, 25, 15, 10], false, undefined, [
    { id: 'wu1', name: 'God Tier Random', searchQuery: '' },
    { id: 'wu2', name: 'Cosmic Singularity', searchQuery: 'incategory:"Black_holes" OR "event horizon"' },
    { id: 'wu3', name: 'Fundamental Reality', searchQuery: 'incategory:"Physical_constants" OR "Standard Model"' },
    { id: 'wu4', name: 'Lost Masterpieces', searchQuery: 'incategory:"Stolen_art_and_antiques" OR incategory:"Lost_works_of_art"' },
    { id: 'wu5', name: 'Kardashev Civilization', searchQuery: 'incategory:"Megastructures" OR "Dyson sphere"' }
  ]),

  makeCase('automotive-collection', 'Automotive Collection', 'Automotive', 'Everything from JDM Legends, European Exotics, Barn Finds, and Hypercars', 800, [60, 25, 10, 3.5, 1.25, 0.25], false, undefined, [
    { id: 'a1', name: 'JDM Classics', searchQuery: 'incategory:"Japanese_sports_cars" OR incategory:"Sports_cars_of_Japan" OR JDM car' },
    { id: 'a2', name: 'European Exotics', searchQuery: 'supercar OR hypercar OR incategory:"Supercars"' },
    { id: 'a3', name: 'American Muscle', searchQuery: 'incategory:"Muscle_cars"' },
    { id: 'a4', name: 'Barn Finds', searchQuery: 'barn find car OR rare vintage car' },
    { id: 'a5', name: 'F1 History', searchQuery: 'incategory:"Formula_One_cars"' }
  ]),

  makeCase('science-tech-collection', 'Science & Tech Collection', 'Science', 'Particle Physics, Sentient AI, Supercomputers, and Bio-Hacking', 900, [60, 25, 10, 3.5, 1.25, 0.25], false, undefined, [
    { id: 'st1', name: 'Quantum Physics', searchQuery: 'incategory:"Quantum_mechanics"' },
    { id: 'st2', name: 'Sentient AI', searchQuery: 'artificial general intelligence OR incategory:"Artificial_intelligence"' },
    { id: 'st3', name: 'Supercomputers', searchQuery: 'incategory:"Supercomputers"' },
    { id: 'st4', name: 'Bio-Hacking', searchQuery: 'CRISPR OR genetic engineering OR incategory:"Cloning"' },
    { id: 'st5', name: 'Toxic Elements', searchQuery: 'incategory:"Toxic_chemicals" OR radioactive element' }
  ]),

  makeCase('history-culture-collection', 'History & Culture', 'History', 'Lost Civilizations, Secret Societies, and Ancient Deities', 700, [60, 25, 10, 3.5, 1.25, 0.25], false, undefined, [
    { id: 'hc1', name: 'Lost Civilizations', searchQuery: 'incategory:"Lost_cities_and_towns" OR ancient civilization' },
    { id: 'hc2', name: 'Secret Societies', searchQuery: 'incategory:"Secret_societies"' },
    { id: 'hc3', name: 'Ancient Deities', searchQuery: 'incategory:"Deities" OR incategory:"Legendary_creatures"' },
    { id: 'hc4', name: 'Cold War', searchQuery: 'incategory:"Cold_War_espionage"' },
    { id: 'hc5', name: 'Roman Empire', searchQuery: 'incategory:"Roman_Empire"' }
  ]),

  makeCase('nature-earth-collection', 'Nature & Earth', 'Nature', 'Abyssal Monsters, Extremophiles, and Radioactive Zones', 850, [60, 25, 10, 3.5, 1.25, 0.25], false, undefined, [
    { id: 'ne1', name: 'Abyssal Monsters', searchQuery: 'incategory:"Deep_sea_fish" OR incategory:"Sea_monsters"' },
    { id: 'ne2', name: 'Extremophiles', searchQuery: 'incategory:"Extremophiles"' },
    { id: 'ne3', name: 'Radioactive Zones', searchQuery: 'incategory:"Radioactive_places"' },
    { id: 'ne4', name: 'Natural Disasters', searchQuery: 'incategory:"Natural_disasters"' },
    { id: 'ne5', name: 'Ancient Flora', searchQuery: 'incategory:"Individual_trees"' }
  ]),

  makeCase('mystery-anomalies-collection', 'Mystery & Anomalies', 'Mystery', 'Dark Web, Cryptids, and Cosmic Signals', 1000, [60, 25, 10, 3.5, 1.25, 0.25], false, undefined, [
    { id: 'ma1', name: 'Dark Web', searchQuery: 'incategory:"Dark_web" OR incategory:"Hacking_in_the_1990s"' },
    { id: 'ma2', name: 'Cryptids', searchQuery: 'incategory:"Cryptids"' },
    { id: 'ma3', name: 'Cosmic Signals', searchQuery: 'numbers station OR WOW! signal OR radio anomaly' },
    { id: 'ma4', name: 'Bermuda Triangle', searchQuery: 'incategory:"Ghost_ships" OR Bermuda triangle' },
    { id: 'ma5', name: 'Paradoxes', searchQuery: 'incategory:"Paradoxes"' }
  ]),

  makeCase('gaming-internet-collection', 'Gaming & Internet', 'Gaming', 'Vaporware, Esports Legends, and Internet Meme Archives', 500, [60, 25, 10, 3.5, 1.25, 0.25], false, undefined, [
    { id: 'gi1', name: 'Vaporware', searchQuery: 'incategory:"Cancelled_video_games" OR vaporware' },
    { id: 'gi2', name: 'Esports Legends', searchQuery: 'incategory:"Esports_players"' },
    { id: 'gi3', name: 'Internet Archives', searchQuery: 'incategory:"Internet_memes"' },
    { id: 'gi4', name: 'Speedrunning', searchQuery: 'speedrunning video game glitch' },
    { id: 'gi5', name: 'Retro Arcades', searchQuery: 'incategory:"Arcade_video_games"' }
  ]),

  makeCase('space-cosmos-collection', 'Space & Cosmos', 'Space', 'Mars Colonization, Stellar Remnants, and the Kardashev Scale', 1100, [60, 25, 10, 3.5, 1.25, 0.25], false, undefined, [
    { id: 'sc1', name: 'Mars Colonization', searchQuery: 'Mars colonization space settlement' },
    { id: 'sc2', name: 'Stellar Remnants', searchQuery: 'incategory:"Supernovae" OR pulsar OR black hole' },
    { id: 'sc3', name: 'Kardashev Scale', searchQuery: 'Kardashev scale megastructure Dyson sphere' },
    { id: 'sc4', name: 'Cosmic Anomalies', searchQuery: 'astronomical anomaly OR dark matter' },
    { id: 'sc5', name: 'Deep Space Probes', searchQuery: 'incategory:"Space_probes"' }
  ]),

  makeCase('music-media-collection', 'Music & Media', 'Music', 'Analog Synths, Cult Cinema, and Producers Grails', 450, [60, 25, 10, 3.5, 1.25, 0.25], false, undefined, [
    { id: 'mm1', name: 'Analog Synths', searchQuery: 'incategory:"Synthesizers"' },
    { id: 'mm2', name: 'Cult Cinema', searchQuery: 'incategory:"Cult_films"' },
    { id: 'mm3', name: '80s Synthpop', searchQuery: 'incategory:"Synth-pop_groups"' },
    { id: 'mm4', name: 'Hip Hop Roots', searchQuery: 'incategory:"History_of_hip_hop"' },
    { id: 'mm5', name: 'Blockbuster Cinema', searchQuery: 'incategory:"Blockbuster_films"' }
  ]),

  makeCase('conflict-engineering-collection', 'Conflict & Engineering', 'Engineering', 'Naval Leviathans, Firepower Evolution, and Black Ops', 950, [60, 25, 10, 3.5, 1.25, 0.25], false, undefined, [
    { id: 'ce1', name: 'Naval Leviathans', searchQuery: 'incategory:"Aircraft_carriers" OR nuclear submarine' },
    { id: 'ce2', name: 'Firepower Evolution', searchQuery: 'incategory:"Firearms"' },
    { id: 'ce3', name: 'Black Ops', searchQuery: 'incategory:"Special_forces_of_the_United_States" OR black operation' },
    { id: 'ce4', name: 'Mega-Skyscrapers', searchQuery: 'incategory:"Skyscrapers"' },
    { id: 'ce5', name: 'Supersonic Jets', searchQuery: 'incategory:"Supersonic_aircraft"' }
  ]),

  makeCase('lifestyle-wealth-collection', 'Lifestyle & Wealth', 'Lifestyle', 'Haute Couture, Economic Ruin, and Rare Beverages', 650, [60, 25, 10, 3.5, 1.25, 0.25], false, undefined, [
    { id: 'lw1', name: 'Haute Couture', searchQuery: 'incategory:"Haute_couture_brands"' },
    { id: 'lw2', name: 'Economic Ruin', searchQuery: 'incategory:"Hyperinflation" OR economic crisis' },
    { id: 'lw3', name: 'Rare Beverages', searchQuery: 'incategory:"Discontinued_beverages" OR energy drink' },
    { id: 'lw4', name: 'Lost Masterpieces', searchQuery: 'incategory:"Lost_paintings" OR stolen art' },
    { id: 'lw5', name: 'Infamous Crimes', searchQuery: 'incategory:"Unidentified_serial_killers" OR notorious crime' }
  ]),


  makeCase('gastronomy-culinary-collection', 'Gastronomy & Culinary', 'Food', 'Ancient recipes, bizarre delicacies, and world-class kitchens', 600, [60, 25, 10, 3.5, 1.25, 0.25], false, undefined, [
    { id: 'gc1', name: 'Bizarre Delicacies', searchQuery: 'incategory:"Delicacies" OR bizarre food' },
    { id: 'gc2', name: 'Ancient Recipes', searchQuery: 'incategory:"Ancient_Roman_cuisine" OR medieval food' },
    { id: 'gc3', name: 'Michelin Star History', searchQuery: 'incategory:"Michelin_Guide_starred_restaurants"' },
    { id: 'gc4', name: 'Scoville Extremes', searchQuery: 'incategory:"Chili_peppers" OR Scoville scale' },
    { id: 'gc5', name: 'Poisonous Foods', searchQuery: 'incategory:"Poisonous_plants" OR fugu' }
  ]),

  makeCase('adrenaline-athletics-collection', 'Adrenaline & Athletics', 'Sports', 'Extreme mountaineering, underground fights, and death-defying stunts', 750, [60, 25, 10, 3.5, 1.25, 0.25], false, undefined, [
    { id: 'aa1', name: 'Extreme Mountaineering', searchQuery: 'incategory:"Mountaineering_deaths" OR Mount Everest' },
    { id: 'aa2', name: 'Death-Defying Stunts', searchQuery: 'incategory:"Daredevils" OR stunts' },
    { id: 'aa3', name: 'Underground Fight Clubs', searchQuery: 'bare-knuckle boxing OR underground fighting' },
    { id: 'aa4', name: 'Rare Martial Arts', searchQuery: 'incategory:"Martial_arts"' },
    { id: 'aa5', name: 'Olympic Controversies', searchQuery: 'incategory:"Olympic_scandals"' }
  ]),

  makeCase('occult-esoterica-collection', 'Occult & Esoterica', 'Occult', 'Alchemy, ancient grimoires, demonology, and legendary cults', 1000, [60, 25, 10, 3.5, 1.25, 0.25], false, undefined, [
    { id: 'oe1', name: 'Alchemy & Elixirs', searchQuery: 'incategory:"Alchemy"' },
    { id: 'oe2', name: 'Ancient Grimoires', searchQuery: 'incategory:"Grimoires"' },
    { id: 'oe3', name: 'Demonology', searchQuery: 'incategory:"Demonology"' },
    { id: 'oe4', name: 'Witch Trials', searchQuery: 'incategory:"Witch_trials"' },
    { id: 'oe5', name: 'Legendary Cults', searchQuery: 'incategory:"Doomsday_cults"' }
  ]),

  makeCase('medical-anomalies-collection', 'Medical & Anomalies', 'Medicine', 'Historic plagues, bionic prosthetics, and bizarre syndromes', 850, [60, 25, 10, 3.5, 1.25, 0.25], false, undefined, [
    { id: 'md1', name: 'Historic Plagues', searchQuery: 'incategory:"Pandemics" OR historically severe plagues' },
    { id: 'md2', name: 'Bizarre Syndromes', searchQuery: 'incategory:"Rare_diseases"' },
    { id: 'md3', name: 'Medieval Medicine', searchQuery: 'incategory:"History_of_medicine" OR plague doctor' },
    { id: 'md4', name: 'Bionic Prosthetics', searchQuery: 'incategory:"Bionics" OR brain-computer interface' },
    { id: 'md5', name: 'Medical Miracles', searchQuery: 'incategory:"Medical_miracles"' }
  ]),

  makeCase('cs-go-weapon-case', 'CS:GO Weapon Case', 'CS:GO', 'The original 2013 collection that started it all', 500, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0], false, undefined, undefined, {
    MIL_SPEC: [{"name":"AUG Wings","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwi5Hf9Ttk6fevfKxoMuOsD3KX_uJ_t-l9AX7qzE5_sGmEw9uoJCrBOgMoDsN2ReMI4EPrm4fvY-m04ASPgt8Uz3_gznQePzx-iqc"},{"name":"MP7 Skulls","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8jsHf9Ttk_Pm7ZKh-H_yaCW-Ej7l35OBoTCrmzUQht2mDwon7cHuWPFUlDcFxQ7EDtxbpx4W1Y-LltAfAy9USYNky6pY"},{"name":"SG 553 Ultraviolet","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"odds: Mil-Spec 79.92%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Restricted 15.98%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Classified 3.20%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Covert 0.64%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Exceedingly Rare 0.26%.","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"}],
    RESTRICTED: [{"name":"Glock-18 Dragon Tattoo","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL2kpnj9h1a4s2qeqVqL_6sCWufwuVJvOhuRz39xUl-6miDzI37dHyXOlIkA8MmROVfshO9w9G1Ye-ztgPX34tEyi74jjQJsHi_DRfxVg"},{"name":"M4A1-S Dark Water","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwjFS4_ega6F_H_GeMX2Vw_x3j-VoXSKMmRQguynLzI6td3-TPQAlD5slR-EJ5hDux9XmMe7i71CI2t8UzSuthi9OvSlo6vFCD_TltxSe0A"},{"name":"USP-S Dark Water","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLkjYbf7itX6vytbbZSIf2sFGKS0-9JtOB7RBa_nBovp3OHy9v8J3vFbgIhC5UmQ7UIsxm7wNDnNr_rswOMiNlGmCWoiH9Juis9_a9cBl2xnYuj"}],
    CLASSIFIED: [{"name":"AK-47 Case Hardened","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiNK0P2nZKFpH_yaCW-Ej7sk5bE8Sn-2lEpz4zndzoyvdHuUPwFzWZYiE7EK4Bi4k9TlY-y24FbAy9USGSiZd5Q"},{"name":"Desert Eagle Hypnotic","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"}],
    COVERT: [{"name":"AWP Lightning Strike","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwiYbf_C9k4_upYLBjKf6UMWaH0dF6ueZhW2frwU1_sW2EmNyvc32RZwMpCpcjQ-EJ4xbtmt3gYezk4wzb3tpAy3mrkGoXubsGIfVN"}],
    EXCEEDINGLY_RARE: [
      { name: '★ Karambit | Fade', image: 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbMs8Hbq9D12fzhA_-G0mImZmvHMNanVjjoI65wl0r-RpoqsiVDh_hZvNWijcYCVJFI6NAzWrwfvlOu60ZG7uZXYiSw0X2R_D3k' },
      { name: '★ Butterfly Knife | Crimson Web', image: 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKghovbMs8Hbq9D12fzhA_-K0llOWhPP2Iq2Ewz1cvp9ziuuSrIrx0ALsrUYrYzr2IIGUcFBoYgyF_wTolbnn0JC96prXiSw0VymJ-F0' }
    ]
  }),
  makeCase('esports-2013-case', 'eSports 2013 Case', 'CS:GO', 'The first community-contributed case supporting the competitive scene', 500, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0], false, undefined, undefined, {
    MIL_SPEC: [{"name":"M4A4 Faded Zebra","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwjFL0OirarZsI_GeMWWH_uJ_t-l9AXu3zBkhsDyHz4z9dXmVagJzW8MiQbFetBfrkNHhZbjr51CMiN8TyS_gznQeEoYBjXk"},{"name":"MAG-7 Memento","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8n5G3wipC0PutZ7dsKPWXHGie_uJ_t-l9ASjlzRl34WnUzN6tJy-eOg50C5N1TLYLthaxm4HlZbiz4AXXjNpDmCXgznQeeQk0p-w"},{"name":"FAMAS Doomkeeper","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"odds: Mil-Spec 79.92%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Restricted 15.98%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Classified 3.20%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Covert 0.64%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Exceedingly Rare 0.26%.","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"}],
    RESTRICTED: [{"name":"Galil AR Orange DDPAT","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"P250 Splash","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLhzMOwwjFL0OG-ZKV-KM-DXDLA_uJ_t-l9AXDrxh4i62vTzNyrc3zEP1MpWJN2EOMN5kTpl9K2Zb62slTdi4NMzC7gznQe9E-5MVM"},{"name":"Sawed-Off Orange DDPAT","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLin4Hl-S1d6c2mcZtpJOCSGlif0-94t-RWQyC0nQlp4GyAzoqsdSmWaFJyD5UhEeFcsBm-ktK0M7nj7wKI394Xn3-vhisfujErvbhk58vgGA"}],
    CLASSIFIED: [{"name":"AK-47 Red Laminate","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wipC0POlPPNhIf2sAm6Xyfo4tucxS3rjwRx_42zRwo6pdSnCPwAmX5ohFOIJsUTqwdThNOi0s1TajZUFk3t5vdi_Cw"},{"name":"AWP Boom","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwiYbf9Ttk7f6vZZt-Kf2DAmKvzedxuPUnTX7mkxhy62iDzYqhdiqXbw4oWZEkE-IDsRa9lIXlMejktFOMi49MmDK-0H2AgUnw_w"}],
    COVERT: [{"name":"P90 Death by Kitty","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLhx8bf_jdk7PO6e694LPyAMXfJkdF6ueZhW2fgkUh042jUnN2geSqTaFN2CcQmQuRfsBXtxtfkN7mztASIg91Bniv8kGoXucYQxgOQ"}],
    EXCEEDINGLY_RARE: [
      { name: '★ Karambit | Fade', image: 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbMs8Hbq9D12fzhA_-G0mImZmvHMNanVjjoI65wl0r-RpoqsiVDh_hZvNWijcYCVJFI6NAzWrwfvlOu60ZG7uZXYiSw0X2R_D3k' },
      { name: '★ Butterfly Knife | Crimson Web', image: 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKghovbMs8Hbq9D12fzhA_-K0llOWhPP2Iq2Ewz1cvp9ziuuSrIrx0ALsrUYrYzr2IIGUcFBoYgyF_wTolbnn0JC96prXiSw0VymJ-F0' }
    ]
  }),
  makeCase('operation-bravo-case', 'Operation Bravo Case', 'CS:GO', 'A legendary collection featuring the most expensive non-knife skin in history', 500, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0], false, undefined, undefined, {
    MIL_SPEC: [{"name":"Dual Berettas Black Limba","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"G3SG1 Azure Zebra","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL2zYXnrB1I_820baZ_IfOSA1iSzftzj-1gSCGn20tz6jjXnN-pJSiUOAIlD5FyR-FYuhbtwdSyMb_l4VPajI1FyCSo2iJXrnE87owZcUA"},{"name":"M4A4 Faded Zebra","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwjFL0OirarZsI_GeMWWH_uJ_t-l9AXu3zBkhsDyHz4z9dXmVagJzW8MiQbFetBfrkNHhZbjr51CMiN8TyS_gznQeEoYBjXk"},{"name":"MP9 Hypnotic","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8js_f_CNk-fe8fK1qL8-fB2CY1aAutbY-TXm2wkRz5zjdzNytIi3GbVQhW8ElRu8L5hK7mtfvNbu04lGMlcsbmn-Uk_5D"},{"name":"Nova Tempest","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL_kYDhwipC0OGrabdkJPWsDHWR1-FJvOhuRz39xUUk4jiHyt_9cXzGZwV2CJJyQbYN4Ua9wdPiZr6x4FTcjIhMzXmsjjQJsHjYOlWGdQ"},{"name":"Galil AR Shattered","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"SG 553 Wave Spray","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"odds: Mil-Spec 79.92%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Restricted 15.98%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Classified 3.20%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Covert 0.64%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Exceedingly Rare 0.26%.","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"}],
    RESTRICTED: [{"name":"AWP Graphite","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwiYbf_C9k7OC7ZbRhJc-RHGaGztF6ueZhW2e2k0l2sW_WzN7_cS6SbgV1CsF3TOEI4EOwloGzNLzg5g3fiIpHxC78kGoXuTqeOjwH"},{"name":"P2000 Ocean Foam","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL5lYayrXIL0POjV6t-M_mVF1iSzftzj_E7H3njqh81siuKpYPwJiPTcA91W5N0EOMNskGwkt3gP-vh41GNiNpDn3r83ShL6itj4bsKA6Im-_XJz1aWVAZrXOc"},{"name":"USP-S Overgrowth","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLkjYbf7itX6vytbbZSKOmsHW6VxutJsvNoWSaMmRQguynLytyqdy2eaVUgAsB0QeIIsxfuldy2MO3gtFSI2ooRzSiq3HxA7SlvtfFCD_RGjmYWyQ"}],
    CLASSIFIED: [{"name":"Desert Eagle Golden Koi","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"P90 Emerald Dragon","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLhx8bf_jdk6-Cvb6tjH-DKXliS0-9gv95lRi67gVMm4m3Vzdmqci-SO1clX8Z1QeYO5xi5mtTuPu7l4FDc2o4TmH32jC1P8G81tLxM49od"}],
    COVERT: [{"name":"AK-47 Fire Serpent","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiFO0PSneqF-JeKDC2mE_u995LZWTTuygxIYvzSCkpu3cnvFPQB2DpUkROFY4Rntw93lP7i241DbiI1BxSuviHlKunk_6-sHU71lpPMTRLyP4Q"}],
    EXCEEDINGLY_RARE: [
      { name: '★ Karambit | Fade', image: 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbMs8Hbq9D12fzhA_-G0mImZmvHMNanVjjoI65wl0r-RpoqsiVDh_hZvNWijcYCVJFI6NAzWrwfvlOu60ZG7uZXYiSw0X2R_D3k' },
      { name: '★ Butterfly Knife | Crimson Web', image: 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKghovbMs8Hbq9D12fzhA_-K0llOWhPP2Iq2Ewz1cvp9ziuuSrIrx0ALsrUYrYzr2IIGUcFBoYgyF_wTolbnn0JC96prXiSw0VymJ-F0' }
    ]
  }),
  makeCase('operation-phoenix-weapon-case', 'Operation Phoenix Weapon Case', 'CS:GO', 'Home to the most iconic AWP and AK combo in the game', 500, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0], false, undefined, undefined, {
    MIL_SPEC: [{"name":"Negev Terrain","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL_m5Hl6x1I_82gbaNoNs-HG3WB_vpzovNoRieMmRQguynLz4qgJyqWOg8iDZFyFOcD40axlYflNL7htgDb2thNmH6oinkc5yZt4fFCD_QbgNa1nA"},{"name":"MAG-7 Heaven Guard","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8n5G3wiFO0P-vb_NSKPWSGGKe_uJ_t-l9AXm1zEol52_cz9z9d3rDb1J0DZdwFOMLtxa4m4W2Zejn5ALc2NhFzyTgznQeMWQmjgI"},{"name":"G3SG1 Design","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Tec-9 Isaac","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLlm5W5wiFO0Oara_1SIeOaB2qf19F6ueZhW2frlEpz6zyAy477dXrEagFxDcclRO4C5EK8wIa1Nem3s1TdiotNzCn5kGoXuYgN6W8t"},{"name":"odds: Mil-Spec 79.92%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Restricted 15.98%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Classified 3.20%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Covert 0.64%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Exceedingly Rare 0.26%.","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"}],
    RESTRICTED: [{"name":"MAC-10 Heat","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8n5WxrR1Y-s2jaac8cM-BC2OYzvpJvOhuRz39xR5w4GzUyo6pdnuUawMpWJokTLUL50K6l9XiNO7i4lGKiYsRxCv6jTQJsHim4lDW8g"},{"name":"SG 553 Pulse","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"FAMAS Pulse","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL3n5vh7h1Y-s2oaalsM8-DG2uDxNF6ueZhW2flxBlxtm_WntqhJyiSbw90CpJyR-8DtRm6kdHkYuLj4QzY2INCzX-skGoXudLVHKnn"},{"name":"USP-S Guardian","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLkjYbf7itX6vytbbZSI-WsG3SA_ut6teZoQT2MmRQguynLyd76I32fbFUkD5EmRu4Ct0O4m9fmY-zlsQSMiN9CnHj2jitL531o4fFCD_TZrkjVNw"}],
    CLASSIFIED: [{"name":"AK-47 Redline","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiFO0POlPPNSI_-RHGavzedxuPUnFniykEtzsWWBzoyuIiifaAchDZUjTOZe4RC_w4buM-6z7wzbgokUyzK-0H08hRGDMA"},{"name":"Nova Antique","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL_kYDhwiFO0PyhfqVSIf6HB3aFxNF6ueZhW2fmwRwl6jyHw96vIn2UbVVzXMdyRuYLt0O7ltPjZbu0tQTejo9Hyn2skGoXucYtjcOH"},{"name":"P90 Trigon","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLhx8bf_jdk_6v-V7B_KfecAFicyOl-pK9vGi3nlEt24GnSwoypc3rFbQ52XsN0EOFcshfuwYa1NbzktVTZ3ohN02yg2RSFidN_"}],
    COVERT: [{"name":"AWP Asiimov","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwiYbf_jdk7uW-V6V-Kf2cGFidxOp_pewnF3nhxEt0sGnSzN76dH3GOg9xC8FyEORftRe-x9PuYurq71bW3d8UnjK-0H0YSTpMGQ"},{"name":"AUG Chameleon","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwi5Hf_jdk7uepV6dlIf2WAmKfz-9_ouRWQyC0nQlpt23VztercCjGbg90C8RyQOcMs0G5x93uZLm37wbe2owTz3j9iShI6TErvbi7ZmzWCw"}],
    EXCEEDINGLY_RARE: [
      { name: '★ Karambit | Fade', image: 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbMs8Hbq9D12fzhA_-G0mImZmvHMNanVjjoI65wl0r-RpoqsiVDh_hZvNWijcYCVJFI6NAzWrwfvlOu60ZG7uZXYiSw0X2R_D3k' },
      { name: '★ Butterfly Knife | Crimson Web', image: 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKghovbMs8Hbq9D12fzhA_-K0llOWhPP2Iq2Ewz1cvp9ziuuSrIrx0ALsrUYrYzr2IIGUcFBoYgyF_wTolbnn0JC96prXiSw0VymJ-F0' }
    ]
  }),
  makeCase('huntsman-weapon-case', 'Huntsman Weapon Case', 'CS:GO', 'Features the Huntsman Knife and the high-demand Vulcan finish', 500, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0], false, undefined, undefined, {
    MIL_SPEC: [{"name":"Galil AR Kami","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"CZ75-Auto Twist","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLyhMG1_B1a4s2pcbZsNPWsAm6Xyfo45bY7TXzjxk5w42XXn93_cnLFOFN1C5t0ROANsBLtx9ziNu6x4FHejpUFk3uH-TvaLw"},{"name":"P90 Module","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLhx8bf_Cxk_f23aahvLPWWClicyOl-pK8_Sn_rwE1x5z6AyY6qeXmRb1cgWMNwR7Ff4Bm_m9y0Przq4A3b348Q02yg2QQMyM9M"},{"name":"P2000 Ivory","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL5lYayrXIL0PG7V7Q_cKDDMW6Gzvxvj-1gSCGn20gism3dz96pc3KVOgYoCpR4TOFZsxbsxNzlYejl7lPWiIJBmX6t235XrnE8r5B4jsA"},{"name":"SSG 08 Slashed","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Tec-9 Sandstorm","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLlm5W5wiFO0Oara_1SM_GdCnSEzvx7j-1gSCGn2xsi52XSyIqueCifOAMnD8YkQ-YMtUPpwIK2N-jq4QSK2ohCm36q239XrnE8IX2h_4o"},{"name":"odds: Mil-Spec 79.92%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Restricted 15.98%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Classified 3.20%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Covert 0.64%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Exceedingly Rare 0.26%.","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"}],
    RESTRICTED: [{"name":"AUG Torque","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwi5Hf_jdk7uepV7R_L_eBC3SDyPhJvOhuRz39lxhxsm_WzN37Iy7CbAcmC8B2QuYPtRCwx9HvNr-xtQPaj95EmS__3TQJsHjrLu4xbg"},{"name":"PP-Bizon Antique","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLzl4zv8x1Y-s2sYb5iLs-SAHOZ0Ptzj-1gSCGn20sj4DnTyN2pdyjFOg4oXJV5Qu5c5xS9w4bjNL7q7gHd2INGxCn_iyxXrnE83Efvvd0"},{"name":"XM1014 Heaven Guard","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLpk8ewrHZk7OeRcKk8cKHHMW-VwPhzvt5uWiihkSIrujqNjsH7cHLFPwd1WZsiFrJYuhC4lNTuNu3n5ASN3YxEniStjSMa6H45675UT-N7rZnbv6eE"},{"name":"MAC-10 Tatter","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8n5WxrR1Y-s2lZ7Z4MOSsAm6Xyfo4tbY7H3q1xRt152TWyt6tc3ifaVcmDppxReVethawlYHmNO6ztQbciJUFk3uxmhdQIQ"}],
    CLASSIFIED: [{"name":"M4A1-S Atomic Alloy","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwjFS4_ega6F_H_GeMWrEwL87o95oQyW8jCIooTyLnYrGLSLANkI-D5d2FrENtRG7wNDvZe-3slfci9pFmHj8jSof6yZjtugEB6QtrKTXhxaBb-PhITXxPA"},{"name":"SCAR-20 Cyrex","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLinZfyr3Jk7OeRe6dsMs-QF3WV2dF6ueZhW2fgzUR_52nUzYugICnCPVImApYkRO8NtkLtw4a1Nbzn7lSN2oITnCr5kGoXuXXxbesR"},{"name":"USP-S Caiman","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLkjYbf7itX6vytbbZSI-WsBWaZzO94j-1gSCGn20t-4WyBn4mocC6XbVN0CMB2RLYMsUG5x9DgN-20tQSNiI1GzS2q3XtXrnE8NAiGp64"}],
    COVERT: [{"name":"AK-47 Vulcan","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiFO0POlPPNSMuWRDGKC_uJ_t-l9AXCxxEh14zjTztivci2ePQZ2W8NzTecD4BKwloLiYeqxtAOIj9gUyyngznQeF7I6QE8"},{"name":"M4A4 Desert-Strike","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwiFO0OanfKVjM-ScHGqvzedxuPUnHnjnxEsi4WTTntqucnuUaA92CZR2E-IDtRa-mobnYeLksQbXg4hDyTK-0H1Bbz5yqg"}],
    EXCEEDINGLY_RARE: [
      { name: '★ Karambit | Fade', image: 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbMs8Hbq9D12fzhA_-G0mImZmvHMNanVjjoI65wl0r-RpoqsiVDh_hZvNWijcYCVJFI6NAzWrwfvlOu60ZG7uZXYiSw0X2R_D3k' },
      { name: '★ Butterfly Knife | Crimson Web', image: 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKghovbMs8Hbq9D12fzhA_-K0llOWhPP2Iq2Ewz1cvp9ziuuSrIrx0ALsrUYrYzr2IIGUcFBoYgyF_wTolbnn0JC96prXiSw0VymJ-F0' }
    ]
  }),
  makeCase('operation-breakout-weapon-case', 'Operation Breakout Weapon Case', 'CS:GO', 'The case that introduced the Butterfly Knife and high-tech Cyrex skins', 500, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0], false, undefined, undefined, {
    MIL_SPEC: [{"name":"MP7 Urban Hazard","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8jsHf_jdk4uL5JadiLf2SAGOV09F6ueZhW2fgx0gl4WTczdj7I3LFaQYjDcQiE-Beuhe6xIXnP-_l41eKi9pEyH79kGoXuW6iY_I1"},{"name":"Negev Desert-Strike","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL_m5Hl6x1Y-s2gbaNoNs-HB3ORz_1iv_NkcCW6khUz_WnUz42tI3-WOw5zDpAmQOQD4ELskoDlMeni4gTWjoNNmSj_33kcvC51o7FVXp6G1h4"},{"name":"SCAR-20 Cyrex","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLinZfyr3Jk7OeRe6dsMs-QF3WV2dF6ueZhW2fgzUR_52nUzYugICnCPVImApYkRO8NtkLtw4a1Nbzn7lSN2oITnCr5kGoXuXXxbesR"},{"name":"SSG 08 Abyss","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"UMP-45 Labyrinth","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLkk4a0qB1Y-s2iaaZ0MvmdGm-vzedxuPUnHSiwwUUh5jndn939dC2QaVApXJdwR7Ncsxe8xtWyMrmwtAWIjohGzzK-0H1h0wYN6w"},{"name":"P2000 Ivory","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL5lYayrXIL0PG7V7Q_cKDDMW6Gzvxvj-1gSCGn20gism3dz96pc3KVOgYoCpR4TOFZsxbsxNzlYejl7lPWiIJBmX6t235XrnE8r5B4jsA"},{"name":"odds: Mil-Spec 79.92%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Restricted 15.98%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Classified 3.20%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Covert 0.64%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Exceedingly Rare 0.26%.","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"}],
    RESTRICTED: [{"name":"Nova Koi","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL_kYDhwiFO0PyhfqVSK_-aMWuZxuZi_rBqGCu3xEoksm_SzomhcHiQP1QjD8BxQuAN50TtlIK1Yri05lDeiY5bjXKpu6W3YF0"},{"name":"P250 Supernova","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLhzMOwwiFO0PCnfLBoMuOEC2KE_uJ_t-l9AXzlwk5zsGnWz46uICjCPAZ2CZF0QO8LtBjtkNaxZrji7wbY2tkUySXgznQe4Iqu8Lg"},{"name":"CZ75-Auto Tigris","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLyhMG1_B1Y-s2tP_FsbeSaCWKC_uJ_t-l9ASvil0R15WjUmYmqc33CaQ91W5QlRbVetETtwNC1P-u34g2L2dpEmS_gznQebcVQ6rs"},{"name":"USP-S Blood Tiger","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLkjYbf7itX6vytbbZSKOmsHGKU1edxtfNWQyC0nQlptWWEzd-qd3mVbgR2WZYiFuUMtUG7x4HhYeLhs1fZiN1DnC6viH4Y7TErvbgp6HjWjQ"}],
    CLASSIFIED: [{"name":"Five-SeveN Fowl Play","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL3l4Dl7idN6vyRabVSdaesCGKR1eZzovJWQyC0nQlptm_Vw9ercnOUaA8lA5skFuIPsxPqmtXkNu205lfYiN8XnCyvj3hNvDErvbiIo1idJQ"},{"name":"Glock-18 Water Elemental","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL2kpnj9h1Y-s2pZKtuK72fB3aFxP11te99cCW6khUz_TjVyompc3-QOFR2DJQkFOMJtBbqk9LlY-7n5QLZjtkTxCWqhixPv311o7FVIf8eASQ"},{"name":"Desert Eagle Conspiracy","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"}],
    COVERT: [{"name":"M4A1-S Cyrex","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwjFS4_ega6F_H_OGMWrEwL9lj-JwXSyrqhEutDWR1N77cimSbQQgC8F5QLYCsELpltTnZuvk7wbcjdhDzy_43yMb6ilvt7kcEf1yDWu2yf8"},{"name":"P90 Asiimov","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLhx8bf_jdk_6v-JaV-KfmeAXGvzedxuPUnTSjikRgksjuBzoz4dXLFb1QoC8QlTLQD4EPqk4LvN-Pns1aMioNBzTK-0H3gQVv65g"}],
    EXCEEDINGLY_RARE: [
      { name: '★ Karambit | Fade', image: 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbMs8Hbq9D12fzhA_-G0mImZmvHMNanVjjoI65wl0r-RpoqsiVDh_hZvNWijcYCVJFI6NAzWrwfvlOu60ZG7uZXYiSw0X2R_D3k' },
      { name: '★ Butterfly Knife | Crimson Web', image: 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKghovbMs8Hbq9D12fzhA_-K0llOWhPP2Iq2Ewz1cvp9ziuuSrIrx0ALsrUYrYzr2IIGUcFBoYgyF_wTolbnn0JC96prXiSw0VymJ-F0' }
    ]
  }),
  makeCase('chroma-case', 'Chroma Case', 'CS:GO', 'Introduced the first wave of high-tier knife finishes like Doppler and Marble Fade', 500, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0], false, undefined, undefined, {
    MIL_SPEC: [{"name":"Glock-18 Catacombs","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL2kpnj9h1Y-s2pZKtuK8-XC2aEyfp5vO1WQyC0nQlptWWDzIz8dy6QalMgXsMiQbEJtRjskdW2M7nn71Dcj49Fm3qsiClB7jErvbhnnfwjgw"},{"name":"MP9 Deadly Poison","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8js_f_jdk4uL3V6BoIfSfF1iAzudlv-9WQyC0nQlpsm3Vy9f4eXvEPwcoCcNyQOBY5EWxwN3gNru0tFGK2d5Mny__iS8c5zErvbjRwweEJA"},{"name":"SCAR-20 Grotto","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLinZfyr3Jk7uORe6dsMqLDMWuVwOVJvOhuRz39zRtx62uGm9z8JHnFaFR0AsAjRuQI40Sww9HvNunqtQTego5MmSX4izQJsHiOao_ijg"},{"name":"XM1014 Quicksilver","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLpk8ewrHZk7uORcKk8cKHHMXSZxuJ3j-1gSCGn20oksGTXy4yrIC3GbwYpCJF1RuQMtkG-koCyNO22tVSIiY1GxXn6iyhXrnE8nW2Det4"},{"name":"odds: Mil-Spec 79.92%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Restricted 15.98%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Classified 3.20%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Covert 0.64%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Exceedingly Rare 0.26%.","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"}],
    RESTRICTED: [{"name":"Desert Eagle Naga","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"MAC-10 Malachite","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8n5WxrR1a4s2jaac8cM-eD2uRwuZ_pORWQyC0nQlpt27Uw4yrJy_FOlQpCJp2Te5Y5hPqw9HuYePksVaKjt0TmS_2hihJuDErvbgNFzWT1Q"},{"name":"Sawed-Off Serenity","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLin4Hl-S1d6c2tfZt-IeeWCmiWx9FytfdocCW6khUz_W2Dwtv6cXLFZgUnD5VzQrMPtxjrx9K0Ye637wzYj4gXzimqiH9KuC91o7FV9mPR2UI"},{"name":"Dual Berettas Urban Shock","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"}],
    CLASSIFIED: [{"name":"AK-47 Cartel","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiNK0POlPPNSI_GBGmKc_uJ_t-l9ASuywktwtW3dwt79eX6fZlUiCJJ1RbUPtkW8w4LiZe_i4ATYjN8WmH7gznQeZkk4ehM"},{"name":"M4A4 Dragon King","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwiFO0P_6afBSIf6QC3SE0-96j-1gSCGn20x062mAwtb8cX3CaAMoApV3EeFZ50Wwk9fuM-vqtAHW3opHn3iqiSxXrnE8PytIGFg"},{"name":"P250 Muertos","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLhzMOwwiFO0OL8PfRSLfGdCmacwNF6ueZhW2e1lh51sm3UmN37cHuUbQQhXJtwQO4C4BXsxtHjM-624A3a2IoWySiskGoXuSIJMqiP"}],
    COVERT: [{"name":"AWP Man-o'-war","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwiYbf_C9k7uW-V6NhL-KKMWuZxuZi_uM5HXG3xhh_t2iBnI2ucn3EZwEjDpJ0Q-dY5EPrxNTiYevj7gXa2IhbjXKpQIFOiXU"},{"name":"Galil AR Chatterbox","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"}],
    EXCEEDINGLY_RARE: [
      { name: '★ Karambit | Fade', image: 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbMs8Hbq9D12fzhA_-G0mImZmvHMNanVjjoI65wl0r-RpoqsiVDh_hZvNWijcYCVJFI6NAzWrwfvlOu60ZG7uZXYiSw0X2R_D3k' },
      { name: '★ Butterfly Knife | Crimson Web', image: 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKghovbMs8Hbq9D12fzhA_-K0llOWhPP2Iq2Ewz1cvp9ziuuSrIrx0ALsrUYrYzr2IIGUcFBoYgyF_wTolbnn0JC96prXiSw0VymJ-F0' }
    ]
  }),
  makeCase('shadow-case', 'Shadow Case', 'CS:GO', 'The debut of Shadow Daggers and the Kill Confirmed pistol', 500, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0], false, undefined, undefined, {
    MIL_SPEC: [{"name":"Glock-18 Wraiths","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL2kpnj9h1c_M2pZKtuK6HLMXCCwPp-qfJWQyC0nQlp4T_Xnoz8dCmfZlUgXsd5RbMC40WxkdXnP7nl4wHXi9oUyH_9jilIuzErvbjBKaM58A"},{"name":"MAC-10 Rangeen","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8n5WxrR1Y-s2jaac8cM-SAmKbyfd3j-V8QBa_nBovp3PWztqtJXqWPVdzX8d3EbUDtkS_w9bmYui04gbYiolGnH_833xM6C5o_a9cBlensHEx"},{"name":"MAG-7 Cobalt Core","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8n5G3wiFO0P-vb_NSLemBDWKexNF6ueZhW2fkwBshsT-DntuscSiVbABzD5Z2QuRftRXuwYblY-_i5AePj49Emyn7kGoXuSUXTp8T"},{"name":"MP7 Special Delivery","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8jsHf_jdk4uL5V6dhIeOAB2GZxOpJvOhuRz39xRhytjuBm9n4d3yXbQF1XJAhQLID4BTskobhZb-35wXZ2toTySz2jTQJsHhDRFQUDw"},{"name":"P250 Wingshot","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLhzMOwwipC0OL8PfRSI-KSDWyDyeFij-1gSCGn205wtT7Xn4yuc3qQbQUkXJQmEeQCtkK7wdDgZO7n71Df2IkQxH7-hyhXrnE8AH9Qqg8"},{"name":"odds: Mil-Spec 79.92%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Restricted 15.98%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Classified 3.20%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Covert 0.64%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Exceedingly Rare 0.26%.","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"}],
    RESTRICTED: [{"name":"Dual Berettas Dualing Dragons","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"FAMAS Survivor Z","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL3n5vh7h1Y-s2oaalsM8-fC2mEwNF6ueZhW2exlE8hsTzcw4n4JC7BOAQpCscmRrRe5xW7w9TgNu7itAHWiYpAziqokGoXuXR1eqm1"},{"name":"Galil AR Stone Cold","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"SCAR-20 Bloodsport","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLinZfyr3Jk6OGRe6dsMqLDMWWczuFyo_FmXT2MmRQguynLnoqrcHPCaFdzDMF5F-8P4Bbum9fkYuvrsVffjI5AyS75inlL5ixjsvFCD_R20nqesQ"}],
    CLASSIFIED: [{"name":"AK-47 Frontside Misty","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiFO0POlPPNSN_mdGmKC_v1mv_N9cCW6khUz_WvRm9r8JS-SaFMmWcN5ReMD4BDsltDkN-Prs1DfjN9Cn3r_jC4YvHl1o7FVgJsyBlQ"},{"name":"G3SG1 Flux","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL2zYXnrB1c_M2pO7dqcc-VAnKI_v5jovFlSha_nBovp3ODz9uoc3vGOgMmApp3QrFe5xftm9bjNOm24Afb3YlBn3mqjS8dvy1p_a9cBmtTF-_C"},{"name":"SSG 08 Big Iron","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"}],
    COVERT: [{"name":"USP-S Kill Confirmed","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLkjYbf7itX6vytbbZSI-WsG3SA_uV_vO1WTCa9kxQ1vjiBpYPwJiPTcFB2Xpp5TO5cskG9lYCxZu_jsVCL3o4Xnij23ClO5ik9tegFA_It8qHJz1aWe-uc160"},{"name":"M4A1-S Golden Coil","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwjFS4_ega6F_H_eAMWrEwL9lj_JnTiK2lxQztgKClYP9HifOOV5kFJclQ-Jb5xW-m9CxPuLq4QTfjd0XzyX6jCpL6X5o5OgDVfYn_a2Ci1rfcepqgV49FrE"}],
    EXCEEDINGLY_RARE: [
      { name: '★ Karambit | Fade', image: 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbMs8Hbq9D12fzhA_-G0mImZmvHMNanVjjoI65wl0r-RpoqsiVDh_hZvNWijcYCVJFI6NAzWrwfvlOu60ZG7uZXYiSw0X2R_D3k' },
      { name: '★ Butterfly Knife | Crimson Web', image: 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKghovbMs8Hbq9D12fzhA_-K0llOWhPP2Iq2Ewz1cvp9ziuuSrIrx0ALsrUYrYzr2IIGUcFBoYgyF_wTolbnn0JC96prXiSw0VymJ-F0' }
    ]
  }),
  makeCase('clutch-case', 'Clutch Case', 'CS:GO', 'A community favorite featuring second-gen gloves and the Neo-Noir finish', 500, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0], false, undefined, undefined, {
    MIL_SPEC: [{"name":"PP-Bizon Night Riot","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLzl4zv8x1Y-s2sYb5iLs-BB2iE_uJ_t-l9AXqxzUQisWTWz9egc3KWbAJ0XJt5Q7YN5xnuxNDiN7iz4waLgtkWzS7gznQeDJdgNeg"},{"name":"Five-SeveN Flame Test","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL3l4Dl7idN6vyRb7dSJvmFC3SV1-t4j-lmWxahmhkYpTSKlortHifOOV5kFJt1FOVYsBC_lobmNe3q4AOK3dhDnimrhyoa7i9ssO4CU6F0rvWBiwvfcepqcNk1MwM"},{"name":"MP9 Black Sand","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8js_f_jdk4uL3V6ZhIfOYMXSRz-pJvOhuRz39xxsj5GWDn9z6d3rCOFV1CJpwTO4IsEG8x4WzPr6xtlTZ2YlEzX-vhzQJsHjCKAg7iw"},{"name":"P2000 Urban Hazard","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL5lYayrXIL0PG7V7Q_cKDDMXKCw-94j-loVSihkSIrujqNjsGsJXnFPw4gCcZ1TOIPt0LukoG2ZuqxtAXaj4sTzy6q3SpN7C9u6-YCT-N7rcTI-daA"},{"name":"R8 Revolver Grip","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"SG 553 Aloha","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"XM1014 Oxide Blaze","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLpk8ewrHZk7OeRcKk8cKHHMWiIyOpzj-NlTjO2qhEutDWR1N-tJ3zDOFAoDZMhRrNbsUa_x9fuMrvrsgDW3YJGxHn22ixO6C9j5uscEf1ygXv9Ksw"},{"name":"odds: Mil-Spec 79.92%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Restricted 15.98%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Classified 3.20%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Covert 0.64%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Exceedingly Rare 0.26%.","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"}],
    RESTRICTED: [{"name":"Glock-18 Moonrise","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL2kpnj9h1a7s2pZKtuK8_CVliF0-x3vt5kQCa9qhsipTiXpYPwJiPTcANzXJNyFOEMthXsktHhMLzl4FaK3toWn3iqhi9BvHw9su5UU6Zw-_bJz1aWcX-Jd_0"},{"name":"MAG-7 SWAG-7","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8n5G3wiNK0P-vb_NSM-eSCTCvzedxuPUnHirhkxhxtzvRzI38dnLEOlQnW5N1F-FZtRG6kYLvPu205ADaj40RnDK-0H0F4y2tgg"},{"name":"Negev Lionfish","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL_m5Hl6x1I_82gbaNoNs-fB2iex-dluN5lRi67gVNx62XXzI74InPGbQMpDpMiRLMOsRG4lNXvPuritFeN3YpMzSSo2yhN8G81tOHyHega"},{"name":"Nova Wildfire","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"UMP-45 Arctic Wolf","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLkk4a0qB1Y-s27ZbQ5dc-EBm6ExNFwse9ucCW6khUz_WiGzY6pJyjCZwN1A5p5Q-MCuxa7ldW0Ne3ntQHW2YpFmSv63S1B73t1o7FVFkKgM50"}],
    CLASSIFIED: [{"name":"USP-S Cortex","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLkjYbf7itX6vytbbZSI-WsG3SA_u1jpN5lRi67gVNz4G7Qm938cS_Da1AhXpB1EeVb4xm4mtDjN7vj4A3b2NpGyCr52i4Y8G81tMzdoYZ7"},{"name":"AWP Mortis","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwiYbf-jFk7uW-V6BoIeSbMWuZxuZi_rNtHiuwwRwismWEnNn8JymSZgUiDpd3Ru9ZsxG-xNy2NLzn41DWg41bjXKp5oOAt0A"},{"name":"AUG Stymphalian","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwi5Hf-jFk7uepV7d5Of2DBmacyO94j-NgXS2gqhEutDWR1Iz6cnqXOA8mD5shTOEPuhm-moHlZLnj4gLWjdhEzimr2n8bvC5q4e8cEf1yYjdCpmM"}],
    COVERT: [{"name":"M4A4 Neo-Noir","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwiFO0P_6afBSLvWcMWmfyPxJvOhuRz39wE1142vSztmvInvBOgV0W5R1FLYNuxW4wIbgNrmx4g2Kj4tMmCX93zQJsHgJr0dqFw"},{"name":"MP7 Bloodsport","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8jsHf-jFk4uL5V6ZhL_-XHXef0_pJvOhuRz39lxsk4W3Ry96pIHrFOgElDZN2Q-9etUSwk4LnYu3h5wLejYwWxSr43zQJsHiIGMoJQA"}],
    EXCEEDINGLY_RARE: [
      { name: '★ Karambit | Fade', image: 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbMs8Hbq9D12fzhA_-G0mImZmvHMNanVjjoI65wl0r-RpoqsiVDh_hZvNWijcYCVJFI6NAzWrwfvlOu60ZG7uZXYiSw0X2R_D3k' },
      { name: '★ Butterfly Knife | Crimson Web', image: 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKghovbMs8Hbq9D12fzhA_-K0llOWhPP2Iq2Ewz1cvp9ziuuSrIrx0ALsrUYrYzr2IIGUcFBoYgyF_wTolbnn0JC96prXiSw0VymJ-F0' }
    ]
  }),
  makeCase('prisma-case', 'Prisma Case', 'CS:GO', 'Neon-heavy collection with the M4A4 Emperor', 500, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0], false, undefined, undefined, {
    MIL_SPEC: [{"name":"Galil AR Akihabara Accept","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"MP7 Mischief","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8jsHf_jdk4uL5V7ZsI_uWGmKV09F6ueZhW2fnlE5x52Tdz4mscn6XOAFzXppyQ7RZtkTpwNzuMejn5wyPjYoTy336kGoXuS747mDn"},{"name":"P250 Verdigris","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLhzMOwwiNK0OL8PfRSNvWBCm6X0-dlj-1gSCGn20R35DnRn42udXiVOg91CpZ4ReACthC4wYexZuuw5VeIjdkUzyqq3CNXrnE8Cr6wnKw"},{"name":"odds: Mil-Spec 79.92%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Restricted 15.98%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Classified 3.20%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Covert 0.64%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Exceedingly Rare 0.26%.","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"}],
    RESTRICTED: [{"name":"Desert Eagle Light Rail","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"AK-47 Uncharted","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiFO0POlPPNSIeqHC2SvzedxuPUnFnCwwBl_5D_Syon8dnyUaQUlD5oiQ7ECuxW7l920ZL-w4AfX2IlByTK-0H0PRM7cOA"},{"name":"R8 Revolver Skull Crusher","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"}],
    CLASSIFIED: [{"name":"AUG Momentum","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwi5Hf_jdk7uepV6liLfWdGnKd_uJ_t-l9ASi2zUp042SBno6sICrFbFMnCZR5EedftkPqk9ayMr_j71fXjo8XmXrgznQeFjVtTWM"},{"name":"XM1014 Incinegator","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLpk8ewrHZk7OeRcKk8cKHHMW6ewud4tfNoWyahqhEutDWR1NuuJXqWO1d0CsdyE-9ctxPpkYDmYr6zsgKLgt5NnC33in9B7idi4u8cEf1ypt9Mlvk"},{"name":"AWP Atheris","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwiYbf_jdk7uW-V7JkMPWBMWuZxuZi_rZsS3zgzU8isW3dnIr6eHKfPVAhDpojEe9YsUW4xta1Nuzm5FDci4NbjXKpmWVQppo"}],
    COVERT: [{"name":"M4A4 The Emperor","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwiVI0P_6afBSJf2DC3Wf09F6ueZhW2exwBh_6m3dnt36InjDPQ4oXJt1TbJeshW_mtfjN-vrsgaKiokWy333kGoXuRj4z9Nd"},{"name":"Five-SeveN Angry Mob","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL3l4Dl7idN6vyRa7FSJvmFC1iDxPhzvt5oQS6hjCIrujqNjsH_cy2RagUjA8BwR-de5hjskNflNrnqsgaLiYgRyyythitM7Hw-sekKT-N7rXEld5dH"}],
    EXCEEDINGLY_RARE: [
      { name: '★ Karambit | Fade', image: 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbMs8Hbq9D12fzhA_-G0mImZmvHMNanVjjoI65wl0r-RpoqsiVDh_hZvNWijcYCVJFI6NAzWrwfvlOu60ZG7uZXYiSw0X2R_D3k' },
      { name: '★ Butterfly Knife | Crimson Web', image: 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKghovbMs8Hbq9D12fzhA_-K0llOWhPP2Iq2Ewz1cvp9ziuuSrIrx0ALsrUYrYzr2IIGUcFBoYgyF_wTolbnn0JC96prXiSw0VymJ-F0' }
    ]
  }),
  makeCase('operation-broken-fang-case', 'Operation Broken Fang Case', 'CS:GO', 'Introduced the Printstream M4A1-S and high-tier glove drops', 500, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0], false, undefined, undefined, {
    MIL_SPEC: [{"name":"CZ75-Auto Vendetta","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLyhMG1_B1c_M2tcvM4H-aWAGOV1fp3j-1gSCGn205ysWiEw9iqInueOAZyD5J1EOdf4Ea9l9bmMb_q4AaI2NhGySz6iStXrnE8_AWQoqE"},{"name":"Galil AR Vandal","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"P90 Cocoa Grange","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"odds: Mil-Spec 79.92%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Restricted 15.98%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Classified 3.20%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Covert 0.64%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Exceedingly Rare 0.26%.","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"}],
    RESTRICTED: [{"name":"Desert Eagle Printstream","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Nova Clear Polymer","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL_kYDhwiFO0PyhfqVSMP-fF2qV09F6ueZhW2exxkR-tmWEmIyoJXyWZw4iDsclROVftxm7wIe1NbizswPe2YlHmCuvkGoXuVU3K7Ec"},{"name":"UMP-45 Gold Bismuth","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLkk4a0qB1c_M27ZbRSJ_-fCliSyP17pfVhcCW6khUz_Wrczt__dn3GbVR0D8dxEOAMsxW9lofkMum04w3eg4kXzy6q339BvHx1o7FVa_qMENU"}],
    CLASSIFIED: [{"name":"M4A4 Cyber Security","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwiFO0P_6afBSI-mRC3WA1OB9j-1gSCGn2x9-527Tyt-pcnyUagQlW5JxEOIOuhjrw9XlMrixtQTd2NhNmH_5jCNXrnE8Cu1wa6c"},{"name":"USP-S Monster Mashup","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLkjYbf7itX6vytbbZSI-WsG3SA_uVkv-pmXBa_nBovp3PQn46ueX3FbAB0WZMjTe9csEKwk9XvNbnl41Tcj48WzHqv3HhP5ydj_a9cBuLIfNg1"},{"name":"AWP Exoskeleton","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwiYbf-jFk7uW-V6F1L-OYC2uV1eF4j-1gSCGn20km5zyEmd2qc3uWZwcnA5MiELIJtxa_w9OyN-nh5wKKj4kTyn78hyNXrnE83OTew2I"}],
    COVERT: [{"name":"M4A1-S Printstream","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwjFS4_ega6F_H_OGMWrEwL9lj_F7Rienhgk1tjyIpYPwJiPTcAAoCpsiEO5ZsUbpm9C2Zuni4VHW3o5EzSX62HxP7Sg96-hWVqYi_6TJz1aW0nxrkGs"},{"name":"Glock-18 Neo-Noir","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL2kpnj9h1Y-s2pZKtuK8-dAW6C_uJ_t-l9AXznwh9zsjjSn9j9dH-eb1V0CsF3QrNZ4xW8ltPlM-7h4QbYit5NzyzgznQecekkTuo"}],
    EXCEEDINGLY_RARE: [
      { name: '★ Karambit | Fade', image: 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbMs8Hbq9D12fzhA_-G0mImZmvHMNanVjjoI65wl0r-RpoqsiVDh_hZvNWijcYCVJFI6NAzWrwfvlOu60ZG7uZXYiSw0X2R_D3k' },
      { name: '★ Butterfly Knife | Crimson Web', image: 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKghovbMs8Hbq9D12fzhA_-K0llOWhPP2Iq2Ewz1cvp9ziuuSrIrx0ALsrUYrYzr2IIGUcFBoYgyF_wTolbnn0JC96prXiSw0VymJ-F0' }
    ]
  }),
  makeCase('kilowatt-case', 'Kilowatt Case', 'CS:GO', 'The first official CS2 case featuring the Zeus skin and Kukri knife', 500, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0], false, undefined, undefined, {
    MIL_SPEC: [{"name":"MAC-10 Box Loader","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Nova Dark Sigil","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL_kYDhwixU-fORbLZsK_uSHFicyOl-pK8xG3q1lk0l4m2HmI6odXiRbwF1CJchQbEI4RK8kNPiMb-24A3W3YoX02yg2YjfpjSA"},{"name":"SSG 08 Dezastre","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Tec-9 Slag","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLlm5W5wjZe7KuRYrFjK-mSHGOvxOBxue9sSju6mxoYvzSCkpu3eHPFZwMkWZBzR-cDsEbpm9DvY-yx51fajd8WyXn4hntBvX465OkBVL1lpPMDDuBGag"},{"name":"odds: Mil-Spec 79.92%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Restricted 15.98%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Classified 3.20%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Covert 0.64%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Exceedingly Rare 0.26%.","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"}],
    RESTRICTED: [{"name":"Glock-18 Block-18","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL2kpnj9h1c4_2tY5tvMvmQBVidzuByouhoQRa_nBovp3PXzov9cyjDbwckXMMkF7IIthOwwNDmY-rq4AzfjItMyH_9iC0YuC04_a9cBk5_kH3q"},{"name":"M4A4 Etchilly","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Five-SeveN Hybrid","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL3l4Dl7idN6vyRbq17JeOWGGKe_uZvsvNgSxa_nBovp3OBmd6oJXyeaQ9yCsZxEOICsUO7kdK0Y-qxtFCN2YsQnCv7i39N7ixp_a9cBsh2vVQD"},{"name":"MP7 Just Smile","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8jsHf8DIM0Pi7e7BSM_2aAmKvzedxuPUnHXrkzU4i4z-Dno6sci3BaQApDpN4R-cCthnqx4W2MunhtgCI3d0QmzK-0H0MYFOvtA"}],
    CLASSIFIED: [{"name":"M4A1-S Black Lotus","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwjFS4_ega6F_H_3HDzaD_ux6seJicCW8gQg0jDGMnYftb3-eOgEpDcFyQuMMtRG8kIbhMuK051ba2IMQyH6r3yof5ilv4bwLWfU7uvqA7qRNHGA"},{"name":"Zeus x27 Olympus","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"USP-S Jawbreaker","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLkjYbf7itX6vytbbZSNeODHViUzulxqd5lRi67gVMl62nUyd2scnOVPAcgA5J2TOFY5xLrlN22YbzgsQaI2IlHyiWojnwa8G81tErOD-_J"}],
    COVERT: [{"name":"AK-47 Inheritance","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiNQ0OKheqdoLPGaAFicyOl-pK8xGH_nwUt1sGrSz9ivcHKQOAcjXMYkRu5Yuxe4lYCyZOq25VSM2oMT02yg2UxBSEgA"},{"name":"AWP Chrome Cannon","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwiYbf_DVL0OarZbRoMvWXMWuZxuZi_uM6SXngxR5-smTXw4ugIi6RbVcpXsN1ELUDtxPrktOyNL7h4g2P2tpbjXKpKIbjbD4"}],
    EXCEEDINGLY_RARE: [
      { name: '★ Karambit | Fade', image: 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbMs8Hbq9D12fzhA_-G0mImZmvHMNanVjjoI65wl0r-RpoqsiVDh_hZvNWijcYCVJFI6NAzWrwfvlOu60ZG7uZXYiSw0X2R_D3k' },
      { name: '★ Butterfly Knife | Crimson Web', image: 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKghovbMs8Hbq9D12fzhA_-K0llOWhPP2Iq2Ewz1cvp9ziuuSrIrx0ALsrUYrYzr2IIGUcFBoYgyF_wTolbnn0JC96prXiSw0VymJ-F0' }
    ]
  }),
  makeCase('gallery-case', 'Gallery Case', 'CS:GO', 'A 2024 artistic showcase collection', 500, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0], false, undefined, undefined, {
    MIL_SPEC: [{"name":"AUG Abstract","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"FAMAS Abstract","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"MAC-10 Abstract","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"odds: Mil-Spec 79.92%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Restricted 15.98%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Classified 3.20%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Covert 0.64%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Exceedingly Rare 0.26%.","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"}],
    RESTRICTED: [{"name":"Desert Eagle Heat","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Glock-18 Abstract","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"P90 Abstract","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"}],
    CLASSIFIED: [{"name":"P250 Epicenter","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLhzMOwwjIJuqKRYal9IfOHMWuZxuZi_rg5TnvmzB916m_dm92pdH6eOwJ2DpVyQ7JftUXtwIK2MLiz7wTXjYtbjXKpkd0OdLY"},{"name":"AWP Chrome bore","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwiYbf_DVL0OarZbRoMvWXMWuZxuZi_uM6SXngxR5-smTXw4ugIi6RbVcpXsN1ELUDtxPrktOyNL7h4g2P2tpbjXKpKIbjbD4"},{"name":"UMP-45 Crime Scene","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLkk4a0qB1Y-s27ZbRSI-KaA2Kv0u1zvuRWQyC0nQlpt2SEmdiheHiUalMnCJd4FuFb5xHul4LjMu3q5gPX2N0QyC-siXsY7DErvbhN2TV12A"}],
    COVERT: [{"name":"M4A1-S Vaporwave","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwjFS4_ega6F_H_3HDzaD_vh3oO57WCilkCIrujqNjsH_In7DZgYnWcAiR-MJshO6koDlN7vhsQyLi41HySX6iXlAvCZrsb0HT-N7rW-9qIHE"},{"name":"AK-47 The Outsiders","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiNQu6WRfJtvNeOsAm6Xyfo4tbg7G3-wxxwl5mzRyYqodSrBagMjCZJxELMPthi8lNLgYuzltgHc3ZUFk3sO-7HKrg"}],
    EXCEEDINGLY_RARE: [
      { name: '★ Karambit | Fade', image: 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbMs8Hbq9D12fzhA_-G0mImZmvHMNanVjjoI65wl0r-RpoqsiVDh_hZvNWijcYCVJFI6NAzWrwfvlOu60ZG7uZXYiSw0X2R_D3k' },
      { name: '★ Butterfly Knife | Crimson Web', image: 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKghovbMs8Hbq9D12fzhA_-K0llOWhPP2Iq2Ewz1cvp9ziuuSrIrx0ALsrUYrYzr2IIGUcFBoYgyF_wTolbnn0JC96prXiSw0VymJ-F0' }
    ]
  }),
  makeCase('dead-hand-terminal', 'Dead Hand Terminal', 'CS:GO', 'The premier 2026 terminal release with high-tech aesthetics', 500, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0], false, undefined, undefined, {
    MIL_SPEC: [{"name":"SCAR-20 Caged","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLinZfyr3Jk_PGvept_JfaBD2SEyOF4j_c9cCW6khUz_W_SmNirdSmVOFcmDJEjQrEPtROwxtGyYevqsgPcg98RxXishi1Bui91o7FVKL5cNSg"},{"name":"P250 Bullfrog","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLhzMOwwjIJuqKRarFhLPaBAWCvzedxuPUnG3q1kEUl6mnRmYz6JXvBOlQgXsMiRe5ZtxnpmoLiZuO0sVbcjo8XyTK-0H1rEQ3j6Q"},{"name":"P2000 Red Wing","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL5lYayrXIL0OL8OPQ9H_SWC3ev0-tyj-1gSCGn20RysWvczNqpeS3GOlQoXsYhTLJbuhfulIHjPurktVHfjY8Wmyuo2H5XrnE8nnCGDRE"},{"name":"odds: Mil-Spec 79.92%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Restricted 15.98%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Classified 3.20%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Covert 0.64%","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"},{"name":"Exceedingly Rare 0.26%.","image":"https://steamcommunity-a.akamaihd.net/economy/image/class/730/error"}],
    RESTRICTED: [{"name":"UMP-45 Continuum","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLkk4a0qB1O4uL6PZtkLPyGA26ewNFg4t5lRi67gVN1tm7Qy9itcXqTOwYlXJpxFLEO4Ba_wYXgP7u0tQXajoxFxX-q3SxP8G81tMlVCWLZ"},{"name":"Nova Ocular","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL_kYDhwixU-fORZ6d4LPGBMWuZxuZi_uU6GHixlk13sjzRwo2oeS_DOwQhCpMhQuRc5EHumoezNe3htgLX3YJbjXKpiWHwHrY"},{"name":"M4A1-S Liquidation","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwjFS4_ega6F_H_3HDzaD_v9jueJicCW6hAgutzyRk4D3HifOOV5kFJtwQLQCshW4kYazNOngsQGMj4tAyXj8iy1N7CxqsulQVqt0-aaFhwrfcepqI4yC_kU"}],
    CLASSIFIED: [{"name":"MP7 Smoking Kills","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8jsHf8DIM0OGjZ69kLvesBW6czf1JprNWQyC0nQlp4z7QmI2pdyjEP1ByD5BwTLQDsRXrktXjP-ri5FHYjIpExCX73CJJ6zErvbgKbpbVdg"},{"name":"Glock-18 Mirror Mosaic","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL2kpnj9h1c4_2tY5tgKeKBAXWvzO9std5_HRajkBw1vwKJk4jxNWXFP1UhDsYkRbUMsxC6lNSzNO7lsQaK2dpCyH2rjS5J5i054exUVqQi5OSJ2C0RseXl"},{"name":"AWP Ice Coaled","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwiYbf_DVL0PutbZtuL_GfC2OvzedxuPUnS3u3wR8lsTzTn4qqcXuXOlQmCpUiQOdYtUG_ltXgP-u04wWL3Y9NnjK-0H2dw8uldQ"}],
    COVERT: [{"name":"AK-47 The Oligarch","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiNQu6WReLFrJvWBMWSF0vp5vd5lRi67gVNz4Tvdn4qoJC3Ba1V1WcdxTbFcsEbpxoHhNunnsVPYitlFm3392C4f8G81tEVBuxrI"},{"name":"M4A4 Full Throttle","image":"https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwi8P7qaRe69_MuKHMWCCxOt4j-1gSCGn20kk4mSHn97_eXqTOgMkXpdzR-MNsxO7w9e2Yrnk5VbciIhDznj8iy9XrnE8J4rQ87g"}],
    EXCEEDINGLY_RARE: [
      { name: '★ Karambit | Fade', image: 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbMs8Hbq9D12fzhA_-G0mImZmvHMNanVjjoI65wl0r-RpoqsiVDh_hZvNWijcYCVJFI6NAzWrwfvlOu60ZG7uZXYiSw0X2R_D3k' },
      { name: '★ Butterfly Knife | Crimson Web', image: 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKghovbMs8Hbq9D12fzhA_-K0llOWhPP2Iq2Ewz1cvp9ziuuSrIrx0ALsrUYrYzr2IIGUcFBoYgyF_wTolbnn0JC96prXiSw0VymJ-F0' }
    ]
  }),
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
  makeCase('covert-masterpiece', 'The Covert Masterpiece', 'Premium', 'Guarantees Covert items 100% of the time.', 0, [0, 0, 0, 0, 100, 0], true, 7.99),
  makeCase('absolute-perfection', 'The Absolute Perfection', 'Premium', 'Guarantees the highest tier Exceedingly Rare items 100% of the time.', 0, [0, 0, 0, 0, 0, 100], true, 9.99),
  SECRET_BILLION_CASE
];

export function drawRarity(caseId: string, pityCounter: number = 0) {
  const caseData = CASES.find(c => c.id === caseId);
  if (!caseData) return RARITIES.CONSUMER;
  
  let adjustedOdds = [...caseData.odds.map(o => ({...o}))];

  // Luck Protection (Pity Timer) Logic
  if (pityCounter > 50) {
      const pityBonus = (pityCounter - 50) * 0.005; // +0.5% total boost per case over 50
      const classifiedIdx = adjustedOdds.findIndex(o => o.rarity.name === RARITIES.CLASSIFIED.name);
      const covertIdx = adjustedOdds.findIndex(o => o.rarity.name === RARITIES.COVERT.name);
      const exceedinglyRareIdx = adjustedOdds.findIndex(o => o.rarity.name === RARITIES.EXCEEDINGLY_RARE.name);
      
      if (classifiedIdx !== -1) adjustedOdds[classifiedIdx].chance += pityBonus * 0.6;
      if (covertIdx !== -1) adjustedOdds[covertIdx].chance += pityBonus * 0.3;
      if (exceedinglyRareIdx !== -1) adjustedOdds[exceedinglyRareIdx].chance += pityBonus * 0.1;
      
      const totalChance = adjustedOdds.reduce((sum, o) => sum + o.chance, 0);
      adjustedOdds.forEach(o => o.chance /= totalChance);
  }

  const roll = Math.random();
  let cumulative = 0;
  for (const odd of adjustedOdds) {
    cumulative += odd.chance;
    if (roll <= cumulative) {
      return odd.rarity;
    }
  }
  return RARITIES.CONSUMER;
}

export function generateDurability(): number {
  return Math.random();
}

export function getWearInfo(durability: number) {
  if (durability < 0.07) return { label: 'Factory New', multiplier: 1.0 };
  if (durability < 0.15) return { label: 'Minimal Wear', multiplier: 0.8 };
  if (durability < 0.38) return { label: 'Field-Tested', multiplier: 0.5 };
  if (durability < 0.45) return { label: 'Well-Worn', multiplier: 0.3 };
  return { label: 'Battle-Scarred', multiplier: 0.1 };
}

export const SHINY_ODDS = [
  { type: 'Dev', chance: 0.000001, multiplier: 1 }, // Special handling
  { type: 'Dark Matter', chance: 0.000390625, multiplier: 50 },
  { type: 'Celestial', chance: 0.00078125, multiplier: 25 },
  { type: 'Prismatic', chance: 0.0015625, multiplier: 12 },
  { type: 'Rainbow', chance: 0.003125, multiplier: 8 },
  { type: 'Radiant', chance: 0.00625, multiplier: 5 },
  { type: 'Glimmering', chance: 0.0125, multiplier: 3 },
  { type: 'Shiny', chance: 0.025, multiplier: 2 },
] as const;

export function determineShinyType(forcedShiny?: string): string {
  if (forcedShiny && forcedShiny !== 'None') return forcedShiny;
  if (forcedShiny === 'None') return 'None';

  const roll = Math.random();
  let cumulative = 0;
  for (const shiny of SHINY_ODDS) {
    cumulative += shiny.chance;
    if (roll < cumulative) return shiny.type;
  }
  return 'None';
}

export function calculateValue(rarityId: string, wearMultiplier: number, caseData: CaseType, shinyType: string = 'None') {
  const rarityConfig = Object.values(RARITIES).find(r => r.id === rarityId) || RARITIES.CONSUMER;
  let basePrice = rarityConfig.baseValue;
  
  const isSecretCase = caseData.name === 'The Sovereign Reliquary';
  
  let caseMult = Math.max(1, ((caseData.realMoneyPrice ? caseData.realMoneyPrice * 1000 : caseData.cost) / 100));
  
  if (isSecretCase) {
    // Anything above common (starting at Mil-Spec) in the secret case is worth > 1 billion
    // Mil-Spec = 20 base -> * secret mult (100M) -> 2 Billion.
    caseMult = 100000000; 
  }

  let val = basePrice * wearMultiplier * caseMult * (0.8 + Math.random() * 0.4);
  
  // Profitability check for upgraded wiki cases
  // Anything ABOVE Mil-Spec (Restricted, Classified, Covert, Exceedingly Rare) should return a profit.
  const rarityRank = Object.values(RARITIES).findIndex(r => r.name === rarityConfig.name);
  const milSpecRank = Object.values(RARITIES).findIndex(r => r.name === RARITIES.MIL_SPEC.name);

  const isUpgradedWikiCase = caseData.id.startsWith('wiki-'); 
  const isHighTier = rarityRank > milSpecRank;

  if (isUpgradedWikiCase && isHighTier) {
    // Force value to be at least case cost + some profit
    val = Math.max(val, caseData.cost * (1.1 + Math.random() * 0.5));
  }
  
  if (shinyType !== 'None') {
    if (shinyType === 'Dev') {
      const isHeads = Math.random() > 0.5;
      val = isHeads ? 1000000000 : 0.01;
    } else {
      const shiny = SHINY_ODDS.find(s => s.type === shinyType);
      if (shiny) {
        val *= shiny.multiplier;
      }
    }
  }

  // Round to 2 decimal places to support cents, and guarantee a minimum value of 0.01 for Dev items, 0.03 for others
  const roundedVal = Math.round(val * 100) / 100;
  if (shinyType === 'Dev') return roundedVal;
  return Math.max(0.03, roundedVal);
}

export async function fetchRandomWikiArticle(query: string = '') {
  try {
    let url = 'https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=random&grnnamespace=0&grnlimit=10&prop=pageimages|extracts|categories&cllimit=500&piprop=original&pithumbsize=500&exchars=200&exintro=1&explaintext=1';
    
    if (query) {
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=500&utf8=&format=json&origin=*`;
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();
      
      let results = searchData.query?.search || [];
      
      if (results.length === 0 && query.includes(':')) {
        const fallbackQuery = query.replace(/incategory:"[^"]+"/g, '').trim() || query.split(' ')[0];
        if (fallbackQuery) {
            const fallbackRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(fallbackQuery)}&srlimit=100&utf8=&format=json&origin=*`);
            const fallbackData = await fallbackRes.json();
            results = fallbackData.query?.search || [];
        }
      }
      
      if (results.length > 0) {
        const randomHit = results[Math.floor(Math.random() * results.length)];
        const pageId = randomHit.pageid;
        url = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&pageids=${pageId}&prop=pageimages|extracts|categories&cllimit=500&piprop=original&pithumbsize=500&exchars=200&exintro=1&explaintext=1`;
      } else {
        const terms = query.replace(/incategory:"[^"]+"/g, '').split(' ').filter(t => t.length > 3);
        const ultimateFallback = terms.length > 0 ? terms[0] : 'Random';
        url = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrsearch=${encodeURIComponent(ultimateFallback)}&gsrlimit=10&prop=pageimages|extracts|categories&cllimit=500&piprop=original&pithumbsize=500&exchars=200&exintro=1&explaintext=1`;
      }
    }

    const res = await fetch(url);
    const data = await res.json();
    if (!data || !data.query || !data.query.pages) {
      throw new Error("No pages found");
    }

    const pages = Object.values(data.query.pages) as any[];
    if (pages.length === 0) throw new Error("No pages found");

    // Filter out people and locations if possible to focus on objects/events/things. 
    // We'll primarily filter out "Living people", "Births", "Deaths", "people", "politicians", "footballers", "players", "actors", "alumni"
    let validPages = pages.filter(p => !p.categories?.some((c: any) => 
       c.title.toLowerCase().includes('people') || 
       c.title.toLowerCase().includes('births') || 
       c.title.toLowerCase().includes('deaths') ||
       c.title.toLowerCase().includes('politicians') ||
       c.title.toLowerCase().includes('players') ||
       c.title.toLowerCase().includes('actors') ||
       c.title.toLowerCase().includes('alumni') ||
       c.title.toLowerCase().includes('women') ||
       c.title.toLowerCase().includes('men')
    ));

    // If our filtering was too aggressive and we have no results left, fallback to all pages
    if (validPages.length === 0) validPages = pages;

    const page = validPages[Math.floor(Math.random() * validPages.length)];
    const image = page.original?.source || page.thumbnail?.source || `https://image.pollinations.ai/prompt/${encodeURIComponent('A high quality 3d render of ' + page.title + ', glowing, highly detailed')}?width=400&height=400&nologo=true&seed=${Math.floor(Math.random()*1000)}`;

    return {
      title: page.title,
      image,
      pageId: page.pageid
    };
  } catch (error) {
    console.error("Wiki fetch error:", error);
    return {
      title: "Unknown Configuration",
      image: "https://image.pollinations.ai/prompt/glitch%20error%20box%20artifact?width=400&height=400&nologo=true",
      pageId: 0
    };
  }
}

export async function generateBattleItems(caseData: CaseType, count: number, startPity: number, forcedRarity?: string | null, forcedShiny?: string | null) {
  let items: Item[] = [];
  let currentPity = startPity || 0;

  const skeletons = Array.from({ length: count }).map(() => {
    let rarity = drawRarity(caseData.id, currentPity);
    if (forcedRarity) {
      const forced = Object.values(RARITIES).find(r => r.id === forcedRarity);
      if (forced) rarity = forced;
    }

    const shinyType = determineShinyType(forcedShiny || undefined);
    const isHighTier = ['Classified', 'Covert', 'Exceedingly Rare'].includes(rarity.name);
    currentPity = isHighTier ? 0 : currentPity + 1;
    const durability = generateDurability();
    const wearInfo = getWearInfo(durability);
    const value = calculateValue(rarity.id, wearInfo.multiplier, caseData, shinyType);
    return { rarity, durability, wearInfo, value, shinyType };
  });

  if (caseData.category === 'CS:GO' && caseData.csgoDrops) {
    skeletons.forEach(skel => {
      let dropKey = skel.rarity.id.toUpperCase().replace('-', '_');
      if (dropKey === 'GOLD') dropKey = 'EXCEEDINGLY_RARE';
      let options = caseData.csgoDrops![dropKey] || Object.values(caseData.csgoDrops!).flat();
      const drop = options[Math.floor(Math.random() * options.length)];
      items.push({
        id: crypto.randomUUID(),
        title: drop.name,
        image: drop.image,
        pageId: 0,
        rarity: skel.rarity.name,
        wear: skel.wearInfo.label,
        durability: skel.durability,
        value: skel.value,
        caseType: caseData.name,
        shinyType: skel.shinyType as any,
        timestamp: Date.now()
      });
    });
  } else {
    // Only fetch up to 10 unique wiki articles at once to prevent massive slowdowns, then reuse them randomly
    const uniqueCountToFetch = Math.min(count, 10);
    const wikiAssets = [];
    const promises = [];
    let focusQuery = caseData.category === 'Random' ? '' : caseData.category;

    for(let i=0; i<uniqueCountToFetch; i++) {
        promises.push(fetchRandomWikiArticle(focusQuery));
    }
    const fetched = await Promise.all(promises);
    wikiAssets.push(...fetched);

    skeletons.forEach((skel, idx) => {
      const asset = wikiAssets[idx % wikiAssets.length] || { title: 'Unknown', image: 'https://image.pollinations.ai/prompt/glitch%20error%20box%20artifact?width=400&height=400&nologo=true', pageId: 0 };
      items.push({
        id: crypto.randomUUID(),
        title: asset.title,
        image: asset.image,
        pageId: asset.pageId,
        rarity: skel.rarity.name,
        wear: skel.wearInfo.label,
        durability: skel.durability,
        value: skel.value,
        caseType: caseData.name,
        shinyType: skel.shinyType as any,
        timestamp: Date.now()
      });
    });
  }

  return { items, finalPity: currentPity };
}
