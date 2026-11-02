import React, { useState, useEffect } from 'react';

const BootLine: React.FC<{ text: string; delay: number }> = ({ text, delay }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <p className={`text-cyan-400 text-sm md:text-base ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <span className="text-green-400 mr-2">{'>'}</span> {text}
    </p>
  );
};

const BootScreen: React.FC = () => {
  return (
    <div className="w-screen h-screen bg-[#000000] flex flex-col items-center justify-center font-sans p-4 select-none">
      <div className="flex flex-col items-center justify-center space-y-12">
        {/* Windows 10 4-pane Logo */}
        <div className="grid grid-cols-2 gap-2 w-28 h-28 transform -skew-y-3">
          <div className="bg-[#0078D7] rounded-sm shadow-lg shadow-blue-500/20" />
          <div className="bg-[#0078D7] rounded-sm shadow-lg shadow-blue-500/20" />
          <div className="bg-[#0078D7] rounded-sm shadow-lg shadow-blue-500/20" />
          <div className="bg-[#0078D7] rounded-sm shadow-lg shadow-blue-500/20" />
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-3xl font-semibold text-white tracking-wide">Widons 2.0</h1>
          {/* Windows 10 circling dots loader */}
          <div className="flex items-center justify-center space-x-2 pt-2">
            <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '450ms' }} />
            <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '600ms' }} />
          </div>
          <p className="text-sm text-gray-400 font-normal">Iniciando sistema...</p>
        </div>
      </div>
    </div>
  );
};

export default BootScreen;