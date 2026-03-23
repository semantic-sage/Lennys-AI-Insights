const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabaseReady =
  !!SUPABASE_URL &&
  !!SUPABASE_KEY &&
  !SUPABASE_URL.includes('your-project-id') &&
  !SUPABASE_URL.includes('placeholder')

// Return immediately if not configured — never make a network call
async function supaFetch(path: string, method: 'GET' | 'POST', body?: object): Promise<unknown> {
  if (!supabaseReady) return null

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 2000) // 2s hard timeout

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      method,
      signal: controller.signal,
      headers: {
        apikey: SUPABASE_KEY!,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: method === 'POST' ? 'return=minimal' : 'return=representation',
      },
      body: body ? JSON.stringify(body) : undefined,
    })
    clearTimeout(timer)
    if (!res.ok) return null
    return method === 'GET' ? res.json() : null
  } catch {
    clearTimeout(timer)
    return null
  }
}

export async function insertEvent(row: object) {
  return supaFetch('events', 'POST', row)
}

export async function queryEvents(params: string) {
  return supaFetch(`events?${params}`, 'GET') as Promise<EventRow[] | null>
}

export interface EventRow {
  id: number
  created_at: string
  event_type: string
  episode_id: number | null
  hero_mode: string | null
  session_id: string
  time_on_page: number | null
}
