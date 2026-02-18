# AWS Elastic Beanstalk Deployment Guide for CertifyChain

## Prerequisites

### 1. AWS Account Setup
- Create an AWS account at https://aws.amazon.com
- Set up billing alerts to monitor costs
- Enable MFA (Multi-Factor Authentication) for security

### 2. IAM User & Permissions
Create an IAM user with the following permissions:
- `AWSElasticBeanstalkFullAccess`
- `AmazonRDSFullAccess`
- `AmazonS3FullAccess`
- `IAMReadOnlyAccess`
- `AmazonEC2FullAccess`

Save the credentials:
- Access Key ID
- Secret Access Key

### 3. Install AWS Tools

#### AWS CLI
```bash
# Download and install from:
https://aws.amazon.com/cli/

# Configure CLI
aws configure
# Enter:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region (e.g., us-east-1)
# - Default output format: json
```

#### AWS Elastic Beanstalk CLI
```bash
pip install awsebcli --upgrade
```

#### .NET AWS Extensions
```bash
dotnet tool install -g Amazon.ElasticBeanstalk.Tools
```

## AWS Resources You Need to Provision

### 1. RDS Database (SQL Server)
```bash
# Create RDS SQL Server instance:
# - Engine: SQL Server Express (free tier) or SQL Server Standard
# - Instance class: db.t3.small or larger
# - Storage: 20-100 GB
# - Enable automated backups
# - Multi-AZ deployment (for production)

# Save these values:
RDS_ENDPOINT=your-db-instance.xxxxxx.region.rds.amazonaws.com
RDS_PORT=1433
RDS_USERNAME=admin
RDS_PASSWORD=YourSecurePassword123!
RDS_DATABASE=CertifyChain
```

**Connection String Format:**
```
Server={RDS_ENDPOINT},{RDS_PORT};Database={RDS_DATABASE};User Id={RDS_USERNAME};Password={RDS_PASSWORD};TrustServerCertificate=True;
```

### 2. S3 Buckets (Optional but Recommended)
```bash
# Create S3 buckets for:
# - Application deployment packages
# - File uploads (logos, seals, etc.)
# - IPFS backup storage

aws s3 mb s3://certifychain-deployments
aws s3 mb s3://certifychain-files
```

### 3. Elastic Beanstalk Environment

#### Initialize EB
```bash
# Navigate to your solution directory
cd /path/to/CertifyChain

# Initialize Elastic Beanstalk
eb init

# Follow prompts:
# - Select region (e.g., us-east-1)
# - Create new application: CertifyChain
# - Select platform: .NET on Windows Server
# - Platform version: Latest .NET 8
# - SSH: No (or Yes if you want SSH access)
```

#### Create Environment
```bash
eb create certifychain-prod

# Or with options:
eb create certifychain-prod \
  --instance-type t3.medium \
  --platform ".NET on Windows Server" \
  --scale 1-4 \
  --envvars ASPNETCORE_ENVIRONMENT=Production
```

### 4. Environment Variables to Set

Set these via AWS Console or CLI:

```bash
eb setenv \
  ASPNETCORE_ENVIRONMENT=Production \
  ConnectionStrings__DefaultConnection="Server=your-db.rds.amazonaws.com,1433;Database=CertifyChain;User Id=admin;Password=YourPassword;TrustServerCertificate=True;" \
  AppSettings__Secret="your-256-bit-secret-key-here" \
  AppSettings__JwtExpiryMinutes=60 \
  AppSettings__RefreshTokenExpiryDays=7 \
  SMTP__Host="email-smtp.region.amazonaws.com" \
  SMTP__Port=587 \
  SMTP__Username="YOUR_SMTP_USERNAME" \
  SMTP__Password="YOUR_SMTP_PASSWORD" \
  SMTP__FromEmail="noreply@certifychain.com" \
  IPFS__Gateway="https://ipfs.io" \
  Blockchain__NetworkUrl="https://your-blockchain-node" \
  Blockchain__ContractAddress="0xYourContractAddress" \
  Blockchain__PrivateKey="YOUR_PRIVATE_KEY"
```

### 5. SSL Certificate (HTTPS)

#### Option A: AWS Certificate Manager (Free)
```bash
# Request certificate in AWS Certificate Manager
# - Domain: api.certifychain.com
# - Validation: DNS or Email
# - Attach to Load Balancer in EB environment
```

#### Option B: Let's Encrypt
```bash
# Add to .ebextensions/07-ssl.config
# (Configuration for Let's Encrypt on Windows)
```

## Deployment Steps

### 1. Prepare Application for Deployment

```bash
# Navigate to API project
cd CertifyChain.Api

# Restore dependencies
dotnet restore

# Build in Release mode
dotnet build --configuration Release

# Publish
dotnet publish --configuration Release --output ./publish
```

### 2. Deploy to Elastic Beanstalk

