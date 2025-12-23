# 🗄️ Configuração do Banco de Dados - Vercel KV

## O que foi implementado

Criamos um sistema de administração que permite atualizar a matriz de acessos diretamente na aplicação, sem precisar atualizar planilhas manualmente.

### Funcionalidades

1. **Página de Admin** (`/admin`)
   - Upload de arquivo CSV
   - Processamento automático
   - Armazenamento no Vercel KV (Redis)

2. **API Routes**
   - `/api/admin/upload` - Processa e salva CSV
   - `/api/admin/last-update` - Retorna última atualização
   - `/api/matrix` - Retorna dados (KV ou fallback para JSON)

3. **Integração**
   - Página principal lê dados da API automaticamente
   - Fallback para JSON estático se KV não estiver configurado

## Configuração na Vercel

### Passo 1: Criar Vercel KV Database

1. Acesse: https://vercel.com/dashboard
2. Vá em **Storage** → **Create Database**
3. Selecione **KV** (Redis)
4. Escolha um nome (ex: `rbac-kv`)
5. Selecione a região mais próxima
6. Clique em **Create**

### Passo 2: Conectar ao Projeto

1. Na página do seu projeto na Vercel
2. Vá em **Settings** → **Storage**
3. Clique em **Connect** no banco KV criado
4. Isso adicionará automaticamente as variáveis de ambiente:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN`

### Passo 3: Configurar Emails de Admin

1. Vá em **Settings** → **Environment Variables**
2. Adicione a variável:
   ```
   ADMIN_EMAILS=ana.hernandes@vtex.com,outro@email.com
   ```
   (Separe múltiplos emails por vírgula)

3. Para usar na interface também, adicione:
   ```
   NEXT_PUBLIC_ADMIN_EMAILS=ana.hernandes@vtex.com,outro@email.com
   ```

### Passo 4: Fazer Redeploy

1. Vá em **Deployments**
2. Clique nos **3 pontos** (⋯) do último deploy
3. Clique em **"Redeploy"**

## Como Usar

### Para Administradores

1. Faça login na aplicação
2. Clique no botão **"Admin"** no canto superior direito
3. Na página de admin:
   - Selecione um arquivo CSV
   - Clique em **"Atualizar Matriz de Acessos"**
   - Aguarde o processamento
   - Os dados serão atualizados imediatamente!

### Formato do CSV

O arquivo CSV deve ter as seguintes colunas:
- `Time`
- `Sistema`
- `Acesso proposto Líder`
- `Perfil`
- `Role`
- `times`

## Estrutura de Dados

Os dados são armazenados no Vercel KV com as seguintes chaves:

- `rbac:matrix` - Array JSON com todos os times e acessos
- `rbac:last-update` - Timestamp da última atualização

## Fallback

Se o Vercel KV não estiver configurado, a aplicação usa automaticamente o arquivo `data/matrix.json` como fallback. Isso garante que a aplicação continue funcionando mesmo sem o banco de dados.

## Segurança

- Apenas emails listados em `ADMIN_EMAILS` podem acessar `/admin`
- Todas as rotas de admin verificam autenticação
- Upload de arquivo é validado antes do processamento

## Troubleshooting

### Erro: "KV is not defined"
- Verifique se o Vercel KV está conectado ao projeto
- Verifique se as variáveis de ambiente estão configuradas

### Erro: "Acesso negado"
- Verifique se seu email está em `ADMIN_EMAILS`
- Faça logout e login novamente

### Dados não atualizam
- Verifique se o CSV está no formato correto
- Verifique os logs na Vercel para erros

## Próximos Passos (Opcional)

- [ ] Adicionar histórico de alterações
- [ ] Permitir edição individual de acessos
- [ ] Exportar dados para CSV
- [ ] Migrar para Vercel Postgres para dados mais complexos

