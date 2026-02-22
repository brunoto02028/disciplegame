#!/bin/bash
# ═══════════════════════════════════════════════════
# O Discípulo - VPS Setup Script
# Run as root on a fresh Ubuntu VPS
# ═══════════════════════════════════════════════════

set -e

echo "═══════════════════════════════════════════"
echo "  O Discípulo - VPS Setup"
echo "═══════════════════════════════════════════"

# ── 1. System Update ──
echo ""
echo "📦 [1/6] Atualizando sistema..."
apt update && apt upgrade -y

# ── 2. Install Node.js 20 LTS ──
echo ""
echo "📦 [2/6] Instalando Node.js 20..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
fi
echo "  Node: $(node -v)"
echo "  NPM: $(npm -v)"

# ── 3. Install PM2 ──
echo ""
echo "📦 [3/6] Instalando PM2..."
npm install -g pm2
pm2 startup systemd -u root --hp /root

# ── 4. Install Nginx ──
echo ""
echo "📦 [4/6] Instalando Nginx..."
apt install -y nginx
systemctl enable nginx
systemctl start nginx

# ── 5. Install Certbot (SSL) ──
echo ""
echo "📦 [5/6] Instalando Certbot..."
apt install -y certbot python3-certbot-nginx

# ── 6. Create app directory ──
echo ""
echo "📦 [6/6] Preparando diretório do app..."
mkdir -p /var/www/disciplegame
mkdir -p /var/www/disciplegame/public/uploads/generated

# ── 7. Firewall ──
echo ""
echo "🔒 Configurando firewall..."
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable

echo ""
echo "═══════════════════════════════════════════"
echo "  ✅ Setup concluído!"
echo "═══════════════════════════════════════════"
echo ""
echo "Próximo passo: execute deploy-app.sh"
echo ""
