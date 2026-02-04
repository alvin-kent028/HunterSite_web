/**
 * Utility Functions Module
 * Reusable helper functions used across the application
 * This reduces code duplication and improves maintainability
 */

// ============================================
// DOM MANIPULATION UTILITIES
// ============================================

/**
 * Safely query a single element from the DOM
 * @param {string} selector - CSS selector
 * @param {HTMLElement} context - Optional context element (default: document)
 * @returns {HTMLElement|null} The found element or null
 */
function queryElement(selector, context = document) {
  try {
    return context.querySelector(selector);
  } catch (error) {
    console.error(`Error querying selector "${selector}":`, error);
    return null;
  }
}

/**
 * Safely query multiple elements from the DOM
 * @param {string} selector - CSS selector
 * @param {HTMLElement} context - Optional context element (default: document)
 * @returns {NodeList} List of found elements (empty if none found)
 */
function queryElements(selector, context = document) {
  try {
    return context.querySelectorAll(selector);
  } catch (error) {
    console.error(`Error querying selector "${selector}":`, error);
    return [];
  }
}

/**
 * Add event listener with error handling
 * @param {HTMLElement|NodeList} elements - Element(s) to attach listener to
 * @param {string} event - Event type (e.g., 'click', 'submit')
 * @param {Function} handler - Event handler function
 * @param {Object} options - Optional event listener options
 */
function addEventListeners(elements, event, handler, options = {}) {
  // Handle single element
  if (elements instanceof HTMLElement) {
    elements.addEventListener(event, handler, options);
    return;
  }

  // Handle multiple elements (NodeList or Array)
  if (elements && elements.length) {
    Array.from(elements).forEach((element) => {
      element.addEventListener(event, handler, options);
    });
  }
}

/**
 * Create an HTML element with attributes and content
 * @param {string} tag - HTML tag name
 * @param {Object} attributes - Element attributes (className, id, etc.)
 * @param {string|HTMLElement} content - Inner content (text or HTML)
 * @returns {HTMLElement} Created element
 */
function createElement(tag, attributes = {}, content = "") {
  const element = document.createElement(tag);

  // Set attributes
  Object.keys(attributes).forEach((key) => {
    if (key === "className") {
      element.className = attributes[key];
    } else if (key === "dataset") {
      Object.assign(element.dataset, attributes[key]);
    } else {
      element.setAttribute(key, attributes[key]);
    }
  });

  // Set content
  if (typeof content === "string") {
    element.innerHTML = content;
  } else if (content instanceof HTMLElement) {
    element.appendChild(content);
  }

  return element;
}

// ============================================
// VALIDATION UTILITIES
// ============================================

/**
 * Validate email format using regex
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid, false otherwise
 */
