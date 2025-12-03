# Configuração para Vercel - Variáveis de Ambiente

## Passo a Passo para Configurar na Vercel

1. **Acesse seu projeto na Vercel**
   - Vá para: https://vercel.com/dashboard

2. **Navegue para Settings**
   - Clique no seu projeto
   - Vá para "Settings" → "Environment Variables"

3. **Adicione as seguintes variáveis:**

### Variáveis Necessárias:

```
GOOGLE_CLIENT_ID = [seu_google_client_id_aqui]
GOOGLE_CLIENT_SECRET = [seu_google_client_secret_aqui]
NEXTAUTH_URL = https://seu-dominio-vercel.com
NEXTAUTH_SECRET = [chave_segura_gerada_abaixo]
```

### Como Gerar uma Chave Segura para NEXTAUTH_SECRET:

Execute este comando no terminal:

```bash
openssl rand -base64 32
```

Copie a saída e use como valor para `NEXTAUTH_SECRET`.

### Exemplo de valores:

| Variável | Valor |
|----------|-------|
| GOOGLE_CLIENT_ID | `[seu_google_client_id]` |
| GOOGLE_CLIENT_SECRET | `[seu_google_client_secret]` |
| NEXTAUTH_URL | `https://rbaciam-novo.vercel.app/` (ou seu domínio) |
| NEXTAUTH_SECRET | `[resultado do comando openssl acima]` |

### Atualizar Google OAuth Redirect URI

Você também precisa adicionar a URL da Vercel ao Google Cloud Console:

1. Vá para: https://console.cloud.google.com/
2. Projeto: `rbac-480114`
3. APIs & Services → Credentials
4. Clique na credencial OAuth 2.0
5. Em "Authorized redirect URIs", adicione:
   ```
   https://rbaciam-novo.vercel.app/api/auth/callback/google
   ```
6. Salve

### Selecionar Ambientes

Na Vercel, certifique-se de que as variáveis estão disponíveis em:
- ✅ Production
- ✅ Preview
- ✅ Development

### Deploy

Depois de configurar as variáveis:
1. Vá para "Deployments"
2. Clique nos 3 pontos do último deploy
3. Clique "Redeploy"

Pronto! Sua aplicação estará pronta com SSO no Google em produção! 🚀
