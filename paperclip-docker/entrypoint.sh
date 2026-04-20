#!/bin/sh
set -e

# Fix permissions
chmod -R 777 /paperclip

# Get node user's UID/GID
NODE_UID=$(id -u node)
NODE_GID=$(id -g node)

# Run as node user with proper permissions
exec gosu node:$NODE_GID node /app/server/dist/index.js
