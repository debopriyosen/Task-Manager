import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { title, description, geminiApiKey } = await req.json();

        if (!geminiApiKey) {
            return NextResponse.json(
                { error: "Google Gemini API key not provided. Add it in Settings." },
                { status: 401 }
            );
        }

        if (!title) {
            return NextResponse.json(
                { error: "Task title is required" },
                { status: 400 }
            );
        }

        // Initialize Gemini with the user-provided key
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
          You are an AI task assistant. Break down the following complex task into 3 to 7 smaller, highly actionable subtasks.
          
          Task Title: ${title}
          ${description ? `Task Description: ${description}` : ""}
          
          Return ONLY a JSON array of strings representing the subtasks, in chronological order of execution. Example: ["Step 1", "Step 2"]. Do not wrap the JSON in markdown code blocks or add any other conversational text.
        `;

        const result = await model.generateContent(prompt);
        const content = result.response.text();

        if (!content) {
            throw new Error("No response from AI");
        }

        // Try parsing the JSON.
        let subtasks = [];
        try {
            const cleanJson = content.replace(/```json/g, "").replace(/```/g, "").trim();
            subtasks = JSON.parse(cleanJson);
        } catch (e) {
            // Fallback if AI didn't return perfect JSON array
            subtasks = content.split('\n').map(line => line.replace(/^[-*0-9.]\s*/, '').trim()).filter(Boolean);
        }

        return NextResponse.json({ subtasks });
    } catch (error: any) {
        console.error("[AI_BREAKDOWN_ERROR]", error);

        // Handle invalid keys gracefully
        if (error?.message?.includes('API key not valid')) {
            return NextResponse.json(
                { error: "Invalid Gemini API key. Please check your settings." },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { error: "Failed to generate task breakdown" },
            { status: 500 }
        );
    }
}
