
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: meetings, error } = await supabase
            .from('meetings')
            .select(`
        id,
        title,
        meeting_time,
        person_id,
        people (
            name
        )
      `)
            .eq('user_id', user.id)
            .gte('meeting_time', new Date().toISOString())
            .order('meeting_time', { ascending: true });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ meetings });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
