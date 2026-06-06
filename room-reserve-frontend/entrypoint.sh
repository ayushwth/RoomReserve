#!/bin/sh
# Create runtime env file for the frontend to read API base
cat > /usr/share/nginx/html/env.js <<EOF
window.ROOM_RESERVE_API_BASE = "${ROOM_RESERVE_API_BASE:-http://localhost:8080}";
EOF
exec nginx -g 'daemon off;'
