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
   */
  function setupIconButtons() {
    // Notification button
    const notificationBtns = document.querySelectorAll(
      '.notification-btn, .icon-btn[aria-label*="Notification"]'
    );
    notificationBtns.forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        alert("Notifications feature coming soon!");
      });
    });

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
        alert("Language selection coming soon!");
      });
    });
  }

  // Export for global access
  window.HeaderManager = {
    updateUserName: updateHeaderUserName,
    init: initHeader,
    logout: handleLogout,
  };
})();
