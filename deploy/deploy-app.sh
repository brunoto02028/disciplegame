#!/bin/bash
# ═══════════════════════════════════════════════════
# O Discípulo - Deploy App Script
# Run as root on the VPS after setup-vps.sh
# ═══════════════════════════════════════════════════

set -e

APP_DIR="/var/www/disciplegame"
REPO="https://github.com/brunoto02028/disciplegame.git"

echo "═══════════════════════════════════════════"
echo "  O Discípulo - Deploy"
echo "═══════════════════════════════════════════"

# ── 1. Clone or pull repo ──
echo ""
echo "📥 [1/5] Baixando código..."
if [ -d "$APP_DIR/.git" ]; then
    cd $APP_DIR
    git pull origin main
else
    cd /var/www
    rm -rf disciplegame
    git clone $REPO disciplegame
    cd $APP_DIR
fi

# ── 2. Install dependencies ──
echo ""
echo "📦 [2/5] Instalando dependências..."
npm ci --production=false

# ── 3. Check .env.local ──
echo ""
if [ ! -f "$APP_DIR/.env.local" ]; then
    echo "⚠️  Criando .env.local — EDITE com suas chaves!"
    cat > $APP_DIR/.env.local << 'EOF'
# Gemini AI (obrigatório para geração de imagens/conteúdo)
GEMINI_API_KEY=SUA_CHAVE_AQUI

# Admin password
ADMIN_PASSWORD=admin2026

# Node environment
NODE_ENV=production
EOF
    echo "   ➜ Edite: nano $APP_DIR/.env.local"
    echo ""
    read -p "Pressione ENTER após editar o .env.local..."
fi

# ── 4. Build ──
echo ""
echo "🔨 [3/5] Building Next.js..."
npm run build

# ── 5. Start with PM2 ──
echo ""
echo "🚀 [4/5] Iniciando com PM2..."
pm2 delete disciplegame 2>/dev/null || true
pm2 start npm --name "disciplegame" -- start -- -p 3000
pm2 save

# ── 6. Configure Nginx ──
echo ""
echo "🌐 [5/5] Configurando Nginx..."
cat > /etc/nginx/sites-available/disciplegame << 'NGINX'
server {
    listen 80;
    server_name disciplegame.com www.disciplegame.com;

    # Max upload size (for image uploads)
    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 120s;
    }

    # Static files (uploaded/generated images)
    location /uploads/ {
        alias /var/www/disciplegame/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
NGINX

# Enable site
ln -sf /etc/nginx/sites-available/disciplegame /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and reload
nginx -t
systemctl reload nginx

echo ""
echo "═══════════════════════════════════════════"
echo "  ✅ Deploy concluído!"
echo "═══════════════════════════════════════════"
echo ""
echo "  App rodando em: http://disciplegame.com"
echo ""
echo "  Próximo passo: SSL (HTTPS)"
echo "  Execute: certbot --nginx -d disciplegame.com -d www.disciplegame.com"
echo ""
echo "  Comandos úteis:"
echo "    pm2 logs disciplegame     — ver logs"
echo "    pm2 restart disciplegame  — reiniciar app"
echo "    pm2 monit                 — monitorar CPU/RAM"
echo ""
