'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaTimes, FaServer } from 'react-icons/fa'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface AddServerModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function AddServerModal({ onClose, onSuccess }: AddServerModalProps) {
  const [availableServers, setAvailableServers] = useState<any[]>([])
  const [selectedServer, setSelectedServer] = useState<string | null>(null)
  const [config, setConfig] = useState({
    scanAllChannels: true,
    ignoredChannels: [] as string[]
  })
  const [channels, setChannels] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAvailableServers()
  }, [])

  useEffect(() => {
    if (selectedServer) {
      fetchChannels(selectedServer)
    }
  }, [selectedServer])

  const fetchAvailableServers = async () => {
    try {
      const res = await fetch('/api/discord/available-servers')
      const data = await res.json()
      setAvailableServers(data)
    } catch (error) {
      toast.error('Failed to fetch servers')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchChannels = async (serverId: string) => {
    try {
      const res = await fetch(`/api/discord/server/${serverId}/channels`)
      const data = await res.json()
      setChannels(data)
    } catch (error) {
      toast.error('Failed to fetch channels')
    }
  }

  const handleSubmit = async () => {
    if (!selectedServer) {
      toast.error('Please select a server')
      return
    }

    const server = availableServers.find(s => s.id === selectedServer)
    
    try {
      const res = await fetch('/api/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serverId: selectedServer,
          serverName: server.name,
          serverIcon: server.icon,
          ...config
        })
      })

      if (res.ok) {
        toast.success('Server added successfully')
        onSuccess()
      } else {
        toast.error('Failed to add server')
      }
    } catch (error) {
      toast.error('Error adding server')
    }
  }

  const toggleChannel = (channelId: string) => {
    setConfig(prev => ({
      ...prev,
      ignoredChannels: prev.ignoredChannels.includes(channelId)
        ? prev.ignoredChannels.filter(id => id !== channelId)
        : [...prev.ignoredChannels, channelId]
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-discord-darker rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Add Server to Monitor</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-discord-dark rounded"
          >
            <FaTimes />
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-discord-blurple mx-auto"></div>
          </div>
        ) : (
          <>
            {/* Server Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Select a Server
              </label>
              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                {availableServers.map((server) => (
                  <button
                    key={server.id}
                    onClick={() => setSelectedServer(server.id)}
                    className={`flex items-center gap-3 p-3 rounded border ${
                      selectedServer === server.id
                        ? 'border-discord-blurple bg-discord-blurple/20'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    {server.icon ? (
                      <Image
                        src={`https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png`}
                        alt={server.name}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <FaServer className="text-gray-400" size={32} />
                    )}
                    <span className="text-sm truncate">{server.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Channel Configuration */}
            {selectedServer && channels.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">
                    Channel Settings
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.scanAllChannels}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        scanAllChannels: e.target.checked
                      }))}
                      className="rounded"
                    />
                    <span className="text-sm">Scan all channels</span>
                  </label>
                </div>
                
                {!config.scanAllChannels && (
                  <div className="bg-discord-darkest p-3 rounded max-h-48 overflow-y-auto">
                    <p className="text-xs text-gray-400 mb-2">
                      Select channels to ignore:
                    </p>
                    <div className="space-y-1">
                      {channels.map((channel) => (
                        <label
                          key={channel.id}
                          className="flex items-center gap-2 p-1 hover:bg-discord-darker rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={config.ignoredChannels.includes(channel.id)}
                            onChange={() => toggleChannel(channel.id)}
                            className="rounded"
                          />
                          <span className="text-sm">#{channel.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedServer}
                className="btn-primary"
              >
                Add Server
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}