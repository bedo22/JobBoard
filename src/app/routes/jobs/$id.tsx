// src/app/routes/jobs/$id.tsx
import { useParams, Link } from "react-router-dom"
import { supabase } from "@/lib/supabaseClient"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, MapPin, Clock, DollarSign, Briefcase, CheckCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { ApplyDialog } from "@/components/apply-dialog" // we'll create this next
import { formatDistanceToNow } from "date-fns"
import ReactMarkdown from 'react-markdown'
import type { Job } from "@/types/app"

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [alreadyApplied, setAlreadyApplied] = useState(false)
  const { user } = useAuth()

  // Fetch job details
  useEffect(() => {
    async function fetchJob() {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error("Error fetching job:", error)
      } else {
        setJob(data)
      }
      setLoading(false)
    }

    // Check if current user already applied
    if (user) {
      supabase
        .from('applications')
        .select('id')
        .eq('job_id', id)
        .eq('seeker_id', user.id)
        .maybeSingle()
        .then(({ data }) => setAlreadyApplied(!!data))
    }

    fetchJob()
  }, [id, user])

  if (loading) {
    return (
      <div className="container py-10">
        <Skeleton className="h-12 w-64 mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Job not found</h1>
        <Link to="/jobs">
          <Button>← Back to Jobs</Button>
        </Link>
      </div>
    )
  }

  const salary = job.salary_min && job.salary_max
    ? `${job.salary_min.toLocaleString()}–${job.salary_max.toLocaleString()} EGP`
    : job.salary_min
      ? `${job.salary_min.toLocaleString()} EGP+`
      : 'Competitive salary'

  const postedTime = formatDistanceToNow(new Date(job.created_at!), { addSuffix: true })

  return (
    <div className="container py-10 max-w-5xl">
      {/* Back button */}
      <Link to="/jobs" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="h-5 w-5" /> Back to jobs
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Job Header */}
          <div>
            <h1 className="text-4xl font-bold mb-4">{job.title}</h1>
            <div className="flex items-center gap-4 flex-wrap">
              <p className="text-2xl font-semibold text-primary">{job.company_name}</p>
              <div className="flex gap-2">
                <Badge variant="secondary" className="capitalize">{job.type?.replace('-', ' ')}</Badge>
                {job.location_type === 'remote' && <Badge className="bg-green-100 text-green-800">Remote</Badge>}
                {job.location_type === 'hybrid' && <Badge className="bg-blue-100 text-blue-800">Hybrid</Badge>}
              </div>
            </div>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">
                  {job.location_type === 'remote' ? 'Remote' : job.location_type === 'hybrid' ? 'Hybrid' : job.location || 'On-site'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Salary</p>
                <p className="font-medium">{salary}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Posted</p>
                <p className="font-medium">{postedTime}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-medium capitalize">{job.type}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <ReactMarkdown>{job.description}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>

          {/* Requirements & Benefits */}
          {job.requirements && job.requirements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {job.benefits && job.benefits.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.benefits.map((ben, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <span>{ben}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Apply Button */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="pt-6">
              {alreadyApplied ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <p className="text-lg font-semibold">You have already applied!</p>
                </div>
              ) : (
                <ApplyDialog job={job} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}