#!/bin/bash
# Start script for DigitalOcean App Platform
# Ensures PORT environment variable is used correctly

PORT=${PORT:-8080}
echo "Starting server on port $PORT"
npx serve -s build -l $PORT

