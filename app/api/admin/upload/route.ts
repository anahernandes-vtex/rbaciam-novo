import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../auth";
import { sql } from "@vercel/postgres";
import Papa from "papaparse";

// Lista de emails autorizados
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(",") || [
  "ana.hernandes@vtex.com",
];

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Verificar se é admin
    if (!ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    // Obter arquivo
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Arquivo não fornecido" }, { status: 400 });
    }

    // Ler conteúdo do arquivo
    const text = await file.text();

    // Processar CSV
    return new Promise((resolve) => {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            const data = results.data as any[];

            // Criar tabelas se não existirem
            await sql`
              CREATE TABLE IF NOT EXISTS teams (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
              );
            `;

            await sql`
              CREATE TABLE IF NOT EXISTS accesses (
                id SERIAL PRIMARY KEY,
                team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
                system VARCHAR(255) NOT NULL,
                classification TEXT,
                profile VARCHAR(255),
                role VARCHAR(255),
                teams TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(team_id, system)
              );
            `;

            await sql`
              CREATE TABLE IF NOT EXISTS last_update (
                id INTEGER PRIMARY KEY DEFAULT 1,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT single_row CHECK (id = 1)
              );
            `;

            // Limpar dados antigos
            await sql`DELETE FROM accesses`;
            await sql`DELETE FROM teams`;

            // Agrupar por time
            const teamsMap = new Map<string, any[]>();

            data.forEach((row) => {
              const team = row.Time?.trim();
              const system = row.Sistema?.trim();
              const classification = row["Acesso proposto Líder"]?.trim() || "";
              const profile = row.Perfil?.trim() || "";
              const role = row.Role?.trim() || "";
              const teams = row.times?.trim() || "";

              if (!team || !system) return;

              if (!teamsMap.has(team)) {
                teamsMap.set(team, []);
              }

              teamsMap.get(team)!.push({
                system,
                classification,
                profile,
                role,
                teams,
              });
            });

            // Inserir times e acessos
            let totalTeams = 0;
            let totalAccesses = 0;

            for (const [teamName, accesses] of teamsMap.entries()) {
              // Inserir time
              const teamResult = await sql`
                INSERT INTO teams (name)
                VALUES (${teamName})
                ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
                RETURNING id
              `;

              const teamId = teamResult.rows[0].id;

              // Inserir acessos
              for (const access of accesses) {
                await sql`
                  INSERT INTO accesses (team_id, system, classification, profile, role, teams)
                  VALUES (${teamId}, ${access.system}, ${access.classification}, ${access.profile}, ${access.role}, ${access.teams})
                  ON CONFLICT (team_id, system) DO UPDATE SET
                    classification = EXCLUDED.classification,
                    profile = EXCLUDED.profile,
                    role = EXCLUDED.role,
                    teams = EXCLUDED.teams
                `;
                totalAccesses++;
              }
              totalTeams++;
            }

            // Atualizar timestamp
            await sql`
              INSERT INTO last_update (id, updated_at)
              VALUES (1, CURRENT_TIMESTAMP)
              ON CONFLICT (id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
            `;

            resolve(
              NextResponse.json({
                message: `Matriz atualizada com sucesso no banco de dados! ${totalTeams} times e ${totalAccesses} acessos processados.`,
                count: {
                  teams: totalTeams,
                  accesses: totalAccesses,
                },
              })
            );
          } catch (error: any) {
            console.error("Erro ao processar CSV:", error);
            resolve(
              NextResponse.json(
                { error: `Erro ao processar CSV: ${error.message}` },
                { status: 500 }
              )
            );
          }
        },
        error: (error) => {
          console.error("Erro ao parsear CSV:", error);
          resolve(
            NextResponse.json(
              { error: `Erro ao ler arquivo CSV: ${error.message}` },
              { status: 400 }
            )
          );
        },
      });
    });
  } catch (error: any) {
    console.error("Erro no upload:", error);
    return NextResponse.json(
      { error: `Erro interno: ${error.message}` },
      { status: 500 }
    );
  }
}
