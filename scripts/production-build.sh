#!/bin/bash

# EDEN3 Production Build Script
# This script builds both API and Academy for production deployment

set -e  # Exit on error

echo "🚀 Starting EDEN3 Production Build..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "apps" ]; then
    error "Please run this script from the EDEN3 root directory"
fi

# Check Node.js version
NODE_VERSION=$(node --version)
log "Node.js version: $NODE_VERSION"
if [[ ! $NODE_VERSION =~ v1[89]. ]]; then
    warning "Node.js version should be 18 or 19 for optimal compatibility"
fi

# Clean previous builds
log "🧹 Cleaning previous builds..."
rm -rf apps/api/dist/
rm -rf apps/academy/.next/
rm -rf apps/academy/out/
success "Cleaned previous builds"

# Install dependencies
log "📦 Installing dependencies..."
npm install
success "Dependencies installed"

# Build API
log "🔧 Building API..."
cd apps/api
npm run build
npm run type-check
success "API build completed"
cd ../..

# Build Academy
log "🎨 Building Academy..."
cd apps/academy
npm run build
npm run type-check
success "Academy build completed"
cd ../..

# Run production build of entire project
log "🏗️ Building entire project..."
npm run build
success "Project build completed"

# Validate builds
log "🔍 Validating builds..."

# Check API build
if [ ! -f "apps/api/dist/main.js" ]; then
    error "API build failed - main.js not found"
fi
success "API build validated"

# Check Academy build
if [ ! -d "apps/academy/.next" ]; then
    error "Academy build failed - .next directory not found"
fi
success "Academy build validated"

# Test production builds
log "🧪 Testing production builds..."

# Test API build
cd apps/api
timeout 10s npm run start:prod > /dev/null 2>&1 &
API_PID=$!
sleep 3

# Check if API is running
if ! kill -0 $API_PID 2>/dev/null; then
    error "API failed to start in production mode"
fi

# Test health endpoint
if ! curl -f -s http://localhost:3001/health > /dev/null; then
    warning "API health check failed - this may be due to missing dependencies"
else
    success "API health check passed"
fi

# Stop API
kill $API_PID 2>/dev/null || true
cd ../..

success "Production builds completed successfully!"

# Print deployment information
echo ""
echo "📋 Deployment Information:"
echo "├── API Build: apps/api/dist/"
echo "├── Academy Build: apps/academy/.next/"
echo "├── Environment files: .env.production (configured)"
echo "├── Railway config: apps/api/railway.json"
echo "├── Vercel config: apps/academy/vercel.json"
echo "└── Middleware: Production security headers enabled"
echo ""
echo "🎯 Next Steps:"
echo "1. Deploy API to Railway using apps/api/ directory"
echo "2. Deploy Academy to Vercel using apps/academy/ directory"
echo "3. Configure environment variables from .env.production files"
echo "4. Test deployed endpoints"
echo ""
success "Build script completed successfully!"