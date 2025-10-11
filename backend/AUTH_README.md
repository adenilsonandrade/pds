Instruções rápidas para testar o endpoint de autenticação localmente

1) Instalar dependências e iniciar o servidor backend

Se você usa npm (na pasta `backend`):

```bash
npm install
npm run dev
```

O servidor por padrão escuta `http://localhost:3001` (ver `PORT`).

2) Testar o endpoint de login (curl)

- Com um usuário existente na tabela `users` (se houver):

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seu@email.com","password":"suaSenha"}'
```

- Se não existir tabela `users`, o servidor responde com um token demo para facilitar o desenvolvimento frontend.

Resposta esperada (200):

{
  Instruções rápidas para autenticação (registro, login, token)

  1) Instalar dependências e iniciar o servidor backend

  Na pasta `backend` execute:

  ```bash
  npm install
  npm run dev
  ```

  O servidor por padrão escuta `http://localhost:3001` (veja `PORT`).

  2) Criar a tabela `users`

  Há um script de migração que usa a mesma configuração do projeto para criar a tabela `users`:

  ```bash
  node scripts/create_users_table.js
  ```

  Alternativamente, você pode executar o SQL em `backend/db/create_users_table.sql` com seu cliente MySQL.

  Instruções rápidas para autenticação (registro, login, refresh, logout)

  1) Instalar dependências e iniciar o servidor backend

  Na pasta `backend` execute:

  ```bash
  npm install
  npm run dev
  ```

  O servidor por padrão escuta `http://localhost:3001` (veja `PORT`).

  2) Criar as tabelas (users e refresh_tokens)

  Use os scripts Node abaixo para criar as tabelas com a mesma configuração do projeto:

  ```bash
  node scripts/create_users_table.js
  node scripts/create_refresh_tokens_table.js
  ```

  3) Registrar um usuário (exemplo curl)

  ```bash
  curl -X POST http://localhost:3001/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@example.com","password":"senhaSegura","name":"Admin"}'
  ```

  Resposta esperada (201):

  {
    "token": "<JWT>",
    "refreshToken": "<REFRESH_TOKEN>",
    "user": { "id": 1, "email": "admin@example.com", "name": "Admin" }
  }

  4) Login (exemplo curl)

  ```bash
  curl -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@example.com","password":"senhaSegura"}'
  ```

  Resposta esperada (200):

  {
    "token": "<JWT>",
    "refreshToken": "<REFRESH_TOKEN>",
    "user": { "id": 1, "email": "admin@example.com", "name": "Admin" }
  }

  5) Trocar refresh token por novo access token

  ```bash
  curl -X POST http://localhost:3001/api/auth/refresh \
    -H "Content-Type: application/json" \
    -d '{"refreshToken":"<REFRESH_TOKEN>"}'
  ```

  Resposta esperada (200):

  {
    "token": "<NEW_JWT>",
    "refreshToken": "<NEW_REFRESH_TOKEN>"
  }

  6) Logout (revoga refresh token)

  ```bash
  curl -X POST http://localhost:3001/api/auth/logout \
    -H "Content-Type: application/json" \
    -d '{"refreshToken":"<REFRESH_TOKEN>"}'
  ```

  Resposta esperada (200):

  { "message": "Logout realizado" }

  7) Usar token em rota protegida `/api/auth/me`

  ```bash
  curl http://localhost:3001/api/auth/me -H "Authorization: Bearer <TOKEN_AQUI>"
  ```

  8) Variáveis de ambiente úteis

  - `JWT_SECRET`: segredo para assinar tokens (defina em produção)
  - `JWT_EXPIRES_IN`: duração do token (ex: `2h`)
  - `REFRESH_TOKEN_EXPIRES_DAYS`: validade do refresh token (padrão 30 dias)

  Observações de segurança

  O fluxo implementado usa bcrypt para hashear senhas, JWT para access tokens, e refresh tokens armazenados no banco para rotação/revogação. Em produção você deve:

  - Usar um segredo forte e armazená-lo em variáveis seguras
  - Forçar HTTPS
  - Implementar proteção contra brute-force (rate limiting)
  - Remover/invalidar refresh tokens antigos de forma proativa

  Se quiser, eu posso integrar o logout/refresh no frontend e adicionar refresh automático quando o access token expirar.
