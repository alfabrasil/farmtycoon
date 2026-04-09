import React, { useMemo } from 'react';
import { Landmark, Trophy, Megaphone, Code, Users2, X, Info } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { computePvPFeeSplit, filterLedgerBySource, loadTreasuryLedger, sumTreasuryLedger } from '../../../utils/treasuryLedger';

const MinigameTreasury = ({ onBack }) => {
  const { t } = useLanguage();

  const data = useMemo(() => {
    const ledger = loadTreasuryLedger();
    const chaseEntries = filterLedgerBySource(ledger, 'CHASE_PVP');
    const cockfightEntries = filterLedgerBySource(ledger, 'COCKFIGHT_PVP');
    const chase = sumTreasuryLedger(chaseEntries);
    const cockfight = sumTreasuryLedger(cockfightEntries);
    const total = sumTreasuryLedger(ledger);
    return { chase, cockfight, total, ledgerCount: (ledger || []).length };
  }, []);

  return (
    <div className="px-3 sm:px-4 pb-24 max-w-2xl mx-auto animate-in slide-in-from-right-10 duration-300">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center shrink-0">
            <Landmark size={24} />
          </div>
          <div className="min-w-0">
            <div className="text-slate-800 font-black text-lg truncate">{t('minigame_treasury_title') || 'Tesouraria do Minigame'}</div>
            <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{t('minigame_treasury_subtitle') || 'Transparência das taxas PvP'}</div>
          </div>
        </div>
        <button onClick={onBack} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
          <X className="w-5 h-5 text-slate-700" />
        </button>
      </div>

      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mb-4">
        <div className="text-center">
          <div className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em]">{t('minigame_total_fees') || 'Saldo total de taxas (PvP)'}</div>
          <div className="mt-2 text-5xl font-black text-slate-800 flex items-center justify-center gap-2">
            <span className="text-3xl text-amber-500">💰</span>
            {data.total.feeTotal}
          </div>
          <div className="mt-2 text-xs font-bold text-slate-500">{t('minigame_total_matches') || 'Partidas consideradas'}: {data.total.count}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 mb-5">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <Trophy size={22} />
            </div>
            <div>
              <div className="font-black text-slate-800">{t('harvest_tournament_fund') || 'Fundo de Torneios'}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">{t('minigame_treasury_tournaments_rule') || '50% do pool (5%)'}</div>
            </div>
          </div>
          <div className="text-xl font-black text-blue-600">+{data.total.tournaments}</div>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center">
              <Megaphone size={22} />
            </div>
            <div>
              <div className="font-black text-slate-800">{t('harvest_marketing_fund') || 'Fundo de Marketing'}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">{t('minigame_treasury_marketing_rule') || '30% do pool (5%)'}</div>
            </div>
          </div>
          <div className="text-xl font-black text-pink-600">+{data.total.marketing}</div>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
              <Code size={22} />
            </div>
            <div>
              <div className="font-black text-slate-800">{t('harvest_development_fund') || 'Fundo de Desenvolvimento'}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">{t('minigame_treasury_development_rule') || '50% da taxa (10%)'}</div>
            </div>
          </div>
          <div className="text-xl font-black text-emerald-600">+{data.total.development}</div>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-amber-50 text-amber-700 rounded-2xl flex items-center justify-center">
                <Users2 size={22} />
              </div>
              <div>
                <div className="font-black text-slate-800">{t('minigame_team_fund') || 'Time (Unilevel)'}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">{t('minigame_treasury_team_rule') || '20% do pool (5%)'}</div>
              </div>
            </div>
            <div className="text-xl font-black text-amber-700">+{data.total.teamTotal}</div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-bold text-slate-600">
            <div className="bg-slate-50 rounded-2xl p-3 flex justify-between"><span>N1</span><span>+{data.total.levels.lvl1}</span></div>
            <div className="bg-slate-50 rounded-2xl p-3 flex justify-between"><span>N2</span><span>+{data.total.levels.lvl2}</span></div>
            <div className="bg-slate-50 rounded-2xl p-3 flex justify-between"><span>N3</span><span>+{data.total.levels.lvl3}</span></div>
            <div className="bg-slate-50 rounded-2xl p-3 flex justify-between"><span>N4</span><span>+{data.total.levels.lvl4}</span></div>
            <div className="bg-slate-50 rounded-2xl p-3 flex justify-between col-span-2"><span>N5</span><span>+{data.total.levels.lvl5}</span></div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-3xl p-4 flex gap-3">
        <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
          <Info size={20} />
        </div>
        <div className="text-xs font-bold text-blue-900/80 leading-relaxed">
          {t('minigame_treasury_rules_hint') || 'Regras: em PvP, a taxa é 10% de cada jogador (20% do pote). Metade da taxa vai para Desenvolvimento; a outra metade forma o pool: 50% Torneios, 30% Marketing e 20% Time (Unilevel 10/5/2/2/1).'}
        </div>
      </div>

      <div className="mt-5 bg-white rounded-3xl p-4 border border-slate-100 shadow-sm">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{t('minigame_treasury_sources') || 'Fontes (PvP)'}</div>
        <div className="flex justify-between text-xs font-black text-slate-700 py-2 border-b border-slate-100">
          <span>{t('minigame_treasury_source_doors') || 'Pega-Galinha PvP (12 portas)'}</span>
          <span>+{data.chase.feeTotal}</span>
        </div>
        <div className="flex justify-between text-xs font-black text-slate-700 py-2">
          <span>{t('minigame_treasury_source_cockfight') || 'Cockfight (Rinha)'}</span>
          <span>+{data.cockfight.feeTotal}</span>
        </div>
      </div>
    </div>
  );
};

export default MinigameTreasury;
