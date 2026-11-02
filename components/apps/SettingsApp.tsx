import React, { useState } from 'react';

interface SettingsAppProps {
    theme: { accentColor: string; wallpaper: string };
    setTheme: (theme: { accentColor: string; wallpaper: string }) => void;
}

const WALLPAPER_PRESETS = [
    { name: 'Widons 10 Azul Clássico', url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1920&q=80' },
    { name: 'Noite Urbana Cyber', url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1920&q=80' },
    { name: 'Montanhas Minimalistas', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80' },
    { name: 'Aurora Boreal', url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1920&q=80' }
];

const SettingsApp: React.FC<SettingsAppProps> = ({ theme, setTheme }) => {
    const [wallpaperInput, setWallpaperInput] = useState(theme.wallpaper);
    const [activeSection, setActiveSection] = useState<'system' | 'network' | 'devices' | 'personalization'>('system');

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTheme({ ...theme, accentColor: e.target.value });
    };

    const colorPresets = ['#0078d7', '#00f0ff', '#107c41', '#d83b01', '#881798', '#e3008c', '#ffb900'];

    return (
        <div className="h-full flex bg-[#f0f2f5] text-gray-900 font-sans select-none overflow-hidden">
            {/* Left Category Sidebar */}
            <aside className="w-56 bg-white border-r border-gray-200 p-3 flex flex-col justify-between flex-shrink-0">
                <div>
                    <h3 className="font-bold text-sm text-gray-900 px-3 py-2 flex items-center gap-2">
                        <span>⚙️</span> Configurações
                    </h3>
                    <div className="mt-2 space-y-1 text-xs font-semibold">
                        {[
                            { id: 'system', name: 'Sistema', icon: '💻' },
                            { id: 'network', name: 'Rede e Internet (Wi-Fi)', icon: '📶' },
                            { id: 'devices', name: 'Dispositivos (Bluetooth)', icon: 'ᛒ' },
                            { id: 'personalization', name: 'Personalização', icon: '🎨' },
                        ].map(sec => (
                            <button
                                key={sec.id}
                                onClick={() => setActiveSection(sec.id as any)}
                                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition ${
                                    activeSection === sec.id
                                        ? 'bg-blue-50 text-blue-700 font-bold border-l-4 border-l-blue-600'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                            >
                                <span className="text-base">{sec.icon}</span>
                                <span className="truncate">{sec.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-[11px] text-gray-500">
                    <p className="font-semibold text-gray-700">Widons 2.0 Pro</p>
                    <p>Build 22631 • Plug &amp; Play</p>
                </div>
            </aside>

            {/* Right Settings Content */}
            <main className="flex-grow p-6 overflow-y-auto bg-[#f8f9fa]">
                {activeSection === 'system' && (
                    <div className="max-w-2xl space-y-4">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Sobre o Sistema</h2>

                        <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm space-y-3">
                            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                                    W2
                                </div>
                                <div>
                                    <h4 className="font-bold text-base text-gray-900">Widons 2.0 Pro Edition</h4>
                                    <p className="text-xs text-gray-500">Sistema Operacional de Próxima Geração com Reconhecimento Automático de Hardware</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div>
                                    <p className="text-gray-500">Edição:</p>
                                    <p className="font-semibold text-gray-800">Widons 2.0 Pro (64 bits)</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Versão:</p>
                                    <p className="font-semibold text-gray-800">22H2 (Build 2026.11)</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Processador:</p>
                                    <p className="font-semibold text-gray-800">Intel(R) Core(TM) i9 Ultra @ 5.40 GHz</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Memória RAM:</p>
                                    <p className="font-semibold text-gray-800">32,0 GB (31,8 GB utilizável)</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                            <h4 className="font-bold text-sm text-gray-800 mb-1">Widons Update</h4>
                            <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                Você está atualizado. Última verificação: Hoje
                            </p>
                        </div>
                    </div>
                )}

                {activeSection === 'network' && (
                    <div className="max-w-2xl space-y-4">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Rede e Internet</h2>

                        <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm space-y-3">
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">📶</span>
                                    <div>
                                        <h4 className="font-bold text-sm text-gray-900">Adaptador Wi-Fi (Intel AX210 6E)</h4>
                                        <p className="text-xs text-emerald-600 font-semibold">Conectado a Wi-Fi_Casa_5GHz • Internet Segura</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                                    Configurado Automaticamente
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                                <div>
                                    <p className="text-gray-400">Endereço IPv4:</p>
                                    <p className="font-mono text-gray-800 font-semibold">192.168.1.145</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Banda de Rede:</p>
                                    <p className="font-semibold text-gray-800">5 GHz (Wi-Fi 6)</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Velocidade de Link:</p>
                                    <p className="font-semibold text-gray-800">2402/2402 (Mbps)</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Tipo de Segurança:</p>
                                    <p className="font-semibold text-gray-800">WPA3-Personal</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'devices' && (
                    <div className="max-w-2xl space-y-4">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Dispositivos &amp; Bluetooth</h2>

                        <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm space-y-3">
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl text-blue-600 font-bold font-mono">ᛒ</span>
                                    <div>
                                        <h4 className="font-bold text-sm text-gray-900">Adaptador Bluetooth 5.3</h4>
                                        <p className="text-xs text-emerald-600 font-semibold">Ativado e visível para emparelhamento automático</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                                    Auto-Configurado
                                </span>
                            </div>

                            <div className="space-y-2 text-xs">
                                <p className="font-bold text-gray-700">Dispositivos Conectados:</p>
                                <div className="p-2.5 bg-gray-50 rounded-lg flex items-center justify-between">
                                    <span>🎧 Sony WH-1000XM5 (Fones de Ouvido Bluetooth)</span>
                                    <span className="text-emerald-600 font-semibold">92% Bateria</span>
                                </div>
                                <div className="p-2.5 bg-gray-50 rounded-lg flex items-center justify-between">
                                    <span>🖱️ Mouse Sem Fio MX Master 3S</span>
                                    <span className="text-emerald-600 font-semibold">85% Bateria</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'personalization' && (
                    <div className="max-w-2xl space-y-4">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Personalização</h2>

                        {/* Color Picker */}
                        <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm space-y-3">
                            <h4 className="font-bold text-sm text-gray-900">Cor de Destaque do Widons</h4>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={theme.accentColor}
                                    onChange={handleColorChange}
                                    className="w-10 h-10 p-0.5 rounded cursor-pointer border border-gray-300"
                                />
                                <div className="flex gap-2">
                                    {colorPresets.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setTheme({ ...theme, accentColor: color })}
                                            className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                                            style={{
                                                backgroundColor: color,
                                                borderColor: theme.accentColor === color ? '#000' : 'transparent',
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Wallpapers Presets */}
                        <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm space-y-3">
                            <h4 className="font-bold text-sm text-gray-900">Papel de Parede da Área de Trabalho</h4>
                            <div className="grid grid-cols-2 gap-3">
                                {WALLPAPER_PRESETS.map(wp => (
                                    <div
                                        key={wp.name}
                                        onClick={() => setTheme({ ...theme, wallpaper: wp.url })}
                                        className="cursor-pointer group rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition shadow-sm"
                                    >
                                        <div
                                            className="w-full h-24 bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                                            style={{ backgroundImage: `url(${wp.url})` }}
                                        />
                                        <div className="p-2 bg-white text-xs font-semibold text-gray-800 text-center">
                                            {wp.name}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-2">
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Ou insira uma URL de imagem:</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="https://..."
                                        value={wallpaperInput}
                                        onChange={e => setWallpaperInput(e.target.value)}
                                        className="flex-grow bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                                    />
                                    <button
                                        onClick={() => setTheme({ ...theme, wallpaper: wallpaperInput })}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition"
                                    >
                                        Aplicar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default SettingsApp;
