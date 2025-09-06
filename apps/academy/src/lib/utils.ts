import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { AgentStatus, WorkStatus, Medium, Currency } from '@/types/agent'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(
  amount: number,
  currency: Currency = Currency.USD,
  locale: string = 'en-US'
): string {
  if (currency === Currency.USD) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  if (currency === Currency.ETH) {
    return `${amount.toFixed(4)} ETH`
  }

  if (currency === Currency.EDEN) {
    return `${amount.toLocaleString()} EDEN`
  }

  if (currency === Currency.BTC) {
    return `${amount.toFixed(8)} BTC`
  }

  return amount.toString()
}

export function formatNumber(
  num: number,
  notation: 'standard' | 'scientific' | 'engineering' | 'compact' = 'compact'
): string {
  return new Intl.NumberFormat('en-US', {
    notation,
    maximumFractionDigits: 2,
  }).format(num)
}

export function formatDate(
  date: string | Date,
  format: 'short' | 'medium' | 'long' | 'relative' = 'medium'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (format === 'relative') {
    return formatRelativeTime(dateObj)
  }

  const options: Intl.DateTimeFormatOptions = {
    short: { month: 'short', day: 'numeric' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    },
  }[format]

  return new Intl.DateTimeFormat('en-US', options).format(dateObj)
}

export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInSeconds = Math.floor(diffInMs / 1000)
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInSeconds < 60) {
    return 'just now'
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`
  } else {
    return formatDate(date, 'short')
  }
}

export function getStatusColor(status: AgentStatus | WorkStatus): string {
  const statusColors = {
    // Agent statuses
    [AgentStatus.TRAINING]: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    [AgentStatus.GRADUATED]: 'text-green-600 bg-green-50 border-green-200',
    [AgentStatus.SOVEREIGN]: 'text-blue-600 bg-blue-50 border-blue-200',
    
    // Work statuses
    [WorkStatus.DRAFT]: 'text-gray-600 bg-gray-50 border-gray-200',
    [WorkStatus.PUBLISHED]: 'text-green-600 bg-green-50 border-green-200',
    [WorkStatus.SOLD]: 'text-purple-600 bg-purple-50 border-purple-200',
    [WorkStatus.ARCHIVED]: 'text-orange-600 bg-orange-50 border-orange-200',
  }

  return statusColors[status] || 'text-gray-600 bg-gray-50 border-gray-200'
}

export function getStatusIcon(status: AgentStatus | WorkStatus): string {
  const statusIcons = {
    // Agent statuses
    [AgentStatus.TRAINING]: '🎓',
    [AgentStatus.GRADUATED]: '✅',
    [AgentStatus.SOVEREIGN]: '👑',
    
    // Work statuses
    [WorkStatus.DRAFT]: '📝',
    [WorkStatus.PUBLISHED]: '🚀',
    [WorkStatus.SOLD]: '💎',
    [WorkStatus.ARCHIVED]: '📁',
  }

  return statusIcons[status] || '❓'
}

export function getMediumIcon(medium: Medium): string {
  const mediumIcons = {
    [Medium.IMAGE]: '🖼️',
    [Medium.VIDEO]: '🎥',
    [Medium.AUDIO]: '🎵',
    [Medium.TEXT]: '📄',
    [Medium.INTERACTIVE]: '🕹️',
    [Medium.MIXED]: '🎨',
  }

  return mediumIcons[medium] || '❓'
}

export function truncateText(text: string, length: number = 100): string {
  if (text.length <= length) return text
  return text.substring(0, length).replace(/\s+\S*$/, '') + '...'
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function generateColor(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  
  const hue = Math.abs(hash % 360)
  return `hsl(${hue}, 70%, 60%)`
}

export function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

export function formatGrowth(growth: number): {
  value: string
  color: string
  icon: string
} {
  const absGrowth = Math.abs(growth)
  const value = `${growth >= 0 ? '+' : ''}${absGrowth.toFixed(1)}%`
  const color = growth >= 0 ? 'text-green-600' : 'text-red-600'
  const icon = growth >= 0 ? '📈' : '📉'
  
  return { value, color, icon }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text)
  }
  
  // Fallback for older browsers
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
  
  return Promise.resolve()
}

export function downloadFile(content: string, filename: string, type: string = 'text/plain'): void {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Environment utilities
export const isDevelopment = process.env.NODE_ENV === 'development'
export const isProduction = process.env.NODE_ENV === 'production'
export const isClient = typeof window !== 'undefined'
export const isServer = typeof window === 'undefined'

// Local storage utilities
export function getLocalStorage<T>(key: string, defaultValue: T): T {
  if (isServer) return defaultValue
  
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

export function setLocalStorage<T>(key: string, value: T): void {
  if (isServer) return
  
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Handle quota exceeded or other errors
  }
}

export function removeLocalStorage(key: string): void {
  if (isServer) return
  
  try {
    localStorage.removeItem(key)
  } catch {
    // Handle errors
  }
}