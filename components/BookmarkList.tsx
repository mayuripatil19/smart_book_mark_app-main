


'use client'

import { useEffect, useState } from 'react'
import { createClient, Bookmark } from '@/lib/supabase'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'





export default function BookmarkList({ userId }: { userId: string }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [realtimeStatus, setRealtimeStatus] = useState<string>('Connecting...')
  const supabase = createClient()

  useEffect(() => {
    let mounted = true

    // Fetch initial bookmarks
    const fetchBookmarks = async () => {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching bookmarks:', error)
      } else if (mounted) {
        setBookmarks(data || [])
      }
      if (mounted) {
        setLoading(false)
      }
    }

    fetchBookmarks()

    // Set up real-time subscription with timeout handling
    console.log('🔌 Setting up realtime channel for user:', userId)
    
    const channel = supabase
      .channel('public:bookmarks')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<Bookmark>) => {
          console.log('✅ INSERT event received:', payload.new)
          if (mounted) {
            setBookmarks((current) => [payload.new as Bookmark, ...current])
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<Bookmark>) => {
           const oldBookmark = payload.old as Bookmark

       console.log('🗑️ DELETE event received:', oldBookmark)

  if (mounted) {
    setBookmarks((current) => {
      const filtered = current.filter(
        (bookmark) => bookmark.id !== oldBookmark.id
      )
      return filtered
    })
  }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<Bookmark>) => {
           const newBookmark = payload.new as Bookmark

  console.log('📝 UPDATE event received:', newBookmark)

  if (mounted) {
    setBookmarks((current) =>
      current.map((bookmark) =>
        bookmark.id === newBookmark.id ? newBookmark : bookmark
      )
    )
  }
        }
      )
      .subscribe(async (status: 'SUBSCRIBED' | 'TIMED_OUT' | 'CLOSED' | 'CHANNEL_ERROR') => {
        console.log('📡 Channel status changed:', status)
        if (mounted) {
          setRealtimeStatus(status)
        }
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime connected successfully!')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Channel error - check RLS policies')
        } else if (status === 'TIMED_OUT') {
          console.error('⏱️ Connection timed out - retrying...')
          // Auto-retry after timeout
          setTimeout(() => {
            if (mounted) {
              channel.subscribe()
            }
          }, 5000)
        } else if (status === 'CLOSED') {
          console.log('🔌 Channel closed')
        }
      })

    return () => {
      mounted = false
      console.log('🧹 Cleaning up realtime subscription')
      channel.unsubscribe()
    }
  }, [userId, supabase])

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    
    // Optimistic update - remove from UI immediately
    const oldBookmarks = [...bookmarks]
    setBookmarks((current) => current.filter((bookmark) => bookmark.id !== id))
    
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting bookmark:', error)
      alert('Failed to delete bookmark. Please try again.')
      // Restore bookmarks on error
      setBookmarks(oldBookmarks)
    }
    
    setDeletingId(null)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    })
  }

  const getDomain = (url: string) => {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname.replace('www.', '')
    } catch {
      return url
    }
  }

  const getFavicon = (url: string) => {
    try {
      const urlObj = new URL(url)
      return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`
    } catch {
      return null
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-blue-400/10 rounded-full animate-ping"></div>
        </div>
        <p className="mt-4 text-gray-500 text-sm">Loading your bookmarks...</p>
      </div>
    )
  }

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-20 animate-fadeIn">
        <div className="inline-block p-8 rounded-3xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 mb-6">
          <div className="text-7xl">📭</div>
        </div>
        <h3 className="text-2xl font-bold mb-3">No bookmarks yet</h3>
        <p className="text-gray-400 max-w-md mx-auto">
          Start building your collection by adding your first bookmark above!
        </p>
        
        {/* Debug info */}
        
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-400">
          {bookmarks.length} {bookmarks.length === 1 ? 'Bookmark' : 'Bookmarks'}
        </h2>
        
       
      </div>

      {bookmarks.map((bookmark, index) => (
        <div
          key={bookmark.id}
          className="group relative bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-blue-500/50 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/10 animate-slideUp"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-start gap-4">
            {/* Favicon */}
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden group-hover:border-blue-500/50 transition-colors">
              {getFavicon(bookmark.url) ? (
                <img 
                  src={getFavicon(bookmark.url)!} 
                  alt="" 
                  className="w-6 h-6"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    const parent = e.currentTarget.parentElement
                    if (parent) parent.innerHTML = '🔖'
                  }}
                />
              ) : (
                <span className="text-xl">🔖</span>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block group/link"
              >
                <h3 className="text-lg font-semibold mb-2 group-hover/link:text-blue-400 transition-colors line-clamp-2">
                  {bookmark.title}
                </h3>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span className="font-mono truncate group-hover/link:text-blue-500 transition-colors">
                    {getDomain(bookmark.url)}
                  </span>
                  <span className="text-gray-700">•</span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatDate(bookmark.created_at)}
                  </span>
                </div>
              </a>
            </div>

            {/* Delete Button */}
            <button
              onClick={() => handleDelete(bookmark.id)}
              disabled={deletingId === bookmark.id}
              className="cursor-pointer flex-shrink-0 px-4 py-2 text-sm font-medium border border-white/10 rounded-lg hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Delete bookmark"
            >
              {deletingId === bookmark.id ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
