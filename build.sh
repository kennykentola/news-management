#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install Python dependencies from root requirements.txt
pip install -r requirements.txt

# Install frontend dependencies and build
cd client
npm install
npm run build
