# Discord Monitor

A multi-user web platform for Discord channel monitoring with AI-powered summaries and response suggestions.

## Features

- **Multi-User Support**: Individual accounts with personal Discord connections
- **Server Management**: Add/remove Discord servers to monitor
- **Channel Configuration**: Choose which channels to scan or ignore
- **AI-Powered Summaries**: Automatic summarization with importance scoring
- **Suggested Responses**: AI-generated response options you can edit
- **Bulk Actions**: Mark multiple channels as read at once
- **Read/Unread Tracking**: Keep track of what you've reviewed
- **Discord Web Links**: Jump directly to channels in Discord web app
- **Background Scanning**: Automatic periodic scanning (every 6 hours)
- **Real-time Updates**: Manual scan button for immediate updates

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Supabase/Vercel Postgres)
- **Authentication**: NextAuth.js with Discord OAuth
- **AI**: OpenAI GPT-3.5 for summaries and responses
- **Deployment**: Vercel with Cron Jobs

## Setup Instructions

### 1. Discord Application Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and name it (e.g., "Discord AI Summary")
3. Go to "OAuth2" > "General"
4. Copy your **Client ID** and **Client Secret**
5. Add redirect URL: `http://localhost:3000/api/auth/callback` (for local development)
6. Go to "Bot" section (optional for enhanced features)

### 2. OpenAI API Setup

1. Go to [OpenAI API](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the key (starts with `sk-`)

### 3. Database Setup

1. Create a PostgreSQL database (options):
   - **Supabase**: Create a free project at [supabase.com](https://supabase.com)
   - **Vercel Postgres**: Use Vercel's managed PostgreSQL
   - **Local**: Use a local PostgreSQL instance

2. Get your database connection string

### 4. Local Development Setup

1. Clone the repository:
```bash
git clone https://github.com/tinkertanker/discord-summariser.git
cd discord-summariser
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file from template:
```bash
cp .env.example .env.local
```

4. Edit `.env.local` with your credentials:
```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-secret-here"
DISCORD_CLIENT_ID="your_discord_client_id"
DISCORD_CLIENT_SECRET="your_discord_client_secret"
OPENAI_API_KEY="sk-your-openai-api-key"
CRON_SECRET="your-cron-secret"
```

5. Push database schema:
```bash
npx prisma db push
```

6. Generate Prisma client:
```bash
npx prisma generate
```

7. Run development server:
```bash
npm run dev
```

8. Open http://localhost:3000 in your browser

### 5. Vercel Deployment

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy to Vercel:
```bash
vercel
```

3. Set environment variables in Vercel dashboard:
   - Go to your project settings
   - Add all environment variables from `.env`
   - Update `DISCORD_REDIRECT_URI` to your Vercel URL

4. Update Discord OAuth redirect URL to match your Vercel deployment

## Usage Guide

1. **Login**: Click "Sign in with Discord" to authenticate
2. **Add Servers**:
   - Click the "+" button in the sidebar
   - Select servers you want to monitor
   - Configure channel preferences (scan all or select specific channels)
3. **View Summaries**:
   - Dashboard shows all channel summaries
   - Filter by All/Unread/Important
   - Click server names in sidebar to filter by server
4. **Manage Summaries**:
   - Mark individual summaries as read
   - Use "Mark All Read" for bulk actions
   - Click "Open in Discord" to jump to the channel
5. **Generate Responses**:
   - Click "Generate Response" on any summary
   - Get 4 AI-suggested responses (Acknowledge, Question, Answer, Follow-up)
   - Edit responses before copying
   - Click copy icon to copy to clipboard
   - Click external link to open Discord with response copied
6. **Manual Scanning**:
   - Click "Scan Now" to immediately scan all active servers
   - Background scans run automatically every 6 hours

## API Rate Limits

- **Discord API**: 
  - Global rate limit: 50 requests per second
  - Per-route limits vary
  - The app fetches only recent messages (last 50 per channel)
  
- **OpenAI API**:
  - Depends on your tier
  - Uses GPT-3.5-turbo for efficiency
  - Approximately 0.002$ per channel analyzed

## Security Notes

- Discord tokens are stored in memory only
- OpenAI API key is stored in localStorage (client-side only)
- No user data is stored on servers
- All preferences are local to your browser
- OAuth tokens expire and require re-authentication

## Customization

### Modify Importance Scoring

Edit the scoring logic in `/api/discord/guild/[guildId]/summary.js`:
```javascript
// Customize importance criteria
- Announcements or important updates (high)
- Active discussions (medium-high)  
- Technical problems or issues (high)
- General chat (low)
```

### Change Summary Length

Modify the OpenAI prompt in the same file:
```javascript
max_tokens: 200 // Adjust for longer/shorter summaries
```

### Add More Channels

By default, it analyzes the first 5 channels. Change this in:
```javascript
textChannels.slice(0, 5) // Increase the number
```

## Troubleshooting

### "Failed to authenticate with Discord"
- Check your Client ID and Secret are correct
- Verify redirect URI matches exactly
- Ensure Discord app is not suspended

### "Failed to generate summaries" 
- Verify OpenAI API key is valid
- Check you have API credits remaining
- Ensure the key is entered in settings

### Channels not showing
- Verify you have read permissions in the server
- Some channels may be hidden or private
- Bot accounts cannot access certain channels

## Contributing

Feel free to open issues or submit PRs for improvements!

## License

MIT