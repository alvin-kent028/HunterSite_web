/**
 * Shared Header Component
 * Manages header navigation, user menu, mobile menu, and updates user name from localStorage
 */

(function () {
  "use strict";

  // Initialize header when DOM is ready
  document.addEventListener("DOMContentLoaded", function () {
    initHeader();
  });

  async function initHeader() {
    // Update user name from localStorage
    await updateHeaderUserName();

    // Hide burger menu on desktop, show on mobile
    hideBurgerOnDesktop();

    // Setup mobile menu toggle
    setupMobileMenu();

    // Setup user dropdown (if applicable)
    setupUserMenu();

    // Make logo clickable
    setupLogoLink();

    // Setup notification and mail buttons
    setupIconButtons();
  }

  /**
   * Hide burger/menu-toggle on desktop (> 992px)
   */
  function hideBurgerOnDesktop() {
    const style = document.createElement("style");
    style.textContent = `
      /* Hide burger menu on desktop */
      @media (min-width: 992px) {
        .burger,
        .menu-toggle {
          display: none !important;
        }
      }
      
      /* Hide desktop navigation on mobile/tablet */
      @media (max-width: 991px) {
        .nav-right {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);

    // Also hide on window resize
    function checkWindowSize() {
      const menuToggles = document.querySelectorAll(".menu-toggle, .burger");
      const navRight = document.querySelectorAll(".nav-right");

      if (window.innerWidth >= 992) {
        // Desktop: hide burger, show nav-right
        menuToggles.forEach((toggle) => {
          toggle.style.display = "none";
        });
        navRight.forEach((nav) => {
          nav.style.display = "";
        });
      } else {
        // Mobile: show burger, hide nav-right
        menuToggles.forEach((toggle) => {
          toggle.style.display = "";
        });
        navRight.forEach((nav) => {
          nav.style.display = "none";
        });
      }
    }

    checkWindowSize();
    window.addEventListener("resize", checkWindowSize);
  }

  /**
   * Update header user name from profile data in localStorage
   */
  async function updateHeaderUserName() {
    try {
      // Check if StorageManager is available
      if (!window.StorageManager) {
        console.warn("StorageManager not available for header");
        return;
      }

      // First try to get current user (works for all user types)
      const currentUser = window.StorageManager.getCurrentUser();

      if (currentUser) {
        // Use name or email for display
        const displayName = currentUser.name || currentUser.email || "User";
        const userNameElements = document.querySelectorAll(
          ".user-name, .user, .nav-right .user"
        );
        userNameElements.forEach((el) => {
          if (el) {
            el.textContent = displayName;
          }
        });
        return; // Exit early if we have current user
      }

      // Fallback: Try to load profile data for job seekers
      if (window.StorageManager.loadProfileData) {
        const profile = await window.StorageManager.loadProfileData();

        if (profile && profile.basicInfo && profile.basicInfo.name) {
          // Update all user name elements in header
          const userNameElements = document.querySelectorAll(
            ".user-name, .user, .nav-right .user"
          );
          userNameElements.forEach((el) => {
            if (el) {
              el.textContent = profile.basicInfo.name;
            }
          });
        }
      }
    } catch (error) {
      console.error("Error updating header user name:", error);
    }
  }

  /**
   * Get base path based on current location
   */
  function getBasePath() {
    const path = window.location.pathname;

    // If we're in a subdirectory, use ../
    if (
      path.includes("/profile/") ||
      path.includes("/job-listing/") ||
      path.includes("/categories/") ||
      path.includes("/login/")
    ) {
      return "../";
    }

    // If we're at root, use ./
    return "./";
  }

  /**
   * Handle logout click
   */
  function handleLogout(event) {
    event.preventDefault();

    if (window.StorageManager && window.StorageManager.logoutUser) {
      window.StorageManager.logoutUser();
    } else {
      // Fallback: clear localStorage
      localStorage.clear();
    }

    // Redirect to login page
    const basePath = getBasePath();
    window.location.href = basePath + "login/login.html";
  }

  /**
   * Setup mobile menu toggle functionality
   */
  function setupMobileMenu() {
    const menuToggles = document.querySelectorAll(".menu-toggle, .burger");
    const body = document.body;

    menuToggles.forEach((toggle) => {
      toggle.addEventListener("click", function (e) {
        e.preventDefault();

        // Create mobile menu if it doesn't exist
        let mobileMenu = document.getElementById("mobile-menu");

        if (!mobileMenu) {
          mobileMenu = createMobileMenu();
          body.appendChild(mobileMenu);
        }

        // Toggle menu visibility
        const isOpen = mobileMenu.classList.contains("show");

        if (isOpen) {
          closeMobileMenu(mobileMenu);
        } else {
          openMobileMenu(mobileMenu);
        }

        // Toggle burger animation
        toggle.classList.toggle("active");
      });
    });
  }

  /**
   * Create mobile menu element
   */
  function createMobileMenu() {
    const menu = document.createElement("div");
    menu.id = "mobile-menu";
    menu.className = "mobile-menu";

    // Get proper base path based on current location
    const basePath = getBasePath();

    menu.innerHTML = `
      <div class="mobile-menu-overlay"></div>
      <div class="mobile-menu-content">
        <div class="mobile-menu-header">
          <h3>Menu</h3>
          <button class="mobile-menu-close" aria-label="Close menu">×</button>
        </div>
        <nav class="mobile-menu-nav">
          <a href="${basePath}index.html" class="mobile-menu-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span>Home</span>
          </a>
          <a href="${basePath}job-listing/job-listing.html" class="mobile-menu-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
            <span>Job Listings</span>
          </a>
          <a href="${basePath}categories/index.html" class="mobile-menu-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            <span>Categories</span>
          </a>
          <a href="${basePath}profile/profile.html" class="mobile-menu-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>My Profile</span>
          </a>
          <div class="mobile-menu-divider"></div>
          <a href="${basePath}login/login.html" class="mobile-menu-item text-danger" id="mobile-logout-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Logout</span>
          </a>
        </nav>
      </div>
    `;

    // Add styles
    const style = document.createElement("style");
    style.textContent = `
      .mobile-menu {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 9999;
        visibility: hidden;
        opacity: 0;
        transition: opacity 0.3s ease, visibility 0.3s ease;
      }
      
      .mobile-menu.show {
        visibility: visible;
        opacity: 1;
      }
      
      .mobile-menu-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
      }
      
      .mobile-menu-content {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        width: 80%;
        max-width: 320px;
        background: #fff;
        box-shadow: 2px 0 20px rgba(0, 0, 0, 0.1);
        transform: translateX(-100%);
        transition: transform 0.3s ease;
        overflow-y: auto;
      }
      
      .mobile-menu.show .mobile-menu-content {
        transform: translateX(0);
      }
      
      .mobile-menu-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid #e5e5e5;
        background: #f8f9fa;
      }
      
      .mobile-menu-header h3 {
        margin: 0;
        font-size: 20px;
        font-weight: 700;
        color: #111;
      }
      
      .mobile-menu-close {
        background: none;
        border: none;
        font-size: 32px;
        line-height: 1;
        cursor: pointer;
        color: #666;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .mobile-menu-nav {
        padding: 10px 0;
      }
      
      .mobile-menu-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 20px;
        color: #333;
        text-decoration: none;
        font-weight: 500;
        transition: background 0.2s ease;
      }
      
      .mobile-menu-item:hover {
        background: #f8f9fa;
      }
      
      .mobile-menu-item svg {
        flex-shrink: 0;
      }
      
      .mobile-menu-item.text-danger {
        color: #dc3545;
      }
      
      .mobile-menu-divider {
        height: 1px;
        background: #e5e5e5;
        margin: 10px 20px;
      }
      
      .menu-toggle.active .hamburger:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
      }
      
      .menu-toggle.active .hamburger:nth-child(2) {
        opacity: 0;
      }
      
      .menu-toggle.active .hamburger:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
      }
      
      .burger.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
      }
      
      .burger.active span:nth-child(2) {
        opacity: 0;
      }
      
      .burger.active span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
      }
    `;
    document.head.appendChild(style);

    // Setup close handlers
    const closeBtn = menu.querySelector(".mobile-menu-close");
    const overlay = menu.querySelector(".mobile-menu-overlay");
    const logoutLink = menu.querySelector("#mobile-logout-link");

    closeBtn.addEventListener("click", () => closeMobileMenu(menu));
    overlay.addEventListener("click", () => closeMobileMenu(menu));

    // Handle logout separately
    if (logoutLink) {
      logoutLink.addEventListener("click", (e) => {
        handleLogout(e);
      });
    }

    // Close on other link clicks
    menu
      .querySelectorAll(".mobile-menu-item:not(#mobile-logout-link)")
      .forEach((link) => {
        link.addEventListener("click", () => {
          setTimeout(() => closeMobileMenu(menu), 200);
        });
      });

    return menu;
  }

  /**
   * Open mobile menu
   */
  function openMobileMenu(menu) {
    menu.classList.add("show");
    document.body.style.overflow = "hidden";
  }

  /**
   * Close mobile menu
   */
  function closeMobileMenu(menu) {
    menu.classList.remove("show");
    document.body.style.overflow = "";

    // Remove active state from toggles
    document.querySelectorAll(".menu-toggle, .burger").forEach((toggle) => {
      toggle.classList.remove("active");
    });
  }

  /**
   * Setup user menu dropdown functionality
   */
  function setupUserMenu() {
    const userLinks = document.querySelectorAll(
      ".user, .user-name, .user-profile"
    );
    const basePath = getBasePath();

    userLinks.forEach((link) => {
      // Make user name clickable if not already a link
      if (link.tagName !== "A") {
        link.style.cursor = "pointer";
        link.addEventListener("click", function (e) {
          e.preventDefault();
          window.location.href = basePath + "profile/profile.html";
        });
      }
    });
  }

  /**
   * Setup logo link functionality
   */
  function setupLogoLink() {
    const logos = document.querySelectorAll(".logo, .brand");
    const basePath = getBasePath();

    logos.forEach((logo) => {
      if (logo.tagName !== "A") {
        logo.style.cursor = "pointer";
        logo.addEventListener("click", function (e) {
          e.preventDefault();
          window.location.href = basePath + "index.html";
        });
      }
    });
  }

  /**
 * Setup icon buttons (notifications, mail)
 * Shows actual notifications and messages for the logged-in user
 */
function setupIconButtons() {
  // Notification button
  const notificationBtns = document.querySelectorAll(
    '.notification-btn, .icon-btn[aria-label*="Notification"]'
  );
  notificationBtns.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      showUserNotifications();
    });
  });

  // Mail button
  const mailBtns = document.querySelectorAll(
    '.mail-btn, .icon-btn[aria-label*="Mail"]'
  );
  mailBtns.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      showUserMessages();
    });
  });
}

/**
 * Show notifications for the logged-in user
 * Retrieves notifications from localStorage and displays them
 */
function showUserNotifications() {
  const user = window.StorageManager.getCurrentUser();

  if (!user) {
    alert("Please log in to view notifications");
    return;
  }

  // Get notifications from storage
  const notifications = getNotificationsForUser(user.email);

  if (notifications.length === 0) {
    showNotificationModal("No notifications", "You have no new notifications");
    return;
  }

  // Create notification modal
  const modal = createNotificationModal(notifications);
  document.body.appendChild(modal);

  // Add close functionality
  modal.querySelector(".notification-close").addEventListener("click", () => {
    modal.remove();
  });

  // Close on overlay click
  modal.querySelector(".notification-overlay").addEventListener("click", () => {
    modal.remove();
  });
}

/**
 * Get notifications for a specific user
 * @param {string} userEmail - User's email address
 * @returns {Array} Array of notification objects
 */
function getNotificationsForUser(userEmail) {
  try {
    const notifications = getFromStorage(`huntersite_notifications_${userEmail}`) || [];
    return notifications;
  } catch (error) {
    console.error("Error loading notifications:", error);
    return [];
  }
}

/**
 * Create notification modal HTML
 * @param {Array} notifications - Array of notification objects
 * @returns {HTMLElement} Modal element
 */
function createNotificationModal(notifications) {
  const modal = document.createElement("div");
  modal.className = "notification-modal";
  modal.innerHTML = `
    <div class="notification-overlay"></div>
    <div class="notification-content">
      <div class="notification-header">
        <h3>Notifications</h3>
        <button class="notification-close" aria-label="Close">×</button>
      </div>
      <div class="notification-list">
        ${notifications.map((notif) => `
          <div class="notification-item ${notif.read ? 'read' : 'unread'}">
            <div class="notification-icon">
              ${getNotificationIcon(notif.type)}
            </div>
            <div class="notification-body">
              <p class="notification-title">${notif.title}</p>
              <p class="notification-message">${notif.message}</p>
              <span class="notification-time">${formatTimeAgo(notif.date)}</span>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="notification-footer">
        <button class="mark-all-read">Mark all as read</button>
      </div>
    </div>
  `;

  // Add styles
  const style = document.createElement("style");
  style.textContent = `
    .notification-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .notification-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
    }
    
    .notification-content {
      position: relative;
      width: 90%;
      max-width: 500px;
      max-height: 80vh;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    
    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #e5e5e5;
      background: #f8f9fa;
    }
    
    .notification-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 700;
      color: #111;
    }
    
    .notification-close {
      background: none;
      border: none;
      font-size: 28px;
      line-height: 1;
      cursor: pointer;
      color: #666;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background 0.2s ease;
    }
    
    .notification-close:hover {
      background: #e5e5e5;
    }
    
    .notification-list {
      flex: 1;
      overflow-y: auto;
      padding: 10px;
    }
    
    .notification-item {
      display: flex;
      gap: 12px;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 10px;
      transition: background 0.2s ease;
    }
    
    .notification-item:hover {
      background: #f8f9fa;
    }
    
    .notification-item.unread {
      background: #e7f3ff;
    }
    
    .notification-item.unread .notification-title {
      font-weight: 600;
    }
    
    .notification-icon {
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f0f0f0;
    }
    
    .notification-icon svg {
      width: 20px;
      height: 20px;
      fill: #666;
    }
    
    .notification-body {
      flex: 1;
      min-width: 0;
    }
    
    .notification-title {
      margin: 0 0 5px 0;
      font-size: 14px;
      font-weight: 600;
      color: #111;
    }
    
    .notification-message {
      margin: 0 0 5px 0;
      font-size: 13px;
      color: #666;
      line-height: 1.4;
    }
    
    .notification-time {
      font-size: 11px;
      color: #999;
    }
    
    .notification-footer {
      padding: 15px 20px;
      border-top: 1px solid #e5e5e5;
      background: #f8f9fa;
    }
    
    .mark-all-read {
      width: 100%;
      padding: 10px;
      background: #007bff;
      color: #fff;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s ease;
    }
    
    .mark-all-read:hover {
      background: #0056b3;
    }
  `;
  document.head.appendChild(style);

  // Mark all as read functionality
  modal.querySelector(".mark-all-read").addEventListener("click", () => {
    const user = window.StorageManager.getCurrentUser();
    if (user) {
      markAllNotificationsAsRead(user.email);
      modal.remove();
      showUserNotifications(); // Refresh notifications
    }
  });

  return modal;
}

/**
 * Get notification icon based on type
 * @param {string} type - Notification type
 * @returns {string} SVG icon HTML
 */
function getNotificationIcon(type) {
  const icons = {
    job: `<svg viewBox="0 0 24 24"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/></svg>`,
    application: `<svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>`,
    message: `<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>`,
    system: `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`
  };
  return icons[type] || icons.system;
}

/**
 * Format time ago from date
 * @param {string} date - ISO date string
 * @returns {string} Formatted time ago string
 */
function formatTimeAgo(date) {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return then.toLocaleDateString();
}

/**
 * Show notification modal with message
 * @param {string} title - Modal title
 * @param {string} message - Modal message
 */
function showNotificationModal(title, message) {
  const modal = document.createElement("div");
  modal.className = "notification-modal";
  modal.innerHTML = `
    <div class="notification-overlay"></div>
    <div class="notification-content">
      <div class="notification-header">
        <h3>${title}</h3>
        <button class="notification-close" aria-label="Close">×</button>
      </div>
      <div class="notification-body" style="padding: 20px;">
        <p style="margin: 0; color: #666;">${message}</p>
      </div>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .notification-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .notification-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
    }
    
    .notification-content {
      position: relative;
      width: 90%;
      max-width: 400px;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      overflow: hidden;
    }
    
    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #e5e5e5;
      background: #f8f9fa;
    }
    
    .notification-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 700;
      color: #111;
    }
    
    .notification-close {
      background: none;
      border: none;
      font-size: 28px;
      line-height: 1;
      cursor: pointer;
      color: #666;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background 0.2s ease;
    }
    
    .notification-close:hover {
      background: #e5e5e5;
    }
    
    .notification-body {
      padding: 20px;
    }
  `;
  document.head.appendChild(style);

  modal.querySelector(".notification-close").addEventListener("click", () => {
    modal.remove();
  });

  modal.querySelector(".notification-overlay").addEventListener("click", () => {
    modal.remove();
  });

  document.body.appendChild(modal);
}

/**
 * Mark all notifications as read for a user
 * @param {string} userEmail - User's email address
 */
function markAllNotificationsAsRead(userEmail) {
  try {
    const notifications = getNotificationsForUser(userEmail);
    notifications.forEach((notif) => {
      notif.read = true;
    });
    saveToStorage(`huntersite_notifications_${userEmail}`, notifications);
  } catch (error) {
    console.error("Error marking notifications as read:", error);
  }
}

/**
 * Show messages for the logged-in user
 * Retrieves messages from localStorage and displays them
 */
function showUserMessages() {
  const user = window.StorageManager.getCurrentUser();

  if (!user) {
    alert("Please log");
      };


    // Mail button
    const mailBtns = document.querySelectorAll(
      '.mail-btn, .icon-btn[aria-label*="Mail"]'
    );
    mailBtns.forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        alert("Messages feature coming soon!");
      });
    });

    // Language button
  const langBtns = document.querySelectorAll(".lang-btn, .lang");
  langBtns.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      showLanguageOptions();
    });
  });
}