```bash
# Deploy using EB CLI
eb deploy

# Or deploy with AWS Extensions
dotnet aws deploy

# Or create deployment package manually
cd publish
Compress-Archive -Path * -DestinationPath ../deployment.zip
eb deploy --staged
```

### 3. Monitor Deployment

```bash
# View logs
eb logs

# Check health
eb health

# Open application
eb open

# SSH into instance (if enabled)
eb ssh
```

## Post-Deployment Configuration

### 1. Database Migration

```bash
# Migrations run automatically via .ebextensions/05-database-migration.config
# Or run manually:
eb ssh
cd C:\inetpub\wwwroot
dotnet ef database update
```

### 2. Configure Load Balancer

- Go to EC2 → Load Balancers
- Select your EB load balancer
- Add HTTPS listener (port 443)
- Attach SSL certificate
- Configure health check: `/health`

### 3. Configure Auto Scaling

```bash
# Update scaling in .ebextensions/01-environment.config
# Or via console:
# - Min instances: 1
# - Max instances: 4
# - Scaling triggers: CPU > 70%
```

### 4. Set Up CloudWatch Alarms

Create alarms for:
- High CPU usage
- High memory usage
- Database connection failures
- 5xx errors
- Request count spikes

### 5. Configure Domain

```bash
# In Route 53:
# Create A record: api.certifychain.com → EB Load Balancer
# Or CNAME: api.certifychain.com → certifychain-prod.region.elasticbeanstalk.com
```

## Cost Estimation (Monthly)

### Minimal Setup (Development)
- EB Environment (t3.small): ~$15
- RDS SQL Server Express (db.t3.small): ~$30
- Load Balancer: ~$18
- Data Transfer: ~$5
**Total: ~$68/month**

### Production Setup
- EB Environment (t3.medium x 2): ~$60
- RDS SQL Server Standard (db.t3.medium): ~$120
- Load Balancer: ~$18
- S3 Storage: ~$5
- Data Transfer: ~$20
- CloudWatch: ~$10
**Total: ~$233/month**

## Monitoring & Maintenance

### View Logs
```bash
# Application logs
eb logs --all

# CloudWatch Logs
aws logs tail /aws/elasticbeanstalk/certifychain-prod/var/log/eb-engine.log --follow

# IIS logs
# Available in CloudWatch Logs group
```

### Update Application
```bash
# After code changes
dotnet publish --configuration Release
eb deploy
```

### Rollback
```bash
eb deploy --version <previous-version>
```

## Security Checklist

- [ ] Enable VPC for RDS (not publicly accessible)
- [ ] Use Security Groups to restrict access
- [ ] Enable SSL/TLS (HTTPS only)
- [ ] Store secrets in AWS Secrets Manager
- [ ] Enable CloudWatch logging
- [ ] Configure WAF (Web Application Firewall)
- [ ] Enable backup for RDS
- [ ] Set up CloudTrail for audit logging
- [ ] Configure CORS properly
- [ ] Use IAM roles instead of access keys where possible

## Troubleshooting

### Application won't start
```bash
eb logs
# Check for:
# - Missing environment variables
# - Database connection issues
# - Missing dependencies
```

### 502 Bad Gateway
- Check application logs
- Verify IIS configuration
- Check if application is listening on correct port

### Database connection issues
- Verify RDS security group allows inbound from EB security group
- Check connection string format
- Verify database exists

### High costs
- Review CloudWatch metrics
- Check auto-scaling settings
- Review RDS instance size
- Monitor data transfer

## CI/CD Integration (Optional)

### Using GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to AWS EB

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup .NET
        uses: actions/setup-dotnet@v1
        with:
          dotnet-version: 8.0.x
      
      - name: Build
        run: dotnet build --configuration Release
      
      - name: Publish
        run: dotnet publish --configuration Release --output ./publish
      
      - name: Deploy to EB
        uses: einaregilsson/beanstalk-deploy@v21
        with:
          aws_access_key: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws_secret_key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          application_name: CertifyChain
          environment_name: certifychain-prod
          region: us-east-1
          version_label: ${{ github.sha }}
          deployment_package: publish
```

## Support Resources

- AWS Elastic Beanstalk Docs: https://docs.aws.amazon.com/elasticbeanstalk/
- AWS RDS Docs: https://docs.aws.amazon.com/rds/
- AWS Support: https://aws.amazon.com/support/
- .NET on AWS: https://aws.amazon.com/developer/language/net/

## Next Steps

1. ✅ Create AWS account
2. ✅ Set up IAM user
3. ✅ Install AWS CLI and EB CLI
4. ✅ Provision RDS database
5. ✅ Initialize EB application
6. ✅ Set environment variables
7. ✅ Deploy application
8. ✅ Configure domain and SSL
9. ✅ Set up monitoring
10. ✅ Test thoroughly

Need help? Check AWS documentation or contact AWS Support.
