"use client";

import { useMemo, useState } from "react";
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
  const [query, setQuery] = useState("");
  const [selectedTeamName, setSelectedTeamName] = useState("");

  // Lista de times ordenada para o dropdown
  const teamNames = useMemo(
    () => teams.map((t) => t.team).sort((a, b) => a.localeCompare(b, "pt-BR")),
    []
  );

  // Time escolhido (via digitação ou dropdown)
  const activeTeam = useMemo(() => {
    const name = (selectedTeamName || query).trim();
    if (!name) return null;
    return teams.find((t) => t.team.toLowerCase() === name.toLowerCase()) ?? null;
  }, [query, selectedTeamName]);

  function handleSelectChange(value: string) {
    setSelectedTeamName(value);
    if (value) {
      setQuery(value);
    }
  }

  return (
    <main>
      <div className="rbac-wrapper">
        <div className="rbac-card">
          <div style={{ textAlign: "center", marginBottom: 4 }}>
            <span className="rbac-badge">RBAC · IAM</span>
          </div>
          <h1 className="rbac-title">Consulta de Acessos por Time</h1>
          <p className="rbac-subtitle">
            Selecione um time na lista ou digite o nome exatamente como está na matriz
            para ver os sistemas e o tipo de acesso (automático ou mediante request).
          </p>

          <div className="rbac-search-row">
            <div className="rbac-search-group">
              <label className="rbac-label">Nome do time (texto)</label>
              <input
                className="rbac-input"
                placeholder="Ex.: Ad Network, Engineering - cloud-insights-fo..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedTeamName("");
                }}
              />
              <span className="rbac-help">
                A busca é exata pelo nome do time, igual na planilha.
              </span>
            </div>

            <div className="rbac-search-group">
              <label className="rbac-label">Ou escolha na lista</label>
              <select
                className="rbac-select"
                value={selectedTeamName}
                onChange={(e) => handleSelectChange(e.target.value)}
              >
                <option value="">Selecione um time...</option>
                {teamNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <span className="rbac-help">
                Esta lista vem diretamente da matriz RBAC.
              </span>
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