'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaPlus, FaSync, FaFilter, FaCheckCircle } from 'react-icons/fa'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import ServerList from '@/components/ServerList'
import SummaryFeed from '@/components/SummaryFeed'
import AddServerModal from '@/components/AddServerModal'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const [servers, setServers] = useState([])
  const [summaries, setSummaries] = useState([])
  const [selectedServer, setSelectedServer] = useState<string | null>(null)
  const [showAddServer, setShowAddServer] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread' | 'important'>('unread')

  useEffect(() => {
    if (session) {
      fetchServers()
      fetchSummaries()
    }
  }, [session])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-discord-blurple"></div>
      </div>
    )
  }

  if (!session) {
    redirect('/')
  }

  const fetchServers = async () => {
    try {
      const res = await fetch('/api/servers')
      const data = await res.json()
      setServers(data)
    } catch (error) {
      toast.error('Failed to fetch servers')
    }
  }

  const fetchSummaries = async () => {
    try {
      const res = await fetch('/api/summaries')
      const data = await res.json()
      setSummaries(data)
    } catch (error) {
      toast.error('Failed to fetch summaries')
    }
  }

  const handleScan = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/scan', { method: 'POST' })
      if (res.ok) {
        toast.success('Scan completed successfully')
        await fetchSummaries()
      } else {
        toast.error('Scan failed')
      }
    } catch (error) {
      toast.error('Failed to start scan')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/api/summaries/mark-read', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true })
      })
      if (res.ok) {
        toast.success('All marked as read')
        await fetchSummaries()
      }
    } catch (error) {
      toast.error('Failed to mark as read')
    }
  }

  const filteredSummaries = summaries.filter(summary => {
    if (selectedServer && summary.serverId !== selectedServer) return false
    if (filter === 'unread') return !summary.isRead
    if (filter === 'important') return summary.importance >= 7
    return true
  })

  return (
    <div className="min-h-screen bg-discord-dark">
      <Navbar />
      
      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <div className="w-64 bg-discord-darkest p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Servers</h2>
            <button
              onClick={() => setShowAddServer(true)}
              className="p-2 hover:bg-discord-darker rounded"
            >
              <FaPlus />
            </button>
          </div>
          <ServerList
            servers={servers}
            selectedServer={selectedServer}
            onSelectServer={setSelectedServer}
            onUpdateServers={fetchServers}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Header Actions */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold">Channel Summaries</h1>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-discord-blurple' : 'bg-discord-darker'}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter('unread')}
                    className={`px-3 py-1 rounded ${filter === 'unread' ? 'bg-discord-blurple' : 'bg-discord-darker'}`}
                  >
                    Unread
                  </button>
                  <button
                    onClick={() => setFilter('important')}
                    className={`px-3 py-1 rounded ${filter === 'important' ? 'bg-discord-blurple' : 'bg-discord-darker'}`}
                  >
                    Important
                  </button>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleMarkAllRead}
                  className="btn-secondary flex items-center gap-2"
                >
                  <FaCheckCircle /> Mark All Read
                </button>
                <button
                  onClick={handleScan}
                  disabled={isLoading}
                  className="btn-primary flex items-center gap-2"
                >
                  <FaSync className={isLoading ? 'animate-spin' : ''} />
                  Scan Now
                </button>
              </div>
            </div>

            {/* Summary Feed */}
            <SummaryFeed
              summaries={filteredSummaries}
              onUpdate={fetchSummaries}
            />
          </div>
        </div>
      </div>

      {/* Add Server Modal */}
      {showAddServer && (
        <AddServerModal
          onClose={() => setShowAddServer(false)}
          onSuccess={() => {
            setShowAddServer(false)
            fetchServers()
          }}
        />
      )}
    </div>
  )
}