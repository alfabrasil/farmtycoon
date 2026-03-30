import React, { useMemo, useRef } from 'react';

const COLORS = {
  VERMELHO: { hex: '#dc2626', dark: '#7f1d1d' },
  AZUL: { hex: '#2563eb', dark: '#1e3a8a' },
  VERDE: { hex: '#16a34a', dark: '#14532d' },
  AMARELO: { hex: '#ca8a04', dark: '#713f12' },
  red: { hex: '#dc2626', dark: '#7f1d1d' },
  blue: { hex: '#2563eb', dark: '#1e3a8a' },
  green: { hex: '#16a34a', dark: '#14532d' },
  yellow: { hex: '#ca8a04', dark: '#713f12' }
};

const ELEMENTS = {
  fire: { tailColor1: '#ff4500', tailColor2: '#ffcc00' },
  earth: { tailColor1: '#556b2f', tailColor2: '#8bc34a' },
  water: { tailColor1: '#00bfff', tailColor2: '#e0ffff' },
  air: { tailColor1: '#b0bec5', tailColor2: '#ffffff' }
};

const mapElement = (element) => {
  if (!element) return 'fire';
  const v = String(element).toLowerCase();
  if (v === 'fogo') return 'fire';
  if (v === 'agua') return 'water';
  if (v === 'terra') return 'earth';
  if (v === 'ar') return 'air';
  if (v === 'fire' || v === 'water' || v === 'earth' || v === 'air') return v;
  return 'fire';
};

const mapColor = (colorKey) => {
  if (!colorKey) return COLORS.VERMELHO;
  const key = String(colorKey).toUpperCase();
  if (COLORS[key]) return COLORS[key];
  const low = String(colorKey).toLowerCase();
  if (COLORS[low]) return COLORS[low];
  return COLORS.VERMELHO;
};

