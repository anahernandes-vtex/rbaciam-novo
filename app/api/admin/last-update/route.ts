import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function GET() {
  try {
    // Tentar buscar do banco de dados
    try {
      const result = await sql`
        SELECT updated_at FROM last_update WHERE id = 1
      `;

      if (result.rows.length > 0 && result.rows[0].updated_at) {
        return NextResponse.json({ lastUpdate: result.rows[0].updated_at });
      }
    } catch (error) {
      // Tabela não existe ainda ou banco não configurado
      console.log("Banco de dados não configurado");
    }

    return NextResponse.json({ lastUpdate: null });
  } catch (error) {
    console.error("Erro ao buscar última atualização:", error);
    return NextResponse.json({ lastUpdate: null });
  }
}
