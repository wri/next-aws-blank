// Entity candidate for custom_topic table
// On hold pending further confirmation

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm'
import { Assessment } from './Assessment.entity'
import { Question } from './Question.entity'
import { Lead } from './Lead.entity'

@Entity('custom_topic')
export class CustomTopic {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'topic_text', type: 'text' })
  topicText!: string

  @Column({ name: 'sort_order', type: 'int' })
  sortOrder!: number

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date

  // @ManyToOne(() => Assessment, (assessment) => assessment.customTopics, {  // On hold - reverse relation commented out
  @ManyToOne(() => Assessment, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'assessment_id' })
  @Index()
  assessment!: Assessment

  @Column({ name: 'assessment_id', type: 'uuid' })
  assessmentId!: string

  // @ManyToOne(() => Question, (question) => question.customTopics, {  // On hold - reverse relation commented out
  @ManyToOne(() => Question, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'question_id' })
  @Index()
  question!: Question

  @Column({ name: 'question_id', type: 'uuid' })
  questionId!: string

  // @ManyToOne(() => Lead, (lead) => lead.customTopics, {  // On hold - reverse relation commented out
  @ManyToOne(() => Lead, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'created_by' })
  @Index()
  createdBy!: Lead

  @Column({ name: 'created_by', type: 'uuid' })
  createdById!: string
}
