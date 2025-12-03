// src/app/routes/dashboard/applicants/$id.tsx
import { useParams, Link } from "react-router-dom"
import { supabase } from "@/lib/supabaseClient"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Mail, Clock, CheckCircle, XCircle } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"

// Clean type — treat it as object for simplicity (we'll transform data to match this)
type Application = {
  id: string
  seeker_id: string
  cover_letter: string | null
  resume_url: string
  status: 'pending' | 'reviewed' | 'rejected' | 'accepted'
  applied_at: string
  auth_users: {  // ← Single object (we force this via transformation)
    email: string
    raw_user_meta_data: {
      full_name?: string
      role?: string
    }
  }
}

export default function ApplicantsPage() {
  const { id } = useParams<{ id: string }>()
  const { profile } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [jobTitle, setJobTitle] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      if (!profile?.id) return  // ← Guard: Don't query if profile not loaded

      // 1. Verify job ownership + get title
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select('title, employer_id')
        .eq('id', id)
        .single()

      if (jobError || !job || job.employer_id !== profile.id) {
        toast.error("Access denied or job not found")
        setLoading(false)
        return
      }
      setJobTitle(job.title)

      // 2. Fetch applications with user join
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          seeker_id,
          cover_letter,
          resume_url,
          status,
          applied_at,
          auth_users:seeker_id!inner (
            email,
            raw_user_meta_data
          )
        `)
        .eq('job_id', id)
        .order('applied_at', { ascending: false })

      if (error) {
        console.error("Supabase error:", error)
        toast.error("Failed to load applicants")
        setLoading(false)
        return
      }

      // 3. THE MAGIC TRANSFORMATION (Gemini's fix — handles array vs object)
      // Supabase might return auth_users as array [{}] even for 1:1
      // We flatten it to object {} to match our clean type
      // This is safe: if array, take [0]; if already object, keep it
      const formattedData = (data || []).map(app => ({
        ...app,
        auth_users: Array.isArray(app.auth_users) ? app.auth_users[0] : app.auth_users
      })) as Application[]  // ← Cast to our clean type — TypeScript happy now

      setApplications(formattedData)
      setLoading(false)
    }

    fetchData()
  }, [id, profile])

  const updateStatus = async (appId: string, newStatus: Application['status']) => {
    const { error } = await supabase
      .from('applications')
      .update({ status: newStatus })
      .eq('id', appId)

    if (error) {
      toast.error("Failed to update")
    } else {
      setApplications(prev =>
        prev.map(app => app.id === appId ? { ...app, status: newStatus } : app)
      )
      toast.success("Status updated")
    }
  }

  // Clean Record for badges (better than switch — as we discussed)
  const getStatusBadge = (status: Application['status']) => {
    const map: Record<Application['status'], React.ReactNode> = {
      pending: <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>,
      reviewed: <Badge className="bg-blue-100 text-blue-800"><CheckCircle className="w-3 h-3 mr-1" /> Reviewed</Badge>,
      accepted: <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Accepted</Badge>,
      rejected: <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>,
    }
    return map[status]
  }

  if (loading) return <div className="container py-20 text-center">Loading applicants...</div>

  return (
    <div className="container py-10 max-w-6xl">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/dashboard">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Applicants for</h1>
          <p className="text-xl text-primary font-semibold">{jobTitle}</p>
        </div>
      </div>

      {applications.length === 0 ? (
        <Card className="p-20 text-center">
          <p className="text-xl text-muted-foreground">No applications yet</p>
          <p className="text-sm mt-2">Share your job link to start receiving CVs!</p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {applications.map((app) => {
            // ← CLEAN JSX: No [0] here — we handled it in transformation
            const user = app.auth_users
            const fullName = user.raw_user_meta_data?.full_name || "Unknown User"
            const email = user.email

            return (
              <Card key={app.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold">{fullName}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="h-4 w-4" /> {email}
                        </span>
                        <span>Applied {format(new Date(app.applied_at), "dd MMM yyyy")}</span>
                      </div>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {app.cover_letter && (
                    <div>
                      <p className="font-medium mb-2">Cover Letter:</p>
                      <p className="text-muted-foreground whitespace-pre-wrap text-sm">
                        {app.cover_letter}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <Button asChild>
                      <a href={app.resume_url} target="_blank" rel="noopener noreferrer">
                        <Download className="mr-2 h-4 w-4" /> Download Resume
                      </a>
                    </Button>

                    <Select value={app.status} onValueChange={(v) => updateStatus(app.id, v as Application['status'])}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}