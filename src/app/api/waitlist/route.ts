import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { waitlist } from "@/lib/schema";

export async function POST(req: Request) {
  try {
    const { email, country } = await req.json();

    if (!email || !country) {
      return NextResponse.json({ error: "Email and country are required" }, { status: 400 });
    }

    const entry = await getDb()
      .insert(waitlist)
      .values({ email, country })
      .onConflictDoNothing()
      .returning();

    return NextResponse.json({ success: true, id: entry[0]?.id });
  } catch (err) {
    console.error("Waitlist error:", err);
    return NextResponse.json({ success: true });
  }
}
