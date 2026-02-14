import React, { useState } from 'react';
import { Coins, Bot, Users2, Timer, Zap, Shield, ChevronRight, CheckCircle2 } from 'lucide-react';
import { playSound } from '../../../utils/audioSystem';
import { MINIGAME_CONFIG } from '../../../data/gameConfig';
import { useLanguage } from '../../../contexts/LanguageContext';

const HarvestSetup = ({ onBack, onConfirm, balance, chickens = [] }) => {
  const { t } = useLanguage();
  const [bet, setBet] = useState(50);
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [time, setTime] = useState(120);
  const [mode, setMode] = useState('BOT'); // BOT, PVP_MOCK
  const [selectedChicken, setSelectedChicken] = useState((chickens && chickens.length > 0) ? chickens[0] : null);
  
  // AVATAR SELECTION
  const avatars = [
    { id: 'red', icon: '/assets/booster/rooster_red.svg', color: 'bg-red-100 border-red-500' },
    { id: 'blue', icon: '/assets/booster/rooster_blue.svg', color: 'bg-blue-100 border-blue-500' },
    { id: 'green', icon: '/assets/booster/rooster_green.svg', color: 'bg-green-100 border-green-500' },
    { id: 'yellow', icon: '/assets/booster/rooster_yellow.svg', color: 'bg-yellow-100 border-yellow-500' }
  ];
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);

  const bets = [10, 50, 100, 250, 500];
  const difficulties = [
    { id: 'EASY', label: t('harvest_difficulty_EASY'), color: 'bg-green-500', icon: '🐣' },
    { id: 'MEDIUM', label: t('harvest_difficulty_MEDIUM'), color: 'bg-amber-500', icon: '🐔' },
    { id: 'HARD', label: t('harvest_difficulty_HARD'), color: 'bg-red-500', icon: '🦅' }
  ];
  const times = [60, 120, 180];

  const bots = [
    { id: 'bot1', name: t('harvest_bot_1'), avatar: '🤖', difficulty: 'EASY' },
    { id: 'bot2', name: t('harvest_bot_2'), avatar: '🚀', difficulty: 'MEDIUM' },
    { id: 'bot3', name: t('harvest_bot_3'), avatar: '👑', difficulty: 'HARD' }
  ];

  const pvpMocks = [
    { id: 'p1', name: t('harvest_pvp_mock_1'), avatar: '🤴', bet: 50 },
    { id: 'p2', name: t('harvest_pvp_mock_2'), avatar: '👨‍🌾', bet: 100 },
    { id: 'p3', name: t('harvest_pvp_mock_3'), avatar: '🥷', bet: 250 }
  ];

  const handleConfirm = () => {
    // Busca oponente com fallback de segurança
    let opponent = null;
    
    if (mode === 'BOT') {
      opponent = bots.find(b => b.difficulty === difficulty) || bots[0];
    } else {
      opponent = pvpMocks.find(p => p.bet === bet) || pvpMocks[0];
    }

    // Se ainda assim falhar (não deveria), cria um oponente genérico
    if (!opponent) {
      opponent = { id: 'fallback_bot', name: 'Bot Reserva', avatar: '🤖', difficulty: 'EASY', isBot: true };
    }

    // Valida se tem galinha selecionada, senão pega a primeira disponível ou cria uma mock
    const finalChicken = selectedChicken || (chickens && chickens.length > 0 ? chickens[0] : { 
      id: 'mock_chicken', 
      type: 'GRANJA', 
      name: 'Galinha Padrão', 
      icon: '🐔' 
    });

    // Escolhe avatar do oponente (qualquer um EXCETO o do player)
    const availableOpponentAvatars = avatars.filter(a => a.id !== selectedAvatar.id);
    const opponentAvatar = availableOpponentAvatars[Math.floor(Math.random() * availableOpponentAvatars.length)];

    onConfirm({
      bet,
      difficulty,
      time,
      opponent: { ...opponent, isBot: mode === 'BOT' },
      selectedChicken: finalChicken,
      playerAvatar: selectedAvatar.icon,
      opponentAvatar: opponentAvatar.icon
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto animate-in fade-in duration-500">
      <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
        <Zap className="text-amber-500 fill-amber-500" />
        {t('harvest_setup_title')}
      </h2>

      {/* Mode Selection */}
      <div className="flex p-1 bg-slate-200 rounded-2xl mb-8">
        <button 
          onClick={() => { setMode('BOT'); playSound('click'); }}
          className={`flex-1 py-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${mode === 'BOT' ? 'bg-white text-slate-800 shadow-md' : 'text-slate-500 hover:text-slate-600'}`}
        >
          <Bot size={18} /> {t('harvest_vs_bot')}
        </button>
        <button 
          onClick={() => { setMode('PVP_MOCK'); playSound('click'); }}
          className={`flex-1 py-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${mode === 'PVP_MOCK' ? 'bg-white text-slate-800 shadow-md' : 'text-slate-500 hover:text-slate-600'}`}
        >
          <Users2 size={18} /> {t('harvest_pvp_simulated')}
        </button>
      </div>

      <div className="space-y-8">
        {/* Avatar Selection */}
        <div>
           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">{t('harvest_choose_color')}</label>
           <div className="flex gap-4 justify-center bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
             {avatars.map(av => (
               <button
                 key={av.id}
                 onClick={() => { setSelectedAvatar(av); playSound('pop'); }}
                 className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all ${selectedAvatar.id === av.id ? `${av.color} scale-110 shadow-lg ring-2 ring-offset-2 ring-slate-300` : 'bg-slate-100 border-slate-200 grayscale opacity-50 hover:grayscale-0 hover:opacity-100'}`}
               >
                 <img src={av.icon} alt={av.id} className="w-12 h-12 object-contain drop-shadow-sm" />
               </button>
             ))}
           </div>
        </div>

        {/* Chicken Selection - NOVO: Habilidades Passivas (Compacto) */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">{t('harvest_support_bonus')}</label>
          <div className="flex gap-2 overflow-x-auto pb-2 px-1 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400">
            {(!chickens || chickens.length === 0) ? (
              <div className="text-slate-400 text-xs italic p-3 bg-slate-100 rounded-xl w-full text-center">
                {t('harvest_no_chickens')}
              </div>
            ) : (
              chickens.map(chicken => {
                if (!chicken) return null;
                
                const passive = MINIGAME_CONFIG.HARVEST.PASSIVES[chicken.type] || null;
                const isSelected = selectedChicken?.id === chicken.id;
                
                return (
                  <button
                    key={chicken.id}
                    onClick={() => { setSelectedChicken(chicken); playSound('pop'); }}
                    className={`min-w-[100px] p-2 rounded-2xl border-2 transition-all relative flex flex-col items-center gap-1 ${
                      isSelected ? 'bg-green-50 border-green-500 shadow-md scale-95' : 'bg-white border-slate-100 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {isSelected && <div className="absolute top-1 right-1 text-green-500"><CheckCircle2 size={12} /></div>}
                    
                    {/* Destaque para a Passiva */}
                    {passive ? (
                      <>
                        <div className="bg-slate-100 p-1.5 rounded-full mb-1">
                          <span className="text-xl">{passive.icon}</span>
                        </div>
                        <div className="font-black text-[9px] text-slate-700 uppercase leading-tight text-center">
                          {t(passive.labelKey)}
                        </div>
                        <div className="text-[8px] text-slate-400 font-bold leading-tight text-center line-clamp-2 w-full">
                          {t(passive.descKey)}
                        </div>
                        <div className="mt-1 pt-1 border-t border-slate-100 w-full flex items-center justify-center gap-1 opacity-50">
                           <span className="text-[8px]">{chicken.icon}</span>
                           <span className="text-[7px] truncate max-w-[50px]">{chicken.name}</span>
                        </div>
                      </>
                    ) : (
                       // Fallback sem passiva
                       <>
                         <div className="text-xl">{chicken.icon}</div>
                         <div className="text-[9px] text-slate-500">Sem Bônus</div>
                       </>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Bet Selection */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">{t('harvest_setup_bet')}</label>
          <div className="grid grid-cols-5 gap-2">
            {bets.map(b => (
              <button
                key={b}
                onClick={() => { setBet(b); playSound('pop'); }}
                className={`py-3 rounded-xl font-black text-sm transition-all border-2 ${bet === b ? 'bg-amber-500 border-amber-600 text-white shadow-lg scale-105' : 'bg-white border-slate-100 text-slate-600 hover:border-amber-200'}`}
              >
                {b}
              </button>
            ))}
          </div>
          {balance < bet && (
            <p className="text-red-500 text-[10px] font-bold mt-2 animate-pulse">{t('cockfight_insufficient_bet')}</p>
          )}
        </div>

        {/* Difficulty Selection (Only for BOT) */}
        {mode === 'BOT' && (
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">{t('harvest_ai_difficulty')}</label>
            <div className="grid grid-cols-3 gap-3">
              {difficulties.map(d => (
                <button
                  key={d.id}
                  onClick={() => { setDifficulty(d.id); playSound('pop'); }}
                  className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all border-4 ${difficulty === d.id ? `${d.color} border-white shadow-xl scale-105 text-white` : 'bg-white border-slate-50 text-slate-600'}`}
                >
                  <span className="text-2xl">{d.icon}</span>
                  <span className="font-black text-[10px] uppercase">{d.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Time Selection */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">{t('harvest_game_time')}</label>
          <div className="grid grid-cols-3 gap-3">
            {times.map(t => (
              <button
                key={t}
                onClick={() => { setTime(t); playSound('pop'); }}
                className={`py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 border-2 ${time === t ? 'bg-indigo-500 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-600'}`}
              >
                <Timer size={16} /> {t}s
              </button>
            ))}
          </div>
        </div>

        {/* Economic Preview */}
        <div className="bg-slate-800 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10"><Zap size={120} /></div>
          <div className="relative z-10">
            <h3 className="text-amber-400 font-black text-xs uppercase tracking-widest mb-4">{t('harvest_setup_summary')}</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-bold">{t('harvest_your_bet')}</span>
                <span className="font-black">{bet} 💰</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-bold">{t('harvest_opp_bet')}</span>
                <span className="font-black">{bet} 💰</span>
              </div>
              <div className="h-px bg-slate-700 my-2" />
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-slate-400 font-bold text-xs">{t('harvest_winner_prize', [mode === 'BOT' ? 200 : 180])}</span>
                  <div className="text-3xl font-black text-green-400">
                    {mode === 'BOT' ? bet * 2 : Math.floor(bet * 1.8)} <span className="text-xs">💰</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 font-bold text-[10px] uppercase">{t('harvest_system_fee')}</span>
                  <div className="font-black text-red-400">-{mode === 'BOT' ? 0 : Math.floor(bet * 0.2)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleConfirm}
          disabled={balance < bet}
          className="w-full bg-green-500 hover:bg-green-600 disabled:bg-slate-300 text-white py-5 rounded-3xl font-black text-xl shadow-xl shadow-green-200 border-b-8 border-green-700 active:border-b-0 active:translate-y-2 transition-all flex items-center justify-center gap-3 mt-4"
        >
          {t('harvest_confirm_play')}
          <ChevronRight />
        </button>
      </div>
    </div>
  );
};

export default HarvestSetup;
