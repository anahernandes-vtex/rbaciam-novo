import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export async function GET() {
  try {
    const lastUpdate = await kv.get<string>("rbac:last-update");
    return NextResponse.json({ lastUpdate: lastUpdate || null });
  } catch (error) {
    console.error("Erro ao buscar última atualização:", error);
    return NextResponse.json({ lastUpdate: null });
  }
}

