import { HTMLAttributes } from 'react'

export function Card({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`bg-surface border border-border rounded-2xl p-4 ${className}`} {...props}>
      {children}
    </div>
  )
}
