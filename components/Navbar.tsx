'use client'

import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import { FaSignOutAlt, FaCog } from 'react-icons/fa'

export default function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="bg-discord-darkest border-b border-gray-700 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-discord-blurple">Discord Monitor</h1>
        </div>
        
        <div className="flex items-center gap-4">
          {session?.user && (
            <>
              <div className="flex items-center gap-2">
                {session.user.image && (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || ''}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                )}
                <span className="text-sm">{session.user.name}</span>
              </div>
              <button className="p-2 hover:bg-discord-darker rounded">
                <FaCog />
              </button>
              <button
                onClick={() => signOut()}
                className="p-2 hover:bg-discord-darker rounded text-red-400"
              >
                <FaSignOutAlt />
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}