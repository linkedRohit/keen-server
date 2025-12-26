
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = params;

        // Fetch meeting with associated insight
        // We use inner join or manual fetch. Let's try explicit relationship if set up, or manual.
        // Assuming 'insights' has a FK, we can left join.
        const { data: meeting, error } = await supabase
            .from('meetings')
            .select(`
        *,
        people (
          name,
          persona_tags
        ),
        insights (
          id,
          json_payload,
          meeting_score,
          created_at
        )
      `)
            .eq('id', id)
            .eq('user_id', user.id) // RLS handles this, but good to be explicit
            .single();

        if (error) {
            return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
        }

        return NextResponse.json(meeting);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
