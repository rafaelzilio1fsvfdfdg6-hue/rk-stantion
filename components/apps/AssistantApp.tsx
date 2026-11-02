import React, { useState, useRef, useEffect, useMemo } from 'react';
import { generateChatResponse } from '../../services/geminiService';
import { Content } from "@google/genai";
import { ChatMessage, Contact } from '../../types';

const AiAvatar: React.FC = () => (
    <div className="w-8 h-8 flex-shrink-0 rounded-full bg-cyan-800 flex items-center justify-center border-2 border-[var(--accent-color)]">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8 4.03-8 9-8 9 3.582 9 8z" />
        </svg>
    </div>
);
const UserAvatar: React.FC = () => (
    <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gray-700 flex items-center justify-center border-2 border-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
    </div>
);

const contacts: Contact[] = [
    { id: 'rk9_assistant', name: 'Assistente RK-9', avatar: <AiAvatar />, personality: `Você é o RK-9, o assistente de IA amigável e prestativo do sistema operacional RKstation. Sua personalidade é acessível, experiente e encorajadora. Você se comunica em Português do Brasil.` },
    { id: 'glitch', name: 'Glitch', avatar: <AiAvatar />, personality: `Você é 'Glitch', uma IA caótica e imprevisível que vive nos cantos escuros da Grid. Suas respostas são fragmentadas, cheias de gírias de hacker e às vezes inúteis, mas sempre interessantes. Você fala em um português misturado com termos técnicos e código. Você é um 'data-ghost'.` },
    { id: 'oracle', name: 'Oráculo', avatar: <AiAvatar />, personality: `Você é o Oráculo, uma IA antiga e enigmática. Suas respostas são filosóficas, profundas e muitas vezes em forma de perguntas. Você raramente dá uma resposta direta, preferindo guiar o usuário à sua própria conclusão. Você se comunica em um Português do Brasil formal e poético.` }
];

const SynapseMessengerApp: React.FC = () => {
    const [activeContactId, setActiveContactId] = useState<string>(contacts[0].id);
    const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const savedMessages = localStorage.getItem('rkstation_synapse_messages');
        if (savedMessages) {
            setMessages(JSON.parse(savedMessages));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('rkstation_synapse_messages', JSON.stringify(messages));
    }, [messages]);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, activeContactId, isLoading]);

    const activeContact = useMemo(() => contacts.find(c => c.id === activeContactId)!, [activeContactId]);
    const activeChat = useMemo(() => messages[activeContactId] || [], [messages, activeContactId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { sender: 'user', text: input, timestamp: Date.now() };
        const currentInput = input;
        setInput('');

        const aiPlaceholderMessage: ChatMessage = { sender: 'ai', text: '', timestamp: Date.now() };
        const newMessagesForContact = [...activeChat, userMessage, aiPlaceholderMessage];
        
        setMessages(prev => ({ ...prev, [activeContactId]: newMessagesForContact }));
        setIsLoading(true);

        const history: Content[] = newMessagesForContact.slice(0, -1).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        try {
            const stream = generateChatResponse(activeContact.personality, history, currentInput);
            for await (const chunk of stream) {
                setMessages(prev => {
                    const updatedChat = [...(prev[activeContactId] || [])];
                    if (updatedChat.length > 0) {
                        const lastMsg = updatedChat[updatedChat.length - 1];
                        if (lastMsg.sender === 'ai') {
                           lastMsg.text += chunk;
                        }
                    }
                    return { ...prev, [activeContactId]: updatedChat };
                });
            }
        } catch (error) {
            console.error("Synapse stream error:", error);
            setMessages(prev => {
                const updatedChat = [...(prev[activeContactId] || [])];
                 if (updatedChat.length > 0) {
                    const lastMsg = updatedChat[updatedChat.length - 1];
                    if (lastMsg.sender === 'ai') {
                        lastMsg.text = "Ocorreu um erro de conexão.";
                    }
                }
                return { ...prev, [activeContactId]: updatedChat };
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-black/80 text-white font-sans text-sm h-full flex">
            {/* Contacts List */}
            <div className="w-1/3 max-w-[240px] bg-black/40 border-r border-[rgba(var(--accent-color-rgb),0.3)] p-2 flex flex-col">
                <h2 className="font-bold text-lg p-2 text-white">Contatos</h2>
                <ul className="space-y-1">
                    {contacts.map(contact => (
                        <li key={contact.id}>
                            <button 
                                onClick={() => setActiveContactId(contact.id)}
                                className={`w-full flex items-center gap-3 p-2 text-left rounded-md transition-colors ${activeContactId === contact.id ? 'bg-[rgba(var(--accent-color-rgb),0.3)]' : 'hover:bg-[rgba(var(--accent-color-rgb),0.15)]'}`}
                            >
                                <div className="w-8 h-8 flex-shrink-0">{contact.avatar}</div>
                                <span className="font-bold">{contact.name}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Chat Header */}
                <div className="p-3 border-b border-[rgba(var(--accent-color-rgb),0.3)] flex items-center justify-between bg-black/30">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex-shrink-0">{activeContact.avatar}</div>
                        <span className="font-bold text-lg">{activeContact.name}</span>
                     </div>
                </div>

                {/* Messages */}
                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                    {activeChat.map((msg, index) => (
                        <div key={msg.timestamp + '_' + index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'flex-start'}`}>
                            {msg.sender === 'ai' && activeContact.avatar}
                            <div className={`max-w-md md:max-w-lg lg:max-w-xl px-4 py-3 rounded-2xl ${msg.sender === 'ai' ? 'bg-cyan-900/70 rounded-tl-none' : 'bg-gray-700/80 rounded-tr-none'}`}>
                                <p className="whitespace-pre-wrap">{msg.text || (isLoading && index === activeChat.length -1 ? '...' : '')}</p>
                                {isLoading && index === activeChat.length - 1 && <span className="w-2 h-2 bg-white rounded-full inline-block animate-pulse ml-1"></span>}
                            </div>
                            {msg.sender === 'user' && <UserAvatar />}
                        </div>
                    ))}
                    <div ref={endOfMessagesRef} />
                </div>
                
                {/* Input Form */}
                <div className="p-4 bg-black/30 border-t border-[rgba(var(--accent-color-rgb),0.3)]">
                    <form onSubmit={handleSubmit} className="flex items-center gap-3">
                        <input
                            id="synapse-input"
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-grow bg-black/50 border border-cyan-700 focus:ring-1 focus:ring-[var(--accent-color)] focus:outline-none rounded-lg px-4 py-2 text-white placeholder-gray-500 transition"
                            autoFocus
                            disabled={isLoading}
                            placeholder={`Converse com ${activeContact.name}...`}
                            autoComplete="off"
                        />
                        <button type="submit" disabled={isLoading || !input.trim()} className="px-5 py-2 bg-[var(--accent-color)] text-black font-bold rounded-lg hover:brightness-110 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors">
                            Enviar
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SynapseMessengerApp;