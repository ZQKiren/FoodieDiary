
const sanitizeString = (str) => {
  return typeof str === 'string' ? str.trim() : '';
};

const isAlphabetWithSpaces = (str) => {
  return /^[\p{L}\s]+$/u.test(sanitizeString(str));
};

const hasValidEmailStructure = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const analyzePasswordStrength = (password) => {
  return {
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    isLongEnough: password.length >= 6,
    isNotTooLong: password.length <= 35,
    length: password.length
  };
};

const formatDateForInput = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

const getTodayDateString = () => {
  return formatDateForInput(new Date());
};

export const validateFullName = (name) => {
  const cleanName = sanitizeString(name);
  
  if (!cleanName) {
    return 'Please fill out this field';
  }
  
  if (cleanName.length < 6) {
    return 'Full name must be at least 6 characters';
  }
  
  if (!isAlphabetWithSpaces(cleanName)) {
    return 'Full name can only contain letters and spaces';
  }
  
  if (cleanName.replace(/\s/g, '').length === 0) {
    return 'Full name cannot consist only of spaces';
  }
  
  return '';
};

export const validateEmail = (email) => {
  const cleanEmail = sanitizeString(email);
  
  if (!cleanEmail) {
    return 'Please fill out this field';
  }
  
  if (email.includes(' ')) {
    return "A part following '@' should not contain the symbol ' '";
  }
  
  if (email.includes('..')) {
    return 'Email cannot contain consecutive dots';
  }
  
  const atIndex = email.indexOf('@');
  if (atIndex > -1) {
    const afterAt = email.substring(atIndex + 1);
    if (afterAt.includes('!')) {
      return "A part following '@' should not contain the symbol '!'";
    }
  }
  
  if (email.endsWith('@')) {
    return `Please enter a part following '@'. '${email}' is incomplete`;
  }
  
  if (!hasValidEmailStructure(cleanEmail)) {
    return 'Please enter a valid email address';
  }
  
  return '';
};

export const validatePassword = (password) => {
  if (!password) {
    return 'Please fill out this field';
  }
  
  const strength = analyzePasswordStrength(password);
  
  if (!strength.isLongEnough) {
    return `Please lengthen this text to 6 characters or more (you are currently using ${strength.length} characters).`;
  }
  
  if (!strength.isNotTooLong) {
    return 'Password must be between 6-35 characters';
  }
  
  const missingRequirements = [];
  if (!strength.hasUpperCase) missingRequirements.push('1 uppercase letter');
  if (!strength.hasSpecialChar) missingRequirements.push('1 special character');  
  if (!strength.hasNumber) missingRequirements.push('1 number');
  
  if (missingRequirements.length > 0) {
    return `Password must contain at least ${missingRequirements.join(', ')}`;
  }
  
  return '';
};

export const validateConfirmPassword = (confirmPassword, originalPassword) => {
  if (!confirmPassword) {
    return 'Please fill out this field';
  }
  
  if (confirmPassword !== originalPassword) {
    return 'Passwords do not match';
  }
  
  return '';
};

export const validateFoodTitle = (title) => {
  const cleanTitle = sanitizeString(title);
  
  if (!cleanTitle) {
    return 'Please fill out this field';
  }
  
  if (cleanTitle.length < 2) {
    return 'Food name must be at least 2 characters';
  }
  
  if (cleanTitle.length > 100) {
    return 'Food name must be less than 100 characters';
  }
  
  return '';
};

export const validateLocation = (location) => {
  const cleanLocation = sanitizeString(location);
  
  if (!cleanLocation) {
    return 'Please fill out this field';
  }
  
  if (cleanLocation.length < 2) {
    return 'Location must be at least 2 characters';
  }
  
  if (cleanLocation.length > 200) {
    return 'Location must be less than 200 characters';
  }
  
  return '';
};

export const validateReview = (review) => {
  const cleanReview = sanitizeString(review);
  
  if (!cleanReview) {
    return 'Please fill out this field';
  }
  
  if (cleanReview.length < 5) {
    return 'Review must be at least 5 characters';
  }
  
  if (cleanReview.length > 2000) {
    return 'Review must be less than 2000 characters';
  }
  
  return '';
};

