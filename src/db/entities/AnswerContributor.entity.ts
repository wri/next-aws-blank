import {
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  Index,
} from 'typeorm'
import type { Contributor } from './Contributor.entity'

@Entity('answer_contributor')
export class AnswerContributor {
  @PrimaryColumn({ name: 'contributor_id', type: 'uuid' })
  contributorId!: string

  @PrimaryColumn({ name: 'answer_id', type: 'uuid' })
  @Index()
  answerId!: string

  @ManyToOne('Contributor', 'answerContributors', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'contributor_id' })
  contributor!: Contributor
}
