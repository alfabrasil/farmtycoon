import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Swords, Shield, Zap, Target, Coins, Trophy, Info, AlertTriangle, Play, ChevronRight, RefreshCw, History, DollarSign, TrendingUp, ShoppingBag } from 'lucide-react';
import { RINHA_CONFIG } from '../../data/gameConfig';
import { playSound } from '../../utils/audioSystem';
import { useLanguage } from '../../contexts/LanguageContext';
import RinhaEngine from '../../services/RinhaEngine';
import InteractiveBattle from './rinha/InteractiveBattle';
import RoosterSprite from './rinha/RoosterSprite';
import RoosterCycler from '../ui/RoosterCycler';
import ChiIcon from '../ui/ChiIcon';
import { appendTreasuryLedgerEntry, computePvPFeeSplit } from '../../utils/treasuryLedger';

const CockfightScreen = ({ onBack, balance, setBalance, showToast }) => {
  const { t } = useLanguage();
  const ACTIVE_BATTLE_KEY = 'rinha_active_battle_v1';
  const [rooster, setRooster] = useState(() => {
    try {
      const saved = localStorage.getItem('farm_rooster');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Erro ao carregar galo:", e);
      return null;
    }
  });

  const [gameState, setGameState] = useState('MENU'); // MENU, SELECTING_ROOSTER, TEAM_3V3, SHOP, BATTLING, RESULT, HISTORY
  const [selectedElement, setSelectedElement] = useState('FOGO');
  const [selectedColor, setSelectedColor] = useState('VERMELHO');
  const [bet, setBet] = useState(10);
  const [battleMode, setBattleMode] = useState('1v1');
  const [isProcessing, setIsProcessing] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeBattle, setActiveBattle] = useState(() => {
    try {
      const saved = localStorage.getItem('rinha_active_battle_v1');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const battleStateRef = useRef(null);
  const [team3v3, setTeam3v3] = useState(() => {
    try {
      const saved = localStorage.getItem('rinha_team_3v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 3) return parsed;
      }
      return null;
    } catch (e) {
      return null;
    }
  });
  const balanceRef = useRef(balance);

  useEffect(() => {
    balanceRef.current = balance;
  }, [balance]);
  
  const [inventory, setInventory] = useState(() => {
    const defaults = [
      { id: 'hp_potion', name: 'HP Potion', icon: '🧪', type: 'hp', value: 100, count: 0, price: 50 },
      { id: 'mp_potion', name: 'Energy Potion', icon: '⚡', type: 'energy', value: 100, count: 0, price: 30 },
      { id: 'shield_item', name: 'Shield', icon: '🛡️', type: 'shield', value: 90, count: 0, price: 50 }
    ];
    try {
      const saved = localStorage.getItem('rinha_inventory');
      if (!saved) return defaults;
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return defaults;

      const savedById = new Map(parsed.map(i => [i?.id, i]));
      const normalized = defaults.map(d => {
        const s = savedById.get(d.id);
        if (!s) return d;
        return { ...d, count: Number.isFinite(s.count) ? s.count : d.count };
      });

      parsed.forEach(i => {
        if (!i?.id) return;
        if (normalized.some(x => x.id === i.id)) return;
        normalized.push(i);
      });

      return normalized;
    } catch (e) {
      return defaults;
    }
  });

  useEffect(() => {
    localStorage.setItem('rinha_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    if (rooster) {
      localStorage.setItem('farm_rooster', JSON.stringify(rooster));
    }
  }, [rooster]);

  useEffect(() => {
    if (!team3v3) return;
    localStorage.setItem('rinha_team_3v3', JSON.stringify(team3v3));
  }, [team3v3]);

  useEffect(() => {
    if (!rooster) return;
    if (team3v3) return;
    setTeam3v3([
      { ...rooster, slot: 1 },
      { ...rooster, slot: 2, element: 'TERRA' },
      { ...rooster, slot: 3, element: 'AGUA' }
    ]);
  }, [rooster, team3v3]);

  useEffect(() => {
    loadHistory();
  }, []);

  const persistActiveBattle = (battleState) => {
    if (!battleState || !matchResult) return;
    const payload = {
      matchData: matchResult,
      bet,
      battleMode,
      team3v3,
      rooster,
      inventory,
      battleState,
      savedAt: Date.now()
    };
    setActiveBattle(payload);
    try {
      localStorage.setItem(ACTIVE_BATTLE_KEY, JSON.stringify(payload));
    } catch (e) {}
  };

  const clearActiveBattle = () => {
    setActiveBattle(null);
    battleStateRef.current = null;
    try {
      localStorage.removeItem(ACTIVE_BATTLE_KEY);
    } catch (e) {}
  };

  const loadHistory = async () => {
    const data = await RinhaEngine.getHistory(20);
    setHistory(data);
  };

  const buyRooster = () => {
    if (balance < RINHA_CONFIG.ROOSTER_PRICE) {
      showToast(t('msg_insufficient_funds'), 'error');
      return;
    }
    setBalance(prev => prev - RINHA_CONFIG.ROOSTER_PRICE);
    const newRooster = {
      level: 1,
      wins: 0,
      element: 'FOGO',
      color: 'VERMELHO'
    };
    setRooster(newRooster);
    playSound('cash');
    showToast(t('cockfight_rooster_acquired'), 'success');
  };

  const startBattle = async () => {
    if (balance < bet) {
      showToast(t('cockfight_insufficient_bet'), 'error');
      return;
    }

    if (battleMode === '3v3') {
      if (!team3v3 || team3v3.length !== 3) {
        showToast('Selecione seu time 3V3 antes de lutar.', 'error');
        return;
      }
      const invalid = team3v3.some(r => !r || !r.element || !r.color);
      if (invalid) {
        showToast('Seu time 3V3 está incompleto.', 'error');
        return;
      }
    }

    setIsProcessing(true);
    try {
      clearActiveBattle();
      // Setup Initial Match Data for Interactive Battle
      // We deduct the bet immediately
      setBalance(prev => prev - bet);
      const split = computePvPFeeSplit(bet, 2);
      appendTreasuryLedgerEntry({
        type: 'FEE',
        source: 'COCKFIGHT_PVP',
        bet,
        bettors: 2,
        fee: split.feeTotal,
        split,
        meta: { mode: battleMode },
      });
      
      const elements = Object.keys(RINHA_CONFIG.ELEMENTS);
      const colors = Object.keys(RINHA_CONFIG.COLORS);
      const arena = RINHA_CONFIG.ARENAS[Math.floor(Math.random() * RINHA_CONFIG.ARENAS.length)];
      
      const cpuRooster = {
        element: elements[Math.floor(Math.random() * elements.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        level: rooster.level || 1
      };

      const matchData = {
        arena,
        cpu: cpuRooster,
        betAmount: bet
      };
      
      setMatchResult(matchData);
      setGameState('BATTLING');
      playSound('game_start');
    } catch (error) {
      showToast(t('cockfight_insufficient_funds'), 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const updateTeamSlot = (idx, patch) => {
    setTeam3v3(prev => {
      const base = Array.isArray(prev) && prev.length === 3 ? prev : [
        { ...rooster, slot: 1 },
        { ...rooster, slot: 2, element: 'TERRA' },
        { ...rooster, slot: 3, element: 'AGUA' }
      ];
      return base.map((r, i) => i === idx ? { ...r, ...patch } : r);
    });
  };

  const onBattleComplete = (resultString) => { // 'WIN', 'LOSS', 'DRAW'
    let payout = 0;
    if (resultString === 'WIN') payout = Math.floor(bet * 1.8);
    else if (resultString === 'DRAW') payout = bet;
    
    const newBalance = balanceRef.current + payout;
    setBalance(newBalance);

    const finalResult = {
      ...matchResult,
      result: resultString,
      financial: {
        bet,
        payout,
        profit: payout - bet,
        newBalance
      }
    };
    
    setMatchResult(finalResult);
    setGameState('RESULT');
    clearActiveBattle();
    
    if (resultString === 'WIN') {
      setRooster(prev => ({ ...prev, wins: prev.wins + 1, level: Math.floor((prev.wins + 1) / 5) + 1 }));
      playSound('victory');
    } else if (resultString === 'DRAW') {
      playSound('neutral');
    } else {
      playSound('defeat');
    }
    
    // Save Match to local storage
    try {
      const savedMatches = JSON.parse(localStorage.getItem('farm_matches_history') || '[]');
      savedMatches.unshift({
        id: Date.now().toString(),
        result: resultString,
        bet_amount: bet,
        payout: payout,
        created_at: new Date().toISOString()
      });
      localStorage.setItem('farm_matches_history', JSON.stringify(savedMatches.slice(0, 50)));
    } catch(e) {}

    loadHistory();
  };

  const buyItem = (itemId) => {
    const item = inventory.find(i => i.id === itemId);
    if (balance < item.price) {
      showToast('Insufficient CHI!', 'error');
      return;
    }
    setBalance(prev => prev - item.price);
    setInventory(prev => prev.map(i => i.id === itemId ? { ...i, count: i.count + 1 } : i));
    playSound('cash');
    showToast(`${item.name} acquired!`, 'success');
  };

  const handleUseItem = (itemId) => {
    setInventory(prev => prev.map(i => i.id === itemId ? { ...i, count: Math.max(0, i.count - 1) } : i));
  };

  const handleBack = () => {
    if (gameState === 'BATTLING' && matchResult && battleStateRef.current) {
      persistActiveBattle(battleStateRef.current);
    }
    onBack();
  };

  const renderFinancialSummary = () => {
    if (!matchResult) return null;
    const { financial } = matchResult;
    
    return (
      <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-4 border border-white/10 space-y-3 mb-6">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <DollarSign size={12} /> {t('cockfight_financial_summary')}
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 font-bold">{t('cockfight_financial_bet')}</span>
            <span className="text-sm font-black text-white">{financial.bet} RC</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 font-bold">{t('cockfight_financial_payout')}</span>
            <span className="text-sm font-black text-green-400">{financial.payout} RC</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 font-bold">{t('cockfight_financial_profit')}</span>
            <span className={`text-sm font-black ${financial.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {financial.profit > 0 ? '+' : ''}{financial.profit} RC
            </span>
          </div>
          <div className="flex justify-between items-center border-l border-white/10 pl-4">
            <span className="text-xs text-slate-400 font-bold">{t('cockfight_financial_balance')}</span>
            <span className="text-sm font-black text-yellow-400">{financial.newBalance} RC</span>
          </div>
        </div>
      </div>
    );
  };

  const renderHistory = () => (
    <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-black text-slate-800 text-xl flex items-center gap-2">
          <History className="text-red-600" /> {t('cockfight_history_title')}
        </h3>
        <button onClick={() => setGameState('MENU')} className="text-slate-400 hover:text-slate-600">
          <X size={24} />
        </button>
      </div>
      
      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {history.length === 0 ? (
          <div className="text-center py-10 text-slate-400 font-bold">
            {t('harvest_history_empty')}
          </div>
        ) : (
          history.map((match, index) => (
            <div key={`history-${match.id}-${index}`} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                  match.result === 'WIN' ? 'bg-green-100' : match.result === 'DRAW' ? 'bg-slate-100' : 'bg-red-100'
                }`}>
                  {match.result === 'WIN' ? '🏆' : match.result === 'DRAW' ? '🤝' : '💀'}
                </div>
                <div>
                  <div className="font-black text-slate-800 text-sm">
                    {match.result === 'WIN' ? t('cockfight_victory') : match.result === 'DRAW' ? t('cockfight_draw') : t('cockfight_defeat')}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400">
                    {new Date(match.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-black text-sm ${match.payout > match.bet_amount ? 'text-green-600' : match.payout === match.bet_amount ? 'text-slate-600' : 'text-red-600'}`}>
                  {match.payout > match.bet_amount ? '+' : ''}{match.payout - match.bet_amount} RC
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">
                  {match.bet_amount} RC Bet
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <button onClick={() => setGameState('MENU')} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-lg uppercase">
        {t('chase_back_lobby')}
      </button>
    </div>
  );

  if (!rooster) {
    return (
      <div className="p-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-8">
        <button onClick={handleBack} className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
            <X className="text-slate-600" />
          </button>
          <div className="text-right">
            <h2 className="font-black text-slate-800 text-2xl italic flex items-center gap-2 justify-end">
              <Swords className="text-red-600" /> {t('cockfight_title')}
            </h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{t('cockfight_subtitle')}</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
          <RoosterCycler size={120} />
          <div className="space-y-2">
            <h3 className="font-black text-slate-800 text-2xl uppercase">{t('cockfight_no_fighter')}</h3>
            <p className="text-slate-500 font-medium max-w-[250px] mx-auto">
              {t('cockfight_need_rooster')}
            </p>
          </div>
          
          <div className="bg-yellow-50 p-6 rounded-3xl border-2 border-yellow-100 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="font-black text-slate-700 uppercase flex items-center gap-2">
                <Coins className="text-yellow-500" /> {t('cockfight_investment')}
              </span>
              <span className="bg-yellow-500 text-white font-black px-3 py-1 rounded-full text-sm inline-flex items-center gap-1">
                <ChiIcon className="w-4 h-4" /> {RINHA_CONFIG.ROOSTER_PRICE} CHI
              </span>
            </div>
            <button onClick={buyRooster} className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-red-200 border-b-4 border-red-800 active:border-b-0 active:translate-y-1 transition-all uppercase">
              {t('cockfight_buy_now')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto w-full">
      <div className="flex justify-between items-center mb-4 md:mb-8 shrink-0">
        <button onClick={handleBack} className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
          <X className="text-slate-600 w-5 h-5 md:w-6 md:h-6" />
        </button>
        <div className="text-right flex items-center gap-2 md:gap-4">
           <button onClick={() => setGameState('HISTORY')} className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
              <History className="text-slate-600 w-5 h-5 md:w-6 md:h-6" />
           </button>
           <div>
            <h2 className="font-black text-slate-800 text-xl md:text-2xl italic flex items-center gap-2 justify-end">
              <Swords className="text-red-600 w-5 h-5 md:w-6 md:h-6" /> {t('cockfight_title')}
            </h2>
            <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest">{t('cockfight_subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
        {gameState === 'HISTORY' ? renderHistory() : (
          <div className="space-y-6">
            {gameState === 'MENU' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                {/* Stats do Galo Atual */}
                <div className="bg-white rounded-3xl p-4 md:p-6 shadow-xl border-b-4 border-slate-200">
                  <div className="flex justify-between items-start mb-6 gap-2">
                    <div className="flex items-center gap-2 md:gap-4 min-w-0">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-50 rounded-2xl flex items-center justify-center border-2 border-slate-100 shadow-sm overflow-hidden shrink-0">
                        <RoosterSprite 
                          colorKey={rooster.color} 
                          element={rooster.element} 
                          size={48} 
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-black text-slate-800 text-sm md:text-xl leading-tight truncate">{t('cockfight_current_fighter')}</h3>
                        <div className="flex items-center gap-1 md:gap-2 mt-1">
                          <span className="bg-red-600 text-white text-[8px] md:text-[10px] px-2 py-0.5 rounded-full font-black uppercase">{t('cockfight_level')} {rooster.level}</span>
                          <span className="text-[10px] md:text-xs font-bold text-slate-400">{t('cockfight_wins_label', [rooster.wins])}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 md:gap-4 shrink-0">
                      <div className="flex flex-col items-center gap-1">
                        <button onClick={() => setGameState('SHOP')} className="bg-slate-100 hover:bg-slate-200 p-2 sm:p-2.5 rounded-xl transition-colors relative" title={t('cockfight_action_shop')}>
                          <ShoppingBag size={20} className="text-slate-600" />
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center">{inventory.reduce((acc, i) => acc + i.count, 0)}</span>
                        </button>
                        <span className="hidden sm:block text-[9px] font-black text-slate-500">{t('cockfight_action_shop')}</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <button onClick={() => setGameState('SELECTING_ROOSTER')} className="bg-slate-100 hover:bg-slate-200 p-2 sm:p-2.5 rounded-xl transition-colors" title={t('cockfight_action_change_rooster')}>
                          <RefreshCw size={20} className="text-slate-600" />
                        </button>
                        <span className="hidden sm:block text-[9px] font-black text-slate-500">{t('cockfight_action_change_rooster')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 md:gap-4">
                    <div className="bg-slate-50 p-2 md:p-3 rounded-xl border border-slate-100">
                      <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase block mb-1">{t('cockfight_element')}</span>
                      <div className="flex items-center gap-1 md:gap-2 font-bold text-slate-700 text-xs md:text-base">
                        <span>{RINHA_CONFIG.ELEMENTS[rooster.element].icon}</span>
                        <span className="truncate">{t(RINHA_CONFIG.ELEMENTS[rooster.element].nameKey)}</span>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-2 md:p-3 rounded-xl border border-slate-100">
                      <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase block mb-1">{t('cockfight_base_color')}</span>
                      <div className="flex items-center gap-1 md:gap-2 font-bold text-slate-700 text-xs md:text-base">
                        <div className="w-2 h-2 md:w-3 md:h-3 rounded-full shrink-0" style={{ backgroundColor: RINHA_CONFIG.COLORS[rooster.color].hex }}></div>
                        <span className="truncate">{t(RINHA_CONFIG.COLORS[rooster.color].nameKey)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seção de Aposta */}
                <div className="bg-white rounded-3xl p-4 md:p-6 shadow-xl border-b-4 border-slate-200">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-4">
                    <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase text-sm md:text-base">
                      <Coins className="text-yellow-500 shrink-0" /> {t('cockfight_bet_amount')}
                    </h3>
                    
                    {/* Game Mode Selector */}
                    <div className="flex bg-slate-100 rounded-xl p-1 w-full sm:w-auto">
                      <button 
                        onClick={() => setBattleMode('1v1')} 
                        className={`flex-1 sm:flex-none px-4 py-2 sm:px-3 sm:py-1 text-xs font-black rounded-lg transition-colors ${battleMode === '1v1' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
                      >
                        1 V 1
                      </button>
                      <button 
                        onClick={() => setBattleMode('3v3')} 
                        className={`flex-1 sm:flex-none px-4 py-2 sm:px-3 sm:py-1 text-xs font-black rounded-lg transition-colors ${battleMode === '3v3' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
                      >
                        3 V 3
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap sm:flex-nowrap gap-2 mb-6">
                    {[10, 50, 100, 500].map(v => (
                      <button 
                        key={v}
                        onClick={() => setBet(v)}
                        className={`flex-1 min-w-[60px] py-3 rounded-xl font-black text-sm transition-all ${bet === v ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={startBattle} 
                    disabled={isProcessing}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-4 rounded-2xl font-black text-base sm:text-lg shadow-xl shadow-red-200 border-b-4 border-red-800 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 uppercase whitespace-nowrap"
                  >
                    {isProcessing ? <RefreshCw className="animate-spin" /> : <><span className="whitespace-nowrap">{t('cockfight_find_opponent')}</span> <ChevronRight className="shrink-0" /></>}
                  </button>
                </div>

                {activeBattle && activeBattle.matchData && (
                  <div className="bg-yellow-50 rounded-3xl p-6 shadow-xl border-b-4 border-yellow-200">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-[10px] font-black text-yellow-700 uppercase tracking-widest">
                          {t('cockfight_battle_in_progress')}
                        </div>
                        <div className="font-black text-slate-800 text-lg mt-1">
                          {t(activeBattle.matchData?.arena?.nameKey) || activeBattle.matchData?.arena?.name}
                        </div>
                        <div className="text-xs font-bold text-slate-600 mt-1">
                          {activeBattle.battleMode?.toUpperCase()} · {activeBattle.bet} CHI
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setBet(activeBattle.bet || 10);
                            setBattleMode(activeBattle.battleMode || '1v1');
                            if (activeBattle.team3v3) setTeam3v3(activeBattle.team3v3);
                            setMatchResult(activeBattle.matchData);
                            setGameState('BATTLING');
                          }}
                          className="bg-slate-900 text-white px-4 py-2 rounded-xl font-black text-xs uppercase shadow-lg active:scale-95 transition-all"
                        >
                          {t('cockfight_resume_battle')}
                        </button>
                        <button
                          onClick={() => {
                            clearActiveBattle();
                            showToast(t('cockfight_battle_discarded') || 'Batalha descartada', 'success');
                          }}
                          className="bg-white text-slate-900 px-4 py-2 rounded-xl font-black text-xs uppercase border border-yellow-200 hover:bg-yellow-100 transition-all active:scale-95"
                        >
                          {t('cockfight_discard_battle')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {battleMode === '3v3' && (
                  <div className="bg-white rounded-3xl p-4 md:p-6 shadow-xl border-b-4 border-slate-200">
                    <div className="flex justify-between items-center mb-4 gap-2">
                      <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase text-sm md:text-base">
                        <Swords className="text-red-600 shrink-0" /> SEU TIME 3V3
                      </h3>
                      <button onClick={() => setGameState('TEAM_3V3')} className="bg-slate-900 text-white px-3 py-2 md:px-4 rounded-xl font-black text-[10px] md:text-xs uppercase shadow-lg active:scale-95 transition-all shrink-0">
                        EDITAR
                      </button>
                    </div>

                    <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6 bg-slate-950 rounded-2xl p-3 md:p-6 border border-slate-800 overflow-x-auto">
                      {(team3v3 || []).map((r, idx) => (
                        <div key={`team-${idx}`} className="flex flex-col items-center gap-1 md:gap-2 shrink-0">
                          <RoosterSprite colorKey={r.color} element={r.element} size={70} />
                          <div className="bg-slate-800 text-white text-[8px] md:text-[9px] font-black px-2 py-1 rounded-full uppercase text-center max-w-[80px] leading-tight">
                            {t(RINHA_CONFIG.ELEMENTS[r.element]?.nameKey)}<br className="md:hidden" /> {t(RINHA_CONFIG.COLORS[r.color]?.nameKey)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {gameState === 'TEAM_3V3' && (
              <div className="bg-white rounded-3xl p-6 shadow-xl space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-slate-800 text-xl flex items-center gap-2">
                    <Swords className="text-red-600" /> MONTAR TIME 3V3
                  </h3>
                  <button onClick={() => setGameState('MENU')} className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
                    <X size={20} className="text-slate-600" />
                  </button>
                </div>

                <div className="grid gap-4">
                  {(team3v3 || []).map((slot, idx) => (
                    <div key={`slot-${idx}`} className="bg-slate-950 rounded-3xl p-5 border border-slate-800">
                      <div className="flex flex-col md:flex-row gap-5 items-center">
                        <div className="shrink-0">
                          <RoosterSprite colorKey={slot.color} element={slot.element} size={140} />
                        </div>

                        <div className="flex-1 w-full space-y-4">
                          <div>
                            <div className="text-[10px] font-black text-white/50 uppercase mb-2">LINHAGEM</div>
                            <div className="grid grid-cols-4 gap-2">
                              {Object.values(RINHA_CONFIG.ELEMENTS).map(el => (
                                <button
                                  key={`slot-el-${idx}-${el.id}`}
                                  onClick={() => updateTeamSlot(idx, { element: el.id })}
                                  className={`py-3 rounded-xl border-2 font-black text-xs uppercase flex items-center justify-center gap-2 transition-all ${
                                    slot.element === el.id ? 'border-yellow-400 bg-white/10 text-yellow-300' : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                                  }`}
                                >
                                  <span className="text-base">{el.icon}</span>
                                  <span className="hidden sm:inline">{t(el.nameKey)}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <div className="text-[10px] font-black text-white/50 uppercase mb-2">PINTURA</div>
                            <div className="flex items-center gap-3">
                              {Object.values(RINHA_CONFIG.COLORS).map(c => (
                                <button
                                  key={`slot-col-${idx}-${c.id}`}
                                  onClick={() => updateTeamSlot(idx, { color: c.id })}
                                  className={`w-12 h-12 rounded-full border-4 transition-all ${slot.color === c.id ? 'border-white shadow-[0_0_0_4px_rgba(250,204,21,0.35)]' : 'border-slate-800 opacity-80 hover:opacity-100'}`}
                                  style={{ backgroundColor: c.hex }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setGameState('MENU');
                    showToast('TIME 3V3 SALVO!', 'success');
                  }}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-lg uppercase"
                >
                  SALVAR TIME 3V3
                </button>
              </div>
            )}

            {gameState === 'SHOP' && (
              <div className="bg-white rounded-3xl p-6 shadow-xl space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-slate-800 text-xl flex items-center gap-2">
                    <ShoppingBag className="text-yellow-500" /> BATTLE ITEMS
                  </h3>
                  <button onClick={() => setGameState('MENU')} className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
                    <X size={20} className="text-slate-600" />
                  </button>
                </div>
                
                <div className="grid gap-4">
                  {inventory.map(item => (
                    <div key={item.id} className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">{item.icon}</div>
                        <div>
                          <div className="font-black text-slate-800 uppercase">{item.name}</div>
                          <div className="text-[10px] font-bold text-slate-400">IN INVENTORY: <span className="text-slate-800">{item.count}</span></div>
                        </div>
                      </div>
                      <button 
                        onClick={() => buyItem(item.id)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-4 py-2 rounded-xl font-black flex items-center gap-1 shadow-sm transition-all active:scale-95"
                      >
                        <ChiIcon className="w-4 h-4" /> {item.price}
                      </button>
                    </div>
                  ))}
                </div>
                
                <button onClick={() => setGameState('MENU')} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-lg uppercase mt-4">
                  BACK TO LOBBY
                </button>
              </div>
            )}

            {gameState === 'SELECTING_ROOSTER' && (
              <div className="bg-white rounded-3xl p-6 shadow-xl space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="flex flex-col items-center gap-4 py-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                  <RoosterSprite 
                    colorKey={selectedColor} 
                    element={selectedElement} 
                    size={120} 
                  />
                  <div className="text-center">
                    <h3 className="font-black text-slate-800 uppercase tracking-tighter">{t('cockfight_customize')}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('cockfight_preview')}</p>
                  </div>
                </div>
                
                <div>
                  <span className="text-xs font-black text-slate-400 uppercase block mb-3">{t('cockfight_choose_element')}</span>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.values(RINHA_CONFIG.ELEMENTS).map((el, index) => (
                      <button 
                        key={`element-${el.id}-${index}`}
                        onClick={() => setSelectedElement(el.id)}
                        className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 font-bold ${selectedElement === el.id ? 'border-red-500 bg-red-50 text-red-700 shadow-lg shadow-red-100' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'}`}
                      >
                        <span className="text-xl shrink-0">{el.icon}</span>
                        <div className="text-left overflow-hidden">
                          <div className="text-xs md:text-sm leading-none uppercase tracking-tighter truncate">{t(el.nameKey)}</div>
                          <div className="text-[10px] opacity-60 font-black mt-1">PWR: {el.base}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Strategy Card */}
                <div className="bg-slate-900 rounded-2xl p-4 text-white space-y-3 shadow-xl">
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">{t('cockfight_strategy_advantage')}</span>
                      <Shield className="text-blue-400" size={14} />
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="flex-1 space-y-1">
                         <div className="text-xs font-black text-blue-400 uppercase">{t('cockfight_element_power')}</div>
                         <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(RINHA_CONFIG.ELEMENTS[selectedElement].base / 100) * 100}%` }}
                              className="h-full bg-blue-500"
                            />
                         </div>
                      </div>
                      <div className="flex-1 space-y-1">
                         <div className="text-xs font-black text-yellow-400 uppercase">{t('cockfight_strategy_wins')}</div>
                         <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: RINHA_CONFIG.COLORS[selectedColor].hex }}></div>
                            <ChevronRight size={10} className="text-white/40" />
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: RINHA_CONFIG.COLORS[RINHA_CONFIG.COLORS[selectedColor].beats].hex }}></div>
                         </div>
                      </div>
                   </div>
                </div>

                <div>
                  <span className="text-xs font-black text-slate-400 uppercase block mb-3">{t('cockfight_choose_color')}</span>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.values(RINHA_CONFIG.COLORS).map((c, index) => (
                      <button 
                        key={`color-${c.id}-${index}`}
                        onClick={() => setSelectedColor(c.id)}
                        className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 font-bold ${selectedColor === c.id ? 'border-slate-800 bg-slate-900 text-white' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'}`}
                      >
                        <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: c.hex }}></div>
                        <div className="text-left overflow-hidden">
                          <div className="text-xs md:text-sm leading-none truncate">{t(c.nameKey)}</div>
                          <div className="text-[9px] opacity-60 flex items-center gap-1 mt-1 truncate">
                            <TrendingUp size={10} className="shrink-0" /> <span className="truncate">{t('cockfight_vence')} {t(RINHA_CONFIG.COLORS[c.beats].nameKey)}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setRooster(prev => ({ ...prev, element: selectedElement, color: selectedColor }));
                    setGameState('MENU');
                    showToast(t('cockfight_config_saved'), 'success');
                  }} 
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-xl active:scale-95 transition-all uppercase"
                >
                  {t('cockfight_confirm_changes')}
                </button>
              </div>
            )}

            {gameState === 'BATTLING' && matchResult && (
              <div className="animate-in zoom-in duration-500">
                <InteractiveBattle 
                  matchData={matchResult} 
                  initialState={activeBattle?.battleState}
                  onStateChange={(s) => { battleStateRef.current = s; }}
                  onExit={(s) => {
                    battleStateRef.current = s;
                    persistActiveBattle(s);
                    setGameState('MENU');
                  }}
                  playerTeam={
                    battleMode === '3v3'
                      ? (team3v3 || []).map((r, i) => ({ ...r, id: `p${i + 1}`, level: rooster.level || 1 }))
                      : [{ ...rooster, id: 'p1' }]
                  } 
                  cpuTeam={
                    battleMode === '3v3' ? [
                      {...matchResult.cpu, id: 'c1'},
                      {element: Object.keys(RINHA_CONFIG.ELEMENTS)[Math.floor(Math.random()*4)], color: Object.keys(RINHA_CONFIG.COLORS)[Math.floor(Math.random()*4)], level: rooster.level, id: 'c2'},
                      {element: Object.keys(RINHA_CONFIG.ELEMENTS)[Math.floor(Math.random()*4)], color: Object.keys(RINHA_CONFIG.COLORS)[Math.floor(Math.random()*4)], level: rooster.level, id: 'c3'}
                    ] : [{...matchResult.cpu, id: 'c1'}]
                  }
                  mode={battleMode}
                  inventory={inventory}
                  onUseItem={handleUseItem}
                  onComplete={onBattleComplete} 
                />
              </div>
            )}

            {gameState === 'RESULT' && (
              <div className="space-y-6 animate-in zoom-in duration-300">
                <div className={`rounded-3xl p-8 text-center shadow-2xl border-b-8 ${
                  matchResult.result === 'WIN' ? 'bg-green-500 border-green-700' : 
                  matchResult.result === 'DRAW' ? 'bg-slate-500 border-slate-700' : 
                  'bg-red-600 border-red-800'
                }`}>
                  <div className="text-6xl mb-4">
                    {matchResult.result === 'WIN' ? '👑' : matchResult.result === 'DRAW' ? '🤝' : '💀'}
                  </div>
                  <h2 className="text-4xl font-black text-white mb-2 italic">
                    {matchResult.result === 'WIN' ? t('cockfight_victory') : matchResult.result === 'DRAW' ? t('cockfight_draw') : t('cockfight_defeat')}
                  </h2>
                  
                  {renderFinancialSummary()}

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-black/20 p-4 rounded-2xl">
                      <span className="text-[10px] font-black text-white/60 uppercase block">{t('cockfight_my_rooster')}</span>
                      <span className="text-2xl font-black text-white">{t('cockfight_level')} {rooster.level}</span>
                    </div>
                    <div className="bg-black/20 p-4 rounded-2xl">
                      <span className="text-[10px] font-black text-white/60 uppercase block">{t('cockfight_total_wins')}</span>
                      <span className="text-2xl font-black text-white">{rooster.wins}</span>
                    </div>
                  </div>

                  <button onClick={() => setGameState('MENU')} className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black shadow-lg hover:bg-slate-100 transition-all active:scale-95 uppercase">
                    {t('cockfight_back_menu')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Informações do Sistema */}
        {gameState === 'MENU' && (
          <div className="mt-8 bg-blue-50 rounded-2xl p-4 border border-blue-100 flex gap-3">
            <Info size={24} className="text-blue-500 shrink-0" />
            <div>
              <h4 className="font-black text-blue-900 text-sm uppercase">{t('cockfight_how_works')}</h4>
              <p className="text-blue-700 text-[10px] font-bold leading-tight mt-1">
                {t('cockfight_how_works_desc')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CockfightScreen;
