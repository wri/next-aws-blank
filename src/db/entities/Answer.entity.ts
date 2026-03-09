import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  PrimaryColumn,
} from 'typeorm'
import type { Assessment } from './Assessment.entity'
import type { Question } from './Question.entity'
// import { Strategy } from './Strategy.entity.candidate' // On hold

export enum AnswerValue {
  YES = 'yes',
  PARTLY = 'partly',
  NO = 'no',
  NA = 'na',
}

export enum AnswerStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETE = 'complete',
}

@Entity('answer')
export class Answer {
  @PrimaryColumn('uuid', { default: () => 'uuid_generate_v4()' })
  id!: string

  @Column({ type: 'enum', enum: AnswerValue, nullable: true })
  value!: AnswerValue | null

  @Column({ type: 'text', nullable: true })
  rationale!: string | null

  @Column({ type: 'text', nullable: true })
  notes!: string | null

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  @PrimaryColumn({ name: 'updated_at', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date

  @ManyToOne('Assessment', 'answers', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'assessment_id' })
  @Index()
  assessment!: Assessment

  @Column({ name: 'assessment_id', type: 'uuid' })
  assessmentId!: string

  @ManyToOne('Question', 'answers', {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'question_id' })
  @Index()
  question!: Question

  @Column({ name: 'question_id', type: 'uuid' })
  questionId!: string

  @Column({
    name: 'status',
    type: 'enum',
    enum: AnswerStatus,
    default: AnswerStatus.NOT_STARTED,
  })
  @Index()
  status!: AnswerStatus

  // @OneToMany(() => Strategy, (strategy) => strategy.answer) // On hold
  // strategies!: Strategy[]
}
