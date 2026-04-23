const fs = require('fs');
const imageMap = require('./csgo_images.json');

const caseDataRaw = `Category: CS:GO, Case name: CS:GO Weapon Case, Description: The original 2013 collection that started it all, Weapons: (Covert) AWP Lightning Strike; (Classified) AK-47 Case Hardened, Desert Eagle Hypnotic; (Restricted) Glock-18 Dragon Tattoo, M4A1-S Dark Water, USP-S Dark Water; (Mil-Spec) AUG Wings, MP7 Skulls, SG 553 Ultraviolet, odds: Mil-Spec 79.92%, Restricted 15.98%, Classified 3.20%, Covert 0.64%, Exceedingly Rare 0.26%. Category: CS:GO, Case name: eSports 2013 Case, Description: The first community-contributed case supporting the competitive scene, Weapons: (Covert) P90 Death by Kitty; (Classified) AK-47 Red Laminate, AWP Boom; (Restricted) Galil AR Orange DDPAT, P250 Splash, Sawed-Off Orange DDPAT; (Mil-Spec) M4A4 Faded Zebra, MAG-7 Memento, FAMAS Doomkeeper, odds: Mil-Spec 79.92%, Restricted 15.98%, Classified 3.20%, Covert 0.64%, Exceedingly Rare 0.26%. Category: CS:GO, Case name: Operation Bravo Case, Description: A legendary collection featuring the most expensive non-knife skin in history, Weapons: (Covert) AK-47 Fire Serpent; (Classified) Desert Eagle Golden Koi, P90 Emerald Dragon; (Restricted) AWP Graphite, P2000 Ocean Foam, USP-S Overgrowth; (Mil-Spec) Dual Berettas Black Limba, G3SG1 Azure Zebra, M4A4 Faded Zebra, MP9 Hypnotic, Nova Tempest, Galil AR Shattered, SG 553 Wave Spray, odds: Mil-Spec 79.92%, Restricted 15.98%, Classified 3.20%, Covert 0.64%, Exceedingly Rare 0.26%. Category: CS:GO, Case name: Operation Phoenix Weapon Case, Description: Home to the most iconic AWP and AK combo in the game, Weapons: (Covert) AWP Asiimov, AUG Chameleon; (Classified) AK-47 Redline, Nova Antique, P90 Trigon; (Restricted) MAC-10 Heat, SG 553 Pulse, FAMAS Pulse, USP-S Guardian; (Mil-Spec) Negev Terrain, MAG-7 Heaven Guard, G3SG1 Design, Tec-9 Isaac, odds: Mil-Spec 79.92%, Restricted 15.98%, Classified 3.20%, Covert 0.64%, Exceedingly Rare 0.26%. Category: CS:GO, Case name: Huntsman Weapon Case, Description: Features the Huntsman Knife and the high-demand Vulcan finish, Weapons: (Covert) AK-47 Vulcan, M4A4 Desert-Strike; (Classified) M4A1-S Atomic Alloy, SCAR-20 Cyrex, USP-S Caiman; (Restricted) AUG Torque, PP-Bizon Antique, XM1014 Heaven Guard, MAC-10 Tatter; (Mil-Spec) Galil AR Kami, CZ75-Auto Twist, P90 Module, P2000 Ivory, SSG 08 Slashed, Tec-9 Sandstorm, odds: Mil-Spec 79.92%, Restricted 15.98%, Classified 3.20%, Covert 0.64%, Exceedingly Rare 0.26%. Category: CS:GO, Case name: Operation Breakout Weapon Case, Description: The case that introduced the Butterfly Knife and high-tech Cyrex skins, Weapons: (Covert) M4A1-S Cyrex, P90 Asiimov; (Classified) Five-SeveN Fowl Play, Glock-18 Water Elemental, Desert Eagle Conspiracy; (Restricted) Nova Koi, P250 Supernova, CZ75-Auto Tigris, USP-S Blood Tiger; (Mil-Spec) MP7 Urban Hazard, Negev Desert-Strike, SCAR-20 Cyrex, SSG 08 Abyss, UMP-45 Labyrinth, P2000 Ivory, odds: Mil-Spec 79.92%, Restricted 15.98%, Classified 3.20%, Covert 0.64%, Exceedingly Rare 0.26%. Category: CS:GO, Case name: Chroma Case, Description: Introduced the first wave of high-tier knife finishes like Doppler and Marble Fade, Weapons: (Covert) AWP Man-o'-war, Galil AR Chatterbox; (Classified) AK-47 Cartel, M4A4 Dragon King, P250 Muertos; (Restricted) Desert Eagle Naga, MAC-10 Malachite, Sawed-Off Serenity, Dual Berettas Urban Shock; (Mil-Spec) Glock-18 Catacombs, MP9 Deadly Poison, SCAR-20 Grotto, XM1014 Quicksilver, odds: Mil-Spec 79.92%, Restricted 15.98%, Classified 3.20%, Covert 0.64%, Exceedingly Rare 0.26%. Category: CS:GO, Case name: Shadow Case, Description: The debut of Shadow Daggers and the Kill Confirmed pistol, Weapons: (Covert) USP-S Kill Confirmed, M4A1-S Golden Coil; (Classified) AK-47 Frontside Misty, G3SG1 Flux, SSG 08 Big Iron; (Restricted) Dual Berettas Dualing Dragons, FAMAS Survivor Z, Galil AR Stone Cold, SCAR-20 Bloodsport; (Mil-Spec) Glock-18 Wraiths, MAC-10 Rangeen, MAG-7 Cobalt Core, MP7 Special Delivery, P250 Wingshot, odds: Mil-Spec 79.92%, Restricted 15.98%, Classified 3.20%, Covert 0.64%, Exceedingly Rare 0.26%. Category: CS:GO, Case name: Clutch Case, Description: A community favorite featuring second-gen gloves and the Neo-Noir finish, Weapons: (Covert) M4A4 Neo-Noir, MP7 Bloodsport; (Classified) USP-S Cortex, AWP Mortis, AUG Stymphalian; (Restricted) Glock-18 Moonrise, MAG-7 SWAG-7, Negev Lionfish, Nova Wildfire, UMP-45 Arctic Wolf; (Mil-Spec) PP-Bizon Night Riot, Five-SeveN Flame Test, MP9 Black Sand, P2000 Urban Hazard, R8 Revolver Grip, SG 553 Aloha, XM1014 Oxide Blaze, odds: Mil-Spec 79.92%, Restricted 15.98%, Classified 3.20%, Covert 0.64%, Exceedingly Rare 0.26%. Category: CS:GO, Case name: Prisma Case, Description: Neon-heavy collection with the M4A4 Emperor, Weapons: (Covert) M4A4 The Emperor, Five-SeveN Angry Mob; (Classified) AUG Momentum, XM1014 Incinegator, AWP Atheris; (Restricted) Desert Eagle Light Rail, AK-47 Uncharted, R8 Revolver Skull Crusher; (Mil-Spec) Galil AR Akihabara Accept, MP7 Mischief, P250 Verdigris, odds: Mil-Spec 79.92%, Restricted 15.98%, Classified 3.20%, Covert 0.64%, Exceedingly Rare 0.26%. Category: CS:GO, Case name: Operation Broken Fang Case, Description: Introduced the Printstream M4A1-S and high-tier glove drops, Weapons: (Covert) M4A1-S Printstream, Glock-18 Neo-Noir; (Classified) M4A4 Cyber Security, USP-S Monster Mashup, AWP Exoskeleton; (Restricted) Desert Eagle Printstream, Nova Clear Polymer, UMP-45 Gold Bismuth; (Mil-Spec) CZ75-Auto Vendetta, Galil AR Vandal, P90 Cocoa Grange, odds: Mil-Spec 79.92%, Restricted 15.98%, Classified 3.20%, Covert 0.64%, Exceedingly Rare 0.26%. Category: CS:GO, Case name: Kilowatt Case, Description: The first official CS2 case featuring the Zeus skin and Kukri knife, Weapons: (Covert) AK-47 Inheritance, AWP Chrome Cannon; (Classified) M4A1-S Black Lotus, Zeus x27 Olympus, USP-S Jawbreaker; (Restricted) Glock-18 Block-18, M4A4 Etchilly, Five-SeveN Hybrid, MP7 Just Smile; (Mil-Spec) MAC-10 Box Loader, Nova Dark Sigil, SSG 08 Dezastre, Tec-9 Slag, odds: Mil-Spec 79.92%, Restricted 15.98%, Classified 3.20%, Covert 0.64%, Exceedingly Rare 0.26%. Category: CS:GO, Case name: Gallery Case, Description: A 2024 artistic showcase collection, Weapons: (Covert) M4A1-S Vaporwave, AK-47 The Outsiders; (Classified) P250 Epicenter, AWP Chrome bore, UMP-45 Crime Scene; (Restricted) Desert Eagle Heat, Glock-18 Abstract, P90 Abstract; (Mil-Spec) AUG Abstract, FAMAS Abstract, MAC-10 Abstract, odds: Mil-Spec 79.92%, Restricted 15.98%, Classified 3.20%, Covert 0.64%, Exceedingly Rare 0.26%. Category: CS:GO, Case name: Dead Hand Terminal, Description: The premier 2026 terminal release with high-tech aesthetics, Weapons: (Covert) AK-47 The Oligarch, M4A4 Full Throttle; (Classified) MP7 Smoking Kills, Glock-18 Mirror Mosaic, AWP Ice Coaled; (Restricted) UMP-45 Continuum, Nova Ocular, M4A1-S Liquidation; (Mil-Spec) SCAR-20 Caged, P250 Bullfrog, P2000 Red Wing, odds: Mil-Spec 79.92%, Restricted 15.98%, Classified 3.20%, Covert 0.64%, Exceedingly Rare 0.26%.`;

