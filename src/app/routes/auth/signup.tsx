// src/app/routes/auth/signup.tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "sonner"
import { Link, useNavigate } from "react-router-dom"

const schema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["seeker", "employer"]),
})

export default function SignupPage() {
  const { register, handleSubmit, watch, setValue } = useForm({ resolver: zodResolver(schema) })
  const navigate = useNavigate()
  const role = watch("role") || "seeker"

  const onSubmit = async (data: any) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.full_name, role: data.role }
      }
    })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success("Account created! Check your email to confirm.")
      navigate("/login")
    }
  }

  return (
    <div className="container py-10 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Create Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input {...register("full_name")} placeholder="Full Name" />
            <Input {...register("email")} type="email" placeholder="Email" />
            <Input {...register("password")} type="password" placeholder="Password" />

            <div>
              <Label>I am a...</Label>
              <RadioGroup defaultValue="seeker" onValueChange={(v) => setValue("role", v as "employer" | "seeker")}>  
                <div className="flex items-center space-x-2 mt-2">
                  <RadioGroupItem value="seeker" id="seeker" />
                  <Label htmlFor="seeker">Job Seeker</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="employer" id="employer" />
                  <Label htmlFor="employer">Employer / Company</Label>
                </div>
              </RadioGroup>
            </div>

            <Button type="submit" className="w-full">Sign Up</Button>
          </form>
          <p className="text-center mt-4 text-sm">
            Already have an account? <Link to="/login" className="text-primary hover:underline">Login</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}