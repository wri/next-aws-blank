import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm'
import type { Assessment } from './Assessment.entity'

@Entity('lead')
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'job_title', type: 'varchar', nullable: true })
  jobTitle!: string | null

  @Column({ type: 'varchar' })
  name!: string

  @Column({ type: 'varchar', unique: true })
  email!: string

  @Column({ type: 'varchar', nullable: true })
  organization!: string | null

  @Column({ type: 'varchar', nullable: true })
  role!: string | null

  @Column({ type: 'varchar', nullable: true })
  gender!: string | null

  @Column({ name: 'age_range', type: 'varchar', nullable: true })
  ageRange!: string | null

  @Column({ type: 'varchar', nullable: true })
  identity!: string | null

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date

  @OneToMany('Assessment', 'lead')
  assessments!: Assessment[]
}
