#!/bin/bash
# scripts/build.sh — Build production E-CAKRA frontend

set -e

echo "🔨 Building E-CAKRA..."
npm run build
echo "✅ Build selesai. Output di folder dist/"
