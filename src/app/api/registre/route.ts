import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nom, cognoms, telefon } = body;

    if (!nom || !cognoms || telefon === undefined) {
      return NextResponse.json(
        { message: "Tots els camps son obligatoris" },
        { status: 400 }
      );
    }

    if (typeof telefon !== "number" || isNaN(telefon)) {
      return NextResponse.json(
        { message: "El numero de telefon ha de ser un numero valid" },
        { status: 400 }
      );
    }

    const sql = getDb();

    // Verificar si el teléfono ya existe
    const existing = await sql`
      SELECT id FROM registres WHERE telefon = ${telefon}
    `;

    if (existing.length > 0) {
      return NextResponse.json(
        { message: "Número de telèfon ja inscrit.", code: "PHONE_EXISTS" },
        { status: 409 }
      );
    }

    await sql`
      INSERT INTO registres (nom, cognoms, telefon)
      VALUES (${nom}, ${cognoms}, ${telefon})
    `;

    return NextResponse.json(
      { message: "Registre creat correctament" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating registre:", error);
    return NextResponse.json(
      { message: "Error intern del servidor" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const sql = getDb();
    const registres = await sql`SELECT * FROM registres ORDER BY created_at DESC`;
    return NextResponse.json(registres);
  } catch (error) {
    console.error("Error fetching registres:", error);
    return NextResponse.json(
      { message: "Error intern del servidor" },
      { status: 500 }
    );
  }
}
