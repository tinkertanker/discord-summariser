# Discord Monitor - Developer Documentation

## Project Overview

Multi-user Discord monitoring platform with AI-powered channel summaries and response suggestions. Built with Next.js 14, SQLite, and OpenAI.

## Architecture

### Tech Stack
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite
- **Authentication**: NextAuth.js with Discord OAuth
- **AI**: OpenAI GPT-3.5-turbo

### Key Design Decisions
- Multi-user architecture with isolated data
- Server-side rendering with Next.js App Router
- Normalized database schema with proper indexing
- Manual scanning initiated by users
- AI integration for summaries and responses

## Database Schema

### Core Models

**Note**: Array fields (`ignoredChannels`, `topics`) are stored as JSON strings in SQLite.

```prisma
User
├── accounts (OAuth accounts)
├── sessions (Active sessions)
├── monitoredServers (Discord servers)
├── summaries (Channel summaries)
└── responses (AI-generated responses)

MonitoredServer
├── serverId (Discord server ID)
├── scanAllChannels (boolean)
├── ignoredChannels (JSON array)
└── lastScannedAt (timestamp)

ChannelSummary
├── channelId (Discord channel ID)
├── summary (AI-generated text)
├── importance (1-10 score)
├── topics (JSON array)
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
- Discord OAuth scopes: `identify email guilds guilds.members.read messages.read`

### Server Management
- `GET /api/servers` - List monitored servers
- `POST /api/servers` - Add new server
- `PATCH /api/servers/[id]` - Update server settings
- `DELETE /api/servers/[id]` - Remove server

### Discord Integration
- `GET /api/discord/available-servers` - Get user's Discord servers
- `GET /api/discord/server/[serverId]/channels` - Get server channels

### Summaries
- `GET /api/summaries` - Get all summaries
- `POST /api/summaries/mark-read` - Mark summaries as read
- `POST /api/scan` - Trigger manual scan

### AI Features
- `POST /api/ai/generate-responses` - Generate response suggestions
- `PATCH /api/responses/[id]` - Update edited response

## AI Implementation

### Summary Generation

Analyzes last 50 messages per channel:
- Summary: 2-3 sentence overview
- Importance score (1-10):
  - Announcements/updates (8-10)
  - Questions needing answers (7-9)
  - Active discussions (5-7)
  - General chat (1-4)
- Topics: Up to 5 key topics

### Response Generation

Four response types per summary:
- ACKNOWLEDGMENT: Brief acknowledgment
- QUESTION: Follow-up question
- ANSWER: Helpful response to questions
- FOLLOW_UP: Continue previous discussions

## Environment Variables

```env
DATABASE_URL=file:./dev.db
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret
DISCORD_CLIENT_ID=your-client-id
DISCORD_CLIENT_SECRET=your-client-secret
OPENAI_API_KEY=your-openai-key
CRON_SECRET=optional-secret
```

## Development

### Setup
```bash
npm install
npx prisma db push
npx prisma generate
npm run dev
```

### Database Commands
```bash
npx prisma studio          # View database
npx prisma migrate dev     # Create migration
npx prisma migrate deploy # Apply migrations
```

## Deployment

### Self-Hosting
1. Set up reverse proxy for HTTPS
2. Use PM2 for process management
3. Configure Discord OAuth redirect URL
4. Set all environment variables

### Production Checklist
- [ ] Configure all environment variables
- [ ] Set up reverse proxy with HTTPS
- [ ] Configure process manager
- [ ] Update Discord OAuth redirect URI
- [ ] Test Discord permissions
- [ ] Verify OpenAI API key

## Performance

- Indexed queries on userId, isRead, serverId
- Manual scanning reduces API usage
- Respects Discord and OpenAI rate limits
- Batched OpenAI requests (max 3 channels per scan)

## Security

- Discord OAuth authentication
- JWT sessions with NextAuth
- User data isolation at database level
- All API endpoints require authentication
- Discord tokens encrypted in database

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
   - Check file permissions for SQLite
   - Ensure database directory exists

## Future Enhancements

- Optional automated scanning
- Webhook integration for real-time updates
- Export functionality
- Mobile app
- Thread monitoring
- Custom importance scoring

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes (conventional commits)
4. Push to branch
5. Open Pull Request

## Code Style

- TypeScript strict mode
- Prettier + ESLint
- Conventional commits
- Component-driven development

## License

MIT