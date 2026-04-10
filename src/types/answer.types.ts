export enum AnswerStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETE = 'complete',
}

export enum AnswerValue {
  YES = 'yes',
  PARTLY = 'partly',
  NO = 'no',
  NA = 'na',
}

export type Strategy = {
  id: string
  title: string
  description: string
  scale: string
  deadline: string
  status?: string
  responsibility: string
  priority: string
}

export interface PlainContributor {
  id: string
  name: string
  assessmentId: string
  createdAt: Date | string
}
