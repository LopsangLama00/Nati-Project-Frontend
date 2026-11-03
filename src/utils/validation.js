/**
 * Validation Utilities
 * Comprehensive form validation functions for the application
 */

/**
 * Email validation regex pattern
 */
export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Phone number validation regex pattern (international format)
 */
export const phoneRegex = /^\+?[1-9]\d{1,14}$/;

/**
 * Password validation rules
 */
export const passwordRules = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

/**
 * Validates an email address
 * @param {string} email - Email to validate
 * @returns {Object} - Validation result
 */
export const validateEmail = (email) => {
  if (!email || email.trim() === '') {
    return {
      isValid: false,
      message: 'Email is required',
      errorCode: 'EMAIL_REQUIRED'
    };
  }

  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      message: 'Please enter a valid email address',
      errorCode: 'EMAIL_INVALID'
    };
  }

  return {
    isValid: true,
    message: 'Email is valid',
    errorCode: null
  };
};

/**
 * Validates a password against complexity rules
 * @param {string} password - Password to validate
 * @param {Object} rules - Optional custom rules
 * @returns {Object} - Validation result with details
 */
export const validatePassword = (password, rules = passwordRules) => {
  const errors = [];

  if (!password || password.trim() === '') {
    return {
      isValid: false,
      message: 'Password is required',
      errors: ['PASSWORD_REQUIRED'],
      details: { strength: 0 }
    };
  }

  // Length check
  if (password.length < rules.minLength) {
    errors.push(`Password must be at least ${rules.minLength} characters long`);
  }

  if (password.length > rules.maxLength) {
    errors.push(`Password cannot exceed ${rules.maxLength} characters`);
  }

  // Complexity checks
  if (rules.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (rules.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (rules.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (rules.requireSpecialChars) {
    const specialCharPattern = new RegExp(`[${rules.specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`);
    if (!specialCharPattern.test(password)) {
      errors.push(`Password must contain at least one special character (${rules.specialChars})`);
    }
  }

  // Calculate password strength
  const strength = calculatePasswordStrength(password, rules);

  const isValid = errors.length === 0;

  return {
    isValid,
    message: isValid ? 'Password is valid' : 'Password validation failed',
    errors: errors.length > 0 ? errors : null,
    details: {
      strength,
      length: password.length,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecialChars: new RegExp(`[${rules.specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`).test(password)
    }
  };
};

/**
 * Calculate password strength score (0-100)
 * @param {string} password - Password to evaluate
 * @param {Object} rules - Password rules
 * @returns {number} - Strength score (0-100)
 */
export const calculatePasswordStrength = (password, rules = passwordRules) => {
  let score = 0;
  const maxScore = 100;

  // Length score (max 30 points)
  const lengthScore = Math.min(password.length / rules.maxLength * 30, 30);
  score += lengthScore;

  // Character variety score (max 70 points)
  let varietyScore = 0;

  // Check for character types
  const checks = [
    { regex: /[a-z]/, points: 10 },  // Lowercase
    { regex: /[A-Z]/, points: 10 },  // Uppercase
    { regex: /\d/, points: 10 },      // Numbers
    { regex: new RegExp(`[${rules.specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`), points: 10 }, // Special chars
    { regex: /.{8,}/, points: 10 },   // Minimum length
    { regex: /.{12,}/, points: 10 },  // Good length
    { regex: /.{16,}/, points: 10 }   // Strong length
  ];

  checks.forEach(check => {
    if (check.regex.test(password)) {
      varietyScore += check.points;
    }
  });

  score += Math.min(varietyScore, 70);

  // Penalize common patterns
  const commonPatterns = [
    /12345678/,
    /password/i,
    /qwerty/i,
    /abcdef/i,
    /aaaaaaa/i,
    /11111111/
  ];

  commonPatterns.forEach(pattern => {
    if (pattern.test(password)) {
      score *= 0.5; // Halve the score for common patterns
    }
  });

  // Penalize repeated characters
  const repeatedChars = (password.match(/(.)\1{2,}/g) || []).length;
  if (repeatedChars > 0) {
    score *= 0.8;
  }

  // Penalize sequential characters
  const sequentialPatterns = [/abc/i, /123/, /xyz/i];
  sequentialPatterns.forEach(pattern => {
    if (pattern.test(password)) {
      score *= 0.7;
    }
  });

  // Normalize to 0-100 range
  score = Math.max(0, Math.min(100, Math.round(score)));

  return score;
};

/**
 * Validates phone number
 * @param {string} phone - Phone number to validate
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result
 */
export const validatePhone = (phone, options = {}) => {
  const {
    required = true,
    countryCode = null,
    allowInternational = true
  } = options;

  if (!phone || phone.trim() === '') {
    if (required) {
      return {
        isValid: false,
        message: 'Phone number is required',
        errorCode: 'PHONE_REQUIRED'
      };
    }
    return {
      isValid: true,
      message: 'Phone number is optional',
      errorCode: null
    };
  }

  // Clean the phone number
  const cleanedPhone = phone.replace(/\s+/g, '');

  // Check if it starts with + for international numbers
  if (allowInternational && cleanedPhone.startsWith('+')) {
    if (!phoneRegex.test(cleanedPhone)) {
      return {
        isValid: false,
        message: 'Please enter a valid international phone number',
        errorCode: 'PHONE_INVALID_INTERNATIONAL'
      };
    }
  } else {
    // Local number validation
    const localRegex = /^\d{10}$/; // Adjust based on country
    if (!localRegex.test(cleanedPhone)) {
      return {
        isValid: false,
        message: 'Please enter a valid 10-digit phone number',
        errorCode: 'PHONE_INVALID_LOCAL'
      };
    }
  }

  return {
    isValid: true,
    message: 'Phone number is valid',
    errorCode: null
  };
};

/**
 * Validates form fields based on rules
 * @param {Object} fields - Object containing field values
 * @param {Object} rules - Validation rules for each field
 * @returns {Object} - Validation results
 */
export const validateForm = (fields, rules) => {
  const results = {};
  let isValid = true;

  Object.keys(rules).forEach(fieldName => {
    const fieldValue = fields[fieldName];
    const fieldRules = rules[fieldName];

    if (!fieldRules) {
      results[fieldName] = {
        isValid: true,
        message: 'No validation rules defined',
        errorCode: null
      };
      return;
    }

    let fieldResult;

    switch (fieldRules.type) {
      case 'email':
        fieldResult = validateEmail(fieldValue);
        break;

      case 'password':
        fieldResult = validatePassword(fieldValue, fieldRules.rules);
        break;

      case 'phone':
        fieldResult = validatePhone(fieldValue, fieldRules.options);
        break;

      case 'required':
        if (!fieldValue || fieldValue.trim() === '') {
          fieldResult = {
            isValid: false,
            message: fieldRules.message || 'This field is required',
            errorCode: 'FIELD_REQUIRED'
          };
        } else {
          fieldResult = {
            isValid: true,
            message: 'Field is valid',
            errorCode: null
          };
        }
        break;

      case 'minLength':
        if (fieldValue.length < fieldRules.value) {
          fieldResult = {
            isValid: false,
            message: fieldRules.message || `Minimum length is ${fieldRules.value} characters`,
            errorCode: 'MIN_LENGTH'
          };
        } else {
          fieldResult = {
            isValid: true,
            message: 'Field is valid',
            errorCode: null
          };
        }
        break;

      case 'maxLength':
        if (fieldValue.length > fieldRules.value) {
          fieldResult = {
            isValid: false,
            message: fieldRules.message || `Maximum length is ${fieldRules.value} characters`,
            errorCode: 'MAX_LENGTH'
          };
        } else {
          fieldResult = {
            isValid: true,
            message: 'Field is valid',
            errorCode: null
          };
        }
        break;

      case 'regex':
        if (!fieldRules.pattern.test(fieldValue)) {
          fieldResult = {
            isValid: false,
            message: fieldRules.message || 'Field does not match required pattern',
            errorCode: 'PATTERN_MISMATCH'
          };
        } else {
          fieldResult = {
            isValid: true,
            message: 'Field is valid',
            errorCode: null
          };
        }
        break;

      case 'custom':
        if (fieldRules.validator && typeof fieldRules.validator === 'function') {
          fieldResult = fieldRules.validator(fieldValue, fields);
        } else {
          fieldResult = {
            isValid: true,
            message: 'Custom validator not provided',
            errorCode: null
          };
        }
        break;

      default:
        fieldResult = {
          isValid: true,
          message: 'No validation performed',
          errorCode: null
        };
    }

    results[fieldName] = fieldResult;
    if (!fieldResult.isValid) {
      isValid = false;
    }
  });

  return {
    isValid,
    results,
    hasErrors: !isValid,
    errorCount: Object.values(results).filter(r => !r.isValid).length
  };
};

/**
 * Example validation rules for common forms
 */
export const validationRules = {
  // Login form rules
  login: {
    email: {
      type: 'email',
      required: true
    },
    password: {
      type: 'required',
      message: 'Password is required'
    }
  },

  // Registration form rules
  registration: {
    first_name: {
      type: 'required',
      message: 'First name is required'
    },
    last_name: {
      type: 'required',
      message: 'Last name is required'
    },
    email: {
      type: 'email',
      required: true
    },
    phone_number: {
      type: 'phone',
      options: {
        required: true,
        allowInternational: false
      }
    },
    password1: {
      type: 'password',
      rules: passwordRules
    },
    password2: {
      type: 'custom',
      validator: (value, fields) => {
        if (value !== fields.password1) {
          return {
            isValid: false,
            message: 'Passwords do not match',
            errorCode: 'PASSWORDS_MISMATCH'
          };
        }
        return {
          isValid: true,
          message: 'Passwords match',
          errorCode: null
        };
      }
    }
  },

  // Product form rules
  product: {
    title: {
      type: 'required',
      message: 'Product title is required'
    },
    price: {
      type: 'custom',
      validator: (value) => {
        const price = parseFloat(value);
        if (isNaN(price) || price <= 0) {
          return {
            isValid: false,
            message: 'Please enter a valid price greater than 0',
            errorCode: 'INVALID_PRICE'
          };
        }
        return {
          isValid: true,
          message: 'Price is valid',
          errorCode: null
        };
      }
    },
    size: {
      type: 'required',
      message: 'Product size is required'
    }
  }
};

/**
 * Utility to display validation errors in a user-friendly way
 * @param {Object} validationResults - Results from validateForm
 * @returns {Array} - Array of error messages
 */
export const getValidationErrors = (validationResults) => {
  if (!validationResults || !validationResults.results) {
    return [];
  }

  const errors = [];

  Object.entries(validationResults.results).forEach(([fieldName, result]) => {
    if (!result.isValid) {
      errors.push({
        field: fieldName,
        message: result.message,
        errorCode: result.errorCode
      });
    }
  });

  return errors;
};

/**
 * Debounced validation function
 * @param {Function} validator - Validation function
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Debounced validation function
 */
export const debounceValidation = (validator, delay = 300) => {
  let timeoutId;

  return (...args) => {
    return new Promise((resolve) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        const result = validator(...args);
        resolve(result);
      }, delay);
    });
  };
};

export default {
  validateEmail,
  validatePassword,
  validatePhone,
  validateForm,
  validationRules,
  getValidationErrors,
  debounceValidation,
  calculatePasswordStrength,
  emailRegex,
  phoneRegex,
  passwordRules
};