# 💼 Job Board Platform

A modern, full-stack job board application built with React 19, TypeScript, and Supabase. Connects employers with job seekers through an intuitive interface with powerful features.

Live Demo -> [https://notes-app-8wk.pages.dev/](https://jobboard-9ar.pages.dev/)
<img width="1649" height="879" alt="Screenshot 2025-12-07 065526" src="https://github.com/user-attachments/assets/ce458cff-2979-4809-a569-e3c193883e0f" />

---

## ✨ Features

### For Job Seekers
- 🔍 **Advanced Job Search** - Filter by title, location, job type, and work model (remote/hybrid/onsite)
- 📝 **Easy Applications** - Apply with resume upload and cover letter
- ♾️ **Infinite Scroll** - Smooth browsing experience with automatic pagination
- 📱 **Responsive Design** - Works perfectly on all devices

### For Employers
- 📊 **Dashboard** - Manage all your job postings in one place
- ✍️ **Job Posting** - Create detailed job listings with rich formatting
- 👥 **Applicant Management** - Review applications and update their status
- 📥 **Resume Downloads** - Access applicant resumes directly
- 🔒 **Role-Based Access** - Secure, employer-only features

### Platform Features
- 🔐 **Secure Authentication** - Email/password auth powered by Supabase
- ⚡ **Real-time Updates** - Instant data synchronization
- 🎨 **Modern UI** - Built with shadcn/ui components
- 🔄 **Optimistic Updates** - Smooth user experience
- 🛡️ **Row Level Security** - Database-level access control

---
## ScreenShots
<img width="1634" height="847" alt="Screenshot 2025-12-07 065546" src="https://github.com/user-attachments/assets/425daa4c-6ab8-4c79-873d-5f54e793a873" />
<img width="1637" height="756" alt="Screenshot 2025-12-07 065609" src="https://github.com/user-attachments/assets/7bc93b35-747e-4f5b-a14b-a7138cede6b1" />
<img width="1574" height="739" alt="Screenshot 2025-12-07 065622" src="https://github.com/user-attachments/assets/e3694340-d537-4154-a91e-bb25a5e13758" />
<img width="1735" height="640" alt="Screenshot 2025-12-07 065633" src="https://github.com/user-attachments/assets/2a9e0294-f1b9-464c-8a6a-d45b5f165b40" />
<img width="1726" height="846" alt="Screenshot 2025-12-07 065748" src="https://github.com/user-attachments/assets/ec65c7b7-453c-4227-b215-e495f7a807a0" />
<img width="1618" height="903" alt="Screenshot 2025-12-07 065945" src="https://github.com/user-attachments/assets/c27322ce-f7cc-4de1-9dd2-edcbff7e958d" />

---
## 🚀 Tech Stack

### Frontend
- **React 19.2** - Latest React with concurrent features
- **TypeScript 5.9** - Type-safe development
- **Vite 7.2** - Lightning-fast build tool
- **React Router 7** - Modern routing solution
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible components

### Backend & Database
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication
  - Storage (resume uploads)
  - Row Level Security (RLS)

### Form & Validation
- **React Hook Form** - Performant form management
- **Zod** - TypeScript-first schema validation

### State Management
- **React Query** - Server state management
- **React Hooks** - Local state management

---

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd JobBoard
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these from: Supabase Dashboard → Settings → API

### 4. Set Up Database

Run this SQL in your Supabase SQL Editor:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  company_name text,
  role text CHECK (role IN ('employer', 'seeker')) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create jobs table
CREATE TABLE jobs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  employer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  company_name text NOT NULL,
  location text,
  type text,
  location_type text CHECK (location_type IN ('onsite', 'remote', 'hybrid')),
  salary_min numeric,
  salary_max numeric,
  description text NOT NULL,
  requirements text[],
  benefits text[],
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create applications table
CREATE TABLE applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  seeker_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  cover_letter text,
  resume_url text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
  applied_at timestamptz DEFAULT now()
);

-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true);

