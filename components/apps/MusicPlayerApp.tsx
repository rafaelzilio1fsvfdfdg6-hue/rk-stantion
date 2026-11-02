import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Video } from '../../types';
import { generateVideoList } from '../../services/geminiService';
import { LopersIcon, ProblemsIcon, PlaylistIcon } from '../../constants';

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-[var(--accent-color)]">
        <svg className="animate-spin h-10 w-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 text-lg font-orbitron">Conectando à Grid...</p>
    </div>
);

const VideoCard: React.FC<{ video: Video; onClick: () => void, layout?: 'grid' | 'list' }> = ({ video, onClick, layout='grid' }) => {
    if (layout === 'list') {
        return (
             <button onClick={onClick} className="w-full flex items-start gap-2 p-1 rounded-md hover:bg-[rgba(var(--accent-color-rgb),0.1)] transition-colors">
                <img src={`https://i.ytimg.com/vi/${video.embedId}/mqdefault.jpg`} alt={video.title} className="w-40 aspect-video object-cover rounded bg-black flex-shrink-0" />
                <div className="text-left">
                    <p className="font-semibold text-sm text-white leading-tight line-clamp-2">{video.title}</p>
                    <p className="text-xs text-cyan-400 mt-1 line-clamp-1">{video.channel}</p>
                    <p className="text-xs text-gray-400">{video.views} • {video.uploadDate}</p>
                </div>
            </button>
        )
    }

    return (
        <button onClick={onClick} className="w-full flex flex-col gap-2 cursor-pointer group">
            <img src={`https://i.ytimg.com/vi/${video.embedId}/mqdefault.jpg`} alt={video.title} className="w-full aspect-video object-cover rounded-lg bg-black group-hover:rounded-none transition-all duration-200" />
            <div className="flex items-start gap-3">
                <div className="w-9 h-9 mt-1 rounded-full bg-cyan-800 flex items-center justify-center font-bold flex-shrink-0">{video.channel.charAt(0)}</div>
                <div className="text-left">
                    <p className="font-semibold text-white leading-tight line-clamp-2">{video.title}</p>
                    <p className="text-sm text-cyan-400 mt-1">{video.channel}</p>
                    <p className="text-sm text-gray-400">{video.views} • {video.uploadDate}</p>
                </div>
            </div>
        </button>
    );
};

type View = 'home' | 'watch' | 'search';

