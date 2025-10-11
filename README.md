# PDS — App de Gestão para Banho & Tosa

Uma aplicação simples para gestão de agendamentos, clientes, pets e finanças de petshops.

Resumo rápido
- Frontend: React + Vite (landing + painel administrativo)
- Backend: Node.js + Express, MySQL
- Objetivo: cadastro de pets, agenda de serviços, controle financeiro e gestão de usuários/petshops

---

## Funcionalidades principais
- Cadastro e gerenciamento de clientes e pets
- Agendamentos (vários tipos de pacotes)
- Gestão de usuários com roles (user, admin, support)
- CRUD de petshops (businesses)
- Relatórios e páginas administrativas (admin dashboard)

---

## Tecnologias
- Frontend: React, Vite, TypeScript
- Backend: Node.js, Express
- Banco de dados: MySQL
- Process manager (produção): PM2

---

## Quickstart (desenvolvimento)

Pré-requisitos
- Node.js + npm
- MySQL (rodando localmente ou remoto)

1) Clonar o repositório

```bash
git clone https://github.com/adenilsonandrade/pds.git
cd pds
```

2) Backend — instalar e rodar em modo desenvolvimento

```bash
cd backend
npm install
npm run dev   # inicia o servidor (por padrão porta 3001)
```

3) Frontend — instalar e rodar em modo desenvolvimento

```bash
cd frontend
npm install
npm run dev   # inicia o Vite dev server
```

4) Build do frontend (produção)

```bash
cd frontend
npm install
npm run build
```

---

## Banco de dados / migrações
Existem scripts simples em `backend/scripts` para criar as tabelas principais:

```bash
cd backend
node scripts/create_users_table.js
node scripts/create_refresh_tokens_table.js
```

Ou execute os arquivos SQL em `backend/db/` usando seu cliente MySQL.

---

## Variáveis de ambiente relevantes
- `PORT` — porta do backend (padrão 3001)
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` — configuração do MySQL
- `JWT_SECRET`, `JWT_EXPIRES_IN`, `REFRESH_TOKEN_EXPIRES_DAYS` — autenticação JWT

Configure essas variáveis no seu ambiente ou em um `.env` conforme seu fluxo de deploy.

---

## Executar em produção (PM2)
Se desejar rodar com PM2, há um arquivo `ecosystem.config.js` no diretório `backend`.

Exemplo de uso (num servidor com PM2 instalado):

```bash
cd backend
pm2 start ecosystem.config.js
pm2 status
```

> Atenção: o `ecosystem.config.js` original usa caminhos absolutos (ex.: `/var/www/pds/backend`). Ajuste para o seu ambiente local se necessário.

---

## Testes rápidos / endpoints úteis

Exemplo de login (POST):

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"senhaSegura"}'
```

Endpoints de criação de tabelas (mencionados acima) e endpoints protegidos estão documentados no código e no backup `backend/backups/AUTH_README.md`.

---

## Licenças e atribuições
O frontend utiliza componentes de `shadcn/ui` (MIT) e imagens do Unsplash. Consulte `frontend/backups/Attributions.md` para detalhes sobre attributions usadas.

---

## Backups dos READMEs originais
Arquivei os READMEs e arquivos de atribuições originais em:

- `backend/backups/AUTH_README.md`
- `frontend/backups/README.md`
- `frontend/backups/Attributions.md`
- `frontend/backups/Guidelines.md`

---

## Contato
Autor: Adenilson Andrade — https://github.com/adenilsonandrade

