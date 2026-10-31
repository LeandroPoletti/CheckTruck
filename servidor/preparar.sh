#!/bin/sh
# Prepara um servidor Ubuntu novo (EC2) para o CheckTruck: memória extra (swap) e Docker. Rode uma vez só,
# de dentro desta pasta:  sh preparar.sh
set -e

# 2 GB de swap: o servidor tem 2 GB de memória, e compilar a API e o site passa disso
if [ ! -f /swapfile ]; then
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

# Docker, já com o compose (pelo script oficial do Docker)
if ! command -v docker > /dev/null; then
  curl -fsSL https://get.docker.com | sudo sh
fi

sudo docker compose version
echo "Pronto. Agora: cp .env.exemplo .env, preencha o .env e rode sh atualizar.sh"
