# Discord Monitor

AI-powered Discord monitoring platform for tracking important conversations across multiple servers.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003b57)](https://www.sqlite.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--3.5-412991)](https://openai.com/)

## Features

- AI-generated channel summaries with importance scoring
- AI-powered response suggestions
- Multi-server monitoring from one dashboard
- Read/unread tracking
- Manual scanning on demand
- Channel filtering options
- Direct navigation to Discord channels

## Quick Start

### Prerequisites

- Node.js 18+
- Discord Application credentials
- OpenAI API key

### Installation

1. Clone and install dependencies:
```bash
git clone https://github.com/tinkertanker/discord-summariser.git
cd discord-summariser
npm install
```

2. Configure environment:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
- Discord OAuth credentials
- OpenAI API key
- NextAuth secret

3. Initialize database:
```bash
npx prisma db push
```

4. Start development server:
```bash
npm run dev
```

Visit http://localhost:3000

## How It Works

1. Sign in with Discord
2. Add servers to monitor
3. Configure channel preferences
4. Click "Scan for Updates" to check activity
5. View summaries and generate responses

## Self-Hosting

### Production Setup

1. Set up reverse proxy (nginx/Apache) for HTTPS
2. Use PM2 or similar for process management
3. Configure Discord OAuth redirect URL
4. Set environment variables securely

## Development

See [CLAUDE.md](./CLAUDE.md) for technical documentation.

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request