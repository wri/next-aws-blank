'use client'
import { Button, InlineMessage } from '@worldresources/wri-design-systems'
import styles from './page.module.css'

export default function Home() {
  const environment = process.env.NEXT_PUBLIC_ENVIRONMENT || 'development'

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>Welcome to Next.js on ECS Fargate</h1>
        <p className={styles.description}>
          This application is deployed using Terraform and GitHub Actions
        </p>
        <Button variant='primary' size='default'>
          {`Environment: ${environment}`}
        </Button>
        <div className={styles.grid}>
          <InlineMessage
            icon=''
            variant='info-white'
            label='Infrastructure as Code'
            caption='Deployed with Terraform on AWS ECS Fargate'
          />
          <InlineMessage
            icon=''
            variant='info-white'
            label='CI/CD Pipeline'
            caption='Automated deployments via GitHub Actions'
          />
        </div>
        <div className={styles.grid}>
          <InlineMessage
            icon=''
            variant='info-white'
            label='Multi-Environment'
            caption='Separate QA and Production environments'
          />
          <InlineMessage
            icon=''
            variant='info-white'
            label='Containerized'
            caption='Docker container with standalone Next.js build'
          />
        </div>
      </div>
    </main>
  )
}
