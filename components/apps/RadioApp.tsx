import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateRadioStations } from '../../services/geminiService';
import { RadioStation } from '../../types';

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-[var(--accent-color)]">
        <svg className="animate-spin h-10 w-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 text-lg font-orbitron">Varrendo frequências...</p>
    </div>
);

const RadioApp: React.FC = () => {
    const [stations, setStations] = useState<RadioStation[]>([]);
    const [selectedStation, setSelectedStation] = useState<RadioStation | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStations = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const stationList = await generateRadioStations();
            setStations(stationList);
        } catch (err: any) {
            setError(err.message || 'Falha ao buscar estações. A conexão pode estar instável.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStations();
    }, [fetchStations]);

    return (
        <div
            className="h-full flex flex-col bg-gray-900/80 text-cyan-300 font-sans bg-cover bg-center"
            style={{ backgroundImage: `radial-gradient(circle at top, rgba(13, 13, 26, 0.8), #0d0d1a), linear-gradient(rgba(var(--accent-color-rgb),0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--accent-color-rgb),0.15) 1px, transparent 1px)`, backgroundSize: '100% 100%, 50px 50px, 50px 50px' }}
        >
            <header className="p-3 text-center bg-black/30 border-b-2 border-[rgba(var(--accent-color-rgb),0.5)] flex-shrink-0">
                <h2 className="text-3xl font-orbitron text-[var(--accent-color)] tracking-widest">RÁDIO ORBITAL</h2>
            </header>

            <main className="flex-grow flex flex-col items-center justify-center p-4 min-h-0">
                {isLoading && <LoadingSpinner />}
                {error && <div className="text-red-400 font-bold">{error}</div>}
                
                {selectedStation && (
                    <div className="flex flex-col items-center text-center animate-scale-in">
                        <p className="text-gray-400">Sintonizado em:</p>
                        <h3 className="text-4xl font-orbitron text-white mt-1">{selectedStation.name}</h3>
                        <p className="text-lg text-cyan-400">{selectedStation.genre}</p>
                        
                        {/* Fake visualizer */}
                        <div className="w-64 h-24 flex justify-center items-end gap-1 mt-6">
                            {[...Array(20)].map((_, i) => (
                                <div key={i} className="w-3 bg-[var(--accent-color)] rounded-t-full" style={{ height: `${Math.random() * 80 + 20}%`, animation: `bar-wave 0.${5 + (i%5)}s ease-in-out infinite alternate` }}></div>
                            ))}
                        </div>
                        <style>{`@keyframes bar-wave { from { height: 10%; } to { height: 100%; } }`}</style>

                        {/* Hidden player */}
                        <div className="w-0 h-0 overflow-hidden">
                           <iframe
                                key={selectedStation.id}
                                width="1" height="1"
                                src={`https://www.youtube.com/embed/${selectedStation.audioStreamUrl}?autoplay=1&controls=0&loop=1&playlist=${selectedStation.audioStreamUrl}`}
                                title="Player de Rádio" frameBorder="0" allow="autoplay"
                           ></iframe>
                        </div>
                    </div>
                )}
            </main>

            <footer className="w-full bg-black/50 border-t border-[rgba(var(--accent-color-rgb),0.3)] p-2 flex-shrink-0">
                <h4 className="text-center font-bold mb-2">Estações Disponíveis</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                    {stations.map(station => (
                        <button 
                            key={station.id}
                            onClick={() => setSelectedStation(station)}
                            className={`p-3 rounded-lg text-center transition-colors border-2 ${selectedStation?.id === station.id ? 'bg-[var(--accent-color)] text-black border-[var(--accent-color)]' : 'bg-black/50 border-transparent hover:border-[var(--accent-color)]'}`}
                        >
                            <p className="font-bold truncate">{station.name}</p>
                            <p className="text-xs opacity-80 truncate">{station.genre}</p>
                        </button>
                    ))}
                </div>
            </footer>
        </div>
    );
};

export default RadioApp;
