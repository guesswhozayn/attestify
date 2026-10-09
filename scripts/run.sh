#!/usr/bin/env bash
set -e

echo "Starting Attestify full stack (Server + Client)..."
npx concurrently \
  -n "SERVER,CLIENT" \
  -c "blue,green" \
  "npm run dev --workspace=@attestify/server" \
  "npm run dev --workspace=@attestify/client"
