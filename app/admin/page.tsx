"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Lista de emails autorizados
// Esta lista deve corresponder à variável ADMIN_EMAILS na Vercel
const ADMIN_EMAILS = [
  "ana.hernandes@vtex.com",
];

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user?.email) {
      if (!ADMIN_EMAILS.includes(session.user.email)) {
        router.push("/");
        return;
      }
    }

    // Buscar última atualização
    fetchLastUpdate();
  }, [status, session, router]);

  const fetchLastUpdate = async () => {
    try {
      const res = await fetch("/api/admin/last-update");
      if (res.ok) {
        const data = await res.json();
        if (data.lastUpdate) {
          setLastUpdate(new Date(data.lastUpdate).toLocaleString("pt-BR"));
        }
      }
    } catch (error) {
      console.error("Erro ao buscar última atualização:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage({ type: "error", text: "Por favor, selecione um arquivo CSV" });
      return;
    }

    setIsUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: data.message || "Dados atualizados com sucesso!" });
        setFile(null);
        // Resetar input
        const fileInput = document.getElementById("csv-file") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        fetchLastUpdate();
      } else {
        setMessage({ type: "error", text: data.error || "Erro ao processar arquivo" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao fazer upload do arquivo" });
      console.error("Erro:", error);
    } finally {
      setIsUploading(false);
    }
  };

  if (status === "loading") {
    return (
      <main>
        <div className="rbac-wrapper">
          <div className="rbac-card">
            <p style={{ textAlign: "center" }}>Carregando...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    return null;
  }

  return (
    <main>
      <div className="rbac-wrapper">
        <div className="rbac-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div style={{ textAlign: "center", flex: 1 }}>
              <span className="rbac-badge">ADMIN · RBAC IAM</span>
            </div>
            <button
              onClick={() => router.push("/")}
              style={{
                padding: "6px 12px",
                fontSize: "12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                backgroundColor: "#f3f4f6",
                cursor: "pointer",
                color: "#374151",
              }}
            >
              Voltar
            </button>
          </div>

          <h1 className="rbac-title">Painel de Administração</h1>
          <p className="rbac-subtitle">
            Faça upload de um arquivo CSV para atualizar a matriz de acessos
          </p>

          {lastUpdate && (
            <div style={{
              marginTop: 16,
              padding: 12,
              backgroundColor: "#f0f9ff",
              border: "1px solid #bae6fd",
              borderRadius: 8,
              fontSize: 13,
              color: "#0369a1",
            }}>
              <strong>Última atualização:</strong> {lastUpdate}
            </div>
          )}

          <div style={{ marginTop: 24 }}>
            <label className="rbac-label" htmlFor="csv-file">
              Selecionar arquivo CSV
            </label>
            <input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                fontSize: 14,
                marginTop: 8,
              }}
            />
            <span className="rbac-help" style={{ marginTop: 4, display: "block" }}>
              O arquivo deve ter as colunas: Time, Sistema, Acesso proposto Líder, Perfil, Role, times
            </span>
          </div>

          {file && (
            <div style={{
              marginTop: 16,
              padding: 12,
              backgroundColor: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              fontSize: 13,
            }}>
              <strong>Arquivo selecionado:</strong> {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            style={{
              width: "100%",
              marginTop: 20,
              padding: "12px 24px",
              fontSize: 14,
              fontWeight: 600,
              border: "none",
              borderRadius: "12px",
              backgroundColor: !file || isUploading ? "#d1d5db" : "#ec4899",
              color: "#ffffff",
              cursor: !file || isUploading ? "not-allowed" : "pointer",
              transition: "background-color 0.2s",
            }}
          >
            {isUploading ? "Processando..." : "Atualizar Matriz de Acessos"}
          </button>

          {message && (
            <div
              style={{
                marginTop: 16,
                padding: 12,
                backgroundColor: message.type === "success" ? "#ecfdf3" : "#fee2e2",
                border: `1px solid ${message.type === "success" ? "#bbf7d0" : "#fecaca"}`,
                borderRadius: 8,
                fontSize: 13,
                color: message.type === "success" ? "#166534" : "#991b1b",
              }}
            >
              {message.text}
            </div>
          )}

          <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid #e5e7eb" }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Instruções</h3>
            <ol style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.8, paddingLeft: 20 }}>
              <li>Prepare seu arquivo CSV com as colunas: Time, Sistema, Acesso proposto Líder, Perfil, Role, times</li>
              <li>Selecione o arquivo usando o botão acima</li>
              <li>Clique em "Atualizar Matriz de Acessos"</li>
              <li>Os dados serão processados e salvos automaticamente</li>
              <li>A atualização será refletida imediatamente na aplicação</li>
            </ol>
          </div>
        </div>
      </div>
    </main>
  );
}

