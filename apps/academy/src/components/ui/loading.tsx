import * as React from 'react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function LoadingSpinner({ size = 'md', className, ...props }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  }

  return (
    <div
      className={cn('animate-spin rounded-full border-2 border-gray-300 border-t-primary', sizeClasses[size], className)}
      {...props}
    />
  )
}

interface LoadingSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number
  avatar?: boolean
}

export function LoadingSkeleton({ lines = 3, avatar = false, className, ...props }: LoadingSkeletonProps) {
  return (
    <div className={cn('animate-pulse', className)} {...props}>
      {avatar && (
        <div className="flex items-center space-x-4 mb-4">
          <div className="rounded-full bg-gray-300 h-12 w-12"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded w-24"></div>
            <div className="h-3 bg-gray-300 rounded w-16"></div>
          </div>
        </div>
      )}
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="grid grid-cols-3 gap-4">
            <div className="h-4 bg-gray-300 rounded col-span-2"></div>
            <div className="h-4 bg-gray-300 rounded col-span-1"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface LoadingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number
}

export function LoadingCards({ count = 3, className, ...props }: LoadingCardProps) {
  return (
    <div className={cn('grid gap-6', className)} {...props}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border rounded-lg p-6 animate-pulse">
          <div className="flex items-center space-x-4 mb-4">
            <div className="rounded-full bg-gray-300 h-12 w-12"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-32"></div>
              <div className="h-3 bg-gray-300 rounded w-20"></div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            <div className="h-4 bg-gray-300 rounded w-4/6"></div>
          </div>
          <div className="flex justify-between items-center mt-6">
            <div className="h-8 bg-gray-300 rounded w-20"></div>
            <div className="h-8 bg-gray-300 rounded w-24"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

interface LoadingStateProps {
  title?: string
  description?: string
  size?: 'sm' | 'md' | 'lg'
}

export function LoadingState({ 
  title = 'Loading...', 
  description = 'Please wait while we fetch your data.', 
  size = 'md' 
}: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <LoadingSpinner size={size === 'sm' ? 'md' : size === 'lg' ? 'xl' : 'lg'} className="mb-4" />
      <h3 className={cn(
        'font-semibold text-gray-900',
        size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'
      )}>
        {title}
      </h3>
      {description && (
        <p className={cn(
          'text-gray-500 mt-1',
          size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'
        )}>
          {description}
        </p>
      )}
    </div>
  )
}

interface EmptyStateProps {
  title: string
  description?: string
  action?: React.ReactNode
  icon?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export function EmptyState({ 
  title, 
  description, 
  action, 
  icon,
  size = 'md' 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && (
        <div className={cn(
          'text-gray-400 mb-4',
          size === 'sm' ? 'text-2xl' : size === 'lg' ? 'text-5xl' : 'text-4xl'
        )}>
          {icon}
        </div>
      )}
      <h3 className={cn(
        'font-semibold text-gray-900',
        size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'
      )}>
        {title}
      </h3>
      {description && (
        <p className={cn(
          'text-gray-500 mt-1 max-w-md',
          size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'
        )}>
          {description}
        </p>
      )}
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  )
}

interface ErrorStateProps {
  title: string
  description?: string
  action?: React.ReactNode
  error?: Error
}

export function ErrorState({ title, description, action, error }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-red-400 text-4xl mb-4">⚠️</div>
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 mt-1 max-w-md">{description}</p>
      )}
      {error && process.env.NODE_ENV === 'development' && (
        <details className="mt-4 max-w-md">
          <summary className="text-xs text-gray-400 cursor-pointer">Error Details</summary>
          <pre className="text-xs text-left text-red-600 mt-2 whitespace-pre-wrap bg-red-50 p-2 rounded">
            {error.message}
          </pre>
        </details>
      )}
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  )
}