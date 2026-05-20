export default function DashboardLoading() {
  return (
    <div className="px-4 py-5 flex flex-col gap-5 animate-pulse">
      <div className="h-7 bg-surface rounded-xl w-40" />
      <div className="h-28 bg-surface border border-border rounded-2xl" />
      <div className="h-20 bg-surface border border-border rounded-2xl" />
      <div className="h-64 bg-surface border border-border rounded-2xl" />
      <div className="h-32 bg-surface border border-border rounded-2xl" />
    </div>
  )
}
