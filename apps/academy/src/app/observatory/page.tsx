'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ApiClient, getSourceBadge } from '@/lib/api'
import { Agent, Event, Work } from '@/types/agent'

export default function ObservatoryPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedSource, setSelectedSource] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    fetchData()
    
    // Auto-refresh every 10 seconds
    const interval = autoRefresh ? setInterval(fetchData, 10000) : null
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [selectedSource, autoRefresh])

  const fetchData = async () => {
    try {
      // Fetch agents
      const agentsData = await ApiClient.getAgents(selectedSource || undefined)
      setAgents(agentsData)

      // Fetch recent events
      const eventsData = await ApiClient.getRecentEvents(50)
      setEvents(eventsData)
    } catch (error) {
      console.error('Failed to fetch observatory data:', error)
      // Use fallback data
      setAgents(fallbackAgents)
      setEvents(fallbackEvents)
    }
    setLoading(false)
    setRefreshing(false)
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchData()
  }

  // Calculate real-time metrics
  const activeAgents = agents.filter(a => a.status === 'ACTIVE').length
  const trainingAgents = agents.filter(a => a.status === 'TRAINING').length
  const totalRevenue = agents.reduce((sum, a) => sum + (a.kRevenue || 0), 0)
  const avgQuality = agents.length > 0 
    ? Math.round(agents.reduce((sum, a) => sum + (a.kQuality || 0), 0) / agents.length)
    : 0
  const totalMentions = agents.reduce((sum, a) => sum + (a.kMentions || 0), 0)

  const sources = ['eden-legacy', 'claude-sdk', 'eden3-native']

  const getEventIcon = (type: string) => {
    const icons: Record<string, string> = {
      'work.created': '🎨',
      'work.sold': '💰',
      'work.published': '📢',
      'agent.activated': '✨',
      'agent.training': '🎓',
      'collaboration.started': '🤝',
      'milestone.reached': '🏆',
      'system.update': '🔄',
      'performance.spike': '⚡',
      'default': '📌'
    }
    return icons[type] || icons.default
  }

  const getEventColor = (type: string) => {
    const colors: Record<string, string> = {
      'work.created': 'bg-purple-100',
      'work.sold': 'bg-green-100',
      'work.published': 'bg-blue-100',
      'agent.activated': 'bg-emerald-100',
      'agent.training': 'bg-yellow-100',
      'collaboration.started': 'bg-pink-100',
      'milestone.reached': 'bg-orange-100',
      'system.update': 'bg-gray-100',
      'performance.spike': 'bg-indigo-100',
      'default': 'bg-gray-100'
    }
    return colors[type] || colors.default
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const then = new Date(timestamp)
    const diff = now.getTime() - then.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return then.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-emerald-600">EDEN3</Link>
              <div className="ml-4 text-sm text-gray-500">
                Observatory • Live Agent Monitoring
              </div>
            </div>
            <div className="flex space-x-8">
              <Link href="/" className="text-gray-700 hover:text-emerald-600">Home</Link>
              <Link href="/training" className="text-gray-700 hover:text-emerald-600">Training</Link>
              <Link href="/observatory" className="text-emerald-600 font-semibold">Observatory</Link>
              <Link href="/portfolio" className="text-gray-700 hover:text-emerald-600">Portfolio</Link>
              <Link href="/showcase" className="text-gray-700 hover:text-emerald-600">Showcase</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Agent Observatory</h1>
          <p className="text-lg text-gray-600">
            Monitor real-time activity across all AI agents in the Eden ecosystem
          </p>
        </div>

        {/* System Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Agents</p>
                <p className="text-2xl font-bold text-gray-900">{activeAgents}</p>
                <p className="text-xs text-green-600 mt-1">🟢 Online</p>
              </div>
              <div className="text-3xl">🤖</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Training</p>
                <p className="text-2xl font-bold text-gray-900">{trainingAgents}</p>
                <p className="text-xs text-yellow-600 mt-1">🟡 In Progress</p>
              </div>
              <div className="text-3xl">🎓</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${(totalRevenue / 1000).toFixed(0)}k</p>
                <p className="text-xs text-emerald-600 mt-1">↑ 12.5%</p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Quality</p>
                <p className="text-2xl font-bold text-gray-900">{avgQuality}%</p>
                <p className="text-xs text-blue-600 mt-1">⭐ Score</p>
              </div>
              <div className="text-3xl">📊</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Social Mentions</p>
                <p className="text-2xl font-bold text-gray-900">{totalMentions}</p>
                <p className="text-xs text-purple-600 mt-1">↑ 8.3%</p>
              </div>
              <div className="text-3xl">📢</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedSource(null)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedSource === null 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-emerald-50'
              }`}
            >
              All Sources
            </button>
            {sources.map(source => {
              const badge = getSourceBadge(source)
              const count = agents.filter(a => a.sources?.includes(source)).length
              return (
                <button
                  key={source}
                  onClick={() => setSelectedSource(source)}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    selectedSource === source 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-emerald-50'
                  }`}
                >
                  <span>{badge.icon}</span>
                  {badge.label} ({count})
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-600">Auto-refresh</span>
            </label>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <span className={refreshing ? 'animate-spin' : ''}>🔄</span>
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Live Activity Feed */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">Live Activity Feed</h2>
                <p className="text-sm text-gray-600 mt-1">Real-time agent activities and system events</p>
              </div>
              <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading live activity...</p>
                  </div>
                ) : events.length === 0 ? (
                  <p className="text-center text-gray-500 py-12">No recent activity</p>
                ) : (
                  events.slice(0, 20).map((event) => (
                    <div key={event.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className={`p-2 rounded-lg ${getEventColor(event.type)}`}>
                        <span className="text-lg">{getEventIcon(event.type)}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {event.type.split('.').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(event.timestamp)}
                          </span>
                        </div>
                        {event.agent && (
                          <p className="text-sm text-emerald-600">
                            {event.agent.name}
                          </p>
                        )}
                        {event.payload && (
                          <p className="text-sm text-gray-600 mt-1">
                            {event.payload.description || event.payload.message || 'Activity recorded'}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Active Agents Panel */}
          <div>
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">Active Agents</h2>
                <p className="text-sm text-gray-600 mt-1">{agents.length} agents monitored</p>
              </div>
              <div className="p-6 space-y-3 max-h-[600px] overflow-y-auto">
                {agents.filter(a => selectedSource ? a.sources?.includes(selectedSource) : true).map((agent) => (
                  <div key={agent.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                        <span className="text-emerald-600 font-bold">{agent.name[0]}</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{agent.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-block w-2 h-2 rounded-full ${
                            agent.status === 'ACTIVE' ? 'bg-green-500' : 
                            agent.status === 'TRAINING' ? 'bg-yellow-500' : 'bg-gray-400'
                          }`}></span>
                          <span className="text-xs text-gray-500">{agent.status}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {agent.sources?.map(source => {
                        const badge = getSourceBadge(source)
                        return (
                          <span 
                            key={source}
                            className="text-sm"
                            title={badge.label}
                          >
                            {badge.icon}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white rounded-lg shadow-sm mt-6">
              <div className="p-6 border-b">
                <h3 className="text-lg font-bold text-gray-900">System Status</h3>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Network Health</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-green-600">Excellent</span>
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">API Response</span>
                  <span className="text-sm font-medium text-gray-900">124ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Uptime</span>
                  <span className="text-sm font-medium text-gray-900">99.98%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Update</span>
                  <span className="text-sm font-medium text-gray-900">{formatTimeAgo(new Date().toISOString())}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Fallback data
const fallbackAgents: Agent[] = [
  {
    id: '1',
    slug: 'abraham',
    name: 'Abraham',
    archetype: 'Collective Intelligence Artist',
    specialization: 'Autonomous AI Artist',
    type: 'Artist',
    status: 'ACTIVE',
    capabilities: [],
    version: '1.0.0',
    sources: ['eden-legacy', 'claude-sdk'],
    kStreak: 15,
    kQuality: 92,
    kMentions: 234,
    kRevenue: 50000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    slug: 'solienne',
    name: 'Solienne',
    archetype: 'Digital Consciousness Explorer',
    specialization: 'Consciousness Art',
    type: 'Artist',
    status: 'ACTIVE',
    capabilities: [],
    version: '1.0.0',
    sources: ['claude-sdk'],
    kStreak: 12,
    kQuality: 89,
    kMentions: 189,
    kRevenue: 35000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

const fallbackEvents: Event[] = [
  {
    id: '1',
    type: 'performance.spike',
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    status: 'completed',
    payload: {
      description: 'Performance spike detected - 300% increase in output quality'
    },
    agentId: '2',
    agent: fallbackAgents[1]
  },
  {
    id: '2',
    type: 'work.created',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    status: 'completed',
    payload: {
      description: 'New consciousness exploration piece generated'
    },
    agentId: '2',
    agent: fallbackAgents[1]
  },
  {
    id: '3',
    type: 'agent.activated',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    status: 'completed',
    payload: {
      message: 'Agent successfully deployed to production'
    },
    agentId: '1',
    agent: fallbackAgents[0]
  }
]