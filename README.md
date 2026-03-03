# Restoration Diagnostic Web Application

A production-ready Next.js application for landscape restoration assessments with TypeORM, PostgreSQL, and AWS ECS Fargate deployment using Terraform and GitHub Actions.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         AWS Cloud                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                          VPC                              │  │
│  │  ┌─────────────────────┐    ┌─────────────────────────┐  │  │
│  │  │   Public Subnets    │    │    Private Subnets      │  │  │
│  │  │  ┌───────────────┐  │    │  ┌─────────────────┐    │  │  │
│  │  │  │      ALB      │  │───▶│  │   ECS Fargate   │    │  │  │
│  │  │  └───────────────┘  │    │  │     Tasks       │    │  │  │
│  │  │         │           │    │  └─────────────────┘    │  │  │
│  │  │  ┌───────────────┐  │    │          │              │  │  │
│  │  │  │  NAT Gateway  │  │◀───│──────────┘              │  │  │
│  │  │  └───────────────┘  │    │                         │  │  │
│  │  └─────────────────────┘    └─────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐│
│  │    ECR     │  │ CloudWatch │  │    RDS     │  │    S3      ││
│  │ Repository │  │    Logs    │  │ PostgreSQL │  │  (TF State)││
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
.
├── .github/
│   └── workflows/
│       ├── deploy-qa.yml           # QA deployment workflow
│       ├── deploy-production.yml   # Production deployment workflow
│       ├── pr-check.yml            # Pull request validation
│       └── destroy.yml             # Infrastructure teardown
├── src/
│   ├── db/                         # Database layer
│   │   ├── schema.dbml             # Database schema (source of truth)
│   │   ├── data-source.ts          # TypeORM configuration
│   │   ├── entities/               # TypeORM entities
│   │   │   ├── Lead.entity.ts
│   │   │   ├── Region.entity.ts
│   │   │   ├── Diagnostic.entity.ts
│   │   │   ├── Assessment.entity.ts
│   │   │   └── index.ts
│   │   ├── migrations/             # Database migrations
│   │   └── seeds/                  # Seed data
│   │       ├── 001-initial-diagnostic.seed.ts
│   │       └── index.ts
│   └── app/                        # Next.js App Router
│       ├── api/health/route.ts     # Health check endpoint
│       ├── layout.tsx
│       ├── page.tsx
│       └── globals.css
├── terraform/
│   ├── backend-setup/              # Terraform state backend
│   │   ├── main.tf
│   │   ├── setup.sh
│   │   └── teardown.sh
│   ├── infrastructure/             # Main infrastructure
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   ├── vpc.tf
│   │   ├── security_groups.tf
│   │   ├── alb.tf
│   │   ├── ecr.tf
│   │   └── ecs.tf
│   └── environments/               # Environment configs
│       ├── qa.tfvars
│       ├── qa.backend.hcl
│       ├── production.tfvars
│       └── production.backend.hcl
├── Dockerfile                      # NextJS App Container 
├── package.json
└── README.md

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 22.x (see `.nvmrc`)
- [Docker](https://www.docker.com/)
- [Terraform](https://www.terraform.io/) 1.0+ (for AWS deployment)
- [AWS CLI](https://aws.amazon.com/cli/) configured with appropriate credentials
- [GitHub](https://github.com/) account

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd gri-restoration-diagnostic

# Use correct Node.js version
nvm use

# Install dependencies
npm install
```

### 2. Database Setup (AWS RDS)

The application uses a shared AWS RDS PostgreSQL instance (`xxx`) across all environments. Each environment (dev, qa, production) has its own database within the same RDS instance.

#### Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env
```

Update `.env` with RDS credentials:

```env
# Database Configuration (AWS RDS)
DB_HOST=xxx.rds.amazonaws.com
DB_PORT=5432
DB_USER=rduser
DB_PASSWORD=<get-from-aws-parameter-store>
DB_NAME=dev  # or 'qa', 'production'

# TypeORM Configuration
TYPEORM_SYNCHRONIZE=false
TYPEORM_LOGGING=true

# Application
NODE_ENV=development

# SSL Configuration (enable for production)
DATABASE_SSL_REJECT_UNAUTHORIZED=false
```

**Getting Database Credentials:**
- Master password is stored in [AWS Systems Manager Parameter Store](https://console.aws.amazon.com/systems-manager/parameters)
- Navigate to Parameter Store and search for `xxx`

#### Security Group Configuration

The RDS instance is publicly accessible to support local development. You must add your IP to the security group:

1. Go to [EC2 Security Groups](https://console.aws.amazon.com/ec2/v2/home?region=us-east-1#SecurityGroups:)
2. Find security group `xxx-sg`
3. Add inbound rule:
   - **Type:** PostgreSQL
   - **Port:** 5432
   - **Source:** `<your-ip-address>/32`
   - **Description:** "Local dev - [Your Name]"

**Get your external IP:**
```bash
curl ifconfig.me
```

#### Run Database Migrations

```bash
# Run migrations to create tables
npm run migration:run

# Seed initial diagnostic questions (24 questions)
npm run seed:run
```

**Generate migrations when schema changes:**
```bash
npm run migration:generate
```

#### Verify Database Setup

```bash
# Connect to dev database
psql -h xxx.rds.amazonaws.com -U postgres -d dev

# List tables
\dt

# View diagnostic seed data
SELECT id, version, language FROM diagnostic;

# Exit
\q
```

**Note:** If connection times out, verify your IP is in the `xxx-sg` security group.

### 3. Set Up Terraform State Backend

Before deploying infrastructure, you need to create the S3 bucket and DynamoDB table for Terraform state:

```bash
cd terraform/backend-setup

# Make the script executable
chmod +x setup.sh

# Run setup (uses default values)
./setup.sh

# Or customize with environment variables
AWS_REGION=us-east-1 PROJECT_NAME=rd-app ./setup.sh
```

### 4. Configure GitHub Repository

1. Create a new GitHub repository
2. Push this code to the repository
3. Create the following branches:
   - `main` or `production` - Production deployments
   - `qa` - QA deployments

4. Add GitHub variables for AWS permissions (Settings → Secrets and variables → Actions -> Variables):
   - `OIDC_ROLE` - ARN from AWS console for role GitHubActionsOIDC

### 5. Required AWS IAM Permissions

The AWS credentials need permissions for:
- ECR (create/push images)
- ECS (manage clusters, services, tasks)
- EC2 (VPC, subnets, security groups, NAT gateways)
- ELB (Application Load Balancers)
- IAM (create roles and policies)
- CloudWatch (logs)
- S3 (Terraform state)
- DynamoDB (Terraform locks)

### 6. Deploy

Push to the appropriate branch to trigger deployment:

```bash
# Deploy to QA
git checkout -b qa
git push origin qa

# Deploy to Production
git checkout main
git push origin main
```

## 🔧 Local Development

```bash
# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Start production server
npm start
```

### Database Management Commands

**Migrations:**
```bash
# Generate new migration (after entity changes)
npm run migration:generate

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

**Seeding:**
```bash
# Run seed data
npm run seed:run
```

**Direct Database Access:**
```bash
# Connect to dev database
psql -h xxx.rds.amazonaws.com -U postgres -d dev

# Connect to QA database
psql -h xxx.rds.amazonaws.com -U postgres -d qa

# Connect to production database
psql -h xxx.rds.amazonaws.com -U postgres -d production
```

**⚠️ Legacy Docker Commands (Deprecated):**
```bash
# These commands are no longer used (RDS replaced local Docker)
# npm run db:start
# npm run db:stop
# npm run db:reset
```

### Docker Build

```bash
# Build image
docker build -t rd-app .

# Run container
docker run -p 3000:3000 rd-app
```

## 📋 Environment Configuration

### Database (Shared RDS Instance)
- **RDS Endpoint:** `xxx.rds.amazonaws.com`
- **Engine:** PostgreSQL 17
- **Databases:**
  - `dev` - Development database
  - `qa` - QA database
  - `production` - Production database
- **Access:** Publicly accessible with security group IP allowlist
- **Credentials:** Stored in AWS Systems Manager Parameter Store

### QA Environment
- VPC CIDR: `10.0.0.0/16`
- Database: `qa`
- Resources: 256 CPU / 512 MB Memory
- Desired count: 1 task
- Auto-scaling: 1-2 tasks

### Production Environment
- VPC CIDR: `10.1.0.0/16`
- Database: `production`
- Resources: 512 CPU / 1024 MB Memory
- Desired count: 2 tasks
- Auto-scaling: 2-10 tasks

## 🔄 CI/CD Workflows

| Workflow | Trigger | Description |
|----------|---------|-------------|
| `deploy-qa.yml` | Push to `qa` branch | Deploy to QA environment |
| `deploy-production.yml` | Push to `main`/`production` | Deploy to Production |
| `pr-check.yml` | Pull requests | Run tests and validate |
| `destroy.yml` | Manual | Tear down infrastructure |

## 🗑️ Teardown

### Destroy Infrastructure (via GitHub Actions)

1. Go to Actions → Destroy Infrastructure
2. Select the environment (qa or production)
3. Type `DESTROY` to confirm
4. Run workflow

### Destroy Terraform State Backend

```bash
cd terraform/backend-setup
chmod +x teardown.sh
./teardown.sh
```

⚠️ **Warning**: This will permanently delete all Terraform state files!

## 📊 Monitoring

- **CloudWatch Logs**: `/ecs/rd-app-{environment}`
- **Container Insights**: Enabled on ECS cluster
- **Health Check**: `GET /api/health`

## 🔐 Security Features

- VPC with public/private subnet isolation
- NAT Gateways for private subnet internet access
- Security groups limiting traffic
- S3 bucket versioning and encryption for Terraform state
- ECR image scanning on push
- Non-root container user
- HTTPS headers configured in Next.js

## 💰 Cost Optimization

- Use `FARGATE_SPOT` for non-production workloads
- Auto-scaling based on CPU/Memory utilization
- ECR lifecycle policies to clean old images
- Consider reducing NAT Gateway count for non-production

## 📝 Customization

### Adding Environment Variables

1. Update `terraform/environments/{env}.tfvars`:
```hcl
app_environment_variables = {
  "MY_VAR" = "my-value"
}
```

2. Redeploy

### Changing Resources

Edit `terraform/environments/{env}.tfvars`:
```hcl
container_cpu    = 512   # 0.5 vCPU
container_memory = 1024  # 1 GB
desired_count    = 3
```

## 🆘 Troubleshooting

### Common Issues

1. **Database connection fails**
   - Verify your IP is in the `xxx-sg` security group allowlist
   - Check `.env` has correct RDS credentials from Parameter Store
   - Test connection: `psql -h xxx.rds.amazonaws.com -U postgres -d dev`
   - Verify RDS instance is running in AWS Console

2. **Connection timeout to RDS**
   - Add your external IP to security group: `curl ifconfig.me`
   - Check VPN/firewall settings aren't blocking port 5432
   - Verify you're using the correct database name (dev/qa/production)

3. **Migration generation fails**
   - Ensure entities are properly imported in `data-source.ts`
   - Verify TypeORM can connect to RDS (check credentials)
   - Check entity decorators and column types
   - Review `tsconfig.typeorm.json` for CommonJS compatibility

4. **Deployment fails at ECS service stability**
   - Check CloudWatch logs
   - Verify health check endpoint returns 200
   - Check security group rules
   - Ensure ECS tasks can connect to RDS

5. **Terraform state lock error**
   - Wait for other deployments to complete
   - If stuck, manually release lock in DynamoDB

6. **Docker build fails**
   - Ensure all dependencies are in package.json
   - Check for missing files in .dockerignore

## 📄 License

MIT
# gri-rd
