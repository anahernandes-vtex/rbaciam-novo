"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import data from "../data/matrix.json";

// Lista de emails autorizados para admin
// Esta lista deve corresponder à variável ADMIN_EMAILS na Vercel
const ADMIN_EMAILS = [
  "ana.hernandes@vtex.com",
];

type Access = {
  system: string;
  classification: string;
  profile: string;
  role: string;
  teams: string;
};

type Team = {
  team: string;
  accesses: Access[];
};

// Fallback para dados estáticos
const staticTeams: Team[] = data as Team[];

// Classifica o tipo de acesso com base no texto
function getAccessType(classification: string): "automatic" | "request" | "other" {
  const text = classification.toLowerCase();

  if (text.includes("mediante request") || text.includes("request")) {
    return "request";
  }

  if (text.includes("automático") || text.includes("automatico")) {
    return "automatic";
  }

  return "other";
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const [selectedTeamName, setSelectedTeamName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlighted, setHighlighted] = useState<number | null>(null);
  const [teams, setTeams] = useState<Team[]>(staticTeams);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Carregar dados da API
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/matrix");
        if (res.ok) {
          const apiData = await res.json();
          setTeams(apiData);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        // Manter dados estáticos em caso de erro
      } finally {
        setIsLoadingData(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    // Se o usuário não está autenticado, redireciona para login
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Lista de times ordenada para o dropdown
  const teamNames = useMemo(
    () => teams.map((t) => t.team).sort((a, b) => a.localeCompare(b, "pt-BR")),
    []
  );
  // Filtra times para o autocomplete com base no valor do input
  type MatchEntry = { name: string; score: number; indices: number[] };

  function fuzzyMatch(q: string, text: string): MatchEntry | null {
    const ql = q.toLowerCase();
    const tl = text.toLowerCase();
    if (!ql) return { name: text, score: 0, indices: [] };

    // Full substring match (best)
    const idx = tl.indexOf(ql);
    if (idx !== -1) {
      return { name: text, score: 100 - Math.max(0, idx), indices: Array.from({ length: ql.length }, (_, i) => idx + i) };
    }

    // Subsequence match (characters in order)
    const indices: number[] = [];
    let qi = 0;
    for (let i = 0; i < tl.length && qi < ql.length; i++) {
      if (tl[i] === ql[qi]) {
        indices.push(i);
        qi++;
      }
    }
    if (qi === ql.length) {
      // score based on compactness of indices and length ratio
      const span = indices[indices.length - 1] - indices[0] + 1;
      const compactness = ql.length / span; // closer to 1 is better
      const density = ql.length / tl.length;
      const score = Math.round(50 + compactness * 30 + density * 20);
      return { name: text, score, indices };
    }

    // Partial matches (some chars matched) - lower score
    if (indices.length > 0) {
      const score = Math.round(10 + (indices.length / ql.length) * 40);
      return { name: text, score, indices };
    }

    return null;
  }

  const filteredTeamNames = useMemo(() => {
    const q = inputValue.trim();
    if (!q) return teamNames.map((n) => ({ name: n, score: 0, indices: [] }));

    const results: MatchEntry[] = [];
    for (const name of teamNames) {
      const m = fuzzyMatch(q, name);
      if (m && m.score >= 10) results.push(m);
    }
    results.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, "pt-BR"));
    return results.slice(0, 50);
  }, [inputValue, teamNames]);

  // Time escolhido (via digitação ou seleção)
  const activeTeam = useMemo(() => {
    const name = (selectedTeamName || inputValue).trim();
    if (!name) return null;
    return teams.find((t) => t.team.toLowerCase() === name.toLowerCase()) ?? null;
  }, [inputValue, selectedTeamName]);

  function handleSelectChange(value: string) {
    setSelectedTeamName(value);
    setInputValue(value);
    setIsOpen(false);
    setHighlighted(null);
  }

  // Comportamento de teclado no campo
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen) {
      if (e.key === "ArrowDown") setIsOpen(true);
      return;
    }

    if (e.key === "ArrowDown") {
      setHighlighted((h) => {
        const next = h === null ? 0 : Math.min(filteredTeamNames.length - 1, h + 1);
        return next;
      });
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      setHighlighted((h) => {
        if (h === null) return Math.max(0, filteredTeamNames.length - 1);
        return Math.max(0, h - 1);
      });
      e.preventDefault();
    } else if (e.key === "Enter") {
      if (highlighted !== null) {
        handleSelectChange(filteredTeamNames[highlighted].name);
        e.preventDefault();
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setHighlighted(null);
    }
  }

  // Fecha o dropdown ao clicar fora
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setHighlighted(null);
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

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

  return (
    <main>
      <div className="rbac-wrapper">
        <div className="rbac-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div style={{ textAlign: "center", flex: 1 }}>
              <span className="rbac-badge">RBAC · IAM</span>
            </div>
            {session?.user && (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {ADMIN_EMAILS.includes(session.user.email || "") && (
                  <button
                    onClick={() => router.push("/admin")}
                    style={{
                      padding: "6px 12px",
                      fontSize: "12px",
                      border: "1px solid #ec4899",
                      borderRadius: "6px",
                      backgroundColor: "#fdf2f8",
                      cursor: "pointer",
                      color: "#be185d",
                      fontWeight: 500,
                    }}
                  >
                    Admin
                  </button>
                )}
                <span style={{ fontSize: "12px", color: "#6b7280" }}>
                  {session.user.email}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
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
                  Sair
                </button>
              </div>
            )}
          </div>

          <h1 className="rbac-title">Consulta de Acessos por Time</h1>
          <p className="rbac-subtitle">
            Selecione um time na lista ou digite para buscar e autocompletar
            para ver os sistemas, tipo de acesso, perfil, role e times associados.
          </p>

          <div className="rbac-search-row">
            <div className="rbac-search-group" ref={containerRef}>
              <label className="rbac-label">Pesquisar time</label>
              <div style={{ position: "relative" }}>
                <input
                  className="rbac-input"
                  placeholder="Digite para buscar ou selecione um time..."
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    setSelectedTeamName("");
                    setIsOpen(true);
                  }}
                  onFocus={() => setIsOpen(true)}
                  onKeyDown={handleKeyDown}
                  aria-autocomplete="list"
                  aria-expanded={isOpen}
                  aria-haspopup="listbox"
                  style={{ paddingRight: "40px" }}
                />
                <div
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                    color: "#9ca3af",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M4 6L8 10L12 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
              <span className="rbac-help">
                Digite parte do nome do time para filtrar e escolha na lista.
              </span>

              {isOpen && filteredTeamNames.length > 0 && (
                <ul className="rbac-autocomplete-list" role="listbox">
                  {filteredTeamNames.map((entry, idx) => {
                    const name = entry.name;
                    const indices = entry.indices;

                    // Render highlighted name using indices
                    const parts: React.ReactNode[] = [];
                    if (indices.length === 0) {
                      parts.push(name);
                    } else if (indices.length === name.length) {
                      parts.push(<mark key={0} className="rbac-match">{name}</mark>);
                    } else {
                      let last = 0;
                      for (let i = 0; i < indices.length; i++) {
                        const idxChar = indices[i];
                        if (idxChar > last) parts.push(name.slice(last, idxChar));
                        parts.push(
                          <mark key={i} className="rbac-match">
                            {name[idxChar]}
                          </mark>
                        );
                        last = idxChar + 1;
                      }
                      if (last < name.length) parts.push(name.slice(last));
                    }

                    return (
                      <li
                        key={name}
                        role="option"
                        aria-selected={highlighted === idx}
                        className={`rbac-autocomplete-item ${highlighted === idx ? "highlight" : ""}`}
                        onMouseEnter={() => setHighlighted(idx)}
                        onMouseLeave={() => setHighlighted(null)}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelectChange(name);
                        }}
                      >
                        <div>{parts}</div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {!activeTeam && !inputValue && !selectedTeamName && (
            <p className="rbac-empty">
              Digite o nome de um time ou selecione na lista para ver os acessos.
            </p>
          )}

          {!activeTeam && (inputValue || selectedTeamName) && (
            <p className="rbac-empty">
              Nenhum time encontrado com esse nome. Verifique se está igual à planilha.
            </p>
          )}

          {activeTeam && (
            <>
              <div className="rbac-result-header">
                <div>
                  <p className="rbac-result-caption">Time selecionado</p>
                  <h2 className="rbac-result-title">{activeTeam.team}</h2>
                </div>
                <span className="rbac-chip">
                  {activeTeam.accesses.length} acessos mapeados
                </span>
              </div>

              <div className="rbac-access-list">
                {activeTeam.accesses.map((acc, idx) => {
                  const type = getAccessType(acc.classification);

                  const badgeClass =
                    type === "automatic"
                      ? "rbac-access-badge auto"
                      : type === "request"
                      ? "rbac-access-badge req"
                      : "rbac-access-badge other";

                  const badgeLabel =
                    type === "automatic"
                      ? "Acesso automático"
                      : type === "request"
                      ? "Acesso mediante request"
                      : "Outro tipo de controle";

                  return (
                    <div key={idx} className="rbac-access-item">
                      <div className="rbac-access-header">
                        <span className="rbac-access-system">{acc.system}</span>
                        <span className={badgeClass}>{badgeLabel}</span>
                      </div>
                      {acc.classification && (
                        <p className="rbac-access-classification">
                          {acc.classification}
                        </p>
                      )}
                      <div className="rbac-access-details">
                        {acc.profile && (
                          <div className="rbac-access-detail-item">
                            <span className="rbac-detail-label">Perfil:</span>
                            <span className="rbac-detail-value">{acc.profile}</span>
                          </div>
                        )}
                        {acc.role && (
                          <div className="rbac-access-detail-item">
                            <span className="rbac-detail-label">Role:</span>
                            <span className="rbac-detail-value">{acc.role}</span>
                          </div>
                        )}
                        {acc.teams && (
                          <div className="rbac-access-detail-item">
                            <span className="rbac-detail-label">Times:</span>
                            <span className="rbac-detail-value">{acc.teams}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}