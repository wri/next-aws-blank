export const formatDeadline = (deadline = '') => {
  const [year, month, day] = deadline?.split('-')
  let deadlineFormatted = ''
  if (year && month && day) {
    deadlineFormatted = `${month}/${day}/${year}`
  }

  return deadlineFormatted
}

export const KNOWN_STATUS_VALUES = [
  'idea',
  'underConstruction',
  'agreed',
  'notMovingForward',
] as const

export type KnownStatusValue = (typeof KNOWN_STATUS_VALUES)[number]

export const isKnownStatus = (value: string | undefined): value is KnownStatusValue =>
  KNOWN_STATUS_VALUES.includes(value as KnownStatusValue)

export const sortStrategies = <T extends object>(
  a: T,
  b: T,
  key: string,
  order: string,
) => {
  const aRec = a as Record<string, unknown>
  const bRec = b as Record<string, unknown>

  if (key === 'priority') {
    const priorityWeight: Record<string, number> = {
      low: 1,
      medium: 2,
      high: 3,
    }
    const aWeight = priorityWeight[(aRec['priority'] as string) || ''] || 0
    const bWeight = priorityWeight[(bRec['priority'] as string) || ''] || 0
    return order === 'asc' ? aWeight - bWeight : bWeight - aWeight
  }

  const aValue = (aRec[key] as string) || ''
  const bValue = (bRec[key] as string) || ''
  return order === 'asc'
    ? aValue.localeCompare(bValue)
    : bValue.localeCompare(aValue)
}
