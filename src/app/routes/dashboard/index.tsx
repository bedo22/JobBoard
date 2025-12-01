// src/app/routes/dashboard/index.tsx
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabaseClient"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Link } from "react-router-dom"

export default function DashboardPage() {
  const { profile, isEmployer } = useAuth()
  const [myJobs, setMyJobs] = useState<any[]>([])

  useEffect(() => {
    if (isEmployer) {
      supabase
        .from('jobs')
        .select('*')
        .eq('employer_id', profile?.id)
        .then(({ data }) => setMyJobs(data || []))
    }
  }, [isEmployer, profile])

  if (!isEmployer) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-3xl font-bold">Only employers can access dashboard</h1>
        <Link to="/jobs"><Button className="mt-4">Browse Jobs</Button></Link>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Employer Dashboard</h1>
      <Link to="/jobs/post">
        <Button size="lg" className="mb-8">Post New Job</Button>
      </Link>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {myJobs.length === 0 ? (
          <Card className="p-10 text-center">
            <p className="text-muted-foreground">You haven't posted any jobs yet</p>
          </Card>
        ) : (
          myJobs.map(job => (
            <Card key={job.id} className="p-6">
              <h3 className="font-semibold text-lg">{job.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">{job.company_name}</p>
              <div className="mt-6 flex gap-3">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/jobs/${job.id}`}>View Job</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to={`/dashboard/applicants/${job.id}`}>View Applicants →</Link>
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}