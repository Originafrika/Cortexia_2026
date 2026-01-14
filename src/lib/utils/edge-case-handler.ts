/**
 * EDGE CASE HANDLER
 * Robust handling of edge cases and invalid inputs
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitized?: any;
}

/**
 * Validate and sanitize user description
 */
export function validateDescription(description: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check minimum length
  if (!description || description.trim().length === 0) {
    errors.push('La description ne peut pas être vide');
    return { isValid: false, errors, warnings };
  }
  
  if (description.trim().length < 10) {
    errors.push('La description doit contenir au moins 10 caractères');
  }
  
  // Check maximum length
  if (description.length > 5000) {
    errors.push('La description ne peut pas dépasser 5000 caractères');
  }
  
  // Detect suspicious patterns
  const suspiciousPatterns = [
    /(<script|javascript:|onerror=)/i,  // XSS attempts
    /(\bDROP\s+TABLE\b|\bDELETE\s+FROM\b)/i,  // SQL injection attempts
    /(eval\(|exec\()/i,  // Code injection
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(description)) {
      errors.push('La description contient des caractères non autorisés');
      break;
    }
  }
  
  // Detect vague descriptions
  const vaguePatterns = [
    /^(create|make|do|generate)\s+(a|an|some)?\s*$/i,
    /^(pub|ad|poster)\s*$/i,
    /^(image|picture|photo)\s*$/i,
  ];
  
  for (const pattern of vaguePatterns) {
    if (pattern.test(description.trim())) {
      warnings.push('Description très vague - ajoutez plus de détails pour de meilleurs résultats');
      break;
    }
  }
  
  // Detect missing product name
  const hasProductName = /[A-Z][a-zA-Z]+\s+[A-Z0-9][a-zA-Z0-9]*|"[^"]+"|'[^']+'/.test(description);
  if (!hasProductName) {
    warnings.push('Aucun nom de produit détecté - les résultats seront génériques');
  }
  
  // Sanitize
  const sanitized = description
    .trim()
    .replace(/\s+/g, ' ')  // Normalize whitespace
    .replace(/[<>]/g, '');  // Remove potential HTML
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sanitized
  };
}

/**
 * Validate file uploads
 */
export function validateFileUpload(
  file: File,
  type: 'image' | 'video'
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check file type
  const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const validVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
  const validTypes = type === 'image' ? validImageTypes : validVideoTypes;
  
  if (!validTypes.includes(file.type)) {
    errors.push(`Format ${file.type} non supporté. Formats acceptés : ${validTypes.join(', ')}`);
  }
  
  // Check file size
  const maxSize = type === 'image' ? 7 * 1024 * 1024 : 50 * 1024 * 1024;  // 7MB images, 50MB videos
  
  if (file.size > maxSize) {
    errors.push(`Fichier trop volumineux (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum : ${maxSize / 1024 / 1024}MB`);
  }
  
  if (file.size < 1024) {  // < 1KB
    warnings.push('Fichier très petit - qualité potentiellement faible');
  }
  
  // Check filename
  if (file.name.length > 255) {
    warnings.push('Nom de fichier très long');
  }
  
  const suspiciousExtensions = /\.(exe|bat|sh|cmd|scr|vbs)$/i;
  if (suspiciousExtensions.test(file.name)) {
    errors.push('Extension de fichier non autorisée');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Handle API errors gracefully
 */
export function handleAPIError(error: any): {
  userMessage: string;
  technicalMessage: string;
  shouldRetry: boolean;
  retryDelay?: number;
} {
  // Network errors
  if (error.message === 'Failed to fetch' || error.name === 'NetworkError') {
    return {
      userMessage: 'Problème de connexion. Vérifiez votre connexion internet.',
      technicalMessage: error.message,
      shouldRetry: true,
      retryDelay: 3000
    };
  }
  
  // Timeout errors
  if (error.message?.includes('timeout') || error.name === 'AbortError') {
    return {
      userMessage: 'La requête a pris trop de temps. Réessayez.',
      technicalMessage: error.message,
      shouldRetry: true,
      retryDelay: 5000
    };
  }
  
  // Server errors (5xx)
  if (error.status >= 500) {
    return {
      userMessage: 'Erreur serveur temporaire. Réessayez dans quelques instants.',
      technicalMessage: `${error.status}: ${error.message}`,
      shouldRetry: true,
      retryDelay: 10000
    };
  }
  
  // Rate limiting (429)
  if (error.status === 429) {
    return {
      userMessage: 'Trop de requêtes. Attendez un moment avant de réessayer.',
      technicalMessage: 'Rate limit exceeded',
      shouldRetry: true,
      retryDelay: 60000  // 1 minute
    };
  }
  
  // Authentication errors (401)
  if (error.status === 401) {
    return {
      userMessage: 'Session expirée. Reconnectez-vous.',
      technicalMessage: 'Unauthorized',
      shouldRetry: false
    };
  }
  
  // Insufficient credits (402)
  if (error.status === 402) {
    return {
      userMessage: 'Crédits insuffisants. Rechargez votre compte.',
      technicalMessage: 'Payment required',
      shouldRetry: false
    };
  }
  
  // Not found (404)
  if (error.status === 404) {
    return {
      userMessage: 'Ressource introuvable.',
      technicalMessage: 'Not found',
      shouldRetry: false
    };
  }
  
  // Client errors (4xx)
  if (error.status >= 400 && error.status < 500) {
    return {
      userMessage: error.message || 'Requête invalide. Vérifiez vos données.',
      technicalMessage: `${error.status}: ${error.message}`,
      shouldRetry: false
    };
  }
  
  // Unknown errors
  return {
    userMessage: 'Une erreur inattendue est survenue. Contactez le support si le problème persiste.',
    technicalMessage: error.message || 'Unknown error',
    shouldRetry: true,
    retryDelay: 5000
  };
}

/**
 * Sanitize user input for API
 */
export function sanitizeForAPI(data: any): any {
  if (typeof data === 'string') {
    return data
      .trim()
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')  // Remove control characters
      .replace(/[<>]/g, '')  // Remove HTML brackets
      .substring(0, 10000);  // Max length
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeForAPI(item));
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeForAPI(value);
    }
    return sanitized;
  }
  
  return data;
}

