/**
 * Global Theme Manager - Centralized theme system for the entire website
 * This script handles theme consistency across all pages
 */

// Theme management object
const ThemeManager = {
    // Key used for storing theme preference in localStorage
    STORAGE_KEY: 'site_theme',

    // Available themes
    THEMES: {
        LIGHT: 'light',
        DARK: 'dark',
        SYSTEM: 'system'
    },

    // Initialize the theme manager
    init() {
        // Set up Alpine.js store for global state management
        if (window.Alpine) {
            window.Alpine.store('theme', {
                // Current theme (light, dark, or system)
                current: this.getCurrentTheme(),

                // Whether dark mode is active (derived from current theme)
                isDark: this.isCurrentlyDark(),

                // Set theme to a specific value
                set(theme) {
                    this.current = theme;
                    ThemeManager.setTheme(theme);
                },

                // Toggle between light and dark
                toggle() {
                    const newTheme = this.isDark ?
                        ThemeManager.THEMES.LIGHT :
                        ThemeManager.THEMES.DARK;

                    this.set(newTheme);
                }
            });
        }

        // Apply the theme on page load
        this.applyTheme();

        // Listen for system preference changes
        this.setupSystemPreferenceListener();

        // Initialize theme when Alpine.js is ready
        document.addEventListener('alpine:init', () => {
            this.initializeAlpineData();
        });
    },

    // Get the current theme setting
    getCurrentTheme() {
        const storedTheme = localStorage.getItem(this.STORAGE_KEY);

        if (storedTheme && Object.values(this.THEMES).includes(storedTheme)) {
            return storedTheme;
        }

        // Default to system preference
        return this.THEMES.SYSTEM;
    },

    // Check if dark mode is currently active based on theme and system preference
    isCurrentlyDark() {
        const currentTheme = this.getCurrentTheme();

        if (currentTheme === this.THEMES.DARK) {
            return true;
        }

        if (currentTheme === this.THEMES.LIGHT) {
            return false;
        }

        // For system theme, check system preference
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    },

    // Set theme preference
    setTheme(theme) {
        // Validate theme
        if (!Object.values(this.THEMES).includes(theme)) {
            theme = this.THEMES.SYSTEM;
        }

        // Save to localStorage
        localStorage.setItem(this.STORAGE_KEY, theme);

        // Apply the theme
        this.applyTheme();

        // Dispatch custom event for theme change
        window.dispatchEvent(new CustomEvent('themechange', {
            detail: {
                theme: theme,
                isDark: this.isCurrentlyDark()
            }
        }));
    },

    // Apply the current theme to the page
    applyTheme() {
        const isDark = this.isCurrentlyDark();
        console.log('Applying theme, isDark:', isDark);

        // Update document classes for Tailwind dark mode
        if (isDark) {
            document.documentElement.classList.add('dark');
            document.body.classList.add('dark', 'bg-gray-900', 'text-white');
        } else {
            document.documentElement.classList.remove('dark');
            document.body.classList.remove('dark', 'bg-gray-900', 'text-white');
        }

        // Update Alpine.js store if available
        if (window.Alpine && window.Alpine.store) {
            try {
                const store = window.Alpine.store('theme');
                store.current = this.getCurrentTheme();
                store.isDark = isDark;
            } catch (e) {
                // Alpine store might not be initialized yet
                console.warn('Alpine store not initialized yet:', e);
            }
        }

        // Update all Alpine.js components
        this.updateAllComponents();

        // Force update body data attribute for Alpine.js
        if (document.body && document.body.__x) {
            try {
                document.body.__x.$data.darkMode = isDark;
            } catch (e) {
                console.warn('Could not update body darkMode data:', e);
            }
        }

        // Set CSS variable for theme color
        document.documentElement.style.setProperty(
            '--primary-color',
            isDark ? '#38bdf8' : '#0ea5e9'
        );

        // Log the current theme state
        console.log('Theme applied:', {
            theme: this.getCurrentTheme(),
            isDark: isDark,
            bodyClasses: document.body.className
        });
    },

    // Update all Alpine.js components with the current theme
    updateAllComponents() {
        // Find all elements with x-data that include darkMode
        const alpineElements = document.querySelectorAll('[x-data*="darkMode"]');

        const isDark = this.isCurrentlyDark();

        alpineElements.forEach(el => {
            if (el.__x) {
                el.__x.$data.darkMode = isDark;
            }
        });
    },

    // Initialize Alpine.js data on existing elements
    initializeAlpineData() {
        this.updateAllComponents();
    },

    // Listen for system preference changes
    setupSystemPreferenceListener() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

            const handleChange = e => {
                // Only apply system preference if theme is set to system
                if (this.getCurrentTheme() === this.THEMES.SYSTEM) {
                    this.applyTheme();
                }
            };

            // Modern browsers
            if (mediaQuery.addEventListener) {
                mediaQuery.addEventListener('change', handleChange);
            }
            // Older browsers
            else if (mediaQuery.addListener) {
                mediaQuery.addListener(handleChange);
            }
        }
    }
};

// Initialize the theme manager immediately
ThemeManager.init();

// Also initialize when the DOM is ready (as a fallback)
document.addEventListener('DOMContentLoaded', () => {
    // Re-apply theme to ensure it's properly set
    ThemeManager.applyTheme();
});

// Make ThemeManager available globally
window.ThemeManager = ThemeManager;
