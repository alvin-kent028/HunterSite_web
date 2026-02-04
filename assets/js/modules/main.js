/**
 * JobFinder Main JavaScript
 * All interactive features and enhancements
 */

// 1. Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const href = this.getAttribute("href");
    if (href !== "#" && href !== "#post") {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  });
});

// 2. Animate stat badges on scroll
const observerOptions = {
  threshold: 0.5,
  rootMargin: "0px 0px -100px 0px",
};

const animateOnScroll = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "0";
      entry.target.style.transform = "scale(0.8)";
      setTimeout(() => {
        entry.target.style.transition = "all 0.5s ease-out";
        entry.target.style.opacity = "1";
        entry.target.style.transform = "scale(1)";
      }, 100);
    }
  });
}, observerOptions);

document.querySelectorAll(".stat-badge").forEach((badge) => {
  animateOnScroll.observe(badge);
});

// 3. Toggle heart/wishlist on job cards
document.querySelectorAll('.btn[aria-label="Save job"]').forEach((button) => {
  button.addEventListener("click", function (e) {
    e.preventDefault();
    this.classList.toggle("active");

    if (this.classList.contains("active")) {
      this.classList.remove("btn-outline-dark");
      this.classList.add("btn-danger");
      // Show toast notification
      showToast("Job saved to your wishlist! ❤️");
    } else {
      this.classList.remove("btn-danger");
      this.classList.add("btn-outline-dark");
      showToast("Job removed from wishlist");
    }
  });
});

// 4. Search form enhancement
const searchForm = document.querySelector(".search-form");
if (searchForm) {
  searchForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const jobInput = this.querySelector('input[type="search"]');
    const locationInput = this.querySelectorAll('input[type="text"]')[0];

    if (!jobInput.value.trim()) {
      jobInput.focus();
      jobInput.classList.add("border", "border-danger");
      setTimeout(
        () => jobInput.classList.remove("border", "border-danger"),
        2000
      );
      return;
    }

    // Simulate search
    showToast(
      `Searching for "${jobInput.value}" in "${
        locationInput.value || "All Locations"
      }"...`
    );
  });
}

// 5. Category card hover effects
document.querySelectorAll(".categories .card").forEach((card) => {
  card.addEventListener("mouseenter", function () {
    this.style.transform = "translateY(-5px)";
    this.style.transition = "transform 0.3s ease";
  });

  card.addEventListener("mouseleave", function () {
    this.style.transform = "translateY(0)";
  });
});

// 6. Job card hover effects
document.querySelectorAll(".jobs .card").forEach((card) => {
  card.addEventListener("mouseenter", function () {
    this.style.transform = "translateY(-3px)";
    this.style.boxShadow = "0 8px 16px rgba(0,0,0,0.1)";
    this.style.transition = "all 0.3s ease";
  });

  card.addEventListener("mouseleave", function () {
    this.style.transform = "translateY(0)";
    this.style.boxShadow = "";
  });
});

// 7. Navbar scroll effect
let lastScroll = 0;
const navbar = document.querySelector(".site-header");

window.addEventListener("scroll", () => {
  const currentScroll = window.pageYOffset;

  if (currentScroll > 100) {
    navbar.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
  } else {
    navbar.style.boxShadow = "";
  }

  lastScroll = currentScroll;
});

// 8. Toast notification system
function showToast(message) {
  // Remove existing toast if any
  const existingToast = document.querySelector(".custom-toast");
  if (existingToast) existingToast.remove();

  const toast = document.createElement("div");
  toast.className =
    "custom-toast position-fixed bottom-0 end-0 m-4 p-3 bg-dark text-white rounded-3 shadow-lg";
  toast.style.zIndex = "9999";
  toast.style.minWidth = "250px";
  toast.style.animation = "slideIn 0.3s ease-out";
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease-out";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// 9. Auto-pause carousel on hover
const carousel = document.querySelector("#categoriesCarousel");
if (carousel) {
  carousel.addEventListener("mouseenter", () => {
    bootstrap.Carousel.getInstance(carousel)?.pause();
  });

  carousel.addEventListener("mouseleave", () => {
    bootstrap.Carousel.getInstance(carousel)?.cycle();
  });
}

// 10. Popular search tags interaction
document.querySelectorAll('.hero a[href="#"]').forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    const searchInput = document.querySelector(
      '.search-form input[type="search"]'
    );
    if (searchInput) {
      searchInput.value = this.textContent.trim();
      searchInput.focus();
      searchInput.classList.add("border", "border-warning");
      setTimeout(
        () => searchInput.classList.remove("border", "border-warning"),
        1000
      );
    }
  });
});

