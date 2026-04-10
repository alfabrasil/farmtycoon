const RETENTION_KEY = 'farm_forum_retention_days_v1';
const ALLOWED = [7, 15, 30, 60];
const DEFAULT_DAYS = 30;

const asInt = (v) => {
  const s = String(v ?? '').trim();
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) ? Math.trunc(n) : NaN;
};

export const getForumRetentionDays = () => {
  const raw = localStorage.getItem(RETENTION_KEY);
  const n = asInt(raw);
  return ALLOWED.includes(n) ? n : DEFAULT_DAYS;
};

export const setForumRetentionDays = (days) => {
  const n = asInt(days);
  const next = ALLOWED.includes(n) ? n : DEFAULT_DAYS;
  localStorage.setItem(RETENTION_KEY, String(next));
  return next;
};

export const getForumRetentionOptions = () => ALLOWED.slice();
