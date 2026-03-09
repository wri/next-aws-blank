import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm'
import type { Assessment } from './Assessment.entity'
import type { AnswerContributor } from './AnswerContributor.entity'

@Entity('contributor')
@Unique(['assessmentId', 'name'])
@Index(['assessmentId'])
export class Contributor {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'varchar' })
  name!: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @ManyToOne('Assessment', 'contributors', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'assessment_id' })
  assessment!: Assessment

  @Column({ name: 'assessment_id', type: 'uuid' })
  assessmentId!: string

  @OneToMany('AnswerContributor', 'contributor')
  answerContributors!: AnswerContributor[]
}
