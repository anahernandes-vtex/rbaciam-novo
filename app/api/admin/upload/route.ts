import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../auth";
import Papa from "papaparse";

// Lista de emails autorizados
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(",") || [
  "ana.hernandes@vtex.com",
];

// Função para salvar no KV (se disponível)
async function saveToKV(data: any, timestamp: string) {
  try {
    const { kv } = await import("@vercel/kv");
    await kv.set("rbac:matrix", JSON.stringify(data));
    await kv.set("rbac:last-update", timestamp);
    return true;
  } catch (error) {
    return false;
  }
}

// Função para fazer commit automático no Git (opcional)
async function commitToGit(data: any, timestamp: string) {
  try {
    const githubToken = process.env.GITHUB_TOKEN;
    const repoOwner = process.env.GITHUB_REPO_OWNER || "anahernandes-vtex";
    const repoName = process.env.GITHUB_REPO_NAME || "rbaciam-novo";

    if (!githubToken) {
      return false; // Sem token, não pode fazer commit
    }

    const { Octokit } = await import("@octokit/rest");
    const octokit = new Octokit({ auth: githubToken });

    // Obter conteúdo atual do arquivo
    const filePath = "data/matrix.json";
    const content = JSON.stringify(data, null, 2);
    const encodedContent = Buffer.from(content).toString("base64");

    try {
      // Tentar obter SHA do arquivo existente
      const { data: fileData } = await octokit.repos.getContent({
        owner: repoOwner,
        repo: repoName,
        path: filePath,
      });

      const sha = (fileData as any).sha;

      // Atualizar arquivo
      await octokit.repos.createOrUpdateFileContents({
        owner: repoOwner,
        repo: repoName,
        path: filePath,
        message: `Atualizar matriz de acessos - ${timestamp}`,
        content: encodedContent,
        sha: sha,
      });

      return true;
    } catch (error: any) {
      if (error.status === 404) {
        // Arquivo não existe, criar novo
        await octokit.repos.createOrUpdateFileContents({
          owner: repoOwner,
          repo: repoName,
          path: filePath,
          message: `Criar matriz de acessos - ${timestamp}`,
          content: encodedContent,
        });
        return true;
      }
      throw error;
    }
  } catch (error) {
    console.error("Erro ao fazer commit no Git:", error);
    return false;
  }
}

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

            const timestamp = new Date().toISOString();
            const saveMethods: string[] = [];

            // Tentar salvar no KV primeiro
            const savedToKV = await saveToKV(teamsArray, timestamp);
            if (savedToKV) {
              saveMethods.push("banco de dados (KV)");
            }

            // Tentar fazer commit no Git
            const savedToGit = await commitToGit(teamsArray, timestamp);
            if (savedToGit) {
              saveMethods.push("Git (deploy automático)");
            }

            let message = `Matriz atualizada com sucesso! ${teamsArray.length} times e ${teamsArray.reduce(
              (sum, t) => sum + t.accesses.length,
              0
            )} acessos processados.`;

            if (saveMethods.length > 0) {
              message += ` Salvo em: ${saveMethods.join(", ")}.`;
              if (savedToGit) {
                message += " A Vercel fará deploy automático em alguns minutos.";
              }
            } else {
              message += " ⚠️ Configure Upstash Redis ou GITHUB_TOKEN para salvar automaticamente.";
            }

            resolve(
              NextResponse.json({
                message,
                count: {
                  teams: teamsArray.length,
                  accesses: teamsArray.reduce((sum, t) => sum + t.accesses.length, 0),
                },
                savedToKV,
                savedToGit,
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
