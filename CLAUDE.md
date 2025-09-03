# Discord Monitor - Developer Documentation

## Project Overview

A multi-user Discord monitoring platform built with Next.js 14, featuring AI-powered channel summaries and response suggestions. Users can monitor multiple Discord servers, get intelligent summaries of channel activity, and generate contextual responses.

## Architecture

### Tech Stack
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite for local hosting
- **Authentication**: NextAuth.js with Discord OAuth
- **AI**: OpenAI GPT-3.5-turbo
- **Deployment**: Vercel with Cron Jobs

### Key Design Decisions

1. **Multi-user Architecture**: Each user has isolated data with personal Discord tokens
2. **Server-side Rendering**: Next.js App Router for better SEO and performance
3. **Database Schema**: Normalized with proper relationships and indexes
4. **Background Jobs**: Vercel Cron for periodic scanning (every 6 hours)
5. **AI Integration**: OpenAI for both summaries and response generation

## Database Schema

### Core Models

**Note**: Array fields (`ignoredChannels`, `topics`) are stored as JSON strings in SQLite to maintain compatibility. The API endpoints automatically handle JSON serialization/deserialization.

```prisma
User
├── accounts (OAuth accounts)
├── sessions (Active sessions)
├── monitoredServers (Discord servers being monitored)
├── summaries (Channel summaries)
└── responses (AI-generated responses)

MonitoredServer
├── serverId (Discord server ID)
├── scanAllChannels (boolean)
├── ignoredChannels (array stored as JSON string)
└── lastScannedAt (timestamp)

ChannelSummary
├── channelId (Discord channel ID)
├── summary (AI-generated text)
├── importance (1-10 score)
├── topics (detected topics array stored as JSON string)
├── isRead (boolean)
└── lastActivityAt (timestamp)

SuggestedResponse
├── responseType (ACKNOWLEDGMENT|QUESTION|ANSWER|FOLLOW_UP)
├── suggestedText (AI-generated)
└── editedText (user modifications)
```

## API Endpoints

### Authentication
- `GET/POST /api/auth/[...nextauth]` - NextAuth.js handlers
- Discord OAuth with scopes: `identify email guilds guilds.members.read messages.read`

### Server Management
- `GET /api/servers` - List user's monitored servers
- `POST /api/servers` - Add new server to monitor
- `PATCH /api/servers/[id]` - Update server settings
- `DELETE /api/servers/[id]` - Remove server from monitoring

### Discord Integration
- `GET /api/discord/available-servers` - Get user's Discord servers
- `GET /api/discord/server/[serverId]/channels` - Get server channels

### Summaries
- `GET /api/summaries` - Get all summaries for user
- `POST /api/summaries/mark-read` - Mark summaries as read
- `POST /api/scan` - Trigger manual scan of all servers

### AI Features
- `POST /api/ai/generate-responses` - Generate suggested responses
- `PATCH /api/responses/[id]` - Update edited response

### Background Jobs
- `GET /api/cron` - Automated scanning endpoint (protected by CRON_SECRET)

## AI Implementation

### Summary Generation

The AI analyzes the last 50 messages from each channel and generates:
1. **Summary**: 2-3 sentence overview of activity
2. **Importance Score**: 1-10 based on:
   - Announcements/updates (8-10)
   - Questions needing answers (7-9)
   - Active discussions (5-7)
   - General chat (1-4)
3. **Topics**: Up to 5 key topics discussed

### Response Generation

Four response types are generated for each summary:
- **ACKNOWLEDGMENT**: Brief acknowledgment of channel activity
- **QUESTION**: Relevant follow-up question
- **ANSWER**: Helpful answer if questions were present
- **FOLLOW_UP**: Follow-up on previous discussions

## Environment Variables

```env
# Database
DATABASE_URL - SQLite database file path

# NextAuth
NEXTAUTH_URL - Application URL
NEXTAUTH_SECRET - Random secret for JWT signing

# Discord OAuth
DISCORD_CLIENT_ID - Discord application client ID
DISCORD_CLIENT_SECRET - Discord application client secret

# OpenAI
OPENAI_API_KEY - OpenAI API key for GPT-3.5

# Cron Security
CRON_SECRET - Secret for protecting cron endpoint
```

## Development Workflow

### Local Setup
```bash
# Install dependencies
npm install

# Setup database
npx prisma db push
npx prisma generate

# Run development server
npm run dev

# View database
npm run prisma:studio
```

### Database Migrations
```bash
# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset
```

## Deployment

### Vercel Configuration

1. **Environment Variables**: Add all variables from `.env.example`
2. **Build Settings**: Automatic (Next.js detected)
3. **Cron Jobs**: Configured in `vercel.json`
```json
{
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

### Production Checklist

- [ ] Set up environment variables from `.env.example`
- [ ] Configure all environment variables
- [ ] Update Discord OAuth redirect URI
- [ ] Generate secure NEXTAUTH_SECRET
- [ ] Set CRON_SECRET for job security
- [ ] Test Discord permissions and scopes
- [ ] Verify OpenAI API key and credits

## Performance Optimizations

1. **Database Configuration**
   - Indexed on userId, isRead, serverId
   - Compound unique constraints prevent duplicates
   - Efficient relationship loading with Prisma includes
   - SQLite file-based storage for easy local hosting

2. **API Rate Limiting**
   - Discord: Respects global rate limits
   - OpenAI: Batched requests, max 3 channels per scan
   - Manual scan throttling

3. **Frontend Optimizations**
   - React Server Components where possible
   - Optimistic UI updates
   - Image optimization with Next.js Image

## Security Considerations

1. **Authentication**
   - Discord OAuth only
   - JWT sessions with NextAuth
   - User isolation at database level

2. **API Security**
   - All endpoints require authentication
   - User ownership validation
   - CRON_SECRET for background jobs

3. **Data Privacy**
   - Discord tokens encrypted in database
   - No message content stored permanently
   - User can delete all data

## Troubleshooting

### Common Issues

1. **"Failed to fetch servers"**
   - Check Discord token validity
   - Verify OAuth scopes include `guilds`

2. **"Failed to generate summaries"**
   - Verify OpenAI API key
   - Check API credits
   - Review rate limits

3. **Database connection errors**
   - Verify DATABASE_URL format
   - Check file permissions for SQLite database
   - Ensure database file directory exists

### Debug Mode

Add to `.env.local`:
```env
DEBUG=prisma:*  # Prisma query logging
NODE_ENV=development  # Verbose error messages
```

## Future Enhancements

Potential features to add:
- [ ] Webhook integration for real-time updates
- [ ] Custom AI model fine-tuning
- [ ] Export summaries to CSV/PDF
- [ ] Mobile app with React Native
- [ ] Thread-specific monitoring
- [ ] Voice channel activity tracking
- [ ] Custom importance scoring rules
- [ ] Team/organization accounts
- [ ] Slack/Email notifications

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Style

- TypeScript strict mode enabled
- Prettier + ESLint for formatting
- Conventional commits
- Component-driven development

## License

MIT