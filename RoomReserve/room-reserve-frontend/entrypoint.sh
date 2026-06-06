#!/bin/sh
# Create runtime env file for the frontend to read API base
mkdir -p /usr/share/nginx/html/assets
cat > /usr/share/nginx/html/assets/env.js <<EOF
window.ROOM_RESERVE_API_BASE = "${ROOM_RESERVE_API_BASE:-http://localhost:8080}";
EOF
exec nginx -g 'daemon off;'