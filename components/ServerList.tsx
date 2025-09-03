'use client'

import Image from 'next/image'
import { FaServer, FaTrash, FaCog } from 'react-icons/fa'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface Server {
  id: string
  serverId: string
  serverName: string
  serverIcon?: string
  isActive: boolean
  lastScannedAt?: string
}

interface ServerListProps {
  servers: Server[]
  selectedServer: string | null
  onSelectServer: (serverId: string | null) => void
  onUpdateServers: () => void
}

export default function ServerList({ 
  servers, 
  selectedServer, 
  onSelectServer,
  onUpdateServers 
}: ServerListProps) {
  const [configuring, setConfiguring] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this server from monitoring?')) return
    
    try {
      const res = await fetch(`/api/servers/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Server removed')
        onUpdateServers()
      }
    } catch (error) {
      toast.error('Failed to remove server')
    }
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/servers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      })
      if (res.ok) {
        toast.success(isActive ? 'Server paused' : 'Server activated')
        onUpdateServers()
      }
    } catch (error) {
      toast.error('Failed to update server')
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={() => onSelectServer(null)}
        className={`w-full text-left p-2 rounded hover:bg-discord-darker ${
          !selectedServer ? 'bg-discord-darker' : ''
        }`}
      >
        All Servers
      </button>
      
      {servers.map((server) => (
        <div
          key={server.id}
          className={`group relative p-2 rounded hover:bg-discord-darker cursor-pointer ${
            selectedServer === server.serverId ? 'bg-discord-darker' : ''
          }`}
          onClick={() => onSelectServer(server.serverId)}
        >
          <div className="flex items-center gap-2">
            {server.serverIcon ? (
              <Image
                src={`https://cdn.discordapp.com/icons/${server.serverId}/${server.serverIcon}.png`}
                alt={server.serverName}
                width={24}
                height={24}
                className="rounded-full"
              />
            ) : (
              <FaServer className="text-gray-400" />
            )}
            <span className={`flex-1 text-sm ${!server.isActive ? 'opacity-50' : ''}`}>
              {server.serverName}
            </span>
          </div>
          
          <div className="absolute right-2 top-2 hidden group-hover:flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleActive(server.id, server.isActive)
              }}
              className="p-1 hover:bg-discord-dark rounded text-xs"
            >
              {server.isActive ? '⏸' : '▶'}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setConfiguring(server.id)
              }}
              className="p-1 hover:bg-discord-dark rounded"
            >
              <FaCog size={12} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDelete(server.id)
              }}
              className="p-1 hover:bg-discord-dark rounded text-red-400"
            >
              <FaTrash size={12} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}