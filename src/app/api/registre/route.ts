import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isRateLimited } from "@/lib/rateLimit";
import { MAX_CAPACITY } from "@/lib/constants";

export async function POST(request: NextRequest) {
  const sql = getDb();

  // DB-backed rate limit by IP — works across serverless instances
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (await isRateLimited(ip, sql)) {
    return NextResponse.json(
      { message: "Massa intents. Torna a intentar-ho en uns minuts." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  try {
    const body = await request.json();
    const { telefon, website } = body;

    // Honeypot: bots fill every visible field including hidden ones; humans never do
    if (website) {
      return NextResponse.json({ message: "Registre creat correctament" }, { status: 201 });
    }

    // Trim text inputs to avoid dirty data and bypass attempts with padding
    const nom = typeof body.nom === "string" ? body.nom.trim() : "";
    const cognoms = typeof body.cognoms === "string" ? body.cognoms.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const genere = typeof body.genere === "string" ? body.genere.trim() : "";

    const GENERES_VALIDS = ["Home", "Dona", "Prefereixo no dir-ho"];

    if (!nom || !cognoms || telefon === undefined || !email || !genere) {
      return NextResponse.json(
        { message: "Tots els camps són obligatoris" },
        { status: 400 }
      );
    }

    if (!GENERES_VALIDS.includes(genere)) {
      return NextResponse.json(
        { message: "Valor de gènere no vàlid." },
        { status: 400 }
      );
    }

    // Enforce max lengths to prevent oversized payloads hitting the DB
    if (nom.length > 100 || cognoms.length > 100 || email.length > 254) {
      return NextResponse.json({ message: "Camp massa llarg." }, { status: 400 });
    }

    if (typeof telefon !== "number" || isNaN(telefon)) {
      return NextResponse.json(
        { message: "El número de telèfon ha de ser un número vàlid" },
        { status: 400 }
      );
    }

    // Validate Spanish phone format: 9 digits, starts with 6, 7 or 9
    if (!/^[679]\d{8}$/.test(telefon.toString())) {
      return NextResponse.json(
        { message: "Número invàlid. Ha de tenir 9 dígits i començar per 6, 7 o 9.", code: "INVALID_PHONE" },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { message: "Correu electrònic invàlid." },
        { status: 400 }
      );
    }

    // Check capacity before running uniqueness queries
    const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM registres`;
    if (count >= MAX_CAPACITY) {
      return NextResponse.json(
        { message: "L'aforament és ple. Gràcies pel teu interès!" },
        { status: 409 }
      );
    }

    const existingPhone = await sql`SELECT id FROM registres WHERE telefon = ${telefon}`;
    if (existingPhone.length > 0) {
      return NextResponse.json(
        { message: "Número de telèfon ja inscrit.", code: "PHONE_EXISTS" },
        { status: 409 }
      );
    }

    const existingEmail = await sql`SELECT id FROM registres WHERE email = ${email}`;
    if (existingEmail.length > 0) {
      return NextResponse.json(
        { message: "Correu electrònic ja inscrit.", code: "EMAIL_EXISTS" },
        { status: 409 }
      );
    }

    await sql`
      INSERT INTO registres (nom, cognoms, telefon, email, genere)
      VALUES (${nom}, ${cognoms}, ${telefon}, ${email}, ${genere})
    `;

    return NextResponse.json({ message: "Registre creat correctament" }, { status: 201 });
  } catch (error) {
    console.error("Error creating registre:", error);
    return NextResponse.json({ message: "Error intern del servidor" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Protect with a secret token — access via /api/registre?secret=YOUR_ADMIN_SECRET
  const secret = request.nextUrl.searchParams.get("secret");
  if (!process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ message: "No autoritzat" }, { status: 401 });
  }

  try {
    const sql = getDb();
    const registres = await sql`SELECT * FROM registres ORDER BY created_at DESC`;
    return NextResponse.json(registres);
  } catch (error) {
    console.error("Error fetching registres:", error);
    return NextResponse.json({ message: "Error intern del servidor" }, { status: 500 });
  }
}
