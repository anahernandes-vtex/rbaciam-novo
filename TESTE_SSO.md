# Guia de Teste - Login com SSO do Google

## Configuração Realizada

Foi criado um sistema completo de autenticação com Google OAuth (SSO) no seu projeto Next.js. Aqui está o que foi implementado:

### Arquivos Criados:

1. **`app/api/auth/[...nextauth]/route.ts`** - Rota de autenticação do NextAuth.js
2. **`app/login/page.tsx`** - Página de login com botão Google SSO
3. **`app/providers.tsx`** - Provider de sessão para toda a aplicação
4. **`.env.local`** - Variáveis de ambiente com credenciais Google

### Arquivos Modificados:

1. **`package.json`** - Adicionado `next-auth` como dependência
2. **`app/layout.tsx`** - Envolvido o layout com SessionProvider
3. **`app/page.tsx`** - Adicionado proteção de rota com redirecionamento para login

## Como Testar

### 1. Iniciar o servidor
```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3000`

### 2. Acessar a aplicação
- Abra `http://localhost:3000` no navegador
- Você será redirecionado automaticamente para `/login`

### 3. Fazer login com Google
- Clique no botão "Entrar com Google"
- Será aberta a página de autenticação do Google
- Faça login com sua conta Google
- Você será redirecionado de volta para a página principal

### 4. Ver informações do usuário
- Após o login, você verá seu email no canto superior direito
- Um botão "Sair" permitirá fazer logout

## Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env.local` e preencha com suas credenciais:

```bash
cp .env.example .env.local
```

Depois atualize o arquivo `.env.local` com seus valores:

```
GOOGLE_CLIENT_ID=seu_google_client_id
GOOGLE_CLIENT_SECRET=seu_google_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=uma-chave-aleatoria-segura-com-min-32-caracteres
```

⚠️ **Importante para Produção:**
- Mude `NEXTAUTH_SECRET` para uma chave aleatória segura (mínimo 32 caracteres)
- Atualize `NEXTAUTH_URL` com o URL real da produção
- Certifique-se de que as URLs de callback estão registradas no Google Cloud Console
- **Nunca commite o arquivo `.env.local` no Git**

## Fluxo de Autenticação

```
Usuário não autenticado
        ↓
Tenta acessar / (home)
        ↓
Redireciona para /login (via middleware no código)
        ↓
Clica "Entrar com Google"
        ↓
Google OAuth Flow
        ↓
Callback para /api/auth/callback/google
        ↓
Sessão criada
        ↓
Redireciona para / (home)
        ↓
Usuário autenticado acessa a aplicação
```

## Recursos Disponíveis

- ✅ Autenticação com Google OAuth 2.0
- ✅ Proteção de rotas (redireciona para login se não autenticado)
- ✅ Informações de usuário na sessão
- ✅ Botão de logout
- ✅ Gerenciamento de token de acesso

## Próximos Passos (Opcional)

1. Adicionar mais provedores (GitHub, Microsoft, etc)
2. Implementar banco de dados para armazenar dados de usuários
3. Adicionar roles/permissões baseadas na integração RBAC
4. Configurar JWT customizado
5. Implementar refresh de tokens

Aproveite o seu sistema de autenticação! 🎉
