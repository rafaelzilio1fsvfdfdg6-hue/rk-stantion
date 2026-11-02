import React, { useState, useEffect, useMemo } from 'react';

const Chart: React.FC<{ data: number[]; color: string; label: string; unit: string }> = ({ data, color, label, unit }) => {
    const maxVal = Math.max(...data, 1);
    const points = data.map((d, i) => `${(i / (data.length -1)) * 100},${100 - (d / maxVal) * 90}`).join(' ');

    return (
        <div className="w-full">
            <div className="flex justify-between items-baseline">
                <h3 className="font-bold text-lg text-white">{label}</h3>
                <p className="font-orbitron text-2xl" style={{color}}>
                    {data[data.length - 1].toFixed(label === 'CPU' ? 1 : 0)}<span className="text-lg">{unit}</span>
                </p>
            </div>
            <svg viewBox="0 0 100 100" className="w-full h-24 bg-black/50 rounded-md mt-1">
                <polyline
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    points={points}
                />
                 <polyline
                    fill={color}
                    stroke="none"
                    opacity="0.2"
                    points={`0,100 ${points} 100,100`}
                />
            </svg>
        </div>
    );
};

const SystemMonitorApp: React.FC = () => {
    const initialData = () => Array(30).fill(0);
    const [cpuData, setCpuData] = useState(initialData);
    const [memData, setMemData] = useState(initialData);
    const [netData, setNetData] = useState(initialData);
    
    useEffect(() => {
        const interval = setInterval(() => {
            setCpuData(prev => [...prev.slice(1), Math.random() * 80 + 10]);
            setMemData(prev => [...prev.slice(1), Math.random() * 4000 + 2000]);
            setNetData(prev => [...prev.slice(1), Math.random() * 100]);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-full bg-gray-900/50 text-cyan-300 p-4 font-sans overflow-y-auto">
            <h2 className="text-2xl font-orbitron text-[var(--accent-color)] mb-4 border-b-2 border-[rgba(var(--accent-color-rgb),0.5)] pb-2">Monitor do Sistema</h2>
            <div className="space-y-6">
                <Chart data={cpuData} color="#ff4f4f" label="CPU" unit="%" />
                <Chart data={memData} color="#00f0ff" label="Memória" unit=" MB" />
                <Chart data={netData} color="#00ff6a" label="Rede" unit=" Mbps" />
            </div>
        </div>
    );
};

export default SystemMonitorApp;