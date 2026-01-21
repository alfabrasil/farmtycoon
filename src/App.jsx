import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Heart, Droplets, Egg, AlertTriangle, Clock, Glasses, 
  ArrowUpCircle, Sun, Cloud, CloudRain, ShoppingBag, X, CheckCircle, 
  Wallet, Users, Share2, Copy, Trophy, DollarSign, 
  ArrowDownCircle, ArrowUpCircle as ArrowUpIcon, Gift, Lock, Mail, 
  Moon, Warehouse, Settings as SettingsIcon, Trash2, Crown, Zap, Thermometer, Syringe, 
  Hammer, TrendingUp, TrendingDown, RefreshCcw, ClipboardList, CheckSquare,
  User, Star, Award, Medal, Volume2, VolumeX, Gamepad2, Dices, Calendar, HelpCircle,
  Bot, BatteryCharging, ShieldCheck, Box, Cylinder, Wind, Package, Newspaper, Users2, Target, Gavel, Sparkles, Landmark, Save, Download
} from 'lucide-react';

// --- 1. CONFIGURAÇÃO E DADOS GLOBAIS ---

let IS_MUTED_GLOBAL = false;

const TYPE_CONFIG = {
  GRANJA: { color: "bg-yellow-100", border: "border-yellow-500", label: "Granja Comum", icon: "🐓", feedConsumption: 1, collectChance: { common: 0.9, rare: 0.1, legendary: 0 } },
  CAIPIRA: { color: "bg-orange-100", border: "border-orange-600", label: "Caipira Rara", icon: "🐔", feedConsumption: 1, collectChance: { common: 0.5, rare: 0.45, legendary: 0.05 } },
  GIGANTE: { color: "bg-purple-100", border: "border-purple-600", label: "Gigante Épica", icon: "🦖", feedConsumption: 2, collectChance: { common: 0.2, rare: 0.5, legendary: 0.3 } },
};

const BASE_PRICES = { EGG_COMMON: 10, EGG_RARE: 25, EGG_LEGENDARY: 100 };

const MARKET_NEWS = [
  { id: 'NORMAL', title: 'Mercado Estável', desc: 'Preços seguem a média normal.', multiplier: 1.0, color: 'text-slate-600', icon: '📊' },
  { id: 'FESTIVAL', title: 'Festival do Omelete', desc: 'Alta demanda na cidade! Preços +50%!', multiplier: 1.5, color: 'text-green-600', icon: '🍳' },
  { id: 'SURPLUS', title: 'Superprodução', desc: 'Muitos ovos no mercado. Preços -20%.', multiplier: 0.8, color: 'text-red-500', icon: '📉' },
  { id: 'HEALTH', title: 'Vida Saudável', desc: 'Nutricionistas recomendam ovos. Preços +20%.', multiplier: 1.2, color: 'text-blue-600', icon: '💪' },
  { id: 'RAINY_LOGISTICS', title: 'Chuvas Fortes', desc: 'Dificuldade no transporte. Preços -10%.', multiplier: 0.9, color: 'text-slate-500', icon: '🌧️' },
];

const ITEMS_CONFIG = {
  EGG_COMMON: { name: 'Ovo Comum', basePrice: 10, icon: '🥚', color: 'text-slate-600' },
  EGG_RARE: { name: 'Ovo Raro', basePrice: 25, icon: '✨', color: 'text-orange-500' },
  EGG_LEGENDARY: { name: 'Ovo Lendário', basePrice: 100, icon: '🌟', color: 'text-yellow-500 animate-pulse' },
  FEED: { name: 'Saco de Ração', price: 20, quantity: 10, icon: '🌽' }, 
  VACCINE: { name: 'Vacina', price: 50, quantity: 1, icon: '💉' },
  EXPANSION: { name: 'Expansão de Cerca', price: 500, quantity: 1, icon: '🚧', desc: '+4 Vagas no Galinheiro' }
};

const TECH_CONFIG = {
  NUTRIBOT: { id: 'NUTRIBOT', name: 'NutriBot 3000', price: 300, duration: 7, icon: '🤖', desc: 'Alimenta as galinhas automaticamente por 7 dias.', color: 'bg-blue-100 border-blue-400 text-blue-700' },
  CLEANSWEEP: { id: 'CLEANSWEEP', name: 'CleanSweep X', price: 450, duration: 7, icon: '🧹', desc: 'Remove sujeira automaticamente por 7 dias.', color: 'bg-green-100 border-green-400 text-green-700' }
};

const UPGRADE_CONFIG = {
  FENCE: { id: 'FENCE', name: 'Cerca Elétrica', price: 1500, icon: '⚡', desc: 'Bloqueia 100% dos ataques da Raposa.', color: 'bg-yellow-100 border-yellow-400 text-yellow-700' },
  SILO: { id: 'SILO', name: 'Silo Grande', price: 800, icon: '🏭', desc: 'Aumenta capacidade de ração para 100.', color: 'bg-slate-100 border-slate-400 text-slate-700' },
  WASHER: { id: 'WASHER', name: 'Lavadora de Ovos', price: 2000, icon: '✨', desc: '+10% no valor de venda dos ovos.', color: 'bg-cyan-100 border-cyan-400 text-cyan-700' },
  PACKER: { id: 'PACKER', name: 'Embaladora Auto', price: 3500, icon: '📦', desc: '+15% no valor (Acumula com Lavadora).', color: 'bg-indigo-100 border-indigo-400 text-indigo-700' },
  CLIMATE: { id: 'CLIMATE', name: 'Climatizador', price: 2500, icon: '❄️', desc: 'Previne doenças causadas pela chuva.', color: 'bg-teal-100 border-teal-400 text-teal-700' }
};

const STORE_ANIMALS = [
  { type: 'GRANJA', name: 'Galinha de Granja', priceCoins: 50, desc: 'Já vem adulta! Produção imediata.', minLevel: 1 },
  { type: 'CAIPIRA', name: 'Galinha Caipira', priceCoins: 250, desc: 'Alta chance de ovos raros.', minLevel: 3 },
  { type: 'GIGANTE', name: 'Galinha Gigante', priceCoins: 1000, desc: 'A rainha! Ovos dourados.', minLevel: 5 }
];

const AUCTION_MOCK_INITIAL = [
  { id: 'auc1', seller: 'FazendaX', type: 'GIGANTE', age: 12, price: 850, expires: '2h' },
  { id: 'auc2', seller: 'ReiDoOvo', type: 'CAIPIRA', age: 45, price: 300, expires: '5h' },
  { id: 'auc3', seller: 'MariaFarm', type: 'GIGANTE', age: 5, price: 900, expires: '30m' },
];

const LEADERBOARD_MOCK = [
  { id: 'top1', name: 'ReiDoOvo', coins: 950000, avatar: '👑' },
  { id: 'top2', name: 'FazendaX', coins: 540000, avatar: '🚜' },
  { id: 'top3', name: 'CryptoChicken', coins: 210000, avatar: '🚀' },
  { id: 'top4', name: 'MariaFarm', coins: 150000, avatar: '👩‍🌾' },
  { id: 'top5', name: 'João33', coins: 88000, avatar: '🤠' },
];

const REFERRAL_LEVELS = [
  { level: 1, percent: 0.10, label: '1º Nível (Direto)' },
  { level: 2, percent: 0.05, label: '2º Nível' },
  { level: 3, percent: 0.02, label: '3º Nível' },
  { level: 4, percent: 0.02, label: '4º Nível' },
  { level: 5, percent: 0.01, label: '5º Nível' },
];

const QUEST_POOL = [
  { id: 'feed_3', type: 'FEED', target: 3, desc: 'Alimentar 3 vezes', reward: 15 },
  { id: 'feed_5', type: 'FEED', target: 5, desc: 'Alimentar 5 vezes', reward: 30 },
  { id: 'collect_common', type: 'COLLECT_COMMON', target: 3, desc: 'Coletar 3 Ovos Comuns', reward: 20 },
  { id: 'collect_rare', type: 'COLLECT_RARE', target: 1, desc: 'Coletar 1 Ovo Raro', reward: 50 },
  { id: 'clean_poop', type: 'CLEAN', target: 2, desc: 'Limpar 2 sujeiras', reward: 25 },
  { id: 'buy_supply', type: 'BUY_ITEM', target: 1, desc: 'Comprar suprimentos', reward: 10 },
];

const ACHIEVEMENTS_LIST = [
  { id: 'FIRST_EGG', title: 'Primeiros Passos', desc: 'Colete seu primeiro ovo.', reward: 50, icon: '🥚', condition: (stats) => stats.total_eggs >= 1 },
  { id: 'EGG_MASTER_1', title: 'Oveiro Iniciante', desc: 'Colete 50 ovos no total.', reward: 200, icon: '🧺', condition: (stats) => stats.total_eggs >= 50 },
  { id: 'RICH_FARMER', title: 'Primeiro Milhão', desc: 'Acumule 1.000 moedas ganhas.', reward: 500, icon: '💰', condition: (stats) => stats.total_earned >= 1000 },
  { id: 'CLEAN_FREAK', title: 'Faxineiro', desc: 'Limpe 10 sujeiras.', reward: 100, icon: '🧹', condition: (stats) => stats.total_cleaned >= 10 },
  { id: 'VETERINARIAN', title: 'Veterinário', desc: 'Cure 5 galinhas doentes.', reward: 150, icon: '💉', condition: (stats) => stats.total_healed >= 5 },
  { id: 'DEDICATED', title: 'Dedicado', desc: 'Jogue por 7 dias (no jogo).', reward: 300, icon: '📅', condition: (stats) => stats.days_played >= 7 },
  { id: 'LEGENDARY_FIND', title: 'Sorte Grande', desc: 'Encontre 1 Ovo Lendário.', reward: 1000, icon: '🌟', condition: (stats) => stats.legendary_eggs >= 1 },
];

const WHEEL_PRIZES = [
  { id: 'coin_50', label: '50 Moedas', type: 'COIN', val: 50, color: '#fbbf24' },
  { id: 'feed_5', label: '5 Rações', type: 'ITEM', item: 'feed', val: 5, color: '#3b82f6' },
  { id: 'coin_200', label: '200 Moedas', type: 'COIN', val: 200, color: '#fbbf24' },
  { id: 'egg_common', label: '2 Ovos', type: 'ITEM', item: 'eggs_common', val: 2, color: '#94a3b8' },
  { id: 'coin_10', label: '10 Moedas', type: 'COIN', val: 10, color: '#fbbf24' },
  { id: 'vaccine_1', label: '1 Vacina', type: 'ITEM', item: 'vaccine', val: 1, color: '#ef4444' },
  { id: 'jackpot', label: 'JACKPOT!', type: 'COIN', val: 1000, color: '#8b5cf6', special: true },
  { id: 'egg_rare', label: 'Ovo Raro', type: 'ITEM', item: 'eggs_rare', val: 1, color: '#f97316' },
];

// --- 2. SISTEMA DE ÁUDIO ---
const playSound = (type) => {
  if (IS_MUTED_GLOBAL) return; 

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;
  if (type === 'coin') {
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(2000, now + 0.1);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc.start(now);
    osc.stop(now + 0.1);
  } else if (type === 'pop') {
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc.start(now);
    osc.stop(now + 0.1);
  } else if (type === 'squish') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.linearRampToValueAtTime(50, now + 0.1);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.1);
    osc.start(now);
    osc.stop(now + 0.1);
  } else if (type === 'success') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(554, now + 0.1);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.4);
    osc.start(now);
    osc.stop(now + 0.4);
  } else if (type === 'achievement') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.setValueAtTime(659.25, now + 0.1);
    osc.frequency.setValueAtTime(783.99, now + 0.2);
    osc.frequency.setValueAtTime(1046.50, now + 0.3);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.8);
    osc.start(now);
    osc.stop(now + 0.8);
  } else if (type === 'fox') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.linearRampToValueAtTime(400, now + 0.2);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.2);
    osc.start(now);
    osc.stop(now + 0.2);
  } else if (type === 'wheel') {
    osc.frequency.setValueAtTime(200, now);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    osc.start(now);
    osc.stop(now + 0.05);
  } else if (type === 'drone') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.linearRampToValueAtTime(600, now + 0.3);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.3);
  } else if (type === 'upgrade') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.linearRampToValueAtTime(150, now + 0.2);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.3);
  } else if (type === 'sold') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.setValueAtTime(1200, now + 0.1);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.3);
  } else if (type === 'prestige') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.linearRampToValueAtTime(800, now + 2);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0, now + 2);
    osc.start(now);
    osc.stop(now + 2);
  } else if (type === 'cash') {
     // Som de caixa registradora suave
     osc.type = 'sine';
     osc.frequency.setValueAtTime(800, now);
     osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
     gain.gain.setValueAtTime(0.2, now);
     gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
     osc.start(now);
     osc.stop(now + 0.3);
  }
};

// --- 3. COMPONENTES VISUAIS AUXILIARES ---

const FoxComponent = ({ x, y, onClick }) => (
  <button
    onClick={onClick}
    className="absolute z-40 w-16 h-16 animate-[bounce_1s_infinite] cursor-pointer hover:scale-110 transition-transform"
    style={{ left: `${x}%`, top: `${y}%` }}
  >
    <div className="text-6xl drop-shadow-xl filter drop-shadow-[0_0_10px_rgba(255,100,0,0.8)]">🦊</div>
    <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse whitespace-nowrap">
      PEGA LADRÃO!
    </div>
  </button>
);

