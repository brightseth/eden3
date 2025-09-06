module.exports = {
  apps: [
    // Redis Server
    {
      name: 'eden3-redis',
      script: 'redis-server',
      args: '--port 6379',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      }
    },
    
    // Eden3 API Backend
    {
      name: 'eden3-api',
      script: './apps/api/dist/main.js',
      cwd: '/Users/seth/eden3',
      instances: 1,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost/eden3',
        REDIS_HOST: 'localhost',
        REDIS_PORT: 6379,
        JWT_SECRET: process.env.JWT_SECRET || 'eden3-secret-key-change-in-production',
        CORS_ORIGIN: 'http://localhost:3000'
      },
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_file: './logs/api-combined.log',
      time: true
    },
    
    // Eden3 Academy UI (Next.js)
    {
      name: 'eden3-ui',
      script: 'npm',
      args: 'run start',
      cwd: '/Users/seth/eden3/apps/academy',
      instances: 1,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_API_URL: 'http://localhost:3001/api'
      },
      error_file: '../../logs/ui-error.log',
      out_file: '../../logs/ui-out.log',
      log_file: '../../logs/ui-combined.log',
      time: true
    },
    
    // Optional: Prisma Studio for database management
    {
      name: 'eden3-studio',
      script: 'npx',
      args: 'prisma studio --port 5555 --browser none',
      cwd: '/Users/seth/eden3/apps/api',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost/eden3'
      },
      error_file: '../../logs/studio-error.log',
      out_file: '../../logs/studio-out.log',
      log_file: '../../logs/studio-combined.log',
      time: true
    }
  ],
  
  deploy: {
    production: {
      user: 'seth',
      host: 'localhost',
      ref: 'origin/main',
      repo: 'git@github.com:yourusername/eden3.git',
      path: '/Users/seth/eden3',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
}