

'use client'

import { createClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Header({ user }: { user: User }) {
  const router = useRouter()
  const supabase = createClient()
  const [signingOut, setSigningOut] = useState(false)

  const signOut = async () => {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <header className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50 animate-slideDown">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="text-3xl group-hover:scale-110 transition-transform">🔖</div>
            <div>
              <h1 className="font-bold text-lg gradient-text">Smart Bookmarks</h1>
              <p className="text-xs text-gray-500">Your personal collection</p>
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
              {user.user_metadata?.avatar_url && (
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt={user.user_metadata?.name || 'User'} 
                  className="w-8 h-8 rounded-lg border-2 border-blue-500/50"
                />
              )}
              <div className="text-left">
                <p className="text-sm font-semibold text-white truncate max-w-[150px]">
                  {user.user_metadata?.name || user.email?.split('@')[0]}
                </p>
                <p className="text-xs text-gray-500 truncate max-w-[150px]">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Mobile User Avatar */}
            {user.user_metadata?.avatar_url && (
              <div className="md:hidden w-10 h-10 rounded-lg border-2 border-blue-500/50 overflow-hidden">
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt={user.user_metadata?.name || 'User'} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* Sign Out Button */}
            <button
              onClick={signOut}
              disabled={signingOut}
              className="px-4 py-2 text-sm font-medium border border-white/10 rounded-xl hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
            >
              {signingOut ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="hidden sm:inline">Signing Out...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="hidden sm:inline">Sign Out</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}