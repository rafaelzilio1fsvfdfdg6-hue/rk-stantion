import React, { useState, useEffect, useCallback } from 'react';
import { generateTVChannels } from '../../services/geminiService';
import { TVChannel } from '../../types';

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-[var(--accent-color)]">
        <svg className="animate-spin h-10 w-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 text-lg font-orbitron">Sintonizando canais da Grid...</p>
    </div>
);

const Player: React.FC<{ channel: TVChannel }> = ({ channel }) => (
    <div className="w-full h-full bg-black rounded-lg overflow-hidden border border-[rgba(var(--accent-color-rgb),0.3)]">
        <iframe
            key={channel.id}
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${channel.videoEmbedId}?autoplay=1&controls=1&modestbranding=1&rel=0`}
            title={`Player de TV: ${channel.name}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
        ></iframe>
    </div>
);

const LiveTVApp: React.FC = () => {
    const [channels, setChannels] = useState<TVChannel[]>([]);
    const [selectedChannel, setSelectedChannel] = useState<TVChannel | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchChannels = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const channelList = await generateTVChannels();
            setChannels(channelList);
            setSelectedChannel(channelList[0] || null);
        } catch (err: any) {
            setError(err.message || 'Falha ao buscar canais. A conexão pode estar instável.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchChannels();
    }, [fetchChannels]);

    return (
        <div className="h-full flex flex-col bg-gray-900/80 text-cyan-300 font-sans">
            <header className="p-3 bg-black/50 border-b-2 border-[rgba(var(--accent-color-rgb),0.5)] flex-shrink-0">
                <h2 className="text-2xl font-orbitron text-[var(--accent-color)]">TV Ao Vivo</h2>
            </header>

            <div className="flex-grow flex flex-col md:flex-row min-h-0">
                {/* EPG / Channel List */}
                <aside className="w-full md:w-1/3 lg:w-1/4 p-2 bg-black/30 overflow-y-auto border-r border-[rgba(var(--accent-color-rgb),0.3)]">
                    <h3 className="font-bold text-white p-2">Guia de Programação</h3>
                    {isLoading && channels.length === 0 ? (
                        <p className="text-gray-400 text-sm p-2">Buscando sinal...</p>
                    ) : (
                        <ul className="space-y-1">
                            {channels.map((ch, index) => (
                                <li key={ch.id}>
                                    <button
                                        onClick={() => setSelectedChannel(ch)}
                                        className={`w-full text-left p-3 rounded-md transition-colors ${selectedChannel?.id === ch.id ? 'bg-[rgba(var(--accent-color-rgb),0.3)]' : 'hover:bg-[rgba(var(--accent-color-rgb),0.15)]'}`}
                                    >
                                        <p className="font-bold text-white">{`${index + 1}. ${ch.name}`}</p>
                                        <p className="text-xs text-gray-300 truncate">{ch.currentProgram}</p>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </aside>

                {/* Player and Info */}
                <main className="flex-1 p-4 flex flex-col gap-4">
                    {isLoading && <LoadingSpinner />}
                    {error && <div className="flex-grow flex items-center justify-center text-red-400 font-bold text-center">{error}</div>}
                    {!isLoading && selectedChannel && (
                        <>
                            <div className="w-full aspect-video flex-shrink-0">
                                <Player channel={selectedChannel} />
                            </div>
                            <div className="text-white">
                                <h3 className="text-xl font-bold font-orbitron">{selectedChannel.name}</h3>
                                <p className="text-md mt-1">Agora: <span className="text-cyan-200">{selectedChannel.currentProgram}</span></p>
                                <p className="text-sm text-gray-400 mt-2">{selectedChannel.description}</p>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default LiveTVApp;
