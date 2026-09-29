import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import ChatWidget from './ChatWidget'
import { ScrollProgress } from './motion/primitives'

export default function Layout() {
  return (
    <div className="site min-h-screen flex flex-col">
      <ScrollProgress />
      <div className="grain" aria-hidden />
      <Header />
      <main className="flex-1"><Outlet /></main>
      <Footer />
      <ChatWidget />
    </div>
  )
}
