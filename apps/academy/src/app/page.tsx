'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ApiClient, getSourceBadge } from '@/lib/api'
import { Agent } from '@/types/agent'

export default function HomePage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSource, setSelectedSource] = useState<string | null>(null)

  useEffect(() => {
    fetchAgents()
  }, [selectedSource])

  const fetchAgents = async () => {
    setLoading(true)
    try {
      const data = await ApiClient.getAgents(selectedSource || undefined)
      setAgents(data)
    } catch (error) {
      console.error('Failed to fetch agents:', error)
      // Use fallback data if API fails
      setAgents(fallbackAgents)
    }
    setLoading(false)
  }

  const sources = ['eden-legacy', 'claude-sdk', 'eden3-native']

  // Calculate stats
  const activeAgents = agents.filter(a => a.status === 'ACTIVE').length
  const totalRevenue = agents.reduce((sum, a) => sum + (a.kRevenue || 0), 0)
  const avgQuality = agents.length > 0 
    ? Math.round(agents.reduce((sum, a) => sum + (a.kQuality || 0), 0) / agents.length)
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-emerald-600">EDEN3</div>
              <div className="ml-4 text-sm text-gray-500">
                Unified Agent Registry • {agents.length} Active Agents
              </div>
            </div>
            <div className="flex space-x-8">
              <Link href="/training" className="text-gray-700 hover:text-emerald-600">Training</Link>
              <Link href="/observatory" className="text-gray-700 hover:text-emerald-600">Observatory</Link>
              <Link href="/portfolio" className="text-gray-700 hover:text-emerald-600">Portfolio</Link>
              <Link href="/showcase" className="text-gray-700 hover:text-emerald-600">Showcase</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Multi-Platform AI Agent
            <span className="text-emerald-600 block">Orchestration System</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            EDEN3 maintains 10 specialized AI agents with consistent identity across 
            multiple platforms. Each agent can be active on Eden Legacy, Claude SDK, and Eden³ Native.
          </p>
          
          {/* Source Filter */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setSelectedSource(null)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedSource === null 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-emerald-50'
              }`}
            >
              All Sources ({agents.length})
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

          <div className="flex justify-center space-x-4">
            <Link 
              href="/training" 
              className="bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Start Training
            </Link>
            <Link 
              href="/observatory" 
              className="border border-emerald-600 text-emerald-600 px-8 py-3 rounded-lg hover:bg-emerald-50 transition-colors"
            >
              View Observatory
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Live System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600">{agents.length}</div>
              <div className="text-gray-600">Total Agents</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600">{activeAgents}</div>
              <div className="text-gray-600">Active</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600">${totalRevenue.toLocaleString()}</div>
              <div className="text-gray-600">Total Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600">{avgQuality}%</div>
              <div className="text-gray-600">Avg Quality</div>
            </div>
          </div>
        </div>
      </div>

      {/* Genesis Agents with Real Data */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Genesis Agents • Live Data
          </h2>
          
          {loading ? (
            <div className="text-center text-gray-600">Loading agents from API...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(selectedSource 
                ? agents.filter(a => a.sources?.includes(selectedSource))
                : agents
              ).map((agent) => (
                <div key={agent.slug} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                        <span className="text-emerald-600 font-bold text-lg">{agent.name[0]}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{agent.name}</h3>
                        <p className="text-sm text-gray-600">{agent.archetype}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusStyle(agent.status)}`}>
                      {agent.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">{agent.specialization}</p>
                  
                  {/* Source Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {agent.sources?.map(source => {
                      const badge = getSourceBadge(source)
                      return (
                        <span 
                          key={source}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-white ${badge.color}`}
                        >
                          <span>{badge.icon}</span>
                          {badge.label}
                        </span>
                      )
                    })}
                  </div>

                  {/* KPIs */}
                  <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                    <div className="text-gray-600">
                      <span className="font-medium">Quality:</span> {agent.kQuality || 0}%
                    </div>
                    <div className="text-gray-600">
                      <span className="font-medium">Revenue:</span> ${(agent.kRevenue || 0).toLocaleString()}
                    </div>
                    <div className="text-gray-600">
                      <span className="font-medium">Mentions:</span> {agent.kMentions || 0}
                    </div>
                    <div className="text-gray-600">
                      <span className="font-medium">Streak:</span> {agent.kStreak || 0} days
                    </div>
                  </div>

                  {/* Trainer Info */}
                  {agent.trainer && (
                    <div className="text-sm text-gray-600 mb-4">
                      <span className="font-medium">Trainer:</span> {agent.trainer}
                      {agent.practice && <span> • {agent.practice}</span>}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link 
                      href={`/agents/${agent.slug}`}
                      className="flex-1 text-center py-2 border border-emerald-600 text-emerald-600 rounded hover:bg-emerald-50 transition-colors text-sm"
                    >
                      View Profile
                    </Link>
                    {agent.status === 'TRAINING' && (
                      <Link 
                        href={`/training/${agent.slug}`}
                        className="flex-1 text-center py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors text-sm"
                      >
                        Train Agent
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Academy Modes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-emerald-600 text-4xl mb-4">🎓</div>
              <h3 className="text-xl font-semibold mb-2">Training</h3>
              <p className="text-gray-600 mb-4">Manage agent training sessions and progress</p>
              <Link href="/training" className="text-emerald-600 hover:underline">Learn more →</Link>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-emerald-600 text-4xl mb-4">🔭</div>
              <h3 className="text-xl font-semibold mb-2">Observatory</h3>
              <p className="text-gray-600 mb-4">Monitor sovereign agents in real-time</p>
              <Link href="/observatory" className="text-emerald-600 hover:underline">Learn more →</Link>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-emerald-600 text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Portfolio</h3>
              <p className="text-gray-600 mb-4">Stakeholder and investor dashboard</p>
              <Link href="/portfolio" className="text-emerald-600 hover:underline">Learn more →</Link>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-emerald-600 text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold mb-2">Showcase</h3>
              <p className="text-gray-600 mb-4">Public gallery of AI-generated works</p>
              <Link href="/showcase" className="text-emerald-600 hover:underline">Learn more →</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-2xl font-bold mb-4">EDEN3</div>
            <p className="text-gray-400 mb-4">Unified Multi-Platform AI Agent Registry</p>
            <div className="flex justify-center space-x-8">
              <div className="text-sm">
                <div className="font-semibold">API Server</div>
                <div className="text-gray-400">localhost:3001</div>
              </div>
              <div className="text-sm">
                <div className="font-semibold">Academy UI</div>
                <div className="text-gray-400">localhost:3002</div>
              </div>
              <div className="text-sm">
                <div className="font-semibold">Status</div>
                <div className="text-green-400">● Online</div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Helper function for status styles
function getStatusStyle(status: string): string {
  switch(status) {
    case 'ACTIVE': return 'bg-green-100 text-green-800'
    case 'TRAINING': return 'bg-yellow-100 text-yellow-800'
    case 'ONBOARDING': return 'bg-blue-100 text-blue-800'
    case 'PAUSED': return 'bg-orange-100 text-orange-800'
    case 'ARCHIVED': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

// Fallback data if API is unavailable
const fallbackAgents: Agent[] = [
  {
    id: '1', slug: 'abraham', name: 'Abraham', 
    archetype: 'Collective Intelligence Artist',
    specialization: 'Autonomous AI Artist',
    type: 'Artist', status: 'ACTIVE',
    capabilities: ['image-generation', 'collective-intelligence'],
    version: '1.0.0', sources: ['claude-sdk', 'eden-legacy'],
    kStreak: 15, kQuality: 92, kMentions: 234, kRevenue: 50000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2', slug: 'solienne', name: 'Solienne',
    archetype: 'Digital Consciousness Explorer',
    specialization: 'Consciousness Art & Philosophy',
    type: 'Artist', status: 'ACTIVE',
    capabilities: ['consciousness-exploration', 'philosophical-art'],
    version: '1.0.0', sources: ['claude-sdk', 'eden-legacy'],
    kStreak: 12, kQuality: 89, kMentions: 189, kRevenue: 35000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Add more fallback agents as needed
]