// 11. Animate numbers in stat badges
function animateNumber(element, target) {
  const duration = 2000;
  const start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const current = Math.floor(progress * target);
    element.textContent = current + "k+";

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// Trigger number animation when stat badges are visible
const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !entry.target.dataset.animated) {
        const numberElement = entry.target.querySelector(".fs-4");
        const targetNumber = parseInt(numberElement.textContent);
        entry.target.dataset.animated = "true";
        animateNumber(numberElement, targetNumber);
      }
    });
  },
  { threshold: 0.5 }
);

document.querySelectorAll(".stat-badge").forEach((badge) => {
  statObserver.observe(badge);
});

// 12. Keyboard navigation enhancement
document.addEventListener("keydown", (e) => {
  // Press '/' to focus search
  if (e.key === "/" && !e.target.matches("input, textarea")) {
    e.preventDefault();
    document.querySelector('.search-form input[type="search"]')?.focus();
  }

  // Press 'Escape' to clear search
  if (e.key === "Escape" && e.target.matches("input")) {
    e.target.value = "";
    e.target.blur();
  }
});

// 13. Search autocomplete/suggestions
const searchInput = document.querySelector('.search-form input[type="search"]');
if (searchInput) {
  const suggestions = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "UI/UX Designer",
    "Graphic Designer",
    "Product Designer",
    "Marketing Manager",
    "Digital Marketing",
    "Content Writer",
    "Data Analyst",
    "Data Scientist",
    "Machine Learning",
    "Project Manager",
    "Product Manager",
    "Business Analyst",
    "Customer Support",
    "Sales Representative",
    "Account Manager",
  ];

  let suggestionBox = null;

  searchInput.addEventListener("input", function () {
    const value = this.value.toLowerCase();

    // Remove existing suggestions
    if (suggestionBox) {
      suggestionBox.remove();
      suggestionBox = null;
    }

    if (value.length < 2) return;

    const matches = suggestions
      .filter((s) => s.toLowerCase().includes(value))
      .slice(0, 5);

    if (matches.length > 0) {
      // Create Bootstrap-styled dropdown menu
      suggestionBox = document.createElement("div");
      suggestionBox.className = "dropdown-menu show";
      suggestionBox.style.cssText = `
        position: absolute;
        top: calc(100% + 8px);
        left: 0;
        right: 0;
        max-height: 250px;
        overflow-y: auto;
        z-index: 1050;
        border-radius: 12px;
        border: 1px solid #dee2e6;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      `;

      matches.forEach((match, index) => {
        const item = document.createElement("a");
        item.className = "dropdown-item py-2 px-3";
        item.href = "#";
        item.textContent = match;
        item.style.cursor = "pointer";

        // Add icon for better UX
        const icon = document.createElement("span");
        icon.textContent = "🔍 ";
        icon.style.marginRight = "8px";
        item.prepend(icon);

        item.addEventListener("click", function (e) {
          e.preventDefault();
          searchInput.value = match;
          if (suggestionBox) {
            suggestionBox.remove();
            suggestionBox = null;
          }
          searchInput.focus();
          showToast(`Searching for: ${match}`);
        });

        suggestionBox.appendChild(item);

        // Add divider except for last item
        if (index < matches.length - 1) {
          const divider = document.createElement("hr");
          divider.className = "dropdown-divider my-0";
          suggestionBox.appendChild(divider);
        }
      });

      // Position dropdown relative to the search form
      const searchForm = document.querySelector(".search-form");
      if (searchForm) {
        searchForm.style.position = "relative";
        searchForm.appendChild(suggestionBox);
      }
    }
  });

  // Close suggestions on outside click
  document.addEventListener("click", function (e) {
    if (
      suggestionBox &&
      !searchInput.contains(e.target) &&
      !suggestionBox.contains(e.target)
    ) {
      suggestionBox.remove();
      suggestionBox = null;
    }
  });

  // Close suggestions on escape key
  searchInput.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && suggestionBox) {
      suggestionBox.remove();
      suggestionBox = null;
      searchInput.blur();
    }
  });

  // Arrow key navigation
  searchInput.addEventListener("keydown", function (e) {
    if (!suggestionBox) return;

    const items = suggestionBox.querySelectorAll(".dropdown-item");
    const activeItem = suggestionBox.querySelector(".dropdown-item.active");
    let currentIndex = Array.from(items).indexOf(activeItem);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (activeItem) activeItem.classList.remove("active");
      currentIndex = (currentIndex + 1) % items.length;
      items[currentIndex].classList.add("active");
      items[currentIndex].scrollIntoView({ block: "nearest" });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (activeItem) activeItem.classList.remove("active");
      currentIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
      items[currentIndex].classList.add("active");
      items[currentIndex].scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter" && activeItem) {
      e.preventDefault();
      activeItem.click();
    }
  });
}