export const validateEatenDate = (dateString) => {
  if (!dateString) {
    return 'Please fill out this field';
  }
  
  const eatenDate = new Date(dateString);
  const today = new Date();
  
  today.setHours(23, 59, 59, 999);
  eatenDate.setHours(0, 0, 0, 0);
  
  if (isNaN(eatenDate.getTime())) {
    return 'Please enter a valid date';
  }
  
  if (eatenDate > today) {
    return 'Date cannot be in the future. Please select when you actually ate this food.';
  }
  
  const tenYearsAgo = new Date();
  tenYearsAgo.setFullYear(today.getFullYear() - 10);
  
  if (eatenDate < tenYearsAgo) {
    return 'Date cannot be more than 10 years ago. Please enter a more recent date.';
  }
  
  return '';
};

export const validateRating = (rating) => {
  const numRating = Number(rating);
  
  if (!numRating || numRating < 1 || numRating > 5) {
    return 'Please select a rating between 1 and 5 stars';
  }
  
  return '';
};

export const validateRegistrationForm = (formData) => {
  return {
    name: validateFullName(formData.name),
    email: validateEmail(formData.email), 
    password: validatePassword(formData.password),
    confirmPassword: validateConfirmPassword(formData.confirmPassword, formData.password)
  };
};

export const validateLoginForm = (formData) => {
  return {
    email: validateEmail(formData.email),
    password: formData.password ? '' : 'Please fill out this field'
  };
};

export const validatePostForm = (formData) => {
  return {
    title: validateFoodTitle(formData.title),
    location: validateLocation(formData.location),
    review: validateReview(formData.review),
    rating: validateRating(formData.rating),
    eatenAt: validateEatenDate(formData.eatenAt)
  };
};

export const hasValidationErrors = (errors) => {
  return Object.values(errors).some(error => error !== '');
};

export const getFirstValidationError = (errors) => {
  return Object.values(errors).find(error => error !== '') || '';
};

export const getAllValidationErrors = (errors) => {
  return Object.values(errors).filter(error => error !== '');
};

export const getValidationErrorCount = (errors) => {
  return getAllValidationErrors(errors).length;
};

export const createDebouncedValidator = (validationFn, delay = 300) => {
  let timeoutId = null;
  
  return (...args) => {
    return new Promise((resolve) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(() => {
        const result = validationFn(...args);
        resolve(result);
      }, delay);
    });
  };
};

export const validateSingleField = (fieldName, fieldValue, allFormData, validationSchema) => {
  const tempFormData = {
    ...allFormData,
    [fieldName]: fieldValue
  };
  
  const allErrors = validationSchema(tempFormData);
  
  return allErrors[fieldName] || '';
};


export const runValidationTests = (validatorFn, testCases) => {
  return testCases.map(testCase => {
    const result = validatorFn(testCase.input);
    const passed = result === testCase.expected;
    
    return {
      ...testCase,
      actual: result,
      passed,
      message: passed 
        ? '✅ PASS' 
        : `❌ FAIL: Expected "${testCase.expected}", got "${result}"`
    };
  });
};

export const fullNameTestCases = [
  { input: 'John Smith', expected: '', description: 'Valid full name' },
  { input: 'Maria González', expected: '', description: 'Valid name with accent' },
  
  { input: '', expected: 'Please fill out this field', description: 'Empty name' },
  { input: 'A', expected: 'Full name must be at least 6 characters', description: 'TC 6: Single character' },
  { input: '123', expected: 'Full name can only contain letters and spaces', description: 'TC 7: Numbers' },
  { input: '@@@@@', expected: 'Full name can only contain letters and spaces', description: 'TC 8: Special characters' },
  { input: '      ', expected: 'Full name cannot consist only of spaces', description: 'Only spaces' }
];

export const VALIDATION_CONSTANTS = {
  MIN_NAME_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 35,
  MIN_PASSWORD_LENGTH: 6,
  MAX_REVIEW_LENGTH: 2000,
  MIN_REVIEW_LENGTH: 5
};

export default {
  validateFullName,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateFoodTitle,
  validateLocation,
  validateReview,
  validateEatenDate,
  validateRating,
  validateRegistrationForm,
  validateLoginForm,
  validatePostForm,
  hasValidationErrors,
  getFirstValidationError,
  getAllValidationErrors
};