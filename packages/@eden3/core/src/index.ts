/**
 * @eden3/core - EDEN3 Core Package
 * 
 * Comprehensive types, Zod schemas, and constants for the EDEN3 ecosystem.
 * This package serves as the single source of truth for data structures
 * and validation across all EDEN3 applications.
 */

// Export all schemas
export * from './schemas';

// Export all types
export * from './types';

// Export all constants
export * from './constants';

// Re-export Zod for convenience
export { z } from 'zod';

// Package metadata
export const PACKAGE_INFO = {
  name: '@eden3/core',
  version: '0.1.0',
  description: 'EDEN3 Core - Types, Zod Schemas, and Constants',
  repository: 'https://github.com/eden-network/eden3',
  license: 'MIT',
} as const;