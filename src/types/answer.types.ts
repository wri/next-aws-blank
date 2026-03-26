export enum AnswerStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETE = 'complete',
}

export type Strategy = {
  id: string
  title: string
  description: string
  scale: string
  deadline: string
  status?: AnswerStatus
  responsibility: string
  priority: string
}

export interface PlainContributor {
  id: string
  name: string
  assessmentId: string
  createdAt: Date | string
}
