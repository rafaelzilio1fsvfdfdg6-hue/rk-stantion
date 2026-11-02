import React, { useState } from 'react';

interface Soundscape {
    id: string;
    title: string;
    description: string;
    embedId: string;
    icon: string;
}

const soundscapes: Soundscape[] = [
    {
        id: 'neon_rain',
        title: 'Chuva Neon',
        description: 'O som suave da chuva caindo sobre uma metrópole cyberpunk.',
        embedId: '2sEQsY6sFFs',
        icon: '🌧️',
    },
    {
        id: 'cyber_cafe',
        title: 'Café Cyberpunk',
        description: 'O murmúrio ambiente de um café movimentado no ano de 2077.',
        embedId: 'lq_Se0m_b-A',
        icon: '☕',
    },
    {
        id: 'data_stream',
        title: 'Fluxo de Dados',
        description: 'Sons eletrônicos e pulsos de dados para foco profundo.',
        embedId: 'Wzft_SstA5I',
        icon: '💾',
    },
    {
        id: 'ship_core',
        title: 'Núcleo da Nave',
        description: 'O zumbido constante do motor de uma nave estelar viajando pelo vazio.',
        embedId: 'PZp_3p3eD0c',
        icon: '🚀',
    },
];

const SoundscapeApp: React.FC = () => {
    const [activeSound, setActiveSound] = useState<Soundscape | null>(null);

    const toggleSound = (sound: Soundscape) => {
        if (activeSound?.id === sound.id) {
            setActiveSound(null); // Stop sound
        } else {
            setActiveSound(sound); // Play sound
        }
    };

    return (
        <div className="h-full flex flex-col bg-gray-900/80 text-cyan-300 font-sans p-4">
            <header className="text-center pb-4 border-b-2 border-[rgba(var(--accent-color-rgb),0.5)]">
                <h2 className="text-3xl font-orbitron text-[var(--accent-color)]">Paisagem Sonora</h2>
                <p className="text-gray-400 mt-1">Sons de ambiente para foco e relaxamento.</p>
            </header>

            <main className="flex-grow p-4 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {soundscapes.map((sound) => (
                        <button
                            key={sound.id}
                            onClick={() => toggleSound(sound)}
                            className={`p-6 rounded-lg text-left transition-all duration-300 border-2 ${
                                activeSound?.id === sound.id
                                    ? 'bg-[rgba(var(--accent-color-rgb),0.3)] border-[var(--accent-color)] shadow-[0_0_20px_rgba(var(--accent-color-rgb),0.4)]'
                                    : 'bg-black/50 border-gray-700 hover:border-cyan-500'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="text-4xl">{sound.icon}</div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{sound.title}</h3>
                                    <p className="text-sm text-gray-400 mt-1">{sound.description}</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </main>

            {activeSound && (
                <footer className="w-full bg-black/50 p-3 border-t border-[rgba(var(--accent-color-rgb),0.3)] flex-shrink-0 animate-scale-in">
                    <div className="flex items-center justify-between">
                        <p className="text-white">
                            Tocando: <span className="font-bold">{activeSound.title}</span>
                        </p>
                        <button
                            onClick={() => setActiveSound(null)}
                            className="px-4 py-1 bg-red-500 text-white font-bold rounded-md hover:bg-red-600"
                        >
                            Parar
                        </button>
                    </div>
                    <div className="w-0 h-0 overflow-hidden">
                        <iframe
                            key={activeSound.id}
                            width="1"
                            height="1"
                            src={`https://www.youtube.com/embed/${activeSound.embedId}?autoplay=1&loop=1&controls=0&playlist=${activeSound.embedId}`}
                            title="Soundscape Player"
                            frameBorder="0"
                            allow="autoplay"
                        ></iframe>
                    </div>
                </footer>
            )}
        </div>
    );
};

export default SoundscapeApp;
