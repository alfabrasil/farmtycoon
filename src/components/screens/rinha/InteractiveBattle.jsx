import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../../contexts/LanguageContext';
import { RINHA_CONFIG } from '../../../data/gameConfig';
import { playSound } from '../../../utils/audioSystem';
import { SKILLS, SkillService } from '../../../data/skills';
import { VFX } from '../../../utils/vfx';
import RoosterSprite from './RoosterSprite';
import BattleTopBar from './BattleTopBar';

const sleep = ms => new Promise(r => setTimeout(r, ms));

const ELEMENT_BASE_STRENGTH = {
    FOGO: 100,
    TERRA: 95,
    AGUA: 90,
    AR: 85
};

const COLOR_COUNTERS = {
    VERMELHO: 'AZUL',
    AZUL: 'VERDE',
    VERDE: 'AMARELO',
    AMARELO: 'VERMELHO'
};

const InteractiveBattle = ({ matchData, playerTeam, cpuTeam, mode = '1v1', inventory, onUseItem, onComplete, onExit, initialState, onStateChange }) => {
    const { t } = useLanguage();
    
    // Convert elements/colors to match skills.js keys if needed (FOGO -> fire, etc.)
    const elMap = { FOGO: 'fire', AGUA: 'water', TERRA: 'earth', AR: 'air' };
    const BASE_HP = 300;
    const EFFECT_HP_BASELINE = 100;
    const elementFxClass = (elKey) => `rinha-fx-${String(elKey || 'fire').toLowerCase()}`;
    const arenaMagicClass = (elKey) => `arena-magic-${String(elKey || 'fire').toLowerCase()}`;
    const arenaKey = elMap[matchData?.arena?.advantage] || 'fire';
    const arenaBonus = typeof matchData?.arena?.bonus === 'number' ? matchData.arena.bonus : 0.25;
    const arenaAdvantage = matchData?.arena?.advantage || 'FOGO';
    const arenaRootClass = `rinha-arena-${arenaKey}`;
    const arenaBadgeClass = `rinha-arena-badge-${arenaKey}`;
    
    // State
    const [gameState, setGameState] = useState('INIT'); // INIT, TURN_START, PLAYER_ACTION, CPU_ACTION, ANIMATING, FINISHED
    const [pTeam, setPTeam] = useState([]);
    const [cTeam, setCTeam] = useState([]);
    
    const [activePIdx, setActivePIdx] = useState(0);
    const [activeCIdx, setActiveCIdx] = useState(0);
    
    const [turnTimer, setTurnTimer] = useState(15);
    const [showSkills, setShowSkills] = useState(false);
    const [showItems, setShowItems] = useState(false);
    const [isAuto, setIsAuto] = useState(false);
    const [showFx, setShowFx] = useState(true);
    
    const [floatingTexts, setFloatingTexts] = useState([]);
    const [logs, setLogs] = useState([]);
    
    const pRefs = useRef([]);
    const cRefs = useRef([]);
    const timerRef = useRef(null);
    const cpuTimeoutRef = useRef(null);
    const autoTimeoutRef = useRef(null);
    const stateSyncTimeoutRef = useRef(null);
    const initialAppliedRef = useRef(false);
    const actionLockRef = useRef(false);
    
    const clearBattleClasses = (node) => {
        if (!node) return;
        node.classList.remove(
            'anim-lunge-up',
            'anim-lunge-down',
            'anim-wing-flap',
            'anim-hit',
            'anim-ko-l',
            'anim-ko-r',
            'target-rooster',
            'arena-magic-cast',
            'arena-magic-fire',
            'arena-magic-water',
            'arena-magic-earth',
            'arena-magic-air',
            'anim-winner-l',
            'anim-winner-r'
        );
    };

    // Initialize Teams
    useEffect(() => {
        if (initialState && !initialAppliedRef.current) return;
        const initTeam = (team) => team.map(r => {
            const isArenaMatch = r.element === arenaAdvantage;
            const hpArenaBonus = isArenaMatch ? arenaBonus : 0;
            const elementBase = ELEMENT_BASE_STRENGTH[r.element] || 100;
            const hpMultiplier = elementBase / 100; // Fire=1.0, Earth=0.95, Water=0.90, Air=0.85
            const baseHpCalculated = BASE_HP * hpMultiplier;
            const hp = Math.round(baseHpCalculated * (1 + hpArenaBonus));
            return {
                ...r,
                hpMax: hp,
                hp: hp,
                energy: 100,
                energyMax: 100,
                cooldowns: {},
                status: { shield: 1, shieldTurns: 0, def: 1, defTurns: 0, dodgeChance: 0, dodgeTurns: 0, dmgBoost: 1, dmgBoostTurns: 0, burnTurns: 0, burnDmg: 0, stun: false, ultUsed: false, airDoubleNext: 0 },
                elKey: elMap[r.element] || 'fire'
            };
        });
        
        setPTeam(initTeam(playerTeam));
        setCTeam(initTeam(cpuTeam));
        setGameState('TURN_START');
        playSound('achievement');
    }, [playerTeam, cpuTeam, matchData?.arena?.id]);

    useEffect(() => {
        if (!initialState) return;
        if (initialAppliedRef.current) return;
        if (!Array.isArray(initialState.pTeam) || !Array.isArray(initialState.cTeam)) return;

        initialAppliedRef.current = true;
        setPTeam(initialState.pTeam);
        setCTeam(initialState.cTeam);
        setActivePIdx(initialState.activePIdx ?? 0);
        setActiveCIdx(initialState.activeCIdx ?? 0);
        setTurnTimer(initialState.turnTimer ?? 15);
        setIsAuto(Boolean(initialState.isAuto));
        setShowFx(initialState.showFx === undefined ? true : Boolean(initialState.showFx));
        setShowSkills(Boolean(initialState.showSkills));
        setShowItems(Boolean(initialState.showItems));
        setLogs(Array.isArray(initialState.logs) ? initialState.logs : []);
        setGameState(initialState.gameState || 'TURN_START');
    }, [initialState]);

    useEffect(() => {
        if (!onStateChange) return;
        if (gameState === 'INIT') return;
        clearTimeout(stateSyncTimeoutRef.current);
        stateSyncTimeoutRef.current = setTimeout(() => {
            onStateChange({
                gameState,
                pTeam,
                cTeam,
                activePIdx,
                activeCIdx,
                turnTimer,
                isAuto,
                showFx,
                showSkills,
                showItems,
                logs
            });
        }, 250);
        return () => clearTimeout(stateSyncTimeoutRef.current);
    }, [onStateChange, gameState, pTeam, cTeam, activePIdx, activeCIdx, turnTimer, isAuto, showFx, showSkills, showItems, logs]);

    useEffect(() => {
        if (gameState === 'PLAYER_ACTION') {
            actionLockRef.current = false;
        }
    }, [gameState]);

    const addLog = (msg) => {
        setLogs(prev => [...prev, msg].slice(-5));
    };

    const addFloatingText = (target, idx, text, isCritical, isHeal) => {
        const id = Date.now() + Math.random();
        setFloatingTexts(prev => [...prev, { id, target, idx, text, isCritical, isHeal }]);
        setTimeout(() => {
            setFloatingTexts(prev => prev.filter(t => t.id !== id));
        }, 1500);
    };

    const selectPlayerRooster = (idx) => {
        if (mode !== '3v3') return;
        if (isAuto) return;
        if (gameState !== 'PLAYER_ACTION') return;
        const r = pTeam[idx];
        if (!r || r.hp <= 0) return;
        setActivePIdx(idx);
        setShowSkills(false);
        setShowItems(false);
        playSound('pop');
    };

    const calculateDamage = (attacker, defender, skill, isArenaMatch) => {
        const base = ELEMENT_BASE_STRENGTH[attacker.element] || 100;
        const hpArenaBonus = isArenaMatch ? 1.25 : 1;
        const colorBonus = COLOR_COUNTERS[attacker.color] === defender.color ? 1.30 : 1;
        
        let score = base * hpArenaBonus * colorBonus;
        let dmg = SkillService.calculateDamage(score, skill.multiplier || 1, attacker.level || 1);

        if (attacker?.status?.dmgBoostTurns > 0) {
            dmg *= (attacker.status.dmgBoost || 1.2);
        }
        
        // Jitter
        dmg *= (0.98 + Math.random() * 0.04);
        
        // Critical / Weak
        let type = 'normal';
        const rand = Math.random();
        if (rand < 0.10) { dmg *= 1.5; type = 'critical'; }
        else if (rand > 0.90) { dmg *= 0.7; type = 'weak'; }
        
        if (defender.status?.dodgeTurns > 0 && defender.status?.dodgeChance > 0) {
            if (Math.random() < defender.status.dodgeChance) {
                return { value: 0, type: 'dodge' };
            }
        }

        // Defense/Shield
        dmg = dmg * defender.status.shield * (1 / defender.status.def) * 0.15; // 0.15 scaling factor

        if (matchData?.arena?.advantage === 'TERRA' && defender.element === 'TERRA') {
            dmg *= 0.85;
        }
        
        return { value: Math.max(0, Math.round(dmg)), type };
    };

    const tickStartPassives = async (who) => {
        let newPTeam = [...pTeam];
        let newCTeam = [...cTeam];

        const isPlayer = who === 'PLAYER';
        const team = isPlayer ? newPTeam : newCTeam;
        const idx = isPlayer ? activePIdx : activeCIdx;
        const r = team[idx];
        if (!r || r.hp <= 0) return { p: newPTeam, c: newCTeam, stop: false };

        const node = isPlayer ? pRefs.current[idx] : cRefs.current[idx];
        const targetKey = isPlayer ? 'p' : 'c';

        if (r.status?.burnTurns > 0 && r.status?.burnDmg > 0) {
            const dmg = Math.max(1, Math.round(r.status.burnDmg));
            r.hp = Math.max(0, r.hp - dmg);
            addFloatingText(targetKey, idx, `🔥 -${dmg}`, false, false);
            if (node) node.classList.add('anim-hit');
            setTimeout(() => node && node.classList.remove('anim-hit'), 350);
            playSound('punch');

            r.status.burnTurns = Math.max(0, r.status.burnTurns - 1);
            r.status.burnDmg = r.status.burnTurns > 0 ? Math.max(1, Math.round(dmg * 0.1)) : 0;
            if (r.hp <= 0) {
                if (isPlayer) setPTeam(newPTeam); else setCTeam(newCTeam);
                checkWinCondition(newPTeam, newCTeam, isPlayer ? 'CPU' : 'PLAYER');
                return { p: newPTeam, c: newCTeam, stop: true };
            }
        }

        if (matchData?.arena?.advantage === 'AGUA' && r.element === 'AGUA') {
            const heal = Math.max(1, Math.round(EFFECT_HP_BASELINE * 0.05));
            const before = r.hp;
            r.hp = Math.min(r.hpMax, r.hp + heal);
            const delta = r.hp - before;
            if (delta > 0) {
                addFloatingText(targetKey, idx, `💧 +${delta}`, false, true);
                playSound('upgrade');
            }
        }

        if (isPlayer) setPTeam(newPTeam); else setCTeam(newCTeam);
        return { p: newPTeam, c: newCTeam, stop: false };
    };

    const processAction = async (actionType, id) => {
        if (actionLockRef.current) return;
        actionLockRef.current = true;
        const passive = await tickStartPassives('PLAYER');
        if (passive.stop) {
            actionLockRef.current = false;
            return;
        }
        const pTeamNow = passive.p;
        const cTeamNow = passive.c;

        setGameState('ANIMATING');
        setShowSkills(false);
        setShowItems(false);
        clearInterval(timerRef.current);
        
        let newPTeam = [...pTeamNow];
        let newCTeam = [...cTeamNow];
        let pGal = newPTeam[activePIdx];
        let cGal = newCTeam[activeCIdx];
        
        if (actionType === 'ultimate') {
            pGal.status.ultUsed = true;
            const skillNameKey = `cockfight_ult_${pGal.elKey}_name`;
            
            const pNode = pRefs.current[activePIdx];
            const cNode = cRefs.current[activeCIdx];
            
            clearBattleClasses(pNode);
            clearBattleClasses(cNode);
            
            if (pNode) pNode.classList.add('anim-lunge-up', 'anim-wing-flap', 'arena-magic-cast', arenaMagicClass(pGal.elKey));
            if (cNode) cNode.classList.add('target-rooster');
            
            playSound(`ult_${pGal.elKey}`);
            if (showFx) VFX.playUltimate(pGal.elKey, pNode, cNode);
            
            await sleep(400);
            
            let multiplier = pGal.elKey === 'fire' ? 2.5 : 1.5;
            
            const originalDef = cGal.status.def;
            const originalShield = cGal.status.shield;
            const originalDodgeTurns = cGal.status.dodgeTurns;
            const originalDodgeChance = cGal.status.dodgeChance;
            
            if (pGal.elKey === 'earth') {
                cGal.status.def = 1;
                cGal.status.shield = 1;
            }
            if (pGal.elKey === 'air') {
                cGal.status.dodgeTurns = 0;
                cGal.status.dodgeChance = 0;
            }
            
            const isArenaMatch = matchData.arena.advantage === pGal.element;
            const dmgInfo = calculateDamage(pGal, cGal, { multiplier }, isArenaMatch);
            
            if (pGal.elKey === 'earth') {
                cGal.status.def = originalDef;
                cGal.status.shield = originalShield;
            }
            if (pGal.elKey === 'air') {
                cGal.status.dodgeTurns = originalDodgeTurns;
                cGal.status.dodgeChance = originalDodgeChance;
            }
            
            const total = Math.max(0, dmgInfo.value);
            if (total > 0) {
                cGal.hp = Math.max(0, cGal.hp - total);
                addFloatingText('c', activeCIdx, `-${total}`, dmgInfo.type === 'critical', false);
                
                if (pGal.elKey === 'water') {
                    const lifesteal = Math.max(1, Math.round(total * 0.3));
                    pGal.hp = Math.min(pGal.hpMax, pGal.hp + lifesteal);
                    addFloatingText('p', activePIdx, `+${lifesteal}`, false, true);
                }

 
                
                if (cGal.hp <= 0) {
                    playSound('defeat');
                } else {
                    if (cNode) cNode.classList.add('anim-hit');
                    setTimeout(() => cNode && cNode.classList.remove('anim-hit'), 350);
                }
            } else if (dmgInfo.type === 'dodge') {
                addFloatingText('c', activeCIdx, 'DODGE', false, false);
            }
            
            addLog(`You used ${t(skillNameKey) || 'Ultimate'}`);
            
        } else if (actionType === 'skill') {
            const skill = SKILLS[pGal.elKey].find(s => s.id === id);
            pGal.energy -= skill.cost;
            if (skill.cooldown) pGal.cooldowns[skill.id] = skill.cooldown;
            const baseSkillId = SKILLS[pGal.elKey]?.[0]?.id;
            const isBasicSkill = skill.id === baseSkillId;
            
            // Animation Player
            const pNode = pRefs.current[activePIdx];
            const cNode = cRefs.current[activeCIdx];
            
            clearBattleClasses(pNode);
            clearBattleClasses(cNode);
            
            if (pNode) pNode.classList.add('anim-lunge-up', 'anim-wing-flap');
            if (cNode) cNode.classList.add('target-rooster');
            playSound(isBasicSkill ? 'punch' : pGal.elKey);
            
            const isArenaMatch = matchData.arena.advantage === pGal.element;
            const dmgInfo = calculateDamage(pGal, cGal, skill, isArenaMatch);
            
            if (skill.type === 'ultimate') {
                const vfxTarget = (skill.effect === 'heal' || skill.type === 'buff') ? pNode : cNode;
                if (pNode) pNode.classList.add('arena-magic-cast', arenaMagicClass(pGal.elKey));
                if (showFx && !isBasicSkill && vfxTarget) VFX.play(pGal.elKey, vfxTarget);
            }
            else {
                const vfxTarget = (skill.effect === 'heal' || skill.type === 'buff') ? pNode : cNode;
                if (showFx && !isBasicSkill && vfxTarget) VFX.play(pGal.elKey, vfxTarget);
            }
            
            await sleep(400);
            
            if (skill.effect === 'heal') {
                const heal = Math.round(EFFECT_HP_BASELINE * (skill.value / 100) * (isArenaMatch ? (1 + arenaBonus) : 1));
                pGal.hp = Math.min(pGal.hpMax, pGal.hp + heal);
                addFloatingText('p', activePIdx, `+${heal}`, false, true);

                if (pGal.elKey === 'water' && skill.type === 'ultimate') {
                    const total = Math.max(0, dmgInfo.value);
                    if (total > 0) {
                        cGal.hp = Math.max(0, cGal.hp - total);
                        addFloatingText('c', activeCIdx, `-${total}`, dmgInfo.type === 'critical', false);
                        if (cNode) cNode.classList.add('anim-hit');
                        setTimeout(() => cNode && cNode.classList.remove('anim-hit'), 350);
                    } else if (dmgInfo.type === 'dodge') {
                        addFloatingText('c', activeCIdx, 'DODGE', false, false);
                    }
                } else if (pGal.elKey === 'water' && skill.id === 'w-ability') {
                    const total = Math.max(0, dmgInfo.value);
                    if (total > 0) {
                        cGal.hp = Math.max(0, cGal.hp - total);
                        addFloatingText('c', activeCIdx, `-${total}`, dmgInfo.type === 'critical', false);
                        if (cNode) cNode.classList.add('anim-hit');
                        setTimeout(() => cNode && cNode.classList.remove('anim-hit'), 350);
                    } else if (dmgInfo.type === 'dodge') {
                        addFloatingText('c', activeCIdx, 'DODGE', false, false);
                    }
                }
            } else if (skill.type === 'buff' && (skill.effect === 'shield' || skill.effect === 'def' || skill.effect === 'dodge' || skill.effect === 'airDoubleNext')) {
                if (skill.effect === 'shield') {
                    pGal.status.shield = skill.value;
                    pGal.status.shieldTurns = skill.duration || 1;
                    addFloatingText('p', activePIdx, 'SHIELD', false, true);
                } else if (skill.effect === 'def') {
                    pGal.status.def = skill.value;
                    pGal.status.defTurns = skill.duration || 1;
                    addFloatingText('p', activePIdx, 'DEF', false, true);
                } else if (skill.effect === 'dodge') {
                    pGal.status.dodgeChance = skill.chance || 0.3;
                    pGal.status.dodgeTurns = skill.duration || 1;
                    addFloatingText('p', activePIdx, 'DODGE', false, true);
                } else if (skill.effect === 'airDoubleNext') {
                    pGal.status.airDoubleNext = 1;
                    addFloatingText('p', activePIdx, '⚡ 2X NEXT', false, true);
                }
            } else {
                const total = Math.max(0, dmgInfo.value);
                if (total > 0) {
                    cGal.hp = Math.max(0, cGal.hp - total);
                    addFloatingText('c', activeCIdx, `-${total}`, dmgInfo.type === 'critical', false);
                    if (cGal.hp <= 0) {
                        playSound('defeat');
                    }
                    if (isBasicSkill && pGal.elKey === 'air' && (pGal.status?.airDoubleNext || 0) > 0) {
                        pGal.status.airDoubleNext = 0;
                        if (cGal.hp > 0) {
                            await sleep(180);
                            cGal.hp = Math.max(0, cGal.hp - total);
                            addFloatingText('c', activeCIdx, `-${total}`, false, false);
                            if (cNode) cNode.classList.add('anim-hit');
                            setTimeout(() => cNode && cNode.classList.remove('anim-hit'), 350);
                            playSound('punch');
                        }
                    }
                } else if (dmgInfo.type === 'dodge') {
                    addFloatingText('c', activeCIdx, 'DODGE', false, false);
                }
                if (cNode) cNode.classList.add('anim-hit');
                setTimeout(() => cNode && cNode.classList.remove('anim-hit'), 350);
            }
            
            // Apply status
            if (skill.effect === 'burn' && Math.random() < skill.chance) {
                cGal.status.burnTurns = 3;
                cGal.status.burnDmg = Math.max(1, Math.round(EFFECT_HP_BASELINE * 0.05));
            }
            if (skill.effect === 'stun' && Math.random() < skill.chance) cGal.status.stun = true;
            if (skill.effect === 'airDoubleNext') {
                pGal.status.airDoubleNext = 1;
                addFloatingText('p', activePIdx, '⚡ 2X NEXT', false, true);
            }
            if (skill.effect === 'shield' && skill.type !== 'buff') {
                pGal.status.shield = skill.value;
                pGal.status.shieldTurns = skill.duration || 1;
            }
            if (skill.effect === 'def' && skill.type !== 'buff') {
                pGal.status.def = skill.value;
                pGal.status.defTurns = skill.duration || 1;
            }

            if (matchData?.arena?.advantage === 'FOGO' && pGal.element === 'FOGO' && skill.effect !== 'heal') {
                cGal.status.burnTurns = 2;
                cGal.status.burnDmg = Math.max(1, Math.round(EFFECT_HP_BASELINE * 0.08));
            }

 
            
            addLog(`You used ${t(skill.nameKey)}`);
            
        } else if (actionType === 'item') {
            const item = inventory.find(i => i.id === id);
            if (item && item.count > 0) {
                const cd = id === 'shield_item' ? (pGal.cooldowns?.shield_item || 0) : 0;
                if (cd > 0) {
                    const msg = t('cockfight_shield_cooldown', [cd]) || `🛡️ ESCUDO EM COOLDOWN ${cd}T`;
                    addFloatingText('p', activePIdx, msg, false, false);
                    addLog(t('cockfight_shield_cooldown_log', [cd]) || `Shield cooldown: ${cd}T`);
                    await sleep(250);
                    setPTeam(newPTeam);
                    setCTeam(newCTeam);
                    setGameState('PLAYER_ACTION');
                    actionLockRef.current = false;
                    return;
                }
                onUseItem(id);
                if (item.type === 'hp') {
                    const heal = Math.round(EFFECT_HP_BASELINE * (item.value / 100));
                    pGal.hp = Math.min(pGal.hpMax, pGal.hp + heal);
                    addFloatingText('p', activePIdx, `+${heal}`, false, true);
                    playSound('upgrade');
                    addLog(`You used HP Potion`);
                } else if (item.type === 'energy') {
                    pGal.energy = Math.min(pGal.energyMax, pGal.energy + item.value);
                    addFloatingText('p', activePIdx, `+${item.value} MP`, false, true);
                    pGal.status = pGal.status || {};
                    pGal.status.dmgBoost = 1.2;
                    pGal.status.dmgBoostTurns = 1;
                    addFloatingText('p', activePIdx, `⚔️ +20% 1T`, false, true);
                    playSound('cash');
                    addLog(`You used Energy Potion`);
                } else if (item.type === 'shield') {
                    pGal.status.shield = 0.1;
                    pGal.status.shieldTurns = 2;
                    pGal.cooldowns = { ...(pGal.cooldowns || {}), shield_item: 2 };
                    addFloatingText('p', activePIdx, `🛡️ SHIELD 2T`, false, true);
                    playSound('success');
                    addLog(`You used Shield`);
                }
            }
            await sleep(500);
        }
        
        setPTeam(newPTeam);
        setCTeam(newCTeam);
        
        await sleep(600);
        if (pRefs.current[activePIdx]) pRefs.current[activePIdx].classList.remove('anim-lunge-up', 'anim-wing-flap', 'arena-magic-cast', arenaMagicClass(pGal.elKey));
        if (cRefs.current[activeCIdx]) cRefs.current[activeCIdx].classList.remove('target-rooster');
        
        checkWinCondition(newPTeam, newCTeam, 'PLAYER');
    };

    const cpuAction = async () => {
        const passive = await tickStartPassives('CPU');
        if (passive.stop) return;
        const pTeamNow = passive.p;
        const cTeamNow = passive.c;

        setGameState('ANIMATING');
        let newPTeam = [...pTeamNow];
        let newCTeam = [...cTeamNow];
        let pGal = newPTeam[activePIdx];
        let cGal = newCTeam[activeCIdx];
        
        if (cGal.status.stun) {
            addFloatingText('c', activeCIdx, t('cockfight_stunned'), false, false);
            cGal.status.stun = false;
            await sleep(1000);
        } else {
            const isUltReady = cGal.hp <= (cGal.hpMax * 0.3) && !cGal.status.ultUsed;

            if (isUltReady) {
                cGal.status.ultUsed = true;
                const skillNameKey = `cockfight_ult_${cGal.elKey}_name`;
                
                const pNode = pRefs.current[activePIdx];
                const cNode = cRefs.current[activeCIdx];
                
                clearBattleClasses(pNode);
                clearBattleClasses(cNode);
                
                if (cNode) cNode.classList.add('anim-lunge-down', 'anim-wing-flap', 'arena-magic-cast', arenaMagicClass(cGal.elKey));
                if (pNode) pNode.classList.add('target-rooster');
                playSound(`ult_${cGal.elKey}`);
                
                if (showFx) VFX.playUltimate(cGal.elKey, cNode, pNode);
                
                await sleep(400);
                
                let multiplier = cGal.elKey === 'fire' ? 2.5 : 1.5;
                
                const originalDef = pGal.status.def;
                const originalShield = pGal.status.shield;
                const originalDodgeTurns = pGal.status.dodgeTurns;
                const originalDodgeChance = pGal.status.dodgeChance;
                
                if (cGal.elKey === 'earth') {
                    pGal.status.def = 1;
                    pGal.status.shield = 1;
                }
                if (cGal.elKey === 'air') {
                    pGal.status.dodgeTurns = 0;
                    pGal.status.dodgeChance = 0;
                }
                
                const isArenaMatch = matchData.arena.advantage === cGal.element;
                const dmgInfo = calculateDamage(cGal, pGal, { multiplier }, isArenaMatch);
                
                if (cGal.elKey === 'earth') {
                    pGal.status.def = originalDef;
                    pGal.status.shield = originalShield;
                }
                if (cGal.elKey === 'air') {
                    pGal.status.dodgeTurns = originalDodgeTurns;
                    pGal.status.dodgeChance = originalDodgeChance;
                }
                
                const total = Math.max(0, dmgInfo.value);
                if (total > 0) {
                    pGal.hp = Math.max(0, pGal.hp - total);
                    addFloatingText('p', activePIdx, `-${total}`, dmgInfo.type === 'critical', false);
                    
                    if (cGal.elKey === 'water') {
                        const lifesteal = Math.max(1, Math.round(total * 0.3));
                        cGal.hp = Math.min(cGal.hpMax, cGal.hp + lifesteal);
                        addFloatingText('c', activeCIdx, `+${lifesteal}`, false, true);
                    }

 
                    
                    if (pGal.hp <= 0) {
                        playSound('defeat');
                    } else {
                        if (pNode) pNode.classList.add('anim-hit');
                        setTimeout(() => pNode && pNode.classList.remove('anim-hit'), 350);
                    }
                } else if (dmgInfo.type === 'dodge') {
                    addFloatingText('p', activePIdx, 'DODGE', false, false);
                }
                
                addLog(`CPU used ${t(skillNameKey) || 'Ultimate'}`);
                
                await sleep(600);
                if (cNode) cNode.classList.remove('anim-lunge-down', 'anim-wing-flap', 'arena-magic-cast', arenaMagicClass(cGal.elKey));
                if (pNode) pNode.classList.remove('target-rooster');
                
            } else {
                const arenaKey = elMap[matchData.arena.advantage];
                const skills = SkillService.getSkillsForRooster(cGal.elKey, cGal.level || 1, arenaKey);
                const affordable = skills.filter(s => s.cost <= cGal.energy && !(cGal.cooldowns[s.id] > 0));
                const skill = affordable.length > 0 ? affordable[Math.floor(Math.random() * affordable.length)] : skills[0];
                
                cGal.energy -= skill.cost;
                if (skill.cooldown) cGal.cooldowns[skill.id] = skill.cooldown;
                
                const pNode = pRefs.current[activePIdx];
                const cNode = cRefs.current[activeCIdx];
                
                clearBattleClasses(pNode);
                clearBattleClasses(cNode);
                
                if (cNode) cNode.classList.add('anim-lunge-down', 'anim-wing-flap');
                if (pNode) pNode.classList.add('target-rooster');
                const baseSkillId = SKILLS[cGal.elKey]?.[0]?.id;
                const isBasicSkill = skill.id === baseSkillId;
                playSound(isBasicSkill ? 'punch' : cGal.elKey);
                
                const isArenaMatch = matchData.arena.advantage === cGal.element;
                const dmgInfo = calculateDamage(cGal, pGal, skill, isArenaMatch);
                
                if (skill.type === 'ultimate') {
                    const vfxTarget = (skill.effect === 'heal' || skill.type === 'buff') ? cNode : pNode;
                    if (cNode) cNode.classList.add('arena-magic-cast', arenaMagicClass(cGal.elKey));
                    if (showFx && !isBasicSkill && vfxTarget) VFX.play(cGal.elKey, vfxTarget);
                }
                else {
                    const vfxTarget = (skill.effect === 'heal' || skill.type === 'buff') ? cNode : pNode;
                    if (showFx && !isBasicSkill && vfxTarget) VFX.play(cGal.elKey, vfxTarget);
                }
                
                await sleep(400);
                
                if (skill.effect === 'heal') {
                    const heal = Math.round(EFFECT_HP_BASELINE * (skill.value / 100) * (isArenaMatch ? (1 + arenaBonus) : 1));
                    cGal.hp = Math.min(cGal.hpMax, cGal.hp + heal);
                    addFloatingText('c', activeCIdx, `+${heal}`, false, true);

                    if (cGal.elKey === 'water' && skill.type === 'ultimate') {
                        const total = Math.max(0, dmgInfo.value);
                        if (total > 0) {
                            pGal.hp = Math.max(0, pGal.hp - total);
                            addFloatingText('p', activePIdx, `-${total}`, dmgInfo.type === 'critical', false);
                            if (pNode) pNode.classList.add('anim-hit');
                            setTimeout(() => pNode && pNode.classList.remove('anim-hit'), 350);
                        } else if (dmgInfo.type === 'dodge') {
                            addFloatingText('p', activePIdx, 'DODGE', false, false);
                        }
                    } else if (cGal.elKey === 'water' && skill.id === 'w-ability') {
                        const total = Math.max(0, dmgInfo.value);
                        if (total > 0) {
                            pGal.hp = Math.max(0, pGal.hp - total);
                            addFloatingText('p', activePIdx, `-${total}`, dmgInfo.type === 'critical', false);
                            if (pNode) pNode.classList.add('anim-hit');
                            setTimeout(() => pNode && pNode.classList.remove('anim-hit'), 350);
                        } else if (dmgInfo.type === 'dodge') {
                            addFloatingText('p', activePIdx, 'DODGE', false, false);
                        }
                    }
                } else if (skill.type === 'buff' && (skill.effect === 'shield' || skill.effect === 'def' || skill.effect === 'dodge' || skill.effect === 'airDoubleNext')) {
                    if (skill.effect === 'shield') {
                        cGal.status.shield = skill.value;
                        cGal.status.shieldTurns = skill.duration || 1;
                        addFloatingText('c', activeCIdx, 'SHIELD', false, true);
                    } else if (skill.effect === 'def') {
                        cGal.status.def = skill.value;
                        cGal.status.defTurns = skill.duration || 1;
                        addFloatingText('c', activeCIdx, 'DEF', false, true);
                    } else if (skill.effect === 'dodge') {
                        cGal.status.dodgeChance = skill.chance || 0.3;
                        cGal.status.dodgeTurns = skill.duration || 1;
                        addFloatingText('c', activeCIdx, 'DODGE', false, true);
                    } else if (skill.effect === 'airDoubleNext') {
                        cGal.status.airDoubleNext = 1;
                        addFloatingText('c', activeCIdx, '⚡ 2X NEXT', false, true);
                    }
                } else {
                    const total = Math.max(0, dmgInfo.value);
                    if (total > 0) {
                        pGal.hp = Math.max(0, pGal.hp - total);
                        addFloatingText('p', activePIdx, `-${total}`, dmgInfo.type === 'critical', false);
                        if (pGal.hp <= 0) {
                            playSound('defeat');
                        }
                        if (isBasicSkill && cGal.elKey === 'air' && (cGal.status?.airDoubleNext || 0) > 0) {
                            cGal.status.airDoubleNext = 0;
                            if (pGal.hp > 0) {
                                await sleep(180);
                                pGal.hp = Math.max(0, pGal.hp - total);
                                addFloatingText('p', activePIdx, `-${total}`, false, false);
                                if (pNode) pNode.classList.add('anim-hit');
                                setTimeout(() => pNode && pNode.classList.remove('anim-hit'), 350);
                                playSound('punch');
                            }
                        }
                    } else if (dmgInfo.type === 'dodge') {
                        addFloatingText('p', activePIdx, 'DODGE', false, false);
                    }
                    if (pNode) pNode.classList.add('anim-hit');
                    setTimeout(() => pNode && pNode.classList.remove('anim-hit'), 350);
                }

            if (skill.effect === 'burn' && Math.random() < (skill.chance || 0)) {
                pGal.status.burnTurns = 3;
                pGal.status.burnDmg = Math.max(1, Math.round(EFFECT_HP_BASELINE * 0.05));
            }
            if (skill.effect === 'stun' && Math.random() < (skill.chance || 0)) pGal.status.stun = true;
            if (skill.effect === 'airDoubleNext') {
                cGal.status.airDoubleNext = 1;
                addFloatingText('c', activeCIdx, '⚡ 2X NEXT', false, true);
            }
            if (skill.effect === 'shield' && skill.type !== 'buff') {
                cGal.status.shield = skill.value;
                cGal.status.shieldTurns = skill.duration || 1;
            }
            if (skill.effect === 'def' && skill.type !== 'buff') {
                cGal.status.def = skill.value;
                cGal.status.defTurns = skill.duration || 1;
            }
            
            addLog(`CPU used ${t(skill.nameKey)}`);

            if (matchData?.arena?.advantage === 'FOGO' && cGal.element === 'FOGO' && skill.effect !== 'heal') {
                pGal.status.burnTurns = 2;
                pGal.status.burnDmg = Math.max(1, Math.round(EFFECT_HP_BASELINE * 0.08));
            }

 
            
                await sleep(600);
                if (cNode) cNode.classList.remove('anim-lunge-down', 'anim-wing-flap', 'arena-magic-cast', arenaMagicClass(cGal.elKey));
                if (pNode) pNode.classList.remove('target-rooster');
            }
        }
        
        setPTeam(newPTeam);
        setCTeam(newCTeam);
        checkWinCondition(newPTeam, newCTeam, 'CPU');
    };

    const checkWinCondition = (currentPTeam, currentCTeam, lastTurn) => {
        const pAlive = currentPTeam.findIndex(r => r.hp > 0);
        const cAlive = currentCTeam.findIndex(r => r.hp > 0);
        
        if (cAlive === -1) {
            setGameState('FINISHED');
            const pNode = pRefs.current[activePIdx];
            if (pNode) pNode.classList.add('anim-winner-l');
            setTimeout(() => onComplete('WIN'), 1200);
            return;
        }
        if (pAlive === -1) {
            setGameState('FINISHED');
            const cNode = cRefs.current[activeCIdx];
            if (cNode) cNode.classList.add('anim-winner-r');
            setTimeout(() => onComplete('LOSS'), 1200);
            return;
        }

        const pActiveValid = activePIdx >= 0 && activePIdx < currentPTeam.length;
        const cActiveValid = activeCIdx >= 0 && activeCIdx < currentCTeam.length;
        const pActiveAlive = pActiveValid && (currentPTeam[activePIdx]?.hp > 0);
        const cActiveAlive = cActiveValid && (currentCTeam[activeCIdx]?.hp > 0);

        if (!pActiveAlive && pAlive !== -1) setActivePIdx(pAlive);
        if (!cActiveAlive && cAlive !== -1) setActiveCIdx(cAlive);
        
        if (lastTurn === 'PLAYER') {
            setGameState('CPU_ACTION');
        } else {
            advanceTurn(currentPTeam, currentCTeam);
        }
    };

    const advanceTurn = (currentPTeam, currentCTeam) => {
        // Regen Energy & Cooldowns
        let newPTeam = [...currentPTeam];
        let newCTeam = [...currentCTeam];
        const energyRegen = mode === '3v3' ? 50 : 20;
        
        newPTeam.forEach(r => {
            if (r.hp > 0) r.energy = Math.min(r.energyMax, r.energy + energyRegen);
            Object.keys(r.cooldowns).forEach(k => {
                if (r.cooldowns[k] > 0) r.cooldowns[k]--;
            });
            if (r.status?.shieldTurns > 0) {
                r.status.shieldTurns--;
                if (r.status.shieldTurns <= 0) r.status.shield = 1;
            }
            if (r.status?.defTurns > 0) {
                r.status.defTurns--;
                if (r.status.defTurns <= 0) r.status.def = 1;
            }
            if (r.status?.dodgeTurns > 0) {
                r.status.dodgeTurns--;
                if (r.status.dodgeTurns <= 0) r.status.dodgeChance = 0;
            }
            if (r.status?.dmgBoostTurns > 0) {
                r.status.dmgBoostTurns--;
                if (r.status.dmgBoostTurns <= 0) r.status.dmgBoost = 1;
            }
        });
        newCTeam.forEach(r => {
            if (r.hp > 0) r.energy = Math.min(r.energyMax, r.energy + energyRegen);
            Object.keys(r.cooldowns).forEach(k => {
                if (r.cooldowns[k] > 0) r.cooldowns[k]--;
            });
            if (r.status?.shieldTurns > 0) {
                r.status.shieldTurns--;
                if (r.status.shieldTurns <= 0) r.status.shield = 1;
            }
            if (r.status?.defTurns > 0) {
                r.status.defTurns--;
                if (r.status.defTurns <= 0) r.status.def = 1;
            }
            if (r.status?.dodgeTurns > 0) {
                r.status.dodgeTurns--;
                if (r.status.dodgeTurns <= 0) r.status.dodgeChance = 0;
            }
            if (r.status?.dmgBoostTurns > 0) {
                r.status.dmgBoostTurns--;
                if (r.status.dmgBoostTurns <= 0) r.status.dmgBoost = 1;
            }
        });
        
        setPTeam(newPTeam);
        setCTeam(newCTeam);
        setGameState('TURN_START');
    };

    useEffect(() => {
        if (gameState === 'TURN_START') {
            setGameState('PLAYER_ACTION');
            setTurnTimer(15);
        } else if (gameState === 'CPU_ACTION') {
            clearTimeout(cpuTimeoutRef.current);
            cpuTimeoutRef.current = setTimeout(cpuAction, 1000);
        }
        return () => clearTimeout(cpuTimeoutRef.current);
    }, [gameState]);

    useEffect(() => {
        if (gameState === 'PLAYER_ACTION') {
            const arenaKey = elMap[matchData.arena.advantage];
            if (isAuto) {
                const isUltReady = pTeam[activePIdx].hp <= (pTeam[activePIdx].hpMax * 0.3) && !pTeam[activePIdx].status.ultUsed;
                
                clearTimeout(autoTimeoutRef.current);
                if (isUltReady) {
                    autoTimeoutRef.current = setTimeout(() => processAction('ultimate'), 1000);
                } else {
                    const skills = SkillService.getSkillsForRooster(pTeam[activePIdx].elKey, pTeam[activePIdx].level || 1, arenaKey);
                    const affordable = skills.filter(s => s.cost <= pTeam[activePIdx].energy && !(pTeam[activePIdx].cooldowns[s.id] > 0));
                    const skill = affordable.length > 0 ? affordable[Math.floor(Math.random() * affordable.length)] : skills[0];
                    autoTimeoutRef.current = setTimeout(() => processAction('skill', skill.id), 1000);
                }
            } else {
                timerRef.current = setInterval(() => {
                    setTurnTimer(prev => {
                        if (prev <= 1) {
                            clearInterval(timerRef.current);
                            const isUltReady = pTeam[activePIdx].hp <= (pTeam[activePIdx].hpMax * 0.3) && !pTeam[activePIdx].status.ultUsed;
                            
                            if (isUltReady) {
                                processAction('ultimate');
                            } else {
                                const skills = SkillService.getSkillsForRooster(pTeam[activePIdx].elKey, pTeam[activePIdx].level || 1, arenaKey);
                                processAction('skill', skills[0].id);
                            }
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            }
        }
        return () => {
            clearInterval(timerRef.current);
            clearTimeout(autoTimeoutRef.current);
        };
    }, [gameState, isAuto, activePIdx, pTeam]);

    useEffect(() => {
        return () => {
            clearInterval(timerRef.current);
            clearTimeout(cpuTimeoutRef.current);
            clearTimeout(autoTimeoutRef.current);
            clearTimeout(stateSyncTimeoutRef.current);
        };
    }, []);


    const renderHealthBar = (hp, max) => (
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${Math.max(0, (hp/max)*100)}%` }} />
        </div>
    );

    const renderEnergyBar = (energy, max) => (
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
            <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${Math.max(0, (energy/max)*100)}%` }} />
        </div>
    );
    
    const renderStatusBadges = (r) => {
        if (!r || !r.status) return null;
        const badges = [];
        if (r.status.shieldTurns > 0) badges.push({ label: `🛡️ SHIELD ${r.status.shieldTurns}T`, cls: 'bg-blue-500 text-white' });
        if (r.status.defTurns > 0) badges.push({ label: `🛡️ DEF ${r.status.defTurns}T`, cls: 'bg-amber-400 text-black' });
        if (r.status.dodgeTurns > 0) badges.push({ label: `💨 DODGE ${r.status.dodgeTurns}T`, cls: 'bg-indigo-500 text-white' });
        if (r.status.airDoubleNext > 0) badges.push({ label: `⚡ 2X NEXT`, cls: 'bg-cyan-500 text-slate-900' });
        if (badges.length === 0) return null;
        return (
            <div className="flex gap-1 mb-1">
                {badges.map((b, i) => (
                    <span key={i} className={`text-[9px] font-black px-2 py-0.5 rounded-full ${b.cls}`}>{b.label}</span>
                ))}
            </div>
        );
    };

    const getPlayerSkillList = () => {
        const p = pTeam[activePIdx];
        if (!p) return [];
        const arenaKey = elMap[matchData?.arena?.advantage];
        return SkillService.getSkillsForRooster(p.elKey, p.level || 1, arenaKey);
    };

    const getArenaSpecialSkill = () => {
        const p = pTeam[activePIdx];
        if (!p) return null;
        const list = SKILLS[p.elKey] || [];
        return list.find(s => s.id && String(s.id).endsWith('-arena')) || null;
    };

    const getPrimaryAbilitySkill = (skillsAll) => {
        const p = pTeam[activePIdx];
        if (!p) return null;
        const explicit = (skillsAll || []).find(s => s?.id && String(s.id).endsWith('-ability'));
        if (explicit) return explicit;
        const baseId = skillsAll?.[0]?.id;
        const arenaSpecial = getArenaSpecialSkill();
        const candidates = (skillsAll || []).filter(s => s?.id && s.id !== baseId && s.id !== arenaSpecial?.id);
        if (candidates.length === 0) return null;
        const sorted = [...candidates].sort((a, b) => {
            const al = a.level || 0;
            const bl = b.level || 0;
            if (al !== bl) return al - bl;
            const ac = a.cost || 0;
            const bc = b.cost || 0;
            if (ac !== bc) return ac - bc;
            const am = a.multiplier || 0;
            const bm = b.multiplier || 0;
            return am - bm;
        });
        return sorted[sorted.length - 1];
    };

    const renderQuickActionButtons = () => {
        const p = pTeam[activePIdx];
        if (!p) return null;

        const skillsAll = getPlayerSkillList();
        const baseSkill = skillsAll[0] || null;
        const abilitySkill = getPrimaryAbilitySkill(skillsAll);

        const isHpLow = p.hp <= (p.hpMax * 0.3);
            const isUltReady = isHpLow && !p.status.ultUsed;
            const specialHint = isUltReady
                ? (t('cockfight_lowhp_special_ready') || 'PRONTO')
                : (t('cockfight_lowhp_special_requires_hp') || '≤30% HP');

        const onBase = () => {
            if (baseSkill) processAction('skill', baseSkill.id);
        };

        const abilityCd = abilitySkill ? (p.cooldowns?.[abilitySkill.id] || 0) : 0;
        const canUseAbility = Boolean(abilitySkill && p.energy >= (abilitySkill.cost || 0) && abilityCd <= 0);
        const onAbility = () => {
            if (!abilitySkill) return;
            if (abilityCd > 0) return;
            if (p.energy < (abilitySkill.cost || 0)) return;
            processAction('skill', abilitySkill.id);
        };

        const onSpecial = () => {
            if (!isUltReady) return;
            processAction('ultimate');
        };

        return (
            <div className="grid grid-cols-3 gap-2">
                <button
                    type="button"
                    disabled={!baseSkill}
                    onClick={onBase}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                        !baseSkill ? 'bg-slate-900 border-slate-800 opacity-50' :
                        'bg-slate-800 border-slate-700 hover:border-slate-500'
                    }`}
                >
                    <span className="text-[11px] font-black text-white uppercase">
                        {baseSkill ? (t(baseSkill.nameKey) || baseSkill.id) : 'ATTACK'}
                    </span>
                    <div className="flex gap-2 mt-1">
                        <span className="text-[9px] font-bold text-blue-400">
                            {`${baseSkill?.cost ?? 0} MP`}
                        </span>
                    </div>
                </button>

                <button
                    type="button"
                    disabled={!abilitySkill || !canUseAbility}
                    onClick={onAbility}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                        !abilitySkill ? 'bg-slate-900 border-slate-800 opacity-50' :
                        !canUseAbility ? 'bg-slate-900 border-slate-800 opacity-50' :
                        'bg-slate-800 border-slate-700 hover:border-slate-500'
                    }`}
                >
                    <span className="text-[11px] font-black text-white uppercase">
                        {abilitySkill ? (t(abilitySkill.nameKey) || abilitySkill.id) : (t('cockfight_ability_label') || 'HABILIDADE')}
                    </span>
                    <div className="flex gap-2 mt-1">
                        {!abilitySkill ? (
                            <span className="text-[9px] text-slate-400 font-bold">{t('cockfight_ability_locked') || 'BLOQUEADO'}</span>
                        ) : (
                            <>
                                <span className="text-[9px] text-blue-400">{abilitySkill.cost} MP</span>
                                {abilityCd > 0 && <span className="text-[9px] text-red-400">{abilityCd}T</span>}
                            </>
                        )}
                    </div>
                </button>

                <button
                    type="button"
                    disabled={!isUltReady}
                    onClick={onSpecial}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                        isUltReady ? 'bg-gradient-to-b from-purple-900 to-indigo-900 border-purple-500 hover:border-purple-300 animate-pulse' :
                        'bg-slate-900 border-slate-800 opacity-60'
                    }`}
                >
                    <span className="text-[11px] font-black text-white uppercase">
                        {t(`cockfight_ult_${p.elKey}_name`) || (t('cockfight_lowhp_special_label') || 'ESPECIAL')}
                    </span>
                    <div className="flex gap-2 mt-1">
                        <span className={`text-[9px] font-bold ${isUltReady ? 'text-yellow-400' : 'text-slate-400'}`}>
                            {specialHint}
                        </span>
                    </div>
                </button>
            </div>
        );
    };

    const renderSkillButtons = () => {
        if (!showSkills || !pTeam[activePIdx]) return null;
        const skills = getPlayerSkillList();
        const baseId = skills[0]?.id;
        const abilitySkill = getPrimaryAbilitySkill(skills);
        const otherSkills = skills.filter(s => s.id !== baseId && s.id !== abilitySkill?.id);
        
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {otherSkills.map((skill) => {
                    const canAfford = pTeam[activePIdx].energy >= skill.cost;
                    const isOnCooldown = pTeam[activePIdx].cooldowns[skill.id] > 0;
                    return (
                        <button 
                            key={skill.id}
                            disabled={!canAfford || isOnCooldown}
                            onClick={() => processAction('skill', skill.id)}
                            className={`p-2 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                                !canAfford || isOnCooldown ? 'bg-slate-900 border-slate-800 opacity-50' : 
                                skill.id && String(skill.id).endsWith('-arena') ? 'bg-gradient-to-b from-yellow-900 to-slate-900 border-yellow-600 hover:border-yellow-400' :
                                'bg-slate-800 border-slate-700 hover:border-slate-500'
                            }`}
                        >
                            <span className="text-[10px] font-black text-white uppercase">{t(skill.nameKey) || skill.id}</span>
                            <div className="flex gap-2 mt-1">
                                <span className="text-[9px] text-blue-400">{skill.cost} MP</span>
                                {isOnCooldown && <span className="text-[9px] text-red-400">{pTeam[activePIdx].cooldowns[skill.id]}T</span>}
                            </div>
                        </button>
                    );
                })}
                {otherSkills.length === 0 && (
                    <div className="col-span-2 md:col-span-4 text-slate-500 text-xs font-bold text-center py-2">
                        {t('cockfight_select_action') || 'Selecione uma ação acima'}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={`relative w-full h-[72dvh] min-h-[480px] max-h-[680px] md:h-[600px] rounded-3xl overflow-hidden flex flex-col border-4 border-slate-800 shadow-2xl ${arenaRootClass}`}>
            {/* Arena Background */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-gradient-to-b from-transparent to-black" />
            
            {/* Top Bar */}
            <BattleTopBar
                battleTitle={mode === '3v3' ? (t('cockfight_battle_title_3v3') || '3V3 BATTLE') : (t('cockfight_battle_title_1v1') || '1V1 BATTLE')}
                exitLabel={t('cockfight_exit_battle') || 'Sair'}
                autoLabel={isAuto ? (t('cockfight_auto_on') || 'AUTO ON') : (t('cockfight_auto_off') || 'AUTO OFF')}
                fxLabel={showFx ? (t('cockfight_fx_on') || 'FX ON') : (t('cockfight_fx_off') || 'FX OFF')}
                arenaBadgeClass={arenaBadgeClass}
                arenaIcon={matchData?.arena?.icon}
                arenaName={t(matchData?.arena?.nameKey) || matchData?.arena?.name}
                arenaBonusPct={Math.round(arenaBonus * 100)}
                isAuto={isAuto}
                onToggleAuto={() => setIsAuto(!isAuto)}
                isFx={showFx}
                onToggleFx={() => setShowFx(v => !v)}
                onExit={onExit ? () => onExit({
                    gameState,
                    pTeam,
                    cTeam,
                    activePIdx,
                    activeCIdx,
                    turnTimer,
                    isAuto,
                    showFx,
                    showSkills,
                    showItems,
                    logs
                }) : null}
            />

            {/* Battle Area */}
            <div className="flex-1 flex justify-between items-center px-2 sm:px-4 md:px-12 relative z-10 overflow-hidden">
                
                {/* Player Side */}
                <div className="flex flex-col items-center gap-4 w-[42%] sm:w-1/3 min-w-0">
                    {mode === '3v3' && (
                        <div className="flex gap-2 mb-4 flex-wrap justify-center">
                            {pTeam.map((r, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => selectPlayerRooster(i)}
                                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 ${i === activePIdx ? 'border-green-400' : 'border-slate-600'} ${r.hp <= 0 ? 'opacity-30 grayscale' : i === activePIdx ? 'active-rooster' : 'inactive-rooster'} bg-slate-800 flex items-center justify-center overflow-hidden`}
                                >
                                    <RoosterSprite colorKey={r.color} element={r.element} size={28} />
                                </button>
                            ))}
                        </div>
                    )}
                    
                    {pTeam[activePIdx] && (
                        <div
                            className={`relative rinha-rooster-wrap ${showFx ? elementFxClass(pTeam[activePIdx].elKey) : ''} ${pTeam[activePIdx].hp <= 0 ? 'anim-ko-l grayscale opacity-70' : ''}`}
                            ref={el => pRefs.current[activePIdx] = el}
                        >
                            {showFx && pTeam[activePIdx]?.element === arenaAdvantage && <div className={`rinha-arena-boost rinha-arena-boost-${arenaKey}`} />}
                            {showFx && pTeam[activePIdx]?.status?.shieldTurns > 0 && <div className="rinha-status-fx rinha-status-shield" />}
                            {showFx && pTeam[activePIdx]?.status?.defTurns > 0 && <div className="rinha-status-fx rinha-status-def" />}
                            {showFx && pTeam[activePIdx]?.status?.dodgeTurns > 0 && <div className="rinha-status-fx rinha-status-dodge" />}
                            <div className="rinha-rooster-content scale-[0.82] sm:scale-100 origin-center">
                                <RoosterSprite colorKey={pTeam[activePIdx].color} element={pTeam[activePIdx].element} size={140} />
                            </div>
                            
                            {/* Floating Texts */}
                            <AnimatePresence>
                                {floatingTexts.filter(t => t.target === 'p' && t.idx === activePIdx).map(text => (
                                    <motion.div key={text.id} initial={{opacity:0, y:0}} animate={{opacity:1, y:-50, scale: text.isCritical ? 1.5 : 1}} exit={{opacity:0}} className={`absolute top-0 w-full text-center font-black text-2xl drop-shadow-lg z-20 ${text.isHeal ? 'text-green-400' : 'text-red-500'}`}>
                                        {text.text}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                    
                    {pTeam[activePIdx] && (
                        <div className="w-full bg-black/40 p-2 rounded-xl">
                            <div className="flex justify-between text-[10px] text-white font-bold mb-1">
                                <span>{pTeam[activePIdx].hp} HP</span>
                                <span>{pTeam[activePIdx].energy} MP</span>
                            </div>
                            {renderStatusBadges(pTeam[activePIdx])}
                            {renderHealthBar(pTeam[activePIdx].hp, pTeam[activePIdx].hpMax)}
                            {renderEnergyBar(pTeam[activePIdx].energy, pTeam[activePIdx].energyMax)}
                        </div>
                    )}
                </div>

                {/* Center / VS / Timer */}
                <div className="flex flex-col items-center w-[16%] sm:w-auto shrink-0">
                    <div className="text-4xl font-black text-white/20 italic mb-4">VS</div>
                    {gameState === 'PLAYER_ACTION' && !isAuto && (
                        <div className={`text-2xl font-black ${turnTimer <= 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                            {turnTimer}s
                        </div>
                    )}
                </div>

                {/* CPU Side */}
                <div className="flex flex-col items-center gap-4 w-[42%] sm:w-1/3 min-w-0">
                    {mode === '3v3' && (
                        <div className="flex gap-2 mb-4 flex-wrap justify-center">
                            {cTeam.map((r, i) => (
                                <div
                                    key={i}
                                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 ${i === activeCIdx ? 'border-red-400' : 'border-slate-600'} ${r.hp <= 0 ? 'opacity-30 grayscale' : i === activeCIdx ? 'active-rooster' : 'inactive-rooster'} bg-slate-800 flex items-center justify-center overflow-hidden`}
                                >
                                    <RoosterSprite colorKey={r.color} element={r.element} size={28} isOpponent />
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {cTeam[activeCIdx] && (
                        <div
                            className={`relative rinha-rooster-wrap ${showFx ? elementFxClass(cTeam[activeCIdx].elKey) : ''} ${cTeam[activeCIdx].hp <= 0 ? 'anim-ko-r grayscale opacity-70' : ''}`}
                            ref={el => cRefs.current[activeCIdx] = el}
                        >
                            {showFx && cTeam[activeCIdx]?.element === arenaAdvantage && <div className={`rinha-arena-boost rinha-arena-boost-${arenaKey}`} />}
                            {showFx && cTeam[activeCIdx]?.status?.shieldTurns > 0 && <div className="rinha-status-fx rinha-status-shield" />}
                            {showFx && cTeam[activeCIdx]?.status?.defTurns > 0 && <div className="rinha-status-fx rinha-status-def" />}
                            {showFx && cTeam[activeCIdx]?.status?.dodgeTurns > 0 && <div className="rinha-status-fx rinha-status-dodge" />}
                            <div className="rinha-rooster-content scale-[0.82] sm:scale-100 origin-center">
                                <RoosterSprite colorKey={cTeam[activeCIdx].color} element={cTeam[activeCIdx].element} size={140} isOpponent />
                            </div>
                            
                            <AnimatePresence>
                                {floatingTexts.filter(t => t.target === 'c' && t.idx === activeCIdx).map(text => (
                                    <motion.div key={text.id} initial={{opacity:0, y:0}} animate={{opacity:1, y:-50, scale: text.isCritical ? 1.5 : 1}} exit={{opacity:0}} className={`absolute top-0 w-full text-center font-black text-2xl drop-shadow-lg z-20 ${text.isHeal ? 'text-green-400' : 'text-red-500'}`}>
                                        {text.text}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                    
                    {cTeam[activeCIdx] && (
                        <div className="w-full bg-black/40 p-2 rounded-xl">
                            <div className="flex justify-between text-[10px] text-white font-bold mb-1">
                                <span>{cTeam[activeCIdx].hp} HP</span>
                                <span>{cTeam[activeCIdx].energy} MP</span>
                            </div>
                            {renderStatusBadges(cTeam[activeCIdx])}
                            {renderHealthBar(cTeam[activeCIdx].hp, cTeam[activeCIdx].hpMax)}
                            {renderEnergyBar(cTeam[activeCIdx].energy, cTeam[activeCIdx].energyMax)}
                        </div>
                    )}
                </div>

            </div>

            {/* Action Panel */}
            <div className="bg-slate-950 p-4 min-h-[160px] z-20 border-t border-white/10 relative overflow-y-auto max-h-[250px] shrink-0">
                {gameState === 'PLAYER_ACTION' && !isAuto ? (
                    <div className="flex flex-col gap-3 h-full">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-white font-black text-sm uppercase">{t('cockfight_your_turn') || 'Seu turno'}</span>
                            <div className="flex gap-2">
                                <button onClick={() => {setShowSkills(true); setShowItems(false);}} className={`px-4 py-2 rounded-xl font-black text-xs ${showSkills ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'}`}>{t('cockfight_actions_skills') || 'SKILLS'}</button>
                                <button onClick={() => {setShowItems(true); setShowSkills(false);}} className={`px-4 py-2 rounded-xl font-black text-xs ${showItems ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-300'}`}>{t('cockfight_actions_items') || 'ITEMS'}</button>
                            </div>
                        </div>

                        {renderQuickActionButtons()}

                        {renderSkillButtons()}

                        {showItems && (
                            <div className="grid grid-cols-2 gap-2">
                                {inventory.map(item => {
                                    const cd = item.id === 'shield_item' ? (pTeam[activePIdx]?.cooldowns?.shield_item || 0) : 0;
                                    const disabled = item.count <= 0 || cd > 0;
                                    return (
                                        <button 
                                            key={item.id}
                                            disabled={disabled}
                                            onClick={() => processAction('item', item.id)}
                                            className={`p-3 rounded-xl border flex justify-between items-center ${disabled ? 'bg-slate-900 border-slate-800 opacity-50' : 'bg-slate-800 border-slate-600 hover:border-slate-400'}`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl">{item.icon}</span>
                                                <span className="text-xs font-black text-white uppercase">{item.name}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {cd > 0 && <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{cd}T</span>}
                                                <span className="bg-yellow-500 text-black text-xs font-black px-2 py-0.5 rounded-full">x{item.count}</span>
                                            </div>
                                        </button>
                                    );
                                })}
                                {inventory.length === 0 && <div className="text-slate-500 text-xs">{t('cockfight_no_items') || 'Sem itens. Compre no Lobby.'}</div>}
                            </div>
                        )}

                        {!showSkills && !showItems && (
                            <div className="flex-1 flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
                                {t('cockfight_select_action') || 'Selecione uma ação acima'}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-full flex flex-col justify-center gap-2">
                        <div className="text-center text-white/50 font-black uppercase animate-pulse">
                            {gameState === 'CPU_ACTION'
                                ? (t('cockfight_cpu_thinking') || 'CPU pensando...')
                                : gameState === 'ANIMATING'
                                ? (t('cockfight_battle_in_progress_text') || 'Batalha em andamento...')
                                : isAuto
                                ? (t('cockfight_auto_active') || 'Automático ativo')
                                : (t('cockfight_waiting') || 'Aguardando...')}
                        </div>
                        {/* Battle Logs Mini */}
                        <div className="flex flex-col items-center justify-end h-16 overflow-hidden">
                            {logs.map((l, i) => (
                                <div key={i} className="text-[10px] text-slate-400">{l}</div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InteractiveBattle;
