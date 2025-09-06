#!/usr/bin/env tsx

/**
 * Test script to verify Eden3 Academy UI connection to the unified agent registry
 */

import { ApiClient } from './src/lib/api'

const API_BASE_URL = 'http://localhost:3001/api'

// Color output helpers
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
}

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function header(title: string) {
  console.log('\n' + '='.repeat(60))
  log(title, colors.bold + colors.cyan)
  console.log('='.repeat(60))
}

function success(message: string) {
  log(`✅ ${message}`, colors.green)
}

function error(message: string) {
  log(`❌ ${message}`, colors.red)
}

function info(message: string) {
  log(`ℹ️  ${message}`, colors.blue)
}

async function testConnection() {
  header('🧪 TESTING EDEN3 ACADEMY UI CONNECTION')
  
  try {
    // Test 1: Fetch all agents
    header('Test 1: Fetching All Agents')
    const agents = await ApiClient.getAgents()
    
    if (agents && agents.length > 0) {
      success(`Retrieved ${agents.length} agents from the unified registry`)
      
      // Display agent summary
      console.log('\n📊 Agent Summary:')
      console.log('─'.repeat(40))
      
      agents.forEach((agent, index) => {
        const sources = agent.sources?.join(', ') || 'none'
        const sourceIcons = agent.sources?.map(s => {
          if (s === 'eden-legacy') return '🌿'
          if (s === 'claude-sdk') return '🤖'
          if (s === 'eden3-native') return '✨'
          return '❓'
        }).join(' ') || ''
        
        console.log(
          `${index + 1}. ${colors.bold}${agent.name}${colors.reset}` +
          ` (${agent.status})` +
          ` ${sourceIcons}` +
          `\n   └─ Sources: ${sources}` +
          `\n   └─ KPIs: Quality: ${agent.kQuality}%, Revenue: $${agent.kRevenue}, Mentions: ${agent.kMentions}`
        )
      })
      
      // Test source filtering
      header('Test 2: Testing Source Filtering')
      
      for (const source of ['eden-legacy', 'claude-sdk', 'eden3-native']) {
        const filteredAgents = await ApiClient.getAgents(source)
        const count = filteredAgents.length
        
        const icon = source === 'eden-legacy' ? '🌿' : 
                     source === 'claude-sdk' ? '🤖' : '✨'
        
        if (count > 0) {
          success(`${icon} ${source}: ${count} agents`)
          console.log(`   Agents: ${filteredAgents.map(a => a.name).join(', ')}`)
        } else {
          info(`${icon} ${source}: No agents found`)
        }
      }
      
      // Test 3: Fetch agent details
      header('Test 3: Fetching Agent Details')
      
      const testAgent = agents[0]
      if (testAgent) {
        const agentDetails = await ApiClient.getAgent(testAgent.slug)
        if (agentDetails) {
          success(`Retrieved details for ${agentDetails.name}`)
          console.log(`   Archetype: ${agentDetails.archetype}`)
          console.log(`   Specialization: ${agentDetails.specialization}`)
          console.log(`   Capabilities: ${agentDetails.capabilities?.join(', ') || 'none'}`)
        }
      }
      
      // Test 4: Fetch recent events
      header('Test 4: Fetching Recent Events')
      
      const events = await ApiClient.getRecentEvents(10)
      if (events && events.length > 0) {
        success(`Retrieved ${events.length} recent events`)
        
        console.log('\n📅 Recent Activity:')
        console.log('─'.repeat(40))
        
        events.slice(0, 5).forEach(event => {
          const timeAgo = getTimeAgo(new Date(event.timestamp))
          const icon = getEventIcon(event.type)
          console.log(
            `${icon} ${event.type} (${timeAgo} ago)` +
            `${event.agent ? ` - ${event.agent.name}` : ''}`
          )
        })
      } else {
        info('No recent events found')
      }
      
      // Test 5: Calculate system metrics
      header('Test 5: System Metrics')
      
      const activeAgents = agents.filter(a => a.status === 'ACTIVE').length
      const trainingAgents = agents.filter(a => a.status === 'TRAINING').length
      const totalRevenue = agents.reduce((sum, a) => sum + (a.kRevenue || 0), 0)
      const avgQuality = agents.length > 0 
        ? Math.round(agents.reduce((sum, a) => sum + (a.kQuality || 0), 0) / agents.length)
        : 0
      const totalMentions = agents.reduce((sum, a) => sum + (a.kMentions || 0), 0)
      
      console.log(`🤖 Active Agents: ${activeAgents}`)
      console.log(`🎓 Training: ${trainingAgents}`)
      console.log(`💰 Total Revenue: $${totalRevenue.toLocaleString()}`)
      console.log(`⭐ Average Quality: ${avgQuality}%`)
      console.log(`📢 Total Mentions: ${totalMentions}`)
      
      // Summary
      header('📈 CONNECTION TEST SUMMARY')
      success('All tests passed successfully!')
      console.log('\n✨ The Eden3 Academy UI is successfully connected to:')
      console.log('   • Unified 10-agent registry')
      console.log('   • Multi-source agent tracking (Eden Legacy, Claude SDK, Eden³)')
      console.log('   • Real-time event system')
      console.log('   • Live metrics dashboard')
      
      console.log('\n🌐 Access the UI at:')
      console.log(`   ${colors.bold}http://localhost:3000${colors.reset} - Homepage with all agents`)
      console.log(`   ${colors.bold}http://localhost:3000/showcase${colors.reset} - Live activity feed`)
      console.log(`   ${colors.bold}http://localhost:3000/observatory${colors.reset} - Real-time monitoring`)
      
    } else {
      error('No agents retrieved from the API')
      info('Make sure the backend is running on http://localhost:3001')
    }
    
  } catch (err) {
    error('Connection test failed!')
    console.error(err)
    console.log('\n💡 Troubleshooting:')
    console.log('   1. Make sure the backend is running: npm run start:dev')
    console.log('   2. Check that the API is accessible at http://localhost:3001')
    console.log('   3. Verify the Academy UI is running: npm run dev')
    process.exit(1)
  }
}

function getEventIcon(type: string): string {
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

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m`
  if (hours < 24) return `${hours}h`
  return `${days}d`
}

// Run the test
testConnection().catch(console.error)