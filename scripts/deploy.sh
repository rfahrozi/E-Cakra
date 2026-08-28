#!/bin/bash
# scripts/deploy.sh — Deploy E-CAKRA ke VPS via Docker Compose

set -e

echo "🚀 Deploy E-CAKRA..."
docker compose pull
docker compose up -d --build
echo "✅ Deploy selesai."
