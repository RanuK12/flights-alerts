#!/bin/bash
# Deploy to Render

# Build Docker image
docker build -t flight-alerts .

# Tag and push to Render's registry
# Replace SERVICE_ID with your Render service ID
echo "Deploying to Render..."
# docker tag flight-alerts registry.render.com/SERVICE_ID/flight-alerts
# docker push registry.render.com/SERVICE_ID/flight-alerts

# Trigger redeploy via Render API (requires API key)
# curl -X POST https://api.render.com/v1/services/SERVICE_ID/deploys \
#   -H "Authorization: Bearer $RENDER_API_KEY" \
#   -H "Content-Type: application/json"

echo "✅ Deployment script ready. Update SERVICE_ID and RENDER_API_KEY to automate."
