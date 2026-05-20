import { CoachNav } from '@/components/layout/CoachNav'

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg pb-24">
      {children}
      <CoachNav />
    </div>
  )
}
