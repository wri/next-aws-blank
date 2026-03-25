import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm'
import type { Lead } from './Lead.entity'
import type { Region } from './Region.entity'
import type { Diagnostic } from './Diagnostic.entity'
import type { Answer } from './Answer.entity'
import type { Contributor } from './Contributor.entity'

export enum ProjectType {
  GEF_8 = 'GEF_8',
  WRI = 'WRI',
  OTHER = 'other',
}

export enum AssessmentStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
  OFFLINE = 'offline',
}

@Entity('assessments')
export class Assessment {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'password_hash', type: 'text' })
  passwordHash!: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date

  @Column({ name: 'submitted_at', type: 'timestamp', nullable: true })
  submittedAt!: Date | null

  @Column({ name: 'diagnostic_year', type: 'varchar' })
  diagnosticYear!: string

  @Column({
    name: 'project_type',
    type: 'enum',
    enum: ProjectType,
    default: ProjectType.OTHER,
  })
  projectType!: ProjectType

  @Column({
    type: 'varchar',
    default: AssessmentStatus.DRAFT,
  })
  status!: AssessmentStatus

  @ManyToOne('Lead', 'assessments', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lead_id' })
  lead!: Lead

  @Column({ name: 'lead_id', type: 'uuid' })
  leadId!: string

  @ManyToOne('Region', 'assessments', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'region_id' })
  region!: Region

  @Column({ name: 'region_id', type: 'uuid' })
  regionId!: string

  @ManyToOne('Diagnostic', 'assessments', {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'diagnostic_id' })
  diagnostic!: Diagnostic

  @Column({ name: 'diagnostic_id', type: 'uuid' })
  diagnosticId!: string

  @OneToMany('Answer', 'assessment')
  answers!: Answer[]

  @OneToMany('Contributor', 'assessment')
  contributors!: Contributor[]

  @Index()
  @Column({ name: 'title', type: 'varchar', default: 'Assessment Title' })
  title!: string

  @Column({ name: 'allow_data_sharing', type: 'boolean', default: true })
  allowDataSharing!: boolean

  @Column({ name: 'time_horizon', type: 'varchar', default: '' })
  timeHorizon!: string

  @Column({ name: 'restoration_goals', type: 'varchar', default: '' })
  restorationGoals!: string

  @Column({ name: 'engagement_strategy', type: 'varchar', default: '' })
  engagementStrategy!: string

  @Column({ name: 'materials', type: 'varchar', default: '' })
  materials!: string

  @Column({ name: 'preparation_step', type: 'varchar', default: 'target-geography' })
  preparationStep!: string
}
