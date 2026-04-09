const LEDGER_KEY = 'farm_treasury_ledger_v1';
const LEDGER_MAX = 5000;

const asNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const safeJson = (raw, fallback) => {
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

export const computePvPFeeSplit = (bet, bettors = 2) => {
  const b = asNum(bet);
  const feeTotal = Math.floor(b * 0.10 * bettors);
  const development = Math.floor(feeTotal * 0.50);
  const pool = feeTotal - development;
  const tournaments = Math.floor(pool * 0.50);
  const marketing = Math.floor(pool * 0.30);
  const teamTotal = pool - tournaments - marketing;

  const lvl1 = Math.floor(teamTotal * 0.50);
  const lvl2 = Math.floor(teamTotal * 0.25);
  const lvl3 = Math.floor(teamTotal * 0.10);
  const lvl4 = Math.floor(teamTotal * 0.10);
  const lvl5 = Math.max(0, teamTotal - lvl1 - lvl2 - lvl3 - lvl4);

  return {
    bettors,
    bet: b,
    feeTotal,
    development,
    pool,
    tournaments,
    marketing,
    teamTotal,
    levels: { lvl1, lvl2, lvl3, lvl4, lvl5 },
  };
};

export const loadTreasuryLedger = () => {
  const raw = localStorage.getItem(LEDGER_KEY) || '[]';
  const parsed = safeJson(raw, []);
  return Array.isArray(parsed) ? parsed : [];
};

export const appendTreasuryLedgerEntry = (entry) => {
  const nextEntry = {
    id: entry?.id || `${Date.now()}_${Math.random().toString(16).slice(2)}`,
    created_at: entry?.created_at || new Date().toISOString(),
    type: entry?.type || 'UNKNOWN',
    source: entry?.source || 'UNKNOWN',
    bet: asNum(entry?.bet),
    bettors: entry?.bettors ?? 2,
    fee: entry?.fee ?? null,
    split: entry?.split ?? null,
    meta: entry?.meta ?? null,
  };

  const current = loadTreasuryLedger();
  current.unshift(nextEntry);
  localStorage.setItem(LEDGER_KEY, JSON.stringify(current.slice(0, LEDGER_MAX)));
  return nextEntry;
};

export const sumTreasuryLedger = (entries) => {
  return (entries || []).reduce(
    (acc, e) => {
      const split = e?.split;
      if (!split) return acc;
      acc.feeTotal += asNum(split.feeTotal);
      acc.development += asNum(split.development);
      acc.tournaments += asNum(split.tournaments);
      acc.marketing += asNum(split.marketing);
      acc.teamTotal += asNum(split.teamTotal);
      acc.levels.lvl1 += asNum(split.levels?.lvl1);
      acc.levels.lvl2 += asNum(split.levels?.lvl2);
      acc.levels.lvl3 += asNum(split.levels?.lvl3);
      acc.levels.lvl4 += asNum(split.levels?.lvl4);
      acc.levels.lvl5 += asNum(split.levels?.lvl5);
      acc.count += 1;
      return acc;
    },
    { feeTotal: 0, development: 0, tournaments: 0, marketing: 0, teamTotal: 0, levels: { lvl1: 0, lvl2: 0, lvl3: 0, lvl4: 0, lvl5: 0 }, count: 0 }
  );
};

export const filterLedgerBySource = (entries, source) => (entries || []).filter(e => e?.source === source);

