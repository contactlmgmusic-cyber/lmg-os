import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Ce générateur a été remplacé par l’Assistant LMG sécurisé." },
    { status: 410 }
  );
}
