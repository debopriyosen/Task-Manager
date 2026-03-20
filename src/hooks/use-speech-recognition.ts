"use client";

import { useState, useEffect, useCallback } from "react";

interface UseSpeechRecognitionReturn {
    isListening: boolean;
    transcript: string;
    startListening: () => void;
    stopListening: () => void;
    resetTranscript: () => void;
    hasSupport: boolean;
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [recognition, setRecognition] = useState<any>(null);
    const [hasSupport, setHasSupport] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            
            if (SpeechRecognitionAPI) {
                setHasSupport(true);
                const recog = new SpeechRecognitionAPI();
                recog.continuous = false;
                recog.interimResults = true;
                recog.lang = "en-US";
                
                recog.onresult = (event: any) => {
                    let text = "";
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        text += event.results[i][0].transcript;
                    }
                    setTranscript(text);
                };

                recog.onend = () => {
                    setIsListening(false);
                };

                recog.onerror = (event: any) => {
                    console.error("Speech recognition error", event.error);
                    setIsListening(false);
                };

                setRecognition(recog);
            }
        }
    }, []);

    const startListening = useCallback(() => {
        if (recognition) {
            setTranscript("");
            setIsListening(true);
            try {
                recognition.start();
            } catch (error) {
                console.error("Failed to start speech recognition. It might already be running.", error);
            }
        }
    }, [recognition]);

    const stopListening = useCallback(() => {
        if (recognition) {
            try {
                recognition.stop();
            } catch (error) {
                // ignore
            }
            setIsListening(false);
        }
    }, [recognition]);

    const resetTranscript = useCallback(() => {
        setTranscript("");
    }, []);

    return {
        isListening,
        transcript,
        startListening,
        stopListening,
        resetTranscript,
        hasSupport
    };
}
