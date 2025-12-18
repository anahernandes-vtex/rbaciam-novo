"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import data from "../data/matrix.json";

type Access = {
  system: string;
  classification: string;
};

type Team = {
  team: string;
  accesses: Access[];
};

const teams: Team[] = data as Team[];

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
  const filteredTeamNames = useMemo(() => {
    const q = inputValue.trim().toLowerCase();
    if (!q) return teamNames;
    return teamNames.filter((t) => t.toLowerCase().includes(q));
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
        handleSelectChange(filteredTeamNames[highlighted]);
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
            Selecione um time na lista ou digite o nome exatamente como está na matriz
            para ver os sistemas e o tipo de acesso (automático ou mediante request).
          </p>

          <div className="rbac-search-row">
            <div className="rbac-search-group" ref={containerRef}>
              <label className="rbac-label">Pesquisar time</label>
              <input
                className="rbac-input"
                placeholder="Digite para buscar e selecione um time..."
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
              />
              <span className="rbac-help">
                Digite parte do nome do time para filtrar e escolha na lista.
              </span>

              {isOpen && filteredTeamNames.length > 0 && (
                <ul className="rbac-autocomplete-list" role="listbox">
                  {filteredTeamNames.map((name, idx) => (
                    <li
                      key={name}
                      role="option"
                      aria-selected={highlighted === idx}
                      className={`rbac-autocomplete-item ${highlighted === idx ? 'highlight' : ''}`}
                      onMouseEnter={() => setHighlighted(idx)}
                      onMouseLeave={() => setHighlighted(null)}
                      onMouseDown={(e) => {
                        // onMouseDown to select before blur
                        e.preventDefault();
                        handleSelectChange(name);
                      }}
                    >
                      {name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {!activeTeam && !query && !selectedTeamName && (
            <p className="rbac-empty">
              Digite o nome de um time ou selecione na lista para ver os acessos.
            </p>
          )}

          {!activeTeam && (query || selectedTeamName) && (
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