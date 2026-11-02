
import React, { useState, useEffect } from 'react';

const Clock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  return (
    <div className="font-orbitron text-cyan-400 text-xl md:text-2xl bg-black/50 px-4 py-2 rounded-lg border border-cyan-500/30 shadow-[0_0_10px_rgba(0,240,255,0.3)]">
      {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </div>
  );
};

export default Clock;
