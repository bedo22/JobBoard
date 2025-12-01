// src/app/routes/jobs/post.tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

const jobSchema = z.object({
  title: z.string().min(3),
  company_name: z.string().min(2),
  location: z.string().optional(),
  type: z.enum(["full-time", "part-time", "contract", "internship"]),
  location_type: z.enum(["onsite", "remote", "hybrid"]),
  salary_min: z.number().optional(),
  salary_max: z.number().optional(),
  description: z.string().min(50),
  requirements: z.string(),
  benefits: z.string().optional(),
})

type JobForm = z.infer<typeof jobSchema>

export default function PostJobPage() {
  const { profile, isEmployer } = useAuth()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<JobForm>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      company_name: profile?.company_name || "",
      location_type: "onsite",
      type: "full-time",
    }
  })

  // Redirect if not employer
  if (!isEmployer) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Only employers can post jobs</h1>
        <Button onClick={() => navigate("/jobs")}>Browse Jobs</Button>
      </div>
    )
  }

  const onSubmit = async (data: JobForm) => {
    const { error } = await supabase.from('jobs').insert({
      ...data,
      employer_id: profile!.id,
      requirements: data.requirements.split('\n').filter(r => r.trim()),
      benefits: data.benefits?.split('\n').filter(b => b.trim()) || [],
    })

    if (error) {
      toast.error("Failed to post job")
    } else {
      toast.success("Job posted successfully!")
      navigate("/jobs")
    }
  }

  return (
    <div className="container py-10 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Post a New Job</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label>Job Title</Label>
              <Input {...register("title")} placeholder="Senior React Developer" />
              {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
            </div>

            <div>
              <Label>Company Name</Label>
              <Input {...register("company_name")} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Job Type</Label>
                <Select onValueChange={(v) => setValue("type", v as any)} defaultValue="full-time">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Location Type</Label>
                <Select onValueChange={(v) => setValue("location_type", v as any)} defaultValue="onsite">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="onsite">On-site</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Location (for on-site/hybrid)</Label>
              <Input {...register("location")} placeholder="Cairo, Egypt" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Min Salary (EGP)</Label>
                <Input type="number" {...register("salary_min", { valueAsNumber: true })} />
              </div>
              <div>
                <Label>Max Salary (EGP)</Label>
                <Input type="number" {...register("salary_max", { valueAsNumber: true })} />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea {...register("description")} rows={8} />
            </div>

            <div>
              <Label>Requirements (one per line)</Label>
              <Textarea {...register("requirements")} rows={6} placeholder="3+ years React experience&#10;Strong TypeScript skills" />
            </div>

            <Button type="submit" size="lg" className="w-full">
              Post Job
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}