import { getForumRetentionDays } from './forumRetention';

const GENERAL_KEY = 'farm_forum_general_v1';
const DM_PREFIX = 'farm_forum_dm_v1:';
const DM_UNREAD_KEY = 'farm_forum_dm_unread_v1';
const MAX_MESSAGES = 300;

const safeJson = (raw, fallback) => {
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const clampText = (text, maxLen = 400) => {
  const s = String(text || '').trim();
  if (!s) return '';
  return s.length > maxLen ? s.slice(0, maxLen) : s;
};

const makeId = () => `${Date.now()}_${Math.random().toString(16).slice(2)}`;

const normalizeUser = (u) => String(u || '').trim();

const dmKey = (a, b) => {
  const u1 = normalizeUser(a);
  const u2 = normalizeUser(b);
  const sorted = [u1, u2].sort((x, y) => x.localeCompare(y));
  return `${DM_PREFIX}${sorted[0]}:${sorted[1]}`;
};

const nowMs = () => Date.now();

const isExpired = (iso, days) => {
  if (!iso) return false;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return false;
  return (nowMs() - t) > (days * 24 * 60 * 60 * 1000);
};

const pruneMessages = (messages, days) => {
  if (!Array.isArray(messages)) return [];
  const pruned = messages.filter(m => !isExpired(m?.created_at, days));
  return pruned.slice(0, MAX_MESSAGES);
};

const loadUnreadMap = () => {
  const parsed = safeJson(localStorage.getItem(DM_UNREAD_KEY) || '{}', {});
  return parsed && typeof parsed === 'object' ? parsed : {};
};

const saveUnreadMap = (m) => {
  localStorage.setItem(DM_UNREAD_KEY, JSON.stringify(m && typeof m === 'object' ? m : {}));
};

export const loadGeneral = () => {
  const current = safeJson(localStorage.getItem(GENERAL_KEY) || '[]', []);
  const pruned = pruneMessages(current, getForumRetentionDays());
  if (Array.isArray(current) && pruned.length !== current.length) {
    localStorage.setItem(GENERAL_KEY, JSON.stringify(pruned));
  }
  return pruned;
};

export const appendGeneral = ({ author, text }) => {
  const msgText = clampText(text);
  const msgAuthor = normalizeUser(author) || 'Fazendeiro';
  if (!msgText) return null;

  const current = loadGeneral();
  const next = [
    {
      id: makeId(),
      created_at: new Date().toISOString(),
      author: msgAuthor,
      text: msgText,
      likes: 0,
      likedBy: []
    },
    ...(Array.isArray(current) ? current : [])
  ].slice(0, MAX_MESSAGES);
  localStorage.setItem(GENERAL_KEY, JSON.stringify(next));
  return next[0];
};

export const toggleLikeGeneral = ({ messageId, username }) => {
  const user = normalizeUser(username);
  if (!user) return null;
  const current = loadGeneral();
  if (!Array.isArray(current)) return null;
  const next = current.map(m => {
    if (m?.id !== messageId) return m;
    const likedBy = Array.isArray(m.likedBy) ? m.likedBy : [];
    const has = likedBy.includes(user);
    const newLikedBy = has ? likedBy.filter(x => x !== user) : [...likedBy, user];
    return {
      ...m,
      likedBy: newLikedBy,
      likes: newLikedBy.length
    };
  });
  localStorage.setItem(GENERAL_KEY, JSON.stringify(next));
  return true;
};

export const loadDmThread = ({ userA, userB }) => {
  const key = dmKey(userA, userB);
  const current = safeJson(localStorage.getItem(key) || '[]', []);
  const pruned = pruneMessages(current, getForumRetentionDays());
  if (Array.isArray(current) && pruned.length !== current.length) {
    localStorage.setItem(key, JSON.stringify(pruned));
  }
  return { key, messages: pruned };
};

export const appendDm = ({ from, to, text }) => {
  const msgText = clampText(text);
  const a = normalizeUser(from);
  const b = normalizeUser(to);
  if (!msgText || !a || !b) return null;

  const { key, messages } = loadDmThread({ userA: a, userB: b });
  const current = Array.isArray(messages) ? messages : [];
  const next = [
    {
      id: makeId(),
      created_at: new Date().toISOString(),
      author: a,
      text: msgText,
      likes: 0,
      likedBy: []
    },
    ...current
  ].slice(0, MAX_MESSAGES);
  localStorage.setItem(key, JSON.stringify(next));

  const unread = loadUnreadMap();
  unread[key] = (Number(unread[key]) || 0) + 1;
  saveUnreadMap(unread);
  return next[0];
};

export const toggleLikeDm = ({ threadKey, messageId, username }) => {
  const user = normalizeUser(username);
  if (!user) return null;
  const current = safeJson(localStorage.getItem(threadKey) || '[]', []);
  if (!Array.isArray(current)) return null;
  const next = current.map(m => {
    if (m?.id !== messageId) return m;
    const likedBy = Array.isArray(m.likedBy) ? m.likedBy : [];
    const has = likedBy.includes(user);
    const newLikedBy = has ? likedBy.filter(x => x !== user) : [...likedBy, user];
    return {
      ...m,
      likedBy: newLikedBy,
      likes: newLikedBy.length
    };
  });
  localStorage.setItem(threadKey, JSON.stringify(next));
  return true;
};

export const listDmThreadsForUser = (username) => {
  const user = normalizeUser(username);
  if (!user) return [];
  const keys = Object.keys(localStorage).filter(k => k.startsWith(DM_PREFIX));
  const threads = [];
  for (const key of keys) {
    const parts = key.slice(DM_PREFIX.length).split(':');
    if (parts.length !== 2) continue;
    const [u1, u2] = parts;
    if (u1 !== user && u2 !== user) continue;
    const other = u1 === user ? u2 : u1;
    const msgs = pruneMessages(safeJson(localStorage.getItem(key) || '[]', []), getForumRetentionDays());
    localStorage.setItem(key, JSON.stringify(msgs));
    const last = Array.isArray(msgs) && msgs.length > 0 ? msgs[0] : null;
    threads.push({ key, other, lastAt: last?.created_at || null, lastText: last?.text || '' });
  }
  return threads.sort((a, b) => String(b.lastAt || '').localeCompare(String(a.lastAt || '')));
};

export const getUnreadCountForThread = (threadKey) => {
  const m = loadUnreadMap();
  return Number(m?.[threadKey]) || 0;
};

export const clearUnreadForThread = (threadKey) => {
  const m = loadUnreadMap();
  if (!m || typeof m !== 'object') return;
  if (m[threadKey]) {
    delete m[threadKey];
    saveUnreadMap(m);
  }
};

export const getUnreadTotalForUser = (username) => {
  const user = normalizeUser(username);
  if (!user) return 0;
  const m = loadUnreadMap();
  const keys = Object.keys(m || {});
  let total = 0;
  for (const k of keys) {
    if (!k.startsWith(DM_PREFIX)) continue;
    const parts = k.slice(DM_PREFIX.length).split(':');
    if (parts.length !== 2) continue;
    const [u1, u2] = parts;
    if (u1 !== user && u2 !== user) continue;
    total += Number(m[k]) || 0;
  }
  return total;
};
