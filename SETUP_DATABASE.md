# 🗄️ Configuração do Banco de Dados

## ⚠️ Importante: Vercel KV agora está no Marketplace

A Vercel mudou e o KV não está mais disponível diretamente. Você tem duas opções:

## Opção 1: Usar Upstash Redis (Recomendado)

### Passo 1: Criar Upstash Redis

1. Na tela de Storage da Vercel, clique em **"Upstash"** (ou acesse: https://vercel.com/marketplace/upstash)
2. Clique em **"Add Integration"**
3. Escolha **"Redis"**
4. Escolha um nome para o banco
5. Selecione a região
6. Clique em **"Create"**

### Passo 2: Conectar ao Projeto

1. Na página do seu projeto na Vercel
2. Vá em **Settings** → **Storage**
3. Você verá o Upstash Redis listado
4. As variáveis de ambiente serão adicionadas automaticamente:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### Passo 3: Atualizar Código (Opcional)

Se quiser usar Upstash diretamente, podemos ajustar o código. Mas o código atual já funciona com fallback para arquivo JSON!

## Opção 2: Commit Automático no Git (Recomendado se não usar Redis)

A aplicação pode fazer commit automático no Git quando você faz upload!

### Configuração:

1. **Criar Personal Access Token no GitHub:**
   - Acesse: https://github.com/settings/tokens
   - Clique em **"Generate new token"** → **"Generate new token (classic)"**
   - Dê um nome (ex: "rbaciam-auto-update")
   - Selecione escopo: **`repo`** (acesso completo aos repositórios)
   - Clique em **"Generate token"**
   - **Copie o token** (você só verá uma vez!)

2. **Adicionar na Vercel:**
   - Settings → Environment Variables
   - Adicione:
     ```
     GITHUB_TOKEN=seu_token_aqui
     GITHUB_REPO_OWNER=anahernandes-vtex
     GITHUB_REPO_NAME=rbaciam-novo
     ```

3. **Fazer Redeploy**

### Como funciona:

- ✅ Upload de CSV funciona
- ✅ Dados são processados
- ✅ Commit automático no Git
- ✅ Vercel faz deploy automático
- ✅ Mudanças aparecem em alguns minutos!

### Vantagens:

- Não precisa configurar banco de dados
- Atualização automática via Git
- Histórico de mudanças no Git
- Deploy automático pela Vercel

## Opção 3: Usar Vercel Blob (Alternativa)

1. Na tela de Storage, clique em **"Blob"**
2. Crie um Blob Store
3. Podemos ajustar o código para salvar JSON no Blob

## Configuração de Admin

Independente da opção escolhida, configure os emails de admin:

1. **Settings** → **Environment Variables**
2. Adicione:
   ```
   ADMIN_EMAILS=ana.hernandes@vtex.com,outro@email.com
   ```

## Recomendação

**Para começar rápido:** Use a **Opção 2** (arquivo JSON). Já está funcionando!

**Para produção:** Configure **Upstash Redis** (Opção 1) para atualizações em tempo real sem precisar fazer deploy.

## Como Usar (Funciona com qualquer opção)

1. Faça login na aplicação
2. Clique no botão **"Admin"** no canto superior direito
3. Selecione um arquivo CSV
4. Clique em **"Atualizar Matriz de Acessos"**
5. Os dados serão processados e salvos!

### Se usar arquivo JSON:
- Os dados serão salvos no arquivo
- Faça commit e push para atualizar em produção
- Ou aguarde o próximo deploy automático

### Se usar Upstash Redis:
- Os dados serão salvos imediatamente
- Atualização em tempo real, sem precisar de deploy

## Troubleshooting

### "KV is not defined"
- Normal se não configurou Upstash Redis
- A aplicação usa fallback automático para arquivo JSON

### Mudanças não aparecem
- Se usar arquivo JSON: faça commit e push
- Se usar Redis: verifique se as variáveis de ambiente estão configuradas

### Erro ao fazer upload
- Verifique se o CSV está no formato correto
- Verifique se você está logado como admin
- Veja os logs na Vercel para mais detalhes
