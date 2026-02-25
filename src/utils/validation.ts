/**
 * RFC 5322 simplified email validation pattern
 * Validates email addresses according to a simplified version of RFC 5322 specification
 */
export const validateEmailFormat = (emailAddress: string): boolean => {
  const pattern =
    /^[^\s@]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return pattern.test(emailAddress);
};

/**
 * Validates that a string is not empty after trimming whitespace
 */
export const validateRequiredString = (value: string): boolean => {
  return value.trim().length > 0;
};

/**
 * Validates that an array meets a minimum length requirement
 */
export const validateMinArrayLength = (
  arr: unknown[],
  minLength: number
): boolean => {
  return arr.length >= minLength;
};

/**
 * Standard validation error messages
 */
export const validationMessages = {
  required: (fieldName: string) => `${fieldName} is required`,
  invalidEmail: 'Please provide a valid email address',
  minEcosystems: 'Select at least one ecosystem type',
} as const;

export const hasRichTextContent = (value?: string) => {
  if (!value) return false
  if (/<(img|video|iframe|embed|object|svg|canvas)\b/i.test(value)) return true

  const plainText = value
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .trim()

  return plainText.length > 0
}

export const copyTextToClipboard = async (text: string) => {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text)
  } else {
    // Fallback for insecure contexts (like accessing via local IP)
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'absolute'
    textArea.style.left = '-999999px'
    document.body.prepend(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
    } catch (error) {
      console.error('Fallback copy failed:', error)
      throw new Error('Unable to copy text')
    } finally {
      textArea.remove()
    }
  }
}