const RoosterSprite = ({ colorKey = 'VERMELHO', size = 120, className = '', isOpponent = false, element = 'FOGO' }) => {
  const uidRef = useRef(Math.random().toString(36).slice(2));
  const uid = uidRef.current;

  const el = useMemo(() => mapElement(element), [element]);
  const col = useMemo(() => mapColor(colorKey), [colorKey]);
  const bodyColor = col.hex;
  const darkColor = col.dark;
  const tailFill1 = ELEMENTS[el]?.tailColor1 || ELEMENTS.fire.tailColor1;
  const tailFill2 = ELEMENTS[el]?.tailColor2 || ELEMENTS.fire.tailColor2;

  const gradBodyId = `gradBody-${uid}`;
  const gradTailId = `gradTail-${uid}`;
  const glowId = `glow-${uid}`;

  const tailGroup = useMemo(() => {
    if (el === 'fire') {
      return (
        <g className="tail-feathers">
          <path d="M70,180 C20,150 -10,80 60,40 C70,60 80,100 100,140 Z" fill={`url(#${gradTailId})`}>
            <animate attributeName="d" dur="0.8s" repeatCount="indefinite" values="M70,180 C20,150 -10,80 60,40 C70,60 80,100 100,140 Z; M70,180 C15,145 -15,75 55,35 C65,55 75,95 100,140 Z; M70,180 C20,150 -10,80 60,40 C70,60 80,100 100,140 Z" />
          </path>
          <path d="M80,180 C40,130 20,40 100,20 C110,50 120,90 130,140 Z" fill={`url(#${gradTailId})`} opacity="0.8">
            <animate attributeName="d" dur="1s" repeatCount="indefinite" values="M80,180 C40,130 20,40 100,20 C110,50 120,90 130,140 Z; M80,180 C35,125 15,35 105,15 C115,45 125,85 130,140 Z; M80,180 C40,130 20,40 100,20 C110,50 120,90 130,140 Z" />
          </path>
          <path d="M90,180 C60,110 50,20 140,40 C140,70 140,110 140,160 Z" fill={`url(#${gradTailId})`} opacity="0.6">
            <animate attributeName="d" dur="1.2s" repeatCount="indefinite" values="M90,180 C60,110 50,20 140,40 C140,70 140,110 140,160 Z; M90,180 C55,105 45,15 145,35 C145,65 145,105 140,160 Z; M90,180 C60,110 50,20 140,40 C140,70 140,110 140,160 Z" />
          </path>
        </g>
      );
    }

    if (el === 'water') {
      return (
        <g className="tail-feathers">
          <path d="M70,180 C30,160 20,100 80,60 C90,80 100,120 110,150 Z" fill={`url(#${gradTailId})`} stroke={darkColor} strokeWidth="1" />
          <path d="M85,185 C50,140 40,60 110,40 C120,70 130,110 135,160 Z" fill={`url(#${gradTailId})`} opacity="0.7" stroke={darkColor} strokeWidth="1" />
          <path d="M100,190 C70,130 80,40 150,60 C150,90 150,130 140,170 Z" fill={`url(#${gradTailId})`} opacity="0.5" stroke={darkColor} strokeWidth="1" />
          <animateTransform attributeName="transform" type="translate" values="0,0; 2,0; 0,0" dur="2s" repeatCount="indefinite" />
        </g>
      );
    }

    if (el === 'earth') {
      return (
        <g className="tail-feathers">
          <path d="M70,180 L30,120 L60,80 L100,140 Z" fill={tailFill1} stroke="#2e2e2e" strokeWidth="2" />
          <path d="M80,180 L50,80 L90,40 L120,140 Z" fill={tailFill2} stroke="#2e2e2e" strokeWidth="2" />
          <path d="M95,180 L80,40 L130,20 L145,150 Z" fill={tailFill1} stroke="#2e2e2e" strokeWidth="2" />
        </g>
      );
    }

    return (
      <g className="tail-feathers">
        <path d="M70,180 C20,160 10,100 70,80 C80,100 90,130 100,160 Z" fill={tailFill1} opacity="0.6" />
        <path d="M85,180 C40,140 30,60 110,50 C120,80 130,110 135,160 Z" fill={tailFill2} opacity="0.4" />
        <path d="M100,180 C70,120 80,30 150,50 C150,80 150,120 140,170 Z" fill={tailFill1} opacity="0.2" />
        <animateTransform attributeName="transform" type="translate" values="0,0; 0,-8; 0,0" dur="4s" repeatCount="indefinite" />
      </g>
    );
  }, [el, gradTailId, darkColor, tailFill1, tailFill2]);

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size, transform: isOpponent ? 'scaleX(-1)' : 'none' }}>
      <svg width="100%" height="100%" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
        <defs>
          <linearGradient id={gradBodyId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={bodyColor} stopOpacity="1" />
            <stop offset="100%" stopColor={darkColor} stopOpacity="1" />
          </linearGradient>
          <linearGradient id={gradTailId} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={tailFill1} stopOpacity="1" />
            <stop offset="100%" stopColor={tailFill2} stopOpacity="1" />
          </linearGradient>
          <filter id={glowId}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g>
          {tailGroup}

          <path
            d="M100,100 C80,80 130,45 170,60 C210,75 220,120 200,170 C180,220 130,235 90,210 C65,190 60,140 100,100"
            fill={`url(#${gradBodyId})`}
            stroke="#0f172a"
            strokeWidth="2.5"
          />

          <path
            className="rooster-wing"
            d="M125,135 C125,135 175,115 185,165 C155,185 130,170 125,135"
            fill={darkColor}
            opacity="0.8"
            stroke="#0f172a"
            strokeWidth="1.5"
          />
          <path d="M140,145 C140,145 170,130 175,160 C155,175 140,165 140,145" fill="rgba(0,0,0,0.2)" stroke="none" />

          <g transform="translate(155, 45)">
            <path
              d="M-10,25 C-25,-5 -10,-15 5,5 C10,-15 30,-15 35,10 C45,-10 65,0 55,30 C50,45 20,45 10,40"
              fill="#ef4444"
              stroke="#7f1d1d"
              strokeWidth="2"
            />
            <path d="M25,55 C20,75 40,75 35,55" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1.5" />
            <circle cx="25" cy="40" r="32" fill={`url(#${gradBodyId})`} stroke="#0f172a" strokeWidth="2.5" />
            <path d="M52,35 L75,42 L52,52 Z" fill="#fbbf24" stroke="#b45309" strokeWidth="1.5" />
            <path d="M52,42 L65,42" stroke="#b45309" strokeWidth="1" opacity="0.5" />
            <circle cx="35" cy="38" r="7" fill="white" />
            <circle cx="37" cy="38" r="4" fill="black" />
            <circle cx="38" cy="36" r="1.5" fill="white" />
            <path d="M28,30 L45,34" stroke="black" strokeWidth="3" strokeLinecap="round" />
          </g>

          <g stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" fill="none">
            <path d="M125,220 L125,260 L105,270 M125,260 L145,270" />
            <path d="M125,245 L115,245" strokeWidth="3" />
            <path d="M165,210 L165,250 L145,260 M165,250 L185,260" />
            <path d="M165,235 L155,235" strokeWidth="3" />
          </g>
        </g>
      </svg>
    </div>
  );
};

export default RoosterSprite;
