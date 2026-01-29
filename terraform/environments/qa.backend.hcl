# Backend configuration for QA environment
bucket         = "next-aws-blank-app-terraform-state-shared"
key            = "qa/terraform.tfstate"
region         = "us-east-1"
dynamodb_table = "next-aws-blank-app-terraform-locks-shared"
encrypt        = true
