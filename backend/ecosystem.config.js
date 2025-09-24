module.exports = {
  apps: [{
    name: "api-augendapet",
    script: "/var/www/pds/backend/src/server.js", // <-- Caminho absoluto para o script
    cwd: "/var/www/pds/backend",
    interpreter: "/home/ubuntu/.nvm/versions/node/v22.19.0/bin/node",
    watch: true,
    ignore_watch: [
      "node_modules",
      "package-lock.json"
    ]
  }]
}
