import React, { useEffect, useMemo, useRef, useState } from 'react';
import { playSound } from '../../utils/audioSystem';
import { useLanguage } from '../../contexts/LanguageContext';
import { ArrowLeft, Eye, EyeOff, Globe } from 'lucide-react';
import logoSolo from '../../../landingpage/logo_landing/logo_soloname_chicken.png';

const REGION_CODES = [
  'AD','AE','AF','AG','AI','AL','AM','AO','AQ','AR','AS','AT','AU','AW','AX','AZ',
  'BA','BB','BD','BE','BF','BG','BH','BI','BJ','BL','BM','BN','BO','BQ','BR','BS','BT','BV','BW','BY','BZ',
  'CA','CC','CD','CF','CG','CH','CI','CK','CL','CM','CN','CO','CR','CU','CV','CW','CX','CY','CZ',
  'DE','DJ','DK','DM','DO','DZ',
  'EC','EE','EG','EH','ER','ES','ET',
  'FI','FJ','FK','FM','FO','FR',
  'GA','GB','GD','GE','GF','GG','GH','GI','GL','GM','GN','GP','GQ','GR','GS','GT','GU','GW','GY',
  'HK','HM','HN','HR','HT','HU',
  'ID','IE','IL','IM','IN','IO','IQ','IR','IS','IT',
  'JE','JM','JO','JP',
  'KE','KG','KH','KI','KM','KN','KP','KR','KW','KY','KZ',
  'LA','LB','LC','LI','LK','LR','LS','LT','LU','LV','LY',
  'MA','MC','MD','ME','MF','MG','MH','MK','ML','MM','MN','MO','MP','MQ','MR','MS','MT','MU','MV','MW','MX','MY','MZ',
  'NA','NC','NE','NF','NG','NI','NL','NO','NP','NR','NU','NZ',
  'OM',
  'PA','PE','PF','PG','PH','PK','PL','PM','PN','PR','PS','PT','PW','PY',
  'QA',
  'RE','RO','RS','RU','RW',
  'SA','SB','SC','SD','SE','SG','SH','SI','SJ','SK','SL','SM','SN','SO','SR','SS','ST','SV','SX','SY','SZ',
  'TC','TD','TF','TG','TH','TJ','TK','TL','TM','TN','TO','TR','TT','TV','TW','TZ',
  'UA','UG','UM','US','UY','UZ',
  'VA','VC','VE','VG','VI','VN','VU',
  'WF','WS',
  'XK',
  'YE','YT',
  'ZA','ZM','ZW',
];

const countryCodeToFlagEmoji = (code) => {
  if (!code || typeof code !== 'string' || code.length !== 2) return '🏳️';
  const upper = code.toUpperCase();
  const A = 0x1f1e6;
  const first = upper.charCodeAt(0) - 65;
  const second = upper.charCodeAt(1) - 65;
  if (first < 0 || first > 25 || second < 0 || second > 25) return '🏳️';
  return String.fromCodePoint(A + first, A + second);
};

const getRegionDisplayName = (language, code) => {
  try {
    const dn = new Intl.DisplayNames([language], { type: 'region' });
    return dn.of(code);
  } catch {
    return code;
  }
};

