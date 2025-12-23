import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    // Tentar buscar do KV primeiro
    try {
      const { kv } = await import("@vercel/kv");
      const lastUpdate = await kv.get<string>("rbac:last-update");
      if (lastUpdate) {
        return NextResponse.json({ lastUpdate });
      }
    } catch (error) {
      // KV não disponível, continuar
    }

    // Fallback: ler do arquivo
    const timestampPath = path.join(process.cwd(), "data", ".last-update");
    if (fs.existsSync(timestampPath)) {
      const lastUpdate = fs.readFileSync(timestampPath, "utf-8");
      return NextResponse.json({ lastUpdate });
    }

    return NextResponse.json({ lastUpdate: null });
  } catch (error) {
    console.error("Erro ao buscar última atualização:", error);
    return NextResponse.json({ lastUpdate: null });
  }
}
