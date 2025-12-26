
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { person_id, title, meeting_time, reflection_text } = body;

        if (!person_id || !title || !meeting_time || !reflection_text) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Optional: Verify person belongs to user
        const { data: person, error: personError } = await supabase
            .from('people')
            .select('id')
            .eq('id', person_id)
            .eq('user_id', user.id)
            .single();

        if (!person || personError) {
            return NextResponse.json({ error: "Invalid person ID" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('meetings')
            .insert({
                user_id: user.id,
                person_id,
                title,
                meeting_time,
                reflection_text
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
