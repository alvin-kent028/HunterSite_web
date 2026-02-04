/**
 * Performance Optimization Module
 * Implements lazy loading, code splitting, and performance monitoring
 *
 * This module helps the app load faster and run smoother by:
 * - Loading images only when needed (lazy loading)
 * - Deferring non-critical JavaScript
 * - Monitoring performance metrics
 * - Implementing efficient scroll/resize handlers
 */

// ============================================
// LAZY LOADING IMPLEMENTATION
// ============================================

/**
 * Initialize lazy loading for images
 * Images with data-src attribute will load when they enter viewport
 * This significantly improves initial page load time
 *
 * Usage in HTML:
 * <img data-src="image.jpg" alt="..." class="lazy-load">
 *
 * The image will load when it's 100px away from entering the viewport
 */
function initLazyLoading() {
  // Find all images with data-src attribute
  const lazyImages = document.querySelectorAll("img[data-src]");

  // If browser doesn't support IntersectionObserver, load all images immediately
  if (!("IntersectionObserver" in window)) {
    lazyImages.forEach((img) => {
      img.src = img.dataset.src;
      img.removeAttribute("data-src");
    });
    return;
  }

  // Create observer to watch when images enter viewport
  const imageObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        // When image enters viewport
        if (entry.isIntersecting) {
          const img = entry.target;

          // Replace data-src with actual src
          img.src = img.dataset.src;
          img.removeAttribute("data-src");

          // Add loaded class for CSS transitions
          img.classList.add("loaded");

          // Stop observing this image
          observer.unobserve(img);

          // Optional: Add fade-in effect
          img.style.opacity = "0";
          img.style.transition = "opacity 0.3s";
          setTimeout(() => {
            img.style.opacity = "1";
          }, 10);
        }
      });
    },
    {
      // Start loading 100px before image enters viewport
      rootMargin: "100px",
    }
  );

  // Observe all lazy images
  lazyImages.forEach((img) => imageObserver.observe(img));

  console.log(`📸 Lazy loading initialized for ${lazyImages.length} images`);
}

// ============================================
// DEFERRED SCRIPT LOADING
// ============================================

/**
 * Load JavaScript files dynamically (code splitting)
 * Only load scripts when they're needed, not all at once
 *
 * @param {string} src - Script URL to load
 * @param {Function} callback - Function to call when loaded
 *
 * Example:
 * loadScriptDeferred('/assets/js/charts.js', () => {
 *   initCharts(); // Only run after script loads
 * });
 */
function loadScriptDeferred(src, callback) {
  // Check if script already loaded
  const existing = document.querySelector(`script[src="${src}"]`);
  if (existing) {
    if (callback) callback();
    return;
  }

  const script = document.createElement("script");
  script.src = src;
  script.async = true; // Don't block page rendering

  // Call callback when loaded
  script.onload = () => {
    console.log(`✅ Script loaded: ${src}`);
    if (callback) callback();
  };

  script.onerror = () => {
    console.error(`❌ Failed to load script: ${src}`);
  };

  document.body.appendChild(script);
}

/**
 * Load CSS files dynamically
 * @param {string} href - CSS file URL
 */
function loadStyleDeferred(href) {
  const existing = document.querySelector(`link[href="${href}"]`);
  if (existing) return;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

// ============================================
// PERFORMANCE MONITORING
// ============================================

/**
 * Log page performance metrics
 * Helps identify slow loading times
 * Only runs in development (checks console availability)
 */
function logPerformanceMetrics() {
  // Wait for page to fully load
  window.addEventListener("load", () => {
    // Check if Performance API is available
    if (!window.performance) return;

    // Get performance timing data
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    const connectTime = perfData.responseEnd - perfData.requestStart;
    const renderTime = perfData.domComplete - perfData.domLoading;

    // Log metrics to console
    console.group("📊 Performance Metrics");
    console.log(`Page Load Time: ${pageLoadTime}ms`);
    console.log(`Server Response Time: ${connectTime}ms`);
    console.log(`DOM Render Time: ${renderTime}ms`);
    console.groupEnd();

    // Warn if page is slow
    if (pageLoadTime > 3000) {
      console.warn("⚠️ Page load time is slow (>3 seconds)");
    }
  });
}

// ============================================
// OPTIMIZED EVENT HANDLERS
// ============================================

/**
 * Debounced scroll handler
 * Limits how often scroll events fire
 * Prevents performance issues from rapid scroll events
 */
const optimizedScroll = (() => {
  let ticking = false;
  const handlers = [];

  /**
   * Add a scroll handler that will be optimized
   * @param {Function} handler - Function to call on scroll
   */
  function addHandler(handler) {
    handlers.push(handler);
  }

  // Single scroll listener that batches all handlers
  window.addEventListener("scroll", () => {
    if (!ticking) {
      // Use requestAnimationFrame for smooth performance
      window.requestAnimationFrame(() => {
        handlers.forEach((handler) => handler());
        ticking = false;
      });
      ticking = true;
    }
  });

  return { addHandler };
})();

/**
 * Debounced resize handler
 * Similar to scroll handler but for resize events
 */
const optimizedResize = (() => {
  let timeout;
  const handlers = [];

  function addHandler(handler) {
    handlers.push(handler);
  }

  window.addEventListener("resize", () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      handlers.forEach((handler) => handler());
    }, 150); // Wait 150ms after resize stops
  });

  return { addHandler };
})();

