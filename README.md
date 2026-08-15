🚀 Hemix Bot V1.0
A modern self-pairing WhatsApp bot with AI, group management, media tools and a premium web dashboard.

📦 Requirements
- Node.js v18 or higher
- ffmpeg installed on your system
- A WhatsApp account (for pairing)
- An AI API key (optional, for AI features — OpenAI/DeepSeek/Groq compatible)

⚙️ Installation
```bash
git clone https://github.com/hamas3492/hemix-bot.git
cd hemix-bot
npm install
npm run build
npm start
```
Then open http://localhost:3000 in your browser to access the dashboard.

🔐 Environment Variables
Copy `.env.example` to `.env` and fill in your values:

| Variable | Required | Description |
|----------|----------|-------------|
| PORT | No | Server port (default: 3000) |
| SESSION_SECRET | Yes | Random string for JWT tokens |
| AI_API_KEY | No | OpenAI-compatible API key for AI features |
| AI_BASE_URL | No | Custom AI endpoint (default: OpenAI) |
| AI_MODEL | No | AI model name (default: gpt-4o-mini) |
| OWNER_NUMBER | No | Your WhatsApp number (international format) |
| BOT_PREFIX | No | Command prefix (default: .) |
| BOT_MODE | No | private or public (default: private) |
| TIMEZONE | No | Your timezone (default: Asia/Karachi) |
| ENABLE_TUNNEL | No | Set to false (default — tunnel is disabled) |

Generate a secure SESSION_SECRET: `openssl rand -hex 32`

AI API key can also be set from the dashboard → Settings → AI Config.

🖥️ Dashboard
The web dashboard lets you control everything from your browser:
- **Setup** — Create your dashboard password on first visit
- **Login** — Secure JWT-based authentication
- **Bot Control** — Start/stop/restart bot, view QR code, pair with phone number
- **Settings** — Bot name, prefix, mode, owner info, AI config, timezone
- **Commands** — Enable/disable any command
- **Group Settings** — Anti-features, welcome/goodbye, per-group config
- **Logs** — Real-time log stream + paginated history
- **System Info** — CPU, RAM, uptime, loaded plugins, command count

📲 WhatsApp Pairing (Dashboard Only)
1. Open the dashboard at your website URL
2. Set up your password and login
3. Go to WhatsApp Link tab → click "Start Bot"
4. Scan the QR Code with your WhatsApp, OR use Pairing Code with any phone number
5. Done! Your bot is now connected

**Important:** The bot does NOT auto-connect on startup. You must start it from the dashboard.
If a session was previously saved, the bot will auto-reconnect on server restart.

🔒 Security
- API keys are **never exposed** to the frontend — they are masked in all API responses
- Dashboard requires password authentication (JWT-based)
- Bot defaults to private mode (owner only)
- API keys are stored in the database, never sent to users
- No console QR code or pairing code output — everything is done through the dashboard

🚀 Deployment

Railway (Recommended — gives a proper public URL)
1. Go to Railway → New Project → Deploy from GitHub
2. Select this repository
3. Add environment variables in Railway dashboard:
   - `SESSION_SECRET` — generate with `openssl rand -hex 32`
   - `AI_API_KEY` — your AI API key
   - `OWNER_NUMBER` — your WhatsApp number
   - `ENABLE_TUNNEL=false`
4. Deploy — Railway auto-detects `railway.json`
5. Your dashboard will be available at `https://your-app.up.railway.app`

Render
1. Go to Render → New → Web Service
2. Connect your GitHub repo
3. Render auto-detects `render.yaml` settings
4. Add environment variables and deploy
5. Your dashboard will be available at `https://your-app.onrender.com`

VPS (PM2)
```bash
npm install -g pm2
sudo apt install ffmpeg
git clone https://github.com/hamas3492/hemix-bot.git
cd hemix-bot
npm install && npm run build
pm2 start "node index.js" --name hemix-bot
pm2 save && pm2 startup
```

Docker
```bash
docker-compose up -d
docker-compose logs -f
```

📋 Command Categories
370+ commands across 17 categories including AI, Audio, Download, EPHOTO, Fun, General, Group, Search, Sports, Tools, and more.
Type `.menu` in WhatsApp to see all available commands.

🛠️ Troubleshooting
| Problem | Solution |
|---------|----------|
| QR not showing | Click Start in dashboard, wait 10 seconds |
| Bot disconnects | Check internet, restart via dashboard |
| AI not responding | Set AI_API_KEY in .env or dashboard |
| Commands not working | Check prefix with .menu |
| Build fails | Run `npm install` then `npm run build` |
| Session lost | Don't delete data/session/ folder |
| ffmpeg error | Install ffmpeg: `sudo apt install ffmpeg` |

📄 License
MIT License — see LICENSE file.
