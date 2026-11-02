import React, { useState, useRef, useEffect } from 'react';
import * as VFS from '../../services/virtualFileSystem';

interface PaintAppProps {
    updateVfs?: () => void;
    addNotification?: (title: string, message: string) => void;
}

const COLORS = [
    '#000000', '#7f7f7f', '#880015', '#ed1c24', '#ff7f27', '#fff200', '#22b14c', '#00a2e8', '#3f48cc', '#a349a4',
    '#ffffff', '#c3c3c3', '#b97a57', '#ffaec9', '#ffc90e', '#efe4b0', '#b5e61d', '#99d9ea', '#7092be', '#c8bfe7'
];

const PaintApp: React.FC<PaintAppProps> = ({ updateVfs, addNotification }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [color, setColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(4);
    const [tool, setTool] = useState<'pen' | 'eraser' | 'rectangle' | 'circle'>('pen');
    const [isDrawing, setIsDrawing] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const [snapshot, setSnapshot] = useState<ImageData | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }, []);

    const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setIsDrawing(true);
        setStartX(x);
        setStartY(y);
        setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));

        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (tool === 'eraser') {
            ctx.strokeStyle = '#ffffff';
            ctx.lineTo(x, y);
            ctx.stroke();
        } else if (tool === 'pen') {
            ctx.strokeStyle = color;
            ctx.lineTo(x, y);
            ctx.stroke();
        } else if (snapshot) {
            ctx.putImageData(snapshot, 0, 0);
            ctx.strokeStyle = color;
            if (tool === 'rectangle') {
                ctx.strokeRect(startX, startY, x - startX, y - startY);
            } else if (tool === 'circle') {
                ctx.beginPath();
                const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
                ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
                ctx.stroke();
            }
        }
    };

    const stopDraw = () => {
        setIsDrawing(false);
    };

    const handleClear = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        if (confirm('Limpar toda a tela de desenho?')) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    };

    const handleSave = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dataUrl = canvas.toDataURL('image/png');
        const fileName = `Desenho_Paint_${Date.now()}.png`;

        // Save into Downloads in VFS & trigger real download
        VFS.downloadToVFS(fileName, dataUrl, true);
        updateVfs?.();
        addNotification?.('Paint 10', `Imagem salva com sucesso como "${fileName}".`);
    };

    return (
        <div className="h-full flex flex-col bg-[#f0f0f0] text-gray-800 font-sans select-none">
            {/* Windows 10 Paint Ribbon Toolbar */}
            <div className="bg-[#f5f6f7] border-b border-[#dadada] p-2 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-blue-700 uppercase tracking-wider mr-2">Ferramentas</span>
                    <button
                        onClick={() => setTool('pen')}
                        className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1 transition ${
                            tool === 'pen' ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                    >
                        ✏️ Lápis
                    </button>
                    <button
                        onClick={() => setTool('eraser')}
                        className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1 transition ${
                            tool === 'eraser' ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                    >
                        🧹 Borracha
                    </button>
                    <button
                        onClick={() => setTool('rectangle')}
                        className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1 transition ${
                            tool === 'rectangle' ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                    >
                        ⬜ Retângulo
                    </button>
                    <button
                        onClick={() => setTool('circle')}
                        className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1 transition ${
                            tool === 'circle' ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                    >
                        ⭕ Círculo
                    </button>
                </div>

                {/* Brush size */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">Espessura:</span>
                    <input
                        type="range"
                        min="1"
                        max="32"
                        value={brushSize}
                        onChange={e => setBrushSize(parseInt(e.target.value))}
                        className="w-20 cursor-pointer"
                    />
                    <span className="text-xs font-mono w-6">{brushSize}px</span>
                </div>

                {/* Color Palette */}
                <div className="flex items-center gap-2">
                    <div
                        className="w-8 h-8 rounded border-2 border-gray-400 shadow-inner flex-shrink-0"
                        style={{ backgroundColor: color }}
                        title="Cor Atual"
                    />
                    <div className="grid grid-cols-10 gap-1">
                        {COLORS.map(c => (
                            <button
                                key={c}
                                onClick={() => setColor(c)}
                                style={{ backgroundColor: c }}
                                className={`w-4 h-4 rounded-sm border ${color === c ? 'border-black scale-110 shadow-sm' : 'border-gray-300'}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleClear}
                        className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-xs font-semibold rounded text-red-700 transition"
                    >
                        Limpar
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded shadow transition flex items-center gap-1"
                    >
                        💾 Salvar Imagem
                    </button>
                </div>
            </div>

            {/* Drawing Area */}
            <div className="flex-grow bg-[#c0c0c0] p-4 flex items-center justify-center overflow-auto">
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={500}
                    onMouseDown={startDraw}
                    onMouseMove={draw}
                    onMouseUp={stopDraw}
                    onMouseLeave={stopDraw}
                    className="bg-white shadow-2xl cursor-crosshair rounded border border-gray-400"
                />
            </div>

            {/* Status */}
            <div className="bg-[#f0f0f0] border-t border-[#dadada] px-3 py-1 text-[11px] text-gray-600 flex justify-between">
                <span>Paint - Widons 2.0 Edition</span>
                <span>800 x 500 px</span>
            </div>
        </div>
    );
};

export default PaintApp;