-- Storage policies
CREATE POLICY "Users can upload their own resumes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'resumes' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Resumes are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'resumes');

-- RLS Policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- RLS Policies for jobs
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view jobs"
ON jobs FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "Employers can create jobs"
ON jobs FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'employer'
  )
);

CREATE POLICY "Employers can update their own jobs"
ON jobs FOR UPDATE
TO authenticated
USING (employer_id = auth.uid());

-- RLS Policies for applications
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Seekers can create applications"
ON applications FOR INSERT
TO authenticated
WITH CHECK (seeker_id = auth.uid());

CREATE POLICY "Seekers can view their own applications"
ON applications FOR SELECT
TO authenticated
USING (seeker_id = auth.uid());

CREATE POLICY "Employers can view applications for their jobs"
ON applications FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM jobs 
    WHERE jobs.id = applications.job_id 
    AND jobs.employer_id = auth.uid()
  )
);

CREATE POLICY "Employers can update application status"
ON applications FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM jobs 
    WHERE jobs.id = applications.job_id 
    AND jobs.employer_id = auth.uid()
  )
);
```

### 5. Configure Supabase Auth
In Supabase Dashboard:
1. Go to **Authentication** → **Providers** → **Email**
2. **Disable** "Confirm email" (for easier testing)
3. Set **Site URL** to `http://localhost:5173`

### 6. Run Development Server
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🗂️ Project Structure

```
JobBoard/
├── src/
│   ├── app/
│   │   └── routes/              # Route components
│   │       ├── __root.tsx       # Root layout
│   │       ├── index.tsx        # Home page
│   │       ├── about.tsx        # About page
│   │       ├── contact.tsx      # Contact page
│   │       ├── auth/            # Authentication
│   │       │   ├── login.tsx
│   │       │   └── signup.tsx
│   │       ├── jobs/            # Job pages
│   │       │   ├── index.tsx    # Job listings
│   │       │   ├── $id.tsx      # Job details
│   │       │   └── Post.tsx     # Create job
│   │       └── dashboard/       # Employer dashboard
│   │           ├── index.tsx
│   │           └── applicants/
│   │               └── $id.tsx  # View applicants
│   ├── components/
│   │   ├── layout/              # Layout components
│   │   │   ├── navbar.tsx
│   │   │   └── footer.tsx
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── job-card.tsx         # Job card component
│   │   ├── job-filters.tsx      # Filter component
│   │   └── apply-dialog.tsx     # Application dialog
│   ├── hooks/
│   │   ├── use-auth.ts          # Authentication hook
│   │   └── use-jobs.ts          # Jobs data hook
│   ├── lib/
│   │   ├── supabaseClient.ts    # Supabase client
│   │   ├── utils.ts             # Utility functions
│   │   └── validation.ts        # Validation schemas
│   ├── types/
│   │   ├── app.ts               # App types
│   │   └── supabase.ts          # Database types
│   ├── App.tsx                  # Main app component
│   ├── main.tsx                 # Entry point
│   └── index.css                # Global styles
├── public/                      # Static assets
├── .env                         # Environment variables
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🔧 Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## 🌐 Deployment

### Deploy to cloudflare pages (Recommended)

1. Push your code to GitHub
2. Go to Cloudflare Pages dashboard
3. Import your repository
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy! 🚀


---

## 🎨 Key Features Explained

### Infinite Scroll
Uses IntersectionObserver API to automatically load more jobs as you scroll.

### Debounced Search
Search inputs wait 500ms after you stop typing before filtering (improves performance).

### Form Validation
All forms use Zod schemas with react-hook-form for type-safe validation.

### Row Level Security
Database-level security ensures users can only access their own data.

### Resume Storage
Files are organized by user ID: `resumes/{user-id}/filename.pdf`

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

Built with ❤️ by [Your Name]

---

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) - Backend infrastructure
- [shadcn/ui](https://ui.shadcn.com) - UI components
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [React](https://react.dev) - Frontend framework

---

## 📧 Support

For support, email [your-email] or open an issue on GitHub.

---

**Happy Coding! 🚀**
