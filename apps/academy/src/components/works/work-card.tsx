'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Work, WorkStatus, Medium } from '@/types/agent'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  formatCurrency, 
  formatNumber, 
  formatDate,
  getStatusColor, 
  getStatusIcon,
  getMediumIcon,
  cn 
} from '@/lib/utils'
import { 
  Eye, 
  Heart,
  Share2,
  Star,
  Download,
  ExternalLink,
  Play,
  Pause
} from 'lucide-react'
import { useState } from 'react'

interface WorkCardProps {
  work: Work
  variant?: 'default' | 'compact' | 'detailed'
  showActions?: boolean
  onView?: (work: Work) => void
  onLike?: (work: Work) => void
  onShare?: (work: Work) => void
  className?: string
}

export function WorkCard({ 
  work, 
  variant = 'default',
  showActions = true,
  onView,
  onLike,
  onShare,
  className 
}: WorkCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const statusColor = getStatusColor(work.status)
  const statusIcon = getStatusIcon(work.status)
  const mediumIcon = getMediumIcon(work.medium)

  const handleLike = () => {
    setIsLiked(!isLiked)
    onLike?.(work)
  }

  const handleShare = () => {
    onShare?.(work)
  }

  const handleView = () => {
    onView?.(work)
  }

  if (variant === 'compact') {
    return (
      <Card className={cn('hover:shadow-md transition-shadow', className)}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-2xl">{mediumIcon}</div>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {work.title}
                </h3>
                <span className={cn('text-xs px-2 py-0.5 rounded-full border', statusColor)}>
                  {statusIcon} {work.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate">by {work.agentName || 'Unknown'}</p>
              <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                <span>{formatCurrency(work.price)}</span>
                <span className="flex items-center space-x-1">
                  <Eye className="w-3 h-3" />
                  <span>{formatNumber(work.views)}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Heart className="w-3 h-3" />
                  <span>{formatNumber(work.likes)}</span>
                </span>
              </div>
            </div>

            {showActions && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleView}
                className="flex-shrink-0"
              >
                <Eye className="w-3 h-3 mr-1" />
                View
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Default and detailed variants
  return (
    <Card className={cn('hover:shadow-lg transition-all card-hover overflow-hidden', className)}>
      <div className="relative">
        <div className="aspect-square bg-gray-200 flex items-center justify-center">
          {work.thumbnailUrl ? (
            <Image
              src={work.thumbnailUrl}
              alt={work.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="text-center">
              <div className="text-4xl mb-2">{mediumIcon}</div>
              <p className="text-sm text-gray-600">{work.medium} Work</p>
            </div>
          )}
        </div>
        
        {/* Overlay Controls */}
        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
          {work.medium === Medium.VIDEO && (
            <Button size="sm" variant="secondary" className="mr-2">
              <Play className="w-4 h-4" />
            </Button>
          )}
          {work.medium === Medium.AUDIO && (
            <Button size="sm" variant="secondary" className="mr-2">
              <Play className="w-4 h-4" />
            </Button>
          )}
          <Button size="sm" variant="secondary" onClick={handleView}>
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
        </div>
        
        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          {work.status === WorkStatus.SOLD ? (
            <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
              Sold
            </span>
          ) : work.status === WorkStatus.PUBLISHED ? (
            <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
              Available
            </span>
          ) : (
            <span className={cn('px-2 py-1 text-xs rounded-full', statusColor)}>
              {work.status}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-2 left-2 flex space-x-2 opacity-0 hover:opacity-100 transition-opacity">
          <button 
            onClick={handleLike}
            className={cn(
              'bg-white/90 p-1.5 rounded-full hover:bg-white transition-colors',
              isLiked && 'text-red-500'
            )}
          >
            <Heart className={cn('w-4 h-4', isLiked && 'fill-current')} />
          </button>
          <button 
            onClick={handleShare}
            className="bg-white/90 p-1.5 rounded-full hover:bg-white transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
          {work.downloadUrl && (
            <button className="bg-white/90 p-1.5 rounded-full hover:bg-white transition-colors">
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900 truncate">{work.title}</h3>
          <div className="flex items-center space-x-1">
            <Star className="w-3 h-3 text-yellow-500 fill-current" />
            <span className="text-xs text-gray-600">{work.rating?.toFixed(1) || 'N/A'}</span>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-2">
          by <Link href={`/agents/${work.agentId}`} className="hover:text-gray-900">
            {work.agentName || 'Unknown Artist'}
          </Link>
        </p>

        {variant === 'detailed' && work.description && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">
            {work.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-gray-900">
            {work.price ? formatCurrency(work.price) : 'Free'}
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Eye className="w-3 h-3" />
              <span>{formatNumber(work.views)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="w-3 h-3" />
              <span>{formatNumber(work.likes)}</span>
            </div>
          </div>
        </div>

        {variant === 'detailed' && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Created {formatDate(work.createdAt, 'short')}</span>
              <span className="capitalize">{work.medium}</span>
            </div>
            
            {work.tags && work.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {work.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="px-2 py-0.5 bg-gray-100 text-xs text-gray-600 rounded">
                    {tag}
                  </span>
                ))}
                {work.tags.length > 3 && (
                  <span className="px-2 py-0.5 bg-gray-100 text-xs text-gray-600 rounded">
                    +{work.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {showActions && (
          <div className="flex space-x-2 mt-4">
            <Button variant="outline" size="sm" className="flex-1" onClick={handleView}>
              <Eye className="w-3 h-3 mr-1" />
              View
            </Button>
            {work.status === WorkStatus.PUBLISHED && work.price && (
              <Button variant="eden" size="sm" className="flex-1">
                <ExternalLink className="w-3 h-3 mr-1" />
                Buy
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface WorkGridProps {
  works: Work[]
  variant?: 'default' | 'compact' | 'detailed'
  showActions?: boolean
  onView?: (work: Work) => void
  onLike?: (work: Work) => void
  onShare?: (work: Work) => void
  className?: string
}

export function WorkGrid({ 
  works, 
  variant = 'default',
  showActions = true,
  onView,
  onLike,
  onShare,
  className 
}: WorkGridProps) {
  const gridClasses = {
    compact: 'grid-cols-1',
    default: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    detailed: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  }

  return (
    <div className={cn('grid gap-6', gridClasses[variant], className)}>
      {works.map((work) => (
        <WorkCard
          key={work.id}
          work={work}
          variant={variant}
          showActions={showActions}
          onView={onView}
          onLike={onLike}
          onShare={onShare}
        />
      ))}
    </div>
  )
}