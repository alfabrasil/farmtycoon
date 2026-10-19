/** Cura base do Dilúvio (% do HP máximo). Cada uso na luta cai 30%: 30 → 21 → 14,7. */
export const WATER_ARENA_HEAL_BASE = 30;
export const WATER_ARENA_HEAL_DECAY = 0.70;

export function waterArenaHealPercent(usesSoFar = 0) {
    const n = Math.max(0, Math.floor(usesSoFar) || 0);
    return WATER_ARENA_HEAL_BASE * Math.pow(WATER_ARENA_HEAL_DECAY, n);
}

/** Cura em HP. O Dilúvio usa % do HP máximo e decai a cada uso na mesma luta. */
export function applySkillHealAmount(skill, maxHp, rooster = null) {
    let pct = skill?.value || 0;
    if (skill?.id === 'w-arena' && skill?.effect === 'heal') {
        const uses = rooster?.waterSpecialHeals || 0;
        pct = waterArenaHealPercent(uses);
        if (rooster) rooster.waterSpecialHeals = uses + 1;
    }
    return Math.max(0, Math.round((maxHp || 0) * (pct / 100)));
}

export const SKILLS = {
    fire: [
        { id: 'f1', nameKey: 'skill-f1-name', level: 1, multiplier: 1.0, cost: 0, type: 'attack', style: 'comet', descKey: 'skill-f1-desc' },
        { id: 'f-ability', nameKey: 'skill-f-ability-name', level: 1, multiplier: 1.35, cost: 20, type: 'attack', style: 'comet', effect: 'burn', chance: 0.25, cooldown: 2, descKey: 'skill-f-ability-desc' },
        { id: 'f5', nameKey: 'skill-f5-name', level: 5, multiplier: 1.4, cost: 30, type: 'attack', style: 'comet', effect: 'burn', chance: 0.3, descKey: 'skill-f5-desc' },
        { id: 'f10', nameKey: 'skill-f10-name', level: 10, multiplier: 2.0, cost: 60, type: 'special', style: 'phoenix', effect: 'heal', value: 20, descKey: 'skill-f10-desc' },
        { id: 'f-arena', nameKey: 'skill-f-arena-name', level: 1, multiplier: 2.0, cost: 40, type: 'special', style: 'ultimate', effect: 'burn', chance: 0.6, descKey: 'skill-f-arena-desc', arenaReq: 'fire', cooldown: 2 }
    ],
    water: [
        { id: 'w1', nameKey: 'skill-w1-name', level: 1, multiplier: 1.0, cost: 0, type: 'attack', style: 'wave', descKey: 'skill-w1-desc' },
        { id: 'w-ability', nameKey: 'skill-w-ability-name', level: 1, multiplier: 1.0, cost: 20, type: 'attack', style: 'wave', effect: 'heal', value: 12, cooldown: 2, descKey: 'skill-w-ability-desc' },
        { id: 'w5', nameKey: 'skill-w5-name', level: 5, multiplier: 0.8, cost: 25, type: 'buff', style: 'shell', effect: 'shield', value: 0.5, duration: 1, descKey: 'skill-w5-desc' },
        { id: 'w10', nameKey: 'skill-w10-name', level: 10, multiplier: 1.8, cost: 55, type: 'attack', style: 'wave', effect: 'aoe', descKey: 'skill-w10-desc' },
        { id: 'w-arena', nameKey: 'skill-w-arena-name', level: 1, multiplier: 1.8, cost: 35, type: 'special', style: 'ultimate', effect: 'heal', value: WATER_ARENA_HEAL_BASE, descKey: 'skill-w-arena-desc', arenaReq: 'water', cooldown: 2 }
    ],
    earth: [
        { id: 'e1', nameKey: 'skill-e1-name', level: 1, multiplier: 1.0, cost: 0, type: 'attack', style: 'brace', descKey: 'skill-e1-desc' },
        { id: 'e-ability', nameKey: 'skill-e-ability-name', level: 1, multiplier: 1.25, cost: 20, type: 'attack', style: 'brace', effect: 'def', value: 1.15, duration: 1, cooldown: 2, descKey: 'skill-e-ability-desc' },
        { id: 'e5', nameKey: 'skill-e5-name', level: 5, multiplier: 0.7, cost: 20, type: 'buff', style: 'brace', effect: 'def', value: 1.5, duration: 2, descKey: 'skill-e5-desc' },
        { id: 'e10', nameKey: 'skill-e10-name', level: 10, multiplier: 1.6, cost: 50, type: 'attack', style: 'quake', effect: 'stun', chance: 0.2, descKey: 'skill-e10-desc' },
        { id: 'e-arena', nameKey: 'skill-e-arena-name', level: 1, multiplier: 2.0, cost: 45, type: 'special', style: 'ultimate', effect: 'stun', chance: 0.45, descKey: 'skill-e-arena-desc', arenaReq: 'earth', cooldown: 2 }
    ],
    air: [
        { id: 'a1', nameKey: 'skill-a1-name', level: 1, multiplier: 1.0, cost: 0, type: 'attack', style: 'dive', descKey: 'skill-a1-desc' },
        { id: 'a-ability', nameKey: 'skill-a-ability-name', level: 1, multiplier: 1.0, cost: 20, type: 'attack', style: 'dive', effect: 'airDoubleNext', cooldown: 2, descKey: 'skill-a-ability-desc' },
        { id: 'a5', nameKey: 'skill-a5-name', level: 5, multiplier: 0.5, cost: 25, type: 'buff', style: 'dive', effect: 'dodge', chance: 0.4, duration: 1, descKey: 'skill-a5-desc' },
        { id: 'a10', nameKey: 'skill-a10-name', level: 10, multiplier: 0.6, cost: 50, style: 'flurry', hits: 3, descKey: 'skill-a10-desc' },
        { id: 'a-arena', nameKey: 'skill-a-arena-name', level: 1, multiplier: 1.7, cost: 30, type: 'special', style: 'ultimate', hits: 5, descKey: 'skill-a-arena-desc', arenaReq: 'air', cooldown: 2 }
    ]
};

export class SkillService {
    static getSkillsForRooster(element, level, arenaId = null) {
        if (!SKILLS[element]) {
            console.error(`SkillService: Elemento inválido '${element}'`);
            return [];
        }

        return SKILLS[element].filter(s => {
            // Filtra por nível
            if (s.level > level) return false;
            if (s.arenaReq) {
                if (!arenaId) return false;
                if (s.arenaReq !== arenaId) return false;
            }
            return true;
        });
    }

    static calculateDamage(baseAtk, skillMultiplier, level) {
        // Factor level into damage for better scaling
        return Math.round((baseAtk * skillMultiplier) * (1 + (level * 0.05)));
    }
}