const WatchPage: React.FC<{video: Video}> = ({video}) => {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    return (
        <div className="w-full p-1">
             <div className="w-full aspect-video bg-black rounded-lg overflow-hidden border border-[rgba(var(--accent-color-rgb),0.3)]">
                 <iframe 
                    key={video.embedId}
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${video.embedId}?autoplay=1&controls=1&modestbranding=1&rel=0`}
                    title="Player de vídeo do Matrix-Tube" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen>
                 </iframe>
             </div>
             <div className="w-full mt-4 p-1">
                 <h2 className="text-xl font-bold font-orbitron text-white">{video.title}</h2>
                 <div className="flex items-center gap-3 mt-3">
                    <div className="w-10 h-10 rounded-full bg-cyan-800 flex items-center justify-center font-bold">{video.channel.charAt(0)}</div>
                    <div>
                        <p className="text-md text-cyan-200 font-semibold">{video.channel}</p>
                        <p className="text-sm text-gray-400">1.2M inscritos</p>
                    </div>
                    <button onClick={() => setIsSubscribed(p => !p)} className={`ml-4 px-4 py-2 font-semibold rounded-full text-sm transition-colors ${isSubscribed ? 'bg-gray-600 text-gray-300' : 'bg-white text-black'}`}>
                        {isSubscribed ? 'Inscrito' : 'Inscrever-se'}
                    </button>
                 </div>
             </div>

            <div className="w-full mt-4 p-3 bg-gray-800/80 rounded-lg text-sm">
                <p className="font-bold">{video.views} visualizações • {video.uploadDate}</p>
                <p className={`whitespace-pre-wrap mt-2 text-gray-300 transition-all duration-300 overflow-hidden ${isDescriptionExpanded ? 'max-h-full' : 'max-h-12'}`}>{video.description}</p>
                <button onClick={() => setIsDescriptionExpanded(p => !p)} className="font-bold text-white mt-1">{isDescriptionExpanded ? '...menos' : '...mais'}</button>
            </div>
             <div className="w-full mt-6">
                <h3 className="text-lg font-bold text-white pb-2 mb-4 border-b border-gray-700">Comentários (Simulado)</h3>
             </div>
        </div>
    );
};

const MatrixTubeApp: React.FC = () => {
    const [view, setView] = useState<View>('home');
    const [videos, setVideos] = useState<Video[]>([]);
    const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchVideos = useCallback(async (query: string, type: 'main' | 'related') => {
        setIsLoading(true);
        setError(null);
        try {
            const videoList = await generateVideoList(query);
            if (type === 'main') {
                setVideos(videoList);
            } else {
                setRelatedVideos(videoList);
            }
        } catch (err: any) {
            setError(err.message || 'Falha ao buscar vídeos da Grid. A conexão pode estar instável.');
            if (type === 'main') setVideos([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVideos('trending cyberpunk, lopers, problems yt, synthwave music videos', 'main');
    }, [fetchVideos]);
    
    useEffect(() => {
        if(view === 'watch' && selectedVideo) {
            fetchVideos(`videos related to "${selectedVideo.title}" by channels like ${selectedVideo.channel}`, 'related');
        }
    }, [view, selectedVideo, fetchVideos]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if(searchTerm.trim()) {
            setView('search');
            setSearchQuery(searchTerm);
            fetchVideos(searchTerm, 'main');
        }
    };

    const handleSelectVideo = (video: Video) => {
        setSelectedVideo(video);
        setView('watch');
        window.scrollTo(0, 0);
    };

    const handleGoHome = () => {
        setView('home');
        setSearchQuery('');
        setSearchTerm('');
        fetchVideos('trending cyberpunk, lopers, problems yt, synthwave music videos', 'main');
    };
    
    const handleChannelClick = (channelName: string, query: string) => {
        setView('search');
        setSearchQuery(channelName);
        setSearchTerm(query);
        fetchVideos(query, 'main');
    };

    const renderContent = () => {
        if(isLoading && videos.length === 0) return <LoadingSpinner />;
        if(error) return <div className="flex-grow flex items-center justify-center text-red-400 font-bold text-center p-4">{error}</div>;

        if (view === 'watch' && selectedVideo) {
            return (
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-grow">
                        <WatchPage video={selectedVideo} />
                    </div>
                    <aside className="lg:w-96 w-full flex-shrink-0 space-y-3">
                        <h3 className="font-bold text-lg text-white">A seguir</h3>
                        {isLoading && relatedVideos.length === 0 && <p className="text-sm text-gray-400">Carregando...</p>}
                        {relatedVideos.map(v => <VideoCard key={v.embedId} video={v} onClick={() => handleSelectVideo(v)} layout="list" />)}
                    </aside>
                </div>
            )
        }

        return (
            <div>
                {view === 'search' && <h2 className="text-2xl font-orbitron mb-4">Resultados para: "{searchQuery}"</h2>}
                {view === 'home' && <h2 className="text-2xl font-orbitron mb-4">Em Alta</h2>}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
                    {videos.map(v => <VideoCard key={v.embedId} video={v} onClick={() => handleSelectVideo(v)} />)}
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex bg-[#0f0f0f] text-cyan-300 font-sans">
            {/* Sidebar */}
            <aside className="w-20 lg:w-56 bg-[#0f0f0f] p-2 flex-shrink-0 border-r border-gray-800 hidden md:flex flex-col gap-1">
                 <button onClick={handleGoHome} className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-[rgba(var(--accent-color-rgb),0.2)] text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    <span className="hidden lg:inline font-bold">Início</span>
                </button>
                 <button onClick={() => handleChannelClick('@problemsyt', 'vídeos de problemsyt')} className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-[rgba(var(--accent-color-rgb),0.2)] text-white transition-colors">
                    <div className="w-6 h-6"><ProblemsIcon /></div>
                    <span className="hidden lg:inline font-bold">Problems</span>
                </button>
                 <button onClick={() => handleChannelClick('@Lopers', 'vídeos de lopers')} className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-[rgba(var(--accent-color-rgb),0.2)] text-white transition-colors">
                    <div className="w-6 h-6"><LopersIcon /></div>
                    <span className="hidden lg:inline font-bold">Lopers</span>
                </button>
                <div className="w-full h-px bg-gray-700 my-2 hidden lg:block"></div>
                 <button onClick={() => handleChannelClick('Playlist Lopers', 'vídeos da playlist do Lopers PLONrL9Brt1es7Bg9ILWcVUdKbLfVdp1Mi')} className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-[rgba(var(--accent-color-rgb),0.2)] text-white transition-colors">
                    <div className="w-6 h-6"><PlaylistIcon /></div>
                    <span className="hidden lg:inline font-bold">Playlist Lopers</span>
                </button>
                 <button onClick={() => handleChannelClick('Playlist Civilização', 'vídeos da playlist Civilização PL44rtgdnEuzVzaxWdIx2fkRLhX3ruu-U-')} className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-[rgba(var(--accent-color-rgb),0.2)] text-white transition-colors">
                    <div className="w-6 h-6"><PlaylistIcon /></div>
                    <span className="hidden lg:inline font-bold">Civilização</span>
                </button>
                 <button onClick={() => handleChannelClick('Vida de Coisas', 'vídeos da playlist "Vida de Coisas" do canal Problems')} className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-[rgba(var(--accent-color-rgb),0.2)] text-white transition-colors">
                    <div className="w-6 h-6"><PlaylistIcon /></div>
                    <span className="hidden lg:inline font-bold">Vida de Coisas</span>
                </button>
            </aside>

            <div className="flex-1 flex flex-col">
                {/* Top Bar */}
                <header className="p-2 bg-[#0f0f0f]/80 backdrop-blur-md flex items-center justify-center sticky top-0 z-10 border-b border-gray-800">
                    <form onSubmit={handleSearch} className="w-full max-w-xl">
                        <input 
                            type="text" 
                            placeholder="Buscar no Matrix-Tube..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/80 border border-gray-600 focus:ring-1 focus:ring-[var(--accent-color)] focus:outline-none rounded-full px-4 py-2 text-white placeholder-gray-500"
                        />
                    </form>
                </header>
                
                {/* Main Content */}
                <main className="flex-grow p-4 overflow-y-auto">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default MatrixTubeApp;