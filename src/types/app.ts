
import type { Database } from "@/types/supabase"

export type Job = Database['public']['Tables']['jobs']['Row']
export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship'
export type LocationType = 'onsite' | 'remote' | 'hybrid'
