'use client'

import { useState } from 'react'
import { FaCopy, FaEdit, FaCheck, FaExternalLinkAlt } from 'react-icons/fa'
import toast from 'react-hot-toast'

interface SuggestedResponsesProps {
  summaryId: string
  channelName: string
  summary: string
  serverId: string
  channelId: string
}

const RESPONSE_TEMPLATES = [
  { type: 'ACKNOWLEDGMENT', label: 'Acknowledge', emoji: '👍' },
  { type: 'QUESTION', label: 'Ask Question', emoji: '❓' },
  { type: 'ANSWER', label: 'Provide Answer', emoji: '💡' },
  { type: 'FOLLOW_UP', label: 'Follow Up', emoji: '🔄' },
]

export default function SuggestedResponses({ 
  summaryId, 
  channelName, 
  summary,
  serverId,
  channelId 
}: SuggestedResponsesProps) {
  const [responses, setResponses] = useState<any[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  const generateResponses = async () => {
    setIsGenerating(true)
    try {
      const res = await fetch('/api/ai/generate-responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summaryId, channelName, summary })
      })
      
      if (res.ok) {
        const data = await res.json()
        setResponses(data.responses)
      } else {
        toast.error('Failed to generate responses')
      }
    } catch (error) {
      toast.error('Error generating responses')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  const startEdit = (id: string, text: string) => {
    setEditingId(id)
    setEditText(text)
  }

  const saveEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/responses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ editedText: editText })
      })
      
      if (res.ok) {
        setResponses(responses.map(r => 
          r.id === id ? { ...r, editedText: editText } : r
        ))
        setEditingId(null)
        toast.success('Response updated')
      }
    } catch (error) {
      toast.error('Failed to save edit')
    }
  }

  const openWithResponse = (text: string) => {
    // Discord doesn't support pre-filled messages via URL, so we copy and open
    copyToClipboard(text)
    window.open(`https://discord.com/channels/${serverId}/${channelId}`, '_blank')
    toast.success('Response copied! Paste it in Discord')
  }

  if (responses.length === 0 && !isGenerating) {
    return (
      <div className="bg-discord-darkest p-4 rounded">
        <p className="text-sm text-gray-400 mb-3">
          Generate AI-powered response suggestions for this channel
        </p>
        <button
          onClick={generateResponses}
          className="btn-primary text-sm"
        >
          Generate Responses
        </button>
      </div>
    )
  }

  if (isGenerating) {
    return (
      <div className="bg-discord-darkest p-4 rounded">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-discord-blurple"></div>
          <span className="text-sm">Generating responses...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-discord-darkest p-4 rounded space-y-3">
      <h4 className="text-sm font-semibold mb-3">Suggested Responses</h4>
      
      {responses.map((response) => {
        const template = RESPONSE_TEMPLATES.find(t => t.type === response.responseType)
        const displayText = response.editedText || response.suggestedText
        
        return (
          <div key={response.id} className="bg-discord-darker p-3 rounded">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs flex items-center gap-1">
                <span>{template?.emoji}</span>
                <span className="text-gray-400">{template?.label}</span>
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => copyToClipboard(displayText)}
                  className="p-1 hover:bg-discord-dark rounded"
                  title="Copy"
                >
                  <FaCopy size={12} />
                </button>
                <button
                  onClick={() => startEdit(response.id, displayText)}
                  className="p-1 hover:bg-discord-dark rounded"
                  title="Edit"
                >
                  <FaEdit size={12} />
                </button>
                <button
                  onClick={() => openWithResponse(displayText)}
                  className="p-1 hover:bg-discord-dark rounded text-discord-blurple"
                  title="Open in Discord"
                >
                  <FaExternalLinkAlt size={12} />
                </button>
              </div>
            </div>
            
            {editingId === response.id ? (
              <div className="space-y-2">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="input w-full text-sm resize-none"
                  rows={3}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => saveEdit(response.id)}
                    className="btn-success text-xs"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="btn-secondary text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-300">{displayText}</p>
            )}
          </div>
        )
      })}
      
      <button
        onClick={generateResponses}
        className="btn-secondary text-xs w-full"
      >
        Regenerate Responses
      </button>
    </div>
  )
}