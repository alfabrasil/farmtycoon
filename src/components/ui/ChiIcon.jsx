import React from 'react';

const ChiIcon = ({ className = 'w-4 h-4', outlined = true }) => {
  const style = outlined ? { filter: 'drop-shadow(0.6px 0 #000) drop-shadow(-0.6px 0 #000) drop-shadow(0 0.6px #000) drop-shadow(0 -0.6px #000)' } : undefined;
  return <img src="/assets/logo/logo_chi.png" alt="CHI" className={`inline-block align-middle object-contain ${className}`} style={style} />;
};

export default ChiIcon;
