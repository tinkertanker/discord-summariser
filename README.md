# Discord Monitor

AI-powered Discord monitoring platform that helps you stay on top of important conversations across multiple servers.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![SQLite](https://img.shields.io/badge/SQLite-3-003b57)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--3.5-412991)

## ✨ Features

- 📊 **Smart Summaries** - AI-generated summaries of channel activity with importance scoring
- 💬 **Response Suggestions** - Get AI-powered response options you can edit and send
- 🔍 **Multi-Server Monitoring** - Track multiple Discord servers from one dashboard
- ✅ **Read/Unread Tracking** - Keep track of what you've reviewed
- ⚡ **Auto-Scanning** - Background scanning every 6 hours or manual refresh
- 🎯 **Channel Filtering** - Choose which channels to monitor or ignore
- 🔗 **Quick Navigation** - Jump directly to Discord channels from summaries

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- [Discord Application](https://discord.com/developers/applications)
- [OpenAI API Key](https://platform.openai.com/api-keys)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/tinkertanker/discord-summariser.git
cd discord-summariser
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
- Discord OAuth credentials
- OpenAI API key
- Generate a random NextAuth secret

The database will be automatically created as `dev.db` in the project root.

4. **Initialize database**
```bash
npx prisma db push
```

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app!

## 📖 How It Works

1. **Sign in** with your Discord account
2. **Add servers** you want to monitor
3. **Configure channels** to scan or ignore
4. **View summaries** on your personalized dashboard
5. **Generate responses** with AI assistance
6. **Stay updated** with automatic background scanning

## 🌐 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tinkertanker/discord-summariser)

After deploying:
1. Add environment variables in Vercel dashboard
2. Update Discord OAuth redirect URL to your production domain
3. Enable cron jobs for automatic scanning

## 🛠️ Development

For detailed technical documentation, see [CLAUDE.md](./CLAUDE.md)

## 📝 License

MIT - See [LICENSE](./LICENSE) for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ using Next.js, Prisma, and OpenAI