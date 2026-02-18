#!/bin/bash

# CertifyChain AWS Elastic Beanstalk Deployment Script

echo "🚀 Starting CertifyChain deployment to AWS Elastic Beanstalk..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if EB CLI is installed
if ! command -v eb &> /dev/null; then
    echo "❌ EB CLI is not installed. Installing..."
    pip install awsebcli --upgrade
fi

# Navigate to solution directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Build the application
echo "📦 Building application..."
dotnet restore
dotnet build --configuration Release

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Publish the application
echo "📤 Publishing application..."
dotnet publish CertifyChain.Api/CertifyChain.Api.csproj --configuration Release --output ./publish

if [ $? -ne 0 ]; then
    echo "❌ Publish failed!"
    exit 1
fi

# Create deployment package
echo "📦 Creating deployment package..."
cd publish
zip -r ../deployment.zip .
cd ..

# Deploy to Elastic Beanstalk
echo "🚀 Deploying to Elastic Beanstalk..."
eb deploy

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Opening application..."
    eb open
else
    echo "❌ Deployment failed!"
    echo "📋 Checking logs..."
    eb logs
    exit 1
fi

# Clean up
rm -rf publish
rm deployment.zip

echo "✨ Deployment complete!"
