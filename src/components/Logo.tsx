import logo from '../assets/hirebest-icon-56.webp'
import { Link } from 'react-router-dom'

export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <Link to="/" className="flex items-center gap-2 font-bold tracking-tight">
      <img src={logo} alt="" width={size} height={size} decoding="async" className="rounded object-contain" />
      <span className="text-[var(--color-fg)]">Hire<span className="text-[var(--color-primary)]">Best</span></span>
    </Link>
  )
}