// 14. Scroll to top button
const scrollToTopBtn = document.createElement("button");
scrollToTopBtn.innerHTML = "↑";
scrollToTopBtn.className = "btn btn-warning rounded-circle position-fixed";
scrollToTopBtn.style.cssText = `
  bottom: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  display: none;
  z-index: 1000;
  font-size: 24px;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  padding: 0;
  line-height: 1;
`;
scrollToTopBtn.setAttribute("aria-label", "Scroll to top");
document.body.appendChild(scrollToTopBtn);

window.addEventListener("scroll", () => {
  if (window.pageYOffset > 300) {
    scrollToTopBtn.style.display = "block";
  } else {
    scrollToTopBtn.style.display = "none";
  }
});

scrollToTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// 15. Loading skeleton for images
document.querySelectorAll("img").forEach((img) => {
  if (!img.complete) {
    img.style.backgroundColor = "#f0f0f0";
    img.style.minHeight = "100px";

    img.addEventListener("load", function () {
      this.style.backgroundColor = "";
      this.style.animation = "fadeIn 0.3s ease-in";
    });
  }
});

// 16. Copy job link functionality
document.querySelectorAll(".jobs .card").forEach((card) => {
  // Only add share button if it doesn't already exist
  if (!card.querySelector(".share-job-btn")) {
    const shareBtn = document.createElement("button");
    shareBtn.innerHTML = "🔗";
    shareBtn.className =
      "btn btn-sm btn-light position-absolute top-0 end-0 m-2 opacity-0 share-job-btn";
    shareBtn.style.transition = "opacity 0.3s ease";
    shareBtn.setAttribute("aria-label", "Copy job link");
    shareBtn.title = "Copy link";

    // Ensure card has position context
    if (getComputedStyle(card).position === "static") {
      card.style.position = "relative";
    }
    card.appendChild(shareBtn);

    card.addEventListener("mouseenter", () => {
      shareBtn.style.opacity = "1";
    });

    card.addEventListener("mouseleave", () => {
      shareBtn.style.opacity = "0";
    });

    shareBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const jobTitle = card.querySelector("h3").textContent;
      const jobUrl = `${window.location.origin}${window.location.pathname}#jobs`;

      navigator.clipboard
        .writeText(jobUrl)
        .then(() => {
          showToast(`Link copied: ${jobTitle}`);
        })
        .catch(() => {
          showToast("Could not copy link");
        });
    });
  }
});

// 17. View counter animation
let viewCount = 0;
const viewCounter = document.createElement("div");
viewCounter.className =
  "d-none d-md-block position-fixed bottom-0 start-0 m-3 p-2 bg-white border rounded shadow-sm";
viewCounter.style.fontSize = "12px";
viewCounter.style.zIndex = "999";
viewCounter.innerHTML =
  '<strong>👁️ Views:</strong> <span id="viewCount">0</span>';

// Simulate view count
function incrementViewCount() {
  viewCount++;
  const countElement = document.getElementById("viewCount");
  if (countElement) {
    countElement.textContent = viewCount.toLocaleString();
  }
}

// Track page views
window.addEventListener("load", () => {
  // Simulate initial views
  viewCount = Math.floor(Math.random() * 500) + 100;
  document.body.appendChild(viewCounter);
  incrementViewCount();

  // Increment occasionally
  setInterval(() => {
    if (Math.random() > 0.7) {
      incrementViewCount();
    }
  }, 5000);
});

// 18. Dark mode toggle
const darkModeToggle = document.createElement("button");
darkModeToggle.innerHTML = "🌙";
darkModeToggle.className =
  "btn btn-sm btn-light position-fixed d-none d-md-block";