const ConfettiEffect = () => (
  <div className="fixed inset-0 pointer-events-none z-[150] overflow-hidden">
    {[...Array(50)].map((_, i) => (
      <div
        key={i}
        className="absolute w-3 h-3 bg-red-500 rounded-sm animate-[confetti_3s_ease-out_forwards]"
        style={{
          left: '50%',
          top: '50%',
          backgroundColor: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'][i % 5],
          transform: `rotate(${Math.random() * 360}deg)`,
          '--tx': `${(Math.random() - 0.5) * 100}vw`,
          '--ty': `${(Math.random() - 0.5) * 100}vh`,
          animationDelay: `${Math.random() * 0.2}s`
        }}
      ></div>
    ))}
    <style>{`
      @keyframes confetti {
        0% { transform: translate(0, 0) scale(0); opacity: 1; }
        50% { opacity: 1; }
        100% { transform: translate(var(--tx), var(--ty)) scale(1) rotate(720deg); opacity: 0; }
      }
    `}</style>
  </div>
);

const FloatingText = ({ items }) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute flex flex-col items-center justify-center font-black text-2xl drop-shadow-md animate-[float-up_1s_ease-out_forwards]"
          style={{ left: item.x, top: item.y, color: item.color || '#22c55e' }}
        >
          {item.text}
        </div>
      ))}
    </div>
  );
};

const FarmBackground = ({ isNight, weather }) => (
  <div className={`fixed inset-0 z-0 pointer-events-none overflow-hidden font-sans transition-colors duration-1000 ${isNight ? 'bg-slate-900' : weather === 'RAINY' ? 'bg-slate-400' : ''}`}>
    <div className={`absolute inset-0 transition-opacity duration-1000 ${isNight ? 'opacity-0' : 'opacity-100'} ${weather === 'RAINY' ? 'bg-gradient-to-b from-slate-600 via-slate-400 to-slate-300' : 'bg-gradient-to-b from-sky-400 via-sky-300 to-sky-100'}`}></div>
    <div className={`absolute inset-0 transition-opacity duration-1000 ${isNight ? 'opacity-100' : 'opacity-0'} bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900`}></div>
    <div className={`absolute top-10 right-10 transition-transform duration-1000 ${isNight ? 'translate-y-96 opacity-0' : 'translate-y-0 opacity-100'} ${weather === 'RAINY' ? 'opacity-0' : 'opacity-100'} text-yellow-400 animate-pulse`}><Sun size={80} fill="currentColor" className="opacity-80" /></div>
    <div className={`absolute top-10 right-10 transition-transform duration-1000 ${isNight ? 'translate-y-0 opacity-100' : '-translate-y-32 opacity-0'} text-slate-200`}><Moon size={60} fill="currentColor" /></div>
    {!isNight && weather === 'RAINY' && (<><div className="absolute top-10 left-10 text-slate-600 opacity-80 animate-[float_10s_linear_infinite]"><CloudRain size={80} fill="currentColor" /></div><div className="absolute top-20 right-1/3 text-slate-600 opacity-80 animate-[float_12s_linear_infinite_reverse]"><CloudRain size={60} fill="currentColor" /></div></>)}
    {!isNight && weather === 'SUNNY' && (<><div className="absolute top-20 left-10 text-white opacity-60 animate-[bounce_8s_infinite]"><Cloud size={64} fill="currentColor" /></div><div className="absolute top-40 right-1/3 text-white opacity-40 animate-[bounce_12s_infinite_reverse]"><Cloud size={48} fill="currentColor" /></div></>)}
    <div className={`absolute bottom-0 w-full h-1/3 rounded-t-[50%_20%] scale-110 transition-colors duration-1000 ${isNight ? 'bg-gradient-to-t from-green-900 via-green-800 to-green-700' : weather === 'RAINY' ? 'bg-gradient-to-t from-emerald-800 via-emerald-700 to-emerald-600' : 'bg-gradient-to-t from-green-800 via-green-600 to-green-500'}`}></div>
    <div className="absolute bottom-[28%] w-full flex justify-between px-10 opacity-80 text-4xl"><span className="transform -scale-x-100">🌲</span><span>🚜</span><span className="hidden md:inline">🏡</span><span>🌲</span></div>
  </div>
);

// --- 4. COMPONENTES PRINCIPAIS (Telas e Modais) ---

const AuthScreen = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const handleRegister = (e) => { e.preventDefault(); setLoading(true); setTimeout(() => onLogin(), 1500); };
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative z-50">
      <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-full max-w-md border-b-8 border-slate-200 animate-in zoom-in-50">
        <div className="text-center mb-8"><div className="w-20 h-20 bg-yellow-400 rounded-full border-4 border-yellow-600 flex items-center justify-center text-4xl shadow-lg mx-auto mb-4 animate-bounce">🐔</div><h1 className="text-3xl font-black text-slate-800 mb-2">FarmTycoon</h1><p className="text-slate-500 font-medium">Cadastre-se e ganhe 1 Pintinho Grátis!</p></div>
        <form onSubmit={handleRegister} className="space-y-4"><input required type="email" placeholder="E-mail" className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-200 font-bold" /><input required type="password" placeholder="Senha" className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-200 font-bold" /><button disabled={loading} className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-black text-lg shadow-lg border-b-4 border-green-700 active:border-b-0 active:translate-y-1 transition-all">{loading ? 'Entrando...' : 'JOGAR AGORA 🚀'}</button></form>
      </div>
    </div>
  );
};

