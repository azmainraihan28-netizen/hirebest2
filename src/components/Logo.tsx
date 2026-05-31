import logo from '../assets/hirebest-icon.png'
import { Link } from 'react-router-dom'

export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <Link to="/" className="flex items-center gap-2 font-bold tracking-tight">
      <img src={logo} alt="HireBest" width={size} height={size} className="rounded" />
      <span className="text-[var(--color-fg)]">Hire<span className="text-[var(--color-primary)]">Best</span></span>
    </Link>
  )
}
