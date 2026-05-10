#!/bin/bash
# Lance Keystatic en local pour éditer les articles de jimsagnier.com
# Double-clique ce fichier dans Finder, ou glisse-le dans le Dock.
# Le script se positionne automatiquement dans le dossier où il vit.

set -e
cd "$(dirname "$0")"

# Couleurs pour la sortie (Terminal Mac comprend)
GREEN='\033[1;32m'
CYAN='\033[1;36m'
RESET='\033[0m'

printf "${CYAN}[Keystatic]${RESET} Dossier : %s\n" "$(pwd)"

# Vérifie Node.js
if ! command -v node &> /dev/null; then
  echo "Node.js non trouvé. Installe Node 22 depuis https://nodejs.org puis relance."
  read -p "Appuie sur Entrée pour fermer..."
  exit 1
fi

# Installe les dépendances si absent (première utilisation)
if [ ! -d "node_modules" ]; then
  printf "${CYAN}[Keystatic]${RESET} Installation des dépendances (première fois, ~30s)...\n"
  npm install --legacy-peer-deps
fi

# Ouvre Keystatic dans le navigateur après 4s (laisse le temps au serveur de démarrer)
(sleep 4 && open "http://localhost:4321/keystatic") &

printf "${GREEN}[Keystatic]${RESET} Démarrage du serveur Astro + Keystatic\n"
printf "${GREEN}[Keystatic]${RESET} L'interface s'ouvrira sur http://localhost:4321/keystatic\n"
printf "${CYAN}[Keystatic]${RESET} Ferme cette fenêtre Terminal pour arrêter le serveur.\n\n"

npm run dev
