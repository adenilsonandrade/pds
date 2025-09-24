Deploy (Produção)
=================

Passos para preparar e rodar a aplicação em produção (backend + frontend servidos pelo backend):

1. Preparar variáveis de ambiente

- `PORT` (opcional): porta em que o backend irá rodar. Default: `3001`.
- `NODE_ENV`: `production`.
- (opcional) `VITE_API_URL`: se você precisar que o frontend faça chamadas para uma URL diferente, defina antes do build (você deve definir esta variável no ambiente de build, pois Vite embute o valor no build).

2. No servidor, instalar dependências e buildar tudo (o `postinstall` do backend já roda o build do frontend):

```bash
cd /var/www/pds/backend
npm install
```
Deploy (Produção)
=================

Resumo rápido
------------

Este documento descreve como preparar, buildar e publicar a aplicação (backend + frontend). A configuração padrão do projeto faz com que o backend sirva os arquivos estáticos gerados pelo frontend em `frontend/dist` e exponha as APIs em `/api/*`.

Requisitos
----------

- Node.js (versão compatível com `package.json`) e `npm`
- `mysql` / MariaDB disponível ao backend
- Acesso SSH ao servidor e privilégios para reiniciar serviços (`nginx`, `pm2` ou `systemd`)

Variáveis de ambiente importantes
--------------------------------

- `PORT` : porta do backend (padrão: `3001`)
- `NODE_ENV` : `production`
- `VITE_API_URL` : URL que o frontend deve chamar. IMPORTANTE: Vite embute esse valor durante o build. Para usar mesmo host/origem, deixe vazio ao buildar (ex.: `export VITE_API_URL=''`).

Variáveis de conexão do banco

- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`

Build e deploy
--------------

Opção automática (usa `postinstall` do backend que builda o frontend):

```bash
cd /var/www/pds/backend
npm install --production
```

Opção manual (recomendada quando quiser controlar o `VITE_API_URL`):

```bash
# Build do frontend (no servidor de build)
cd /var/www/pds/frontend
# para chamadas same-origin (recomendado):
export VITE_API_URL=""
npm ci
npm run build

# Em seguida copie/garanta que `frontend/dist` esteja disponível em /var/www/pds/frontend/dist

# Instalar e iniciar backend
cd /var/www/pds/backend
export PORT=3001
export NODE_ENV=production
npm ci --production
npm start
```

Servir os arquivos estáticos
---------------------------

Opção A — backend serve `frontend/dist` (config padrão do projeto):

- Confirme em `backend/src/server.js` que há algo como `app.use(express.static(path.join(__dirname, '../../frontend/dist')))` e uma rota fallback para `index.html` para SPA.

Opção B — Nginx serve os assets e proxy para o backend (mais eficiente em produção):

Exemplo mínimo de bloco Nginx (substitua `example.com`):

```nginx
server {
  listen 80;
  server_name example.com;

  root /var/www/pds/frontend/dist;
  index index.html;

  location /api/ {
    proxy_pass http://127.0.0.1:3001/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

PM2 / Process manager
---------------------

Exemplo simples com `pm2` (no diretório `backend`):

```bash
# iniciar com pm2 usando npm start
cd /var/www/pds/backend
pm2 start npm --name pds-backend -- start

# ou usar um ecosystem.config.js
pm2 start ecosystem.config.js
pm2 save
```

Comandos úteis de gerenciamento
------------------------------

- Reiniciar Nginx:

```bash
sudo systemctl restart nginx
```

- Reiniciar app (pm2):

```bash
pm2 restart pds-backend
```

- Forçar novo build do frontend:

```bash
cd /var/www/pds/frontend
export VITE_API_URL=""
npm ci
npm run build
```

Verificações pós-deploy
-----------------------

- Verificar que o bundle público foi atualizado (opção local vs remoto):

```bash
# checksum local
sha256sum frontend/dist/assets/index-*.js

# checksum remoto (substitua sua URL)
curl -sS https://example.com/assets/index-*.js -o /tmp/remote_index.js
sha256sum /tmp/remote_index.js
```

- Testar API diretamente no servidor:

```bash
curl -sS http://127.0.0.1:3001/api/business/info
```

- Testes no navegador (se cliente alega ver bundle antigo):

1. Abrir DevTools → Network, marcar "Disable cache" e dar hard refresh (Ctrl+Shift+R).
2. Na aba Network filtrar por `index-` ou `main` e inspecionar o `Request URL` do bundle carregado.
3. Procurar nas Requests por chamadas a `/api/` e confirmar que o domínio/origem está correto (não `http://localhost:3001` no cliente remoto).
4. Se houver `Service Worker`: Application → Service Workers → Unregister.
5. Application → Clear Storage → Clear site data e recarregar.

Problemas comuns e soluções
--------------------------

- Build embutiu `VITE_API_URL` com `http://localhost:3001` → re-build com `VITE_API_URL=''` ou exporte a URL correta durante o build.
- Cache de proxy/CDN → purgue o cache ou verifique headers `cache-control` e `etag`.
- Service worker no cliente → desregistrar e limpar storage.
- CORS quando frontend/backend em hosts separados → ajuste `CORS` no backend (`npm package cors`) e defina `VITE_API_URL` para a URL da API.

Checklist rápido antes de considerar o deploy completo
----------------------------------------------------

- [ ] `frontend/dist` contém os assets recentes (`sha256` verificado)
- [ ] Backend rodando (pm2 ou systemd) e logando sem erros
- [ ] Nginx (se usado) está configurado para servir `frontend/dist` e proxar `/api/` para o backend
- [ ] Clientes fizeram hard refresh / desregistraram service worker

Rollback
--------

Mantenha cópias do último build estável em um diretório com timestamp. Para reverter, substitua os arquivos em `frontend/dist` pelo build anterior e recarregue Nginx / reinicie o backend.

Notas finais
-----------

Se quiser, eu posso:

- Gerar um `ecosystem.config.js` para `pm2` ou um `systemd` unit file.

Migrations de Banco de Dados
---------------------------

As alterações de esquema devem ser aplicadas com cuidado. Veja o diretório `migrations/` que contém um exemplo:

- `migrations/001-add-handle-to-businesses.sql` — adiciona a coluna `handle` em `businesses`, tenta popular valores e aplica um índice único.

Passos recomendados:

1. Fazer backup do banco (`mysqldump ...`).
2. Revisar o SQL em `migrations/001-add-handle-to-businesses.sql` e ajustar se necessário.
3. Testar em staging e aplicar no prod com:

```bash
mysql -u DB_USER -p DB_NAME < migrations/001-add-handle-to-businesses.sql
```

Considere resolver colisões de `handle` antes de aplicar o índice único.
- Rodar o build do frontend no servidor com `VITE_API_URL` vazio e validar checksums.
- Reiniciar `nginx` / `pm2` para ativar o novo build (preciso de confirmação).

```
