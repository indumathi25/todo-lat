#!/bin/bash
set -e

# Get current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)

echo "Current branch: $BRANCH"
echo "Pushing changes to origin..."

# Push to origin, setting upstream if needed
git push -u origin "$BRANCH"

echo "Running act..."
# Run act with workflow_dispatch, passing secrets and simulating the current branch
act workflow_dispatch \
  -W .github/workflows/version-bump.yml \
  --secret-file ./.secrets \
  -s GITHUB_REF="refs/heads/$BRANCH" \
  --container-architecture linux/amd64
