import React, { useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { X, Copy, Check, ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, Send, History, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const USD_TO_CHI = 1000;
const PIX_USD_BRL = 5.4;
const WITHDRAW_MIN_USD = 10;
const WITHDRAW_FIXED_FEE_USD = 1;
const WITHDRAW_PERCENT_FEE = 0.02;
const PIX_WITHDRAW_PERCENT_FEE = 0.10;

const sha256Hex = async (input) => {
  try {
    const data = new TextEncoder().encode(input);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return `plain:${input}`;
  }
};

const formatUSD = (value) => {
  const n = Number(value);
  if (Number.isNaN(n)) return '$0.00';
  return `$${n.toFixed(2)}`;
};

const formatCHI = (value) => {
  const n = Math.floor(Number(value) || 0);
  return `${n.toLocaleString('en-US')}`;
};

const formatDateTime = (iso) => {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

const WalletScreen = ({
  onBack,
  balance,
  setBalance,
  usdBalance,
  setUsdBalance,
  walletHistory,
  setWalletHistory,
  walletAddresses,
  setWalletAddresses,
  walletWithdrawAddresses,
  financialPasswordHash,
  username,
  profile,
  showToast,
}) => {
  const { t } = useLanguage();
  const [tab, setTab] = useState('DEPOSIT'); // DEPOSIT, WITHDRAW, SWAP, INTERNAL, HISTORY
  const [copiedKey, setCopiedKey] = useState('');

  const [depositAmount, setDepositAmount] = useState('1');
  const [depositAsset, setDepositAsset] = useState('USDT');
  const [depositNetwork, setDepositNetwork] = useState('BEP20');

  const [withdrawAmount, setWithdrawAmount] = useState('10');
  const [withdrawAsset, setWithdrawAsset] = useState('USDT');
  const [withdrawNetwork, setWithdrawNetwork] = useState('BEP20');
  const [financialPassword, setFinancialPassword] = useState('');
  const [showFinancialPassword, setShowFinancialPassword] = useState(false);

  const [swapDir, setSwapDir] = useState('USD_TO_CHI');
  const [swapAmount, setSwapAmount] = useState('1');

  const [transferAmount, setTransferAmount] = useState('1');
  const [transferToUsername, setTransferToUsername] = useState('');
  const [transferToName, setTransferToName] = useState('');
  const [transferToEmail, setTransferToEmail] = useState('');

  const [historyFilter, setHistoryFilter] = useState('ALL'); // ALL, DEPOSIT, WITHDRAW, SWAP, INTERNAL

  const depositMethods = useMemo(() => {
    return [
      { asset: 'USDT', network: 'BEP20', key: 'USDT_BEP20', label: 'USDT (BEP-20)' },
      { asset: 'USDT', network: 'POLYGON', key: 'USDT_POLYGON', label: 'USDT (Polygon)' },
      { asset: 'USDT', network: 'TRC20', key: 'USDT_TRC20', label: 'USDT (TRC-20)' },
      { asset: 'USDT', network: 'ARBITRUM', key: 'USDT_ARBITRUM', label: 'USDT (Arbitrum)' },
      { asset: 'USDC', network: 'BEP20', key: 'USDC_BEP20', label: 'USDC (BEP-20)' },
      { asset: 'USDC', network: 'ARBITRUM', key: 'USDC_ARBITRUM', label: 'USDC (Arbitrum)' },
      { asset: 'PIX', network: 'PIX', key: 'PIX', label: 'PIX (R$)' },
    ];
  }, []);

  const selectedDepositMethod = useMemo(() => {
    if (depositAsset === 'PIX') return depositMethods.find((m) => m.key === 'PIX');
    return depositMethods.find((m) => m.asset === depositAsset && m.network === depositNetwork) || depositMethods[0];
  }, [depositAsset, depositNetwork, depositMethods]);

  const depositAddress = walletAddresses?.[selectedDepositMethod?.key] || '';
  const withdrawKey = withdrawAsset === 'PIX' ? 'PIX' : `${withdrawAsset}_${withdrawNetwork}`;
  const withdrawDestination = walletWithdrawAddresses?.[withdrawKey] || '';

  const pushHistory = (entry) => {
    const safe = Array.isArray(walletHistory) ? walletHistory : [];
    setWalletHistory([entry, ...safe].slice(0, 200));
  };

  const copyText = async (key, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(''), 1200);
      showToast?.(t('wallet_copied'), 'success');
    } catch {
      showToast?.(t('wallet_copy_fail'), 'error');
    }
  };

  const handleDeposit = () => {
    const amount = Number(depositAmount);
    if (!Number.isFinite(amount) || amount < 1) {
      showToast?.(t('wallet_min_deposit', [formatUSD(1)]), 'error');
      return;
    }
    const methodKey = selectedDepositMethod?.key || 'UNKNOWN';
    const now = new Date().toISOString();
    setUsdBalance((prev) => prev + amount);
    pushHistory({
      id: uuidv4(),
      type: 'DEPOSIT',
      createdAt: now,
      amountUSD: amount,
      method: methodKey,
      details: {
        asset: selectedDepositMethod?.asset,
        network: selectedDepositMethod?.network,
        pixBRL: methodKey === 'PIX' ? amount * PIX_USD_BRL : null,
      },
    });
    showToast?.(t('wallet_deposit_ok', [formatUSD(amount)]), 'success');
  };

  const handleWithdraw = () => {
    const amount = Number(withdrawAmount);
    if (!Number.isFinite(amount) || amount < WITHDRAW_MIN_USD) {
      showToast?.(t('wallet_min_withdraw', [formatUSD(WITHDRAW_MIN_USD)]), 'error');
      return;
    }
    if (amount > usdBalance) {
      showToast?.(t('wallet_insufficient_usd'), 'error');
      return;
    }
    if (!withdrawDestination) {
      showToast?.(t('wallet_withdraw_missing_address'), 'error');
      return;
    }
    if (!financialPasswordHash) {
      showToast?.(t('wallet_fin_password_not_set'), 'error');
      return;
    }
    if (!financialPassword) {
      showToast?.(t('wallet_fin_password_required'), 'error');
      return;
    }

    const fee = withdrawAsset === 'PIX'
      ? amount * PIX_WITHDRAW_PERCENT_FEE
      : (WITHDRAW_FIXED_FEE_USD + amount * WITHDRAW_PERCENT_FEE);
    const net = amount - fee;
    if (net <= 0) {
      showToast?.(t('wallet_invalid_amount'), 'error');
      return;
    }

    const now = new Date().toISOString();
    sha256Hex(financialPassword).then((hash) => {
      if (hash !== financialPasswordHash) {
        showToast?.(t('wallet_fin_password_invalid'), 'error');
        return;
      }
      setUsdBalance((prev) => prev - amount);
      pushHistory({
        id: uuidv4(),
        type: 'WITHDRAW',
        createdAt: now,
        amountUSD: amount,
        feeUSD: fee,
        netUSD: net,
        method: withdrawKey,
        details: {
          asset: withdrawAsset,
          network: withdrawAsset === 'PIX' ? 'PIX' : withdrawNetwork,
          destination: withdrawDestination,
          feeFixedUSD: withdrawAsset === 'PIX' ? 0 : WITHDRAW_FIXED_FEE_USD,
          feePercent: withdrawAsset === 'PIX' ? PIX_WITHDRAW_PERCENT_FEE : WITHDRAW_PERCENT_FEE,
        },
      });
      setFinancialPassword('');
      showToast?.(t('wallet_withdraw_ok', [formatUSD(net)]), 'success');
    });
  };

  const handleSwap = () => {
    const amount = Number(swapAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      showToast?.(t('wallet_invalid_amount'), 'error');
      return;
    }
    const now = new Date().toISOString();

    if (swapDir === 'USD_TO_CHI') {
      if (amount < 1) {
        showToast?.(t('wallet_min_swap_usd', [formatUSD(1)]), 'error');
        return;
      }
      if (amount > usdBalance) {
        showToast?.(t('wallet_insufficient_usd'), 'error');
        return;
      }
      const chiOut = Math.floor(amount * USD_TO_CHI);
      setUsdBalance((prev) => prev - amount);
      setBalance((prev) => prev + chiOut);
      pushHistory({
        id: uuidv4(),
        type: 'SWAP',
        createdAt: now,
        direction: 'USD_TO_CHI',
        amountUSD: amount,
        amountCHI: chiOut,
        feeUSD: 0,
      });
      showToast?.(t('wallet_swap_ok', [formatUSD(amount), `${formatCHI(chiOut)} CHI`]), 'success');
      return;
    }

    const chiIn = Math.floor(amount);
    if (chiIn < USD_TO_CHI) {
      showToast?.(t('wallet_min_swap_chi', [formatCHI(USD_TO_CHI)]), 'error');
      return;
    }
    if (chiIn > balance) {
      showToast?.(t('wallet_insufficient_chi'), 'error');
      return;
    }
    const usdGross = chiIn / USD_TO_CHI;
    const fee = usdGross * 0.02;
    const usdNet = usdGross - fee;
    setBalance((prev) => prev - chiIn);
    setUsdBalance((prev) => prev + usdNet);
    pushHistory({
      id: uuidv4(),
      type: 'SWAP',
      createdAt: now,
      direction: 'CHI_TO_USD',
      amountCHI: chiIn,
      amountUSD: usdNet,
      feeUSD: fee,
      grossUSD: usdGross,
    });
    showToast?.(t('wallet_swap_ok', [`${formatCHI(chiIn)} CHI`, formatUSD(usdNet)]), 'success');
  };

  const handleInternalTransfer = () => {
    const amount = Number(transferAmount);
    if (!Number.isFinite(amount) || amount < 1) {
      showToast?.(t('wallet_min_internal', [formatUSD(1)]), 'error');
      return;
    }
    if (amount > usdBalance) {
      showToast?.(t('wallet_insufficient_usd'), 'error');
      return;
    }
    if (!transferToUsername.trim() || !transferToName.trim() || !transferToEmail.trim()) {
      showToast?.(t('wallet_internal_required'), 'error');
      return;
    }
    const now = new Date().toISOString();
    setUsdBalance((prev) => prev - amount);
    pushHistory({
      id: uuidv4(),
      type: 'INTERNAL',
      createdAt: now,
      amountUSD: amount,
      feeUSD: 0,
      from: {
        username: username || profile?.username || '',
        name: profile?.name || '',
        email: profile?.email || '',
      },
      to: {
        username: transferToUsername.trim(),
        name: transferToName.trim(),
        email: transferToEmail.trim(),
      },
    });
    showToast?.(t('wallet_internal_ok', [formatUSD(amount), transferToUsername.trim()]), 'success');
    setTransferToUsername('');
    setTransferToName('');
    setTransferToEmail('');
  };

  const historyItems = useMemo(() => {
    const list = Array.isArray(walletHistory) ? walletHistory : [];
    if (historyFilter === 'ALL') return list;
    return list.filter((h) => h.type === historyFilter);
  }, [walletHistory, historyFilter]);

  return (
    <div className="animate-in slide-in-from-right-10 fade-in pb-24 md:pb-0">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={onBack} className="bg-white p-2 rounded-full shadow-md">
          <X size={24} />
        </button>
        <h1 className="text-2xl font-black text-slate-800 bg-white/50 px-3 py-1 rounded-xl">{t('wallet_title')}</h1>
      </div>

      <div className="bg-white/90 p-5 md:p-6 rounded-3xl border-b-4 border-slate-200 shadow-xl mb-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/assets/logo/logo_chi.png" alt="CHI" className="w-10 h-10 object-contain" />
            <div>
              <div className="text-xs font-black text-slate-500 uppercase">{t('wallet_balance_chi')}</div>
              <div className="text-2xl font-black text-slate-800">{formatCHI(balance)} CHI</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 border-2 border-emerald-200 flex items-center justify-center font-black text-emerald-700">$</div>
            <div>
              <div className="text-xs font-black text-slate-500 uppercase">{t('wallet_balance_usd')}</div>
              <div className="text-2xl font-black text-slate-800">{formatUSD(usdBalance)}</div>
            </div>
          </div>
          <div className="text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
            {t('wallet_rate', [formatCHI(USD_TO_CHI), formatUSD(1)])}
          </div>
        </div>
      </div>

      <div className="flex p-1 bg-slate-200 rounded-2xl mb-5">
        <button onClick={() => setTab('DEPOSIT')} className={`flex-1 py-2.5 rounded-xl font-black text-[11px] transition-all flex items-center justify-center gap-2 ${tab === 'DEPOSIT' ? 'bg-white text-slate-800 shadow-md' : 'text-slate-500 hover:text-slate-600'}`}><ArrowDownToLine size={16} /> {t('wallet_tab_deposit')}</button>
        <button onClick={() => setTab('WITHDRAW')} className={`flex-1 py-2.5 rounded-xl font-black text-[11px] transition-all flex items-center justify-center gap-2 ${tab === 'WITHDRAW' ? 'bg-white text-slate-800 shadow-md' : 'text-slate-500 hover:text-slate-600'}`}><ArrowUpFromLine size={16} /> {t('wallet_tab_withdraw')}</button>
        <button onClick={() => setTab('SWAP')} className={`flex-1 py-2.5 rounded-xl font-black text-[11px] transition-all flex items-center justify-center gap-2 ${tab === 'SWAP' ? 'bg-white text-slate-800 shadow-md' : 'text-slate-500 hover:text-slate-600'}`}><ArrowLeftRight size={16} /> {t('wallet_tab_swap')}</button>
        <button onClick={() => setTab('INTERNAL')} className={`flex-1 py-2.5 rounded-xl font-black text-[11px] transition-all flex items-center justify-center gap-2 ${tab === 'INTERNAL' ? 'bg-white text-slate-800 shadow-md' : 'text-slate-500 hover:text-slate-600'}`}><Send size={16} /> {t('wallet_tab_internal')}</button>
        <button onClick={() => setTab('HISTORY')} className={`flex-1 py-2.5 rounded-xl font-black text-[11px] transition-all flex items-center justify-center gap-2 ${tab === 'HISTORY' ? 'bg-white text-slate-800 shadow-md' : 'text-slate-500 hover:text-slate-600'}`}><History size={16} /> {t('wallet_tab_history')}</button>
      </div>

      {tab === 'DEPOSIT' && (
        <div className="bg-white/90 p-5 md:p-6 rounded-3xl border-b-4 border-slate-200 shadow-xl space-y-5">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => { setDepositAsset('USDT'); setDepositNetwork('BEP20'); }} className={`px-4 py-2 rounded-xl font-black border-2 ${depositAsset === 'USDT' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>USDT</button>
            <button type="button" onClick={() => { setDepositAsset('USDC'); setDepositNetwork('BEP20'); }} className={`px-4 py-2 rounded-xl font-black border-2 ${depositAsset === 'USDC' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>USDC</button>
            <button type="button" onClick={() => { setDepositAsset('PIX'); setDepositNetwork('PIX'); }} className={`px-4 py-2 rounded-xl font-black border-2 ${depositAsset === 'PIX' ? 'bg-yellow-50 border-yellow-300 text-yellow-800' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>PIX</button>
          </div>

          {depositAsset !== 'PIX' && (
            <div className="flex flex-wrap gap-2">
              {(depositAsset === 'USDT' ? ['BEP20','POLYGON','TRC20','ARBITRUM'] : ['BEP20','ARBITRUM']).map((net) => (
                <button key={net} type="button" onClick={() => setDepositNetwork(net)} className={`px-3 py-2 rounded-xl font-black border-2 text-xs ${depositNetwork === net ? 'bg-slate-800 border-slate-900 text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>{net}</button>
              ))}
            </div>
          )}

          <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4">
            <div className="text-[11px] font-black text-slate-500 uppercase mb-2">{t('wallet_deposit_address')}</div>
            <div className="flex items-center gap-2">
              <input
                value={depositAddress}
                onChange={(e) => setWalletAddresses((prev) => ({ ...(prev || {}), [selectedDepositMethod.key]: e.target.value }))}
                placeholder={t('wallet_address_placeholder')}
                className="flex-1 bg-white border-2 border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-700 text-sm"
              />
              <button
                type="button"
                onClick={() => copyText(selectedDepositMethod.key, depositAddress)}
                disabled={!depositAddress}
                className={`px-3 py-2 rounded-xl font-black border-2 flex items-center gap-2 ${depositAddress ? 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700' : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'}`}
              >
                {copiedKey === selectedDepositMethod.key ? <Check size={16} /> : <Copy size={16} />}
                <span className="hidden sm:inline">{t('wallet_copy')}</span>
              </button>
            </div>
            {selectedDepositMethod.key === 'PIX' && (
              <div className="mt-2 text-xs font-bold text-slate-600">
                {t('wallet_pix_rate', [PIX_USD_BRL.toFixed(2)])}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <div className="text-[11px] font-black text-slate-500 uppercase mb-2">{t('wallet_amount_usd')}</div>
              <input
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                type="number"
                min="1"
                step="0.01"
                className="w-full bg-white border-2 border-slate-200 rounded-2xl px-4 py-3 font-black text-slate-800 text-lg"
              />
              {selectedDepositMethod.key === 'PIX' && (
                <div className="mt-2 text-xs font-bold text-slate-600">
                  {t('wallet_pix_total', [(Number(depositAmount || 0) * PIX_USD_BRL).toFixed(2)])}
                </div>
              )}
            </div>
            <button onClick={handleDeposit} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-lg border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 transition-all">
              {t('wallet_deposit_btn', [formatUSD(1)])}
            </button>
          </div>
        </div>
      )}

      {tab === 'WITHDRAW' && (
        <div className="bg-white/90 p-5 md:p-6 rounded-3xl border-b-4 border-slate-200 shadow-xl space-y-5">
          <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-600">
            {withdrawAsset === 'PIX'
              ? t('wallet_withdraw_rules_pix', [formatUSD(WITHDRAW_MIN_USD), '10%'])
              : t('wallet_withdraw_rules_crypto', [formatUSD(WITHDRAW_MIN_USD), formatUSD(WITHDRAW_FIXED_FEE_USD), '2%'])
            }
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => { setWithdrawAsset('USDT'); setWithdrawNetwork('BEP20'); }} className={`px-4 py-2 rounded-xl font-black border-2 ${withdrawAsset === 'USDT' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>USDT</button>
            <button type="button" onClick={() => { setWithdrawAsset('USDC'); setWithdrawNetwork('BEP20'); }} className={`px-4 py-2 rounded-xl font-black border-2 ${withdrawAsset === 'USDC' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>USDC</button>
            <button type="button" onClick={() => { setWithdrawAsset('PIX'); setWithdrawNetwork('PIX'); }} className={`px-4 py-2 rounded-xl font-black border-2 ${withdrawAsset === 'PIX' ? 'bg-yellow-50 border-yellow-300 text-yellow-800' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>PIX</button>
          </div>

          {withdrawAsset !== 'PIX' && (
            <div className="flex flex-wrap gap-2">
              {(withdrawAsset === 'USDT' ? ['BEP20','POLYGON','TRC20','ARBITRUM'] : ['BEP20','ARBITRUM']).map((net) => (
                <button key={net} type="button" onClick={() => setWithdrawNetwork(net)} className={`px-3 py-2 rounded-xl font-black border-2 text-xs ${withdrawNetwork === net ? 'bg-slate-800 border-slate-900 text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>{net}</button>
              ))}
            </div>
          )}

          <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4">
            <div className="text-[11px] font-black text-slate-500 uppercase mb-2">{t('wallet_withdraw_destination')}</div>
            <div className="flex items-center gap-2">
              <input
                value={withdrawDestination}
                readOnly
                placeholder={t('wallet_withdraw_destination_placeholder')}
                className="flex-1 bg-white border-2 border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-700 text-sm"
              />
              <button
                type="button"
                onClick={() => copyText(withdrawKey, withdrawDestination)}
                disabled={!withdrawDestination}
                className={`px-3 py-2 rounded-xl font-black border-2 flex items-center gap-2 ${withdrawDestination ? 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700' : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'}`}
              >
                {copiedKey === withdrawKey ? <Check size={16} /> : <Copy size={16} />}
                <span className="hidden sm:inline">{t('wallet_copy')}</span>
              </button>
            </div>
            <div className="mt-2 text-xs font-bold text-slate-600">
              {t('wallet_withdraw_destination_hint')}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-black text-slate-500 uppercase mb-2">{t('wallet_amount_usd')}</div>
            <input
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              type="number"
              min={String(WITHDRAW_MIN_USD)}
              step="0.01"
              className="w-full bg-white border-2 border-slate-200 rounded-2xl px-4 py-3 font-black text-slate-800 text-lg"
            />
            <div className="mt-2 text-xs font-bold text-slate-600">
              {(() => {
                const amt = Number(withdrawAmount || 0);
                const fee = withdrawAsset === 'PIX'
                  ? amt * PIX_WITHDRAW_PERCENT_FEE
                  : (WITHDRAW_FIXED_FEE_USD + amt * WITHDRAW_PERCENT_FEE);
                const net = amt - fee;
                return t('wallet_withdraw_preview', [formatUSD(fee), formatUSD(net)]);
              })()}
            </div>
          </div>

          <div className="relative">
            <input
              value={financialPassword}
              onChange={(e) => setFinancialPassword(e.target.value)}
              type={showFinancialPassword ? 'text' : 'password'}
              placeholder={t('wallet_fin_password_placeholder')}
              className="w-full bg-white border-2 border-slate-200 rounded-2xl px-4 py-3 pr-12 font-black text-slate-800"
            />
            <button
              type="button"
              onClick={() => setShowFinancialPassword((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
              aria-label={showFinancialPassword ? t('hide_password') : t('show_password')}
            >
              {showFinancialPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button onClick={handleWithdraw} className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-2xl font-black shadow-lg border-b-4 border-red-700 active:border-b-0 active:translate-y-1 transition-all">
            {t('wallet_withdraw_btn')}
          </button>
        </div>
      )}

      {tab === 'SWAP' && (
        <div className="bg-white/90 p-5 md:p-6 rounded-3xl border-b-4 border-slate-200 shadow-xl space-y-5">
          <div className="flex p-1 bg-slate-200 rounded-2xl">
            <button onClick={() => setSwapDir('USD_TO_CHI')} className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-all ${swapDir === 'USD_TO_CHI' ? 'bg-white text-slate-800 shadow-md' : 'text-slate-500 hover:text-slate-600'}`}>{t('wallet_swap_usd_to_chi')}</button>
            <button onClick={() => setSwapDir('CHI_TO_USD')} className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-all ${swapDir === 'CHI_TO_USD' ? 'bg-white text-slate-800 shadow-md' : 'text-slate-500 hover:text-slate-600'}`}>{t('wallet_swap_chi_to_usd')}</button>
          </div>

          <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-600">
            {swapDir === 'USD_TO_CHI' ? t('wallet_swap_fee_zero') : t('wallet_swap_fee_chi_to_usd', ['2%'])}
          </div>

          <div>
            <div className="text-[11px] font-black text-slate-500 uppercase mb-2">{swapDir === 'USD_TO_CHI' ? t('wallet_amount_usd') : t('wallet_amount_chi')}</div>
            <input
              value={swapAmount}
              onChange={(e) => setSwapAmount(e.target.value)}
              type="number"
              min="0"
              step={swapDir === 'USD_TO_CHI' ? '0.01' : '1'}
              className="w-full bg-white border-2 border-slate-200 rounded-2xl px-4 py-3 font-black text-slate-800 text-lg"
            />
          </div>

          <button onClick={handleSwap} className="w-full bg-slate-800 hover:bg-slate-900 text-white py-4 rounded-2xl font-black shadow-lg border-b-4 border-slate-950 active:border-b-0 active:translate-y-1 transition-all">
            {t('wallet_swap_btn')}
          </button>
        </div>
      )}

      {tab === 'INTERNAL' && (
        <div className="bg-white/90 p-5 md:p-6 rounded-3xl border-b-4 border-slate-200 shadow-xl space-y-5">
          <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-600">
            {t('wallet_internal_rules', [formatUSD(1)])}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input value={transferToUsername} onChange={(e) => setTransferToUsername(e.target.value)} placeholder={t('wallet_to_username')} className="w-full bg-white border-2 border-slate-200 rounded-2xl px-4 py-3 font-bold text-slate-700" />
            <input value={transferToName} onChange={(e) => setTransferToName(e.target.value)} placeholder={t('wallet_to_name')} className="w-full bg-white border-2 border-slate-200 rounded-2xl px-4 py-3 font-bold text-slate-700" />
            <input value={transferToEmail} onChange={(e) => setTransferToEmail(e.target.value)} placeholder={t('wallet_to_email')} className="w-full bg-white border-2 border-slate-200 rounded-2xl px-4 py-3 font-bold text-slate-700" />
          </div>

          <div>
            <div className="text-[11px] font-black text-slate-500 uppercase mb-2">{t('wallet_amount_usd')}</div>
            <input
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              type="number"
              min="1"
              step="0.01"
              className="w-full bg-white border-2 border-slate-200 rounded-2xl px-4 py-3 font-black text-slate-800 text-lg"
            />
          </div>

          <button onClick={handleInternalTransfer} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg border-b-4 border-blue-700 active:border-b-0 active:translate-y-1 transition-all">
            {t('wallet_internal_btn')}
          </button>
        </div>
      )}

      {tab === 'HISTORY' && (
        <div className="bg-white/90 p-5 md:p-6 rounded-3xl border-b-4 border-slate-200 shadow-xl space-y-5">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'ALL', label: t('wallet_hist_all') },
              { id: 'DEPOSIT', label: t('wallet_tab_deposit') },
              { id: 'WITHDRAW', label: t('wallet_tab_withdraw') },
              { id: 'SWAP', label: t('wallet_tab_swap') },
              { id: 'INTERNAL', label: t('wallet_tab_internal') },
            ].map((f) => (
              <button key={f.id} type="button" onClick={() => setHistoryFilter(f.id)} className={`px-4 py-2 rounded-xl font-black border-2 text-sm ${historyFilter === f.id ? 'bg-slate-800 text-white border-slate-900' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>{f.label}</button>
            ))}
          </div>

          <div className="space-y-3">
            {historyItems.length === 0 ? (
              <div className="text-center text-slate-500 font-bold bg-slate-50 border-2 border-slate-200 rounded-2xl p-6">
                {t('wallet_hist_empty')}
              </div>
            ) : (
              historyItems.map((h) => (
                <div key={h.id} className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-black text-slate-800">
                        {h.type === 'DEPOSIT' ? t('wallet_hist_deposit') :
                        h.type === 'WITHDRAW' ? t('wallet_hist_withdraw') :
                        h.type === 'SWAP' ? t('wallet_hist_swap') :
                        t('wallet_hist_internal')}
                      </div>
                      <div className="text-xs font-bold text-slate-500 truncate">{formatDateTime(h.createdAt)}</div>
                      {h.type === 'INTERNAL' && (
                        <div className="text-xs font-bold text-slate-600 mt-1">
                          {t('wallet_hist_to', [h.to?.username || ''])} • {h.to?.name || ''} • {h.to?.email || ''}
                        </div>
                      )}
                      {h.type === 'DEPOSIT' && (
                        <div className="text-xs font-bold text-slate-600 mt-1">
                          {h.details?.asset || ''} {h.details?.network ? `(${h.details.network})` : ''}{h.details?.pixBRL ? ` • R$ ${Number(h.details.pixBRL).toFixed(2)}` : ''}
                        </div>
                      )}
                      {h.type === 'SWAP' && (
                        <div className="text-xs font-bold text-slate-600 mt-1">
                          {h.direction === 'USD_TO_CHI' ? t('wallet_swap_usd_to_chi') : t('wallet_swap_chi_to_usd')}{h.feeUSD ? ` • ${t('wallet_fee')}: ${formatUSD(h.feeUSD)}` : ''}
                        </div>
                      )}
                      {h.type === 'WITHDRAW' && (
                        <div className="text-xs font-bold text-slate-600 mt-1">
                          {(h.details?.asset || h.details?.network) && (
                            <span>
                              {h.details?.asset || ''}{h.details?.network ? ` (${h.details.network})` : ''} •{' '}
                            </span>
                          )}
                          {t('wallet_fee')}: {formatUSD(h.feeUSD || 0)} • {t('wallet_net')}: {formatUSD(h.netUSD || 0)}
                        </div>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      {h.type === 'SWAP' ? (
                        <div className="font-black text-slate-800">
                          {h.direction === 'USD_TO_CHI'
                            ? `${formatUSD(h.amountUSD)} → ${formatCHI(h.amountCHI)} CHI`
                            : `${formatCHI(h.amountCHI)} CHI → ${formatUSD(h.amountUSD)}`
                          }
                        </div>
                      ) : (
                        <div className={`font-black ${h.type === 'WITHDRAW' || h.type === 'INTERNAL' ? 'text-red-600' : 'text-emerald-600'}`}>
                          {h.type === 'WITHDRAW' || h.type === 'INTERNAL' ? `-${formatUSD(h.amountUSD)}` : `+${formatUSD(h.amountUSD)}`}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletScreen;
