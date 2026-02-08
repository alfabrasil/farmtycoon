import React, { useMemo } from 'react';
import { getChickenAssets } from '../../utils/assetResolver';

const ChickenVisual = ({ chicken, dayCount, overrideStatus = null, className = '' }) => {
  // Memoiza os assets para evitar recálculos desnecessários
  const assets = useMemo(() => {
    return getChickenAssets(chicken, dayCount || 0, overrideStatus);
  }, [chicken, dayCount, overrideStatus]);

  // Se for bebê (não adulto), por enquanto não temos sprites definidos, 
  // então retornamos null para que o ChickenCard use o fallback (emoji).
  // Ajuste isso se futuramente houver sprites de bebê.
  // Nota: A lógica de verificação de adulto (age_days >= 30) está no ChickenCard.
  // Aqui assumimos que se o componente for chamado, é para renderizar o visual completo.
  // Mas se quisermos ser defensivos:
  // if (chicken.age_days < (chicken.adult_threshold || 30)) return null;

  return (
    <div className={`relative w-24 h-24 flex items-center justify-center ${className}`}>
      {/* 1. LEGS (Z-10) */}
      {assets.legs && (
        <img 
          src={assets.legs} 
          alt="legs" 
          className="absolute inset-0 w-full h-full object-contain z-10" 
        />
      )}

      {/* 2. WINGS (Z-15) */}
      {assets.wings && (
        <img 
          src={assets.wings} 
          alt="wings" 
          className="absolute inset-0 w-full h-full object-contain z-15" 
        />
      )}

      {/* 3. BODY (Z-20) */}
      {assets.body && (
        <img 
          src={assets.body} 
          alt="body" 
          className="absolute inset-0 w-full h-full object-contain z-20" 
        />
      )}

      {/* 4. BODY ADDONS (Z-25) */}
      {assets.addonBody && (
        <img 
          src={assets.addonBody} 
          alt="body addon" 
          className="absolute inset-0 w-full h-full object-contain z-25" 
        />
      )}

      {/* 5. EYES (Z-30) */}
      {assets.eyes && (
        <img 
          src={assets.eyes} 
          alt="eyes" 
          className="absolute inset-0 w-full h-full object-contain z-30" 
        />
      )}

      {/* 6. HEAD ADDONS (Z-40) */}
      {assets.addonHead && (
        <img 
          src={assets.addonHead} 
          alt="head addon" 
          className="absolute inset-0 w-full h-full object-contain z-40" 
        />
      )}

      {/* 7. FX (Z-50) */}
      {assets.fx && (
        <img 
          src={assets.fx} 
          alt="fx" 
          className="absolute inset-0 w-full h-full object-contain z-50 animate-pulse" 
        />
      )}
    </div>
  );
};

export default ChickenVisual;