const caseRegex = /Category: CS:GO, Case name: ([^,]+), Description: ([^,]+), Weapons:([^]+?)(?=Category:|$)/g;

let match;
let casesCode = "";
const getSkinImage = (name) => {
    let formatted = name.replace("AW", "AWP").replace("AWPP", "AWP").replace("Chrome bore", "Chrome Cannon");
    
    let potentialKeys = Object.keys(imageMap).filter(k => {
       const keyLower = k.toLowerCase().replace(/-/g, ' ');
       const nameLower = formatted.toLowerCase().replace(/-/g, ' ');
       if (nameLower.indexOf(' ') !== -1) {
           const parts = formatted.split(' ');
           const wpText = parts[0];
           const skinText = parts.slice(1).join(' ');
           return k.toLowerCase().includes(wpText.toLowerCase()) && k.toLowerCase().includes(skinText.toLowerCase());
       }
       return k.toLowerCase().includes(nameLower);
    });
    
    if (potentialKeys.length > 0) return imageMap[potentialKeys[0]] || "";
    return `https://steamcommunity-a.akamaihd.net/economy/image/class/730/error`; // fallback placeholder
};

while ((match = caseRegex.exec(caseDataRaw)) !== null) {
    let [_, name, desc, weaponsData] = match;
    weaponsData = weaponsData.trim();
    // parse weapons
    const typeRegex = /\((Covert|Classified|Restricted|Mil-Spec)\) ([^;]+);?/g;
    let weaponMatch;
    let drops = {};
    while ((weaponMatch = typeRegex.exec(weaponsData)) !== null) {
        let type = weaponMatch[1];
        let weps = weaponMatch[2].split(',').map(w => w.trim());
        
        let targetType;
        if (type === 'Covert') targetType = 'COVERT';
        if (type === 'Classified') targetType = 'CLASSIFIED';
        if (type === 'Restricted') targetType = 'RESTRICTED';
        if (type === 'Mil-Spec') targetType = 'MIL_SPEC';
        
        drops[targetType] = weps.map(w => ({
            name: w,
            image: getSkinImage(w)
        }));
    }
    
    let idStr = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    casesCode += `
  makeCase('${idStr}', '${name}', 'CS:GO', '${desc}', 500, [79.92, 15.98, 3.2, 0.64, 0.26, 0.0], true, undefined, undefined, {
    MIL_SPEC: ${JSON.stringify(drops['MIL_SPEC']) || '[]'},
    RESTRICTED: ${JSON.stringify(drops['RESTRICTED']) || '[]'},
    CLASSIFIED: ${JSON.stringify(drops['CLASSIFIED']) || '[]'},
    COVERT: ${JSON.stringify(drops['COVERT']) || '[]'},
    EXCEEDINGLY_RARE: [
      { name: '★ Karambit | Fade', image: 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbMs8Hbq9D12fzhA_-G0mImZmvHMNanVjjoI65wl0r-RpoqsiVDh_hZvNWijcYCVJFI6NAzWrwfvlOu60ZG7uZXYiSw0X2R_D3k' },
      { name: '★ Butterfly Knife | Crimson Web', image: 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKghovbMs8Hbq9D12fzhA_-K0llOWhPP2Iq2Ewz1cvp9ziuuSrIrx0ALsrUYrYzr2IIGUcFBoYgyF_wTolbnn0JC96prXiSw0VymJ-F0' }
    ]
  }),`;
}

fs.writeFileSync('cases_output.txt', casesCode);
