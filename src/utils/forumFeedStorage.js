import { getForumRetentionDays } from './forumRetention';

const FEED_KEY = 'farm_forum_feed_v1';
const MAX_POSTS = 150;
const MAX_COMMENTS = 60;

const safeJson = (raw, fallback) => {
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const clampText = (text, maxLen) => {
  const s = String(text || '').trim();
  if (!s) return '';
  return s.length > maxLen ? s.slice(0, maxLen) : s;
};

const makeId = () => `${Date.now()}_${Math.random().toString(16).slice(2)}`;

const normalizeUser = (u) => String(u || '').trim();

const nowMs = () => Date.now();

const isExpired = (iso, days) => {
  if (!iso) return false;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return false;
  return (nowMs() - t) > (days * 24 * 60 * 60 * 1000);
};

export const loadFeed = () => {
  const parsed = safeJson(localStorage.getItem(FEED_KEY) || '[]', []);
  const list = Array.isArray(parsed) ? parsed : [];
  const days = getForumRetentionDays();
  const pruned = list
    .filter(p => !isExpired(p?.created_at, days))
    .map(p => ({
      ...p,
      comments: (Array.isArray(p.comments) ? p.comments : []).filter(c => !isExpired(c?.created_at, days)).slice(0, MAX_COMMENTS)
    }))
    .slice(0, MAX_POSTS);
  if (pruned.length !== list.length) saveFeed(pruned);
  return pruned;
};

const saveFeed = (feed) => {
  localStorage.setItem(FEED_KEY, JSON.stringify((Array.isArray(feed) ? feed : []).slice(0, MAX_POSTS)));
};

export const createPost = ({ author, text }) => {
  const msgText = clampText(text, 700);
  const msgAuthor = normalizeUser(author) || 'Fazendeiro';
  if (!msgText) return null;

  const current = loadFeed();
  const next = [
    {
      id: makeId(),
      created_at: new Date().toISOString(),
      author: msgAuthor,
      text: msgText,
      likes: 0,
      likedBy: [],
      comments: []
    },
    ...current
  ];
  saveFeed(next);
  return next[0];
};

export const toggleLikePost = ({ postId, username }) => {
  const user = normalizeUser(username);
  if (!user) return null;
  const current = loadFeed();
  const next = current.map(p => {
    if (p?.id !== postId) return p;
    const likedBy = Array.isArray(p.likedBy) ? p.likedBy : [];
    const has = likedBy.includes(user);
    const newLikedBy = has ? likedBy.filter(x => x !== user) : [...likedBy, user];
    return { ...p, likedBy: newLikedBy, likes: newLikedBy.length };
  });
  saveFeed(next);
  return true;
};

export const addComment = ({ postId, author, text }) => {
  const msgText = clampText(text, 400);
  const msgAuthor = normalizeUser(author) || 'Fazendeiro';
  if (!msgText) return null;

  const current = loadFeed();
  const next = current.map(p => {
    if (p?.id !== postId) return p;
    const comments = Array.isArray(p.comments) ? p.comments : [];
    const newComment = {
      id: makeId(),
      created_at: new Date().toISOString(),
      author: msgAuthor,
      text: msgText,
      likes: 0,
      likedBy: []
    };
    const nextComments = [newComment, ...comments].slice(0, MAX_COMMENTS);
    return { ...p, comments: nextComments };
  });
  saveFeed(next);
  return true;
};

export const toggleLikeComment = ({ postId, commentId, username }) => {
  const user = normalizeUser(username);
  if (!user) return null;
  const current = loadFeed();
  const next = current.map(p => {
    if (p?.id !== postId) return p;
    const comments = Array.isArray(p.comments) ? p.comments : [];
    const nextComments = comments.map(c => {
      if (c?.id !== commentId) return c;
      const likedBy = Array.isArray(c.likedBy) ? c.likedBy : [];
      const has = likedBy.includes(user);
      const newLikedBy = has ? likedBy.filter(x => x !== user) : [...likedBy, user];
      return { ...c, likedBy: newLikedBy, likes: newLikedBy.length };
    });
    return { ...p, comments: nextComments };
  });
  saveFeed(next);
  return true;
};
