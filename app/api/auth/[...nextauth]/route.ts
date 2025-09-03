import NextAuth, { AuthOptions } from 'next-auth'
import DiscordProvider from 'next-auth/providers/discord'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

const DISCORD_SCOPES = 'identify email guilds guilds.members.read messages.read'

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: DISCORD_SCOPES,
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, token, user }) {
      if (session.user) {
        session.user.id = user.id
        // Store Discord access token for API calls
        const account = await prisma.account.findFirst({
          where: {
            userId: user.id,
            provider: 'discord',
          },
        })
        if (account) {
          session.accessToken = account.access_token
        }
      }
      return session
    },
    async signIn({ user, account }) {
      if (account?.provider === 'discord') {
        // Update user with Discord ID
        await prisma.user.update({
          where: { id: user.id },
          data: {
            discordId: account.providerAccountId,
            discordToken: account.access_token,
            refreshToken: account.refresh_token,
            tokenExpiresAt: account.expires_at 
              ? new Date(account.expires_at * 1000) 
              : null,
          },
        })
      }
      return true
    },
  },
  pages: {
    signIn: '/',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }