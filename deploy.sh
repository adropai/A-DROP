#!/bin/bash

# Production deployment script for A-DROP
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="a-drop"
ENVIRONMENT=${1:-production}
BACKUP_DIR="/backups/$(date +%Y%m%d_%H%M%S)"

echo -e "${BLUE}🚀 Starting A-DROP deployment to ${ENVIRONMENT}...${NC}"

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    echo -e "${BLUE}🔍 Checking prerequisites...${NC}"
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        exit 1
    fi
    
    # Check if .env file exists
    if [ ! -f ".env.${ENVIRONMENT}" ]; then
        print_warning ".env.${ENVIRONMENT} file not found, using defaults"
    fi
    
    print_status "Prerequisites check completed"
}

# Create backup
create_backup() {
    echo -e "${BLUE}💾 Creating backup...${NC}"
    
    mkdir -p ${BACKUP_DIR}
    
    # Backup database
    if docker ps | grep -q adrop-postgres; then
        docker exec adrop-postgres pg_dump -U adrop_user adrop_db > ${BACKUP_DIR}/database.sql
        print_status "Database backup created"
    fi
    
    # Backup volumes
    docker run --rm -v adrop_postgres_data:/data -v ${BACKUP_DIR}:/backup alpine tar czf /backup/postgres_data.tar.gz -C /data .
    docker run --rm -v adrop_redis_data:/data -v ${BACKUP_DIR}:/backup alpine tar czf /backup/redis_data.tar.gz -C /data .
    
    print_status "Volume backups created in ${BACKUP_DIR}"
}

# Pull latest changes
pull_changes() {
    echo -e "${BLUE}📥 Pulling latest changes...${NC}"
    
    git fetch origin
    git pull origin main
    
    print_status "Code updated to latest version"
}

# Build and deploy
deploy() {
    echo -e "${BLUE}🏗️  Building and deploying...${NC}"
    
    # Copy environment file
    if [ -f ".env.${ENVIRONMENT}" ]; then
        cp .env.${ENVIRONMENT} .env
    fi
    
    # Stop existing services
    docker-compose down --remove-orphans
    
    # Remove old images
    docker system prune -f
    
    # Build and start services
    if [ "${ENVIRONMENT}" = "production" ]; then
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
    else
        docker-compose up --build -d
    fi
    
    print_status "Services deployed successfully"
}

# Health check
health_check() {
    echo -e "${BLUE}🏥 Performing health checks...${NC}"
    
    # Wait for services to start
    sleep 30
    
    # Check if services are running
    if docker ps | grep -q adrop-admin; then
        print_status "Admin panel is running"
    else
        print_error "Admin panel failed to start"
        return 1
    fi
    
    if docker ps | grep -q adrop-postgres; then
        print_status "Database is running"
    else
        print_error "Database failed to start"
        return 1
    fi
    
    if docker ps | grep -q adrop-redis; then
        print_status "Redis is running"
    else
        print_error "Redis failed to start"
        return 1
    fi
    
    # Test API endpoint
    if curl -f http://localhost:3000/api/health &> /dev/null; then
        print_status "API health check passed"
    else
        print_warning "API health check failed, but services are running"
    fi
    
    print_status "Health checks completed"
}

# Run database migrations
run_migrations() {
    echo -e "${BLUE}🗄️  Running database migrations...${NC}"
    
    docker exec adrop-admin npm run db:migrate
    docker exec adrop-admin npm run db:seed
    
    print_status "Database migrations completed"
}

# Setup monitoring
setup_monitoring() {
    echo -e "${BLUE}📊 Setting up monitoring...${NC}"
    
    # Start monitoring services if in production
    if [ "${ENVIRONMENT}" = "production" ]; then
        docker-compose -f monitoring/docker-compose.monitoring.yml up -d
        print_status "Monitoring services started"
    else
        print_status "Monitoring skipped for ${ENVIRONMENT} environment"
    fi
}

# Main deployment flow
main() {
    echo -e "${BLUE}🎯 Deploying A-DROP Restaurant Management System${NC}"
    echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
    echo -e "${BLUE}Timestamp: $(date)${NC}"
    echo "----------------------------------------"
    
    check_prerequisites
    
    if [ "${ENVIRONMENT}" = "production" ]; then
        create_backup
    fi
    
    pull_changes
    deploy
    run_migrations
    health_check
    setup_monitoring
    
    echo "----------------------------------------"
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo -e "${BLUE}📱 Admin Panel: http://localhost:3000${NC}"
    echo -e "${BLUE}🗄️  Database: localhost:5432${NC}"
    echo -e "${BLUE}💾 Redis: localhost:6379${NC}"
    
    if [ "${ENVIRONMENT}" = "production" ]; then
        echo -e "${BLUE}💾 Backup location: ${BACKUP_DIR}${NC}"
    fi
}

# Rollback function
rollback() {
    echo -e "${YELLOW}🔄 Rolling back deployment...${NC}"
    
    # Find latest backup
    LATEST_BACKUP=$(ls -t /backups/ | head -n 1)
    
    if [ -z "${LATEST_BACKUP}" ]; then
        print_error "No backup found for rollback"
        exit 1
    fi
    
    echo -e "${BLUE}📦 Using backup: ${LATEST_BACKUP}${NC}"
    
    # Stop services
    docker-compose down
    
    # Restore database
    docker run --rm -v adrop_postgres_data:/data -v /backups/${LATEST_BACKUP}:/backup alpine tar xzf /backup/postgres_data.tar.gz -C /data
    
    # Start services
    docker-compose up -d
    
    print_status "Rollback completed"
}

# Handle script arguments
case "${2}" in
    rollback)
        rollback
        ;;
    *)
        main
        ;;
esac
