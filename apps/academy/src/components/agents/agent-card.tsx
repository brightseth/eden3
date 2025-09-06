'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Agent, AgentStatus, ExtendedAgent } from '@/types/agent'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  formatCurrency, 
  formatNumber, 
  getStatusColor, 
  getStatusIcon, 
  generateColor,
  cn 
} from '@/lib/utils'
import { 
  Eye, 
  TrendingUp, 
  Users, 
  Calendar, 
  ExternalLink,
  Activity,
  Star,
  GraduationCap
} from 'lucide-react'

interface AgentCardProps {
  agent: Agent | ExtendedAgent
  variant?: 'default' | 'compact' | 'detailed' | 'portfolio'
  showActions?: boolean
  onViewDetails?: (agent: Agent) => void
  className?: string
}

export function AgentCard({ 
  agent, 
  variant = 'default',
  showActions = true,
  onViewDetails,
  className 
}: AgentCardProps) {
  const statusColor = getStatusColor(agent.status)
  const statusIcon = getStatusIcon(agent.status)
  const avatarColor = generateColor(agent.id)

  if (variant === 'compact') {
    return (
      <Card className={cn('hover:shadow-md transition-shadow', className)}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              {agent.avatar ? (
                <Image
                  src={agent.avatar}
                  alt={agent.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: avatarColor }}
                >
                  {agent.name.charAt(0)}
                </div>
              )}
              {'isOnline' in agent && agent.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {agent.name}
                </h3>
                <span className={cn('text-xs px-2 py-0.5 rounded-full border', statusColor)}>
                  {statusIcon} {agent.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate">{agent.description}</p>
              <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                <span>{formatCurrency(agent.totalRevenue)}</span>
                <span>{formatNumber(agent.totalWorks)} works</span>
              </div>
            </div>

            {showActions && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onViewDetails?.(agent)}
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

  if (variant === 'portfolio') {
    const extendedAgent = agent as ExtendedAgent
    const performance = extendedAgent.performance
    
    return (
      <Card className={cn('hover:shadow-lg transition-all card-hover', className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {agent.avatar ? (
                <Image
                  src={agent.avatar}
                  alt={agent.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: avatarColor }}
                >
                  {agent.name.charAt(0)}
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
                <p className="text-sm text-gray-500">{agent.practice}</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(agent.totalRevenue)}
              </div>
              <div className="text-sm text-gray-500">Total Revenue</div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {formatNumber(agent.totalWorks)}
              </div>
              <div className="text-xs text-gray-500">Works</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {formatNumber(agent.socialFollowers)}
              </div>
              <div className="text-xs text-gray-500">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {agent.avgWorkRating.toFixed(1)}
              </div>
              <div className="text-xs text-gray-500">Rating</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {formatNumber(agent.collaborations)}
              </div>
              <div className="text-xs text-gray-500">Collabs</div>
            </div>
          </div>

          {performance && (
            <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm text-gray-600">This Month</div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatCurrency(performance.thisMonth.totalRevenue)}
                </div>
                <div className={cn('text-xs flex items-center mt-1', 
                  performance.growth.revenue >= 0 ? 'text-green-600' : 'text-red-600'
                )}>
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {performance.growth.revenue >= 0 ? '+' : ''}
                  {performance.growth.revenue.toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Works Created</div>
                <div className="text-lg font-semibold text-gray-900">
                  {performance.thisMonth.totalWorks}
                </div>
                <div className={cn('text-xs flex items-center mt-1',
                  performance.growth.works >= 0 ? 'text-green-600' : 'text-red-600'
                )}>
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {performance.growth.works >= 0 ? '+' : ''}
                  {performance.growth.works.toFixed(1)}%
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className={cn('text-xs px-2 py-1 rounded-full border', statusColor)}>
                {statusIcon} {agent.status}
              </span>
              {'isOnline' in agent && (
                <span className={cn('text-xs px-2 py-1 rounded-full',
                  agent.isOnline ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
                )}>
                  <Activity className="w-3 h-3 inline mr-1" />
                  {agent.isOnline ? 'Online' : 'Offline'}
                </span>
              )}
            </div>
            
            {showActions && (
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/portfolio/${agent.id}`}>
                    <Eye className="w-3 h-3 mr-1" />
                    Details
                  </Link>
                </Button>
                {agent.status === AgentStatus.SOVEREIGN && (
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/observatory/${agent.id}`}>
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Monitor
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Default variant
  return (
    <Card className={cn('hover:shadow-lg transition-all card-hover', className)}>
      <CardHeader>
        <div className="flex items-center space-x-4">
          <div className="relative">
            {agent.avatar ? (
              <Image
                src={agent.avatar}
                alt={agent.name}
                width={64}
                height={64}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
                style={{ backgroundColor: avatarColor }}
              >
                {agent.name.charAt(0)}
              </div>
            )}
            {'isOnline' in agent && agent.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white" />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-xl font-semibold text-gray-900">{agent.name}</h3>
              <span className={cn('text-xs px-2 py-1 rounded-full border', statusColor)}>
                {statusIcon} {agent.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">{agent.practice}</p>
            <p className="text-sm text-gray-500">{agent.description}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(agent.totalRevenue)}
            </div>
            <div className="text-sm text-gray-500">Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(agent.totalWorks)}
            </div>
            <div className="text-sm text-gray-500">Works</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(agent.socialFollowers)}
            </div>
            <div className="text-sm text-gray-500">Followers</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <div className="text-2xl font-bold text-gray-900">
                {agent.avgWorkRating.toFixed(1)}
              </div>
            </div>
            <div className="text-sm text-gray-500">Rating</div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>Created {new Date(agent.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{formatNumber(agent.collaborations)} collaborations</span>
          </div>
        </div>

        {showActions && (
          <div className="flex space-x-3">
            <Button variant="outline" className="flex-1" asChild>
              <Link href={`/agents/${agent.id}`}>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Link>
            </Button>
            
            {agent.status === AgentStatus.TRAINING && (
              <Button variant="eden" className="flex-1" asChild>
                <Link href={`/training/${agent.id}`}>
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Train
                </Link>
              </Button>
            )}
            
            {agent.status === AgentStatus.SOVEREIGN && (
              <Button variant="outline" className="flex-1" asChild>
                <Link href={`/observatory/${agent.id}`}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Monitor
                </Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface AgentGridProps {
  agents: Agent[] | ExtendedAgent[]
  variant?: 'default' | 'compact' | 'detailed' | 'portfolio'
  showActions?: boolean
  onViewDetails?: (agent: Agent) => void
  className?: string
}

export function AgentGrid({ 
  agents, 
  variant = 'default',
  showActions = true,
  onViewDetails,
  className 
}: AgentGridProps) {
  const gridClasses = {
    compact: 'grid-cols-1',
    default: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    detailed: 'grid-cols-1 lg:grid-cols-2',
    portfolio: 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3',
  }

  return (
    <div className={cn('grid gap-6', gridClasses[variant], className)}>
      {agents.map((agent) => (
        <AgentCard
          key={agent.id}
          agent={agent}
          variant={variant}
          showActions={showActions}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  )
}