darkModeToggle.style.cssText = `
  top: 80px;
  right: 20px;
  width: 40px;
  height: 40px;
  z-index: 1000;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;
darkModeToggle.setAttribute("aria-label", "Toggle dark mode");
darkModeToggle.title = "Toggle dark mode";
document.body.appendChild(darkModeToggle);

let isDarkMode = false;
darkModeToggle.addEventListener("click", () => {
  isDarkMode = !isDarkMode;

  if (isDarkMode) {
    document.body.style.filter = "invert(1) hue-rotate(180deg)";
    document.querySelectorAll("img, video").forEach((media) => {
      media.style.filter = "invert(1) hue-rotate(180deg)";
    });
    darkModeToggle.innerHTML = "☀️";
    showToast("Dark mode enabled");
  } else {
    document.body.style.filter = "";
    document.querySelectorAll("img, video").forEach((media) => {
      media.style.filter = "";
    });
    darkModeToggle.innerHTML = "🌙";
    showToast("Light mode enabled");
  }
});

// 19. Reading progress bar
const progressBar = document.createElement("div");
progressBar.style.cssText = `
  position: fixed;
  top: 0;
  left: 0;
  width: 0%;
  height: 3px;
  background: linear-gradient(90deg, #f1b91a, #ffd46e);
  z-index: 9999;
  transition: width 0.1s ease;
`;
document.body.appendChild(progressBar);

window.addEventListener("scroll", () => {
  const windowHeight =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight;
  const scrolled = (window.pageYOffset / windowHeight) * 100;
  progressBar.style.width = scrolled + "%";
});

// 20. Job filter quick access
const filterButtons = document.createElement("div");
filterButtons.className =
  "position-fixed start-0 top-50 translate-middle-y d-none d-xl-flex flex-column gap-2";
filterButtons.style.cssText = "z-index: 999; margin-left: 20px;";
filterButtons.innerHTML = `
  <button class="btn btn-sm btn-warning rounded-pill px-3 shadow-sm filter-quick" data-filter="remote" style="font-size: 12px;">🏠 Remote</button>
  <button class="btn btn-sm btn-warning rounded-pill px-3 shadow-sm filter-quick" data-filter="fulltime" style="font-size: 12px;">⏰ Full-time</button>
  <button class="btn btn-sm btn-warning rounded-pill px-3 shadow-sm filter-quick" data-filter="parttime" style="font-size: 12px;">🕐 Part-time</button>
`;
document.body.appendChild(filterButtons);

document.querySelectorAll(".filter-quick").forEach((btn) => {
  btn.addEventListener("click", function () {
    const filter = this.dataset.filter;
    showToast(`Filtering jobs: ${filter}`);
    // Scroll to jobs section
    document.querySelector("#jobs")?.scrollIntoView({ behavior: "smooth" });
  });
});

// 21. Confetti effect for saved jobs
function createConfetti(x, y) {
  const colors = ["#f1b91a", "#ffd46e", "#fff2bf", "#ffe9a8"];

  for (let i = 0; i < 20; i++) {
    const confetti = document.createElement("div");
    confetti.style.cssText = `
      position: fixed;
      width: 8px;
      height: 8px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      left: ${x}px;
      top: ${y}px;
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
    `;

    document.body.appendChild(confetti);

    const angle = (Math.PI * 2 * i) / 20;
    const velocity = 100 + Math.random() * 100;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity;

    let posX = x;
    let posY = y;
    let opacity = 1;

    const animate = () => {
      posX += vx * 0.016;
      posY += vy * 0.016 + 200 * 0.016;
      opacity -= 0.02;

      confetti.style.left = posX + "px";
      confetti.style.top = posY + "px";
      confetti.style.opacity = opacity;

      if (opacity > 0) {
        requestAnimationFrame(animate);
      } else {
        confetti.remove();
      }
    };

    animate();
  }
}

// Enhance wishlist button with confetti
document.querySelectorAll('.btn[aria-label="Save job"]').forEach((button) => {
  button.addEventListener("click", function (e) {
    if (this.classList.contains("active")) {
      const rect = this.getBoundingClientRect();
      createConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
  });
});

console.log('✨ JobFinder interactions loaded! Press "/" to focus search.');
console.log(
  "🎯 Additional features: Dark mode, scroll to top, search suggestions, and more!"
);
