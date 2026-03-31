import React from 'react';
import { Swords } from 'lucide-react';

const BattleTopBar = ({
  battleTitle,
  arenaBadgeClass,
  arenaIcon,
  arenaName,
  arenaBonusPct,
  isAuto,
  onToggleAuto,
  isFx,
  onToggleFx,
  onExit,
  exitLabel,
  autoLabel,
  fxLabel
}) => {
  return (
    <div className="flex flex-col gap-2 p-2 sm:p-4 bg-black/50 backdrop-blur-md z-10">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-white font-black text-xs sm:text-sm whitespace-nowrap">
          <Swords className="text-red-500 shrink-0" /> {battleTitle}
        </div>
        <div className="flex gap-2 shrink-0">
          {onExit && (
            <button
              onClick={onExit}
              className="px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-black transition-colors bg-slate-800 text-white hover:bg-slate-700 whitespace-nowrap"
            >
              {exitLabel}
            </button>
          )}
          {onToggleFx && (
            <button
              onClick={onToggleFx}
              className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-black transition-colors whitespace-nowrap ${isFx ? 'bg-emerald-500 text-black' : 'bg-slate-700 text-white'}`}
            >
              {fxLabel}
            </button>
          )}
          <button
            onClick={onToggleAuto}
            className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-black transition-colors whitespace-nowrap ${isAuto ? 'bg-yellow-500 text-black' : 'bg-slate-700 text-white'}`}
          >
            {autoLabel}
          </button>
        </div>
      </div>
      <div className={`px-2 sm:px-3 py-1 rounded-full border text-[9px] sm:text-[10px] font-black uppercase ${arenaBadgeClass} max-w-full w-fit`}>
        <span className="mr-2">{arenaIcon}</span>
        <span className="inline-block align-bottom max-w-[220px] sm:max-w-none truncate">{arenaName}</span>
        <span className="ml-2 opacity-80">+{arenaBonusPct}%</span>
      </div>
    </div>
  );
};

export default BattleTopBar;
