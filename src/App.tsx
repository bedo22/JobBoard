// src/App.tsx
import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Loader2 } from "lucide-react";
import RootLayout from "./app/routes/__root";

// Lazy load pages (same speed as TanStack but way simpler)
const Index = lazy(() => import("./app/routes/index"));
const Jobs = lazy(() => import("./app/routes/jobs/index"));
const JobDetail = lazy(() => import("./app/routes/jobs/$id"));
// const About = lazy(() => import("./app/routes/about"));
// const Contact = lazy(() => import("./app/routes/contact"));
const Login = lazy(() => import("./app/routes/auth/login"));
const Signup = lazy(() => import("./app/routes/auth/signup"));
const Dashboard = lazy(() => import("./app/routes/dashboard/index"));
const Applicants = lazy(() => import("./app/routes/dashboard/applicants/$id"));
const PostJob = lazy(() => import("./app/routes/jobs/Post")); 
const NotFound = lazy(() => import("./app/routes/404"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Index /> },
      { path: "jobs", element: <Jobs /> },
      { path: "jobs/:id", element: <JobDetail /> },
      { path: "jobs/post", element: <PostJob /> },
      // { path: "about", element: <About /> },
      // { path: "contact", element: <Contact /> },
      { path: "login", element: <Login /> },
      { path: "signup", element: <Signup /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "dashboard/applicants/:id", element: <Applicants /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

// Loading fallback
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}