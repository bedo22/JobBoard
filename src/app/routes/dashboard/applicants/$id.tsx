// src/app/routes/dashboard/applicants/$id.tsx
import { useParams, Link } from "react-router-dom"
import { supabase } from "@/lib/supabaseClient"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Mail, CheckCircle, XCircle, Clock } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"

type Application = {
  id: string
  seeker_id: string
  cover_letter: string | null
  resume_url: string
  status: 'pending' | 'reviewed' | 'rejected' | 'accepted'
  applied_at: string
  profiles: {
    full_name: string
    email: string
  }
}

export default function ApplicantsPage() {
  const { id } = useParams<{ id: string }>() // jobId
  const { profile } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [jobTitle, setJobTitle] = useState("")
  const [loading, setLoading] = useState(true)

  // Fetch applications + seeker profile + job title
  useEffect(() => {
    async function fetchData() {
      // First get job to verify ownership + get title
      const { data: job } = await supabase
        .from('jobs')
        .select('title, employer_id')
        .eq('id', id)
        .single()

      if (!job || job.employer_id !== profile?.id) {
        toast.error("You don't have permission to view this")
        return
      }
      setJobTitle(job.title)

      // Then get applications with seeker profile
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          seeker_id,
          cover_letter,
          resume_url,
          status,
          applied_at,
          profiles:seeker_id!inner (full_name, email)
        `)
        .eq('job_id', id)
        .order('applied_at', { ascending: false })

      if (error) {
        toast.error("Failed to load applicants")
      } else {
        // Transform the data to match our Application type
        const transformedData = (data || []).map(app => ({
          ...app,
          profiles: Array.isArray(app.profiles) ? app.profiles[0] : app.profiles
        }))
        setApplications(transformedData as Application[])
      }
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
      toast.error("Failed to update status")
    } else {
      setApplications(prev =>
        prev.map(app => app.id === appId ? { ...app, status: newStatus } : app)
      )
      toast.success("Status updated")
    }
  }

  const getStatusBadge = (status: Application['status']) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>
      case 'reviewed': return <Badge className="bg-blue-100 text-blue-800"><CheckCircle className="w-3 h-3 mr-1" /> Reviewed</Badge>
      case 'accepted': return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Accepted</Badge>
      case 'rejected': return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>
    }
  }

  if (loading) {
    return <div className="container py-20 text-center">Loading applicants...</div>
  }

  return (
    <div className="container py-10 max-w-6xl">
      {/* Back + Title */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/dashboard">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Applicants for</h1>
          <p className="text-xl text-primary">{jobTitle}</p>
        </div>
      </div>

      {applications.length === 0 ? (
        <Card className="p-20 text-center">
          <p className="text-xl text-muted-foreground">No applications yet</p>
          <p className="text-sm mt-2">Share your job link to get applicants!</p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {applications.map((app) => (
            <Card key={app.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">{app.profiles.full_name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><Mail className="h-4 w-4" /> {app.profiles.email}</span>
                      <span>Applied {format(new Date(app.applied_at), "dd MMM yyyy")}</span>
                    </div>
                  </div>
                  {getStatusBadge(app.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {app.cover_letter && (
                  <div>
                    <p className="font-medium mb-2">Cover Letter:</p>
                    <p className="text-muted-foreground whitespace-pre-wrap">{app.cover_letter}</p>
                  </div>
                )}

                <div className="flex items-center justify-between flex-wrap gap-4">
                  <Button asChild>
                    <a href={app.resume_url} target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 h-4 w-4" /> Download Resume
                    </a>
                  </Button>

                  <Select
                    value={app.status}
                    onValueChange={(v) => updateStatus(app.id, v as Application['status'])}
                  >
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
          ))}
        </div>
      )}
    </div>
  )
}