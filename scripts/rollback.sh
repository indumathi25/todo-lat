#!/bin/bash
set -e

APP_LABEL=$1
MIGRATION_NAME=$2

if [ -z "$APP_LABEL" ] || [ -z "$MIGRATION_NAME" ]; then
    echo "Usage: ./scripts/rollback.sh <app_label> <migration_name>"
    echo "Example: ./scripts/rollback.sh todo_api 0001_initial"
    exit 1
fi

echo "Rolling back $APP_LABEL to $MIGRATION_NAME..."
docker-compose run --rm backend python manage.py migrate $APP_LABEL $MIGRATION_NAME
echo "Rollback complete."
