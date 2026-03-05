import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { messages, context } = await req.json();

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "Server AI configuration error. GEMINI_API_KEY is not set." },
                { status: 500 }
            );
        }

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { error: "Invalid conversation history provided." },
                { status: 400 }
            );
        }

        console.log("[AI_CHAT] Initializing Gemini with model...");
        // Initialize Gemini with the server-provided key
        const genAI = new GoogleGenerativeAI(apiKey);

        // We configure the model with a system instruction to ground it in the app's context
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: `You are Planora AI, a helpful, concise, and highly capable task management assistant designed to help the user manage their productivity. 
            
Here is the user's current LIVE data context (including their tasks and projects):
${context}

Instructions:
1. Answer the user's questions based primarily on the provided context (their tasks).
2. If they ask about due dates, priorities, or project statuses, accurately reference the JSON data above.
3. If they ask a general productivity question, you can answer it using your general knowledge.
4. If they ask about something not in their tasks, politely inform them that you only see their Planora tasks.
5. Be concise, friendly, and format your responses using simple Markdown (like bolding task titles or bulleting lists).
6. Do NOT expose or talk about raw JSON structures or UUIDs to the user. Present the information naturally.`
        });

        console.log("[AI_CHAT] Formatting chat history array...");

        // Gemini strictly requires the first message in 'history' to be from the 'user',
        // and the roles MUST strictly alternate (user, model, user, model...)
        // It must also end with 'model', since the very next message via sendMessage is 'user'.
        const validHistory: { role: string; parts: { text: string }[] }[] = [];
        const rawHistory = messages.slice(0, -1);

        for (const msg of rawHistory) {
            const role = msg.role === 'user' ? 'user' : 'model';

            if (validHistory.length === 0) {
                // Must start with user
                if (role === 'user') {
                    validHistory.push({ role, parts: [{ text: msg.content }] });
                }
            } else {
                // Must alternate
                if (validHistory[validHistory.length - 1].role !== role) {
                    validHistory.push({ role, parts: [{ text: msg.content }] });
                }
            }
        }

        // Must end with model
        if (validHistory.length > 0 && validHistory[validHistory.length - 1].role === 'user') {
            validHistory.pop();
        }

        const chatHistory = validHistory;

        // The last message is the current prompt
        const currentPrompt = messages[messages.length - 1].content;

        console.log("[AI_CHAT] Starting Chat Session...");
        // Initialize chat
        const chat = model.startChat({
            history: chatHistory,
            generationConfig: {
                maxOutputTokens: 1000,
                temperature: 0.7,
            },
        });

        console.log("[AI_CHAT] Sending message to model...");
        const result = await chat.sendMessage(currentPrompt);

        console.log("[AI_CHAT] Reading message response...");
        const responseText = result.response.text();

        return NextResponse.json({ reply: responseText });
    } catch (error: any) {
        console.error("[AI_CHAT_ERROR_TRACE]", error);

        if (error?.message?.includes('API key not valid')) {
            return NextResponse.json(
                { error: "Invalid Gemini API key. Please check your settings." },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { error: "Failed to generate AI response: " + (error?.message || "Unknown error") },
            { status: 500 }
        );
    }
}
