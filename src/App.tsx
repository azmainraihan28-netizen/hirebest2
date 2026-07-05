import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

// Eager: always needed
import Home from './pages/Home'

// Lazy: split per route
const Pricing           = lazy(() => import('./pages/Pricing'))
const Analytics         = lazy(() => import('./pages/Analytics'))
const Blog              = lazy(() => import('./pages/Blog'))
const BlogPost          = lazy(() => import('./pages/BlogPost'))
const Contact           = lazy(() => import('./pages/Contact'))
const InterviewQuestions= lazy(() => import('./pages/InterviewQuestions'))
const VsGreenhouse      = lazy(() => import('./pages/VsGreenhouse'))
const VsWorkable        = lazy(() => import('./pages/VsWorkable'))
const VsLever           = lazy(() => import('./pages/VsLever'))
const Privacy           = lazy(() => import('./pages/Privacy'))
const Terms             = lazy(() => import('./pages/Terms'))
const Refund            = lazy(() => import('./pages/Refund'))
const About             = lazy(() => import('./pages/About'))
const Checkout          = lazy(() => import('./pages/Checkout'))
const Account           = lazy(() => import('./pages/Account'))
const Admin             = lazy(() => import('./pages/Admin'))
const AcceptInvite      = lazy(() => import('./pages/AcceptInvite'))
const NotFound          = lazy(() => import('./pages/NotFound'))
const Login             = lazy(() => import('./pages/Login'))
const Signup            = lazy(() => import('./pages/Signup'))
const AuthCallback      = lazy(() => import('./pages/AuthCallback'))

// Dashboard pages
const DashboardLayout   = lazy(() => import('./components/dashboard/DashboardLayout'))
const DashIndex         = lazy(() => import('./pages/dashboard/DashIndex'))
const NewScreening      = lazy(() => import('./pages/dashboard/NewScreening'))
const Results           = lazy(() => import('./pages/dashboard/Results'))
const Orders            = lazy(() => import('./pages/dashboard/Orders'))
const DashAnalytics     = lazy(() => import('./pages/dashboard/DashAnalytics'))

function PageLoader() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ opacity: 0.4, fontSize: 14 }}>Loading…</span>
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/tools/interview-questions" element={<InterviewQuestions />} />
          <Route path="/vs-greenhouse" element={<VsGreenhouse />} />
          <Route path="/vs-workable" element={<VsWorkable />} />
          <Route path="/vs-lever" element={<VsLever />} />
          <Route path="/privacy-policy" element={<Privacy />} />
          <Route path="/terms-and-conditions" element={<Terms />} />
          <Route path="/refund-policy" element={<Refund />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOrOrgAdmin><Admin /></ProtectedRoute>} />
          <Route path="/invite/:token" element={<ProtectedRoute><AcceptInvite /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<DashIndex />} />
          <Route path="new" element={<NewScreening />} />
          <Route path="results/:id" element={<Results />} />
          <Route path="analytics" element={<DashAnalytics />} />
          <Route path="orders" element={<Orders />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
    </Suspense>
  )
}
