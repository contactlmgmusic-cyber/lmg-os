import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = body.message;

    if (!message) {
      return NextResponse.json(
        { error: "Message manquant." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      response: `Assistant LMG reçu : ${message}`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur assistant." },
      { status: 500 }
    );
  }
}