// ============================================
// DOM CONTENT OPTIMIZATION
// ============================================

/**
 * Paginate large lists for better performance
 * Instead of rendering 1000 items, show 20 at a time
 *
 * @param {Array} items - All items to display
 * @param {number} itemsPerPage - How many to show at once
 * @param {Function} renderItem - Function to render each item
 * @param {HTMLElement} container - Where to append items
 */
function paginateList(items, itemsPerPage, renderItem, container) {
  let currentPage = 0;
  const totalPages = Math.ceil(items.length / itemsPerPage);

  function renderPage(page) {
    const start = page * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = items.slice(start, end);

    pageItems.forEach((item) => {
      const element = renderItem(item);
      container.appendChild(element);
    });
  }

  function loadMore() {
    if (currentPage < totalPages - 1) {
      currentPage++;
      renderPage(currentPage);
      return true;
    }
    return false;
  }

  // Render first page
  renderPage(0);

  // Return loadMore function for "Load More" button
  return { loadMore, hasMore: () => currentPage < totalPages - 1 };
}

/**
 * Infinite scroll implementation
 * Automatically loads more content when user scrolls near bottom
 *
 * @param {Function} loadMoreCallback - Function to call to load more items
 * @param {number} threshold - Distance from bottom to trigger (pixels)
 */
function enableInfiniteScroll(loadMoreCallback, threshold = 200) {
  let loading = false;

  optimizedScroll.addHandler(() => {
    // Don't trigger if already loading
    if (loading) return;

    // Check if near bottom of page
    const scrollPosition = window.innerHeight + window.scrollY;
    const pageHeight = document.documentElement.scrollHeight;

    if (pageHeight - scrollPosition < threshold) {
      loading = true;

      // Call load more function
      loadMoreCallback()
        .then(() => {
          loading = false;
        })
        .catch(() => {
          loading = false;
        });
    }
  });
}

// ============================================
// CACHE UTILITIES
// ============================================

/**
 * Simple in-memory cache to avoid recalculating expensive operations
 * Useful for search results, API responses, etc.
 */
const cache = (() => {
  const store = new Map();
  const maxAge = 5 * 60 * 1000; // 5 minutes

  /**
   * Get item from cache
   * @param {string} key - Cache key
   * @returns {any|null} Cached value or null
   */
  function get(key) {
    const item = store.get(key);
    if (!item) return null;

    // Check if expired
    if (Date.now() - item.timestamp > maxAge) {
      store.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Set item in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   */
  function set(key, value) {
    store.set(key, {
      value: value,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear all cache
   */
  function clear() {
    store.clear();
  }

  return { get, set, clear };
})();

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize all performance optimizations
 * Called when DOM is ready
 */
function initPerformanceOptimizations() {
  // Enable lazy loading for images
  initLazyLoading();

  // Log performance metrics (development only)
  logPerformanceMetrics();

  // Optimize font loading
  if ("fonts" in document) {
    document.fonts.ready.then(() => {
      console.log("✅ Fonts loaded");
    });
  }

  console.log("⚡ Performance optimizations initialized");
}

// Auto-initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPerformanceOptimizations);
} else {
  initPerformanceOptimizations();
}

// ============================================
// PUBLIC API
// ============================================

window.Performance = {
  // Lazy loading
  initLazyLoading,

  // Script loading
  loadScriptDeferred,
  loadStyleDeferred,

  // Optimized handlers
  optimizedScroll,
  optimizedResize,

  // List optimization
  paginateList,
  enableInfiniteScroll,

  // Cache
  cache,
};

console.log("🚀 Performance module loaded");
