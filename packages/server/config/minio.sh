#!/usr/bin/env bash
set -e

# MinIO credentials and endpoint
MINIO_ALIAS="local"
MINIO_ENDPOINT="http://localhost:9000"
MINIO_ACCESS_KEY="admin"
MINIO_SECRET_KEY="admin123"
BUCKET_NAME="avatars"

# Install mc if not already installed
if ! [ -x "$(command -v mc)" ]; then
  echo "MinIO client (mc) not found. Downloading..."
  curl -O https://dl.min.io/client/mc/release/linux-amd64/mc
  chmod +x mc
  sudo mv mc /usr/local/bin/
fi

# Configure mc alias
mc alias set "$MINIO_ALIAS" "$MINIO_ENDPOINT" "$MINIO_ACCESS_KEY" "$MINIO_SECRET_KEY"

# Create the bucket
mc mb "$MINIO_ALIAS/$BUCKET_NAME" || true

# Allow public read access for entire bucket
mc anonymous set download "$MINIO_ALIAS/$BUCKET_NAME"

# Confirm changes
echo "Bucket '$BUCKET_NAME' set to public-read. Objects inside can now be accessed directly."