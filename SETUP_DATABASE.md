# 🗄️ Configuração do Banco de Dados - Vercel Postgres

## Onde fazer upload do CSV?

1. **Faça login** na aplicação (https://seu-projeto.vercel.app)
2. **Clique no botão "Admin"** no canto superior direito
3. Você será levado para a página `/admin`
4. **Selecione seu arquivo CSV** e clique em "Atualizar Matriz de Acessos"

## Configuração do Banco de Dados Vercel Postgres

### Passo 1: Criar Banco de Dados Postgres

1. Na Vercel, vá em **Storage** → **Create Database**
2. Na tela que abrir, procure por **"Neon"** ou **"Postgres"** no Marketplace
3. Clique em **"Neon"** (ou outro provedor Postgres)
4. Clique em **"Add Integration"**
5. Escolha um nome para o banco (ex: `rbac-postgres`)
6. Selecione a região mais próxima
7. Clique em **"Create"**

### Passo 2: Conectar ao Projeto

1. Na página do seu projeto na Vercel
2. Vá em **Settings** → **Storage**
3. Você verá o banco Postgres listado
4. As variáveis de ambiente serão adicionadas automaticamente:
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
   - `POSTGRES_USER`
   - `POSTGRES_HOST`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_DATABASE`

### Passo 3: Configurar Emails de Admin

1. **Settings** → **Environment Variables**
2. Adicione:
   ```
   ADMIN_EMAILS=ana.hernandes@vtex.com
   ```
   (Para múltiplos emails, separe por vírgula)

### Passo 4: Fazer Redeploy

1. Vá em **Deployments**
2. Clique nos **3 pontos** (⋯) do último deploy
3. Clique em **"Redeploy"**

## Como Funciona

### Estrutura do Banco de Dados

O sistema cria automaticamente 3 tabelas:

1. **`teams`** - Armazena os times
   - `id` - ID único
   - `name` - Nome do time
   - `created_at` - Data de criação

2. **`accesses`** - Armazena os acessos de cada time
   - `id` - ID único
   - `team_id` - Referência ao time
   - `system` - Nome do sistema
   - `classification` - Tipo de acesso
   - `profile` - Perfil
   - `role` - Role
   - `teams` - Times associados
   - `created_at` - Data de criação

3. **`last_update`** - Armazena última atualização
   - `id` - Sempre 1 (tabela de linha única)
   - `updated_at` - Timestamp da última atualização

### Fluxo de Atualização

1. Você faz upload do CSV na página `/admin`
2. O sistema processa o CSV
3. Limpa os dados antigos do banco
4. Insere os novos dados
5. Atualiza o timestamp
6. **Pronto!** Os dados estão atualizados imediatamente

### Leitura dos Dados

- A página principal (`/`) busca dados do banco automaticamente
- Se o banco não estiver configurado, usa o arquivo JSON como fallback
- Tudo funciona automaticamente!

## Vantagens do Postgres

✅ **Dados persistentes** - Ficam salvos no banco
✅ **Atualização imediata** - Sem precisar fazer deploy
✅ **Escalável** - Suporta muitos dados
✅ **Relacional** - Estrutura organizada
✅ **Backup automático** - Neon faz backup automático

## Troubleshooting

### Erro: "relation does not exist"
- Normal na primeira vez
- As tabelas são criadas automaticamente no primeiro upload
- Tente fazer upload novamente

### Erro: "Connection refused"
- Verifique se o banco Postgres está conectado ao projeto
- Verifique as variáveis de ambiente na Vercel
- Faça redeploy

### Dados não aparecem
- Verifique se o upload foi bem-sucedido
- Veja os logs na Vercel para erros
- Verifique se o CSV está no formato correto

### Não consigo acessar /admin
- Verifique se seu email está em `ADMIN_EMAILS`
- Faça logout e login novamente
- Verifique se está autenticado

## Formato do CSV

O arquivo CSV deve ter as seguintes colunas:
- `Time`
- `Sistema`
- `Acesso proposto Líder`
- `Perfil`
- `Role`
- `times`

## Pronto!

Agora você pode:
1. Fazer login na aplicação
2. Clicar em "Admin"
3. Fazer upload do CSV
4. Os dados serão salvos no banco Postgres
5. Atualização imediata na aplicação! 🎉
