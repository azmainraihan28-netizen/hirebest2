import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
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
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import Refund from './pages/Refund'
import NotFound from './pages/NotFound'

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
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  )
}