/**
 * Show language selection options for the logged-in user
 * Retrieves and displays user's current language preference
 */
function showLanguageOptions() {
  const user = window.StorageManager.getCurrentUser();

  if (!user) {
    alert("Please log in to change language settings");
    return;
  }

  // Get user's current language preference
  const currentLanguage = getUserLanguagePreference(user.email);

  // Create language modal
  const modal = createLanguageModal(currentLanguage);
  document.body.appendChild(modal);

  // Add close functionality
  modal.querySelector(".language-close").addEventListener("click", () => {
    modal.remove();
  });

  // Close on overlay click
  modal.querySelector(".language-overlay").addEventListener("click", () => {
    modal.remove();
  });
}

/**
 * Get user's language preference from storage
 * @param {string} userEmail - User's email address
 * @returns {string} Current language code (e.g., 'en', 'tl', 'es')
 */
function getUserLanguagePreference(userEmail) {
  try {
    const language = getFromStorage(`huntersite_language_${userEmail}`) || 'en';
    return language;
  } catch (error) {
    console.error("Error loading language preference:", error);
    return 'en';
  }
}

/**
 * Create language selection modal HTML
 * @param {string} currentLanguage - Current selected language
 * @returns {HTMLElement} Modal element
 */
function createLanguageModal(currentLanguage) {
  const modal = document.createElement("div");
  modal.className = "language-modal";
  modal.innerHTML = `
    <div class="language-overlay"></div>
    <div class="language-content">
      <div class="language-header">
        <h3>Language Settings</h3>
        <button class="language-close" aria-label="Close">×</button>
      </div>
      <div class="language-body">
        <p class="language-description">Select your preferred language for the website</p>
        <div class="language-options">
          <div class="language-option ${currentLanguage === 'en' ? 'selected' : ''}" data-lang="en">
            <div class="language-flag">🇺🇸</div>
            <div class="language-info">
              <span class="language-name">English</span>
              <span class="language-code">en</span>
            </div>
            ${currentLanguage === 'en' ? '<span class="check-icon">✓</span>' : ''}
          </div>
          <div class="language-option ${currentLanguage === 'tl' ? 'selected' : ''}" data-lang="tl">
            <div class="language-flag">🇵🇭</div>
            <div class="language-info">
              <span class="language-name">Filipino</span>
              <span class="language-code">tl</span>
            </div>
            ${currentLanguage === 'tl' ? '<span class="check-icon">✓</span>' : ''}
          </div>
          <div class="language-option ${currentLanguage === 'es' ? 'selected' : ''}" data-lang="es">
            <div class="language-flag">🇪🇸</div>
            <div class="language-info">
              <span class="language-name">Spanish</span>
              <span class="language-code">es</span>
            </div>
            ${currentLanguage === 'es' ? '<span class="check-icon">✓</span>' : ''}
          </div>
          <div class="language-option ${currentLanguage === 'fr' ? 'selected' : ''}" data-lang="fr">
            <div class="language-flag">🇫🇷</div>
            <div class="language-info">
              <span class="language-name">French</span>
              <span class="language-code">fr</span>
            </div>
            ${currentLanguage === 'fr' ? '<span class="check-icon">✓</span>' : ''}
          </div>
          <div class="language-option ${currentLanguage === 'de' ? 'selected' : ''}" data-lang="de">
            <div class="language-flag">🇩🇪</div>
            <div class="language-info">
              <span class="language-name">German</span>
              <span class="language-code">de</span>
            </div>
            ${currentLanguage === 'de' ? '<span class="check-icon">✓</span>' : ''}
          </div>
        </div>
      </div>
      <div class="language-footer">
        <button class="save-language-btn">Save Changes</button>
      </div>
    </div>
  `;

  // Add styles
  const style = document.createElement("style");
  style.textContent = `
    .language-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .language-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
    }
    
    .language-content {
      position: relative;
      width: 90%;
      max-width: 500px;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    
    .language-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #e5e5e5;
      background: #f8f9fa;
    }
    
    .language-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 700;
      color: #111;
    }
    
    .language-close {
      background: none;
      border: none;
      font-size: 28px;
      line-height: 1;
      cursor: pointer;
      color: #666;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background 0.2s ease;
    }
    
    .language-close:hover {
      background: #e5e5e5;
    }
    
    .language-body {
      padding: 20px;
      flex: 1;
    }
    
    .language-description {
      margin: 0 0 20px 0;
      font-size: 14px;
      color: #666;
      text-align: center;
    }
    
    .language-options {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .language-option {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 15px;
      border: 2px solid #e5e5e5;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .language-option:hover {
      border-color: #007bff;
      background: #f0f7ff;
    }
    
    .language-option.selected {
      border-color: #007bff;
      background: #e7f3ff;
    }
    
    .language-flag {
      font-size: 24px;
      width: 40px;
      text-align: center;
    }
    
    .language-info {
      flex: 1;
    }
    
    .language-name {
      display: block;
      font-size: 14px;
      font-weight: 600;
      color: #111;
    }
    
    .language-code {
      display: block;
      font-size: 11px;
      color: #666;
    }
    
    .check-icon {
      color: #007bff;
      font-size: 20px;
      font-weight: 600;
    }
    
    .language-footer {
      padding: 15px 20px;
      border-top: 1px solid #e5e5e5;
      background: #f8f9fa;
    }
    
    .save-language-btn {
      width: 100%;
      padding: 12px;
      background: #007bff;
      color: #fff;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s ease;
    }
    
    .save-language-btn:hover {
      background: #0056b3;
    }
  `;
  document.head.appendChild(style);

  // Handle language selection
  modal.querySelectorAll(".language-option").forEach((option) => {
    option.addEventListener("click", () => {
      // Remove selected class from all options
      modal.querySelectorAll(".language-option").forEach((opt) => {
        opt.classList.remove("selected");
        opt.querySelector(".check-icon")?.remove();
      });

      // Add selected class to clicked option
      option.classList.add("selected");

      // Add check icon
      const checkIcon = document.createElement("span");
      checkIcon.className = "check-icon";
      checkIcon.textContent = "✓";
      option.appendChild(checkIcon);
    });
  });

  // Save language button
  modal.querySelector(".save-language-btn").addEventListener("click", () => {
    const user = window.StorageManager.getCurrentUser();
    if (user) {
      const selectedOption = modal.querySelector(".language-option.selected");
      if (selectedOption) {
        const selectedLanguage = selectedOption.getAttribute("data-lang");
        saveUserLanguagePreference(user.email, selectedLanguage);
        modal.remove();
        alert(`Language changed to ${selectedLanguage.toUpperCase()}`);
      }
    }
  });

  return modal;
}

