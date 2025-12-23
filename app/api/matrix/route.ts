import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import data from "../../../data/matrix.json";

export async function GET() {
  try {
    // Tentar buscar do Vercel KV primeiro
    const kvData = await kv.get<string>("rbac:matrix");
    
    if (kvData) {
      return NextResponse.json(JSON.parse(kvData));
    }

    // Fallback para o JSON estático
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao buscar matriz:", error);
    // Fallback para o JSON estático em caso de erro
    return NextResponse.json(data);
  }
}

