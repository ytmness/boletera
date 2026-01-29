#!/bin/bash

# Crear ecosystem.config.js en /var/www/boletera
cat > /var/www/boletera/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'boletera',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/boletera',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/root/.pm2/logs/boletera-error.log',
    out_file: '/root/.pm2/logs/boletera-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};
EOF

echo "✅ ecosystem.config.js creado en /var/www/boletera"

# Iniciar PM2
pm2 start /var/www/boletera/ecosystem.config.js
pm2 save

echo "✅ PM2 iniciado y guardado"

# Ver logs
pm2 logs boletera --lines 30
