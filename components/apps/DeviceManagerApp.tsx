import React, { useState, useEffect } from 'react';

interface DeviceItem {
    id: string;
    category: 'network' | 'bluetooth' | 'display' | 'audio' | 'usb';
    name: string;
    status: 'working' | 'connecting' | 'scanning' | 'disabled';
    driver: string;
    details: string;
    icon: string;
    isAutoConfigured: boolean;
}

interface WifiNetwork {
    ssid: string;
    signal: number;
    security: string;
    band: string;
    connected: boolean;
}

interface BluetoothDevice {
    id: string;
    name: string;
    type: 'audio' | 'input' | 'phone' | 'gamepad';
    connected: boolean;
    battery?: number;
    signal: string;
}

const DeviceManagerApp: React.FC<{
    addNotification?: (title: string, message: string) => void;
}> = ({ addNotification }) => {
    const [activeTab, setActiveTab] = useState<'all' | 'wifi' | 'bluetooth'>('all');
    const [isScanning, setIsScanning] = useState(false);
    const [wifiEnabled, setWifiEnabled] = useState(true);
    const [bluetoothEnabled, setBluetoothEnabled] = useState(true);

    const [wifiNetworks, setWifiNetworks] = useState<WifiNetwork[]>([
        { ssid: 'Wi-Fi_Casa_5GHz', signal: 98, security: 'WPA3 Pessoal', band: '5 GHz (Wi-Fi 6)', connected: true },
        { ssid: 'Widons_Fibra_Ultra', signal: 85, security: 'WPA2 Pessoal', band: '5 GHz', connected: false },
        { ssid: 'Rede_Visitantes', signal: 62, security: 'Aberta', band: '2.4 GHz', connected: false },
        { ssid: 'Smart_Office_IoT', signal: 45, security: 'WPA2 Enterprise', band: '2.4 GHz', connected: false },
    ]);

    const [bluetoothDevices, setBluetoothDevices] = useState<BluetoothDevice[]>([
        { id: 'bt_headphone', name: 'Sony WH-1000XM5 (Fones de Ouvido)', type: 'audio', connected: true, battery: 92, signal: 'Excelente' },
        { id: 'bt_mouse', name: 'Mouse Óptico Sem Fio MX Master 3S', type: 'input', connected: true, battery: 85, signal: 'Excelente' },
        { id: 'bt_keyboard', name: 'Teclado Mecânico Bluetooth', type: 'input', connected: true, battery: 78, signal: 'Muito Bom' },
        { id: 'bt_controller', name: 'Controle Xbox Wireless', type: 'gamepad', connected: false, signal: 'Bom' },
        { id: 'bt_smartphone', name: 'Galaxy S24 Ultra', type: 'phone', connected: false, signal: 'Bom' },
    ]);

    const [devices, setDevices] = useState<DeviceItem[]>([
        {
            id: 'net_wifi',
            category: 'network',
            name: 'Intel(R) Wi-Fi 6E AX210 (160MHz)',
            status: 'working',
            driver: 'Microsoft Widons Certified v23.40 (Instalado)',
            details: 'Conectado a "Wi-Fi_Casa_5GHz" • IP: 192.168.1.145 • 2402 Mbps',
            icon: '📶',
            isAutoConfigured: true,
        },
        {
            id: 'net_bt',
            category: 'bluetooth',
            name: 'Intel(R) Wireless Bluetooth(R) 5.3 Adapter',
            status: 'working',
            driver: 'Widons Bluetooth Stack v10.0 (Instalado)',
            details: '3 dispositivos conectados e ativos • Pronto para pareamento',
            icon: 'ᛒ',
            isAutoConfigured: true,
        },
        {
            id: 'disp_gpu',
            category: 'display',
            name: 'NVIDIA GeForce RTX 4070 / Intel Iris Xe Graphics',
            status: 'working',
            driver: 'Widons Display Driver Model (WDDM 3.1)',
            details: 'Resolução: 1920x1080 @ 144Hz • Aceleração por Hardware Ativa',
            icon: '🖥️',
            isAutoConfigured: true,
        },
        {
            id: 'snd_audio',
            category: 'audio',
            name: 'Realtek High Definition Audio Device',
            status: 'working',
            driver: 'Widons CoreAudio Engine (Instalado)',
            details: 'Saída de Alto-falantes / Fone (24 bits, 192000 Hz)',
            icon: '🔊',
            isAutoConfigured: true,
        },
        {
            id: 'usb_hub',
            category: 'usb',
            name: 'Controlador de Host USB 3.2 eXtensible',
            status: 'working',
            driver: 'Driver genérico USB (Microsoft)',
            details: '4 portas ativas • Plug and Play habilitado',
            icon: '🔌',
            isAutoConfigured: true,
        },
    ]);

    const scanHardware = () => {
        setIsScanning(true);
        addNotification?.('Gerenciador de Dispositivos', 'Varrendo barramento PCI/USB em busca de novos dispositivos...');
        setTimeout(() => {
            setIsScanning(false);
            addNotification?.('Dispositivos Reconhecidos', '✓ Adaptador Wi-Fi 6E e Adaptador Bluetooth 5.3 reconfigurados com sucesso!');
        }, 1200);
    };

    const toggleWifi = () => {
        const next = !wifiEnabled;
        setWifiEnabled(next);
        addNotification?.('Adaptador Wi-Fi', next ? 'Wi-Fi Ativado. Reconectando automaticamente...' : 'Wi-Fi Desativado.');
    };

    const toggleBluetooth = () => {
        const next = !bluetoothEnabled;
        setBluetoothEnabled(next);
        addNotification?.('Adaptador Bluetooth', next ? 'Bluetooth Ativado. Dispositivos emparelhados conectados.' : 'Bluetooth Desativado.');
    };

    const connectWifi = (ssid: string) => {
        setWifiNetworks(prev => prev.map(w => ({
            ...w,
            connected: w.ssid === ssid
        })));
        addNotification?.('Wi-Fi', `Conectado com sucesso a "${ssid}". IP obtido via DHCP.`);
    };

    const toggleBtDevice = (id: string) => {
        setBluetoothDevices(prev => prev.map(d => {
            if (d.id === id) {
                const nextState = !d.connected;
                addNotification?.('Bluetooth', nextState ? `Conectado a "${d.name}".` : `Desconectado de "${d.name}".`);
                return { ...d, connected: nextState };
            }
            return d;
        }));
    };

    return (
        <div className="h-full flex flex-col bg-[#f0f2f5] text-gray-900 font-sans select-none">
            {/* Top Windows Ribbon Header */}
            <div className="bg-white border-b border-gray-300 px-4 py-3 flex items-center justify-between shadow-sm flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
                        ⚙️
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            Gerenciador de Dispositivos & Adaptadores
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-semibold rounded-full border border-emerald-300">
                                Plug and Play Ativo
                            </span>
                        </h2>
                        <p className="text-xs text-gray-500">
                            Reconhecimento automático de Adaptador Wi-Fi, Bluetooth e periféricos no Widons 2.0
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={scanHardware}
                        disabled={isScanning}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
                    >
                        <span className={isScanning ? 'animate-spin' : ''}>⟳</span>
                        {isScanning ? 'Detectando Hardware...' : 'Verificar Dispositivos'}
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-[#e9ecf0] px-4 pt-2 border-b border-gray-300 flex items-center gap-2 flex-shrink-0 text-xs font-semibold">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`px-4 py-2 rounded-t-lg transition-all ${
                        activeTab === 'all'
                            ? 'bg-white text-blue-700 border-t-2 border-t-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                    Todos os Dispositivos ({devices.length})
                </button>
                <button
                    onClick={() => setActiveTab('wifi')}
                    className={`px-4 py-2 rounded-t-lg transition-all flex items-center gap-1.5 ${
                        activeTab === 'wifi'
                            ? 'bg-white text-blue-700 border-t-2 border-t-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                    <span>📶</span>
                    <span>Adaptador Wi-Fi</span>
                    <span className={`w-2 h-2 rounded-full ${wifiEnabled ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                </button>
                <button
                    onClick={() => setActiveTab('bluetooth')}
                    className={`px-4 py-2 rounded-t-lg transition-all flex items-center gap-1.5 ${
                        activeTab === 'bluetooth'
                            ? 'bg-white text-blue-700 border-t-2 border-t-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                    <span>ᛒ</span>
                    <span>Adaptador Bluetooth</span>
                    <span className={`w-2 h-2 rounded-full ${bluetoothEnabled ? 'bg-blue-500' : 'bg-gray-400'}`} />
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-grow p-4 overflow-y-auto">
                {activeTab === 'all' && (
                    <div className="max-w-4xl mx-auto space-y-4">
                        {/* Auto-configuration banner */}
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-lg">
                                    ✓
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-emerald-900">
                                        Detecção Automática Concluída com Sucesso
                                    </h4>
                                    <p className="text-xs text-emerald-700 mt-0.5">
                                        Todos os adaptadores de rede, Wi-Fi 6E, Bluetooth 5.3 e áudio foram reconhecidos e configurados automaticamente pelo sistema.
                                    </p>
                                </div>
                            </div>
                            <span className="text-xs font-mono bg-emerald-200/60 text-emerald-800 px-2.5 py-1 rounded-md font-semibold">
                                100% Funcional
                            </span>
                        </div>

                        {/* Device Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {devices.map(dev => (
                                <div
                                    key={dev.id}
                                    className="p-4 bg-white border border-gray-200 hover:border-blue-400 rounded-xl shadow-sm transition-all"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2.5">
                                            <span className="text-2xl">{dev.icon}</span>
                                            <div>
                                                <h4 className="font-bold text-sm text-gray-900">{dev.name}</h4>
                                                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    Este dispositivo está funcionando corretamente
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-600 space-y-1">
                                        <p><strong className="text-gray-700">Driver:</strong> {dev.driver}</p>
                                        <p><strong className="text-gray-700">Status:</strong> {dev.details}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'wifi' && (
                    <div className="max-w-3xl mx-auto space-y-4">
                        {/* Wi-Fi Switch Card */}
                        <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl">
                                    📶
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-gray-900">Adaptador Wi-Fi (Intel Wi-Fi 6E AX210)</h3>
                                    <p className="text-xs text-gray-500">
                                        {wifiEnabled ? 'Wi-Fi Ativado • Reconhecimento de redes 2.4GHz e 5GHz ativo' : 'Wi-Fi Desativado'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={toggleWifi}
                                className={`px-4 py-2 rounded-full font-bold text-xs transition shadow-sm ${
                                    wifiEnabled ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                                }`}
                            >
                                {wifiEnabled ? 'LIGADO' : 'DESLIGADO'}
                            </button>
                        </div>

                        {/* Available Networks */}
                        {wifiEnabled && (
                            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                                <h4 className="font-bold text-sm text-gray-800 mb-3 flex items-center justify-between">
                                    <span>Redes Wi-Fi Disponíveis na Área</span>
                                    <span className="text-xs text-gray-500 font-normal">Auto-conexão habilitada</span>
                                </h4>

                                <div className="space-y-2">
                                    {wifiNetworks.map(net => (
                                        <div
                                            key={net.ssid}
                                            className={`p-3 rounded-lg border transition-all flex items-center justify-between ${
                                                net.connected
                                                    ? 'bg-blue-50 border-blue-400'
                                                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg">📶</span>
                                                <div>
                                                    <p className="font-semibold text-xs text-gray-900 flex items-center gap-2">
                                                        {net.ssid}
                                                        {net.connected && (
                                                            <span className="px-2 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                                                                Conectado
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className="text-[11px] text-gray-500">
                                                        {net.band} • {net.security} • Sinal: {net.signal}%
                                                    </p>
                                                </div>
                                            </div>

                                            {net.connected ? (
                                                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                                                    ✓ Seguro
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => connectWifi(net.ssid)}
                                                    className="px-3 py-1 bg-white hover:bg-gray-100 border border-gray-300 text-xs font-semibold rounded text-blue-600 transition"
                                                >
                                                    Conectar
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'bluetooth' && (
                    <div className="max-w-3xl mx-auto space-y-4">
                        {/* Bluetooth Switch Card */}
                        <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold font-mono">
                                    ᛒ
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-gray-900">Adaptador Bluetooth 5.3</h3>
                                    <p className="text-xs text-gray-500">
                                        {bluetoothEnabled ? 'Visível para todos os dispositivos • Emparelhamento automático ativo' : 'Bluetooth Desativado'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={toggleBluetooth}
                                className={`px-4 py-2 rounded-full font-bold text-xs transition shadow-sm ${
                                    bluetoothEnabled ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                                }`}
                            >
                                {bluetoothEnabled ? 'LIGADO' : 'DESLIGADO'}
                            </button>
                        </div>

                        {/* Bluetooth Peripherals */}
                        {bluetoothEnabled && (
                            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-bold text-sm text-gray-800">
                                        Dispositivos Reconhecidos e Emparelhados
                                    </h4>
                                    <button
                                        onClick={() => addNotification?.('Bluetooth', 'Procurando novos dispositivos por perto...')}
                                        className="text-xs text-blue-600 hover:underline font-semibold"
                                    >
                                        + Adicionar Dispositivo Bluetooth
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {bluetoothDevices.map(dev => (
                                        <div
                                            key={dev.id}
                                            className={`p-3 rounded-lg border transition-all flex items-center justify-between ${
                                                dev.connected
                                                    ? 'bg-blue-50/70 border-blue-300'
                                                    : 'bg-gray-50 border-gray-200'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg">
                                                    {dev.type === 'audio' ? '🎧' : dev.type === 'input' ? '⌨️' : dev.type === 'gamepad' ? '🎮' : '📱'}
                                                </span>
                                                <div>
                                                    <p className="font-semibold text-xs text-gray-900">{dev.name}</p>
                                                    <p className="text-[11px] text-gray-500">
                                                        {dev.connected ? 'Conectado (Voz, Música, Entrada)' : 'Emparelhado • Desconectado'}
                                                        {dev.battery && ` • Bateria: ${dev.battery}%`}
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => toggleBtDevice(dev.id)}
                                                className={`px-3 py-1 rounded text-xs font-semibold transition ${
                                                    dev.connected
                                                        ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                                }`}
                                            >
                                                {dev.connected ? 'Desconectar' : 'Conectar'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Status Bar */}
            <div className="bg-white border-t border-gray-300 px-4 py-2 text-xs text-gray-500 flex justify-between items-center flex-shrink-0">
                <span>Widons 2.0 Hardware Abstraction Layer (HAL)</span>
                <span className="text-emerald-600 font-semibold">● Todos os adaptadores online e configurados</span>
            </div>
        </div>
    );
};

export default DeviceManagerApp;
