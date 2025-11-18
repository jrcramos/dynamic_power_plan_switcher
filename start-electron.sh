#!/bin/bash

# Build Electron files
echo "Building Electron files..."
npx tsc -p tsconfig.electron.json

# Start Electron with the built files
echo "Starting Electron..."
NODE_ENV=production electron .
