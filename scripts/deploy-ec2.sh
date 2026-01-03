#!/bin/bash
set -e

# Configuration
# You can override these with environment variables
IMAGE_NAME="${IMAGE_NAME:-singaravelan21/todo-backend}"
TAG="${1:-latest}" # Pass tag as first argument, default to latest
CONTAINER_NAME="todo-backend"

# Check for required environment variables
if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL environment variable is not set."
  echo "Usage: export DATABASE_URL='postgres://user:pass@host:5432/dbname'"
  exit 1
fi

echo "Deploying $IMAGE_NAME:$TAG..."

# 1. Pull the image
echo "Pulling image..."
docker pull "$IMAGE_NAME:$TAG"

# 2. Stop and remove existing container
echo "Stopping existing container..."
docker stop "$CONTAINER_NAME" || true
docker rm "$CONTAINER_NAME" || true

# 3. Run migrations
echo "Running database migrations..."
docker run --rm \
  -e DATABASE_URL="$DATABASE_URL" \
  -e SECRET_KEY="${SECRET_KEY:-dummy-secret}" \
  "$IMAGE_NAME:$TAG" \
  python manage.py migrate

# 4. Start the new container
echo "Starting container..."
docker run -d \
  --name "$CONTAINER_NAME" \
  -p 8000:8000 \
  -e DATABASE_URL="$DATABASE_URL" \
  -e SECRET_KEY="${SECRET_KEY:-dummy-secret}" \
  -e DJANGO_ALLOWED_HOSTS="${DJANGO_ALLOWED_HOSTS:-*}" \
  -e DEBUG="${DEBUG:-0}" \
  --restart always \
  "$IMAGE_NAME:$TAG"

echo "Deployment of $IMAGE_NAME:$TAG successful!"