/**
 * Detect and handle empty/missing data
 */
export function handleMissingData<T>(
  data: T | null | undefined,
  fallback: T,
  context: string
): T {
  if (data === null || data === undefined) {
    console.warn(`⚠️ Missing data in ${context}, using fallback:`, fallback);
    return fallback;
  }
  
  // Check for empty strings
  if (typeof data === 'string' && data.trim().length === 0) {
    console.warn(`⚠️ Empty string in ${context}, using fallback:`, fallback);
    return fallback;
  }
  
  // Check for empty arrays
  if (Array.isArray(data) && data.length === 0) {
    console.warn(`⚠️ Empty array in ${context}, using fallback:`, fallback);
    return fallback;
  }
  
  // Check for empty objects
  if (typeof data === 'object' && Object.keys(data).length === 0) {
    console.warn(`⚠️ Empty object in ${context}, using fallback:`, fallback);
    return fallback;
  }
  
  return data;
}

/**
 * Retry logic with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const errorInfo = handleAPIError(error);
      
      if (!errorInfo.shouldRetry) {
        throw error;
      }
      
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        console.log(`⏳ Retry ${i + 1}/${maxRetries} after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

/**
 * Validate generation parameters
 */
export function validateGenerationParams(params: {
  description?: string;
  format?: string;
  resolution?: string;
  references?: any;
}): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Validate description
  if (params.description) {
    const descValidation = validateDescription(params.description);
    errors.push(...descValidation.errors);
    warnings.push(...descValidation.warnings);
  }
  
  // Validate format
  const validFormats = ['square', 'portrait', 'landscape', '1:1', '9:16', '16:9'];
  if (params.format && !validFormats.includes(params.format)) {
    errors.push(`Format invalide. Formats acceptés : ${validFormats.join(', ')}`);
  }
  
  // Validate resolution
  const validResolutions = ['1K', '2K'];
  if (params.resolution && !validResolutions.includes(params.resolution)) {
    errors.push(`Résolution invalide. Résolutions acceptées : ${validResolutions.join(', ')}`);
  }
  
  // Validate references
  if (params.references) {
    const { images = [], videos = [] } = params.references;
    
    if (images.length + videos.length === 0) {
      warnings.push('Aucune référence fournie - génération text-to-image uniquement');
    }
    
    if (images.length > 10) {
      errors.push('Maximum 10 images de référence');
    }
    
    if (videos.length > 10) {
      errors.push('Maximum 10 vidéos de référence');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
