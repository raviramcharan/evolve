export default function PhotosLoading() {
  return (
    <div className="px-4 py-5 animate-pulse">
      <div className="flex items-center justify-between mb-5">
        <div className="h-4 w-16 bg-surface rounded" />
        <div className="h-10 w-24 bg-surface rounded-xl" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="aspect-square bg-surface border border-border rounded-xl" />
        ))}
      </div>
    </div>
  )
}
