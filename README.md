# Discord AI Summary

A lightweight web app that connects to Discord and provides AI-powered summaries of channels, helping you quickly catch up on important discussions and identify channels that need attention.

## Features

- **Discord OAuth Integration**: Secure login with your Discord account
- **AI-Powered Summaries**: Uses OpenAI to analyze and summarize channel activity
- **Smart Importance Scoring**: Automatically rates channel importance (1-10 scale)
- **Topic Detection**: Identifies key topics discussed in each channel
- **Custom Filters**: Filter by your topics of interest or importance threshold
- **Thread Detection**: Shows which channels have active threads
- **Quick Navigation**: Jump directly to channels in Discord app
- **Local Preferences**: All settings stored locally in browser

## Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Minimal Node.js serverless functions (Vercel)
- **APIs**: Discord API, OpenAI API
- **Deployment**: Vercel (serverless)

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

### 3. Local Development Setup

1. Clone the repository:
```bash
git clone <your-repo-url>
cd discord-ai-summary
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from template:
```bash
cp .env.example .env
```

4. Edit `.env` with your credentials:
```env
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/callback
OPENAI_API_KEY=your_openai_api_key
APP_URL=http://localhost:3000
```

5. Run development server:
```bash
npm run dev
```

6. Open http://localhost:3000 in your browser

### 4. Vercel Deployment

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

1. **Login**: Click "Login with Discord" to authenticate
2. **Configure Settings**:
   - Add topics you're interested in (comma-separated)
   - Set importance threshold (1-10)
   - Add your OpenAI API key (stored locally)
3. **Select Server**: Click on any server to analyze its channels
4. **View Summaries**: 
   - See AI-generated summaries of recent activity
   - Check importance ratings
   - View detected topics
5. **Filter Results**:
   - All: Show all channel summaries
   - Important: Show only channels above threshold
   - My Topics: Show channels matching your interests
6. **Navigate**: Click "Open in Discord" to jump directly to a channel

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