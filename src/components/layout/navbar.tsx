// src/components/layout/navbar.tsx
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Briefcase, LogOut, LayoutDashboard } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export function Navbar() {
  const { user, signOut, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await signOut()
    toast.success("Logged out successfully")
    navigate("/")
  }

  const navLinks = [
    { name: "Find Jobs", path: "/jobs" },
    { name: "Pricing", path: "/pricing" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <Briefcase className="h-8 w-8 text-primary" />
          <span className="hidden sm:inline">JobBoard</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === link.path ? "text-primary" : "text-muted-foreground"
                }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Auth Buttons / Mobile Menu */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle - Always visible */}
          <ThemeToggle />

          {!loading && (
            <>
              {user ? (
                <>
                  {/* Desktop */}
                  <div className="hidden md:flex items-center gap-3">
                    <Link to="/dashboard">
                      <Button variant="outline" size="sm">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={handleLogout}>
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Mobile */}
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu className="h-6 w-6" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right">
                      <div className="flex flex-col gap-6 mt-8">
                        <Link to="/dashboard" className="text-lg font-medium">
                          Dashboard
                        </Link>
                        <Button variant="outline" onClick={handleLogout} className="w-full">
                          <LogOut className="h-4 w-4 mr-2" /> Logout
                        </Button>
                      </div>
                    </SheetContent>
                  </Sheet>
                </>
              ) : (
                <>
                  <div className="hidden md:flex items-center gap-3">
                    <Link to="/login"><Button variant="ghost">Login</Button></Link>
                    <Link to="/signup"><Button>Sign Up</Button></Link>
                  </div>

                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu className="h-6 w-6" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right">
                      <div className="flex flex-col gap-6 mt-8">
                        <Link to="/login" className="text-lg font-medium">Login</Link>
                        <Link to="/signup"><Button className="w-full">Sign Up</Button></Link>
                      </div>
                    </SheetContent>
                  </Sheet>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  )
}