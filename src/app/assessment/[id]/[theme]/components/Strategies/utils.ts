export const formatDeadline = (deadline = '') => {
  const [year, month, day] = deadline?.split('-')
  let deadlineFormatted = ''
  if (year && month && day) {
    deadlineFormatted = `${month}/${day}/${year}`
  }

  return deadlineFormatted
}
