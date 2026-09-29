interface SkeletonCardProps {
  className?: string
}

export default function SkeletonCard({ className = '' }: SkeletonCardProps) {
  return (
    <div className={`glass-card p-6 ${className}`}>
      <div className="flex items-center gap-4 mb-4">
        <div className="w-10 h-10 rounded-xl bg-white/4 animate-pulse" />
        <div className="flex-1">
          <div className="h-4 w-24 bg-white/4 rounded animate-pulse" />
          <div className="h-3 w-16 bg-white/2 rounded animate-pulse mt-2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full bg-white/4 rounded animate-pulse" />
        <div className="h-3 w-3/4 bg-white/4 rounded animate-pulse" />
        <div className="h-3 w-1/2 bg-white/4 rounded animate-pulse" />
      </div>
    </div>
  )
}
