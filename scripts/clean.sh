#!/bin/bash
# scripts/clean.sh — Bersihkan dist/ dan node_modules/

set -e

echo "🧹 Membersihkan build artifacts..."
rm -rf dist node_modules
echo "✅ Selesai. Jalankan npm install untuk install ulang."