const CountryPicker = ({ value, onChange, language, t, compact = false, align = 'left', required = false }) => {
  const containerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const options = useMemo(() => {
    let codes = REGION_CODES;
    if (typeof Intl !== 'undefined' && typeof Intl.supportedValuesOf === 'function') {
      try {
        const supported = Intl.supportedValuesOf('region');
        if (Array.isArray(supported) && supported.length > 0) {
          codes = supported.filter((c) => /^[A-Z]{2}$/.test(c));
        }
      } catch {
        codes = REGION_CODES;
      }
    }

    const mapped = codes
      .map((code) => {
        const name = getRegionDisplayName(language, code);
        if (!name || name === code) return null;
        return { code, name, flag: countryCodeToFlagEmoji(code) };
      })
      .filter(Boolean);

    mapped.sort((a, b) => a.name.localeCompare(b.name, language, { sensitivity: 'base' }));
    return mapped;
  }, [language]);

  const selected = useMemo(() => {
    const code = (value || '').toUpperCase();
    const name = getRegionDisplayName(language, code);
    return { code, name: name || code, flag: countryCodeToFlagEmoji(code) };
  }, [language, value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.name.toLowerCase().includes(q) || o.code.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={compact
          ? `bg-white/90 backdrop-blur-sm p-2.5 sm:p-3 rounded-2xl border-b-4 border-slate-200 shadow-lg flex items-center gap-2 font-black text-slate-700 hover:bg-white transition-all text-sm ${required && !value ? 'ring-2 ring-red-400' : ''}`
          : "w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-200 font-bold outline-none transition-all hover:bg-slate-100 focus:border-blue-400 flex items-center justify-between gap-3"
        }
      >
        {compact ? (
          <>
            <span className="text-xl leading-none">{selected.flag}</span>
            <span className="uppercase">{selected.code || t('country_button')}</span>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xl">{selected.flag}</span>
              <span className="truncate text-slate-800">{selected.name}</span>
              <span className="text-[10px] font-black text-slate-400 bg-white px-2 py-1 rounded-full border border-slate-200">
                {selected.code}
              </span>
            </div>
            <span className={`text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
          </>
        )}
      </button>

      {open && (
        <div
          className={`bg-white rounded-2xl shadow-2xl border-2 border-slate-100 overflow-hidden z-[120] ${
            compact
              ? `fixed left-4 right-4 top-16 sm:absolute sm:top-full sm:mt-2 sm:left-auto sm:w-80 ${align === 'right' ? 'sm:right-0' : 'sm:left-0'}`
              : `absolute mt-2 left-0 right-0`
          }`}
        >
          <div className="p-3 border-b border-slate-100 bg-slate-50">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('country_search_placeholder')}
              className="w-full p-3 rounded-xl bg-white border-2 border-slate-200 font-bold focus:border-blue-400 outline-none transition-all"
              autoFocus
            />
          </div>

          <div className="max-h-64 overflow-y-auto">
            {filtered.map((opt) => {
              const active = opt.code === selected.code;
              return (
                <button
                  type="button"
                  key={opt.code}
                  onClick={() => {
                    onChange(opt.code);
                    setOpen(false);
                  }}
                  className={`w-full px-4 py-3 flex items-center justify-between gap-3 text-left font-bold transition-all ${
                    active ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl">{opt.flag}</span>
                    <span className="truncate">{opt.name}</span>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-1 rounded-full border ${
                    active ? 'bg-white border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}>
                    {opt.code}
                  </span>
                </button>
              );
            })}

            {filtered.length === 0 && (
              <div className="px-4 py-4 text-sm font-bold text-slate-500">
                {t('country_search_empty')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const AuthScreen = ({ mode = 'login', onLogin, onRegister, onBackToLanding, onGoToLogin, onGoToRegister }) => {
  const { t, language, changeLanguage, languages } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const [name, setName] = useState('');
  const [sponsor, setSponsor] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e) => { 
    e.preventDefault(); 
    setFormError('');
    setResetSent(false);

    if (mode === 'register') {
      if (!country) {
        setFormError(t('country_required'));
        return;
      }
      if (password !== confirmPassword) {
        setFormError(t('register_password_mismatch'));
        return;
      }
    }

    setLoading(true); 
    setTimeout(() => {
      setLoading(false);
      if (mode === 'register') {
        onRegister?.({ name, sponsor, username, email, country });
      } else {
        onLogin?.();
      }
    }, 800); 
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    setFormError('');
    setResetSent(false);
    if (!resetEmail.trim()) {
      setFormError(t('reset_email_required'));
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setResetSent(true);
    }, 700);
  };

  return (
    <div className="min-h-screen w-full flex items-start md:items-center justify-center px-4 sm:px-6 pt-24 sm:pt-28 pb-10 relative z-50">
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
        <button
          type="button"
          onClick={onBackToLanding}
          className="bg-white/90 backdrop-blur-sm p-2.5 sm:p-3 rounded-2xl border-b-4 border-slate-200 shadow-lg flex items-center gap-2 font-black text-slate-700 hover:bg-white transition-all text-sm"
        >
          <ArrowLeft size={20} className="text-slate-600" />
          <span className="hidden sm:inline">{t('btn_back_landing')}</span>
        </button>
      </div>

      {/* Seletor de Idioma Superior */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <div className="flex items-center gap-2 sm:gap-3">
          {mode === 'register' && (
            <CountryPicker value={country} onChange={setCountry} language={language} t={t} compact align="right" required />
          )}

          <div className="relative">
            <button 
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="bg-white/90 backdrop-blur-sm p-2.5 sm:p-3 rounded-2xl border-b-4 border-slate-200 shadow-lg flex items-center gap-2 font-black text-slate-700 hover:bg-white transition-all text-sm"
            >
              <Globe size={20} className="text-blue-500" />
              <span className="uppercase">{language}</span>
            </button>

            {showLangMenu && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-2xl border-2 border-slate-100 p-2 min-w-[150px] animate-in slide-in-from-top-2 duration-200 z-[100]">
                {languages.map((lang, index) => (
                  <button
                    key={`${lang.code}-${index}`}
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
      </div>

      <div className="bg-white/90 backdrop-blur-md p-5 sm:p-8 rounded-3xl shadow-2xl w-full max-w-md border-b-8 border-slate-200 animate-in zoom-in-50 max-h-[calc(100vh-8rem)] overflow-y-auto overscroll-contain">
        <div className="text-center mb-6 flex flex-col items-center">
          {mode === 'register' ? (
            <div className="w-full flex items-center justify-center mb-4">
              <img
                src={logoSolo}
                alt="Pool Chicken"
                className="h-14 md:h-16 object-contain drop-shadow-lg"
              />
            </div>
          ) : (
            <div className="w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 mb-2 animate-bounce hover:scale-105 transition-transform duration-300">
              <img 
                src="/assets/logo/logo_pool_chicken.svg" 
                alt="Pool Chicken Logo" 
                className="w-full h-full object-contain drop-shadow-xl"
              />
            </div>
          )}
          
          <h1 className="sr-only">{t('login_title')}</h1>
          
          <p className="text-slate-600 font-bold text-xl md:text-2xl mt-2 max-w-[90%] leading-tight">
            {mode === 'register' ? t('register_subtitle') : t('login_subtitle')}
          </p>
        </div>
        
        {!showReset ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <input 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text" 
                placeholder={t('name_placeholder')} 
                className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-200 font-bold focus:border-blue-400 outline-none transition-all" 
              />
              <input 
                value={sponsor}
                onChange={(e) => setSponsor(e.target.value)}
                type="text" 
                placeholder={t('sponsor_placeholder')} 
                className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-200 font-bold focus:border-blue-400 outline-none transition-all" 
              />
              <input 
                required 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                type="text" 
                placeholder={t('username_placeholder')} 
                className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-200 font-bold focus:border-blue-400 outline-none transition-all" 
              />
            </>
          )}

          <input 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email" 
            placeholder={t('email_placeholder')} 
            className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-200 font-bold focus:border-blue-400 outline-none transition-all" 
          />

          <div className="relative">
            <input 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? 'text' : 'password'} 
              placeholder={t('password_placeholder')} 
              className="w-full p-4 pr-12 rounded-xl bg-slate-50 border-2 border-slate-200 font-bold focus:border-blue-400 outline-none transition-all" 
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
              aria-label={showPassword ? t('hide_password') : t('show_password')}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {mode === 'register' && (
            <div className="relative">
              <input 
                required 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type={showConfirmPassword ? 'text' : 'password'} 
                placeholder={t('confirm_password_placeholder')} 
                className="w-full p-4 pr-12 rounded-xl bg-slate-50 border-2 border-slate-200 font-bold focus:border-blue-400 outline-none transition-all" 
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                aria-label={showConfirmPassword ? t('hide_password') : t('show_password')}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          )}

          {formError && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 font-bold rounded-xl p-3 text-sm">
              {formError}
            </div>
          )}

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
              <>
                {mode === 'register' ? t('btn_register') : t('btn_login')} 🚀
              </>
            )}
          </button>

          {mode === 'login' && (
            <div className="flex items-center justify-between text-sm font-bold">
              <button
                type="button"
                onClick={() => {
                  setShowReset(true);
                  setResetSent(false);
                  setFormError('');
                  setResetEmail(email);
                }}
                className="text-slate-600 hover:text-slate-800 underline underline-offset-4"
              >
                {t('login_forgot_password')}
              </button>

              <div className="text-slate-600">
                <span className="opacity-80">{t('login_no_account')} </span>
                <button
                  type="button"
                  onClick={onGoToRegister}
                  className="text-blue-600 hover:text-blue-700 underline underline-offset-4"
                >
                  {t('login_register_link')}
                </button>
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div className="text-center text-sm font-bold text-slate-600">
              <span className="opacity-80">{t('register_have_account')} </span>
              <button
                type="button"
                onClick={onGoToLogin}
                className="text-blue-600 hover:text-blue-700 underline underline-offset-4"
              >
                {t('register_login_link')}
              </button>
            </div>
          )}
        </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="text-center text-sm font-bold text-slate-600">
              {t('reset_subtitle')}
            </div>

            <input
              required
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              type="email"
              placeholder={t('email_placeholder')}
              className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-200 font-bold focus:border-blue-400 outline-none transition-all"
            />

            {formError && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 font-bold rounded-xl p-3 text-sm">
                {formError}
              </div>
            )}

            {resetSent && (
              <div className="bg-green-50 border-2 border-green-200 text-green-700 font-bold rounded-xl p-3 text-sm">
                {t('reset_sent')}
              </div>
            )}

            <button
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-xl font-black text-lg shadow-lg border-b-4 border-blue-700 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="flex items-center gap-2 italic opacity-80">
                  <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  ...
                </div>
              ) : (
                <>{t('reset_send_link')}</>
              )}
            </button>

            <div className="text-center text-sm font-bold">
              <button
                type="button"
                onClick={() => {
                  setShowReset(false);
                  setResetSent(false);
                  setFormError('');
                }}
                className="text-slate-600 hover:text-slate-800 underline underline-offset-4"
              >
                {t('reset_back_to_login')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthScreen;
