#!/bin/bash
set -e

OLD_VERSION=$1
APP_LABEL=$2
MIGRATION_NAME=$3

if [ -z "$OLD_VERSION" ] || [ -z "$APP_LABEL" ] || [ -z "$MIGRATION_NAME" ]; then
    echo "Usage: ./scripts/rollback_release.sh <old_version> <app_label> <migration_name>"
    echo "Example: ./scripts/rollback_release.sh v1.0.0 todo_api 0001_initial"
    exit 1
fi

echo "Rolling back to version $OLD_VERSION and migration $MIGRATION_NAME for app $APP_LABEL..."

# 1. Rollback Database
echo "Rolling back database..."
docker-compose run --rm backend python manage.py migrate $APP_LABEL $MIGRATION_NAME

# 2. Redeploy Old Version
export TAG=$OLD_VERSION
echo "Switching containers to version $OLD_VERSION..."
docker-compose up -d

echo "Rollback complete. Running version $OLD_VERSION with database at $MIGRATION_TARGET."
