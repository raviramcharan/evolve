export default function CheckInLoading() {
  return (
    <div className="px-4 py-5 animate-pulse flex flex-col gap-5">
      <div className="h-8 bg-surface rounded-xl w-full" />
      <div className="h-1.5 bg-surface rounded-full" />
      <div className="flex flex-col gap-4">
        <div className="h-20 bg-surface border border-border rounded-2xl" />
        <div className="h-20 bg-surface border border-border rounded-2xl" />
        <div className="h-32 bg-surface border border-border rounded-2xl" />
      </div>
    </div>
  )
}
