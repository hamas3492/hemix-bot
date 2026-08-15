#!/bin/bash
# tunnel.sh — Cloudflare Tunnel for Hemix Bot Dashboard
# Gives you a free public URL (no IP address needed)
# Usage: bash tunnel.sh [PORT]

PORT=${1:-3000}

echo "Starting Cloudflare Tunnel for port $PORT..."

# Download cloudflared if not installed
if ! command -v cloudflared &> /dev/null; then
  echo "Installing cloudflared..."
  if [[ "$(uname -m)" == "aarch64" ]] || [[ "$(uname -m)" == "arm64" ]]; then
    wget -q "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64" -O /usr/local/bin/cloudflared 2>/dev/null || \
    curl -sL "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64" -o /usr/local/bin/cloudflared
  else
    wget -q "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64" -O /usr/local/bin/cloudflared 2>/dev/null || \
    curl -sL "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64" -o /usr/local/bin/cloudflared
  fi
  chmod +x /usr/local/bin/cloudflared
fi

# Start tunnel
cloudflared tunnel --url http://localhost:$PORT 2>&1 | tee /tmp/cloudflared.log &
TUNNEL_PID=$!

# Wait for URL to appear in logs
echo "Waiting for tunnel URL..."
for i in $(seq 1 30); do
  sleep 2
  URL=$(grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' /tmp/cloudflared.log 2>/dev/null | head -1)
  if [ -n "$URL" ]; then
    echo ""
    echo "============================================"
    echo "  🎉 Dashboard URL: $URL"
    echo "============================================"
    echo "  This URL works from ANY device, anywhere."
    echo "  No IP address needed."
    echo "  URL changes on restart — run this script again to get new URL."
    echo "============================================"
    echo ""
    break
  fi
done

# Keep running
wait $TUNNEL_PID
