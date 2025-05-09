/**
 * Simple Theme Toggle
 * A straightforward implementation for toggling between light and dark themes
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    // Create the theme toggle button
    createThemeToggle();

    // Apply the initial theme
    applyTheme();

    // Ensure mobile menu functionality works
    initMobileMenu();
});

// Create and add the theme toggle button to the page
function createThemeToggle() {
    // Create the toggle container
    const toggleContainer = document.createElement('div');
    toggleContainer.className = 'theme-toggle-container';
    toggleContainer.setAttribute('aria-label', 'Theme toggle');

    // Create the toggle button
    const toggleButton = document.createElement('button');
    toggleButton.className = 'theme-toggle-button';
    toggleButton.setAttribute('aria-label', 'Toggle dark mode');
    toggleButton.innerHTML = `
        <span class="theme-toggle-icon light-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"></circle>
                <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
            </svg>
        </span>
        <span class="theme-toggle-icon dark-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path>
            </svg>
        </span>
        <span class="theme-toggle-text">Theme</span>
    `;

    // Add click event to toggle theme
    toggleButton.addEventListener('click', function() {
        toggleTheme();
    });

    // Add the button to the container
    toggleContainer.appendChild(toggleButton);

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .theme-toggle-container {
            position: fixed;
            top: 20px; /* Move to the top instead of bottom */
            right: 20px; /* Keep on the right side */
            z-index: 9999;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
            .theme-toggle-container {
                top: 80px; /* Move down a bit on mobile to avoid header */
                right: 20px;
            }
        }

        .theme-toggle-button {
            display: flex;
            align-items: center;
            background-color: #0ea5e9;
            color: white;
            border: none;
            border-radius: 30px;
            padding: 10px 16px;
            cursor: pointer;
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 16px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transition: all 0.3s ease;
            animation: fadeIn 0.5s ease-out;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .theme-toggle-button:hover {
            background-color: #0284c7;
            transform: translateY(-2px);
        }

        /* Responsive adjustments for the button */
        @media (max-width: 768px) {
            .theme-toggle-button {
                padding: 8px;
                font-size: 0; /* Hide text */
                width: 40px;
                height: 40px;
                border-radius: 50%; /* Make it circular */
                justify-content: center;
            }

            .theme-toggle-icon svg {
                width: 20px;
                height: 20px;
            }

            .theme-toggle-text {
                display: none; /* Hide text on mobile */
            }
        }

        .theme-toggle-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 8px;
        }

        .theme-toggle-text {
            margin-left: 4px;
        }

        /* Show/hide icons based on theme */
        .dark-mode .light-icon {
            display: none;
        }

        .dark-mode .dark-icon {
            display: flex;
        }

        .light-icon {
            display: flex;
        }

        .dark-icon {
            display: none;
        }

        /* Dark mode button styles */
        .dark-mode .theme-toggle-button {
            background-color: #1e40af;
        }

        .dark-mode .theme-toggle-button:hover {
            background-color: #1e3a8a;
        }
    `;

    // Add to document
    document.head.appendChild(style);
    document.body.appendChild(toggleContainer);

    console.log('Theme toggle button created');
}

// Toggle between light and dark themes
function toggleTheme() {
    const isDarkMode = document.body.classList.contains('dark-mode');

    if (isDarkMode) {
        // Switch to light mode
        document.body.classList.remove('dark-mode');
        document.body.classList.remove('dark');
        document.body.classList.remove('bg-gray-900');
        document.body.classList.remove('text-white');
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');

        // Remove prose-invert from prose elements
        document.querySelectorAll('.prose').forEach(el => {
            el.classList.remove('prose-invert');
        });

        // Reset text colors
        document.querySelectorAll('.text-gray-300, .text-gray-400').forEach(el => {
            // Check if this was added by our script (not part of the original design)
            if (!el.classList.contains('dark:text-gray-300') &&
                !el.classList.contains('dark:text-gray-400')) {
                el.classList.remove('text-gray-300');
                el.classList.remove('text-gray-400');

                // Try to restore original color
                if (el.classList.contains('text-gray-600') ||
                    el.classList.contains('text-gray-700') ||
                    el.classList.contains('text-gray-800') ||
                    el.classList.contains('text-gray-900')) {
                    // Already has a text color class, don't need to add one
                } else {
                    // Default to a common light mode text color
                    el.classList.add('text-gray-700');
                }
            }
        });

        // Reset heading colors
        document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(el => {
            if (!el.classList.contains('dark:text-white') && el.classList.contains('text-white')) {
                el.classList.remove('text-white');
                el.classList.add('text-gray-900');
            }
        });

        // Reset background colors
        document.querySelectorAll('.bg-gray-800').forEach(el => {
            if (!el.classList.contains('dark:bg-gray-800') &&
                !el.classList.contains('dark:bg-gray-900')) {
                el.classList.remove('bg-gray-800');
                el.classList.add('bg-white');
            }
        });
    } else {
        // Switch to dark mode
        document.body.classList.add('dark-mode');
        document.body.classList.add('dark');
        document.body.classList.add('bg-gray-900');
        document.body.classList.add('text-white');
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');

        // Add prose-invert to prose elements
        document.querySelectorAll('.prose').forEach(el => {
            el.classList.add('prose-invert');
        });

        // Ensure text colors are properly applied
        document.querySelectorAll('.text-gray-600, .text-gray-700, .text-gray-800, .text-gray-900').forEach(el => {
            // Only add the dark mode class if it doesn't already have it
            if (!el.classList.contains('dark:text-gray-300') &&
                !el.classList.contains('dark:text-gray-400') &&
                !el.classList.contains('dark:text-white')) {
                el.classList.add('text-gray-300');
            }
        });

        // Ensure headings are properly styled
        document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(el => {
            if (!el.classList.contains('dark:text-white')) {
                el.classList.add('text-white');
            }
        });

        // Force update specific sections that might be problematic
        document.querySelectorAll('.bg-white').forEach(el => {
            if (!el.classList.contains('dark:bg-gray-800') &&
                !el.classList.contains('dark:bg-gray-900')) {
                el.classList.add('bg-gray-800');
            }
        });
    }

    // Update Alpine.js data if available
    if (document.body.__x) {
        try {
            // Preserve other Alpine.js data like mobileMenuOpen
            const currentData = document.body.__x.$data;
            const mobileMenuOpen = currentData.mobileMenuOpen;

            // Only update darkMode
            currentData.darkMode = !isDarkMode;

            // Make sure mobileMenuOpen state is preserved
            if (typeof mobileMenuOpen !== 'undefined') {
                currentData.mobileMenuOpen = mobileMenuOpen;
            }

            // If using Alpine.js store
            if (window.Alpine && window.Alpine.store) {
                try {
                    window.Alpine.store('theme').dark = !isDarkMode;
                } catch (e) {
                    // Store might not be initialized
                }
            }
        } catch (e) {
            console.warn('Could not update Alpine.js data:', e);
        }
    }

    console.log('Theme toggled to:', isDarkMode ? 'light' : 'dark');
}

// Apply the saved theme or default
function applyTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Apply dark mode if saved as dark or if user prefers dark and no preference is saved
    if (savedTheme === 'dark' || (prefersDark && !savedTheme)) {
        document.body.classList.add('dark-mode');
        document.body.classList.add('dark');
        document.body.classList.add('bg-gray-900');
        document.body.classList.add('text-white');
        document.documentElement.classList.add('dark');

        // Update Alpine.js data if available
        if (document.body.__x) {
            try {
                // Only update darkMode, preserve other Alpine.js data like mobileMenuOpen
                const currentData = document.body.__x.$data;
                currentData.darkMode = true;

                // If using Alpine.js store
                if (window.Alpine && window.Alpine.store) {
                    try {
                        window.Alpine.store('theme').dark = true;
                    } catch (e) {
                        // Store might not be initialized
                    }
                }
            } catch (e) {
                console.warn('Could not update Alpine.js data:', e);
            }
        }

        // Force update any elements with dark mode classes that might not be updating
        setTimeout(() => {
            // Add a small delay to ensure the DOM has updated

            // Update prose sections
            document.querySelectorAll('.prose').forEach(el => {
                el.classList.add('prose-invert');
            });

            // Ensure text colors are properly applied
            document.querySelectorAll('.text-gray-600, .text-gray-700, .text-gray-800, .text-gray-900').forEach(el => {
                // Only add the dark mode class if it doesn't already have it
                if (!el.classList.contains('dark:text-gray-300') &&
                    !el.classList.contains('dark:text-gray-400') &&
                    !el.classList.contains('dark:text-white')) {
                    el.classList.add('text-gray-300');
                }
            });

            // Ensure headings are properly styled
            document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(el => {
                if (!el.classList.contains('dark:text-white')) {
                    el.classList.add('text-white');
                }
            });

            // Force update specific sections that might be problematic
            document.querySelectorAll('.bg-white').forEach(el => {
                if (!el.classList.contains('dark:bg-gray-800') &&
                    !el.classList.contains('dark:bg-gray-900')) {
                    el.classList.add('bg-gray-800');
                }
            });
        }, 50);
    }

    console.log('Theme applied:', savedTheme || (prefersDark ? 'dark (system)' : 'light (system)'));
}

/**
 * Initialize mobile menu functionality
 * This ensures the mobile menu toggle works properly
 */
function initMobileMenu() {
    // Check if Alpine.js is available
    if (window.Alpine) {
        console.log('Alpine.js is available, mobile menu should work');
        return;
    }

    // If Alpine.js is not available, implement a fallback
    let mobileMenuButton = document.querySelector('[aria-label="Open Menu"]');
    let mobileMenu = document.querySelector('#mobile-menu');

    if (!mobileMenuButton || !mobileMenu) {
        // Try to find by class or other attributes
        const possibleButtons = document.querySelectorAll('button.md\\:hidden');
        if (possibleButtons.length > 0) {
            mobileMenuButton = possibleButtons[0];
        }

        const possibleMenus = document.querySelectorAll('.md\\:hidden.bg-white.dark\\:bg-gray-800.rounded-lg');
        if (possibleMenus.length > 0) {
            mobileMenu = possibleMenus[0];
        }

        if (!mobileMenuButton || !mobileMenu) {
            console.warn('Could not find mobile menu elements');
            return;
        }
    }

    // Initialize state
    let mobileMenuOpen = false;

    // Hide menu initially
    mobileMenu.style.display = 'none';

    // Add click event to toggle menu
    mobileMenuButton.addEventListener('click', function() {
        mobileMenuOpen = !mobileMenuOpen;

        if (mobileMenuOpen) {
            mobileMenu.style.display = 'block';
            // Update aria-expanded attribute for accessibility
            mobileMenuButton.setAttribute('aria-expanded', 'true');
        } else {
            mobileMenu.style.display = 'none';
            // Update aria-expanded attribute for accessibility
            mobileMenuButton.setAttribute('aria-expanded', 'false');
        }
    });

    console.log('Mobile menu fallback initialized');
}
