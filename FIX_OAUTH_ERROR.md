# 🔧 Correção do Erro OAuth - redirect_uri_mismatch

## Problema
Erro 400: `redirect_uri_mismatch` ao tentar fazer login em produção.

## Solução

### Passo 1: Descobrir a URL de Produção na Vercel

1. Acesse: https://vercel.com/dashboard
2. Clique no projeto `rbaciam-novo` (ou o nome do seu projeto)
3. Na página do projeto, você verá a URL de produção, algo como:
   - `https://rbaciam-novo.vercel.app` ou
   - `https://rbaciam-novo-xxx.vercel.app`

### Passo 2: Adicionar a URI de Redirecionamento no Google Cloud Console

1. Acesse: https://console.cloud.google.com/
2. Selecione o projeto: `rbac-480114`
3. Vá em **APIs & Services** → **Credentials**
4. Clique na credencial OAuth 2.0 Client ID
5. Em **"Authorized redirect URIs"**, adicione:
   ```
   https://SUA-URL-VERCEL.vercel.app/api/auth/callback/google
   ```
   
   **Exemplo:**
   ```
   https://rbaciam-novo.vercel.app/api/auth/callback/google
   ```

6. Clique em **"SAVE"** (Salvar)

### Passo 3: Verificar Variáveis de Ambiente na Vercel

1. Na Vercel, vá em **Settings** → **Environment Variables**
2. Verifique se `NEXTAUTH_URL` está configurado com a URL de produção:
   ```
   NEXTAUTH_URL=https://SUA-URL-VERCEL.vercel.app
   ```
   
   **Importante:** 
   - ✅ Deve começar com `https://`
   - ✅ Não deve terminar com `/` (barra)
   - ✅ Deve ser exatamente a URL do seu projeto na Vercel

3. Verifique também se as outras variáveis estão configuradas:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NEXTAUTH_SECRET`

### Passo 4: Fazer Redeploy

1. Na Vercel, vá em **Deployments**
2. Clique nos **3 pontos** (⋯) do último deploy
3. Clique em **"Redeploy"**
4. Aguarde o deploy finalizar

### Passo 5: Testar Novamente

1. Acesse a URL de produção
2. Tente fazer login novamente
3. O erro deve estar resolvido! ✅

## ⚠️ Importante

- As mudanças no Google Cloud Console podem levar alguns minutos para propagar
- Se ainda não funcionar após 5-10 minutos, verifique:
  - Se a URL está exatamente igual (sem espaços, com https://)
  - Se salvou as alterações no Google Cloud Console
  - Se fez o redeploy na Vercel

## 📝 Checklist Rápido

- [ ] URL de produção identificada na Vercel
- [ ] URI de callback adicionada no Google Cloud Console
- [ ] `NEXTAUTH_URL` configurado corretamente na Vercel
- [ ] Redeploy feito na Vercel
- [ ] Teste de login realizado

