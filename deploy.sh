#!/usr/bin/env bash
#
# Déploiement automatisé — Cheikh Tidiane Apple (VPS tout-en-un)
# Met à jour le code, build le frontend, le copie dans backend/public,
# puis (re)démarre le backend via PM2.
#
# Usage :
#   ./deploy.sh              # git pull + build + restart
#   PULL=0 ./deploy.sh       # sans git pull (déploie l'état local)
#   FRONTEND_DIR=/chemin ./deploy.sh
#
set -euo pipefail

# --- Configuration (surchargeable par variables d'environnement) ---
BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="${FRONTEND_DIR:-$BACKEND_DIR/../cheikh_tidiane_apple_frontend}"
PUBLIC_DIR="$BACKEND_DIR/public"
PM2_NAME="${PM2_NAME:-cta-api}"
PULL="${PULL:-1}"   # 1 = git pull, 0 = ne pas pull

log() { printf "\n\033[1;34m▶ %s\033[0m\n" "$1"; }

# --- Vérifs de base ---
if [ ! -d "$FRONTEND_DIR" ]; then
  echo "❌ Dossier frontend introuvable : $FRONTEND_DIR" >&2
  echo "   Renseigne FRONTEND_DIR=/chemin/vers/le/frontend ./deploy.sh" >&2
  exit 1
fi

# --- Backend : code + dépendances ---
log "Backend : mise à jour du code"
cd "$BACKEND_DIR"
[ "$PULL" = "1" ] && git pull --ff-only || true
npm install --omit=dev

# --- Frontend : code + build ---
log "Frontend : build de production"
cd "$FRONTEND_DIR"
[ "$PULL" = "1" ] && git pull --ff-only || true
npm install
npm run build

# --- Copie du build dans backend/public ---
log "Copie du build → $PUBLIC_DIR"
mkdir -p "$PUBLIC_DIR"
rm -rf "${PUBLIC_DIR:?}/"*
cp -r "$FRONTEND_DIR/dist/"* "$PUBLIC_DIR/"

# --- (Re)démarrage du service PM2 ---
log "Service : (re)démarrage PM2 ($PM2_NAME)"
cd "$BACKEND_DIR"
if pm2 describe "$PM2_NAME" > /dev/null 2>&1; then
  pm2 restart "$PM2_NAME" --update-env
else
  pm2 start server.js --name "$PM2_NAME"
fi
pm2 save

log "Déploiement terminé ✅"
pm2 status
