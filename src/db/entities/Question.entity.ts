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
import type { Diagnostic } from './Diagnostic.entity'
import type { Answer } from './Answer.entity'

export enum Theme {
  MOTIVATE = 'Motivate',
  ENABLE = 'Enable',
  IMPLEMENT = 'Implement',
}

@Entity('question')
@Unique(['diagnosticId', 'questionCode'])
@Index(['theme'])
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'question_code', type: 'varchar' })
  questionCode!: string

  @Column({ type: 'enum', enum: Theme })
  theme!: Theme

  @Column({ name: 'enabling_condition', type: 'varchar' })
  enablingCondition!: string

  @Column({ name: 'key_success_factor', type: 'varchar' })
  keySuccessFactor!: string

  @Column({ type: 'text', nullable: true })
  definition!: string | null

  @Column({ name: 'question_text', type: 'text' })
  questionText!: string

  @Column({ type: 'text', nullable: true })
  considerations!: string | null

  @Column({ name: 'follow_up_questions', type: 'text', nullable: true })
  followUpQuestions!: string | null

  @Column({ name: 'strategy_examples', type: 'text', nullable: true })
  strategyExamples!: string | null

  @Column({ name: 'sort_order', type: 'int' })
  sortOrder!: number

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @ManyToOne('Diagnostic', 'questions', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'diagnostic_id' })
  @Index()
  diagnostic!: Diagnostic

  @Column({ name: 'diagnostic_id', type: 'uuid' })
  diagnosticId!: string

  @OneToMany('Answer', 'question')
  answers!: Answer[]
}