const UnboxingScreen = ({ onFinish }) => {
  const [stage, setStage] = useState('closed');
  const handleOpen = () => { playSound('pop'); setStage('shaking'); setTimeout(() => setStage('opened'), 1000); };
  return (
    <div className="min-h-screen flex items-center justify-center p-6 z-50 relative bg-black/40 backdrop-blur-sm">
      <div className="text-center">{stage !== 'opened' ? (<div className="animate-in zoom-in duration-300 cursor-pointer" onClick={handleOpen}><div className={`w-48 h-48 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl border-4 border-white shadow-[0_0_50px_rgba(255,200,0,0.5)] flex items-center justify-center ${stage === 'shaking' ? 'animate-[spin_0.5s_ease-in-out_infinite]' : 'animate-bounce'}`}><Gift size={80} className="text-white" /></div><p className="mt-8 text-white font-black text-2xl drop-shadow-md">Toque para Abrir!</p></div>) : (<div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm animate-in zoom-in-50 border-b-8 border-slate-200"><div className="text-6xl mb-4 animate-bounce">🐣</div><h2 className="text-2xl font-black text-slate-800 mb-2">Pintinho Recebido!</h2><p className="text-slate-500 text-sm mb-6">Ele precisa de comida e água todos os dias para crescer.</p><button onClick={() => { playSound('success'); onFinish(); }} className="w-full bg-blue-500 text-white py-3 rounded-xl font-black shadow-md border-b-4 border-blue-700 active:border-b-0 active:translate-y-1">IR PARA A FAZENDA</button></div>)}</div>
    </div>
  );
};

const Navbar = ({ balance, dayCount, onViewChange, currentView, level, xp, xpToNextLevel, weather, openQuests, goldenEggs, pendingRewards }) => (
  <header className="flex justify-between items-center mb-6 bg-white/90 backdrop-blur-md p-3 rounded-2xl border-b-4 border-slate-200 shadow-xl z-50 relative transition-all">
    <div className="flex items-center gap-2 cursor-pointer group" onClick={() => { playSound('pop'); onViewChange('PROFILE'); }}>
       <div className="relative">
         <div className="w-10 h-10 bg-yellow-300 rounded-full border-2 border-orange-500 flex items-center justify-center text-xl shadow-sm">👨‍🌾</div>
         <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold border border-white">{level}</div>
         {goldenEggs > 0 && <div className="absolute -top-2 -right-2 text-yellow-500 animate-pulse drop-shadow-md"><Sparkles size={16} fill="currentColor"/></div>}
       </div>
       <div>
          <h2 className="font-black text-slate-800 text-sm leading-tight flex items-center gap-1">
            Dia {dayCount} 
            {weather === 'RAINY' ? <CloudRain size={14} className="text-blue-500"/> : <Sun size={14} className="text-orange-500"/>}
          </h2>
          <div className="w-16 h-2 bg-slate-200 rounded-full mt-1 overflow-hidden border border-slate-300 relative">
            <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${(xp / xpToNextLevel) * 100}%` }}></div>
          </div>
       </div>
    </div>
    <div className="flex items-center gap-2">
      <div onClick={() => { playSound('pop'); onViewChange('BANK'); }} className={`p-2 rounded-full border-b-4 active:border-b-0 active:translate-y-1 transition-all cursor-pointer shadow-sm ${currentView === 'BANK' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-white text-slate-400 border-slate-200 hover:text-green-600'}`}><Landmark size={20} /></div>
      <div onClick={() => { playSound('pop'); onViewChange('SETTINGS'); }} className={`p-2 rounded-full border-b-4 active:border-b-0 active:translate-y-1 transition-all cursor-pointer shadow-sm ${currentView === 'SETTINGS' ? 'bg-slate-200 text-slate-600 border-slate-400' : 'bg-white text-slate-400 border-slate-200 hover:text-slate-600'}`}><SettingsIcon size={20} /></div>
      <div onClick={() => { playSound('pop'); onViewChange('WHEEL'); }} className={`p-2 rounded-full border-b-4 active:border-b-0 active:translate-y-1 transition-all cursor-pointer shadow-sm ${currentView === 'WHEEL' ? 'bg-purple-100 text-purple-600 border-purple-300' : 'bg-white text-slate-400 border-slate-200 hover:text-purple-500'}`}><Dices size={20} /></div>
      <div onClick={() => { playSound('pop'); onViewChange('COMMUNITY'); }} className={`p-2 rounded-full border-b-4 active:border-b-0 active:translate-y-1 transition-all cursor-pointer shadow-sm ${currentView === 'COMMUNITY' ? 'bg-blue-100 text-blue-600 border-blue-300' : 'bg-white text-slate-400 border-slate-200 hover:text-blue-500'}`}><Users2 size={20} /></div>
      <div onClick={() => { playSound('pop'); openQuests(); }} className="relative p-2 rounded-full border-b-4 bg-white text-slate-400 border-slate-200 hover:text-blue-500 cursor-pointer shadow-sm active:border-b-0 active:translate-y-1">
        <ClipboardList size={20} />
        {pendingRewards && <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>}
      </div>
      <div onClick={() => { playSound('pop'); onViewChange('BARN'); }} className={`p-2 rounded-full border-b-4 active:border-b-0 active:translate-y-1 transition-all cursor-pointer shadow-sm ${currentView === 'BARN' ? 'bg-orange-100 text-orange-600 border-orange-300' : 'bg-white text-slate-400 border-slate-200 hover:text-orange-500'}`}><Warehouse size={20} /></div>
      <div onClick={() => { playSound('pop'); onViewChange('STORE'); }} className={`flex items-center gap-1 px-3 py-1.5 rounded-full border-b-4 active:border-b-0 active:translate-y-1 transition-all cursor-pointer shadow-sm ${currentView === 'STORE' ? 'bg-yellow-100 text-yellow-700 border-yellow-400' : 'bg-yellow-400 text-yellow-900 border-yellow-600'}`}><ShoppingBag size={16} /><span className="font-black text-sm hidden sm:inline">LOJA</span></div>
      <div className="h-8 w-[2px] bg-slate-300 mx-1"></div>
      <div onClick={() => { playSound('pop'); onViewChange('WALLET'); }} className="flex flex-col items-end gap-0.5 cursor-pointer hover:scale-105 transition-transform"><div className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md border min-w-[80px] justify-end bg-white text-slate-700 border-slate-200"><span className="text-yellow-500">💰</span> {balance}</div></div>
    </div>
  </header>
);

const BarnScreen = ({ onBack, inventory, onSellEggs, addFloatingText, marketPrices, upgrades, marketNews, goldenEggs }) => {
  const washerMultiplier = upgrades?.WASHER ? 1.1 : 1.0;
  const packerMultiplier = upgrades?.PACKER ? 1.15 : 1.0;
  const prestigeMultiplier = 1 + (goldenEggs * 0.1);
  const marketMultiplier = marketNews?.multiplier || 1.0;

  const totalValue = Math.floor(
    ((inventory.eggs_common * marketPrices.common) + 
    (inventory.eggs_rare * marketPrices.rare) + 
    (inventory.eggs_legendary * marketPrices.legendary)) * washerMultiplier * packerMultiplier * marketMultiplier * prestigeMultiplier
  );

  const getPriceColor = (current, base) => current > base ? 'text-green-600' : current < base ? 'text-red-500' : 'text-slate-600';
  const getArrow = (current, base) => current > base ? <TrendingUp size={16} className="text-green-600 inline" /> : current < base ? <TrendingDown size={16} className="text-red-500 inline" /> : <span className="text-slate-400">-</span>;
  const totalEggs = inventory.eggs_common + inventory.eggs_rare + inventory.eggs_legendary;

  return (
    <div className="animate-in slide-in-from-right-10 fade-in duration-300">
      <div className="flex items-center gap-2 mb-4"><button onClick={onBack} className="bg-white p-2 rounded-full shadow-md"><X size={24}/></button><h1 className="text-2xl font-black text-slate-800 bg-white/50 px-3 py-1 rounded-xl">Celeiro</h1></div>
      {marketNews && (<div className={`mb-4 border px-4 py-3 rounded-xl flex items-center gap-3 ${marketNews.multiplier >= 1 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}><div className="text-2xl">{marketNews.icon}</div><div className="flex-1"><h4 className={`font-black text-sm ${marketNews.color}`}>{marketNews.title}</h4><p className="text-xs text-slate-600">{marketNews.desc}</p></div></div>)}
      <div className="flex flex-col gap-2 mb-4">
        {upgrades?.WASHER && (<div className="bg-cyan-50 border border-cyan-200 text-cyan-800 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold"><CheckCircle size={16} /> Lavadora: +10% Valor</div>)}
        {upgrades?.PACKER && (<div className="bg-indigo-50 border border-indigo-200 text-indigo-800 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold"><Package size={16} /> Embaladora: +15% Valor</div>)}
        {goldenEggs > 0 && (<div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold"><Sparkles size={16} /> Prestígio: +{Math.round((prestigeMultiplier - 1)*100)}% Bônus</div>)}
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6"><div className="bg-white/90 p-4 rounded-3xl border-b-4 border-slate-200 flex flex-col items-center"><span className="text-4xl mb-2">{ITEMS_CONFIG.FEED.icon}</span><span className="font-black text-slate-700">Ração</span><span className="text-sm font-bold text-slate-500">{inventory.feed} / {upgrades?.SILO ? 100 : 20}</span></div><div className="bg-white/90 p-4 rounded-3xl border-b-4 border-slate-200 flex flex-col items-center"><span className="text-4xl mb-2">{ITEMS_CONFIG.VACCINE.icon}</span><span className="font-black text-slate-700">Vacinas</span><span className="text-sm font-bold text-slate-500">{inventory.vaccine} doses</span></div></div>
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 border-b-8 border-orange-200 shadow-xl mb-6">
        <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-black text-orange-800 flex items-center gap-2"><Egg /> Estoque & Cotação</h2><span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-1 rounded-md flex items-center gap-1"><RefreshCcw size={10}/> Atualiza ao dormir</span></div>
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl border border-orange-100"><div className="flex items-center gap-3"><span className="text-2xl">{ITEMS_CONFIG.EGG_COMMON.icon}</span> <div><span className="font-bold text-slate-700 block text-sm">{ITEMS_CONFIG.EGG_COMMON.name}</span><span className={`text-xs font-bold ${getPriceColor(marketPrices.common, BASE_PRICES.EGG_COMMON)}`}>{getArrow(marketPrices.common, BASE_PRICES.EGG_COMMON)} ${marketPrices.common}</span></div></div><div className="font-black text-lg">x{inventory.eggs_common}</div></div>
          <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl border border-orange-100"><div className="flex items-center gap-3"><span className="text-2xl">{ITEMS_CONFIG.EGG_RARE.icon}</span> <div><span className="font-bold text-slate-700 block text-sm">{ITEMS_CONFIG.EGG_RARE.name}</span><span className={`text-xs font-bold ${getPriceColor(marketPrices.rare, BASE_PRICES.EGG_RARE)}`}>{getArrow(marketPrices.rare, BASE_PRICES.EGG_RARE)} ${marketPrices.rare}</span></div></div><div className="font-black text-lg">x{inventory.eggs_rare}</div></div>
          <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl border border-purple-100"><div className="flex items-center gap-3"><span className="text-2xl animate-pulse">{ITEMS_CONFIG.EGG_LEGENDARY.icon}</span> <div><span className="font-bold text-purple-700 block text-sm">{ITEMS_CONFIG.EGG_LEGENDARY.name}</span><span className={`text-xs font-bold ${getPriceColor(marketPrices.legendary, BASE_PRICES.EGG_LEGENDARY)}`}>{getArrow(marketPrices.legendary, BASE_PRICES.EGG_LEGENDARY)} ${marketPrices.legendary}</span></div></div><div className="font-black text-lg text-purple-700">x{inventory.eggs_legendary}</div></div>
        </div>
        <div className="bg-slate-800 rounded-2xl p-4 text-white flex justify-between items-center mb-4"><span className="font-bold text-slate-400 uppercase text-xs">Valor Estimado</span><span className="font-black text-2xl text-yellow-400">💰 {totalValue}</span></div>
        <button onClick={() => { if(totalEggs > 0) { onSellEggs(totalValue); playSound('success'); } }} disabled={totalEggs === 0} className="w-full bg-green-500 hover:bg-green-600 disabled:bg-slate-300 text-white py-3 rounded-xl font-black shadow-md border-b-4 border-green-700 active:border-b-0 active:translate-y-1 transition-all disabled:border-slate-400">VENDER TUDO</button>
      </div>
    </div>
  );
};

// NOVO: Tela do Banco
const BankScreen = ({ onBack, balance, setBalance, bankBalance, setBankBalance }) => {
  const [amount, setAmount] = useState('');
  
  const handleDeposit = () => {
    const val = Number(amount);
    if (val > 0 && val <= balance) {
      setBalance(prev => prev - val);
      setBankBalance(prev => prev + val);
      setAmount('');
      playSound('cash');
    }
  };

  const handleWithdraw = () => {
    const val = Number(amount);
    if (val > 0 && val <= bankBalance) {
      setBankBalance(prev => prev - val);
      setBalance(prev => prev + val);
      setAmount('');
      playSound('cash');
    }
  };

  return (
    <div className="animate-in slide-in-from-bottom-10 fade-in duration-300">
      <div className="flex items-center gap-2 mb-4"><button onClick={onBack} className="bg-white p-2 rounded-full shadow-md"><X size={24}/></button><h1 className="text-2xl font-black text-slate-800 bg-white/50 px-3 py-1 rounded-xl">Banco da Fazenda</h1></div>
      <div className="bg-green-600 text-white p-6 rounded-3xl shadow-xl mb-6 text-center border-b-8 border-green-800">
        <p className="text-xs uppercase font-bold opacity-70 mb-1">Saldo Investido</p>
        <div className="text-4xl font-black mb-2 flex justify-center items-center gap-2"><Landmark size={32}/> {bankBalance}</div>
        <div className="bg-green-800/50 rounded-xl py-1 px-3 text-xs inline-flex items-center gap-1"><TrendingUp size={12}/> Rendimento Diário: +5%</div>
      </div>
      
      <div className="bg-white/90 p-6 rounded-3xl border-b-4 border-slate-200">
        <div className="flex gap-2 mb-4">
           <div className="flex-1 text-center"><p className="text-xs text-slate-400 font-bold">Na Carteira</p><p className="font-black text-slate-800 text-lg">{balance} 💰</p></div>
        </div>
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Valor..." className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-200 font-bold text-center text-xl mb-4 focus:border-green-500 outline-none" />
        <div className="flex gap-2">
          <button onClick={handleDeposit} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-black shadow-md border-b-4 border-green-700 active:border-b-0 active:translate-y-1">DEPOSITAR</button>
          <button onClick={handleWithdraw} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-black shadow-md border-b-4 border-red-700 active:border-b-0 active:translate-y-1">SACAR</button>
        </div>
      </div>
    </div>
  );
};

const RankingScreen = ({ onBack, balance }) => (
  <div className="animate-in slide-in-from-right-10 fade-in"><div className="flex items-center gap-2 mb-4"><button onClick={onBack} className="bg-white p-2 rounded-full shadow-md"><X size={24}/></button><h1 className="text-2xl font-black text-slate-800 bg-white/50 px-3 py-1 rounded-xl">Ranking</h1></div><div className="bg-white/90 p-6 rounded-3xl border-b-4 border-slate-200 shadow-xl space-y-4">{LEADERBOARD_MOCK.map((p,i)=>(<div key={p.id} className="flex justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100"><div className="flex gap-4"><span className="font-black text-slate-400">{i+1}</span> <span>{p.avatar} {p.name}</span></div><span className="font-black text-green-600">{p.coins}</span></div>))}<div className="h-px bg-slate-200 my-2"></div><div className="flex justify-between p-4 bg-blue-50 rounded-2xl border-2 border-blue-200"><div className="flex gap-4"><span className="font-black text-blue-600">99+</span> <span>👨‍🌾 Você</span></div><span className="font-black text-blue-700">{balance}</span></div></div></div>
);

const SettingsScreen = ({ onBack, onReset, dayCount, isMuted, toggleMute, onPrestige, canPrestige, goldenEggsToGain, onExportSave, onImportSave }) => (
  <div className="animate-in slide-in-from-right-10 fade-in">
    <div className="flex items-center gap-2 mb-4"><button onClick={onBack} className="bg-white p-2 rounded-full shadow-md"><X size={24}/></button><h1 className="text-2xl font-black text-slate-800 bg-white/50 px-3 py-1 rounded-xl">Config</h1></div>
    <div className="bg-white/90 p-6 rounded-3xl border-b-4 border-slate-200 space-y-4">
      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200"><div className="flex items-center gap-3">{isMuted ? <VolumeX size={24} className="text-slate-400"/> : <Volume2 size={24} className="text-blue-500"/>}<span className="font-bold text-slate-700">Sons do Jogo</span></div><button onClick={toggleMute} className={`w-14 h-8 rounded-full transition-colors relative ${isMuted ? 'bg-slate-300' : 'bg-green-500'}`}><div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${isMuted ? 'left-1' : 'right-1'}`}></div></button></div>
      
      {/* SEÇÃO DE SAVE */}
      <div className="flex gap-2">
        <button onClick={onExportSave} className="flex-1 bg-blue-100 text-blue-600 py-3 rounded-xl font-bold text-xs border-2 border-blue-200 flex items-center justify-center gap-1"><Save size={16}/> SALVAR (COPIAR)</button>
        <button onClick={onImportSave} className="flex-1 bg-blue-100 text-blue-600 py-3 rounded-xl font-bold text-xs border-2 border-blue-200 flex items-center justify-center gap-1"><Download size={16}/> CARREGAR</button>
      </div>

      {/* SEÇÃO DE PRESTÍGIO */}
      <div className="p-4 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-2xl border-2 border-yellow-300 mt-4">
        <h3 className="font-black text-yellow-800 flex items-center gap-2"><Crown size={20}/> Ascensão (Rebirth)</h3>
        <p className="text-xs text-yellow-700 mb-3">Venda sua fazenda para ganhar Ovos Dourados e recomeçar com bônus permanentes.</p>
        <div className="flex justify-between items-center bg-white/50 p-2 rounded-lg mb-3">
          <span className="text-xs font-bold text-slate-600">Recompensa:</span>
          <span className="text-sm font-black text-yellow-600 flex items-center gap-1">+{goldenEggsToGain} <Egg size={12}/></span>
        </div>
        <button 
          disabled={!canPrestige}
          onClick={onPrestige}
          className={`w-full py-3 rounded-xl font-black shadow-md border-b-4 text-xs flex items-center justify-center gap-2 transition-all ${canPrestige ? 'bg-yellow-500 border-yellow-700 text-white hover:bg-yellow-600 active:border-b-0 active:translate-y-1' : 'bg-slate-300 border-slate-400 text-slate-500 cursor-not-allowed'}`}
        >
          {canPrestige ? 'ASCENDER AGORA' : 'MÍNIMO: 5.000 MOEDAS'}
        </button>
      </div>

      <button onClick={onReset} className="w-full bg-red-100 text-red-600 border-2 border-red-200 py-3 rounded-xl font-bold shadow-sm text-xs mt-4">APAGAR DADOS (RESET TOTAL)</button>
    </div>
  </div>
);

// NOVA LOJA COM ABA DE TECNOLOGIA
const StoreScreen = ({ onBack, onBuyAnimal, onBuyItem, balance, level, addFloatingText, automations, upgrades }) => {
  const [tab, setTab] = useState('ANIMALS'); 
  return (
    <div className="animate-in slide-in-from-bottom-10 fade-in">
      <div className="flex items-center gap-2 mb-4"><button onClick={onBack} className="bg-white p-2 rounded-full shadow-md"><X size={24}/></button><h1 className="text-2xl font-black text-slate-800 bg-white/50 px-3 py-1 rounded-xl">Loja</h1></div>
      <div className="flex gap-2 mb-4 bg-white/80 p-1 rounded-2xl overflow-x-auto">
        <button onClick={()=>setTab('ANIMALS')} className={`flex-1 py-2 px-3 rounded-xl font-black text-sm transition-all whitespace-nowrap ${tab==='ANIMALS'?'bg-yellow-400 text-yellow-900 shadow-sm':'text-slate-400'}`}>ANIMAIS</button>
        <button onClick={()=>setTab('ITEMS')} className={`flex-1 py-2 px-3 rounded-xl font-black text-sm transition-all whitespace-nowrap ${tab==='ITEMS'?'bg-blue-400 text-white shadow-sm':'text-slate-400'}`}>SUPRIMENTOS</button>
        <button onClick={()=>setTab('TECH')} className={`flex-1 py-2 px-3 rounded-xl font-black text-sm transition-all whitespace-nowrap ${tab==='TECH'?'bg-purple-500 text-white shadow-sm':'text-slate-400'}`}>TECNOLOGIA</button>
        <button onClick={()=>setTab('STRUCTURE')} className={`flex-1 py-2 px-3 rounded-xl font-black text-sm transition-all whitespace-nowrap ${tab==='STRUCTURE'?'bg-slate-700 text-white shadow-sm':'text-slate-400'}`}>ESTRUTURA</button>
      </div>
      
      <div className="space-y-4 pb-20">
        {tab === 'ANIMALS' ? STORE_ANIMALS.map(p => { const isLocked = level < p.minLevel; const canAfford = balance >= p.priceCoins; return (<div key={p.type} className={`bg-white/90 p-4 rounded-3xl border-b-4 border-slate-200 flex items-center gap-4 relative overflow-hidden ${isLocked ? 'grayscale opacity-80' : ''}`}>{isLocked && <div className="absolute inset-0 bg-slate-200/50 backdrop-blur-[1px] z-10 flex items-center justify-center"><div className="bg-slate-800 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg"><Lock size={16} /> Nível {p.minLevel}</div></div>}<div className={`text-4xl w-16 h-16 flex items-center justify-center rounded-2xl ${TYPE_CONFIG[p.type].color} border-2 ${TYPE_CONFIG[p.type].border}`}>{TYPE_CONFIG[p.type].icon}</div><div className="flex-1"><h3 className="font-black text-slate-800">{p.name}</h3><p className="text-xs text-slate-500">{p.desc}</p></div><button disabled={isLocked || !canAfford} onClick={(e)=>{onBuyAnimal(p, e); playSound('coin');}} className="bg-green-500 disabled:bg-slate-300 text-white px-4 py-2 rounded-xl font-black border-b-4 border-green-700 disabled:border-slate-400 whitespace-nowrap">{p.priceCoins} 💰</button></div>); }) 
        : tab === 'ITEMS' ? (<><div className="bg-white/90 p-4 rounded-3xl border-b-4 border-slate-200 flex items-center gap-4"><div className="text-4xl w-16 h-16 flex items-center justify-center rounded-2xl bg-blue-100 border-2 border-blue-400">{ITEMS_CONFIG.FEED.icon}</div><div className="flex-1"><h3 className="font-black text-slate-800">{ITEMS_CONFIG.FEED.name}</h3><p className="text-xs text-slate-500 font-bold text-blue-600">x{ITEMS_CONFIG.FEED.quantity}</p></div><button disabled={balance < ITEMS_CONFIG.FEED.price} onClick={(e)=>{onBuyItem('FEED', e); playSound('coin');}} className="bg-green-500 disabled:bg-slate-300 text-white px-4 py-2 rounded-xl font-black border-b-4 border-green-700 disabled:border-slate-400 whitespace-nowrap">{ITEMS_CONFIG.FEED.price} 💰</button></div><div className="bg-white/90 p-4 rounded-3xl border-b-4 border-slate-200 flex items-center gap-4"><div className="text-4xl w-16 h-16 flex items-center justify-center rounded-2xl bg-red-100 border-2 border-red-400">{ITEMS_CONFIG.VACCINE.icon}</div><div className="flex-1"><h3 className="font-black text-slate-800">{ITEMS_CONFIG.VACCINE.name}</h3><p className="text-xs text-slate-500 font-bold text-red-600">Cura</p></div><button disabled={balance < ITEMS_CONFIG.VACCINE.price} onClick={(e)=>{onBuyItem('VACCINE', e); playSound('coin');}} className="bg-green-500 disabled:bg-slate-300 text-white px-4 py-2 rounded-xl font-black border-b-4 border-green-700 disabled:border-slate-400 whitespace-nowrap">{ITEMS_CONFIG.VACCINE.price} 💰</button></div><div className="bg-white/90 p-4 rounded-3xl border-b-4 border-slate-200 flex items-center gap-4"><div className="text-4xl w-16 h-16 flex items-center justify-center rounded-2xl bg-slate-200 border-2 border-slate-400">{ITEMS_CONFIG.EXPANSION.icon}</div><div className="flex-1"><h3 className="font-black text-slate-800">{ITEMS_CONFIG.EXPANSION.name}</h3><p className="text-xs text-slate-500 font-bold text-slate-600">{ITEMS_CONFIG.EXPANSION.desc}</p></div><button disabled={balance < ITEMS_CONFIG.EXPANSION.price} onClick={(e)=>{onBuyItem('EXPANSION', e); playSound('coin');}} className="bg-orange-500 disabled:bg-slate-300 text-white px-4 py-2 rounded-xl font-black border-b-4 border-orange-700 disabled:border-slate-400 whitespace-nowrap">{ITEMS_CONFIG.EXPANSION.price} 💰</button></div></>)
        : tab === 'TECH' ? (
          <>
            {Object.values(TECH_CONFIG).map(tech => {
              const isActive = automations[tech.id]?.active;
              const daysLeft = automations[tech.id]?.daysLeft || 0;
              return (
                <div key={tech.id} className={`bg-white/90 p-4 rounded-3xl border-b-4 flex items-center gap-4 ${isActive ? 'border-green-300 bg-green-50' : 'border-purple-200'}`}>
                  <div className={`text-4xl w-16 h-16 flex items-center justify-center rounded-2xl border-2 ${tech.color} bg-white`}>{tech.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-black text-slate-800">{tech.name}</h3>
                    <p className="text-xs text-slate-500">{tech.desc}</p>
                    {isActive && <span className="text-[10px] font-bold bg-green-200 text-green-800 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit mt-1"><BatteryCharging size={10}/> Ativo: {daysLeft} dias</span>}
                  </div>
                  <button 
                    disabled={isActive || balance < tech.price} 
                    onClick={(e)=>{onBuyItem(tech.id, e); playSound('drone');}} 
                    className={`px-4 py-2 rounded-xl font-black border-b-4 whitespace-nowrap text-white ${isActive ? 'bg-slate-300 border-slate-400 cursor-default' : 'bg-purple-500 border-purple-700 hover:bg-purple-600'}`}
                  >
                    {isActive ? 'ATIVO' : `${tech.price} 💰`}
                  </button>
                </div>
              );
            })}
          </>
        ) : (
          // ABA ESTRUTURA (UPGRADES PERMANENTES)
          <>
            {Object.values(UPGRADE_CONFIG).map(upg => {
              const isOwned = upgrades[upg.id];
              return (
                <div key={upg.id} className={`bg-white/90 p-4 rounded-3xl border-b-4 flex items-center gap-4 ${isOwned ? 'border-yellow-300 bg-yellow-50' : 'border-slate-200'}`}>
                  <div className={`text-4xl w-16 h-16 flex items-center justify-center rounded-2xl border-2 ${upg.color} bg-white`}>{upg.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-black text-slate-800">{upg.name}</h3>
                    <p className="text-xs text-slate-500">{upg.desc}</p>
                    {isOwned && <span className="text-[10px] font-bold bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit mt-1"><ShieldCheck size={10}/> Adquirido</span>}
                  </div>
                  <button 
                    disabled={isOwned || balance < upg.price} 
                    onClick={(e)=>{onBuyItem(upg.id, e); playSound('upgrade');}} 
                    className={`px-4 py-2 rounded-xl font-black border-b-4 whitespace-nowrap text-white ${isOwned ? 'bg-slate-300 border-slate-400 cursor-default' : 'bg-slate-700 border-slate-900 hover:bg-slate-800'}`}
                  >
                    {isOwned ? 'JÁ TEM' : `${upg.price} 💰`}
                  </button>
                </div>
              );
            })}
          </>
        )
        }
      </div>
    </div>
  );
};

const CommunityScreen = ({ onBack, onSimulateReferral, referralHistory, coopProgress, onContributeCoop, onBuyAuction, chickens, onSellAuction, balance, maxCapacity, auctionItems }) => {
  const [tab, setTab] = useState('AUCTION');
  const [selectedSell, setSelectedSell] = useState(null);
  
  return (
    <div className="animate-in slide-in-from-bottom-10 fade-in duration-300 pb-20">
      <div className="flex items-center gap-2 mb-4"><button onClick={onBack} className="bg-white p-2 rounded-full shadow-md"><X size={24}/></button><h1 className="text-2xl font-black text-slate-800 bg-white/50 px-3 py-1 rounded-xl">Centro Comunitário</h1></div>
      
      <div className="flex gap-2 mb-6 bg-white/80 p-1 rounded-2xl overflow-x-auto">
        <button onClick={()=>setTab('AUCTION')} className={`flex-1 py-2 px-3 rounded-xl font-black text-sm transition-all whitespace-nowrap ${tab==='AUCTION'?'bg-amber-500 text-white shadow-sm':'text-slate-400'}`}>LEILÃO</button>
        <button onClick={()=>setTab('AFFILIATE')} className={`flex-1 py-2 px-3 rounded-xl font-black text-sm transition-all whitespace-nowrap ${tab==='AFFILIATE'?'bg-blue-500 text-white shadow-sm':'text-slate-400'}`}>AFILIADOS</button>
        <button onClick={()=>setTab('COOP')} className={`flex-1 py-2 px-3 rounded-xl font-black text-sm transition-all whitespace-nowrap ${tab==='COOP'?'bg-green-500 text-white shadow-sm':'text-slate-400'}`}>COOPERATIVA</button>
      </div>

      {tab === 'AFFILIATE' ? (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border-b-8 border-blue-900">
             <div className="absolute top-0 right-0 p-4 opacity-20"><Share2 size={120} /></div><h2 className="text-lg font-bold mb-1 opacity-90">Link de Convite</h2><div className="flex gap-2 items-center bg-black/20 p-3 rounded-xl border border-white/20 backdrop-blur-sm mb-4"><code className="flex-1 font-mono text-sm truncate">farmtycoon.app/ref/fazendeiro01</code><button className="p-2 hover:bg-white/20 rounded-lg transition-colors"><Copy size={18} /></button></div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-5 border-b-4 border-slate-200 shadow-lg">
            <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2"><Zap className="text-yellow-500" size={20}/> Simulador de Ganhos</h3>
            <div className="grid grid-cols-1 gap-2">
              {REFERRAL_LEVELS.map((lvl) => (
                <button key={lvl.level} onClick={(e) => onSimulateReferral(lvl, e)} className="flex items-center justify-between p-3 bg-slate-50 hover:bg-green-50 active:scale-95 transition-all rounded-xl border border-slate-200 hover:border-green-300 group"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-slate-200 group-hover:bg-green-500 group-hover:text-white flex items-center justify-center font-bold text-xs transition-colors">{lvl.level}º</div><span className="font-bold text-slate-600 group-hover:text-green-700">{lvl.label}</span></div><div className="text-right"><span className="text-xs text-slate-400 block">Comissão {(lvl.percent * 100)}%</span><span className="font-black text-green-600 text-lg">+{Math.floor(1000 * lvl.percent)} 💰</span></div></button>
              ))}
            </div>
          </div>
          {referralHistory.length > 0 && (<div className="bg-white/80 p-4 rounded-3xl border-b-4 border-slate-200"><h4 className="font-bold text-slate-700 mb-2">Histórico Recente</h4><div className="space-y-2 max-h-40 overflow-y-auto">{referralHistory.map((item) => (<div key={item.id} className="text-xs flex justify-between text-slate-500 border-b border-slate-100 pb-1"><span>{item.desc}</span><span className="font-bold text-green-600">+{item.amount}</span></div>))}</div></div>)}
        </div>
      ) : tab === 'COOP' ? (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border-b-8 border-green-900">
             <div className="absolute top-0 right-0 p-4 opacity-20"><Target size={120} /></div>
             <h2 className="text-lg font-bold mb-1 opacity-90">Meta da Semana</h2>
             <div className="text-3xl font-black mb-2">Entregar 500 Ovos</div>
             <div className="bg-black/20 p-4 rounded-2xl backdrop-blur-sm">
                <div className="flex justify-between text-xs font-bold mb-1"><span>Progresso Coletivo</span><span>{coopProgress} / 500</span></div>
                <div className="h-4 bg-white/20 rounded-full overflow-hidden border border-white/30"><div className="h-full bg-yellow-400 transition-all duration-1000" style={{ width: `${Math.min((coopProgress/500)*100, 100)}%` }}></div></div>
             </div>
          </div>
          <div className="bg-white/90 p-6 rounded-3xl border-b-4 border-slate-200">
            <h3 className="font-black text-slate-800 mb-4">Contribuir com a Cooperativa</h3>
            <p className="text-slate-500 text-sm mb-4">Doe ovos comuns para ajudar a comunidade. Você ganha 5 XP por ovo doado, mas não recebe moedas.</p>
            <button onClick={onContributeCoop} className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-black text-lg shadow-lg border-b-4 border-green-700 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2">
              <Gift size={20}/> DOAR 1 OVO COMUM
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border-b-8 border-amber-800">
             <div className="absolute top-0 right-0 p-4 opacity-20"><Gavel size={120} /></div>
             <h2 className="text-2xl font-black mb-1 opacity-90">Casa de Leilões</h2>
             <p className="text-white/80 font-medium text-sm">Compre e venda galinhas raras!</p>
          </div>
          <div>
            <h3 className="font-black text-slate-800 mb-3 flex items-center gap-2"><ShoppingBag size={20}/> Ofertas Ativas</h3>
            {auctionItems.length === 0 ? (
              <div className="text-center py-4 text-slate-400 italic">Nenhum leilão disponível no momento.</div>
            ) : (
              <div className="space-y-3">
                {auctionItems.map(listing => (
                  <div key={listing.id} className="bg-white p-3 rounded-2xl border-b-4 border-slate-200 flex items-center gap-3">
                    <div className={`w-12 h-12 flex items-center justify-center text-2xl rounded-xl border-2 ${TYPE_CONFIG[listing.type].color} ${TYPE_CONFIG[listing.type].border}`}>{TYPE_CONFIG[listing.type].icon}</div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <span className="font-black text-slate-700 text-sm">{listing.type} <span className="font-normal text-slate-400">({listing.age} dias)</span></span>
                        <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><Clock size={10}/> {listing.expires}</span>
                      </div>
                      <div className="text-xs text-slate-500">Vendedor: {listing.seller}</div>
                    </div>
                    <button disabled={balance < listing.price || chickens.length >= maxCapacity} onClick={() => onBuyAuction(listing)} className="bg-green-500 disabled:bg-slate-300 text-white px-3 py-2 rounded-xl font-black text-xs border-b-4 border-green-700 disabled:border-slate-400 active:border-b-0 active:translate-y-1 transition-all">
                      {listing.price} 💰
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-black text-slate-800 mb-3 flex items-center gap-2 mt-6"><DollarSign size={20}/> Vender suas Galinhas</h3>
            {chickens.length === 0 ? <p className="text-xs text-slate-400">Você não tem galinhas para vender.</p> : (
              <div className="grid grid-cols-3 gap-2">
                {chickens.map(chicken => (
                  <div key={chicken.id} onClick={() => setSelectedSell(chicken)} className={`cursor-pointer p-2 rounded-xl border-2 transition-all ${selectedSell?.id === chicken.id ? 'bg-amber-100 border-amber-400' : 'bg-white border-slate-200'}`}>
                    <div className="text-center text-2xl mb-1">{TYPE_CONFIG[chicken.type].icon}</div>
                    <div className="text-[10px] font-bold text-center text-slate-600 truncate">{chicken.name}</div>
                  </div>
                ))}
              </div>
            )}
            {selectedSell && (
              <div className="mt-4 bg-white p-4 rounded-2xl border-b-4 border-slate-200 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex justify-between items-center mb-4"><span className="font-bold text-slate-600">Preço Sugerido:</span><span className="font-black text-xl text-green-600">{Math.floor(TYPE_CONFIG[selectedSell.type].feedConsumption * 100 + selectedSell.age_days * 2)} 💰</span></div>
                <button onClick={() => { onSellAuction(selectedSell); setSelectedSell(null); }} className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-black shadow-lg border-b-4 border-amber-700 active:border-b-0 active:translate-y-1 transition-all">VENDER NO LEILÃO</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const WheelScreen = ({ onBack, onSpin, canSpin, balance }) => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const handleSpinClick = () => {
    if (!canSpin || spinning) return;
    setSpinning(true);
    playSound('wheel');
    const newRotation = rotation + 1800 + Math.random() * 360; 
    setRotation(newRotation);
    setTimeout(() => {
      setSpinning(false);
      const prize = WHEEL_PRIZES[Math.floor(Math.random() * WHEEL_PRIZES.length)];
      onSpin(prize);
    }, 4000);
  };

  return (
    <div className="animate-in slide-in-from-bottom-10 fade-in duration-300 flex flex-col items-center">
      <div className="w-full flex items-center gap-2 mb-4"><button onClick={onBack} className="bg-white p-2 rounded-full shadow-md"><X size={24}/></button><h1 className="text-2xl font-black text-slate-800 bg-white/50 px-3 py-1 rounded-xl">Roleta Diária</h1></div>
      <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl border-b-8 border-purple-300 shadow-2xl flex flex-col items-center">
        <div className="relative mb-8">
           <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 text-red-500 text-4xl drop-shadow-md">▼</div>
           <div className="w-64 h-64 rounded-full border-[8px] border-white shadow-xl overflow-hidden relative transition-transform duration-[4000ms] cubic-bezier(0.1, 0.7, 1.0, 0.1)" style={{ background: 'conic-gradient(#fbbf24 0deg 45deg, #3b82f6 45deg 90deg, #fbbf24 90deg 135deg, #94a3b8 135deg 180deg, #fbbf24 180deg 225deg, #ef4444 225deg 270deg, #8b5cf6 270deg 315deg, #f97316 315deg 360deg)', transform: `rotate(${rotation}deg)` }}></div>
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-slate-200 z-10 font-black text-purple-600"><HelpCircle size={32} className="text-purple-500" /></div>
        </div>
        <h3 className="text-xl font-black text-slate-700 mb-2">Tente a sorte!</h3>
        <p className="text-slate-500 text-sm mb-6 text-center max-w-[200px]">Gire a roleta diariamente para ganhar prêmios incríveis para sua fazenda.</p>
        <button onClick={handleSpinClick} disabled={!canSpin || spinning} className={`w-full py-3 rounded-xl font-black shadow-lg border-b-4 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 ${canSpin && !spinning ? 'bg-purple-500 border-purple-700 text-white hover:bg-purple-600' : 'bg-slate-300 border-slate-400 text-slate-500 cursor-not-allowed'}`}>{spinning ? 'GIRANDO...' : canSpin ? 'GIRAR GRÁTIS' : 'VOLTE AMANHÃ'}</button>
      </div>
    </div>
  );
};

const AchievementModal = ({ achievement, onClose }) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in zoom-in duration-300" onClick={onClose}>
    <ConfettiEffect />
    <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center border-b-8 border-yellow-400 relative overflow-hidden shadow-[0_0_50px_rgba(250,204,21,0.5)]">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-300 via-orange-500 to-yellow-300"></div>
      <div className="text-8xl mb-4 animate-bounce filter drop-shadow-md">{achievement.icon}</div>
      <h2 className="text-xs font-bold uppercase tracking-widest text-yellow-600 mb-1">Nova Conquista Desbloqueada!</h2>
      <h3 className="text-3xl font-black text-slate-800 mb-2">{achievement.title}</h3>
      <p className="text-slate-500 font-medium mb-6">{achievement.desc}</p>
      <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-xl font-black inline-flex items-center gap-2 mb-6"><Gift size={20}/> Prêmio: +{achievement.reward} 💰</div>
      <button onClick={onClose} className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-black shadow-lg border-b-4 border-green-700 active:border-b-0 active:translate-y-1 transition-all">COLETAR E CONTINUAR</button>
    </div>
  </div>
);

const ProfileScreen = ({ onBack, stats, achievements, level, xp, xpToNextLevel, goldenEggs }) => {
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  return (
    <div className="animate-in slide-in-from-bottom-10 fade-in duration-300">
      <div className="flex items-center gap-2 mb-4"><button onClick={onBack} className="bg-white p-2 rounded-full shadow-md"><X size={24}/></button><h1 className="text-2xl font-black text-slate-800 bg-white/50 px-3 py-1 rounded-xl">Meu Perfil</h1></div>
      <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl border-b-4 border-slate-200 shadow-xl mb-6 flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-blue-400 to-blue-200 z-0"></div>
        <div className="w-24 h-24 bg-yellow-300 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-5xl relative z-10 mt-8 mb-4">👨‍🌾<div className="absolute -bottom-2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full border-2 border-white">Lvl {level}</div></div>
        <h2 className="text-2xl font-black text-slate-800 relative z-10">Fazendeiro Mestre</h2>
        {goldenEggs > 0 && (<div className="relative z-10 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 mt-2 border border-yellow-200 animate-pulse"><Sparkles size={12}/> {goldenEggs} Ovos Dourados (+{goldenEggs * 10}% Lucro)</div>)}
        <div className="w-full max-w-xs mt-4 relative z-10"><div className="flex justify-between text-xs font-bold text-slate-500 mb-1"><span>XP Atual</span><span>{xp} / {xpToNextLevel}</span></div><div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200"><div className="h-full bg-blue-500" style={{ width: `${(xp / xpToNextLevel) * 100}%` }}></div></div></div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white/80 p-4 rounded-2xl border-b-4 border-slate-200"><div className="text-slate-400 text-xs font-bold uppercase mb-1 flex items-center gap-1"><Egg size={12}/> Ovos Coletados</div><div className="text-2xl font-black text-slate-700">{stats.total_eggs}</div></div>
        <div className="bg-white/80 p-4 rounded-2xl border-b-4 border-slate-200"><div className="text-slate-400 text-xs font-bold uppercase mb-1 flex items-center gap-1"><Trash2 size={12}/> Sujeira Limpa</div><div className="text-2xl font-black text-slate-700">{stats.total_cleaned}</div></div>
        <div className="bg-white/80 p-4 rounded-2xl border-b-4 border-slate-200"><div className="text-slate-400 text-xs font-bold uppercase mb-1 flex items-center gap-1"><DollarSign size={12}/> Total Ganho</div><div className="text-2xl font-black text-slate-700">{stats.total_earned}</div></div>
        <div className="bg-white/80 p-4 rounded-2xl border-b-4 border-slate-200"><div className="text-slate-400 text-xs font-bold uppercase mb-1 flex items-center gap-1"><Clock size={12}/> Dias Jogados</div><div className="text-2xl font-black text-slate-700">{stats.days_played}</div></div>
      </div>
      <div className="bg-white/90 backdrop-blur-sm p-5 rounded-3xl border-b-4 border-slate-200 shadow-xl pb-20">
        <div className="flex justify-between items-center mb-4"><h3 className="font-black text-slate-800 flex items-center gap-2"><Trophy className="text-yellow-500"/> Galeria de Troféus</h3><span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-lg">{unlockedCount}/{ACHIEVEMENTS_LIST.length}</span></div>
        <div className="space-y-3">
          {ACHIEVEMENTS_LIST.map(achievement => {
            const isUnlocked = achievements.find(a => a.id === achievement.id)?.unlocked;
            return (
              <div key={achievement.id} className={`flex items-center gap-4 p-3 rounded-2xl border-2 transition-all ${isUnlocked ? 'bg-yellow-50 border-yellow-200' : 'bg-slate-50 border-slate-100 grayscale opacity-60'}`}>
                <div className={`w-12 h-12 flex items-center justify-center text-2xl bg-white rounded-xl shadow-sm border ${isUnlocked ? 'border-yellow-200' : 'border-slate-200'}`}>{isUnlocked ? achievement.icon : <Lock size={20} className="text-slate-300"/>}</div>
                <div className="flex-1"><h4 className={`font-black text-sm ${isUnlocked ? 'text-slate-800' : 'text-slate-500'}`}>{achievement.title}</h4><p className="text-xs text-slate-400 leading-tight">{achievement.desc}</p></div>{isUnlocked && <CheckCircle size={20} className="text-green-500"/>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ChickenCard = ({ chicken, onFeed, onCollect, onHeal, onClean, inventory, dayCount, addFloatingText }) => {
  const config = TYPE_CONFIG[chicken.type];
  const isHungry = chicken.last_fed_day < dayCount;
  const isSick = chicken.is_sick; 
  const isAdult = chicken.age_days >= 30;
  const hasFeed = inventory.feed >= config.feedConsumption;
  const hasVaccine = inventory.vaccine >= 1;
  const hasPoop = chicken.has_poop; 
  const hasLaidToday = chicken.last_collected_day === dayCount;
  const renderAvatar = () => {
    if (isSick) return <div className="text-6xl animate-pulse grayscale brightness-50 contrast-125">🤢</div>;
    if (chicken.type === 'GRANJA' && !isAdult) return <div className="text-6xl animate-bounce">🐣</div>;
    if (chicken.age_days >= 90) return <div className="relative text-6xl grayscale-[0.3]">🐔<div className="absolute top-2 left-1 bg-white/80 rounded-full p-1 border border-black rotate-12"><Glasses size={16}/></div><div className="absolute bottom-0 right-0 text-xl">🦯</div></div>;
    return <div className="text-6xl drop-shadow-md hover:scale-110 transition-transform">{config.icon}</div>;
  };

  return (
    <div className={`relative w-full p-3 rounded-3xl border-[4px] ${config.border} ${config.color} shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] flex flex-col gap-2 bg-white/90 backdrop-blur-sm transition-all duration-300 ${isHungry && !isSick ? 'scale-[0.98] opacity-90' : 'hover:-translate-y-1'} ${isSick ? 'border-red-500 bg-red-50' : ''}`}>
      <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-sm border border-white ${chicken.type === 'GIGANTE' ? 'bg-purple-600' : chicken.type === 'CAIPIRA' ? 'bg-orange-600' : 'bg-yellow-500'}`}>{config.label}</div>
      <div className="flex justify-between items-start mt-2"><div><h3 className="font-black text-slate-800 text-base leading-none">{chicken.name}</h3><p className="text-[10px] font-bold text-slate-500 mt-1">{isAdult ? 'Adulta' : 'Filhote'} • {chicken.age_days} Dias</p></div><div className="flex flex-col items-end">{isSick ? (<span className="text-red-600 font-black flex items-center gap-1 text-[10px] animate-pulse"><Thermometer size={12}/> DOENTE</span>) : isHungry ? (<span className="text-orange-500 font-bold flex items-center gap-1 text-[10px]"><Clock size={12}/> FOME</span>) : (<span className="text-green-600 font-bold flex items-center gap-1 text-[10px]"><Heart size={12} fill="currentColor"/> FELIZ</span>)}</div></div>
      <div className={`bg-gradient-to-b from-sky-200 to-green-200 rounded-xl h-24 flex items-center justify-center border border-white/50 relative overflow-hidden shadow-inner ${isHungry || isSick ? 'grayscale-[0.5]' : ''}`}>{renderAvatar()}{hasPoop && !isSick && (<button onClick={(e) => { e.stopPropagation(); onClean(chicken, e); playSound('squish'); }} className="absolute bottom-2 right-2 text-2xl hover:scale-125 transition-transform cursor-pointer animate-bounce z-10" title="Limpar sujeira">💩</button>)}{isHungry && !isSick && <div className="absolute top-2 right-2 bg-white rounded-full p-1.5 border border-black shadow-lg animate-bounce"><Droplets size={14} className="text-blue-500" /></div>}{!isAdult && (<div className="absolute bottom-0 left-0 w-full h-1.5 bg-black/20"><div className="h-full bg-green-500" style={{ width: `${Math.min((chicken.age_days / 30) * 100, 100)}%` }}></div></div>)}</div>
      <div className="grid grid-cols-2 gap-2 mt-1">
        <button onClick={(e) => { onCollect(chicken, e); playSound('pop'); }} disabled={isHungry || !isAdult || isSick || hasLaidToday} className="bg-green-500 hover:bg-green-600 disabled:bg-slate-300 disabled:border-slate-400 disabled:text-slate-500 text-white border-b-4 border-green-700 active:border-b-0 active:translate-y-1 rounded-xl py-2 font-black text-xs flex items-center justify-center gap-1 transition-all">
          {isSick ? <span className="flex items-center gap-1"><AlertTriangle size={12}/> PARADA</span> : hasLaidToday ? <span className="flex items-center gap-1"><CheckSquare size={12}/> JÁ COLETADO</span> : <><Egg size={14}/> COLETAR</>}
        </button>
        {isSick ? (<button onClick={(e) => { onHeal(chicken); playSound('pop'); }} disabled={!hasVaccine} className={`text-white border-b-4 active:border-b-0 active:translate-y-1 rounded-xl py-2 font-black text-xs flex items-center justify-center gap-1 transition-all ${hasVaccine ? 'bg-red-500 hover:bg-red-600 border-red-700 animate-pulse' : 'bg-slate-300 border-slate-400'}`}><Syringe size={14}/> {hasVaccine ? 'USAR (1)' : 'SEM ITEM'}</button>) : (<button onClick={(e) => { onFeed(chicken); playSound('pop'); }} disabled={!hasFeed && !isHungry} className={`text-white border-b-4 active:border-b-0 active:translate-y-1 rounded-xl py-2 font-black text-xs flex items-center justify-center gap-1 transition-all ${!isHungry ? 'bg-slate-300 border-slate-400 cursor-default opacity-50' : hasFeed ? 'bg-blue-400 hover:bg-blue-500 border-blue-700' : 'bg-red-400 border-red-700'}`}><Droplets size={14}/> {hasFeed ? `-${config.feedConsumption} RAÇÃO` : 'COMPRAR'}</button>)}
      </div>
    </div>
  );
};

// --- 5. MODAIS E TELAS ADICIONAIS (FALTANTES) ---

const QuestsModal = ({ quests, onClose, onClaim }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in zoom-in duration-300">
    <div className="bg-white rounded-3xl p-6 w-full max-w-sm relative border-b-8 border-slate-200 shadow-2xl">
      <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={24}/></button>
      <h2 className="text-2xl font-black text-slate-800 mb-1 flex items-center gap-2"><ClipboardList className="text-blue-500"/> Missões Diárias</h2>
      <p className="text-slate-500 text-xs mb-6">Complete tarefas para ganhar recompensas.</p>
      
      <div className="space-y-3">
        {quests.map(q => (
          <div key={q.id} className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div className="flex justify-between items-start mb-2">
              <span className="font-bold text-slate-700 text-sm">{q.desc}</span>
              <span className="font-black text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-lg border border-yellow-200">+{q.reward} 💰</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${Math.min((q.progress/q.target)*100, 100)}%` }}></div>
              </div>
              <span className="text-xs font-bold text-slate-400">{q.progress}/{q.target}</span>
            </div>
            {q.completed && !q.claimed && (
              <button onClick={() => onClaim(q.id)} className="w-full mt-2 bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl font-black text-xs shadow-sm border-b-4 border-green-700 active:border-b-0 active:translate-y-1">
                RESGATAR
              </button>
            )}
             {q.claimed && (
              <div className="w-full mt-2 bg-slate-200 text-slate-400 py-2 rounded-xl font-black text-xs text-center flex items-center justify-center gap-1">
                <CheckCircle size={14}/> COMPLETADO
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
);

const LevelUpModal = ({ newLevel, onClose }) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6 animate-in zoom-in duration-500" onClick={onClose}>
    <ConfettiEffect />
    <div className="text-center">
      <div className="text-9xl mb-4 animate-[bounce_2s_infinite]">🆙</div>
      <h1 className="text-5xl font-black text-white mb-2 text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-orange-500 drop-shadow-sm">LEVEL UP!</h1>
      <p className="text-2xl text-white font-bold mb-8">Você alcançou o Nível {newLevel}!</p>
      <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 max-w-xs mx-auto mb-8">
        <h3 className="text-white font-black mb-2 flex items-center justify-center gap-2"><Lock className="text-red-400" size={20}/> Novos Itens Desbloqueados</h3>
        <p className="text-slate-300 text-sm">Confira a loja para ver as novidades disponíveis para o seu nível.</p>
      </div>
      <button onClick={onClose} className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-2xl font-black text-xl shadow-xl border-b-8 border-green-700 active:border-b-0 active:translate-y-2 transition-all">
        CONTINUAR JOGANDO
      </button>
    </div>
  </div>
);

const LegendaryDropModal = ({ type, onClose }) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6 animate-in zoom-in duration-300" onClick={onClose}>
    <div className="bg-gradient-to-b from-slate-900 to-slate-800 p-1 rounded-[40px] shadow-[0_0_100px_rgba(255,215,0,0.5)]">
      <div className="bg-slate-900 rounded-[36px] p-8 text-center border border-white/10 relative overflow-hidden max-w-sm">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-spin-slow"></div>
         <div className="relative z-10">
           <div className="text-8xl mb-6 animate-[pulse_2s_infinite] filter drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">
             {type === 'LEGENDARY' ? '🌟' : '✨'}
           </div>
           <h2 className={`text-3xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r ${type === 'LEGENDARY' ? 'from-yellow-300 via-amber-500 to-yellow-300' : 'from-orange-300 to-red-500'}`}>
             {type === 'LEGENDARY' ? 'OVO LENDÁRIO!' : 'OVO RARO!'}
           </h2>
           <p className="text-slate-400 font-medium mb-8">
             {type === 'LEGENDARY' ? 'Uma descoberta incrível! Vale muito dinheiro.' : 'Um ovo de excelente qualidade!'}
           </p>
           <button onClick={onClose} className="w-full bg-yellow-500 hover:bg-yellow-600 text-yellow-900 py-4 rounded-2xl font-black text-lg shadow-lg border-b-4 border-yellow-700 active:border-b-0 active:translate-y-1">
             COLETAR
           </button>
         </div>
      </div>
    </div>
  </div>
);

const WalletScreen = ({ onBack, balance }) => (
  <div className="animate-in slide-in-from-right-10 fade-in">
    <div className="flex items-center gap-2 mb-4"><button onClick={onBack} className="bg-white p-2 rounded-full shadow-md"><X size={24}/></button><h1 className="text-2xl font-black text-slate-800 bg-white/50 px-3 py-1 rounded-xl">Carteira</h1></div>
    <div className="bg-white/90 p-8 rounded-3xl border-b-4 border-slate-200 text-center shadow-xl">
      <p className="text-slate-500 font-bold uppercase text-xs mb-2">Saldo Atual</p>
      <div className="text-5xl font-black text-slate-800 mb-6">{balance} <span className="text-yellow-500">💰</span></div>
      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4">
        <h3 className="font-bold text-blue-800 mb-1">Dica Financeira</h3>
        <p className="text-xs text-blue-600">Invista em galinhas Gigantes para maximizar seus lucros a longo prazo!</p>
      </div>
      <button onClick={onBack} className="w-full bg-slate-200 hover:bg-slate-300 text-slate-600 py-3 rounded-xl font-bold border-b-4 border-slate-300 active:border-b-0 active:translate-y-1">Voltar</button>
    </div>
  </div>
);

// --- 7. APP PRINCIPAL ---
export default function App() {
  const [session, setSession] = useState(() => localStorage.getItem('farm_session') || 'AUTH');
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('farm_balance')) || 0);
  const [bankBalance, setBankBalance] = useState(() => Number(localStorage.getItem('farm_bank_balance')) || 0);
  const [dayCount, setDayCount] = useState(() => Number(localStorage.getItem('farm_day')) || 1);
  const [level, setLevel] = useState(() => Number(localStorage.getItem('farm_level')) || 1);
  const [xp, setXp] = useState(() => Number(localStorage.getItem('farm_xp')) || 0);
  const [maxCapacity, setMaxCapacity] = useState(() => Number(localStorage.getItem('farm_capacity')) || 4); 
  const [inventory, setInventory] = useState(() => { const s = localStorage.getItem('farm_inventory'); return s ? JSON.parse(s) : { feed: 0, vaccine: 0, eggs_common: 0, eggs_rare: 0, eggs_legendary: 0 }; });
  
  const [chickens, setChickens] = useState(() => { 
    const s = localStorage.getItem('farm_chickens'); 
    if (s) {
      const parsed = JSON.parse(s);
      return parsed.map(c => ({...c, last_collected_day: c.last_collected_day || 0}));
    }
    return []; 
  });

  const [automations, setAutomations] = useState(() => {
    const s = localStorage.getItem('farm_automations');
    return s ? JSON.parse(s) : {};
  });

  const [upgrades, setUpgrades] = useState(() => {
    const s = localStorage.getItem('farm_upgrades');
    return s ? JSON.parse(s) : {};
  });

  const [marketNews, setMarketNews] = useState(() => {
    const s = localStorage.getItem('farm_market_news');
    return s ? JSON.parse(s) : MARKET_NEWS[0];
  });

  const [coopProgress, setCoopProgress] = useState(() => Number(localStorage.getItem('farm_coop_progress')) || 0);

  const [auctionItems, setAuctionItems] = useState(() => {
    const s = localStorage.getItem('farm_auctions');
    return s ? JSON.parse(s) : AUCTION_MOCK_INITIAL;
  });

  const [goldenEggs, setGoldenEggs] = useState(() => Number(localStorage.getItem('farm_golden_eggs')) || 0);

  const [referralHistory, setReferralHistory] = useState([]);
  const [weather, setWeather] = useState(() => localStorage.getItem('farm_weather') || 'SUNNY'); 
  const [marketPrices, setMarketPrices] = useState(() => { const s = localStorage.getItem('farm_prices'); return s ? JSON.parse(s) : { common: 10, rare: 25, legendary: 100 }; });
  const [quests, setQuests] = useState(() => { const s = localStorage.getItem('farm_quests'); return s ? JSON.parse(s) : []; });

  const [stats, setStats] = useState(() => {
    const s = localStorage.getItem('farm_stats');
    return s ? JSON.parse(s) : { total_eggs: 0, total_cleaned: 0, total_earned: 0, total_healed: 0, days_played: 1, legendary_eggs: 0 };
  });
  const [achievements, setAchievements] = useState(() => {
    const s = localStorage.getItem('farm_achievements');
    return s ? JSON.parse(s) : ACHIEVEMENTS_LIST.map(a => ({ id: a.id, unlocked: false }));
  });
  
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem('farm_muted') === 'true');
  const [fox, setFox] = useState(null); 
  const [lastSpinDay, setLastSpinDay] = useState(() => Number(localStorage.getItem('farm_last_spin_day')) || 0);

  const [showQuests, setShowQuests] = useState(false);
  const [newAchievement, setNewAchievement] = useState(null); 
  const [view, setView] = useState('COOP');
  const [isNight, setIsNight] = useState(false);
  const [legendaryDrop, setLegendaryDrop] = useState(null);
  const [toast, setToast] = useState(null);
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [showLevelUp, setShowLevelUp] = useState(false);

  useEffect(() => {
    IS_MUTED_GLOBAL = isMuted;
    localStorage.setItem('farm_muted', isMuted);
  }, [isMuted]);

  useEffect(() => {
    localStorage.setItem('farm_session', session);
    localStorage.setItem('farm_balance', balance);
    localStorage.setItem('farm_bank_balance', bankBalance);
    localStorage.setItem('farm_day', dayCount);
    localStorage.setItem('farm_level', level);
    localStorage.setItem('farm_xp', xp);
    localStorage.setItem('farm_capacity', maxCapacity);
    localStorage.setItem('farm_inventory', JSON.stringify(inventory));
    localStorage.setItem('farm_chickens', JSON.stringify(chickens));
    localStorage.setItem('farm_weather', weather);
    localStorage.setItem('farm_prices', JSON.stringify(marketPrices));
    localStorage.setItem('farm_quests', JSON.stringify(quests));
    localStorage.setItem('farm_stats', JSON.stringify(stats));
    localStorage.setItem('farm_achievements', JSON.stringify(achievements));
    localStorage.setItem('farm_last_spin_day', lastSpinDay);
    localStorage.setItem('farm_automations', JSON.stringify(automations));
    localStorage.setItem('farm_upgrades', JSON.stringify(upgrades));
    localStorage.setItem('farm_market_news', JSON.stringify(marketNews));
    localStorage.setItem('farm_coop_progress', coopProgress);
    localStorage.setItem('farm_auctions', JSON.stringify(auctionItems));
    localStorage.setItem('farm_golden_eggs', goldenEggs);
  }, [session, balance, bankBalance, dayCount, level, xp, inventory, chickens, weather, marketPrices, quests, stats, achievements, lastSpinDay, automations, upgrades, marketNews, coopProgress, auctionItems, goldenEggs]);

  const handleExportSave = () => {
    const saveData = btoa(JSON.stringify(localStorage));
    navigator.clipboard.writeText(saveData);
    showToast("Save copiado para a área de transferência!", "success");
  };

  const handleImportSave = () => {
    const saveData = prompt("Cole o código do save aqui:");
    if (saveData) {
      try {
        const data = JSON.parse(atob(saveData));
        Object.keys(data).forEach(key => localStorage.setItem(key, data[key]));
        window.location.reload();
      } catch (e) {
        showToast("Código de save inválido!", "error");
      }
    }
  };

  const handleFoxEscape = () => {
    setInventory(prev => {
      if (prev.eggs_common > 0) {
        showToast("A Raposa roubou 1 Ovo Comum!", "error");
        return { ...prev, eggs_common: prev.eggs_common - 1 };
      }
      showToast("A Raposa fugiu sem levar nada!", "info");
      return prev;
    });
  };

  const handleFoxClick = () => {
    setFox(null);
    setBalance(prev => prev + 50);
    addXp(20);
    playSound('success');
    showToast(`Você pegou a Raposa! +50 moedas`, "success");
  };

  useEffect(() => {
    const spawnInterval = setInterval(() => {
      if (upgrades.FENCE) return;
      if (session === 'GAME' && !fox && !isNight && Math.random() < 0.3) {
        const newFox = { id: Date.now(), x: Math.random() * 80 + 10, y: Math.random() * 60 + 20 };
        setFox(newFox);
        playSound('fox');
        showToast("🦊 Uma Raposa apareceu! Rápido!", "error");
        setTimeout(() => {
          setFox(currentFox => {
            if (currentFox && currentFox.id === newFox.id) {
              handleFoxEscape();
              return null;
            }
            return currentFox;
          });
        }, 4000);
      }
    }, 30000);
    return () => clearInterval(spawnInterval);
  }, [fox, session, isNight, upgrades.FENCE]);

  useEffect(() => {
    if (automations.CLEANSWEEP?.active) {
      const cleanInterval = setInterval(() => {
        setChickens(prev => {
          const hasPoop = prev.some(c => c.has_poop);
          if (hasPoop) {
            return prev.map(c => ({ ...c, has_poop: false }));
          }
          return prev;
        });
      }, 5000); 
      return () => clearInterval(cleanInterval);
    }
  }, [automations.CLEANSWEEP]);

  const checkAchievements = () => {
    let unlockedNow = null;
    const newAchievements = achievements.map(ach => {
      if (ach.unlocked) return ach;
      const config = ACHIEVEMENTS_LIST.find(c => c.id === ach.id);
      if (config && config.condition(stats)) {
        unlockedNow = config;
        return { ...ach, unlocked: true };
      }
      return ach;
    });

    if (unlockedNow) {
      setAchievements(newAchievements);
      setNewAchievement(unlockedNow); 
      playSound('achievement');
    }
  };

  useEffect(() => {
    checkAchievements();
  }, [stats]);

  const showToast = (message, type = 'success') => { setToast({ message, type }); setTimeout(() => setToast(null), 3000); };
  
  const addFloatingText = (x, y, text, color) => {
    const id = Date.now();
    setFloatingTexts(prev => [...prev, { id, x, y, text, color }]);
    setTimeout(() => setFloatingTexts(prev => prev.filter(item => item.id !== id)), 1000);
  };

  const generateDailyQuests = () => {
    const shuffled = [...QUEST_POOL].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3).map(q => ({ ...q, progress: 0, completed: false, claimed: false }));
    setQuests(selected);
  };

  const updateQuestProgress = (type, amount = 1) => {
    setQuests(prev => prev.map(q => {
      if (q.type === type && !q.completed) {
        const newProgress = q.progress + amount;
        if (newProgress >= q.target) {
          showToast(`Missão Cumprida: ${q.desc}!`, 'success');
          playSound('success');
          return { ...q, progress: newProgress, completed: true };
        }
        return { ...q, progress: newProgress };
      }
      return q;
    }));
  };

  const handleClaimQuest = (questId) => {
    const quest = quests.find(q => q.id === questId);
    if (quest && quest.completed && !quest.claimed) {
      setBalance(prev => prev + quest.reward);
      addXp(10);
      setQuests(prev => prev.map(q => q.id === questId ? { ...q, claimed: true } : q));
      showToast(`Recompensa recebida: +${quest.reward} moedas!`, 'success');
      playSound('coin');
    }
  };

  const canSpinWheel = () => {
    return lastSpinDay < dayCount;
  };

  const handleSpinReward = (prize) => {
    setLastSpinDay(dayCount);
    
    if (prize.type === 'COIN') {
      setBalance(prev => prev + prize.val);
      showToast(`Ganhou ${prize.val} Moedas!`, 'success');
    } else if (prize.type === 'ITEM') {
      setInventory(prev => {
        // Validação de Capacidade para Ração
        if (prize.item === 'feed') {
          const maxFeed = upgrades.SILO ? 100 : 20;
          if (prev.feed >= maxFeed) {
            showToast("Silo cheio! Prêmio de ração perdido.", "error");
            return prev;
          }
          return { ...prev, feed: Math.min(prev.feed + prize.val, maxFeed) };
        }
        return {
          ...prev,
          [prize.item]: prev[prize.item] + prize.val
        };
      });
      if (prize.item !== 'feed') showToast(`Ganhou ${prize.val}x ${prize.label}!`, 'success');
    }
    
    if (prize.special) {
      playSound('achievement');
      addFloatingText(window.innerWidth / 2, window.innerHeight / 2, "JACKPOT!", "#8b5cf6");
    } else {
      playSound('coin');
    }
  };

  const handleContributeCoop = () => {
    if (inventory.eggs_common > 0) {
      setInventory(prev => ({ ...prev, eggs_common: prev.eggs_common - 1 }));
      setCoopProgress(prev => {
        const next = prev + 1;
        if (next >= 500 && prev < 500) {
          playSound('achievement');
          showToast("META DA COOPERATIVA ATINGIDA! +500 XP", "success");
          addXp(500);
        }
        return next;
      });
      addXp(5);
      showToast("Doado para a Cooperativa! +5 XP", "success");
    } else {
      showToast("Sem ovos comuns para doar!", "error");
    }
  };

  const handleBuyAuction = (listing) => {
    if (balance >= listing.price && chickens.length < maxCapacity) {
      setBalance(prev => prev - listing.price);
      setChickens(prev => [...prev, {
        id: Date.now(),
        type: listing.type,
        name: `Leiloada (${listing.type})`,
        age_days: listing.age,
        last_fed_day: dayCount,
        is_sick: false,
        has_poop: false,
        last_collected_day: 0
      }]);
      // Remove do leilão
      setAuctionItems(prev => prev.filter(item => item.id !== listing.id));
      playSound('sold');
      showToast(`Você comprou uma galinha ${listing.type}!`, 'success');
    } else if (chickens.length >= maxCapacity) {
      showToast("Galinheiro Cheio!", "error");
    } else {
      showToast("Saldo Insuficiente!", "error");
    }
  };

  const handleSellAuction = (chicken) => {
    const price = Math.floor(TYPE_CONFIG[chicken.type].feedConsumption * 100 + chicken.age_days * 2);
    setBalance(prev => prev + price);
    setChickens(prev => prev.filter(c => c.id !== chicken.id));
    playSound('sold');
    showToast(`Galinha vendida no leilão por ${price} moedas!`, 'success');
  };

  const handlePrestige = () => {
    const eggsToGain = Math.floor(balance / 5000); 
    setGoldenEggs(prev => prev + eggsToGain);
    setBalance(0);
    setBankBalance(0);
    setDayCount(1);
    setLevel(1);
    setXp(0);
    setMaxCapacity(4);
    setInventory({ feed: 5, vaccine: 0, eggs_common: 0, eggs_rare: 0, eggs_legendary: 0 });
    setChickens([{ id: Date.now(), type: "GRANJA", name: "Renascida", age_days: 0, last_fed_day: 1, is_sick: false, has_poop: false, last_collected_day: 0 }]);
    setAutomations({});
    setUpgrades({});
    setCoopProgress(0);
    setAuctionItems(AUCTION_MOCK_INITIAL);
    playSound('prestige');
    showToast(`Ascensão Completa! +${eggsToGain} Ovos Dourados!`, 'success');
    setView('COOP');
  };

  const handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleSleep = () => {
    setIsNight(true);
    setTimeout(() => {
      const nextDay = dayCount + 1;
      setDayCount(nextDay);
      setStats(prev => ({ ...prev, days_played: prev.days_played + 1 }));

      // Juros do Banco (5%)
      if (bankBalance > 0) {
        const interest = Math.floor(bankBalance * 0.05);
        setBankBalance(prev => prev + interest);
        if (interest > 0) showToast(`Rendimento do Banco: +${interest} moedas`, 'success');
      }

      let feedConsumed = 0;
      if (automations.NUTRIBOT?.active) {
        setChickens(prev => prev.map(c => {
          const needsFeed = c.last_fed_day < dayCount;
          if (needsFeed) { feedConsumed += TYPE_CONFIG[c.type].feedConsumption; return { ...c, last_fed_day: dayCount }; }
          return c;
        }));
      }

      setInventory(prev => {
        const newFeed = Math.max(0, prev.feed - feedConsumed);
        if (feedConsumed > 0 && prev.feed < feedConsumed) showToast("NutriBot sem ração suficiente!", "error");
        else if (feedConsumed > 0) showToast(`NutriBot alimentou suas galinhas! (-${feedConsumed} ração)`, "info");
        return { ...prev, feed: newFeed };
      });

      setAutomations(prev => {
        const nextState = { ...prev };
        Object.keys(nextState).forEach(key => {
          if (nextState[key].active) {
            nextState[key].daysLeft -= 1;
            if (nextState[key].daysLeft <= 0) { nextState[key].active = false; showToast(`Aluguel do ${TECH_CONFIG[key].name} venceu!`, "error"); }
          }
        });
        return nextState;
      });

      const randomNews = MARKET_NEWS[Math.floor(Math.random() * MARKET_NEWS.length)];
      setMarketNews(randomNews);
      showToast(`Jornal: ${randomNews.title}`, 'info');

      if (Math.random() < 0.5 && auctionItems.length < 5) {
         setAuctionItems(prev => [...prev, { 
           id: Date.now(), 
           seller: 'BotFarm', 
           type: Math.random() > 0.5 ? 'CAIPIRA' : 'GIGANTE', 
           age: Math.floor(Math.random() * 30) + 1, 
           price: Math.floor(Math.random() * 500) + 300, 
           expires: '12h' 
         }]);
      }

      const nextWeather = Math.random() < 0.3 ? 'RAINY' : 'SUNNY';
      setWeather(nextWeather);

      setMarketPrices({ 
        common: Math.floor(BASE_PRICES.EGG_COMMON * (0.8 + Math.random() * 0.4)), 
        rare: Math.floor(BASE_PRICES.EGG_RARE * (0.8 + Math.random() * 0.4)), 
        legendary: Math.floor(BASE_PRICES.EGG_LEGENDARY * (0.8 + Math.random() * 0.4)) 
      });

      setChickens(prev => prev.map(c => {
        const isHungry = c.last_fed_day < nextDay;
        const baseSickness = (nextWeather === 'RAINY' && !upgrades.CLIMATE) ? 0.30 : 0.05;
        const hasCleanSweep = automations.CLEANSWEEP?.active;
        const chanceOfSickness = c.has_poop && !hasCleanSweep ? 0.8 : (isHungry ? 0.4 : baseSickness);
        const gotSick = !c.is_sick && Math.random() < chanceOfSickness;
        const madePoop = !c.is_sick && Math.random() < 0.5;
        return { ...c, age_days: c.age_days + 1, is_sick: c.is_sick || gotSick, has_poop: hasCleanSweep ? false : (c.has_poop || madePoop) };
      }));
      
      generateDailyQuests();
      setIsNight(false);
    }, 2000);
  };

  const addXp = (amount) => {
    let newXp = xp + amount;
    const nextLevelXp = level * 100;
    if (newXp >= nextLevelXp) { setLevel(prev => prev + 1); setXp(newXp - nextLevelXp); setShowLevelUp(true); playSound('success'); } else { setXp(newXp); }
  };

  const handleCollect = (chicken, e) => {
    if (chicken.last_collected_day === dayCount) { showToast("Já coletado hoje!", "error"); return; }
    const config = TYPE_CONFIG[chicken.type];
    const roll = Math.random();
    let eggType = 'eggs_common';
    let label = '+1 Ovo';
    let color = '#475569';
    let questType = 'COLLECT_COMMON';
    let isLegendary = false;

    if (roll < config.collectChance.legendary + config.collectChance.rare + config.collectChance.common) {
       if (roll < config.collectChance.legendary) { eggType = 'eggs_legendary'; setLegendaryDrop('LEGENDARY'); label = 'LENDÁRIO!'; playSound('success'); isLegendary = true; }
       else if (roll < config.collectChance.legendary + config.collectChance.rare) { eggType = 'eggs_rare'; setLegendaryDrop('RARE'); label = 'RARO!'; playSound('success'); questType = 'COLLECT_RARE'; }
       else { eggType = 'eggs_common'; }
    }
    setInventory(prev => ({ ...prev, [eggType]: prev[eggType] + 1 }));
    setChickens(prev => prev.map(c => c.id === chicken.id ? { ...c, last_collected_day: dayCount } : c));
    setStats(prev => ({ ...prev, total_eggs: prev.total_eggs + 1, legendary_eggs: isLegendary ? prev.legendary_eggs + 1 : prev.legendary_eggs }));
    addXp(15);
    addFloatingText(e.clientX, e.clientY, label, color);
    updateQuestProgress(questType);
  };

  const handleSellEggs = (totalValue) => {
    setBalance(prev => prev + totalValue);
    setInventory(prev => ({ ...prev, eggs_common: 0, eggs_rare: 0, eggs_legendary: 0 }));
    setStats(prev => ({ ...prev, total_earned: prev.total_earned + totalValue }));
    showToast(`Vendeu tudo por ${totalValue} moedas!`, 'success');
  };

  const handleBuyAnimal = (product, e) => {
    if (chickens.length >= maxCapacity) { showToast("Galinheiro Cheio! Expanda a cerca.", "error"); return; }
    if (balance >= product.priceCoins) {
      setBalance(prev => prev - product.priceCoins);
      setChickens([...chickens, { id: Date.now(), type: product.type, name: `Nova ${product.name.split(' ')[1]}`, age_days: 30, last_fed_day: dayCount, is_sick: false, has_poop: false, last_collected_day: 0 }]);
      showToast(`Comprou ${product.name}!`, 'success');
      addFloatingText(e.clientX, e.clientY, `-${product.priceCoins} 💰`, '#ef4444');
    }
  };
  
  const handleBuyItem = (itemId, e) => {
    if (TECH_CONFIG[itemId]) {
      const tech = TECH_CONFIG[itemId];
      if (balance >= tech.price) {
        setBalance(prev => prev - tech.price);
        setAutomations(prev => ({ ...prev, [itemId]: { active: true, daysLeft: tech.duration } }));
        showToast(`Alugou ${tech.name} por ${tech.duration} dias!`, 'success');
        addFloatingText(e.clientX, e.clientY, `-${tech.price} 💰`, '#ef4444');
      }
      return;
    }
    if (UPGRADE_CONFIG[itemId]) {
      const upg = UPGRADE_CONFIG[itemId];
      if (balance >= upg.price) {
        setBalance(prev => prev - upg.price);
        setUpgrades(prev => ({ ...prev, [itemId]: true }));
        showToast(`Construiu ${upg.name}!`, 'success');
        addFloatingText(e.clientX, e.clientY, `-${upg.price} 💰`, '#ef4444');
      }
      return;
    }
    const config = ITEMS_CONFIG[itemId];
    if (config && balance >= config.price) {
      if (itemId === 'FEED') {
        const maxFeed = upgrades.SILO ? 100 : 20;
        if (inventory.feed >= maxFeed) { showToast(`Silo cheio! Máx: ${maxFeed}`, "error"); return; }
      }
      setBalance(prev => prev - config.price);
      if (itemId === 'FEED') {
        const maxFeed = upgrades.SILO ? 100 : 20;
        setInventory(prev => ({ ...prev, feed: Math.min(prev.feed + config.quantity, maxFeed) }));
      }
      else if (itemId === 'VACCINE') setInventory(prev => ({ ...prev, vaccine: prev.vaccine + config.quantity }));
      else if (itemId === 'EXPANSION') { setMaxCapacity(prev => prev + config.quantity); showToast("Galinheiro Expandido! (+4 Vagas)", "success"); }
      if (itemId !== 'EXPANSION') showToast(`Comprou ${config.name}!`, 'success');
      addFloatingText(e.clientX, e.clientY, `-${config.price} 💰`, '#ef4444');
      updateQuestProgress('BUY_ITEM');
    }
  };
  
  const handleFeed = (chicken) => {
    const config = TYPE_CONFIG[chicken.type];
    if (inventory.feed >= config.feedConsumption) {
      setInventory(prev => ({ ...prev, feed: prev.feed - config.feedConsumption }));
      setChickens(prev => prev.map(c => c.id === chicken.id ? { ...c, last_fed_day: dayCount } : c));
      showToast('Alimentada!', 'info');
      updateQuestProgress('FEED');
    } else { showToast("Sem ração no Celeiro!", "error"); }
  };
  
  const handleHeal = (chicken) => {
    if (inventory.vaccine >= 1) {
      setInventory(prev => ({ ...prev, vaccine: prev.vaccine - 1 }));
      setChickens(prev => prev.map(c => c.id === chicken.id ? { ...c, is_sick: false } : c));
      setStats(prev => ({ ...prev, total_healed: prev.total_healed + 1 }));
      showToast('Curada!', 'success');
    } else { showToast("Sem vacinas!", "error"); }
  };

  const handleClean = (chicken, e) => {
    setChickens(prev => prev.map(c => c.id === chicken.id ? { ...c, has_poop: false } : c));
    addXp(10); 
    setStats(prev => ({ ...prev, total_cleaned: prev.total_cleaned + 1 }));
    addFloatingText(e.clientX, e.clientY, '+10 XP', '#3b82f6');
    showToast('Limpeza realizada!', 'success');
    updateQuestProgress('CLEAN');
  };

  const handleSimulateReferral = (levelConfig, e) => {
    const purchaseAmount = 1000; 
    const commission = Math.floor(purchaseAmount * levelConfig.percent);
    setBalance(prev => prev + commission);
    setStats(prev => ({ ...prev, total_earned: prev.total_earned + commission }));
    playSound('success');
    addFloatingText(e.clientX, e.clientY, `+${commission} 💰`, '#22c55e');
    showToast(`Comissão de ${levelConfig.label} recebida!`, 'success');
    setReferralHistory(prev => [{ id: Date.now(), desc: `Indicado Nível ${levelConfig.level} comprou Gigante`, amount: commission }, ...prev]);
  };

  const handleCloseAchievement = () => {
    if (newAchievement) {
      setBalance(prev => prev + newAchievement.reward); 
      setNewAchievement(null);
    }
  };
  
  const pendingRewards = quests.some(q => q.completed && !q.claimed);

  return (
    <div className="min-h-screen relative font-sans select-none overflow-hidden bg-slate-100">
      <FarmBackground isNight={isNight} weather={weather} />
      <FloatingText items={floatingTexts} />
      {legendaryDrop && <LegendaryDropModal type={legendaryDrop} onClose={() => setLegendaryDrop(null)} />}
      {showLevelUp && <LevelUpModal newLevel={level} onClose={() => setShowLevelUp(false)} />}
      {showQuests && <QuestsModal quests={quests} onClose={() => setShowQuests(false)} onClaim={handleClaimQuest} />}
      
      {newAchievement && <AchievementModal achievement={newAchievement} onClose={handleCloseAchievement} />}

      {session === 'GAME' && fox && <FoxComponent x={fox.x} y={fox.y} onClick={handleFoxClick} />}

      {session === 'AUTH' && <AuthScreen onLogin={() => setSession('UNBOXING')} />}
      {session === 'UNBOXING' && <UnboxingScreen onFinish={() => {setChickens([{ id: 1, type: "GRANJA", name: "Meu Pintinho", age_days: 0, last_fed_day: 1, is_sick: false, has_poop: false, last_collected_day: 0 }]); setBalance(50); setInventory(prev=>({...prev, feed:5})); generateDailyQuests(); setSession('GAME');}} />}
      
      {session === 'GAME' && (
        <div className="relative z-10 h-screen overflow-y-auto pb-20">
          <div className="p-4 max-w-4xl mx-auto min-h-full">
            <Navbar balance={balance} dayCount={dayCount} onViewChange={setView} currentView={view} level={level} xp={xp} xpToNextLevel={level*100} weather={weather} openQuests={() => setShowQuests(true)} goldenEggs={goldenEggs} pendingRewards={pendingRewards} />
            {toast && <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[80] px-6 py-3 rounded-2xl shadow-xl font-black text-white animate-in slide-in-from-top-5 fade-in flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>{toast.message}</div>}

            {view === 'COOP' ? (
              <div className="animate-in slide-in-from-left-10 fade-in duration-300 pb-20">
                 <div className="fixed bottom-6 right-6 z-50"><button onClick={handleSleep} disabled={isNight} className="bg-indigo-600 hover:bg-indigo-700 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center border-4 border-indigo-400 animate-bounce">{isNight ? <span className="animate-spin">⏳</span> : <Moon size={32} fill="currentColor" />}</button></div>
                 <div className="mb-6 bg-white/60 backdrop-blur-sm p-4 rounded-2xl inline-block border-2 border-white/50 shadow-sm">
                   <h1 className="text-2xl font-black text-slate-800 drop-shadow-sm">Galinheiro</h1>
                   <p className="text-slate-700 font-medium text-xs sm:text-sm">Capacidade: {chickens.length} / {maxCapacity} aves</p>
                 </div>
                 {chickens.length === 0 ? <div className="text-center bg-white/50 p-8 rounded-3xl">Galinheiro vazio.</div> : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-items-center">
                    {chickens.map(chicken => (<ChickenCard key={chicken.id} chicken={chicken} onFeed={handleFeed} onCollect={handleCollect} onHeal={handleHeal} onClean={handleClean} inventory={inventory} dayCount={dayCount} addFloatingText={addFloatingText} />))}
                    {chickens.length < maxCapacity ? (
                      <div onClick={() => setView('STORE')} className="w-full min-h-[300px] rounded-3xl border-4 border-dashed border-white/60 bg-white/30 backdrop-blur-sm flex flex-col items-center justify-center gap-4 text-white hover:bg-white/50 hover:border-white cursor-pointer transition-all group shadow-lg"><ArrowUpCircle size={48} /><span className="font-black text-lg text-slate-800 drop-shadow-md">NOVA GALINHA</span></div>
                    ) : (
                      <div onClick={() => setView('STORE')} className="w-full min-h-[300px] rounded-3xl border-4 border-dashed border-red-300/60 bg-red-100/30 backdrop-blur-sm flex flex-col items-center justify-center gap-4 text-white hover:bg-red-100/50 cursor-pointer transition-all group shadow-lg"><Lock size={48} /><span className="font-black text-lg text-slate-800 drop-shadow-md text-center">CHEIO<br/><span className="text-xs">Compre Expansão</span></span></div>
                    )}
                  </div>
                )}
              </div>
            ) : view === 'STORE' ? (
              <StoreScreen onBack={() => setView('COOP')} onBuyAnimal={handleBuyAnimal} onBuyItem={handleBuyItem} balance={balance} level={level} addFloatingText={addFloatingText} automations={automations} upgrades={upgrades} />
            ) : view === 'BARN' ? (
              <BarnScreen onBack={() => setView('COOP')} inventory={inventory} onSellEggs={handleSellEggs} addFloatingText={addFloatingText} marketPrices={marketPrices} upgrades={upgrades} marketNews={marketNews} goldenEggs={goldenEggs} />
            ) : view === 'SETTINGS' ? (
              <SettingsScreen onBack={() => setView('COOP')} onReset={handleReset} dayCount={dayCount} isMuted={isMuted} toggleMute={() => setIsMuted(!isMuted)} onPrestige={handlePrestige} canPrestige={balance >= 5000} goldenEggsToGain={Math.floor(balance/5000)} onExportSave={handleExportSave} onImportSave={handleImportSave} />
            ) : view === 'RANKING' ? (
              <RankingScreen onBack={() => setView('COOP')} balance={balance} />
            ) : view === 'COMMUNITY' ? (
              <CommunityScreen onBack={() => setView('COOP')} onSimulateReferral={handleSimulateReferral} referralHistory={referralHistory} coopProgress={coopProgress} onContributeCoop={handleContributeCoop} onBuyAuction={handleBuyAuction} onSellAuction={handleSellAuction} chickens={chickens} balance={balance} maxCapacity={maxCapacity} auctionItems={auctionItems} />
            ) : view === 'PROFILE' ? (
              <ProfileScreen onBack={() => setView('COOP')} stats={stats} achievements={achievements} level={level} xp={xp} xpToNextLevel={level*100} goldenEggs={goldenEggs} />
            ) : view === 'WHEEL' ? (
              <WheelScreen onBack={() => setView('COOP')} onSpin={handleSpinReward} canSpin={canSpinWheel()} balance={balance} />
            ) : view === 'BANK' ? (
              <BankScreen onBack={() => setView('COOP')} balance={balance} setBalance={setBalance} bankBalance={bankBalance} setBankBalance={setBankBalance} />
            ) : (
              <WalletScreen onBack={() => setView('COOP')} balance={balance} setBalance={setBalance} showToast={showToast} addFloatingText={addFloatingText} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}