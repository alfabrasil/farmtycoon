import React, { useEffect, useState } from 'react';
import { Globe, Youtube, Instagram, Facebook, Twitter } from 'lucide-react'; // Using Twitter for X, plus TikTok (we can use custom svg or lucide for it)
import { useLanguage } from '../../contexts/LanguageContext';

// Import images directly or use absolute/relative paths in Vite
import logoSolo from '../../../landingpage/logo_landing/logo_soloname_chicken.png';
import logoPool from '../../../landingpage/logo_landing/logo_pool_chicken.png';
import logoChi from '../../../landingpage/logo_landing/logo_chi.png';

// Characters - States
import sick from '../../../landingpage/characters/Galinha_Granja/gc_sick.png';
import hunger from '../../../landingpage/characters/Galinha_Granja/gc_hunger.png';
import angry from '../../../landingpage/characters/Galinha_Granja/gc_angry.png';
import fortune from '../../../landingpage/characters/Galinha_Granja/gc_fortune.png';
import happy from '../../../landingpage/characters/Galinha_Granja/gc_happy.png';
import sleeping from '../../../landingpage/characters/Galinha_Granja/gc_sleeping.png';

// Characters - Types
import caipira from '../../../landingpage/characters/Galinha_Caipira/gcap_happy.png';
import gigante from '../../../landingpage/characters/Galinha_Gigante/gg_happy.png';
import imperial from '../../../landingpage/characters/Galinha_Imperial/gi_happy.png';
import divina from '../../../landingpage/characters/Galinha_Divina/gd_happy.png';

// Mutants
import alienInsect from '../../../landingpage/characters/Alien_Galinha/alien_insect/a4_happy.png';
import alienTentacles from '../../../landingpage/characters/Alien_Galinha/alien_tentacles/a1_happy.png';
import alienLizard from '../../../landingpage/characters/Alien_Galinha/alien_lizard/a2_happy.png';
import alienCyber from '../../../landingpage/characters/Alien_Galinha/alien_cyber/a3_happy.png';

// Alien Addons
import alienThirdEye from '../../../landingpage/characters/Alien_Galinha/addon_alien/a4_3°eyers.png';
import alienHelmet from '../../../landingpage/characters/Alien_Galinha/addon_alien/a4_capacete.png';
import alienAntena from '../../../landingpage/characters/Alien_Galinha/addon_alien/a4_antena.png';
import alienTail from '../../../landingpage/characters/Alien_Galinha/addon_alien/a4_cauda.png';

import grifoLion from '../../../landingpage/characters/Grifo_Galinha/grifo_01/grifo_happy.png';
import grifoEagle from '../../../landingpage/characters/Grifo_Galinha/grifo_02/grifo2_happy.png';
import grifoGold from '../../../landingpage/characters/Grifo_Galinha/grifo_03/grifo3_happy.png';

import robotAero from '../../../landingpage/characters/Robot_Galinha/robot_aero/r2_happy.png';
import robotGears from '../../../landingpage/characters/Robot_Galinha/robot_gears/r1_happy.png';
import robotNeon from '../../../landingpage/characters/Robot_Galinha/robot_neon/r4_happy.png';
import robotHeavy from '../../../landingpage/characters/Robot_Galinha/robot_heavy/r3_happy.png';

// Robot Addons
import robotAntena from '../../../landingpage/characters/Robot_Galinha/addon_robot/robot_antena.png';
import robotBattery from '../../../landingpage/characters/Robot_Galinha/addon_robot/robot_bateria.png';
import robotGearsAddon from '../../../landingpage/characters/Robot_Galinha/addon_robot/robot_engrenagens.png';
import robotShield from '../../../landingpage/characters/Robot_Galinha/addon_robot/robot_escudo.png';

