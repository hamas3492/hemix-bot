# 🚀 Hemix Bot V1.0

> A modern self-pairing WhatsApp bot with AI, group management, media tools and a premium web dashboard.

![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green?style=flat-square&logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-v5.4-blue?style=flat-square&logo=typescript)
![WhatsApp](https://img.shields.io/badge/WhatsApp-Baileys%20v6.7-25D366?style=flat-square&logo=whatsapp)

---

## 📦 Requirements

- **Node.js** v18 or higher
- **ffmpeg** installed on your system
- A WhatsApp account (for pairing)
- An AI API key (optional, for AI features — OpenAI/DeepSeek/Groq compatible)

---

## ⚙️ Installation

```bash
git clone https://github.com/hamas3492/hemix-bot.git
cd hemix-bot
npm install
npm run build
npm start
```

Then open `http://localhost:3000` in your browser to access the dashboard.

---

## 🔐 Environment Variables

Copy `.env.example` to `.env` and fill in your values:

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: 3000) |
| `SESSION_SECRET` | Yes | Random string for JWT tokens |
| `AI_API_KEY` | No | OpenAI-compatible API key for AI features |
| `AI_BASE_URL` | No | Custom AI endpoint (default: OpenAI) |
| `AI_MODEL` | No | AI model name (default: gpt-4o-mini) |
| `OWNER_NUMBER` | No | Your WhatsApp number (international format) |
| `BOT_PREFIX` | No | Command prefix (default: `.`) |
| `BOT_MODE` | No | `private` or `public` (default: private) |
| `TIMEZONE` | No | Your timezone (default: Asia/Karachi) |

> AI API key can also be set from the dashboard → Settings → AI Config.

---

## 🖥️ Dashboard

The web dashboard lets you control everything from your browser:

- **Setup** — Create your dashboard password on first visit
- **Login** — Secure JWT-based authentication
- **Bot Control** — Start/stop/restart bot, view QR code, pair with phone number
- **Settings** — Bot name, prefix, mode, owner info, AI config, timezone
- **Commands** — Enable/disable any command
- **Group Settings** — Anti-features, welcome/goodbye, per-group config
- **Logs** — Real-time log stream + paginated history
- **System Info** — CPU, RAM, uptime, loaded plugins, command count

---

## 📲 WhatsApp Pairing

1. Open the dashboard at `http://localhost:3000`
2. Set up your password and login
3. Go to **Bot** tab → click **Start**
4. Scan the **QR Code** with your WhatsApp, OR use **Pairing Code** with your phone number
5. Done! Your bot is now connected

---

## 🤖 AI Configuration

The bot supports any OpenAI-compatible API:

1. Get an API key from [OpenAI](https://platform.openai.com/api-keys), [DeepSeek](https://platform.deepseek.com/), [Groq](https://console.groq.com/), or any compatible provider
2. Set it in `.env` as `AI_API_KEY=your-key-here`, OR set it from Dashboard → Settings → AI Config
3. Set `AI_BASE_URL` and `AI_MODEL` if using a non-OpenAI provider

**Examples:**

```
# OpenAI
AI_API_KEY=sk-...
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o-mini

# DeepSeek
AI_API_KEY=sk-...
AI_BASE_URL=https://api.deepseek.com/v1
AI_MODEL=deepseek-chat

# Groq
AI_API_KEY=gsk-...
AI_BASE_URL=https://api.groq.com/openai/v1
AI_MODEL=llama-3.3-70b-versatile
```

---

## 🚀 Deployment

### Heroku

```bash
heroku create your-bot-name
heroku config:set SESSION_SECRET=your-secret
heroku config:set AI_API_KEY=your-key
git push heroku main
heroku open
```

### Railway

1. Go to [Railway](https://railway.app) → New Project → Deploy from GitHub
2. Select this repository
3. Add environment variables in Railway dashboard
4. Deploy — Railway auto-detects the `railway.json` config

### Render

1. Go to [Render](https://render.com) → New → Web Service
2. Connect your GitHub repo
3. Render auto-detects `render.yaml` settings
4. Add environment variables and deploy

### VPS (PM2)

```bash
# Install PM2
npm install -g pm2

# Install ffmpeg
sudo apt install ffmpeg

# Clone and build
git clone https://github.com/hamas3492/hemix-bot.git
cd hemix-bot
npm install
npm run build

# Start with PM2
pm2 start "node dist/index.js" --name hemix-bot
pm2 save
pm2 startup  # auto-restart on reboot
```

### Docker

```bash
docker-compose up -d
```

Logs: `docker-compose logs -f`
Stop: `docker-compose down`

---

## 📋 Command Categories

The bot has 370+ commands across 17 categories:

| Category | What it does |
|---|---|
| **AI** | Chatbot, GPT, DeepSeek, programming help |
| **Audio** | Bass boost, earrape, robot voice, convert |
| **Download** | YouTube, TikTok, Instagram, Facebook, Twitter, Pinterest |
| **EPHOTO** | 33 text-to-image effects |
| **Fun** | Truth/dare, jokes, stickers, games |
| **General** | Menu, bot info, categories, list |
| **Group** | Kick, promote, tagall, welcome/goodbye, 29 anti-features |
| **Others** | Ping, uptime, alive, owner info |
| **Owner** | Set prefix, block/unblock, broadcast, set bio |
| **Religion** | Bible verses, Quran verses |
| **Search** | Weather, lyrics, dictionary, IMDB |
| **Settings** | Toggles, filters, warnings, menu style |
| **Sports** | 10+ leagues: EPL, La Liga, Bundesliga, Champions League |
| **Support** | Feedback, help |
| **Tools** | Sticker maker, image tools, text utilities |
| **Translate** | Google translate, trivia |
| **Video** | WebP to MP4 converter |

Type `.menu` in WhatsApp to see all available commands.

---

## 🛠️ Troubleshooting

| Problem | Solution |
|---|---|
| QR not showing | Click **Start** in dashboard, wait 10 seconds |
| Bot disconnects | Check internet, restart via dashboard |
| AI not responding | Set `AI_API_KEY` in `.env` or dashboard |
| Commands not working | Check prefix with `.menu` |
| Build fails | Run `npm install` then `npm run build` |
| Session lost | Don't delete `data/session/` folder |
| ffmpeg error | Install ffmpeg: `sudo apt install ffmpeg` |

---

## 🔒 Security Notes

- Set a strong `SESSION_SECRET` in `.env`
- Dashboard requires password authentication
- Bot defaults to `private` mode (owner only)
- API keys are stored in the database, not exposed to users

---

## 📄 License

MIT License — see [LICENSE](LICENSE) file.

---

## 🙌 Credits

Built with [Baileys](https://github.com/WhiskeySockets/Baileys) • [Express](https://expressjs.com/) • [TypeScript](https://www.typescriptlang.org/)
