import React, { useMemo } from 'react';
import { Landmark, Megaphone, Code, Info, Trophy, Stars, Timer, Users2, X } from 'lucide-react';
import { LEADERBOARD_MOCK } from '../../../data/gameConfig';
import { useLanguage } from '../../../contexts/LanguageContext';
import { computePvPFeeSplit, filterLedgerBySource, loadTreasuryLedger, sumTreasuryLedger } from '../../../utils/treasuryLedger';

const HarvestTreasury = ({ history, onBack }) => {
  const { t } = useLanguage();
  const sources = useMemo(() => {
    const ledger = loadTreasuryLedger();
    const harvestEntries = filterLedgerBySource(ledger, 'HARVEST_PVP');
    const chaseEntries = filterLedgerBySource(ledger, 'CHASE_PVP');
    const cockfightEntries = filterLedgerBySource(ledger, 'COCKFIGHT_PVP');
    const harvest = sumTreasuryLedger(harvestEntries);
    const chase = sumTreasuryLedger(chaseEntries);
    const cockfight = sumTreasuryLedger(cockfightEntries);
    const total = sumTreasuryLedger(ledger);

    if (harvestEntries.length > 0 || chaseEntries.length > 0 || cockfightEntries.length > 0) {
      return { harvest, chase, cockfight, total };
    }

    const pvpMatches = (history || []).filter(h => h?.isPvP && Number.isFinite(Number(h?.bet)));
    const fallbackHarvest = pvpMatches.reduce(
      (acc, m) => {
        const s = computePvPFeeSplit(Number(m.bet), 2);
        acc.feeTotal += s.feeTotal;
        acc.development += s.development;
        acc.tournaments += s.tournaments;
        acc.marketing += s.marketing;
        acc.teamTotal += s.teamTotal;
        acc.levels.lvl1 += s.levels.lvl1;
        acc.levels.lvl2 += s.levels.lvl2;
        acc.levels.lvl3 += s.levels.lvl3;
        acc.levels.lvl4 += s.levels.lvl4;
        acc.levels.lvl5 += s.levels.lvl5;
        acc.count += 1;
        return acc;
      },
      { feeTotal: 0, development: 0, tournaments: 0, marketing: 0, teamTotal: 0, levels: { lvl1: 0, lvl2: 0, lvl3: 0, lvl4: 0, lvl5: 0 }, count: 0 }
    );
    return { harvest: fallbackHarvest, chase: sumTreasuryLedger([]), cockfight: sumTreasuryLedger([]), total: fallbackHarvest };
  }, [history]);

  // Lógica de Jackpot: 20% do Fundo de Torneios
  const jackpotPool = sources.total.tournaments * 0.4; // 40% do fundo de torneio vai pro jackpot
  const weeklyPoints = Number(localStorage.getItem('farm_harvest_weekly_points')) || 0;
  
  // Simulação de Ranking: Coloca o usuário em uma posição baseada nos pontos
  const allPlayers = [...LEADERBOARD_MOCK].map(p => ({ ...p, type: 'BOT' }));
  allPlayers.push({ id: 'user', name: t('cockfight_you'), avatar: '👨‍🌾', harvestRating: weeklyPoints, type: 'USER' });
  
  const sortedRanking = allPlayers.sort((a, b) => b.harvestRating - a.harvestRating);
  const userRank = sortedRanking.findIndex(p => p.id === 'user') + 1;
  const topPlayers = sortedRanking.slice(0, 10);
  const isEligible = userRank <= 10 && weeklyPoints > 0;

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto animate-in slide-in-from-right-10 duration-500 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-8">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner shrink-0">
            <Landmark size={28} />
          </div>
          <div className="min-w-0">
            <h2 className="text-2xl font-black text-slate-800 leading-none truncate">{t('harvest_treasury_title')}</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1 truncate">{t('harvest_treasury_subtitle')}</p>
          </div>
        </div>
        <button onClick={onBack} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors shrink-0">
          <X className="w-5 h-5 text-slate-700" />
        </button>
      </div>

      {/* JACKPOT SEMANAL - NOVO */}
      <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden mb-8 border-4 border-indigo-500/30">
        <div className="absolute top-0 right-0 p-4 opacity-20 rotate-12">
          <Stars size={120} />
        </div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="bg-amber-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg animate-pulse">
                {t('harvest_weekly_jackpot')} 🎰
              </span>
              <h3 className="text-3xl font-black mt-3 flex items-center gap-3">
                <span className="text-amber-400 text-4xl">💰</span>
                {jackpotPool.toFixed(0)}
              </h3>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-indigo-300 text-[10px] font-black uppercase tracking-widest mb-1">
                <Timer size={14} /> {t('harvest_next_draw')}
              </div>
              <div className="text-lg font-black text-white">{t('harvest_draw_date')}</div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <Trophy size={18} className="text-amber-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">{t('harvest_candidates')}</span>
            </div>
            
            <div className="grid grid-cols-5 gap-2">
              {topPlayers.map((player, idx) => (
                <div key={player.id} className="relative group">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl border-2 transition-all ${player.type === 'USER' ? 'bg-green-500/20 border-green-500 scale-110 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : (idx === 0 ? 'bg-amber-500/20 border-amber-500' : 'bg-white/5 border-white/20')}`}>
                    {player.avatar}
                  </div>
                  <div className={`absolute -top-1 -right-1 text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white/20 ${player.type === 'USER' ? 'bg-green-500' : 'bg-indigo-500'}`}>
                    {idx + 1}
                  </div>
                  {player.type === 'USER' && (
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[7px] font-black text-green-400 uppercase whitespace-nowrap">{t('cockfight_you')}</div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-8 flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
              <div>
                <div className="text-[8px] font-black text-indigo-300 uppercase">{t('harvest_your_score')}</div>
                <div className="text-sm font-black text-white">{weeklyPoints} pts</div>
              </div>
              <div className="text-right">
                <div className="text-[8px] font-black text-indigo-300 uppercase">{t('ranking_your_position')}</div>
                <div className={`text-sm font-black ${isEligible ? 'text-green-400' : 'text-white'}`}>#{userRank}</div>
              </div>
            </div>

            <p className="text-[9px] text-indigo-300 font-bold mt-4 leading-tight italic">
              * {isEligible ? t('harvest_qualified') : t('harvest_not_qualified')}
            </p>
          </div>
        </div>
      </div>

      {/* Main Stats Card */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 mb-8 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-48 h-48 bg-slate-50 rounded-full blur-3xl" />
        <div className="relative z-10 text-center">
          <span className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] mb-2 block">{t('harvest_total_tax_balance')}</span>
          <div className="text-6xl font-black text-slate-800 flex items-center justify-center gap-3">
            <span className="text-3xl text-amber-500">💰</span>
            {sources.total.feeTotal}
          </div>
          <div className="mt-2 text-xs font-bold text-slate-500">{t('minigame_total_matches') || 'Partidas consideradas'}: {sources.total.count}</div>
        </div>
      </div>

      {/* Distribution Grid */}
      <div className="grid grid-cols-1 gap-4 mb-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Trophy size={24} />
            </div>
            <div>
              <div className="font-black text-slate-800">{t('harvest_tournament_fund')}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">{t('minigame_treasury_tournaments_rule') || '50% do pool'}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-black text-blue-600">+{sources.total.tournaments}</div>
            <div className="text-[10px] font-black text-slate-300 uppercase">{t('harvest_available')}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-pink-50 text-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Megaphone size={24} />
            </div>
            <div>
              <div className="font-black text-slate-800">{t('harvest_marketing_fund')}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">{t('minigame_treasury_marketing_rule') || '30% do pool'}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-black text-pink-600">+{sources.total.marketing}</div>
            <div className="text-[10px] font-black text-slate-300 uppercase">{t('harvest_in_use')}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Code size={24} />
            </div>
            <div>
              <div className="font-black text-slate-800">{t('harvest_development_fund')}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">{t('minigame_treasury_development_rule') || '50% da taxa'}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-black text-indigo-600">+{sources.total.development}</div>
            <div className="text-[10px] font-black text-slate-300 uppercase">{t('harvest_allocated')}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-2xl flex items-center justify-center">
                <Users2 size={24} />
              </div>
              <div>
                <div className="font-black text-slate-800">{t('minigame_team_fund') || 'Time (Unilevel)'}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">{t('minigame_treasury_team_rule') || '20% do pool'}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-black text-amber-700">+{sources.total.teamTotal}</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-bold text-slate-600">
            <div className="bg-slate-50 rounded-2xl p-3 flex justify-between"><span>N1</span><span>+{sources.total.levels.lvl1}</span></div>
            <div className="bg-slate-50 rounded-2xl p-3 flex justify-between"><span>N2</span><span>+{sources.total.levels.lvl2}</span></div>
            <div className="bg-slate-50 rounded-2xl p-3 flex justify-between"><span>N3</span><span>+{sources.total.levels.lvl3}</span></div>
            <div className="bg-slate-50 rounded-2xl p-3 flex justify-between"><span>N4</span><span>+{sources.total.levels.lvl4}</span></div>
            <div className="bg-slate-50 rounded-2xl p-3 flex justify-between col-span-2"><span>N5</span><span>+{sources.total.levels.lvl5}</span></div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-100 p-6 rounded-[2rem] flex gap-4 mb-8">
        <Info className="text-blue-500 shrink-0" size={24} />
        <div>
          <h4 className="font-black text-blue-800 text-sm uppercase mb-1">{t('harvest_how_taxes_work')}</h4>
          <p className="text-blue-700 text-xs font-medium leading-relaxed">
            {t('harvest_how_taxes_work_desc') || t('minigame_treasury_rules_hint')}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 mb-8">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{t('minigame_treasury_sources') || 'Fontes (PvP)'}</div>
        <div className="flex justify-between text-xs font-black text-slate-700 py-2 border-b border-slate-100">
          <span>{t('harvest_treasury_source_harvest') || 'Harvest PvP (Colheita)'}</span>
          <span>+{sources.harvest.feeTotal}</span>
        </div>
        <div className="flex justify-between text-xs font-black text-slate-700 py-2 border-b border-slate-100">
          <span>{t('minigame_treasury_source_doors') || 'Pega-Galinha PvP (12 portas)'}</span>
          <span>+{sources.chase.feeTotal}</span>
        </div>
        <div className="flex justify-between text-xs font-black text-slate-700 py-2">
          <span>{t('minigame_treasury_source_cockfight') || 'Cockfight (Rinha)'}</span>
          <span>+{sources.cockfight.feeTotal}</span>
        </div>
      </div>

      {/* Histórico de Jackpot - NOVO */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">{t('harvest_last_jackpot_winners')}</h4>
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 divide-y divide-slate-50">
          {[
            { date: '25/01', winner: 'RichDuck', prize: 4500, avatar: '🦆' },
            { date: '18/01', winner: 'ReiDoOvo', prize: 3800, avatar: '👑' },
            { date: '11/01', winner: 'LuckyHen', prize: 2900, avatar: '🐔' }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-3 px-2 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <span className="text-slate-300 font-bold text-[10px]">{item.date}</span>
                <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-sm border border-slate-100">
                  {item.avatar}
                </div>
                <span className="font-black text-slate-700 text-xs">{item.winner}</span>
              </div>
              <div className="font-black text-green-600 text-xs">+{item.prize} 💰</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HarvestTreasury;