/**
 * Save user's language preference to storage
 * @param {string} userEmail - User's email address
 * @param {string} language - Language code to save
 */
function saveUserLanguagePreference(userEmail, language) {
  try {
    saveToStorage(`huntersite_language_${userEmail}`, language);
    console.log(`Language preference saved: ${language}`);
  } catch (error) {
    console.error("Error saving language preference:", error);
  }
}

/**
 * Get language name from code
 * @param {string} langCode - Language code
 * @returns {string} Language name
 */
function getLanguageName(langCode) {
  const languages = {
    'en': 'English',
    'tl': 'Filipino',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
  };
  return languages[langCode] || 'English';
}

/**
 * Get language flag emoji from code
 * @param {string} langCode - Language code
 * @returns {string} Flag emoji
 */
function getLanguageFlag(langCode) {
  const flags = {
    'en': '🇺🇸',
    'tl': '🇵🇭',
    'es': '🇪🇸',
    'fr': '🇫🇷',
    'de': '🇩🇪',
  };
  return flags[langCode] || '🇺🇸';
}

/**
 * Apply language preference to the page
 * @param {string} langCode - Language code to apply
 */
function applyLanguagePreference(langCode) {
  // This function can be extended to actually change page content
  // based on the selected language
  console.log(`Applying language: ${langCode}`);
  
  // Example: Update page title or other language-specific content
  document.documentElement.lang = langCode;
  
  // You can add translation logic here
  // For now, just log the change
  console.log(`Language preference applied: ${langCode}`);
}

// Export for global access
window.LanguageManager = {
  showLanguageOptions: showLanguageOptions,
  getUserLanguagePreference: getUserLanguagePreference,
  saveUserLanguagePreference: saveUserLanguagePreference,
  applyLanguagePreference: applyLanguagePreference,
  getLanguageName: getLanguageName,
  getLanguageFlag: getLanguageFlag,
};

  // Export for global access
  window.HeaderManager = {
    updateUserName: updateHeaderUserName,
    init: initHeader,
    logout: handleLogout,
  };
})();
