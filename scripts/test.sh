#!/usr/bin/env bash
set -e

echo "=========================================="
echo " Running Full Attestify Test Suite"
echo "=========================================="

echo -e "\n[1/3] Testing Server Integrity..."
node scripts/test-server.js

echo -e "\n[2/3] Testing Smart Contracts Compilation..."
npm --prefix blockchain run compile

echo -e "\n[3/3] Testing Frontend (Lint & Build)..."
npm --prefix client run lint
npm --prefix client run build

echo -e "\n=========================================="
echo " ALL TESTS PASSED SUCCESSFULLY! "
echo "=========================================="
