#!/bin/bash
# ═══════════════════════════════════════════════════
# O Discípulo - Quick Update (re-deploy after git push)
# Run as root on the VPS
# ═══════════════════════════════════════════════════

set -e

APP_DIR="/var/www/disciplegame"
BACKUP_DIR="/var/www/disciplegame-backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "🔄 Atualizando O Discípulo..."

# ── BACKUP: protect user data before deploy ──
echo "📦 Backing up user data..."
mkdir -p "$BACKUP_DIR/$TIMESTAMP"

# Backup admin data (settings, cities, images references)
if [ -f "$APP_DIR/data/admin-data.json" ]; then
    cp "$APP_DIR/data/admin-data.json" "$BACKUP_DIR/$TIMESTAMP/admin-data.json"
    echo "   ✓ admin-data.json backed up"
fi

# Backup uploaded/generated images
if [ -d "$APP_DIR/public/uploads" ]; then
    cp -r "$APP_DIR/public/uploads" "$BACKUP_DIR/$TIMESTAMP/uploads"
    echo "   ✓ uploads/ backed up"
fi

# Backup .env.local
if [ -f "$APP_DIR/.env.local" ]; then
    cp "$APP_DIR/.env.local" "$BACKUP_DIR/$TIMESTAMP/.env.local"
    echo "   ✓ .env.local backed up"
fi

# Keep only last 10 backups
ls -dt "$BACKUP_DIR"/*/ 2>/dev/null | tail -n +11 | xargs rm -rf 2>/dev/null || true

# ── DEPLOY ──
cd $APP_DIR
git pull origin main
npm ci --production=false

# ── RESTORE: ensure user data survives ──
echo "🔒 Restoring user data..."

# Restore admin data if git pull overwrote it
if [ -f "$BACKUP_DIR/$TIMESTAMP/admin-data.json" ]; then
    mkdir -p "$APP_DIR/data"
    cp "$BACKUP_DIR/$TIMESTAMP/admin-data.json" "$APP_DIR/data/admin-data.json"
    echo "   ✓ admin-data.json restored"
fi

# Restore uploaded images
if [ -d "$BACKUP_DIR/$TIMESTAMP/uploads" ]; then
    cp -r "$BACKUP_DIR/$TIMESTAMP/uploads" "$APP_DIR/public/uploads"
    echo "   ✓ uploads/ restored"
fi

npm run build
pm2 restart disciplegame

echo "✅ Atualizado! App reiniciado."
echo "   📦 Backup salvo em: $BACKUP_DIR/$TIMESTAMP"
echo "   pm2 logs disciplegame  — ver logs"
