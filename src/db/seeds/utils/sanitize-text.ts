/**
 * Text Sanitization Utilities for Question Seed Data
 * 
 * Handles cleaning of CSV data including:
 * - Converting Windows-1252 encoded characters to proper UTF-8
 * - Removing Unicode bullet points (•)
 * - Converting smart quotes to standard quotes
 * - Removing leading bullets and numbers
 * - Parsing follow-up questions into proper JSON structure
 */

/**
 * Windows-1252 to UTF-8 character mapping.
 * Bytes 0x80-0x9F in Windows-1252 are control characters in ISO-8859-1/UTF-8
 * but represent printable characters in Windows-1252.
 * When read as UTF-8, these bytes produce U+FFFD (�) replacement characters.
 */
const WINDOWS_1252_MAP: Record<number, string> = {
  0x80: '\u20AC', // €
  0x82: '\u201A', // ‚
  0x83: '\u0192', // ƒ
  0x84: '\u201E', // „
  0x85: '\u2026', // …
  0x86: '\u2020', // †
  0x87: '\u2021', // ‡
  0x88: '\u02C6', // ˆ
  0x89: '\u2030', // ‰
  0x8A: '\u0160', // Š
  0x8B: '\u2039', // ‹
  0x8C: '\u0152', // Œ
  0x8E: '\u017D', // Ž
  0x91: '\u2018', // ' (left single quote)
  0x92: '\u2019', // ' (right single quote)
  0x93: '\u201C', // " (left double quote)
  0x94: '\u201D', // " (right double quote)
  0x95: '\u2022', // • (bullet)
  0x96: '\u2013', // – (en-dash)
  0x97: '\u2014', // — (em-dash)
  0x98: '\u02DC', // ˜
  0x99: '\u2122', // ™
  0x9A: '\u0161', // š
  0x9B: '\u203A', // ›
  0x9C: '\u0153', // œ
  0x9E: '\u017E', // ž
  0x9F: '\u0178', // Ÿ
}

/**
 * Convert a buffer from Windows-1252 encoding to UTF-8.
 * Private helper function used by decodeCSVBuffer.
 */
function convertFromWindows1252(buffer: Buffer): string {
  let result = ''
  for (let i = 0; i < buffer.length; i++) {
    const byte = buffer[i]
    if (byte in WINDOWS_1252_MAP) {
      result += WINDOWS_1252_MAP[byte]
    } else {
      result += String.fromCharCode(byte)
    }
  }
  return result
}

/**
 * Validate whether a buffer contains well-formed UTF-8 byte sequences.
 * Walks through raw bytes to check multi-byte sequence structure.
 * Note: U+FFFD (EF BF BD) IS valid UTF-8 and will pass this check.
 */
function isValidUtf8(buffer: Buffer): boolean {
  let i = 0
  while (i < buffer.length) {
    const byte = buffer[i]
    if (byte <= 0x7F) {
      i++
    } else if (byte >= 0xC2 && byte <= 0xDF) {
      if (i + 1 >= buffer.length || buffer[i + 1] < 0x80 || buffer[i + 1] > 0xBF) return false
      i += 2
    } else if (byte >= 0xE0 && byte <= 0xEF) {
      if (i + 2 >= buffer.length) return false
      if (byte === 0xE0 && (buffer[i + 1] < 0xA0 || buffer[i + 1] > 0xBF)) return false
      else if (byte === 0xED && (buffer[i + 1] < 0x80 || buffer[i + 1] > 0x9F)) return false
      else if (buffer[i + 1] < 0x80 || buffer[i + 1] > 0xBF) return false
      if (buffer[i + 2] < 0x80 || buffer[i + 2] > 0xBF) return false
      i += 3
    } else if (byte >= 0xF0 && byte <= 0xF4) {
      if (i + 3 >= buffer.length) return false
      if (byte === 0xF0 && (buffer[i + 1] < 0x90 || buffer[i + 1] > 0xBF)) return false
      else if (byte === 0xF4 && (buffer[i + 1] < 0x80 || buffer[i + 1] > 0x8F)) return false
      else if (buffer[i + 1] < 0x80 || buffer[i + 1] > 0xBF) return false
      if (buffer[i + 2] < 0x80 || buffer[i + 2] > 0xBF) return false
      if (buffer[i + 3] < 0x80 || buffer[i + 3] > 0xBF) return false
      i += 4
    } else {
      return false
    }
  }
  return true
}

/**
 * Decode a CSV file buffer with smart encoding detection.
 * Uses byte-level UTF-8 validation (not U+FFFD presence) to detect encoding.
 * Falls back to Windows-1252 only when actual invalid byte sequences are found.
 * 
 * @param buffer - Raw file buffer
 * @param encoding - Optional explicit encoding ('utf-8' | 'windows-1252')
 * @returns Decoded string content
 */
export function decodeCSVBuffer(buffer: Buffer, encoding?: 'utf-8' | 'windows-1252'): string {
  if (encoding === 'windows-1252') {
    return convertFromWindows1252(buffer)
  }
  
  // Validate actual byte-level UTF-8 structure
  if (isValidUtf8(buffer)) {
    const utf8Result = buffer.toString('utf-8')
    // Strip BOM if present
    const content = utf8Result.charCodeAt(0) === 0xFEFF ? utf8Result.slice(1) : utf8Result
    if (content.includes('\uFFFD')) {
      console.warn('⚠️  CSV contains U+FFFD replacement characters (likely corrupted bullet points) — these will be stripped during sanitization')
    }
    return content
  }
  
  // Fallback: treat as Windows-1252
  console.warn('⚠️  CSV contains invalid UTF-8 byte sequences, falling back to Windows-1252 decoding')
  return convertFromWindows1252(buffer)
}

