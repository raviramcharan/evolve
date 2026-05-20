export default function ProgressLoading() {
  return (
    <div className="px-4 py-5 animate-pulse flex flex-col gap-5">
      <div className="grid grid-cols-3 gap-3">
        <div className="h-16 bg-surface border border-border rounded-2xl" />
        <div className="h-16 bg-surface border border-border rounded-2xl" />
        <div className="h-16 bg-surface border border-border rounded-2xl" />
      </div>
      <div className="h-72 bg-surface border border-border rounded-2xl" />
      <div className="h-48 bg-surface border border-border rounded-2xl" />
    </div>
  )
}