const LandingPageScreen = ({ onNavigate }) => {
  const { language, changeLanguage, t } = useLanguage();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [pvpColor, setPvpColor] = useState('green');

  const languages = [
    { code: 'pt', label: 'PT', flag: '🇧🇷' },
    { code: 'en', label: 'EN', flag: '🇺🇸' },
    { code: 'es', label: 'ES', flag: '🇪🇸' }
  ];

  const currentLangObj = languages.find(l => l.code === language) || languages[0];
  const heroTitleParts = t('lp_hero_title').split('\n');
  const spinTitleParts = t('lp_actions_spin_title').split('\n');

  return (
    <div className="min-h-screen font-sans text-white overflow-x-hidden relative bg-gradient-to-b from-sky-400 via-sky-300 to-sky-200">
      {/* BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 h-[45%] bg-gradient-to-b from-green-500 to-green-700 z-10"></div>
        <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-[140%] h-[40%] rounded-[100%] bg-green-500 z-10"></div>
        <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[160%] h-[40%] rounded-[100%] bg-green-600 z-10"></div>
        
        {/* Clouds */}
        <div className="absolute top-20 left-10 w-24 h-10 bg-white/80 rounded-full blur-[2px]"></div>
        <div className="absolute top-24 left-24 w-14 h-8 bg-white/80 rounded-full blur-[2px]"></div>
        <div className="absolute top-14 right-24 w-28 h-12 bg-white/70 rounded-full blur-[2px]"></div>
        <div className="absolute top-20 right-10 w-16 h-9 bg-white/70 rounded-full blur-[2px]"></div>
        <div className="absolute top-24 right-16 w-12 h-7 bg-white/70 rounded-full blur-[2px]"></div>
        
        {/* Emojis on Ground */}
        <div className="absolute bottom-[35%] left-[18%] text-4xl opacity-90 drop-shadow-md z-20">🚜</div>
        <div className="absolute bottom-[38%] left-1/2 -translate-x-1/2 text-4xl opacity-90 drop-shadow-md z-20">🏠</div>
        <div className="absolute bottom-[38%] right-[18%] text-4xl opacity-90 drop-shadow-md z-20">🌲</div>
        <div className="absolute bottom-[32%] right-[10%] text-4xl opacity-90 drop-shadow-md z-20">🌲</div>
      </div>
      
      {/* CONTENT CONTAINER - needs z-10 to stay above fixed background */}
      <div className="relative z-10">
        {/* HEADER */}
      <header className="fixed top-0 w-full bg-black/10 backdrop-blur-md z-50 px-4 md:px-8 py-3 sm:py-4 flex justify-between items-center border-b border-white/10">
        <div className="bg-white/10 rounded-2xl px-3 py-2 border border-white/15 shadow-lg">
          <img src={logoSolo} alt="Pool Chicken" className="h-12 sm:h-14 md:h-16 lg:h-20 object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.35)]" />
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-wrap justify-end">
          <button onClick={() => onNavigate('AUTH')} className="font-bold hover:text-yellow-400 transition-colors text-sm sm:text-base">{t('lp_nav_login')}</button>
          <button onClick={() => onNavigate('REGISTER')} className="bg-[#008c45] hover:bg-[#007036] border-2 border-white/20 px-3 sm:px-4 py-2 rounded-xl font-bold shadow-md transition-all active:scale-95 text-sm sm:text-base">{t('lp_nav_register')}</button>
          
          <div className="relative">
            <button 
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-2 bg-white text-slate-800 px-3 py-2 rounded-xl font-bold shadow-md text-sm sm:text-base"
            >
              <Globe size={16} /> {currentLangObj.label}
            </button>
            {showLangMenu && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-2xl border-2 border-slate-100 p-2 min-w-[120px] flex flex-col gap-1">
                {languages.map((lang) => (
                  <button
                    key={`lang-${lang.code}`}
                    onClick={() => { changeLanguage(lang.code); setShowLangMenu(false); }}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg font-bold text-sm transition-all ${language === lang.code ? 'bg-green-100 text-green-700' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <span>{lang.flag}</span> {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="pt-32 pb-16 px-4 md:px-8 max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8 relative">
        <div className="flex-1 space-y-6 z-10">
          <div className="inline-flex items-center gap-2 bg-black/20 rounded-full px-4 py-2 text-sm font-bold border border-white/10">
            <img src={logoPool} alt="Egg" className="w-6 h-6 object-contain" />
            {t('lp_badge_bonus')}
            <img src={logoChi} alt="CHI" className="w-6 h-6 object-contain" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black leading-tight drop-shadow-lg">
            {heroTitleParts.map((part, idx) => (
              <React.Fragment key={`hero-title-${idx}`}>
                {part}
                {idx < heroTitleParts.length - 1 && <br />}
              </React.Fragment>
            ))}
          </h1>
          
          <p className="text-lg md:text-xl font-medium text-green-50 max-w-lg drop-shadow-md">
            {t('lp_hero_desc')}
          </p>
          
          <div className="flex flex-wrap gap-4 pt-4">
            <button onClick={() => onNavigate('AUTH')} className="bg-[#128a45] hover:bg-[#0f753a] border-b-4 border-[#0a542a] px-8 py-4 rounded-2xl font-black text-xl shadow-xl transition-all active:translate-y-1 active:border-b-0 flex items-center gap-2">
              <img src={logoPool} alt="Egg" className="w-6 h-6" />
              {t('lp_cta_start_now')}
            </button>
            <div className="flex items-center gap-2 bg-black/20 rounded-2xl px-6 py-4 border border-white/10 font-bold">
              <img src={logoChi} alt="CHI" className="w-6 h-6" />
              {t('lp_conversion')}
            </div>
          </div>
        </div>
        
        <div className="flex-1 relative flex justify-center z-10">
          <img src={happy} alt="Galinha Feliz" className="w-64 md:w-96 object-contain drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)] animate-[bounce_4s_infinite]" />
        </div>
        
        {/* Background elements */}
        <div className="absolute top-20 right-10 text-yellow-300 opacity-50 text-6xl animate-pulse">☀️</div>
      </section>

      {/* STATES SECTION */}
      <section className="bg-[#148e48] py-12 px-4 relative border-y-4 border-[#0f753a]">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-xl md:text-2xl font-black mb-8 flex items-center justify-center gap-4 drop-shadow-md">
            {t('lp_states_heading')}
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {[
              { img: sick, label: t('lp_state_sick') },
              { img: hunger, label: t('lp_state_hunger') },
              { img: angry, label: t('lp_state_angry') },
              { img: fortune, label: t('lp_state_fortune') },
              { img: happy, label: t('lp_state_happy') },
              { img: sleeping, label: t('lp_state_sleeping') },
            ].map((state, i) => (
              <div key={i} className="bg-[#0b6b3a] border-2 border-[#1fa158] rounded-2xl p-4 flex flex-col items-center gap-2 hover:scale-105 transition-transform shadow-lg">
                <img src={state.img} alt={state.label} className="w-24 h-24 object-contain" />
                <span className="font-black text-sm">{state.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MECHANICS & FEATURES SECTION */}
      <section className="bg-[#0b6b3a] py-16 px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          
          {/* Top Row: Fox & Barn */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Fox Alert */}
            <div className="bg-[#128a45] p-6 rounded-3xl border-4 border-[#0f753a] shadow-xl text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
              <p className="font-bold text-green-100 mb-2">{t('lp_fox_warn')}</p>
              <h3 className="text-2xl font-black text-red-400 drop-shadow-md mb-4 flex items-center justify-center gap-2">
                {t('lp_fox_title')}
              </h3>
              <p className="font-black text-yellow-300 mb-6">{t('lp_fox_reward')}</p>
              <div className="bg-[#0a542a] p-4 rounded-xl">
                <p className="text-sm font-bold text-white mb-2">{t('lp_fox_quote')}</p>
                <div className="inline-block bg-[#008c45] border-2 border-yellow-400 text-yellow-300 font-black px-4 py-2 rounded-lg text-sm">
                  {t('lp_fox_offer')}
                </div>
              </div>
            </div>

            {/* Barn Info */}
            <div className="bg-[#128a45] p-6 rounded-3xl border-4 border-[#0f753a] shadow-xl text-center">
              <h3 className="text-xl font-black mb-4">{t('lp_barn_title')}</h3>
              <div className="flex justify-center gap-4 mb-4">
                <div className="bg-white text-slate-800 px-6 py-3 rounded-2xl font-black flex items-center gap-2 shadow-inner">
                  {t('lp_barn_feed')} <span className="text-slate-400 font-bold text-sm">5 / 20</span>
                </div>
                <div className="bg-white text-slate-800 px-6 py-3 rounded-2xl font-black flex items-center gap-2 shadow-inner">
                  {t('lp_barn_vaccine')} <span className="text-slate-400 font-bold text-sm">1 {t('lp_barn_dose')}</span>
                </div>
              </div>
              <p className="text-sm font-medium text-green-50 mb-6">
                {t('lp_barn_desc')}
              </p>
              <button onClick={() => onNavigate('AUTH')} className="bg-blue-500 hover:bg-blue-600 border-b-4 border-blue-700 px-8 py-3 rounded-xl font-black text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 mx-auto">
                {t('lp_shop')} <span className="text-blue-200">▶</span> {t('lp_items')}
              </button>
            </div>
          </div>

          {/* Bottom Row: Actions */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-[#0f753a] p-6 rounded-3xl border-2 border-[#1fa158] text-center shadow-lg hover:-translate-y-2 transition-transform">
              <h4 className="font-black text-yellow-300 mb-4 bg-black/20 py-1 rounded-lg">
                {spinTitleParts.map((part, idx) => (
                  <React.Fragment key={`spin-title-${idx}`}>
                    {part}
                    {idx < spinTitleParts.length - 1 && <br />}
                  </React.Fragment>
                ))}
              </h4>
              <div className="w-24 h-24 mx-auto bg-[conic-gradient(red,yellow,green,blue,purple,red)] rounded-full border-4 border-white mb-4 animate-[spin_10s_linear_infinite]"></div>
              <button onClick={() => onNavigate('AUTH')} className="w-full bg-purple-500 hover:bg-purple-600 font-black py-2 rounded-xl shadow-md border-b-4 border-purple-700">{t('lp_actions_spin_btn')}</button>
            </div>
            
            <div className="bg-[#0f753a] p-6 rounded-3xl border-2 border-[#1fa158] text-center shadow-lg hover:-translate-y-2 transition-transform">
              <h4 className="font-black mb-4">{t('lp_actions_buy_title')}</h4>
              <p className="text-sm font-bold text-green-200 mb-2">{t('lp_actions_coop_capacity')}</p>
              <p className="text-xs text-green-100 mb-4">{t('lp_actions_upgrade_in_shop')}</p>
              <button onClick={() => onNavigate('AUTH')} className="w-full bg-blue-500 hover:bg-blue-600 font-black py-2 rounded-xl shadow-md border-b-4 border-blue-700 text-sm">{t('lp_shop')} ▶ {t('lp_works')}</button>
            </div>

            <div className="bg-[#0f753a] p-6 rounded-3xl border-2 border-[#1fa158] text-center shadow-lg hover:-translate-y-2 transition-transform">
              <h4 className="font-black mb-4 text-purple-300">{t('lp_actions_silo_title')}</h4>
              <p className="text-sm font-bold text-green-200 mb-2">{t('lp_actions_silo_capacity')}</p>
              <p className="text-xs text-green-100 mb-4">{t('lp_actions_upgrade_in_shop')}</p>
              <button onClick={() => onNavigate('AUTH')} className="w-full bg-blue-500 hover:bg-blue-600 font-black py-2 rounded-xl shadow-md border-b-4 border-blue-700 text-sm">{t('lp_shop')} ▶ {t('lp_works')}</button>
            </div>

            <div className="bg-[#0f753a] p-6 rounded-3xl border-2 border-[#1fa158] text-center shadow-lg hover:-translate-y-2 transition-transform flex flex-col justify-between">
              <h4 className="font-black mb-2">{t('lp_actions_chicoin_title')}</h4>
              <p className="text-xs font-bold text-green-100 mb-4">{t('lp_actions_chicoin_desc')}</p>
              <div className="text-4xl mb-4">🎮</div>
              <button onClick={() => onNavigate('AUTH')} className="w-full bg-red-500 hover:bg-red-600 font-black py-2 rounded-xl shadow-md border-b-4 border-red-700 text-white">{t('lp_play')}</button>
            </div>
          </div>

        </div>
      </section>

      {/* CHICKEN TYPES SECTION */}
      <section className="bg-[#148e48] py-16 px-4 relative border-t-4 border-[#0f753a]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-12 drop-shadow-md">{t('lp_species_title')}</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
            {[
              { img: happy, name: t('lp_species_granja_name'), desc: t('lp_species_granja_desc'), price: '50' },
              { img: caipira, name: t('lp_species_caipira_name'), desc: t('lp_species_caipira_desc'), price: '250' },
              { img: gigante, name: t('lp_species_gigante_name'), desc: t('lp_species_gigante_desc'), price: '1.000' },
              { img: imperial, name: t('lp_species_imperial_name'), desc: t('lp_species_imperial_desc'), price: '5.000' },
              { img: divina, name: t('lp_species_divina_name'), desc: t('lp_species_divina_desc'), price: '10.000' },
            ].map((breed, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div className="h-16 mb-2">
                  <h4 className="font-black text-sm md:text-base leading-tight">{breed.name}</h4>
                  <p className="text-[10px] md:text-xs text-green-100">{breed.desc}</p>
                </div>
                <img src={breed.img} alt={breed.name} className="w-32 h-32 object-contain mb-4 group-hover:scale-110 transition-transform drop-shadow-xl" />
                <div className="bg-yellow-400 text-yellow-900 font-black px-4 py-1 rounded-full shadow-md flex items-center gap-1 border-2 border-yellow-500">
                  {breed.price} <img src={logoChi} alt="CHI" className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MUTANTS SECTION */}
      <section className="bg-[#0b6b3a] py-16 px-4 relative border-t-4 border-[#0f753a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black mb-4 drop-shadow-md">{t('lp_mutants_title')}</h2>
            <p className="text-xl font-bold text-yellow-300">{t('lp_mutants_tagline')}</p>
            <div className="mt-6 flex flex-col md:flex-row items-center justify-center gap-4">
               <button onClick={() => onNavigate('AUTH')} className="bg-blue-500 hover:bg-blue-600 border-b-4 border-blue-700 px-6 py-2 rounded-xl font-black text-white shadow-lg transition-all flex items-center gap-2">
                {t('lp_shop')} <span className="text-blue-200">▶</span> {t('lp_works')}
              </button>
              <div className="bg-white/10 px-6 py-2 rounded-xl border border-white/20 font-bold flex items-center gap-2">
                {t('lp_genetics_lab')} <span className="bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded text-xs">1000 CHI</span>
              </div>
            </div>
            <p className="mt-4 font-bold text-green-100">
              {t('lp_mutants_mix')}<br/><span className="text-white text-lg">{t('lp_mutants_mix_types')}</span>
            </p>
          </div>

          {/* Aliens */}
          <div className="mb-16">
            <h3 className="text-2xl font-black mb-6 text-green-300 border-b-2 border-green-500/30 pb-2">{t('lp_alien_series')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center"><img src={alienInsect} className="w-32 mx-auto hover:scale-110 transition-transform" /><p className="mt-2 font-bold">Alien Insect</p></div>
              <div className="text-center"><img src={alienTentacles} className="w-32 mx-auto hover:scale-110 transition-transform" /><p className="mt-2 font-bold">Alien Tentacles</p></div>
              <div className="text-center"><img src={alienLizard} className="w-32 mx-auto hover:scale-110 transition-transform" /><p className="mt-2 font-bold">Alien Lizard</p></div>
              <div className="text-center"><img src={alienCyber} className="w-32 mx-auto hover:scale-110 transition-transform" /><p className="mt-2 font-bold">Alien Cyber</p></div>
            </div>
            <div className="mt-8 bg-black/20 p-6 rounded-3xl border border-white/10">
              <h4 className="font-black mb-4 text-center">{t('lp_alien_accessories')}</h4>
              <div className="flex justify-center gap-4 flex-wrap">
                <div className="text-center"><img src={alienThirdEye} className="w-20 h-20 object-contain" /><p className="text-xs mt-1">Third Eye</p></div>
                <div className="text-center"><img src={alienHelmet} className="w-20 h-20 object-contain" /><p className="text-xs mt-1">Space Helmet</p></div>
                <div className="text-center"><img src={alienAntena} className="w-20 h-20 object-contain" /><p className="text-xs mt-1">Antena</p></div>
                <div className="text-center"><img src={alienTail} className="w-20 h-20 object-contain" /><p className="text-xs mt-1">Tail/Slime</p></div>
              </div>
            </div>
          </div>

          {/* Grifos */}
          <div className="mb-16">
            <h3 className="text-2xl font-black mb-6 text-yellow-300 border-b-2 border-yellow-500/30 pb-2">{t('lp_grifo_series')}</h3>
            <div className="flex justify-center gap-8 md:gap-16 flex-wrap">
              <div className="text-center"><img src={grifoLion} className="w-40 mx-auto hover:scale-110 transition-transform drop-shadow-2xl" /><p className="mt-2 font-bold text-lg">Lion</p></div>
              <div className="text-center"><img src={grifoEagle} className="w-40 mx-auto hover:scale-110 transition-transform drop-shadow-2xl" /><p className="mt-2 font-bold text-lg">Eagle</p></div>
              <div className="text-center"><img src={grifoGold} className="w-40 mx-auto hover:scale-110 transition-transform drop-shadow-2xl" /><p className="mt-2 font-bold text-lg text-yellow-400">Gold</p></div>
            </div>
          </div>

          {/* Robots */}
          <div>
            <h3 className="text-2xl font-black mb-6 text-blue-300 border-b-2 border-blue-500/30 pb-2">{t('lp_robot_series')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center"><img src={robotAero} className="w-32 mx-auto hover:scale-110 transition-transform" /><p className="mt-2 font-bold">Aero</p></div>
              <div className="text-center"><img src={robotGears} className="w-32 mx-auto hover:scale-110 transition-transform" /><p className="mt-2 font-bold">Gears</p></div>
              <div className="text-center"><img src={robotNeon} className="w-32 mx-auto hover:scale-110 transition-transform" /><p className="mt-2 font-bold">Neon</p></div>
              <div className="text-center"><img src={robotHeavy} className="w-32 mx-auto hover:scale-110 transition-transform" /><p className="mt-2 font-bold">Heavy</p></div>
            </div>
            <div className="mt-8 bg-black/20 p-6 rounded-3xl border border-white/10">
              <h4 className="font-black mb-4 text-center">{t('lp_robot_accessories')}</h4>
              <div className="flex justify-center gap-4 flex-wrap">
                <div className="text-center"><img src={robotAntena} className="w-20 h-20 object-contain" /><p className="text-xs mt-1">Antena</p></div>
                <div className="text-center"><img src={robotBattery} className="w-20 h-20 object-contain" /><p className="text-xs mt-1">Battery</p></div>
                <div className="text-center"><img src={robotGearsAddon} className="w-20 h-20 object-contain" /><p className="text-xs mt-1">Gears</p></div>
                <div className="text-center"><img src={robotShield} className="w-20 h-20 object-contain" /><p className="text-xs mt-1">Shield/Mech</p></div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* PVP SECTION */}
      <section className="bg-[#148e48] py-16 px-4 relative border-t-4 border-[#0f753a]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4 flex items-center justify-center gap-3 drop-shadow-md">
            {t('lp_pvp_title')}
          </h2>
          <p className="font-bold text-green-100 mb-8 max-w-2xl mx-auto">
            {t('lp_pvp_desc')}
          </p>
          
          <div className="bg-[#0b6b3a] p-8 rounded-[3rem] border-4 border-[#1fa158] shadow-2xl max-w-2xl mx-auto">
             <div className="mb-6 text-left">
               <label className="font-black text-sm text-green-200 block mb-2">{t('lp_pvp_choose_color')}</label>
               <div className="bg-white p-4 rounded-2xl flex justify-center gap-4">
                 {[
                   { id: 'red', img: '/assets/booster/rooster_red.svg', ring: 'ring-red-300', border: 'border-red-600' },
                   { id: 'blue', img: '/assets/booster/rooster_blue.svg', ring: 'ring-blue-300', border: 'border-blue-600' },
                   { id: 'green', img: '/assets/booster/rooster_green.svg', ring: 'ring-green-300', border: 'border-green-600' },
                   { id: 'yellow', img: '/assets/booster/rooster_yellow.svg', ring: 'ring-yellow-300', border: 'border-yellow-500' },
                 ].map((opt) => (
                   <button
                     type="button"
                     key={opt.id}
                     onClick={() => setPvpColor(opt.id)}
                     className={`w-16 h-16 rounded-full bg-white border-4 ${opt.border} shadow-inner flex items-center justify-center transition-transform ${pvpColor === opt.id ? `ring-4 ${opt.ring} scale-105` : 'hover:scale-105'}`}
                    aria-label={`${t('lp_color')} ${opt.id}`}
                   >
                     <img src={opt.img} alt="" className="w-10 h-10 object-contain" />
                   </button>
                 ))}
               </div>
             </div>
             
             <div className="mb-6 text-left">
              <label className="font-black text-sm text-green-200 block mb-2">{t('lp_pvp_bet_value')}</label>
               <div className="flex gap-2">
                 {[10, 50, 100, 250, 500].map(val => (
                   <button key={val} className={`flex-1 py-2 rounded-xl font-black ${val === 100 ? 'bg-orange-500 text-white border-b-4 border-orange-700' : 'bg-white text-slate-800 border-b-4 border-slate-300'}`}>
                     {val}
                   </button>
                 ))}
               </div>
             </div>

             <button onClick={() => onNavigate('AUTH')} className="w-full bg-green-500 hover:bg-green-400 border-b-4 border-green-700 text-white font-black text-xl py-4 rounded-2xl shadow-xl active:translate-y-1 active:border-b-0 transition-all">
              {t('lp_pvp_confirm_play')} ➔
             </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#084f2a] py-8 px-4 text-center border-t-4 border-[#063a1e]">
        <div className="flex justify-center gap-6 mb-6">
          <a href="#" className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all"><Youtube size={24} /></a>
          <a href="#" className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all"><Instagram size={24} /></a>
          <a href="#" className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all"><Facebook size={24} /></a>
          <a href="#" className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all"><Twitter size={24} /></a>
          <a href="#" className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
          </a>
        </div>
        <p className="text-white/50 font-bold text-sm">{t('lp_footer_copy')}</p>
      </footer>
      </div>
    </div>
  );
};

export default LandingPageScreen;
