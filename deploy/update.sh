#!/bin/bash
# ═══════════════════════════════════════════════════
# O Discípulo - Quick Update (re-deploy after git push)
# Run as root on the VPS
# ═══════════════════════════════════════════════════

set -e

APP_DIR="/var/www/disciplegame"

echo "🔄 Atualizando O Discípulo..."

cd $APP_DIR
git pull origin main
npm ci --production=false
npm run build
pm2 restart disciplegame

echo "✅ Atualizado! App reiniciado."
echo "   pm2 logs disciplegame  — ver logs"
