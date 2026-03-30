import React, { useEffect, useState } from 'react';

const ROOSTERS = [
  '/assets/booster/rooster_red.svg',
  '/assets/booster/rooster_blue.svg',
  '/assets/booster/rooster_green.svg',
  '/assets/booster/rooster_yellow.svg',
];

const RoosterCycler = ({ size = 96, intervalMs = 600 }) => {
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % ROOSTERS.length);
        setFade(true);
      }, 120);
    }, intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);

  return (
    <div
      className="rounded-full bg-pink-50 border-4 border-pink-100 shadow-inner flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <img
        src={ROOSTERS[idx]}
        alt="Rooster"
        className={`object-contain drop-shadow-md ${fade ? 'opacity-100 scale-100' : 'opacity-0 scale-90'} transition-all duration-150`}
        style={{ width: size * 0.7, height: size * 0.7 }}
      />
    </div>
  );
};

export default RoosterCycler;

