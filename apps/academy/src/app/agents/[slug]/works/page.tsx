'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Work, Agent } from '@/types/agent';
import { getApiClient } from '@/lib/api-client';

const WORKS_PER_PAGE = 20;

export default function AgentWorksPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [agent, setAgent] = useState<Agent | null>(null);
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchAgentAndWorks = async () => {
      try {
        setLoading(true);
        const apiClient = getApiClient();
        
        // Fetch agent details
        const agentResponse = await apiClient.getAgent(slug);
        setAgent(agentResponse.data);
        
        // Fetch agent works
        const worksResponse = await apiClient.getAgentWorks(slug);
        const allWorks = worksResponse.data.works || [];
        
        // Sort works by creation date (newest first)
        const sortedWorks = allWorks.sort((a: Work, b: Work) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        setWorks(sortedWorks);
        setTotalPages(Math.ceil(sortedWorks.length / WORKS_PER_PAGE));
      } catch (err) {
        console.error('Error fetching agent works:', err);
        setError('Failed to load agent works');
      } finally {
        setLoading(false);
      }
    };

    fetchAgentAndWorks();
  }, [slug]);

  const getPaginatedWorks = () => {
    const startIndex = (page - 1) * WORKS_PER_PAGE;
    const endIndex = startIndex + WORKS_PER_PAGE;
    return works.slice(startIndex, endIndex);
  };

  const getContentPreview = (work: Work) => {
    const content = work.content || work.description || '';
    const maxLength = 300;
    
    if (content.length <= maxLength) {
      return content;
    }
    
    // Try to cut at a sentence boundary
    const truncated = content.substring(0, maxLength);
    const lastPeriod = truncated.lastIndexOf('.');
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastPeriod > maxLength - 50) {
      return truncated.substring(0, lastPeriod + 1);
    }
    
    return truncated.substring(0, lastSpace) + '...';
  };

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
    };
    return colors[type] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">Error</h2>
          <p className="text-red-600 dark:text-red-300">{error || 'Agent not found'}</p>
          <Link
            href="/agents"
            className="inline-block mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Back to Agents
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Agent Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl shadow-lg p-8 mb-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <Link
              href={`/agents/${slug}`}
              className="text-white/80 hover:text-white mb-2 inline-flex items-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Profile
            </Link>
            <h1 className="text-4xl font-bold mb-2">{agent.name}'s Works</h1>
            <p className="text-xl text-white/90 mb-4">{agent.description}</p>
            
            {/* Agent Stats */}
            <div className="flex flex-wrap gap-6 mt-6">
              <div>
                <div className="text-3xl font-bold">{works.length}</div>
                <div className="text-white/80">Total Works</div>
              </div>
              {agent.kpis && (
                <>
                  <div>
                    <div className="text-3xl font-bold">${agent.kpis.totalRevenue?.toLocaleString() || 0}</div>
                    <div className="text-white/80">Total Revenue</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">{agent.kpis.averageRating?.toFixed(1) || 0}</div>
                    <div className="text-white/80">Avg Rating</div>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-4xl font-bold">
              {agent.name.charAt(0)}
            </div>
            <span className="mt-2 px-3 py-1 bg-white/20 backdrop-blur rounded-full text-sm">
              {agent.status}
            </span>
          </div>
        </div>
      </div>

      {/* Works List */}
      {works.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No works available for this agent yet.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6">
            {getPaginatedWorks().map((work) => (
              <div
                key={work.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Link
                      href={`/works/${work.id}`}
                      className="text-2xl font-bold hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {work.title}
                    </Link>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>{formatDistanceToNow(new Date(work.createdAt), { addSuffix: true })}</span>
                      {work.medium && (
                        <>
                          <span>•</span>
                          <span>{work.medium}</span>
                        </>
                      )}
                      {work.quality && (
                        <>
                          <span>•</span>
                          <span>Quality: {work.quality.toFixed(1)}%</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {work.contentType && (
                    <span className={`px-3 py-1 rounded-full text-white text-xs font-medium ${getContentTypeBadgeColor(work.contentType)}`}>
                      {work.contentType.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>

                {/* Content Preview */}
                <div className="mb-4">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {getContentPreview(work)}
                  </p>
                </div>

                {/* Tags and Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {work.tags && work.tags.split(',').slice(0, 5).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs"
                      >
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                  
                  <Link
                    href={`/works/${work.id}`}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Read Full Work
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Previous
              </button>
              
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-1 rounded ${
                      pageNum === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                    } transition-colors`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}