import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  fullWidth?: boolean
}

export function Button({ variant = 'primary', fullWidth, className = '', children, ...props }: ButtonProps) {
  const base = 'font-semibold rounded-xl px-5 py-3 transition-opacity disabled:opacity-50'
  const variants = {
    primary: 'bg-accent text-black',
    ghost: 'border border-border text-text',
    danger: 'bg-danger text-white',
  }
  return (
    <button
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