/**
 * Legacy export for backward compatibility.
 * @deprecated Use decodeCSVBuffer instead
 */
export function convertWindows1252ToUtf8(buffer: Buffer): string {
  return convertFromWindows1252(buffer)
}

export function sanitizeText(text: string | null | undefined): string | null {
  if (!text) return null
  return text
    .replace(/\uFFFD/g, '')
    .replace(/ï¿½/g, '')
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

/**
 * Sanitize text that contains bullet-separated list items.
 * Preserves and normalizes bullet characters (•) for consistent formatting.
 * Items without a • prefix receive one, ensuring visual parity across all
 * languages (English seed data uses plain text while translated CSVs use •).
 * Use for fields like strategyExamples that are displayed as lists.
 */
export function sanitizeListText(text: string | null | undefined): string | null {
  if (!text) return null
  return text
    .replace(/\uFFFD/g, '') // Remove replacement characters
    .replace(/ï¿½/g, '')    // Remove corrupted UTF-8 sequences
    .replace(/[""]/g, '"')  // Normalize quotes
    .replace(/['']/g, "'")
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    // Ensure bullet prefix, then strip any stray hyphen/dash marker after it
    // e.g. "• - Grants" or "• – item" → "• Grants" / "• item"
    .map(line => line.startsWith('•') ? line : `• ${line}`)
    .map(line => line.replace(/^•\s*[-–—]\s+/, '• '))
    .join('\n')
    .trim() || null
}

export function sanitizeQuestionText(text: string | null | undefined): string {
  if (!text) return ''
  return text
    .replace(/\uFFFD/g, '')
    .replace(/ï¿½/g, '')
    .replace(/^[\s]*[•\-*]\s*/, '')
    .replace(/^[\s]*\d+[.)]\s*/, '')
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .trim()
}

export function parseFollowUpQuestions(text: string | null | undefined): string | null {
  if (!text) return null
  
  const lines = text
    .replace(/\uFFFD/g, '')
    .replace(/ï¿½/g, '')
    .replace(/•/g, '\n')
    .split('\n')
    .map(line => line.replace(/^[\s]*[\-•*]\s*/, '').trim())
    .filter(line => line.length > 0)
  
  const result: { 'if yes': string[], 'if no': string[] } = {
    'if yes': [],
    'if no': []
  }

  // Patterns that indicate a "yes" follow-up question (multilingual)
  const YES_PATTERNS = [
    /\bif\b.*\byes\b/i,                          // English: "if yes"
    /\bsi\b.*respuesta.*\bs[ií]\b/i,             // Spanish: "Si la respuesta es 'sí'"
    /\bsi\b.*r[eé]ponse.*\boui\b/i,             // French: "Si la réponse est 'oui'"
    /\bse\b.*respostar?\b.*\bsim\b/i,            // Portuguese: "Se a resposta for 'sim'"
  ]

  // Patterns that indicate a "no" follow-up question (multilingual)
  const NO_PATTERNS = [
    /\bif\b.*\bno\b/i,                           // English: "if no"
    /\bsi\b.*respuesta.*\bno\b/i,                // Spanish: "Si la respuesta es 'no'"
    /\bsi\b.*r[eé]ponse.*\bnon\b/i,             // French: "Si la réponse est 'non'"
    /\bse\b.*respostar?\b.*\bn[ãa]o\b/i,         // Portuguese: "Se a resposta for 'não'"
  ]

  // Prefixes to strip from each question line (multilingual)
  const PREFIX_PATTERNS = [
    /^if\s*[""«»\u201C\u201D]?\s*(yes|no)\s*[""«»\u201C\u201D,]*\s*(then\s*)?/i,
    /^si\s+la\s+respuesta\s+es\s*[""«»\u201C\u201D']*\s*(s[ií]|no)\s*[""«»\u201C\u201D',]*\s*/i,
    /^si\s+la\s+r[eé]ponse\s+est\s*[""«»\u201C\u201D'«»]*\s*(oui|non)\s*[""«»\u201C\u201D',«»]*\s*/i,
    /^se\s+a\s+respostar?\s+for\s*[""«»\u201C\u201D']*\s*(sim|n[ãa]o)\s*[""«»\u201C\u201D',]*\s*/i,
  ]
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase()

    // Strip language-specific prefix to get the actual question text
    let cleanedQuestion = line
    for (const prefix of PREFIX_PATTERNS) {
      cleanedQuestion = cleanedQuestion.replace(prefix, '').trim()
    }
    cleanedQuestion = cleanedQuestion
      .replace(/[""]/g, '"')
      .replace(/['']/g, "'")
      .trim()
    
    if (cleanedQuestion.length > 0) {
      cleanedQuestion = cleanedQuestion.charAt(0).toUpperCase() + cleanedQuestion.slice(1)
    }

    const isYes = YES_PATTERNS.some(p => p.test(lowerLine))
    const isNo = NO_PATTERNS.some(p => p.test(lowerLine))
    
    if (isNo) {
      result['if no'].push(cleanedQuestion)
    } else if (isYes) {
      result['if yes'].push(cleanedQuestion)
    } else {
      result['if yes'].push(cleanedQuestion)
    }
  }
  
  const output: { 'if yes'?: string[], 'if no'?: string[] } = {}
  if (result['if yes'].length > 0) output['if yes'] = result['if yes']
  if (result['if no'].length > 0) output['if no'] = result['if no']
  
  return Object.keys(output).length > 0 ? JSON.stringify(output) : null
}
