import React, { useState, useEffect } from 'react';
import { X, Volume2, VolumeX, Save, Download, Crown, Globe, RefreshCcw, Music, LogOut, Wallet, KeyRound, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTutorial } from '../../contexts/TutorialContext';
import { bgm } from '../../utils/musicSystem';

const sha256Hex = async (input) => {
  try {
    const data = new TextEncoder().encode(input);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return `plain:${input}`;
  }
};

const SettingsScreen = ({ onBack, onReset, onLogout, dayCount, isMuted, toggleMute, onPrestige, canPrestige, goldenEggsToGain, onExportSave, onImportSave, walletWithdrawAddresses, setWalletWithdrawAddresses, financialPasswordHash, setFinancialPasswordHash }) => {
  const { t, language, changeLanguage, languages } = useLanguage();
  const { restartTutorial } = useTutorial();
  const [finPass1, setFinPass1] = useState('');
  const [finPass2, setFinPass2] = useState('');
  const [showFinPass1, setShowFinPass1] = useState(false);
  const [showFinPass2, setShowFinPass2] = useState(false);
  const [finSaved, setFinSaved] = useState(false);
  const [walletSaved, setWalletSaved] = useState(false);

  // Estado local para controle da música
  const [musicEnabled, setMusicEnabled] = useState(bgm.isEnabledState());
  const [musicVolume, setMusicVolume] = useState(bgm.getVolume());

  // Sincronização com MusicSystem (Observer)
  useEffect(() => {
    const unsubscribe = bgm.subscribe((state) => {
      setMusicEnabled(state.enabled);
      setMusicVolume(state.volume);
    });
    return unsubscribe;
  }, []);

  const handleMusicToggle = () => {
    const newState = !musicEnabled;
    setMusicEnabled(newState);
    bgm.toggle(newState);
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setMusicVolume(val);
    bgm.setVolume(val);
  };

  const updateWithdrawAddress = (key, value) => {
    setWalletWithdrawAddresses?.((prev) => ({ ...(prev || {}), [key]: value }));
  };

  const handleSaveWallet = () => {
    setWalletSaved(true);
    setWalletWithdrawAddresses?.((prev) => ({ ...(prev || {}) }));
    setTimeout(() => setWalletSaved(false), 1500);
  };

  const handleSaveFinancialPassword = async () => {
    setFinSaved(false);
    if (!finPass1 || finPass1.length < 4) return;
    if (finPass1 !== finPass2) return;
    const hash = await sha256Hex(finPass1);
    setFinancialPasswordHash?.(hash);
    setFinPass1('');
    setFinPass2('');
    setFinSaved(true);
    setTimeout(() => setFinSaved(false), 1500);
  };

  return (
    <div className="animate-in slide-in-from-right-10 fade-in pb-24 md:pb-0">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={onBack} className="bg-white p-2 rounded-full shadow-md">
          <X size={24}/>
        </button>
        <h1 className="text-2xl font-black text-slate-800 bg-white/50 px-3 py-1 rounded-xl">
          {t('settings_title')}
        </h1>
      </div>

      <div className="bg-white/90 p-6 rounded-3xl border-b-4 border-slate-200 space-y-6">
        {/* Tutorial */}
        <div className="p-4 bg-blue-50 rounded-2xl border-2 border-blue-200">
          <h3 className="font-black text-blue-800 flex items-center gap-2 mb-2">
            <RefreshCcw size={20}/> {t('settings_tutorial_title')}
          </h3>
          <button 
            onClick={() => { restartTutorial(); onBack(); }}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-black shadow-sm text-xs border-b-4 border-blue-700 active:border-b-0 active:translate-y-1 transition-all"
          >
            {t('settings_tutorial_btn')}
          </button>
        </div>

        {/* Áudio (SFX + BGM) */}
        <div className="space-y-3">
           {/* SFX */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              {isMuted ? <VolumeX size={24} className="text-slate-400"/> : <Volume2 size={24} className="text-blue-500"/>}
              <span className="font-bold text-slate-700">{isMuted ? t('sound_off') : t('sound_on')}</span>
            </div>
            <button 
              onClick={toggleMute} 
              className={`w-12 h-6 rounded-full transition-all relative ${isMuted ? 'bg-slate-300' : 'bg-blue-500'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isMuted ? 'left-1' : 'left-7'}`}></div>
            </button>
          </div>

          {/* BGM (Música) */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Music size={24} className={musicEnabled ? "text-purple-500" : "text-slate-400"}/>
                <span className="font-bold text-slate-700">{t('settings_music')}</span>
              </div>
              <button 
                onClick={handleMusicToggle} 
                className={`w-12 h-6 rounded-full transition-all relative ${!musicEnabled ? 'bg-slate-300' : 'bg-purple-500'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${!musicEnabled ? 'left-1' : 'left-7'}`}></div>
              </button>
            </div>
            
            {/* Volume Slider */}
            <div className={`transition-all duration-300 ${!musicEnabled ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400">{t('settings_vol')}</span>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.05" 
                  value={musicVolume} 
                  onChange={handleVolumeChange}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <span className="text-[10px] font-bold text-slate-500 w-6 text-right">{Math.round(musicVolume * 100)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Idioma */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-black uppercase px-1">
            <Globe size={14}/> {t('language')}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all ${
                  language === lang.code 
                    ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm' 
                    : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className="text-[10px] font-black uppercase">{lang.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Carteiras de Saque & Senha Financeira */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-black uppercase px-1">
            <Wallet size={14}/> {t('settings_wallet_title')}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { key: 'USDT_BEP20', label: 'USDT (BEP-20)' },
              { key: 'USDT_POLYGON', label: 'USDT (Polygon)' },
              { key: 'USDT_TRC20', label: 'USDT (TRC-20)' },
              { key: 'USDT_ARBITRUM', label: 'USDT (Arbitrum)' },
              { key: 'USDC_BEP20', label: 'USDC (BEP-20)' },
              { key: 'USDC_ARBITRUM', label: 'USDC (Arbitrum)' },
              { key: 'PIX', label: 'PIX' },
            ].map((item) => (
              <div key={item.key} className="bg-slate-50 rounded-2xl border border-slate-200 p-3">
                <div className="text-[11px] font-black text-slate-500 uppercase mb-2">{item.label}</div>
                <input
                  value={(walletWithdrawAddresses && walletWithdrawAddresses[item.key]) || ''}
                  onChange={(e) => updateWithdrawAddress(item.key, e.target.value)}
                  placeholder={t('settings_wallet_placeholder')}
                  className="w-full bg-white border-2 border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-700 text-sm"
                />
              </div>
            ))}
          </div>

          <div className="text-xs font-bold text-slate-500 px-1">
            {t('settings_wallet_autosave')}
          </div>

          <button
            type="button"
            onClick={handleSaveWallet}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-black text-xs border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1 transition-all"
          >
            {walletSaved ? t('settings_wallet_saved') : t('settings_wallet_save')}
          </button>

          <div className="flex items-center gap-2 text-slate-400 text-xs font-black uppercase px-1 pt-2">
            <KeyRound size={14}/> {t('settings_finpass_title')}
          </div>

          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3">
            <div className="text-xs font-bold text-slate-600">
              {financialPasswordHash ? t('settings_finpass_set') : t('settings_finpass_not_set')}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative">
                <input
                  value={finPass1}
                  onChange={(e) => setFinPass1(e.target.value)}
                  type={showFinPass1 ? 'text' : 'password'}
                  placeholder={t('settings_finpass_new')}
                  className="w-full bg-white border-2 border-slate-200 rounded-xl px-3 py-2 pr-10 font-bold text-slate-700 text-sm"
                />
                <button type="button" onClick={() => setShowFinPass1((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700" aria-label={showFinPass1 ? t('hide_password') : t('show_password')}>
                  {showFinPass1 ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="relative">
                <input
                  value={finPass2}
                  onChange={(e) => setFinPass2(e.target.value)}
                  type={showFinPass2 ? 'text' : 'password'}
                  placeholder={t('settings_finpass_confirm')}
                  className="w-full bg-white border-2 border-slate-200 rounded-xl px-3 py-2 pr-10 font-bold text-slate-700 text-sm"
                />
                <button type="button" onClick={() => setShowFinPass2((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700" aria-label={showFinPass2 ? t('hide_password') : t('show_password')}>
                  {showFinPass2 ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveFinancialPassword}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl font-black text-xs border-b-4 border-slate-950 active:border-b-0 active:translate-y-1 transition-all"
            >
              {finSaved ? t('settings_finpass_saved') : t('settings_finpass_save')}
            </button>

            {finPass1 && finPass1.length < 4 && (
              <div className="text-xs font-bold text-red-600">
                {t('settings_finpass_min')}
              </div>
            )}
            {finPass1 && finPass2 && finPass1 !== finPass2 && (
              <div className="text-xs font-bold text-red-600">
                {t('settings_finpass_mismatch')}
              </div>
            )}
          </div>
        </div>

        {/* Save/Load */}
        <div className="flex gap-2">
          <button onClick={onExportSave} className="flex-1 bg-blue-100 text-blue-600 py-3 rounded-xl font-bold text-xs border-2 border-blue-200 flex items-center justify-center gap-1">
            <Save size={16}/> {t('btn_save')}
          </button>
          <button onClick={onImportSave} className="flex-1 bg-purple-100 text-purple-600 py-3 rounded-xl font-bold text-xs border-2 border-purple-200 flex items-center justify-center gap-1">
            <Download size={16}/> {t('btn_load')}
          </button>
        </div>

        {/* Prestige */}
        <div className="p-4 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-2xl border-2 border-yellow-300">
          <h3 className="font-black text-yellow-800 flex items-center gap-2">
            <Crown size={20}/> {t('settings_prestige_title')}
          </h3>
          <p className="text-xs text-yellow-700 mb-3">
            {t('settings_prestige_desc')}
          </p>
          <button 
            disabled={!canPrestige}
            onClick={onPrestige}
            className={`w-full py-3 rounded-xl font-black shadow-sm text-xs border-b-4 transition-all ${
              canPrestige 
                ? 'bg-yellow-500 border-yellow-700 text-white hover:bg-yellow-400' 
                : 'bg-slate-200 border-slate-300 text-slate-400 grayscale'
            }`}
          >
            {t('settings_prestige_btn', [goldenEggsToGain])}
          </button>
        </div>

        {/* Reset & Logout */}
        <div className="space-y-3">
          <button onClick={onReset} className="w-full bg-red-100 text-red-600 border-2 border-red-200 py-3 rounded-xl font-bold shadow-sm text-xs">
            {t('btn_reset')}
          </button>
          <button onClick={onLogout} className="w-full bg-slate-100 text-slate-600 border-2 border-slate-200 py-3 rounded-xl font-bold shadow-sm text-xs flex items-center justify-center gap-2">
            <LogOut size={16} /> {t('settings_logout')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
