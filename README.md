🚀 Hemix Bot V1.0
A modern self-pairing WhatsApp bot with AI, group management, media tools and a premium web dashboard.

**Works on ANY platform** — Katabump, Heroku, Railway, Render, VPS, Docker, Replit, Glitch.

📦 Requirements
- Node.js v18 or higher
- ffmpeg installed on your system
- A WhatsApp account (for pairing)
- An AI API key (optional, for AI features)

⚙️ Installation
```bash
git clone https://github.com/hamas3492/hemix-bot.git
cd hemix-bot
npm install
npm run build
npm start
```
The dashboard URL will be printed in the console. Open it in your browser to access the dashboard.

🔐 Environment Variables
Copy `.env.example` to `.env` and fill in your values:

| Variable | Required | Description |
|----------|----------|-------------|
| PORT | No | Server port (auto-set on most platforms) |
| SESSION_SECRET | Yes | Random string for JWT tokens |
| AI_API_KEY | No | OpenAI-compatible API key for AI features |
| AI_BASE_URL | No | Custom AI endpoint (default: OpenAI) |
| AI_MODEL | No | AI model name (default: gpt-4o-mini) |
| OWNER_NUMBER | No | Your WhatsApp number (international format) |
| BOT_PREFIX | No | Command prefix (default: .) |
| BOT_MODE | No | private or public (default: private) |
| TIMEZONE | No | Your timezone (default: Asia/Karachi) |
| ENABLE_TUNNEL | No | Set to false to disable auto public URL |

Generate a secure SESSION_SECRET: `openssl rand -hex 32`

🌐 Dashboard URL — How It Works
The bot automatically detects the dashboard's public URL based on the platform:
- **Heroku** → `https://your-app.herokuapp.com` (auto-detected)
- **Railway** → `https://your-app.up.railway.app` (auto-detected)
- **Render** → `https://your-app.onrender.com` (auto-detected)
- **Replit** → `https://your-app.username.repl.co` (auto-detected)
- **Katabump/panels** → Auto-creates a public URL (printed in console)
- **VPS/local** → `http://localhost:3000` or auto-creates a public URL

The URL is printed to the console on startup. Open it in your browser to access the dashboard.

🖥️ Dashboard Features
- **Setup** — Create your dashboard password on first visit
- **Login** — Secure JWT-based authentication
- **Bot Control** — Start/stop/restart bot, view QR code, pair with phone number
- **Settings** — Bot name, prefix, mode, owner info, AI config, timezone
- **Commands** — Enable/disable any command
- **Group Settings** — Anti-features, welcome/goodbye, per-group config
- **Logs** — Real-time log stream + paginated history
- **System Info** — CPU, RAM, uptime, loaded plugins, command count

📲 WhatsApp Pairing (Dashboard Only)
1. Start the bot — dashboard URL appears in console
2. Open the URL in your browser
3. Set up your password and login
4. Go to WhatsApp Link tab → click "Start Bot"
5. Scan the QR Code with your WhatsApp, OR use Pairing Code with any phone number
6. Done! Your bot is now connected

**Important:** The bot does NOT auto-connect on startup. You must start it from the dashboard.
If a session was previously saved, the bot will auto-reconnect on server restart.

🔒 Security
- API keys are **never exposed** to the frontend — masked in all API responses
- Dashboard requires password authentication (JWT-based)
- Bot defaults to private mode (owner only)
- No console QR code or pairing code output — everything through the dashboard
- Session data stored locally, never transmitted

🚀 Deployment

Heroku
1. Fork this repository
2. Click "Deploy to Heroku" button or: `heroku create your-bot-name`
3. Set config vars: `SESSION_SECRET`, `OWNER_NUMBER`, `AI_API_KEY`
4. `git push heroku main`
5. Dashboard URL: `https://your-bot-name.herokuapp.com`

Railway
1. Go to Railway → New Project → Deploy from GitHub
2. Select this repository
3. Add environment variables in Railway dashboard
4. Deploy — auto-detects `railway.json`
5. Dashboard URL: `https://your-app.up.railway.app`

Render
1. Go to Render → New → Web Service
2. Connect your GitHub repo
3. Add environment variables and deploy
4. Dashboard URL: `https://your-app.onrender.com`

Katabump / Pterodactyl Panels
1. Upload the bot files to your server
2. Set environment variables in the panel
3. Start the bot: `node index.js`
4. Dashboard URL will be auto-created and printed in the console
5. Open the console URL in your browser to access the dashboard

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
| No dashboard URL in console | Wait 5s after startup, check logs |
| QR not showing | Click Start in dashboard, wait 10 seconds |
| Bot disconnects | Check internet, restart via dashboard |
| AI not responding | Set AI_API_KEY in .env or dashboard |
| Build fails | Run `npm install` then `npm run build` |
| ffmpeg error | Install ffmpeg: `sudo apt install ffmpeg` |

📄 License
MIT License — see LICENSE file.
