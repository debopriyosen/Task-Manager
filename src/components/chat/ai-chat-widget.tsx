"use client";

import { useState, useRef, useEffect } from "react";
import { useTasks } from "@/contexts/TasksContext";
import { MessageSquare, X, Send, Sparkles, Loader2, KeyRound } from "lucide-react";
import Link from "next/link";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export function AiChatWidget() {
    const { tasks, projects } = useTasks();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Hi! I'm Planora AI. Ask me about your tasks, deadlines, or projects." }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input.trim();
        setInput("");

        const newMessages: Message[] = [...messages, { role: "user", content: userMsg }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            // Create a minimized context string to save tokens
            const activeTasks = tasks.filter(t => t.status !== "completed").map(t => ({
                title: t.title,
                priority: t.priority,
                status: t.status,
                due: t.due_date,
                project: projects.find(p => p.id === t.projectId)?.name || "None"
            }));

            const contextString = JSON.stringify({
                active_tasks: activeTasks,
                total_projects: projects.length,
            });

            const res = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: newMessages,
                    context: contextString
                }),
            });

            const data = await res.json();

            if (res.status === 401) {
                setMessages(prev => [...prev, { role: "assistant", content: "Error: " + (data.error || "Invalid API Key.") }]);
            } else if (data.reply) {
                setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
            } else {
                setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I ran into an error processing that." }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: "assistant", content: "Network error. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[350px] sm:w-[400px] bg-white/90 backdrop-blur-xl border border-indigo-100/50 shadow-2xl shadow-indigo-900/10 rounded-3xl overflow-hidden flex flex-col h-[500px] max-h-[75vh] animate-in slide-in-from-bottom-5 fade-in duration-300">

                    {/* Header */}
                    <div className="px-5 py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-2.5">
                            <div className="bg-white/20 p-1.5 rounded-full backdrop-blur-sm">
                                <Sparkles size={18} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm tracking-wide">Planora AI</h3>
                                <p className="text-[10px] text-indigo-100 font-medium opacity-90">Powered by Gemini</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>


                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50 custom-scrollbar">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div
                                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${msg.role === "user"
                                        ? "bg-indigo-600 text-white rounded-br-sm shadow-sm"
                                        : "bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm"
                                        }`}
                                >
                                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                                    <Loader2 size={16} className="text-indigo-500 animate-spin" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-slate-100">
                        <div className="relative flex items-end gap-2">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask about your tasks..."
                                className="w-full bg-slate-100/50 border border-slate-200 rounded-2xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 resize-none max-h-[120px] transition-all text-slate-700 placeholder:text-slate-400"
                                rows={1}
                                style={{ minHeight: '44px' }}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className="absolute right-1.5 bottom-1.5 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shadow-sm"
                            >
                                <Send size={16} className="ml-0.5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'} transition-all duration-300 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/30 hover:scale-105 active:scale-95`}
            >
                <MessageSquare size={24} />
            </button>

            {/* Adding a small global style for the custom scrollbar in this component */}
            <style dangerouslySetInnerHTML={{
                __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 20px;
        }
      `}} />
        </div>
    );
}
