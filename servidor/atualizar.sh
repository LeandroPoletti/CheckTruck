#!/bin/sh
# Sobe o CheckTruck no servidor com o que está no GitHub: baixa o código novo e reconstrói a API e o site.
# Use na primeira vez e a cada atualização, de dentro desta pasta:  sh atualizar.sh
set -e
cd "$(dirname "$0")"

git pull --ff-only
sudo docker compose up -d --build
sudo docker image prune -f
sudo docker compose ps
