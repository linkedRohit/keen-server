
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { person_id, meeting_id, reflection_text } = await request.json();

        if (!person_id || !meeting_id || !reflection_text) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Verify ownership
        const { data: meeting, error: meetingError } = await supabase
            .from('meetings')
            .select('*')
            .eq('id', meeting_id)
            .eq('user_id', user.id)
            .single();

        if (meetingError || !meeting) {
            return NextResponse.json({ error: "Meeting not found or access denied" }, { status: 404 });
        }

        // Call LLM
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: { responseMimeType: "application/json" } // Force JSON return
        });

        const prompt = `
    Analyze this meeting reflection and provide insights.
    
    Context:
    - User ID: ${user.id} (Do not expose this)
    - Meeting Title: ${meeting.title}
    - Reflection: "${reflection_text}"

    Rules:
    - No hallucinations. Only use provided text.
    - No cross-meeting context.
    - Output strictly valid JSON.
    - Schema: { "summary": string, "sentiment": "positive"|"neutral"|"negative", "action_items": string[], "score": number (1-10) }
    `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        let structuredData;

        try {
            structuredData = JSON.parse(responseText);
        } catch (e) {
            return NextResponse.json({ error: "Failed to parse LLM response" }, { status: 500 });
        }

        // Save to DB
        const { data: insight, error: insertError } = await supabase
            .from('insights')
            .insert({
                meeting_id,
                user_id: user.id,
                json_payload: structuredData,
                meeting_score: structuredData.score || 0
            })
            .select()
            .single();

        if (insertError) {
            console.error("DB Error:", insertError);
            return NextResponse.json({ error: "Failed to save insight" }, { status: 500 });
        }

        return NextResponse.json({ success: true, insight });

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
