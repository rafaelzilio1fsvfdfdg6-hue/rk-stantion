import React, { useState, useEffect, useRef } from 'react';

const TRACKS = [
    { title: 'Synthwave Odyssey', artist: 'Windows Audio Core', duration: '3:45', stream: 'https://cdn.freesound.org/previews/612/612089_11861866-lq.mp3' },
    { title: 'Chill Cyber Rain', artist: 'Widons 2.0 Ambience', duration: '2:30', stream: 'https://cdn.freesound.org/previews/531/531947_7037-lq.mp3' },
    { title: '8-Bit Retro Pulse', artist: 'Arcade Grid', duration: '1:50', stream: 'https://cdn.freesound.org/previews/442/442943_9159316-lq.mp3' },
];

const MediaPlayerApp: React.FC = () => {
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(80);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const track = TRACKS[currentTrackIndex];

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(true));
        }
    };

    const nextTrack = () => {
        setCurrentTrackIndex((currentTrackIndex + 1) % TRACKS.length);
        setIsPlaying(true);
    };

    const prevTrack = () => {
        setCurrentTrackIndex((currentTrackIndex - 1 + TRACKS.length) % TRACKS.length);
        setIsPlaying(true);
    };

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.src = track.stream;
            audioRef.current.volume = volume / 100;
            if (isPlaying) {
                audioRef.current.play().catch(() => {});
            }
        }
    }, [currentTrackIndex]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume / 100;
        }
    }, [volume]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (audioRef.current && isPlaying) {
                const dur = audioRef.current.duration || 100;
                const cur = audioRef.current.currentTime || 0;
                setProgress((cur / dur) * 100);
            }
        }, 500);
        return () => clearInterval(interval);
    }, [isPlaying]);

    return (
        <div className="h-full flex flex-col bg-[#101520] text-white font-sans select-none">
            {/* Visualizer / Artwork */}
            <div className="flex-grow flex flex-col items-center justify-center p-8 bg-gradient-to-b from-[#182238] to-[#101520] relative overflow-hidden">
                <audio ref={audioRef} onEnded={nextTrack} />
                
                {/* Visualizer animation */}
                <div className="w-40 h-40 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-1 shadow-2xl flex items-center justify-center mb-6">
                    <div className="w-full h-full bg-[#101520] rounded-xl flex items-center justify-center relative overflow-hidden">
                        <div className="flex items-end gap-1.5 h-20">
                            {[40, 70, 30, 90, 60, 80, 50, 95, 35, 75].map((h, i) => (
                                <div
                                    key={i}
                                    className="w-2 bg-gradient-to-t from-blue-500 to-cyan-300 rounded-t-sm transition-all duration-300"
                                    style={{
                                        height: isPlaying ? `${Math.min(100, Math.max(15, h * (Math.random() * 0.6 + 0.7)))}%` : '15%',
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <h3 className="text-2xl font-bold font-orbitron text-white text-center">{track.title}</h3>
                <p className="text-sm text-cyan-400 mt-1">{track.artist}</p>

                {/* Progress bar */}
                <div className="w-full max-w-md mt-6">
                    <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1.5">
                        <span>0:00</span>
                        <span>{track.duration}</span>
                    </div>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="bg-[#0b0e14] border-t border-gray-800 p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Volume:</span>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={e => setVolume(parseInt(e.target.value))}
                        className="w-24 cursor-pointer accent-cyan-400"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <button onClick={prevTrack} className="p-2 rounded-full hover:bg-white/10 transition text-gray-300">
                        ⏮️
                    </button>
                    <button
                        onClick={togglePlay}
                        className="w-12 h-12 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold flex items-center justify-center text-xl shadow-lg transition transform hover:scale-105"
                    >
                        {isPlaying ? '⏸' : '▶'}
                    </button>
                    <button onClick={nextTrack} className="p-2 rounded-full hover:bg-white/10 transition text-gray-300">
                        ⏭️
                    </button>
                </div>

                <div className="text-xs text-gray-400">
                    Faixa {currentTrackIndex + 1} de {TRACKS.length}
                </div>
            </div>
        </div>
    );
};

export default MediaPlayerApp;
