import React, { useState } from 'react';
import { playSound } from '../../utils/audioSystem';
import { useLanguage } from '../../contexts/LanguageContext';
import { Globe } from 'lucide-react';

const AuthScreen = ({ onLogin }) => {
  const { t, language, changeLanguage, languages } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const handleRegister = (e) => { 
    e.preventDefault(); 
    setLoading(true); 
    setTimeout(() => onLogin('USER'), 1500); 
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative z-50">
      {/* Seletor de Idioma Superior */}
      <div className="absolute top-6 right-6">
        <div className="relative">
          <button 
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="bg-white/90 backdrop-blur-sm p-3 rounded-2xl border-b-4 border-slate-200 shadow-lg flex items-center gap-2 font-black text-slate-700 hover:bg-white transition-all"
          >
            <Globe size={20} className="text-blue-500" />
            <span className="uppercase">{language}</span>
          </button>

          {showLangMenu && (
            <div className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-2xl border-2 border-slate-100 p-2 min-w-[150px] animate-in slide-in-from-top-2 duration-200 z-[100]">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    changeLanguage(lang.code);
                    setShowLangMenu(false);
                    playSound('click');
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-bold ${
                    language === lang.code ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-full max-w-md border-b-8 border-slate-200 animate-in zoom-in-50">
        <div className="text-center mb-6 flex flex-col items-center">
          {/* Logo Principal Aumentada e Responsiva */}
          <div className="w-48 h-48 md:w-56 md:h-56 mb-2 animate-bounce hover:scale-105 transition-transform duration-300">
            <img 
              src="/assets/logo/logo_pool_chicken.svg" 
              alt="Pool Chicken Logo" 
              className="w-full h-full object-contain drop-shadow-xl"
            />
          </div>
          
          {/* Título invisível para acessibilidade */}
          <h1 className="sr-only">{t('login_title')}</h1>
          
          <p className="text-slate-600 font-bold text-xl md:text-2xl mt-2 max-w-[90%] leading-tight">{t('login_subtitle')}</p>
        </div>
        
        <form onSubmit={handleRegister} className="space-y-4">
          <input 
            required 
            type="email" 
            placeholder={t('email_placeholder')} 
            className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-200 font-bold focus:border-blue-400 outline-none transition-all" 
          />
          <input 
            required 
            type="password" 
            placeholder={t('password_placeholder')} 
            className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-200 font-bold focus:border-blue-400 outline-none transition-all" 
          />
          <button 
            disabled={loading} 
            className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-black text-lg shadow-lg border-b-4 border-green-700 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="flex items-center gap-2 italic opacity-80">
                <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                ...
              </div>
            ) : (
              <>{t('btn_login')} 🚀</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthScreen;
