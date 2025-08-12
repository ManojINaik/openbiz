#!/bin/bash
# Udyam Registration Deployment Script

set -e

echo "🚀 Starting Udyam Registration System Deployment..."

# Configuration
PROJECT_NAME="udyam-registration"
COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_requirements() {
    log_info "Checking system requirements..."

    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    log_info "✅ All requirements met"
}

setup_environment() {
    log_info "Setting up environment..."

    if [ ! -f "$ENV_FILE" ]; then
        log_warn "Environment file not found. Creating from template..."
        cp .env.example "$ENV_FILE"
        log_warn "⚠️  Please edit .env file with your configuration before continuing."
        read -p "Press enter to continue once you've configured .env..."
    fi

    # Create necessary directories
    mkdir -p logs ssl

    log_info "✅ Environment setup complete"
}

build_and_deploy() {
    log_info "Building and deploying containers..."

    # Stop existing containers
    docker-compose -f "$COMPOSE_FILE" down

    # Build images
    log_info "Building Docker images..."
    docker-compose -f "$COMPOSE_FILE" build --no-cache

    # Start services
    log_info "Starting services..."
    docker-compose -f "$COMPOSE_FILE" up -d

    log_info "✅ Deployment complete"
}

check_health() {
    log_info "Checking service health..."

    sleep 10  # Give services time to start

    # Check database
    if docker-compose -f "$COMPOSE_FILE" exec -T db pg_isready -U postgres > /dev/null 2>&1; then
        log_info "✅ Database is healthy"
    else
        log_error "❌ Database health check failed"
        return 1
    fi

    # Check backend
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        log_info "✅ Backend is healthy"
    else
        log_error "❌ Backend health check failed"
        return 1
    fi

    # Check frontend
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        log_info "✅ Frontend is healthy"
    else
        log_error "❌ Frontend health check failed"
        return 1
    fi

    log_info "🎉 All services are running successfully!"
}

show_info() {
    echo ""
    log_info "=== Udyam Registration System ==="
    log_info "Frontend: http://localhost:3000"
    log_info "Backend API: http://localhost:3001"
    log_info "Database: localhost:5432"
    echo ""
    log_info "To view logs: docker-compose logs -f [service-name]"
    log_info "To stop services: docker-compose down"
    log_info "To restart: docker-compose restart"
    echo ""
}

run_migrations() {
    log_info "Running database migrations..."

    # Wait for database to be ready
    sleep 5

    # Run migrations
    docker-compose -f "$COMPOSE_FILE" exec backend npm run migrate || {
        log_warn "Migration script not found, database should be initialized via docker-entrypoint"
    }

    log_info "✅ Database migrations complete"
}

# Main execution
main() {
    echo "🏗️  Udyam Registration System Deployment"
    echo "======================================="

    check_requirements
    setup_environment
    build_and_deploy
    run_migrations
    check_health
    show_info

    log_info "🎉 Deployment completed successfully!"
}

# Handle script arguments
case "$1" in
    "start")
        docker-compose -f "$COMPOSE_FILE" up -d
        ;;
    "stop")
        docker-compose -f "$COMPOSE_FILE" down
        ;;
    "restart")
        docker-compose -f "$COMPOSE_FILE" restart
        ;;
    "logs")
        docker-compose -f "$COMPOSE_FILE" logs -f "${2:-}"
        ;;
    "health")
        check_health
        ;;
    *)
        main
        ;;
esac
