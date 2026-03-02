import { OpenAI } from "openai";
import { NextResponse } from "next/server";

// We initialize openai without throwing if key is missing during build
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
}) : null;

export async function POST(req: Request) {
    try {
        if (!openai) {
            return NextResponse.json(
                { error: "OpenAI API key not configured" },
                { status: 500 }
            );
        }

        const { title, description } = await req.json();

        if (!title) {
            return NextResponse.json(
                { error: "Task title is required" },
                { status: 400 }
            );
        }

        const prompt = `
      You are an AI task assistant. Break down the following complex task into 3 to 7 smaller, highly actionable subtasks.
      
      Task Title: ${title}
      ${description ? `Task Description: ${description}` : ""}
      
      Return ONLY a JSON array of strings representing the subtasks, in chronological order of execution. Example: ["Step 1", "Step 2"]. Do not wrap the JSON in markdown code blocks.
    `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Cost-effective model
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
        });

        const content = response.choices[0].message.content;

        if (!content) {
            throw new Error("No response from AI");
        }

        // Try parsing the JSON. Since we asked for raw JSON, we'll try to extract if it has markdown format
        let subtasks = [];
        try {
            const cleanJson = content.replace(/```json/g, "").replace(/```/g, "").trim();
            subtasks = JSON.parse(cleanJson);
        } catch (e) {
            // Fallback if AI didn't return perfect JSON array
            subtasks = content.split('\n').map(line => line.replace(/^[-*0-9.]\s*/, '').trim()).filter(Boolean);
        }

        return NextResponse.json({ subtasks });
    } catch (error) {
        console.error("[AI_BREAKDOWN_ERROR]", error);
        return NextResponse.json(
            { error: "Failed to generate task breakdown" },
            { status: 500 }
        );
    }
}
