// src/app/routes/index.tsx
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { ArrowRight, Briefcase, Users, CheckCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export default function Index() {
  const { user, isEmployer } = useAuth()

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-24">
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
              Find Your Dream Job <span className="text-primary">Today</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10">
              Join thousands of professionals who found their perfect role through JobBoard.
              New jobs posted every minute.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/jobs">
                <Button size="lg" className="text-lg px-8">
                  Browse Jobs <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              {user || isEmployer ? (
                <Link to="/jobs/post">
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    <Briefcase className="mr-2 h-5 w-5" /> Post a Job
                  </Button>
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-10">
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">10,000+ Jobs</h3>
              <p className="text-muted-foreground">Fresh opportunities daily</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Trusted by 500+ Companies</h3>
              <p className="text-muted-foreground">From startups to enterprises</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Applications</h3>
              <p className="text-muted-foreground">Apply in less than 60 seconds</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}