import React, { useEffect, useMemo, useState } from 'react';
import { Heart, MessageCircle, Send, UserRound, Search, ChevronLeft, Users, PlusSquare, MessageSquareText, Settings, X } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { appendDm, appendGeneral, clearUnreadForThread, getUnreadCountForThread, getUnreadTotalForUser, listDmThreadsForUser, loadDmThread, loadGeneral, toggleLikeDm, toggleLikeGeneral } from '../../../utils/forumStorage';
import { addComment, createPost, loadFeed, toggleLikeComment, toggleLikePost } from '../../../utils/forumFeedStorage';
import { getForumRetentionDays, getForumRetentionOptions, setForumRetentionDays } from '../../../utils/forumRetention';

const ForumTab = ({ username }) => {
  const { t } = useLanguage();
  const me = String(username || '').trim() || (t('forum_default_username') || 'Fazendeiro');
  const [mode, setMode] = useState('FEED'); // FEED | GENERAL | DM_LIST | DM_THREAD
  const [general, setGeneral] = useState(() => loadGeneral());
  const [generalText, setGeneralText] = useState('');
  const [feed, setFeed] = useState(() => loadFeed());
  const [postText, setPostText] = useState('');
  const [expanded, setExpanded] = useState({});

  const [dmThreads, setDmThreads] = useState(() => listDmThreadsForUser(me));
  const [dmSearch, setDmSearch] = useState('');
  const [dmTarget, setDmTarget] = useState('');
  const [dmKey, setDmKey] = useState('');
  const [dmMessages, setDmMessages] = useState([]);
  const [dmText, setDmText] = useState('');
  const [commentText, setCommentText] = useState({});
  const [dmUnreadTotal, setDmUnreadTotal] = useState(() => getUnreadTotalForUser(me));
  const [showRetention, setShowRetention] = useState(false);
  const [retentionDays, setRetentionDays] = useState(() => getForumRetentionDays());

  useEffect(() => {
    const onStorage = (e) => {
      if (!e?.key) return;
      if (e.key === 'farm_forum_general_v1') setGeneral(loadGeneral());
      if (e.key === 'farm_forum_feed_v1') setFeed(loadFeed());
      if (e.key === 'farm_forum_dm_unread_v1') setDmUnreadTotal(getUnreadTotalForUser(me));
      if (e.key === 'farm_forum_retention_days_v1') {
        setRetentionDays(getForumRetentionDays());
        setGeneral(loadGeneral());
        setFeed(loadFeed());
        setDmThreads(listDmThreadsForUser(me));
        if (dmKey) {
          const { messages } = loadDmThread({ userA: me, userB: dmTarget });
          setDmMessages(messages);
        }
      }
      if (e.key.startsWith('farm_forum_dm_v1:')) {
        setDmThreads(listDmThreadsForUser(me));
        if (dmKey === e.key) {
          const { messages } = loadDmThread({ userA: me, userB: dmTarget });
          setDmMessages(messages);
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [me, dmKey, dmTarget]);

  const onlineFarmers = useMemo(() => {
    const base = [
      { name: 'RichDuck', status: 'ONLINE' },
      { name: 'ReiDoOvo', status: 'ONLINE' },
      { name: 'LuckyHen', status: 'ONLINE' },
      { name: 'GreenFarmer', status: 'IDLE' },
      { name: 'BlueRooster', status: 'IDLE' },
      { name: 'GoldenEgg', status: 'ONLINE' },
    ];
    const withMe = base.some(x => x.name === me) ? base : [{ name: me, status: 'ONLINE' }, ...base];
    return withMe.slice(0, 10);
  }, [me]);

  const openDm = (other) => {
    const otherUser = String(other || '').trim();
    if (!otherUser) return;
    const { key, messages } = loadDmThread({ userA: me, userB: otherUser });
    clearUnreadForThread(key);
    setDmUnreadTotal(getUnreadTotalForUser(me));
    setDmTarget(otherUser);
    setDmKey(key);
    setDmMessages(messages);
    setMode('DM_THREAD');
  };

  const filteredThreads = useMemo(() => {
    const q = String(dmSearch || '').trim().toLowerCase();
    if (!q) return dmThreads;
    return dmThreads.filter(x => String(x.other || '').toLowerCase().includes(q));
  }, [dmThreads, dmSearch]);

  const sendGeneral = () => {
    const msg = appendGeneral({ author: me, text: generalText });
    if (!msg) return;
    setGeneralText('');
    setGeneral(loadGeneral());
  };

  const sendDm = () => {
    const msg = appendDm({ from: me, to: dmTarget, text: dmText });
    if (!msg) return;
    setDmText('');
    const { messages } = loadDmThread({ userA: me, userB: dmTarget });
    setDmMessages(messages);
    setDmThreads(listDmThreadsForUser(me));
  };

  const createNewPost = () => {
    const p = createPost({ author: me, text: postText });
    if (!p) return;
    setPostText('');
    setFeed(loadFeed());
  };

  const likePost = (postId) => {
    toggleLikePost({ postId, username: me });
    setFeed(loadFeed());
  };

  const likeComment = (postId, commentId) => {
    toggleLikeComment({ postId, commentId, username: me });
    setFeed(loadFeed());
  };

  const addPostComment = (postId) => {
    const txt = commentText[postId] || '';
    const ok = addComment({ postId, author: me, text: txt });
    if (!ok) return;
    setCommentText(prev => ({ ...prev, [postId]: '' }));
    setFeed(loadFeed());
    setExpanded(prev => ({ ...prev, [postId]: true }));
  };

  const applyRetention = (days) => {
    const next = setForumRetentionDays(days);
    setRetentionDays(next);
    setGeneral(loadGeneral());
    setFeed(loadFeed());
    setDmThreads(listDmThreadsForUser(me));
    if (dmKey) {
      const { messages } = loadDmThread({ userA: me, userB: dmTarget });
      setDmMessages(messages);
    }
    setShowRetention(false);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl p-4 border-b-4 border-slate-200 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="text-slate-700" size={18} />
            <div className="font-black text-slate-800">{t('forum_online_title') || 'Fazendeiros Online'}</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-[10px] font-black text-slate-400 uppercase whitespace-nowrap">{retentionDays}d</div>
            <button onClick={() => setShowRetention(true)} className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 transition-colors" title={t('forum_retention_title') || 'Configurar retenção'}>
              <Settings size={16} className="text-slate-700" />
            </button>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {onlineFarmers.map((u) => (
            <button
              key={u.name}
              onClick={() => { setMode('DM_LIST'); setDmTarget(u.name); setDmThreads(listDmThreadsForUser(me)); }}
              className="bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 shrink-0 flex items-center gap-2"
              title={t('forum_open') || 'ABRIR'}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${u.status === 'ONLINE' ? 'bg-green-500' : 'bg-amber-400'}`} />
              <span className="text-xs font-black text-slate-700 whitespace-nowrap">{u.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white/80 p-1 rounded-2xl flex gap-2 overflow-x-auto">
        <button onClick={() => setMode('FEED')} className={`flex-1 py-2 px-3 rounded-xl font-black text-sm whitespace-nowrap ${mode === 'FEED' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>
          {t('forum_feed') || 'FEED'}
        </button>
        <button onClick={() => setMode('GENERAL')} className={`flex-1 py-2 px-3 rounded-xl font-black text-sm whitespace-nowrap ${mode === 'GENERAL' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>
          {t('forum_general') || 'GERAL'}
        </button>
        <button onClick={() => { setMode('DM_LIST'); setDmThreads(listDmThreadsForUser(me)); setDmUnreadTotal(getUnreadTotalForUser(me)); }} className={`flex-1 py-2 px-3 rounded-xl font-black text-sm whitespace-nowrap relative ${mode !== 'GENERAL' && mode !== 'FEED' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>
          {t('forum_private') || 'PRIVADO'}
          {dmUnreadTotal > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
              {dmUnreadTotal > 9 ? '9+' : dmUnreadTotal}
            </span>
          )}
        </button>
      </div>

      {mode === 'FEED' ? (
        <div className="bg-white rounded-3xl p-4 border-b-4 border-slate-200 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MessageSquareText className="text-slate-700" size={18} />
              <div className="font-black text-slate-800">{t('forum_feed_title') || 'Mural'}</div>
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase">{me}</div>
          </div>

          <div className="flex gap-2 mb-4">
            <input
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder={t('forum_post_placeholder') || 'Escreva um post...'}
              className="flex-1 bg-slate-100 rounded-2xl px-4 py-3 font-bold text-slate-700 outline-none border-2 border-transparent focus:border-slate-300"
            />
            <button onClick={createNewPost} className="bg-emerald-600 text-white px-4 rounded-2xl font-black border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1 transition-all">
              <PlusSquare size={18} />
            </button>
          </div>

          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {feed.length === 0 ? (
              <div className="text-center text-slate-400 text-sm font-bold py-10">{t('forum_no_posts') || 'Nenhum post ainda.'}</div>
            ) : (
              feed.map((p) => (
                <div key={p.id} className="bg-slate-50 rounded-2xl p-3 border border-slate-200">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-black text-slate-700 truncate">{p.author}</div>
                      <div className="text-sm text-slate-700 break-words">{p.text}</div>
                    </div>
                    <button
                      onClick={() => likePost(p.id)}
                      className={`shrink-0 px-2 py-1 rounded-xl text-xs font-black inline-flex items-center gap-1 ${Array.isArray(p.likedBy) && p.likedBy.includes(me) ? 'bg-pink-100 text-pink-600' : 'bg-white text-slate-500 border border-slate-200'}`}
                    >
                      <Heart size={14} />
                      {p.likes || 0}
                    </button>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <button
                      onClick={() => setExpanded(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
                      className="text-xs font-black text-slate-600 inline-flex items-center gap-2"
                    >
                      <MessageCircle size={14} />
                      {t('forum_comments') || 'Comentários'} ({Array.isArray(p.comments) ? p.comments.length : 0})
                    </button>
                    <div className="text-[10px] font-black text-slate-400">{p.created_at ? new Date(p.created_at).toLocaleDateString() : ''}</div>
                  </div>

                  {expanded[p.id] && (
                    <div className="mt-3">
                      <div className="flex gap-2 mb-2">
                        <input
                          value={commentText[p.id] || ''}
                          onChange={(e) => setCommentText(prev => ({ ...prev, [p.id]: e.target.value }))}
                          placeholder={t('forum_comment_placeholder') || 'Comentar...'}
                          className="flex-1 bg-white rounded-2xl px-4 py-2 font-bold text-slate-700 outline-none border border-slate-200"
                        />
                        <button onClick={() => addPostComment(p.id)} className="bg-slate-900 text-white px-4 rounded-2xl font-black border-b-4 border-slate-950 active:border-b-0 active:translate-y-1 transition-all">
                          <Send size={16} />
                        </button>
                      </div>

                      <div className="space-y-2">
                        {(Array.isArray(p.comments) ? p.comments : []).map((c) => (
                          <div key={c.id} className="bg-white rounded-2xl p-3 border border-slate-200">
                            <div className="flex justify-between items-start gap-2">
                              <div className="min-w-0">
                                <div className="text-xs font-black text-slate-700 truncate">{c.author}</div>
                                <div className="text-sm text-slate-700 break-words">{c.text}</div>
                              </div>
                              <button
                                onClick={() => likeComment(p.id, c.id)}
                                className={`shrink-0 px-2 py-1 rounded-xl text-xs font-black inline-flex items-center gap-1 ${Array.isArray(c.likedBy) && c.likedBy.includes(me) ? 'bg-pink-100 text-pink-600' : 'bg-white text-slate-500 border border-slate-200'}`}
                              >
                                <Heart size={14} />
                                {c.likes || 0}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      ) : mode === 'GENERAL' ? (
        <div className="bg-white rounded-3xl p-4 border-b-4 border-slate-200 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="text-slate-700" size={18} />
              <div className="font-black text-slate-800">{t('forum_general_title') || 'Chat Geral'}</div>
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase">{me}</div>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {general.length === 0 ? (
              <div className="text-center text-slate-400 text-sm font-bold py-10">{t('forum_no_messages') || 'Nenhuma mensagem ainda.'}</div>
            ) : (
              general.map((m) => (
                <div key={m.id} className="bg-slate-50 rounded-2xl p-3 border border-slate-200">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-black text-slate-700 truncate">{m.author}</div>
                      <div className="text-sm text-slate-700 break-words">{m.text}</div>
                    </div>
                    <button
                      onClick={() => { toggleLikeGeneral({ messageId: m.id, username: me }); setGeneral(loadGeneral()); }}
                      className={`shrink-0 px-2 py-1 rounded-xl text-xs font-black inline-flex items-center gap-1 ${Array.isArray(m.likedBy) && m.likedBy.includes(me) ? 'bg-pink-100 text-pink-600' : 'bg-white text-slate-500 border border-slate-200'}`}
                    >
                      <Heart size={14} />
                      {m.likes || 0}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-3 flex gap-2">
            <input
              value={generalText}
              onChange={(e) => setGeneralText(e.target.value)}
              placeholder={t('forum_message_placeholder') || 'Digite sua mensagem...'}
              className="flex-1 bg-slate-100 rounded-2xl px-4 py-3 font-bold text-slate-700 outline-none border-2 border-transparent focus:border-slate-300"
            />
            <button onClick={sendGeneral} className="bg-slate-900 text-white px-4 rounded-2xl font-black border-b-4 border-slate-950 active:border-b-0 active:translate-y-1 transition-all">
              <Send size={18} />
            </button>
          </div>
        </div>
      ) : mode === 'DM_LIST' ? (
        <div className="bg-white rounded-3xl p-4 border-b-4 border-slate-200 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <UserRound className="text-slate-700" size={18} />
              <div className="font-black text-slate-800">{t('forum_private_title') || 'Conversas'}</div>
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase">{me}</div>
          </div>

          <div className="flex gap-2 mb-3">
            <div className="flex-1 flex items-center gap-2 bg-slate-100 rounded-2xl px-3">
              <Search className="text-slate-400" size={16} />
              <input
                value={dmSearch}
                onChange={(e) => setDmSearch(e.target.value)}
                placeholder={t('forum_search_placeholder') || 'Buscar fazendeiro...'}
                className="w-full bg-transparent py-3 font-bold text-slate-700 outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <input
              value={dmTarget}
              onChange={(e) => setDmTarget(e.target.value)}
              placeholder={t('forum_username_placeholder') || 'Username para conversar...'}
              className="flex-1 bg-slate-100 rounded-2xl px-4 py-3 font-bold text-slate-700 outline-none border-2 border-transparent focus:border-slate-300"
            />
            <button onClick={() => openDm(dmTarget)} className="bg-blue-600 text-white px-4 rounded-2xl font-black border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all whitespace-nowrap">
              {t('forum_open') || 'ABRIR'}
            </button>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {filteredThreads.length === 0 ? (
              <div className="text-center text-slate-400 text-sm font-bold py-10">{t('forum_no_conversations') || 'Nenhuma conversa ainda.'}</div>
            ) : (
              filteredThreads.map((th) => (
                <button key={th.key} onClick={() => openDm(th.other)} className="w-full text-left bg-slate-50 rounded-2xl p-3 border border-slate-200 hover:bg-slate-100 transition-colors">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-black text-slate-800 truncate flex items-center gap-2">
                        <span className="truncate">{th.other}</span>
                        {getUnreadCountForThread(th.key) > 0 && (
                          <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">
                            {t('forum_unread') || 'NOVAS'}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 truncate">{th.lastText}</div>
                    </div>
                    <div className="text-[10px] font-black text-slate-400 shrink-0">{th.lastAt ? new Date(th.lastAt).toLocaleDateString() : ''}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-4 border-b-4 border-slate-200 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => { setMode('DM_LIST'); setDmThreads(listDmThreadsForUser(me)); }} className="p-2 bg-slate-100 rounded-2xl">
              <ChevronLeft size={18} className="text-slate-700" />
            </button>
            <div className="font-black text-slate-800 truncate">{dmTarget}</div>
            <div className="text-[10px] font-black text-slate-400 uppercase">{me}</div>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {dmMessages.length === 0 ? (
              <div className="text-center text-slate-400 text-sm font-bold py-10">{t('forum_no_messages') || 'Nenhuma mensagem ainda.'}</div>
            ) : (
              dmMessages.map((m) => (
                <div key={m.id} className={`rounded-2xl p-3 border ${m.author === me ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-black text-slate-700 truncate">{m.author}</div>
                      <div className="text-sm text-slate-700 break-words">{m.text}</div>
                    </div>
                    <button
                      onClick={() => { toggleLikeDm({ threadKey: dmKey, messageId: m.id, username: me }); const { messages } = loadDmThread({ userA: me, userB: dmTarget }); setDmMessages(messages); }}
                      className={`shrink-0 px-2 py-1 rounded-xl text-xs font-black inline-flex items-center gap-1 ${Array.isArray(m.likedBy) && m.likedBy.includes(me) ? 'bg-pink-100 text-pink-600' : 'bg-white text-slate-500 border border-slate-200'}`}
                    >
                      <Heart size={14} />
                      {m.likes || 0}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-3 flex gap-2">
            <input
              value={dmText}
              onChange={(e) => setDmText(e.target.value)}
              placeholder={t('forum_message_placeholder') || 'Digite sua mensagem...'}
              className="flex-1 bg-slate-100 rounded-2xl px-4 py-3 font-bold text-slate-700 outline-none border-2 border-transparent focus:border-slate-300"
            />
            <button onClick={sendDm} className="bg-slate-900 text-white px-4 rounded-2xl font-black border-b-4 border-slate-950 active:border-b-0 active:translate-y-1 transition-all">
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {showRetention && (
        <div className="fixed inset-0 z-[999]">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowRetention(false)} />
          <div className="absolute left-0 right-0 bottom-0 bg-white rounded-t-3xl p-4 pb-24 sm:pb-4 border-t border-slate-200 shadow-2xl max-h-[75vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-black text-slate-800">{t('forum_retention_title') || 'Configurar retenção'}</div>
                <div className="text-xs font-bold text-slate-500">{t('forum_retention_desc') || 'Manter histórico por:'}</div>
              </div>
              <button onClick={() => setShowRetention(false)} className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 transition-colors">
                <X size={18} className="text-slate-700" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {getForumRetentionOptions().map((d) => (
                <button
                  key={d}
                  onClick={() => applyRetention(d)}
                  className={`py-3 rounded-2xl font-black text-sm border transition-colors ${retentionDays === d ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700 border-slate-200'}`}
                >
                  {d} {t('forum_days') || 'dias'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForumTab;
