'use client'

import { useSession, signIn } from 'next-auth/react'
import { motion } from 'framer-motion'
import { FaDiscord } from 'react-icons/fa'
import { redirect } from 'next/navigation'

export default function Home() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-discord-blurple"></div>
      </div>
    )
  }

  if (session) {
    redirect('/dashboard')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-discord-blurple to-purple-400 bg-clip-text text-transparent">
          Discord Monitor
        </h1>
        <p className="text-xl text-gray-400 mb-8 max-w-md">
          AI-powered monitoring and response management for your Discord servers
        </p>
        
        <div className="space-y-4">
          <button
            onClick={() => signIn('discord')}
            className="btn-primary flex items-center gap-3 text-lg px-6 py-3 mx-auto"
          >
            <FaDiscord size={24} />
            Sign in with Discord
          </button>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 max-w-4xl">
            <div className="card">
              <h3 className="font-semibold mb-2">📊 Smart Summaries</h3>
              <p className="text-sm text-gray-400">
                AI-generated summaries of channel activity with importance scoring
              </p>
            </div>
            <div className="card">
              <h3 className="font-semibold mb-2">💬 Suggested Responses</h3>
              <p className="text-sm text-gray-400">
                Get AI-powered response suggestions you can edit and send
              </p>
            </div>
            <div className="card">
              <h3 className="font-semibold mb-2">⚡ Bulk Actions</h3>
              <p className="text-sm text-gray-400">
                Mark multiple channels as read and manage servers efficiently
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  )
}