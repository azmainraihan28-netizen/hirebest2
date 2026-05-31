import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './components/dashboard/DashboardLayout'
import Home from './pages/Home'
import Pricing from './pages/Pricing'
import Analytics from './pages/Analytics'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import Contact from './pages/Contact'
import InterviewQuestions from './pages/InterviewQuestions'
import VsGreenhouse from './pages/VsGreenhouse'
import VsWorkable from './pages/VsWorkable'
import VsLever from './pages/VsLever'
import Login from './pages/Login'
import Signup from './pages/Signup'
import AuthCallback from './pages/AuthCallback'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import Refund from './pages/Refund'
import NotFound from './pages/NotFound'
import Account from './pages/Account'
import Admin from './pages/Admin'
import Checkout from './pages/Checkout'
import DashIndex from './pages/dashboard/DashIndex'
import NewScreening from './pages/dashboard/NewScreening'
import Results from './pages/dashboard/Results'
import Orders from './pages/dashboard/Orders'
import DashAnalytics from './pages/dashboard/DashAnalytics'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/tools/interview-questions" element={<InterviewQuestions />} />
        <Route path="/vs-greenhouse" element={<VsGreenhouse />} />
        <Route path="/vs-workable" element={<VsWorkable />} />
        <Route path="/vs-lever" element={<VsLever />} />
        <Route path="/privacy-policy" element={<Privacy />} />
        <Route path="/terms-and-conditions" element={<Terms />} />
        <Route path="/refund-policy" element={<Refund />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
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
  )
}
