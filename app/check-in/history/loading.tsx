export default function HistoryLoading() {
  return (
    <div className="px-4 py-5 animate-pulse flex flex-col gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-20 bg-surface border border-border rounded-2xl" />
      ))}
    </div>
  )
}
