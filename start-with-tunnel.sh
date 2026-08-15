#!/bin/bash
# start-with-tunnel.sh — Start Hemix Bot + Cloudflare Tunnel
# Gives you a public dashboard URL without needing an IP address
# Usage: bash start-with-tunnel.sh

set -e

PORT=${PORT:-3000}

echo "============================================"
echo "  Hemix Bot V1.0 — Starting with Tunnel"
echo "============================================"

# Step 1: Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Step 2: Build if needed
if [ ! -f "dist/src/app.js" ]; then
  echo "Building project..."
  npm run build
fi

# Step 3: Install cloudflared if not present
if ! command -v cloudflared &> /dev/null; then
  echo "Installing cloudflared..."
  ARCH="linux-amd64"
  if [[ "$(uname -m)" == "aarch64" ]] || [[ "$(uname -m)" == "arm64" ]]; then
    ARCH="linux-arm64"
  fi
  curl -sL "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-$ARCH" -o /usr/local/bin/cloudflared 2>/dev/null || \
  wget -q "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-$ARCH" -O /usr/local/bin/cloudflared
  chmod +x /usr/local/bin/cloudflared
fi

# Step 4: Start bot in background
echo "Starting Hemix Bot on port $PORT..."
node index.js &
BOT_PID=$!

# Wait for bot to start
sleep 5

# Step 5: Start tunnel
echo "Starting Cloudflare Tunnel..."
cloudflared tunnel --url http://localhost:$PORT 2>&1 | tee /tmp/cloudflared.log &
TUNNEL_PID=$!

# Wait for URL
for i in $(seq 1 30); do
  sleep 2
  URL=$(grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' /tmp/cloudflared.log 2>/dev/null | head -1)
  if [ -n "$URL" ]; then
    echo ""
    echo "============================================"
    echo "  ✅ Bot is running!"
    echo "  🌐 Dashboard URL: $URL"
    echo "============================================"
    echo "  Open this URL in any browser, any device."
    echo "  No IP address needed — works anywhere!"
    echo "============================================"
    echo ""
    break
  fi
done

# Handle shutdown
cleanup() {
  echo "Shutting down..."
  kill $BOT_PID 2>/dev/null
  kill $TUNNEL_PID 2>/dev/null
  exit 0
}

trap cleanup SIGINT SIGTERM

# Keep running
wait $BOT_PID
