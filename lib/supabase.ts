// import { createBrowserClient } from '@supabase/ssr'

// export function createClient() {
//   return createBrowserClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       realtime: {
//         params: {
//           eventsPerSecond: 10,
//         },
//       },
//       auth: {
//         persistSession: true,
//         autoRefreshToken: true,
//       },
//     }
//   )
// }

// export type Bookmark = {
//   id: string
//   user_id: string
//   title: string
//   url: string
//   created_at: string
// }

import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return client
}

export type Bookmark = {
  id: string
  user_id: string
  title: string
  url: string
  created_at: string
}
