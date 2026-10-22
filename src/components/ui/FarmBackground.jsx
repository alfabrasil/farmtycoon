import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { SKINS_CONFIG } from '../../data/gameConfig';

const STARS = [
  [8, 6], [16, 14], [24, 5], [33, 12], [41, 7], [52, 15],
  [61, 4], [70, 11], [78, 6], [88, 13], [14, 22], [47, 20], [93, 8],
];

const RAIN = [6, 14, 23, 37, 48, 58, 69, 81, 90, 96];

const BLADES = [
  [8, '0s'], [18, '-1s'], [31, '-0.4s'], [44, '-1.6s'],
  [57, '-0.8s'], [70, '-2s'], [83, '-0.2s'], [92, '-1.3s'],
];

const FarmBackground = ({ isNight, weather, skinId = 'DEFAULT' }) => {
  const skin = SKINS_CONFIG[skinId] || SKINS_CONFIG.DEFAULT;
  const rainy = weather === 'RAINY';
  const classic = skin.id === 'DEFAULT';

  return (
    <div className={`farm-bg fixed inset-0 z-0 pointer-events-none overflow-hidden font-sans transition-colors duration-1000 ${isNight ? 'is-night bg-slate-900' : rainy ? 'is-rain bg-slate-400' : ''}`}>
      <div className={`absolute inset-0 transition-opacity duration-1000 ${isNight ? 'opacity-0' : 'opacity-100'} ${rainy ? 'bg-gradient-to-b from-slate-600 via-slate-400 to-slate-300' : `bg-gradient-to-b ${skin.skyDay} to-white`}`}></div>
      <div className={`absolute inset-0 transition-opacity duration-1000 ${isNight ? 'opacity-100' : 'opacity-0'} bg-gradient-to-b ${skin.skyNight} via-slate-800 to-black`}></div>

      <div className="farm-stars" aria-hidden="true">
        {STARS.map(([left, top], i) => (
          <span key={i} className={`farm-star${i % 4 === 0 ? ' lg' : ''}`} style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${-i * 0.4}s` }} />
        ))}
      </div>

      <div className={`absolute top-10 right-10 text-yellow-400 transition-all duration-1000 ${isNight || rainy ? 'translate-y-96 opacity-0' : 'translate-y-0 opacity-100'}`}>
        <Sun size={80} fill="currentColor" className="opacity-80" />
      </div>
      <div className={`absolute top-10 right-10 text-slate-200 transition-all duration-1000 ${isNight ? 'translate-y-0 opacity-100' : '-translate-y-32 opacity-0'}`}>
        <Moon size={60} fill="currentColor" />
      </div>

      {skin.id !== 'CYBER' && (
        <>
          <div className="farm-cloud farm-cloud-a" />
          <div className="farm-cloud farm-cloud-b" />
          <div className="farm-cloud farm-cloud-c" />
        </>
      )}
      {RAIN.map((left, i) => (
        <span key={left} className="farm-drop" style={{ left: `${left}%`, animationDelay: `${-i * 0.35}s`, animationDuration: `${2 + (i % 3) * 0.4}s` }} />
      ))}

      <div className={`farm-hill absolute bottom-0 w-full h-1/3 rounded-t-[50%_20%] scale-110 transition-colors duration-1000 bg-gradient-to-t ${skin.groundFrom} ${skin.groundTo} ${isNight ? 'brightness-50' : ''}`}>
        {classic && BLADES.map(([left, delay]) => (
          <span key={left} className="farm-blade" style={{ left: `${left}%`, animationDelay: delay }} />
        ))}
      </div>

      {classic ? <ClassicFarm /> : (
        <div className="farm-emoji absolute bottom-[28%] w-full flex justify-between px-10 opacity-80 text-4xl">
          {skin.id === 'DESERT' ? <><span className="transform -scale-x-100">🌵</span><span>🚜</span><span className="hidden md:inline">⛺</span><span>🌵</span></> :
           skin.id === 'SNOW' ? <><span className="transform -scale-x-100">🌲</span><span>❄️</span><span className="hidden md:inline">🏠</span><span>⛄</span></> :
           <><span className="transform -scale-x-100">🏙️</span><span>🏎️</span><span className="hidden md:inline">🏢</span><span>📡</span></>}
        </div>
      )}
    </div>
  );
};

function GrazingCow({ className }) {
  return (
    <svg className={className} width="56" height="36" viewBox="0 0 56 36">
      <ellipse cx="28" cy="34" rx="14" ry="1.6" fill="rgba(0,0,0,0.12)" />
      <g className="farm-cow-tail"><path d="M8 16 Q4 22 7 26" fill="none" stroke="#44403c" strokeWidth="1.6" strokeLinecap="round" /></g>
      <ellipse cx="26" cy="20" rx="14" ry="8" fill="#fafaf9" />
      <ellipse cx="20" cy="18" rx="4" ry="3" fill="#44403c" />
      <ellipse cx="30" cy="22" rx="3" ry="2.4" fill="#44403c" />
      <rect x="16" y="26" width="3" height="7" rx="1" fill="#e7e5e4" />
      <rect x="32" y="26" width="3" height="7" rx="1" fill="#e7e5e4" />
      <g className="farm-cow-head">
        <ellipse cx="42" cy="16" rx="7" ry="5.5" fill="#fafaf9" />
        <ellipse cx="40" cy="8" rx="1.4" ry="3" fill="#d6d3d1" />
        <ellipse cx="46" cy="8" rx="1.4" ry="3" fill="#d6d3d1" />
        <ellipse cx="47" cy="17" rx="2.2" ry="1.6" fill="#fda4af" />
        <circle cx="44" cy="14" r="0.7" fill="#1c1917" />
      </g>
    </svg>
  );
}

function ClassicFarm() {
  return (
    <div className="farm-stage" aria-hidden="true">
      <svg className="farm-tree farm-tree-l" width="46" height="68" viewBox="0 0 46 68">
        <rect x="20" y="46" width="6" height="18" rx="1" fill="#78350f" />
        <polygon points="23,4 40,48 6,48" fill="#15803d" stroke="#14532d" strokeWidth="1.5" />
        <polygon points="23,20 36,48 10,48" fill="#22c55e" />
      </svg>

      <svg className="farm-crops" width="128" height="56" viewBox="0 0 128 56">
        {[12, 32, 52, 72, 92, 112].map((x, i) => (
          <g key={x} className="farm-stalk" style={{ animationDelay: `${-i * 0.35}s` }}>
            <path d={`M${x} 54 C${x - 4} 34 ${x + 6} 22 ${x} 8`} fill="none" stroke="#65a30d" strokeWidth="2.6" />
            <ellipse cx={x} cy="10" rx="5" ry="8" fill="#eab308" />
          </g>
        ))}
      </svg>

      <div className="farm-day-life">
      <GrazingCow className="farm-cow-near" />

      <svg className="farm-dog" width="40" height="28" viewBox="0 0 40 28">
        <ellipse cx="20" cy="26" rx="10" ry="1.6" fill="rgba(0,0,0,0.12)" />
        <g className="farm-tail"><path d="M6 14 Q1 8 4 5" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round" /></g>
        <ellipse cx="18" cy="16" rx="10" ry="6" fill="#d97706" />
        <circle cx="28" cy="12" r="5" fill="#f59e0b" />
        <ellipse cx="26" cy="8" rx="2" ry="3.5" fill="#92400e" />
        <circle cx="30" cy="11" r="0.8" fill="#1c1917" />
        <ellipse cx="12" cy="21" rx="2" ry="3" fill="#92400e" />
        <ellipse cx="24" cy="21" rx="2" ry="3" fill="#92400e" />
      </svg>

      <svg className="farm-hen farm-hen-a" width="30" height="28" viewBox="0 0 30 28">
        <ellipse cx="15" cy="26" rx="8" ry="1.5" fill="rgba(0,0,0,0.12)" />
        <g className="farm-hen-wing"><ellipse cx="17" cy="16" rx="6" ry="3.5" fill="#c2410c" /></g>
        <ellipse cx="14" cy="16" rx="8" ry="6" fill="#ea580c" />
        <circle cx="22" cy="12" r="4" fill="#fb923c" />
        <polygon points="20,6 22,2 24,6" fill="#dc2626" />
        <polygon points="25,12 29,13 25,14" fill="#facc15" />
        <circle cx="23" cy="11" r="0.7" fill="#1c1917" />
      </svg>
      <svg className="farm-hen farm-hen-b" width="26" height="24" viewBox="0 0 30 28">
        <ellipse cx="15" cy="26" rx="8" ry="1.5" fill="rgba(0,0,0,0.12)" />
        <g className="farm-hen-wing"><ellipse cx="17" cy="16" rx="6" ry="3.5" fill="#9a3412" /></g>
        <ellipse cx="14" cy="16" rx="8" ry="6" fill="#c2410c" />
        <circle cx="22" cy="12" r="4" fill="#ea580c" />
        <polygon points="20,6 22,2 24,6" fill="#dc2626" />
        <polygon points="25,12 29,13 25,14" fill="#facc15" />
        <circle cx="23" cy="11" r="0.7" fill="#1c1917" />
      </svg>

      <GrazingCow className="farm-cow" />
      </div>

      <svg className="farm-flowers" width="70" height="34" viewBox="0 0 70 34">
        {[[8, '#f472b6', '#fb7185'], [24, '#facc15', '#f59e0b'], [40, '#c084fc', '#e879f9'], [56, '#fff', '#fecdd3']].map(([x, petal, heart], i) => (
          <g key={x} className="farm-flower" style={{ animationDelay: `${-i * 0.4}s` }}>
            <path d={`M${x} 32 L${x} 16`} stroke="#16a34a" strokeWidth="1.6" />
            <circle cx={x} cy="14" r="3.2" fill={petal} />
            <circle cx={x - 3.2} cy="16" r="2.6" fill={petal} />
            <circle cx={x + 3.2} cy="16" r="2.6" fill={petal} />
            <circle cx={x} cy="18" r="2.4" fill={petal} />
            <circle cx={x} cy="15.5" r="1.5" fill={heart} />
          </g>
        ))}
      </svg>

      <svg className="farm-house" width="58" height="52" viewBox="0 0 58 52">
        <ellipse cx="29" cy="50" rx="16" ry="2" fill="rgba(0,0,0,0.12)" />
        <polygon points="29,4 54,26 4,26" fill="#b91c1c" />
        <rect x="12" y="24" width="34" height="24" fill="#fef3c7" stroke="#fcd34d" strokeWidth="1" />
        <rect x="24" y="34" width="10" height="14" fill="#92400e" />
        <rect className="farm-window" x="16" y="30" width="7" height="7" rx="1" />
        <rect className="farm-window" x="36" y="30" width="7" height="7" rx="1" />
      </svg>

      <svg className="farm-tree farm-tree-r" width="46" height="68" viewBox="0 0 46 68">
        <rect x="20" y="46" width="6" height="18" rx="1" fill="#78350f" />
        <polygon points="23,4 40,48 6,48" fill="#166534" stroke="#14532d" strokeWidth="1.5" />
        <polygon points="23,22 35,48 11,48" fill="#16a34a" />
      </svg>

      <div className="farm-day-life">
      <svg className="farm-tractor" width="74" height="40" viewBox="0 0 74 40">
        <rect x="22" y="14" width="36" height="12" rx="2" fill="#dc2626" />
        <rect x="36" y="6" width="16" height="10" rx="1.5" fill="#b91c1c" />
        <rect x="39" y="8" width="8" height="5" fill="#bfdbfe" />
        <rect x="18" y="16" width="8" height="4" fill="#991b1b" />
        <circle className="farm-headlight" cx="58" cy="18" r="2" fill="#fde68a" />
        <g className="farm-wheel">
          <circle cx="28" cy="28" r="7" fill="#1c1917" />
          <circle cx="28" cy="28" r="2.5" fill="#a8a29e" />
        </g>
        <g className="farm-wheel">
          <circle cx="54" cy="28" r="7" fill="#1c1917" />
          <circle cx="54" cy="28" r="2.5" fill="#a8a29e" />
        </g>
      </svg>
      </div>
      <NightLife />
    </div>
  );
}

const FIREFLIES = [
  [16, 46], [22, 68], [34, 40], [44, 62], [58, 34], [66, 58], [76, 42], [84, 64],
];

function NightLife() {
  return (
    <div className="farm-night-life" aria-hidden="true">
      <Owl className="farm-owl farm-owl-l" />
      <Owl className="farm-owl farm-owl-r" />
      <svg className="farm-fox farm-fox-sit" width="42" height="26" viewBox="0 0 48 30">
        <FoxShape />
      </svg>
      <svg className="farm-fox" width="50" height="30" viewBox="0 0 48 30">
        <FoxShape />
      </svg>
      {FIREFLIES.map(([left, bottom], i) => (
        <span key={left} className="farm-firefly" style={{ left: `${left}%`, bottom, animationDelay: `${-i * 0.7}s` }} />
      ))}
    </div>
  );
}

function Owl({ className }) {
  return (
    <svg className={className} width="28" height="30" viewBox="0 0 28 30">
      <polygon points="8,9 5,1 12,8" fill="#78350f" />
      <polygon points="20,9 23,1 16,8" fill="#78350f" />
      <ellipse cx="14" cy="17" rx="9" ry="10" fill="#9a3412" />
      <ellipse cx="14" cy="19" rx="5" ry="6" fill="#fdba74" />
      <g className="farm-owl-eye">
        <circle cx="10" cy="15" r="3.1" fill="#fef9c3" />
        <circle cx="10.5" cy="15.3" r="1.4" fill="#1c1917" />
      </g>
      <g className="farm-owl-eye">
        <circle cx="18" cy="15" r="3.1" fill="#fef9c3" />
        <circle cx="17.5" cy="15.3" r="1.4" fill="#1c1917" />
      </g>
      <polygon points="14,17.5 12.4,20 15.6,20" fill="#f59e0b" />
    </svg>
  );
}

function FoxShape() {
  return (
    <>
      <ellipse cx="24" cy="28" rx="12" ry="1.5" fill="rgba(0,0,0,0.18)" />
      <g className="farm-fox-tail"><path d="M10 16 Q2 10 6 4 Q10 10 12 14" fill="#c2410c" /></g>
      <ellipse cx="24" cy="18" rx="12" ry="6" fill="#ea580c" />
      <ellipse cx="26" cy="20" rx="6" ry="3" fill="#ffedd5" />
      <polygon points="34,16 46,14 36,22" fill="#ea580c" />
      <polygon points="40,12 43,5 36,13" fill="#9a3412" />
      <polygon points="44,13 47,7 40,14" fill="#c2410c" />
      <circle cx="40" cy="15" r="0.9" fill="#1c1917" />
      <ellipse cx="18" cy="23" rx="2" ry="3" fill="#9a3412" />
      <ellipse cx="30" cy="23" rx="2" ry="3" fill="#9a3412" />
    </>
  );
}

export default FarmBackground;
