# Header Component Documentation

## Overview

The application now uses a **reusable header component** (`header.js`) that manages all header navigation functionality across multiple pages.

## Features

### ✅ Implemented Features

1. **Dynamic User Name Display**
   - Automatically loads user name from `localStorage` (profile data)
   - Updates all `.user-name`, `.user`, and similar elements in the header
   - Falls back gracefully if no data is available

2. **Mobile Menu (Hamburger)**
   - **Hidden on desktop (≥992px)**, only visible on mobile/tablet
   - Functional burger/menu-toggle button on mobile devices
   - Slide-in navigation drawer with smooth animations
   - Includes links to:
     - Home
     - Job Listings
     - Categories
     - My Profile
     - Logout (with proper logout handling)
   - Click outside or close button to dismiss
   - Prevents body scroll when open
   - Uses relative paths that work from any page location

3. **Clickable Elements**
   - Logo/Brand: Navigates to home page (relative path)
   - User name: Navigates to profile page (relative path)
   - Notification button: Shows "Coming soon" alert
   - Mail button: Shows "Coming soon" alert
   - Language button: Shows "Coming soon" alert

4. **Responsive Design**
   - **Desktop (≥992px)**: 
     - Burger menu hidden
     - Regular desktop navigation (`.nav-right`) visible
     - Full header with all icons and user name
   - **Mobile/Tablet (<992px)**: 
     - Burger menu visible
     - Desktop navigation (`.nav-right`) hidden
     - Only burger menu + logo visible
     - Triggers slide-in drawer for navigation
   - Overlay with backdrop blur effect
   - Touch-friendly tap targets
   - Automatically adjusts on window resize
   - **No duplicate navigation** - users see either burger OR desktop nav, never both

5. **Smart Path Resolution**
   - Automatically detects current page location
   - Uses relative paths (`../` or `./`) based on folder depth
   - Works correctly from root, profile/, job-listing/, categories/, login/ folders

## Implementation

### Files Updated

1. **Created:**
   - `/assets/js/header.js` - Main header component

2. **Updated (added header.js script):**
   - `/profile/profile.html`
   - `/profile/preview.html`
   - `/job-listing/job-listing.html`
   - `/categories/index.html`

3. **Removed Hardcoded Data:**
   - Removed "Ruby Grace" hardcoded text from all headers
   - Now populated dynamically from localStorage

### Script Load Order

**Important:** `header.js` must be loaded **after** `storage.js` and **before** page-specific scripts.

```html
<!-- Correct order -->
<script src="../assets/js/storage.js"></script>
<script src="../assets/js/header.js"></script>
<script src="../assets/js/profile.js"></script>
```

## Usage

### Adding Header to New Pages

1. **Include the script:**
```html
<script src="../assets/js/storage.js"></script>
<script src="../assets/js/header.js"></script>
```

2. **Ensure user name element exists:**
```html
<!-- Job listing / Categories style -->
<a class="user" href="../profile/profile.html"></a>

<!-- OR Profile style -->
<span class="user-name"></span>
```

3. **Ensure burger/menu toggle exists:**
```html
<!-- Job listing / Categories style -->
<button class="burger" aria-label="Open menu">
  <span></span><span></span><span></span>
</button>

<!-- OR Profile style -->
<button class="menu-toggle" aria-label="Menu">
  <span class="hamburger"></span>
  <span class="hamburger"></span>
  <span class="hamburger"></span>
</button>
```

The header component will automatically:
- Initialize when the page loads
- Update the user name from localStorage
- Enable burger menu functionality
- Make all elements clickable

## API

The header component exposes a global `HeaderManager` object:

```javascript
// Manually update header user name
await window.HeaderManager.updateUserName();

// Re-initialize header (useful after dynamic content changes)
window.HeaderManager.init();
```

## CSS Classes Used

### User Name Elements:
- `.user-name` - Profile pages
- `.user` - Job listing/categories pages
- `.nav-right .user` - Specific header user link

### Menu Toggles:
- `.menu-toggle` - Profile pages
- `.burger` - Job listing/categories pages

### Generated Elements:
- `.mobile-menu` - Main menu container
- `.mobile-menu-overlay` - Dark overlay
- `.mobile-menu-content` - Slide-in drawer
- `.mobile-menu-item` - Menu links

## Styling

The header.js includes built-in styles for the mobile menu. Key features:

- **Overlay:** Semi-transparent black with backdrop blur
- **Drawer:** 80% width, max 320px, slides from left
- **Animation:** 0.3s ease transitions
- **Colors:** Matches site theme (white bg, dark text, accent hover)

### Custom Styling

To customize the mobile menu appearance, override these CSS classes:

```css
/* Change drawer width */
.mobile-menu-content {
  max-width: 400px !important;
}

/* Change overlay color */
.mobile-menu-overlay {
  background: rgba(0, 0, 0, 0.7) !important;
}

/* Change menu item hover color */
.mobile-menu-item:hover {
  background: #f1b91a !important;
}
```

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Android)

## Troubleshooting

### User name not updating:
1. Check `storage.js` is loaded before `header.js`
2. Verify profile data exists in localStorage: `localStorage.getItem('huntersite_user_profile')`
3. Check console for errors

### Burger menu not working:
1. Ensure burger button has class `.burger` or `.menu-toggle`
2. Check console for JavaScript errors
3. Verify no CSS `pointer-events: none` on button

### Menu links not working:
1. Check paths are correct relative to current page
2. Verify no other scripts preventing navigation
3. Check browser console for errors

## Future Enhancements

Planned features:
- [ ] User dropdown menu with logout, settings
- [ ] Real notifications system integration
- [ ] Real messaging system integration
- [ ] Multi-language support
- [ ] Search functionality in header
- [ ] User avatar display
- [ ] Notification badge count from API

## Migration Notes

### Before (Hardcoded):
```html
<a class="user" href="../profile/profile.html">Ruby Grace</a>
```

### After (Dynamic):
```html
<a class="user" href="../profile/profile.html"></a>
<!-- Populated by header.js from localStorage -->
```

All existing pages have been updated to use the new dynamic system.
