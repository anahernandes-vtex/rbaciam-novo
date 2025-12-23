import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../auth";
import { kv } from "@vercel/kv";
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

            // Converter para array e ordenar
            const teamsArray = Array.from(teamsMap.entries())
              .map(([team, accesses]) => ({
                team,
                accesses: accesses.sort((a, b) =>
                  a.system.localeCompare(b.system, "pt-BR")
                ),
              }))
              .sort((a, b) => a.team.localeCompare(b.team, "pt-BR"));

            // Salvar no Vercel KV
            await kv.set("rbac:matrix", JSON.stringify(teamsArray));
            await kv.set("rbac:last-update", new Date().toISOString());

            resolve(
              NextResponse.json({
                message: `Matriz atualizada com sucesso! ${teamsArray.length} times e ${teamsArray.reduce(
                  (sum, t) => sum + t.accesses.length,
                  0
                )} acessos processados.`,
                count: {
                  teams: teamsArray.length,
                  accesses: teamsArray.reduce((sum, t) => sum + t.accesses.length, 0),
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

