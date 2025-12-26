// /lib/utils/validation.ts

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Vision input validation
export function validateVision(vision: string): ValidationResult {
  if (!vision || vision.trim().length === 0) {
    return { isValid: false, error: 'Vision cannot be empty' };
  }

  if (vision.trim().length < 10) {
    return {
      isValid: false,
      error: 'Vision must be at least 10 characters',
    };
  }

  if (vision.trim().length > 500) {
    return {
      isValid: false,
      error: 'Vision must be less than 500 characters',
    };
  }

  return { isValid: true };
}

// Prompt validation
export function validatePrompt(prompt: string): ValidationResult {
  if (!prompt || prompt.trim().length === 0) {
    return { isValid: false, error: 'Prompt cannot be empty' };
  }

  if (prompt.trim().length < 5) {
    return {
      isValid: false,
      error: 'Prompt must be at least 5 characters',
    };
  }

  if (prompt.trim().length > 2000) {
    return {
      isValid: false,
      error: 'Prompt must be less than 2000 characters',
    };
  }

  return { isValid: true };
}

// Email validation
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: 'Email cannot be empty' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  return { isValid: true };
}

// API Key validation
export function validateApiKey(key: string, provider: 'replicate' | 'together'): ValidationResult {
  if (!key || key.trim().length === 0) {
    return { isValid: false, error: 'API key cannot be empty' };
  }

  if (provider === 'replicate') {
    if (!key.startsWith('r8_')) {
      return { isValid: false, error: 'Replicate API key must start with "r8_"' };
    }
    if (key.length < 20) {
      return { isValid: false, error: 'API key appears to be invalid (too short)' };
    }
  }

  if (provider === 'together') {
    if (key.length < 20) {
      return { isValid: false, error: 'API key appears to be invalid (too short)' };
    }
  }

  return { isValid: true };
}

// Project name validation
export function validateProjectName(name: string): ValidationResult {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Project name cannot be empty' };
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: 'Project name must be at least 2 characters' };
  }

  if (name.trim().length > 50) {
    return { isValid: false, error: 'Project name must be less than 50 characters' };
  }

  return { isValid: true };
}

// Duration validation (for video)
export function validateDuration(duration: number): ValidationResult {
  if (duration < 1) {
    return { isValid: false, error: 'Duration must be at least 1 second' };
  }

  if (duration > 180) {
    return { isValid: false, error: 'Duration cannot exceed 180 seconds (3 minutes)' };
  }

  return { isValid: true };
}

// Seed validation
export function validateSeed(seed: number): ValidationResult {
  if (seed < 0) {
    return { isValid: false, error: 'Seed must be a positive number' };
  }

  if (seed > 999999) {
    return { isValid: false, error: 'Seed must be less than 1,000,000' };
  }

  return { isValid: true };
}

// Generic required field validation
export function validateRequired(value: any, fieldName: string): ValidationResult {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }

  return { isValid: true };
}

// Numeric range validation
export function validateRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): ValidationResult {
  if (value < min || value > max) {
    return {
      isValid: false,
      error: `${fieldName} must be between ${min} and ${max}`,
    };
  }

  return { isValid: true };
}
