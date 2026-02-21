import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ChatbotWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am your AgriChain AI Assistant. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const messagesEndRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                await handleVoiceQuery(audioBlob);
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Mic access error:", err);
            alert("Microphone access is required for voice mode.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const handleVoiceQuery = async (audioBlob) => {
        const formData = new FormData();
        formData.append('audio', audioBlob);

        setIsLoading(true);
        setMessages(prev => [...prev, { role: 'user', content: '🎤 [Voice Message]' }]);

        try {
            const response = await axios.post('http://localhost:5000/api/chatbot/voice-query', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const { text, reply, audioUrl } = response.data;

            // Update the user message text if STT was successful
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].content = `🎤 ${text}`;
                return [...newMessages, { role: 'assistant', content: reply }];
            });

            if (audioUrl) {
                const audio = new Audio(`http://localhost:5000${audioUrl}`);
                setIsSpeaking(true);
                audio.play();
                audio.onended = () => setIsSpeaking(false);
            }
        } catch (error) {
            console.error('Voice query error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Voice processing failed. Please try typing.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:5000/api/chatbot/query', {
                query: input,
                history: messages
            });

            const assistantMessage = { role: 'assistant', content: response.data.response };
            setMessages((prev) => [...prev, assistantMessage]);

            // If the user is in "Voice Mode" or we want to read it out automatically
            if (response.data.audioUrl) {
                const audio = new Audio(`http://localhost:5000${response.data.audioUrl}`);
                audio.play();
            }
        } catch (error) {
            console.error('Chatbot error:', error);
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: 'Sorry, I encountered an error. Please try again later.' }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const quickActions = [
        "What's the demand forecast?",
        "Show me critical alerts",
        "How is the food safety score?",
        "Blockchain status"
    ];

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-96 max-h-[600px] h-[550px] bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
                    {/* Header */}
                    <div className="p-4 bg-gradient-to-r from-primary to-secondary text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl relative">
                                🤖
                                {isSpeaking && (
                                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
                                    </span>
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">AgriChain Voice Assistant</h3>
                                <div className="flex items-center gap-1.5 text-[10px] opacity-80 uppercase tracking-widest">
                                    <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-green-400 opacity-50'}`}></span>
                                    {isRecording ? 'Listening...' : 'Online'}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setMessages([{ role: 'assistant', content: 'Hello! I am your AgriChain AI Assistant. How can I help you today?' }])}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                title="Clear History"
                            >
                                🗑️
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent to-gray-50/50">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl ${m.role === 'user'
                                    ? 'bg-primary text-white rounded-tr-none shadow-md'
                                    : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none'
                                    }`}>
                                    <p className="text-sm leading-relaxed">{m.content}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 flex gap-1 items-center">
                                    <span className="text-[10px] text-gray-400 mr-1 uppercase">AI is thinking</span>
                                    <span className="w-1 h-1 bg-primary rounded-full animate-bounce"></span>
                                    <span className="w-1 h-1 bg-primary rounded-full animate-bounce delay-150"></span>
                                    <span className="w-1 h-1 bg-primary rounded-full animate-bounce delay-300"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Voice Pulse UI during recording */}
                    {isRecording && (
                        <div className="px-4 py-8 flex flex-col items-center justify-center bg-primary/5 gap-4">
                            <div className="flex items-center gap-1 h-12">
                                {[...Array(8)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-1.5 bg-primary rounded-full animate-wave"
                                        style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }}
                                    ></div>
                                ))}
                            </div>
                            <p className="text-xs font-semibold text-primary animate-pulse">Recording your voice...</p>
                        </div>
                    )}

                    {/* Quick Actions */}
                    {!isRecording && messages.length === 1 && (
                        <div className="px-4 pb-2 flex flex-wrap gap-2">
                            {quickActions.map((action, i) => (
                                <button
                                    key={`Action_No_${i}`}
                                    onClick={() => setInput(action)}
                                    className="text-[10px] uppercase font-bold tracking-tighter px-3 py-1.5 bg-white border border-gray-200 rounded-full hover:border-accent hover:text-accent transition-all shadow-sm"
                                >
                                    {action}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-2 items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={isRecording ? "Recording..." : "Ask me anything..."}
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            disabled={isRecording}
                        />

                        {/* Voice Button */}
                        <button
                            type="button"
                            onMouseDown={startRecording}
                            onMouseUp={stopRecording}
                            onMouseLeave={stopRecording}
                            className={`p-2.5 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center ${isRecording ? 'bg-red-500 text-white animate-pulse shadow-red-200' : 'bg-accent/10 text-accent hover:bg-accent/20'
                                }`}
                            title="Hold to speak"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                        </button>

                        <button
                            type="submit"
                            disabled={isLoading || isRecording || !input.trim()}
                            className="bg-primary hover:bg-primary/90 text-white p-2.5 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-30 flex items-center justify-center"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </form>
                </div>
            )
            }

            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-16 h-16 bg-gradient-to-br from-primary to-secondary text-white rounded-full shadow-2xl flex items-center justify-center text-3xl hover:scale-110 transition-transform active:scale-95 group relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <span className="z-10">{isOpen ? '✕' : '🤖'}</span>
            </button>
        </div >
    );
};

export default ChatbotWidget;
