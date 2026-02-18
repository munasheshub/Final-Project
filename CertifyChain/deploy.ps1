# CertifyChain AWS Elastic Beanstalk Deployment Script (Windows)

Write-Host "🚀 Starting CertifyChain deployment to AWS Elastic Beanstalk..." -ForegroundColor Green

# Check if AWS CLI is installed
if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Host "❌ AWS CLI is not installed. Please install it first." -ForegroundColor Red
    Write-Host "Download from: https://aws.amazon.com/cli/" -ForegroundColor Yellow
    exit 1
}

# Check if EB CLI is installed
if (-not (Get-Command eb -ErrorAction SilentlyContinue)) {
    Write-Host "❌ EB CLI is not installed. Installing..." -ForegroundColor Yellow
    pip install awsebcli --upgrade
}

# Navigate to solution directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# Build the application
Write-Host "📦 Building application..." -ForegroundColor Cyan
dotnet restore
dotnet build --configuration Release

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# Publish the application
Write-Host "📤 Publishing application..." -ForegroundColor Cyan
dotnet publish CertifyChain.Api\CertifyChain.Api.csproj --configuration Release --output .\publish

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Publish failed!" -ForegroundColor Red
    exit 1
}

# Create deployment package
Write-Host "📦 Creating deployment package..." -ForegroundColor Cyan
Set-Location publish
Compress-Archive -Path * -DestinationPath ..\deployment.zip -Force
Set-Location ..

# Deploy to Elastic Beanstalk
Write-Host "🚀 Deploying to Elastic Beanstalk..." -ForegroundColor Green
eb deploy

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host "🌐 Opening application..." -ForegroundColor Cyan
    eb open
} else {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host "📋 Checking logs..." -ForegroundColor Yellow
    eb logs
    exit 1
}

# Clean up
Remove-Item -Path publish -Recurse -Force
Remove-Item -Path deployment.zip -Force

Write-Host "✨ Deployment complete!" -ForegroundColor Green
