import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { MAX_CAPACITY } from "@/lib/constants";

// Public endpoint — returns only the count, no personal data
export async function GET() {
  try {
    const sql = getDb();
    const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM registres`;
    return NextResponse.json({ count, remaining: MAX_CAPACITY - count });
  } catch (error) {
    console.error("Error fetching count:", error);
    return NextResponse.json({ message: "Error intern del servidor" }, { status: 500 });
  }
}
