/**
 * Text Sanitization Utilities for Question Seed Data
 * 
 * Handles cleaning of CSV data including:
 * - Removing Unicode bullet points (•)
 * - Converting smart quotes to standard quotes
 * - Removing leading bullets and numbers
 * - Parsing follow-up questions into proper JSON structure
 */

export function sanitizeText(text: string | null | undefined): string | null {
  if (!text) return null
  return text
    .replace(/•/g, '\n')
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/^[\s]*[\-•*]\s*/gm, '')
    .replace(/^[\s]*\d+[.)]\s*/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n')
    .trim() || null
}

export function sanitizeQuestionText(text: string | null | undefined): string {
  if (!text) return ''
  return text
    .replace(/^[\s]*[•\-*]\s*/, '')
    .replace(/^[\s]*\d+[.)]\s*/, '')
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .trim()
}

export function parseFollowUpQuestions(text: string | null | undefined): string | null {
  if (!text) return null
  
  const lines = text
    .replace(/•/g, '\n')
    .split('\n')
    .map(line => line.replace(/^[\s]*[\-•*]\s*/, '').trim())
    .filter(line => line.length > 0)
  
  const result: { 'if yes': string[], 'if no': string[] } = {
    'if yes': [],
    'if no': []
  }
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase()
    let cleanedQuestion = line
      .replace(/^if\s*['""]?(yes|no)['""]?,?\s*(then\s*)?/i, '')
      .replace(/[""]/g, '"')
      .replace(/['']/g, "'")
      .trim()
    
    if (cleanedQuestion.length > 0) {
      cleanedQuestion = cleanedQuestion.charAt(0).toUpperCase() + cleanedQuestion.slice(1)
    }
    
    if (lowerLine.includes('if') && lowerLine.includes('yes')) {
      result['if yes'].push(cleanedQuestion)
    } else if (lowerLine.includes('if') && lowerLine.includes('no')) {
      result['if no'].push(cleanedQuestion)
    } else {
      result['if yes'].push(cleanedQuestion)
    }
  }
  
  const output: { 'if yes'?: string[], 'if no'?: string[] } = {}
  if (result['if yes'].length > 0) output['if yes'] = result['if yes']
  if (result['if no'].length > 0) output['if no'] = result['if no']
  
  return Object.keys(output).length > 0 ? JSON.stringify(output) : null
}
