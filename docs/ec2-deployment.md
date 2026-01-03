# Deploying to EC2 with RDS

This guide explains how to deploy the backend application to an EC2 instance and connect it to an RDS Postgres database.

## Prerequisites

1.  **EC2 Instance**: Running and accessible via SSH. Docker installed.
2.  **RDS Instance**: Postgres database running.
3.  **Docker Hub**: Images pushed to your repository.

## Step 1: Network Configuration (Security Groups)

To allow the EC2 instance to connect to RDS, you must configure the Security Groups.

1.  **Go to AWS Console > EC2 > Security Groups**.
2.  **Find the Security Group** attached to your **RDS** instance.
3.  **Edit Inbound Rules**.
4.  **Add Rule**:
    *   **Type**: PostgreSQL (5432)
    *   **Source**: Select "Custom" and start typing the name of your **EC2 instance's Security Group**. Select it from the list.
    *   *Alternatively (less secure)*: Use the private IP address of the EC2 instance.

## Step 2: Prepare Environment Variables

You need the following information:

*   **RDS_HOST**: The endpoint of your RDS instance (e.g., `mydb.xxx.us-east-1.rds.amazonaws.com`).
*   **RDS_USER**: The master username.
*   **RDS_PASSWORD**: The master password.
*   **RDS_DB_NAME**: The name of the database (e.g., `todo_db`).

Construct your `DATABASE_URL`:
```
postgres://<RDS_USER>:<RDS_PASSWORD>@<RDS_HOST>:5432/<RDS_DB_NAME>
```

## Step 3: Deploying on EC2

1.  **SSH into your EC2 instance**.
2.  **Log in to Docker Hub**:
    ```bash
    docker login -u <your-docker-username>
    ```
3.  **Create a deployment script** (or copy the one below).

### Deployment Script (`deploy-ec2.sh`)

Save this as `deploy.sh` on your EC2 instance.

```bash
#!/bin/bash
set -e

# Configuration
IMAGE_NAME="singaravelan21/todo-backend"
TAG="v1.0.1" # Change this to the version you want to deploy
CONTAINER_NAME="todo-backend"

# Secrets (You should ideally load these from a secure file or AWS Secrets Manager)
# For this example, export them before running the script or uncomment below:
# export DATABASE_URL="postgres://user:pass@host:5432/dbname"
# export SECRET_KEY="your-secret-key"
# export ALLOWED_HOSTS="*"

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL is not set."
  exit 1
fi

echo "Pulling latest image..."
docker pull $IMAGE_NAME:$TAG

echo "Stopping existing container..."
docker stop $CONTAINER_NAME || true
docker rm $CONTAINER_NAME || true

echo "Running migrations..."
docker run --rm \
  -e DATABASE_URL="$DATABASE_URL" \
  -e SECRET_KEY="$SECRET_KEY" \
  $IMAGE_NAME:$TAG \
  python manage.py migrate

echo "Starting new container..."
docker run -d \
  --name $CONTAINER_NAME \
  -p 8000:8000 \
  -e DATABASE_URL="$DATABASE_URL" \
  -e SECRET_KEY="$SECRET_KEY" \
  -e DJANGO_ALLOWED_HOSTS="$ALLOWED_HOSTS" \
  --restart always \
  $IMAGE_NAME:$TAG

echo "Deployment successful!"
```

4.  **Run the script**:
    ```bash
    export DATABASE_URL="postgres://..."
    export SECRET_KEY="very-secret"
    export ALLOWED_HOSTS="*" # Or your domain/IP
    chmod +x deploy.sh
    ./deploy.sh
    ```

## Troubleshooting

*   **Connection Timeout**: Check Security Groups. Ensure EC2 can reach RDS on port 5432.
*   **Authentication Failed**: Check `DATABASE_URL` credentials.
*   **Migrations Fail**: Ensure the database exists in RDS (`psql` can verify this).
