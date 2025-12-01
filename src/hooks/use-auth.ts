// src/hooks/use-auth.ts
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { Session, User } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']

type AuthState = {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
  })

  useEffect(() => {
    // Initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
      }))
      if (session?.user) fetchProfile(session.user.id)
      else setState(prev => ({ ...prev, loading: false }))
    })

    // Listen to changes
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        profile: null,
      }))
      if (session?.user) fetchProfile(session.user.id)
      else setState(prev => ({ ...prev, loading: false }))
    })

    const fetchProfile = async (userId: string) => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      setState(prev => ({
        ...prev,
        profile: data,
        loading: false,
      }))
    }

    return () => listener.subscription.unsubscribe()
  }, [])

  const signOut = () => supabase.auth.signOut()

  return {
    ...state,
    signOut,
    isEmployer: state.profile?.role === 'employer',
    isSeeker: !state.profile || state.profile?.role === 'seeker',
  }
}