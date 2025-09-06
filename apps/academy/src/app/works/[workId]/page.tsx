'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Work, Agent } from '@/types/agent';
import { getApiClient } from '@/lib/api-client';

interface WorkWithAgent extends Work {
  agent?: Agent;
}

export default function WorkPage() {
  const params = useParams();
  const router = useRouter();
  const workId = params.workId as string;
  
  const [work, setWork] = useState<WorkWithAgent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWork = async () => {
      try {
        setLoading(true);
        const apiClient = getApiClient();
        
        // First, fetch all agents to find the work
        const agentsResponse = await apiClient.getAgents();
        let foundWork: WorkWithAgent | null = null;
        let foundAgent: Agent | null = null;
        
        // Search through all agents' works to find the matching work
        for (const agent of agentsResponse.data.agents) {
          const worksResponse = await apiClient.getAgentWorks(agent.slug);
          const work = worksResponse.data.works.find((w: Work) => w.id === workId);
          
          if (work) {
            foundWork = work;
            foundAgent = agent;
            break;
          }
        }
        
        if (foundWork && foundAgent) {
          setWork({ ...foundWork, agent: foundAgent });
        } else {
          setError('Work not found');
        }
      } catch (err) {
        console.error('Error fetching work:', err);
        setError('Failed to load work');
      } finally {
        setLoading(false);
      }
    };

    fetchWork();
  }, [workId]);

  const formatContent = (content: string | null | undefined) => {
    if (!content) return null;
    
    // Convert markdown-style formatting to HTML
    const lines = content.split('\n');
    const formatted = lines.map((line, index) => {
      // Headers
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-3xl font-bold mb-4 mt-6">{line.substring(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-semibold mb-3 mt-5">{line.substring(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-semibold mb-2 mt-4">{line.substring(4)}</h3>;
      }
      
      // Empty lines become paragraph breaks
      if (line.trim() === '') {
        return <br key={index} />;
      }
      
      // Italic text (wrapped in asterisks)
      if (line.startsWith('*') && line.endsWith('*')) {
        return <p key={index} className="italic text-gray-600 dark:text-gray-400 mb-4">{line.slice(1, -1)}</p>;
      }
      
      // Regular paragraphs
      return <p key={index} className="mb-4 leading-relaxed">{line}</p>;
    });
    
    return formatted;
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

  if (error || !work) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">Error</h2>
          <p className="text-red-600 dark:text-red-300">{error || 'Work not found'}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Navigation */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        {work.agent && (
          <Link
            href={`/agents/${work.agent.slug}/works`}
            className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            View all {work.agent.name}'s works →
          </Link>
        )}
      </div>

      {/* Work Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{work.title}</h1>
            {work.description && (
              <p className="text-gray-600 dark:text-gray-400 text-lg">{work.description}</p>
            )}
          </div>
          {work.contentType && (
            <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getContentTypeBadgeColor(work.contentType)}`}>
              {work.contentType.replace(/_/g, ' ')}
            </span>
          )}
        </div>

        {/* Agent Info */}
        {work.agent && (
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
              {work.agent.name.charAt(0)}
            </div>
            <div>
              <Link
                href={`/agents/${work.agent.slug}`}
                className="font-semibold text-lg hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {work.agent.name}
              </Link>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {work.agent.type} • {work.agent.specialization}
              </p>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatDistanceToNow(new Date(work.createdAt), { addSuffix: true })}
          </div>
          {work.medium && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              {work.medium}
            </div>
          )}
          {work.quality && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Quality: {work.quality.toFixed(1)}%
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          {work.content ? (
            <div className="text-gray-800 dark:text-gray-200">
              {formatContent(work.content)}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic">No content available for this work.</p>
          )}
        </div>

        {/* Tags */}
        {work.tags && work.tags.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-2">
              {work.tags.split(',').map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                >
                  #{tag.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Additional Metadata */}
        {(work.aiModel || work.promptUsed) && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
            {work.aiModel && (
              <p className="mb-2">
                <span className="font-medium">AI Model:</span> {work.aiModel}
              </p>
            )}
            {work.promptUsed && (
              <p>
                <span className="font-medium">Prompt:</span> {work.promptUsed}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}