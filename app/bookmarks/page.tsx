


'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import BookmarkList from '@/components/BookmarkList'
import AddBookmark from '@/components/AddBookmark'
import Header from '@/components/Header'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

export default function BookmarksPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
      
      if (!user) {
        router.push('/')
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
  (_event: AuthChangeEvent, session: Session | null) => {
    setUser(session?.user ?? null)

    if (!session?.user) {
      router.push('/')
    }
  }
)

    return () => subscription.unsubscribe()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5">
        <div className="text-center">
          <div className="relative inline-block mb-4">
            <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-blue-400/10 rounded-full animate-ping"></div>
          </div>
          <p className="text-gray-500">Loading your bookmarks...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5">
      <Header user={user} />
      
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="mb-12 animate-fadeIn">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">📚</div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
                Your <span className="gradient-text">Collection</span>
              </h1>
              <p className="text-gray-400 text-lg">
                Manage and organize your favorite links
              </p>
            </div>
          </div>
        </div>

        {/* Add Bookmark Form */}
        <AddBookmark userId={user.id} />

        {/* Bookmarks List */}
        <BookmarkList userId={user.id} />
      </main>

      
    </div>
  )
}