function isValidEmail(email) {
  // Standard email regex pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate required field (not empty or whitespace)
 * @param {string} value - Value to check
 * @returns {boolean} True if valid, false if empty
 */
function isRequired(value) {
  return value && value.trim().length > 0;
}

/**
 * Validate string length
 * @param {string} value - String to check
 * @param {number} min - Minimum length
 * @param {number} max - Maximum length
 * @returns {boolean} True if within range
 */
function isValidLength(value, min = 0, max = Infinity) {
  const length = value ? value.trim().length : 0;
  return length >= min && length <= max;
}

/**
 * Sanitize user input to prevent XSS
 * @param {string} input - User input string
 * @returns {string} Sanitized string
 */
function sanitizeInput(input) {
  if (!input) return "";
  const div = document.createElement("div");
  div.textContent = input;
  return div.innerHTML;
}

// ============================================
// UI FEEDBACK UTILITIES
// ============================================

/**
 * Show toast notification message
 * Reusable across the entire application
 * @param {string} message - Message to display
 * @param {string} type - Type of message (success, error, info, warning)
 * @param {number} duration - How long to show (milliseconds)
 */
function showToast(message, type = "info", duration = 3000) {
  // Remove existing toast if any
  const existingToast = queryElement(".custom-toast");
  if (existingToast) existingToast.remove();

  // Determine background color based on type
  const bgColors = {
    success: "bg-success",
    error: "bg-danger",
    warning: "bg-warning",
    info: "bg-dark",
  };

  const bgClass = bgColors[type] || bgColors.info;

  // Create toast element
  const toast = createElement(
    "div",
    {
      className: `custom-toast position-fixed bottom-0 end-0 m-4 p-3 ${bgClass} text-white rounded-3 shadow-lg`,
      style:
        "z-index: 9999; min-width: 250px; animation: slideIn 0.3s ease-out;",
    },
    sanitizeInput(message)
  );

  document.body.appendChild(toast);

  // Auto-remove after duration
  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease-out";
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Show error message on input field
 * @param {HTMLElement} input - Input element
 * @param {string} message - Error message to display
 */
function showFieldError(input, message) {
  if (!input) return;

  // Remove existing error
  clearFieldError(input);

  // Add error styling
  input.classList.add("border-danger", "is-invalid");

  // Create and insert error message
  const error = createElement(
    "small",
    {
      className: "text-danger d-block mt-1",
      dataset: { error: "true" },
    },
    sanitizeInput(message)
  );

  input.parentNode.appendChild(error);
}

/**
 * Clear error message from input field
 * @param {HTMLElement} input - Input element
 */
function clearFieldError(input) {
  if (!input) return;

  input.classList.remove("border-danger", "is-invalid");

  const error = input.parentNode.querySelector('[data-error="true"]');
  if (error) error.remove();
}

/**
 * Show loading spinner overlay
 * @param {string} message - Optional loading message
 * @returns {HTMLElement} Spinner element (for manual removal)
 */
function showLoadingSpinner(message = "Loading...") {
  const spinner = createElement(
    "div",
    {
      className:
        "loading-spinner position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center",
      style: "z-index: 10000; background: rgba(0,0,0,0.5);",
    },
    `
    <div class="text-center text-white">
      <div class="spinner-border mb-3" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p>${sanitizeInput(message)}</p>
    </div>
  `
  );

  document.body.appendChild(spinner);
  return spinner;
}

/**
 * Hide loading spinner
 */
function hideLoadingSpinner() {
  const spinner = queryElement(".loading-spinner");
  if (spinner) spinner.remove();
}

// ============================================
// STRING UTILITIES
// ============================================

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated text
 */
function truncateText(text, maxLength, suffix = "...") {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
function capitalizeFirst(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Generate a simple unique ID
 * @param {string} prefix - Optional prefix for the ID
 * @returns {string} Unique ID
 */
function generateId(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================
// DATE UTILITIES
// ============================================

/**
 * Format date to readable string
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type ('short', 'long', 'relative')
 * @returns {string} Formatted date string
 */
function formatDate(date, format = "short") {
  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    return "Invalid Date";
  }

  switch (format) {
    case "short":
      return dateObj.toLocaleDateString();
    case "long":
      return dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    case "relative":
      return getRelativeTime(dateObj);
    default:
      return dateObj.toLocaleDateString();
  }
}

/**
 * Get relative time (e.g., "2 days ago")
 * @param {Date} date - Date to compare
 * @returns {string} Relative time string
 */
function getRelativeTime(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  }
  return formatDate(date, "short");
}

// ============================================
// ARRAY UTILITIES
// ============================================

/**
 * Remove duplicates from array
 * @param {Array} array - Array with potential duplicates
 * @param {string} key - Optional key for objects
 * @returns {Array} Array without duplicates
 */
function removeDuplicates(array, key = null) {
  if (!key) {
    return [...new Set(array)];
  }
  // For array of objects
  const seen = new Set();
  return array.filter((item) => {
    const value = item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

/**
 * Chunk array into smaller arrays
 * Useful for lazy loading / pagination
 * @param {Array} array - Array to chunk
 * @param {number} size - Size of each chunk
 * @returns {Array} Array of chunks
 */
function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// ============================================
// PERFORMANCE UTILITIES
// ============================================

/**
 * Debounce function - delays execution until after wait time
 * Useful for search inputs, resize events
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function - limits execution to once per wait time
 * Useful for scroll events
 * @param {Function} func - Function to throttle
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, wait = 300) {
  let waiting = false;
  return function executedFunction(...args) {
    if (!waiting) {
      func(...args);
      waiting = true;
      setTimeout(() => {
        waiting = false;
      }, wait);
    }
  };
}

/**
 * Lazy load images when they enter viewport
 * Performance optimization for pages with many images
 * @param {string} selector - Selector for images to lazy load
 */
function lazyLoadImages(selector = "img[data-src]") {
  const images = queryElements(selector);

  const imageObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          // Replace src with data-src
          img.src = img.dataset.src;
          img.removeAttribute("data-src");
          img.classList.add("loaded");
          observer.unobserve(img);
        }
      });
    },
    {
      rootMargin: "50px", // Start loading 50px before entering viewport
    }
  );

  images.forEach((img) => imageObserver.observe(img));
}

// ============================================
// EXPORT FOR USE IN OTHER MODULES
// ============================================

// Make utilities available globally
window.Utils = {
  // DOM
  queryElement,
  queryElements,
  addEventListeners,
  createElement,

  // Validation
  isValidEmail,
  isRequired,
  isValidLength,
  sanitizeInput,

  // UI Feedback
  showToast,
  showFieldError,
  clearFieldError,
  showLoadingSpinner,
  hideLoadingSpinner,

  // String
  truncateText,
  capitalizeFirst,
  generateId,

  // Date
  formatDate,
  getRelativeTime,

  // Array
  removeDuplicates,
  chunkArray,

  // Performance
  debounce,
  throttle,
  lazyLoadImages,
};

console.log("⚡ Utilities module loaded");
