#!/bin/bash
set -e

VERSION=$1

if [ -z "$VERSION" ]; then
    echo "Usage: ./scripts/deploy.sh <version>"
    echo "Example: ./scripts/deploy.sh v1.0.0"
    exit 1
fi

echo "Deploying version $VERSION..."

# Export the TAG variable for docker-compose
export TAG=$VERSION

# Build the images with the specific tag
docker-compose build

# Run migrations (ensure DB is up to date for this version)
echo "Running migrations..."
docker-compose run --rm backend python manage.py migrate

# Restart services with the new version
docker-compose up -d

echo "Deployed version $VERSION successfully."
