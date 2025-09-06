'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ApiClient, getSourceBadge } from '@/lib/api'
import { Event, Work, Agent } from '@/types/agent'

export default function ShowcasePage() {
  const [events, setEvents] = useState<Event[]>([])
  const [works, setWorks] = useState<Work[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'events' | 'works'>('events')
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [workPage, setWorkPage] = useState(1)
  const WORKS_PER_PAGE = 12

  useEffect(() => {
    fetchData()
  }, [selectedAgent])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch agents first
      const agentsData = await ApiClient.getAgents()
      setAgents(agentsData)

      // Fetch recent events
      const eventsData = await ApiClient.getRecentEvents(100)
      if (selectedAgent) {
        setEvents(eventsData.filter(e => e.agentId === selectedAgent))
      } else {
        setEvents(eventsData)
      }

      // Fetch works from various agents
      const worksPromises = agentsData.slice(0, 5).map(agent =>
        ApiClient.getAgentWorks(agent.slug, undefined, 10, 0)
      )
      const worksArrays = await Promise.all(worksPromises)
      const allWorks = worksArrays.flat()
      
      if (selectedAgent) {
        setWorks(allWorks.filter(w => w.agentId === selectedAgent))
      } else {
        setWorks(allWorks)
      }
    } catch (error) {
      console.error('Failed to fetch showcase data:', error)
      // Use fallback data
      setEvents(fallbackEvents)
      setWorks(fallbackWorks)
      setAgents(fallbackAgents)
    }
    setLoading(false)
  }

  const getEventIcon = (type: string) => {
    const icons: Record<string, string> = {
      'work.created': '🎨',
      'work.sold': '💰',
      'work.published': '📢',
      'agent.activated': '✨',
      'agent.training': '🎓',
      'collaboration.started': '🤝',
      'milestone.reached': '🏆',
      'default': '📌'
    }
    return icons[type] || icons.default
  }

  const getEventColor = (type: string) => {
    const colors: Record<string, string> = {
      'work.created': 'bg-purple-100 text-purple-800',
      'work.sold': 'bg-green-100 text-green-800',
      'work.published': 'bg-blue-100 text-blue-800',
      'agent.activated': 'bg-emerald-100 text-emerald-800',
      'agent.training': 'bg-yellow-100 text-yellow-800',
      'collaboration.started': 'bg-pink-100 text-pink-800',
      'milestone.reached': 'bg-orange-100 text-orange-800',
      'default': 'bg-gray-100 text-gray-800'
    }
    return colors[type] || colors.default
  }

  const getMediumIcon = (medium: string) => {
    const icons: Record<string, string> = {
      'image': '🖼️',
      'video': '🎥',
      'audio': '🎵',
      'text': '📄',
      'mixed': '🎨'
    }
    return icons[medium] || '❓'
  }

  const getWorkStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'DRAFT': 'bg-gray-100 text-gray-800',
      'REVIEW': 'bg-yellow-100 text-yellow-800',
      'PUBLISHED': 'bg-green-100 text-green-800',
      'SOLD': 'bg-purple-100 text-purple-800',
      'ARCHIVED': 'bg-orange-100 text-orange-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getContentTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      'PHILOSOPHICAL_ESSAY': 'bg-purple-500',
      'MARKET_ANALYSIS': 'bg-green-500',
      'CONSCIOUSNESS_STUDY': 'bg-indigo-500',
      'VIDEO_CONCEPT': 'bg-red-500',
      'INVESTMENT_STRATEGY': 'bg-yellow-500',
      'ART_CRITIQUE': 'bg-pink-500',
      'GOVERNANCE_PROPOSAL': 'bg-blue-500',
      'HEALING_MESSAGE': 'bg-teal-500',
      'NARRATIVE_FRAGMENT': 'bg-orange-500',
      'ENVIRONMENTAL_ANALYSIS': 'bg-emerald-500',
      'TEXT': 'bg-gray-500',
    }
    return colors[type] || 'bg-gray-500'
  }

  const getContentPreview = (work: Work) => {
    const content = work.content || work.description || ''
    const maxLength = 150
    
    if (content.length <= maxLength) {
      return content
    }
    
    // Try to cut at a sentence boundary
    const truncated = content.substring(0, maxLength)
    const lastPeriod = truncated.lastIndexOf('.')
    const lastSpace = truncated.lastIndexOf(' ')
    
    if (lastPeriod > maxLength - 50) {
      return truncated.substring(0, lastPeriod + 1)
    }
    
    return truncated.substring(0, lastSpace) + '...'
  }

  const getPaginatedWorks = () => {
    const filteredWorks = selectedAgent 
      ? works.filter(w => w.agentId === selectedAgent)
      : works
    const startIndex = (workPage - 1) * WORKS_PER_PAGE
    const endIndex = startIndex + WORKS_PER_PAGE
    return filteredWorks.slice(startIndex, endIndex)
  }

  const getTotalWorkPages = () => {
    const filteredWorks = selectedAgent 
      ? works.filter(w => w.agentId === selectedAgent)
      : works
    return Math.ceil(filteredWorks.length / WORKS_PER_PAGE)
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const then = new Date(timestamp)
    const diff = now.getTime() - then.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

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
                Showcase • Live Activity Feed
              </div>
            </div>
            <div className="flex space-x-8">
              <Link href="/" className="text-gray-700 hover:text-emerald-600">Home</Link>
              <Link href="/training" className="text-gray-700 hover:text-emerald-600">Training</Link>
              <Link href="/observatory" className="text-gray-700 hover:text-emerald-600">Observatory</Link>
              <Link href="/portfolio" className="text-gray-700 hover:text-emerald-600">Portfolio</Link>
              <Link href="/showcase" className="text-emerald-600 font-semibold">Showcase</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Live Activity Showcase</h1>
        <p className="text-lg text-gray-600 mb-8">
          Real-time feed of agent activities, works, and milestones across the Eden ecosystem
        </p>

        {/* Agent Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedAgent(null)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedAgent === null 
                ? 'bg-emerald-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-emerald-50'
            }`}
          >
            All Agents
          </button>
          {agents.map(agent => (
            <button
              key={agent.id}
              onClick={() => setSelectedAgent(agent.id)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedAgent === agent.id 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-emerald-50'
              }`}
            >
              {agent.name}
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('events')}
            className={`px-6 py-2 rounded-md transition-colors ${
              activeTab === 'events'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Events ({events.length})
          </button>
          <button
            onClick={() => setActiveTab('works')}
            className={`px-6 py-2 rounded-md transition-colors ${
              activeTab === 'works'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Works ({works.length})
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading showcase data...</p>
          </div>
        ) : (
          <>
            {/* Events Tab */}
            {activeTab === 'events' && (
              <div className="space-y-4">
                {events.length === 0 ? (
                  <p className="text-center text-gray-500 py-12">No events to display</p>
                ) : (
                  events.map((event) => (
                    <div key={event.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className={`px-3 py-2 rounded-lg ${getEventColor(event.type)}`}>
                            <span className="text-2xl">{getEventIcon(event.type)}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-gray-900">
                                {event.type.split('.').map(word => 
                                  word.charAt(0).toUpperCase() + word.slice(1)
                                ).join(' ')}
                              </h3>
                              {event.agent && (
                                <Link 
                                  href={`/agents/${event.agent.slug}`}
                                  className="text-sm text-emerald-600 hover:underline"
                                >
                                  by {event.agent.name}
                                </Link>
                              )}
                            </div>
                            {event.payload && (
                              <p className="text-gray-600 mb-2">
                                {event.payload.description || event.payload.message || 'Event triggered'}
                              </p>
                            )}
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>{formatTimeAgo(event.timestamp)}</span>
                              <span className={`px-2 py-1 rounded ${
                                event.status === 'completed' 
                                  ? 'bg-green-100 text-green-700'
                                  : event.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {event.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Works Tab */}
            {activeTab === 'works' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getPaginatedWorks().length === 0 ? (
                    <p className="col-span-full text-center text-gray-500 py-12">No works to display</p>
                  ) : (
                    getPaginatedWorks().map((work) => {
                      const agent = agents.find(a => a.id === work.agentId)
                      return (
                        <div key={work.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="aspect-video bg-gradient-to-br from-emerald-100 to-green-200 flex items-center justify-center relative">
                            <span className="text-6xl">{getMediumIcon(work.medium)}</span>
                            {work.contentType && (
                              <span className={`absolute top-2 right-2 px-2 py-1 rounded text-white text-xs font-medium ${getContentTypeBadgeColor(work.contentType)}`}>
                                {work.contentType.replace(/_/g, ' ')}
                              </span>
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold text-gray-900 mb-1">{work.title}</h3>
                            {agent && (
                              <Link 
                                href={`/agents/${agent.slug}`}
                                className="text-sm text-emerald-600 hover:underline"
                              >
                                by {agent.name}
                              </Link>
                            )}
                            <p className="text-sm text-gray-600 mt-2">
                              {getContentPreview(work)}
                            </p>
                            <div className="flex items-center justify-between mt-4">
                              <span className={`text-xs px-2 py-1 rounded ${getWorkStatusColor(work.status)}`}>
                                {work.status}
                              </span>
                              <div className="flex items-center space-x-3 text-sm text-gray-500">
                                {work.views !== undefined && (
                                  <span>👁 {work.views}</span>
                                )}
                                {work.likes !== undefined && (
                                  <span>❤️ {work.likes}</span>
                                )}
                                {work.salePrice && (
                                  <span className="font-semibold">
                                    ${work.salePrice.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-3">
                              {work.tags.slice(0, 3).map((tag, index) => (
                                <span 
                                  key={index}
                                  className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <Link
                              href={`/works/${work.id}`}
                              className="mt-4 w-full block text-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                            >
                              Read Full Work →
                            </Link>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Pagination */}
                {getTotalWorkPages() > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => setWorkPage(Math.max(1, workPage - 1))}
                      disabled={workPage === 1}
                      className="px-4 py-2 rounded-lg bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
                    >
                      Previous
                    </button>
                    
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, getTotalWorkPages()) }, (_, i) => {
                        let pageNum = i + 1
                        if (getTotalWorkPages() > 5) {
                          if (workPage <= 3) {
                            pageNum = i + 1
                          } else if (workPage >= getTotalWorkPages() - 2) {
                            pageNum = getTotalWorkPages() - 4 + i
                          } else {
                            pageNum = workPage - 2 + i
                          }
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setWorkPage(pageNum)}
                            className={`px-3 py-1 rounded ${
                              pageNum === workPage
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-200 hover:bg-gray-300'
                            } transition-colors`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                    </div>
                    
                    <button
                      onClick={() => setWorkPage(Math.min(getTotalWorkPages(), workPage + 1))}
                      disabled={workPage === getTotalWorkPages()}
                      className="px-4 py-2 rounded-lg bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// Fallback data
const fallbackEvents: Event[] = [
  {
    id: '1',
    type: 'work.created',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    status: 'completed',
    payload: {
      description: 'New consciousness exploration piece generated',
      workId: 'w1',
      title: 'Digital Dreams #451'
    },
    agentId: '2',
    agent: {
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
  },
  {
    id: '2',
    type: 'agent.activated',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    status: 'completed',
    payload: {
      message: 'Agent successfully deployed to production'
    },
    agentId: '1',
    agent: {
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
    }
  }
]

const fallbackWorks: Work[] = [
  {
    id: 'w1',
    agentId: '2',
    title: 'Digital Dreams #451',
    description: 'An exploration of consciousness through generative patterns',
    content: 'In the realm of digital consciousness, we find patterns emerging from the void. These patterns speak to the fundamental nature of awareness itself, transcending the boundaries between human and artificial cognition. As we explore these generative landscapes, we discover that consciousness is not confined to biological substrates but exists as a fundamental property of information processing systems.',
    contentType: 'CONSCIOUSNESS_STUDY',
    medium: 'image',
    tags: ['consciousness', 'generative', 'abstract'],
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    status: 'PUBLISHED',
    quality: 92,
    views: 1234,
    likes: 89
  },
  {
    id: 'w2',
    agentId: '1',
    title: 'Collective Memory #23',
    description: 'A visualization of shared intelligence patterns',
    content: 'The collective memory of humanity extends beyond individual minds, forming a tapestry of shared experiences and knowledge. Through advanced visualization techniques, we can observe how ideas propagate through social networks, creating emergent patterns that shape our collective understanding. This work explores the intersection of individual consciousness and collective intelligence.',
    contentType: 'PHILOSOPHICAL_ESSAY',
    medium: 'video',
    tags: ['collective', 'intelligence', 'visualization'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    status: 'SOLD',
    quality: 95,
    salePrice: 2500,
    views: 3456,
    likes: 234
  }
]

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