import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import data from "../../../data/matrix.json";

export async function GET() {
  try {
    // Tentar buscar do KV primeiro
    try {
      const { kv } = await import("@vercel/kv");
      const kvData = await kv.get<string>("rbac:matrix");
      
      if (kvData) {
        return NextResponse.json(JSON.parse(kvData));
      }
    } catch (error) {
      // KV não disponível, continuar
    }

    // Fallback: ler do arquivo JSON
    const filePath = path.join(process.cwd(), "data", "matrix.json");
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, "utf-8");
      return NextResponse.json(JSON.parse(fileData));
    }

    // Último fallback: usar dados importados
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao buscar matriz:", error);
    // Fallback final
    return NextResponse.json(data);
  }
}
