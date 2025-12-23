import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import data from "../../../data/matrix.json";

export async function GET() {
  try {
    // Tentar buscar do banco de dados Postgres
    try {
      const teamsResult = await sql`
        SELECT id, name FROM teams ORDER BY name
      `;

      if (teamsResult.rows.length > 0) {
        const accessesResult = await sql`
          SELECT 
            t.name as team,
            a.system,
            a.classification,
            a.profile,
            a.role,
            a.teams
          FROM accesses a
          JOIN teams t ON a.team_id = t.id
          ORDER BY t.name, a.system
        `;

        // Agrupar por time
        const teamsMap = new Map<string, any[]>();

        accessesResult.rows.forEach((row: any) => {
          const team = row.team;
          if (!teamsMap.has(team)) {
            teamsMap.set(team, []);
          }
          teamsMap.get(team)!.push({
            system: row.system,
            classification: row.classification || "",
            profile: row.profile || "",
            role: row.role || "",
            teams: row.teams || "",
          });
        });

        const teamsArray = Array.from(teamsMap.entries()).map(([team, accesses]) => ({
          team,
          accesses: accesses.sort((a, b) => a.system.localeCompare(b.system, "pt-BR")),
        })).sort((a, b) => a.team.localeCompare(b.team, "pt-BR"));

        return NextResponse.json(teamsArray);
      }
    } catch (error) {
      console.log("Banco de dados não configurado, usando fallback:", error);
    }

    // Fallback: usar dados do JSON
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao buscar matriz:", error);
    return NextResponse.json(data);
  }
}
