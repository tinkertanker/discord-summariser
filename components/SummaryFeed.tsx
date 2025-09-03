'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaExternalLinkAlt, FaCheckCircle, FaReply, FaChevronDown } from 'react-icons/fa'
import toast from 'react-hot-toast'
import SuggestedResponses from './SuggestedResponses'

interface Summary {
  id: string
  serverId: string
  serverName: string
  channelId: string
  channelName: string
  summary: string
  importance: number
  topics: string[]
  messageCount: number
  hasThreads: boolean
  isRead: boolean
  lastActivityAt: string
}

interface SummaryFeedProps {
  summaries: Summary[]
  onUpdate: () => void
}

export default function SummaryFeed({ summaries, onUpdate }: SummaryFeedProps) {
  const [expandedSummary, setExpandedSummary] = useState<string | null>(null)
  const [showingResponses, setShowingResponses] = useState<string | null>(null)

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch('/api/summaries/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summaryIds: [id] })
      })
      if (res.ok) {
        toast.success('Marked as read')
        onUpdate()
      }
    } catch (error) {
      toast.error('Failed to mark as read')
    }
  }

  const openInDiscord = (serverId: string, channelId: string) => {
    window.open(`https://discord.com/channels/${serverId}/${channelId}`, '_blank')
  }

  const getImportanceColor = (importance: number) => {
    if (importance >= 8) return 'border-red-500 bg-red-500/10'
    if (importance >= 6) return 'border-yellow-500 bg-yellow-500/10'
    if (importance >= 4) return 'border-green-500 bg-green-500/10'
    return 'border-gray-600'
  }

  const getImportanceLabel = (importance: number) => {
    if (importance >= 8) return { text: 'High Priority', color: 'text-red-400' }
    if (importance >= 6) return { text: 'Medium Priority', color: 'text-yellow-400' }
    if (importance >= 4) return { text: 'Low Priority', color: 'text-green-400' }
    return { text: 'FYI', color: 'text-gray-400' }
  }

  if (summaries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No summaries available</p>
        <p className="text-sm text-gray-500 mt-2">
          Add servers and run a scan to see channel summaries
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {summaries.map((summary) => {
          const importanceLabel = getImportanceLabel(summary.importance)
          
          return (
            <motion.div
              key={summary.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`card border-l-4 ${getImportanceColor(summary.importance)} ${
                summary.isRead ? 'opacity-60' : ''
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-500">
                      {summary.serverName}
                    </span>
                    <span className="text-xs text-gray-600">•</span>
                    <span className="font-semibold">
                      #{summary.channelName}
                    </span>
                    {!summary.isRead && (
                      <span className="bg-discord-blurple text-xs px-2 py-0.5 rounded">
                        NEW
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className={importanceLabel.color}>
                      {importanceLabel.text}
                    </span>
                    <span>{summary.messageCount} messages</span>
                    {summary.hasThreads && <span>Has threads</span>}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => markAsRead(summary.id)}
                    className="p-2 hover:bg-discord-darker rounded"
                    title="Mark as read"
                  >
                    <FaCheckCircle className={summary.isRead ? 'text-green-500' : 'text-gray-400'} />
                  </button>
                  <button
                    onClick={() => openInDiscord(summary.serverId, summary.channelId)}
                    className="p-2 hover:bg-discord-darker rounded"
                    title="Open in Discord"
                  >
                    <FaExternalLinkAlt className="text-discord-blurple" />
                  </button>
                </div>
              </div>

              {/* Summary Content */}
              <div className="mb-3">
                <p className="text-gray-300">{summary.summary}</p>
              </div>

              {/* Topics */}
              {summary.topics.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {summary.topics.map((topic, i) => (
                    <span
                      key={i}
                      className="text-xs bg-discord-darker px-2 py-1 rounded"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              )}

              {/* Response Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-gray-700">
                <button
                  onClick={() => setShowingResponses(
                    showingResponses === summary.id ? null : summary.id
                  )}
                  className="btn-secondary text-sm flex items-center gap-2"
                >
                  <FaReply /> 
                  Generate Response
                  <FaChevronDown 
                    className={`transition-transform ${
                      showingResponses === summary.id ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
              </div>

              {/* Suggested Responses */}
              {showingResponses === summary.id && (
                <div className="mt-4">
                  <SuggestedResponses
                    summaryId={summary.id}
                    channelName={summary.channelName}
                    summary={summary.summary}
                    serverId={summary.serverId}
                    channelId={summary.channelId}
                  />
                </div>
              )}
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}