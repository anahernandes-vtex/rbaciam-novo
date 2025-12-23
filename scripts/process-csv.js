const fs = require('fs');
const path = require('path');

// Lê o CSV
const csvPath = '/Users/vtex/Downloads/Matriz Unificada - Página1.csv';
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Processa o CSV
const lines = csvContent.split('\n').filter(line => line.trim());
const headers = lines[0].split(',').map(h => h.trim());

// Remove o header
const dataLines = lines.slice(1);

// Agrupa por time
const teamsMap = new Map();

dataLines.forEach(line => {
  // Parse CSV considerando que pode ter vírgulas dentro de campos (mas neste caso parece simples)
  const values = line.split(',').map(v => v.trim());
  
  if (values.length < 6) return; // Linha inválida
  
  const team = values[0];
  const system = values[1];
  const classification = values[2];
  const profile = values[3] || '';
  const role = values[4] || '';
  const teams = values[5] || '';
  
  if (!team || !system) return; // Dados inválidos
  
  if (!teamsMap.has(team)) {
    teamsMap.set(team, []);
  }
  
  teamsMap.get(team).push({
    system,
    classification,
    profile,
    role,
    teams
  });
});

// Converte para array e ordena
const teamsArray = Array.from(teamsMap.entries())
  .map(([team, accesses]) => ({
    team,
    accesses: accesses.sort((a, b) => a.system.localeCompare(b.system, 'pt-BR'))
  }))
  .sort((a, b) => a.team.localeCompare(b.team, 'pt-BR'));

// Salva o JSON
const outputPath = path.join(__dirname, '../data/matrix.json');
fs.writeFileSync(outputPath, JSON.stringify(teamsArray, null, 2), 'utf-8');

console.log(`✅ Processado ${teamsArray.length} times com ${teamsArray.reduce((sum, t) => sum + t.accesses.length, 0)} acessos`);
console.log(`📁 Arquivo salvo em: ${outputPath}`);

