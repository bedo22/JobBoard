// src/app/routes/jobs/index.tsx
import { useState, useEffect, useRef } from "react"
import { JobCard } from "@/components/job-card"
import { JobFilters } from "@/components/job-filters"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useJobs } from "@/hooks/use-jobs"
import type { JobType } from "@/types/app" // لو عملت ملف types/app.ts، لو لأ خليها string[]

export default function JobsPage() {
  const [filters, setFilters] = useState({
    search: "",
    location: "",
    type: [] as JobType[],
    remote: false,
    hybrid: false,
  })

  const { jobs, loading, hasMore, loadMore } = useJobs(filters)

  // Infinite scroll
   const observer = useRef<IntersectionObserver | null>(null)
  const lastJobRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (loading) return

    if (observer.current) observer.current.disconnect()

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        loadMore()
      }
    })

    if (lastJobRef.current) observer.current.observe(lastJobRef.current)
  }, [loading, hasMore, loadMore])

  return (
    <div className="container py-10">
      <div className="flex flex-col lg:flex-row gap-8">

        <JobFilters onChange={setFilters} />

        <div className="flex-1">
          <div className="mb-8">
            <h1 className="text-4xl font-bold">All Jobs</h1>
            <p className="text-muted-foreground mt-2">
              {jobs.length} {jobs.length === 1 ? "job" : "jobs"} found
            </p>
          </div>

          <div className="space-y-6">
            {jobs.map((job, index) => (
              <div
                key={job.id}
                ref={index === jobs.length - 1 ? lastJobRef : null}
              >
                <JobCard job={job} />
              </div>
            ))}
          </div>

          {/* Loading skeletons */}
          {loading && (
            <div className="space-y-6 mt-6">
              {Array.from({length: 5}).map((_, i) => (
                <Skeleton key={i} className="h-56 w-full rounded-xl" />
              ))}
            </div>
          )}

          
          {hasMore && !loading && (
            <div className="text-center mt-10">
              <Button onClick={loadMore} size="lg">
                Load more jobs
              </Button>
            </div>
          )}

          {/* No jobs */}
          {!loading && jobs.length === 0 && (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground">
                No jobs found matching your criteria.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setFilters({
                  search: "",
                  location: "",
                  type: [],
                  remote: false,
                  hybrid: false,
                })}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}