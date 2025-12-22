#!/bin/bash
set -e

echo "Running migrations..."
docker-compose run --rm backend python manage.py migrate
echo "Migrations applied successfully."
