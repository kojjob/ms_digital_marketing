/**
 * Theme Control Panel
 * A floating control panel for managing the site theme
 */

class ThemeControlPanel {
    constructor() {
        this.createPanel();
        this.addEventListeners();

        // Initialize with current theme
        this.updateUI();

        // Listen for theme changes
        window.addEventListener('themechange', () => this.updateUI());
    }

    createPanel() {
        // Create the panel element
        this.panel = document.createElement('div');
        this.panel.className = 'theme-control-panel';
        this.panel.setAttribute('aria-label', 'Theme settings');

        // Panel HTML
        this.panel.innerHTML = `
            <button class="theme-panel-toggle" aria-label="Toggle theme panel">
                <svg class="theme-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" class="moon-icon"></path>
                    <circle cx="12" cy="12" r="5" class="sun-icon"></circle>
                    <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" class="sun-icon"></path>
                </svg>
                <span class="theme-label">Theme</span>
            </button>
            <div class="theme-panel-content">
                <div class="theme-panel-header">
                    <h3>Theme Settings</h3>
                    <button class="theme-panel-close" aria-label="Close theme panel">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                <div class="theme-options">
                    <div class="theme-option">
                        <input type="radio" id="theme-light" name="theme" value="light">
                        <label for="theme-light">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="5"></circle>
                                <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
                            </svg>
                            <span>Light Mode</span>
                        </label>
                    </div>
                    <div class="theme-option">
                        <input type="radio" id="theme-dark" name="theme" value="dark">
                        <label for="theme-dark">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path>
                            </svg>
                            <span>Dark Mode</span>
                        </label>
                    </div>
                    <div class="theme-option">
                        <input type="radio" id="theme-system" name="theme" value="system">
                        <label for="theme-system">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                                <path d="M8 21h8m-4-4v4"></path>
                            </svg>
                            <span>System Default</span>
                        </label>
                    </div>
                </div>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .theme-control-panel {
                position: fixed;
                top: 50%;
                right: 0;
                transform: translateY(-50%);
                z-index: 9999;
                font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                transition: all 0.3s ease;
            }

            .theme-panel-toggle {
                width: auto;
                height: auto;
                border-radius: 30px 0 0 30px;
                background-color: var(--primary-color, #0ea5e9);
                color: white;
                border: 2px solid white;
                border-right: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: -4px 4px 16px rgba(0, 0, 0, 0.2);
                transition: transform 0.2s, background-color 0.2s;
                z-index: 9999;
                animation: pulse 2s infinite;
                padding: 12px 20px;
                font-size: 16px;
            }

            .theme-label {
                margin-left: 8px;
                font-weight: 500;
                font-size: 16px;
                display: inline-block;
            }

            .theme-icon {
                display: inline-block;
            }

            /* Show/hide sun/moon icons based on theme */
            .dark .sun-icon {
                display: none;
            }

            .dark .moon-icon {
                display: inline;
            }

            .sun-icon {
                display: inline;
            }

            .moon-icon {
                display: none;
            }

            @keyframes pulse {
                0% {
                    box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.7);
                }
                70% {
                    box-shadow: 0 0 0 10px rgba(14, 165, 233, 0);
                }
                100% {
                    box-shadow: 0 0 0 0 rgba(14, 165, 233, 0);
                }
            }

            .theme-panel-toggle:hover {
                transform: scale(1.1);
                background-color: var(--primary-color-dark, #0284c7);
            }

            .theme-panel-content {
                position: absolute;
                top: 0;
                right: 100%;
                width: 250px;
                background-color: white;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                padding: 16px;
                display: none;
                margin-right: 10px;
            }

            .theme-control-panel.open .theme-panel-content {
                display: block;
                animation: fadeIn 0.2s ease;
            }

            .theme-panel-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
                padding-bottom: 8px;
                border-bottom: 1px solid #eee;
            }

            .theme-panel-header h3 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
                color: #333;
            }

            .theme-panel-close {
                background: none;
                border: none;
                cursor: pointer;
                color: #666;
                padding: 4px;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .theme-panel-close:hover {
                background-color: #f5f5f5;
                color: #333;
            }

            .theme-options {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .theme-option {
                display: flex;
                align-items: center;
                margin-bottom: 8px;
                position: relative;
            }

            .theme-option input[type="radio"] {
                position: absolute;
                opacity: 0;
                width: 0;
                height: 0;
                cursor: pointer;
            }

            .theme-option label {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 10px 12px;
                border-radius: 6px;
                cursor: pointer;
                width: 100%;
                transition: all 0.2s;
                color: #333;
                font-weight: 500;
                position: relative;
                z-index: 1;
            }

            .theme-option input[type="radio"]:checked + label,
            .theme-option label[aria-selected="true"] {
                background-color: #f0f9ff;
                color: var(--primary-color, #0ea5e9);
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                font-weight: 600;
                transform: translateY(-1px);
            }

            .theme-option label:hover {
                background-color: #f5f5f5;
                transform: translateY(-1px);
            }

            .theme-option input[type="radio"]:focus + label {
                outline: 2px solid var(--primary-color, #0ea5e9);
                outline-offset: 2px;
            }

            /* Add a custom radio button style */
            .theme-option label::before {
                content: '';
                display: inline-block;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                border: 2px solid #cbd5e1;
                margin-right: 8px;
                transition: all 0.2s;
                flex-shrink: 0;
            }

            .theme-option input[type="radio"]:checked + label::before {
                border-color: var(--primary-color, #0ea5e9);
                background-color: var(--primary-color, #0ea5e9);
                box-shadow: inset 0 0 0 3px white;
            }

            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            /* Dark mode styles */
            .dark .theme-panel-content {
                background-color: #1f2937;
                color: white;
                border: 1px solid #374151;
            }

            .dark .theme-panel-header {
                border-bottom-color: #374151;
            }

            .dark .theme-panel-header h3 {
                color: white;
            }

            .dark .theme-panel-close {
                color: #9ca3af;
            }

            .dark .theme-panel-close:hover {
                background-color: #374151;
                color: white;
            }

            .dark .theme-option label {
                color: #e5e7eb;
            }

            .dark .theme-option input[type="radio"]:checked + label,
            .dark .theme-option label[aria-selected="true"] {
                background-color: #0c4a6e;
                color: #38bdf8;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            }

            .dark .theme-option input[type="radio"]:checked + label::before,
            .dark .theme-option label[aria-selected="true"]::before {
                border-color: #38bdf8;
                background-color: #38bdf8;
                box-shadow: inset 0 0 0 3px #1f2937;
            }

            .dark .theme-option label:hover {
                background-color: #374151;
            }

            /* Dark mode theme toggle */
            .dark .theme-panel-toggle {
                background-color: #1e40af;
                border-color: #1f2937;
                box-shadow: -4px 4px 16px rgba(0, 0, 0, 0.4);
            }

            .dark .theme-panel-toggle:hover {
                background-color: #1e3a8a;
            }
        `;

        // Append to document
        document.head.appendChild(style);
        document.body.appendChild(this.panel);
    }

    addEventListeners() {
        // Toggle panel and handle theme toggle
        const toggleButton = this.panel.querySelector('.theme-panel-toggle');
        toggleButton.addEventListener('click', () => {
            // Toggle the panel
            this.panel.classList.toggle('open');

            // If the panel is now closed, toggle the theme directly
            if (!this.panel.classList.contains('open')) {
                // Get current dark mode state
                const isDark = window.ThemeManager.isCurrentlyDark();

                // Toggle between light and dark
                const newTheme = isDark ? 'light' : 'dark';
                this.handleThemeChange(newTheme);
            }
        });

        // Close panel
        const closeButton = this.panel.querySelector('.theme-panel-close');
        closeButton.addEventListener('click', () => {
            this.panel.classList.remove('open');
        });

        // Theme options
        const radioButtons = this.panel.querySelectorAll('input[type="radio"]');
        radioButtons.forEach(radio => {
            // Add click handler to both the radio button and its label
            radio.addEventListener('click', (e) => {
                this.handleThemeChange(e.target.value);
                e.stopPropagation(); // Prevent the panel from closing
            });

            const label = this.panel.querySelector(`label[for="${radio.id}"]`);
            if (label) {
                label.addEventListener('click', (e) => {
                    this.handleThemeChange(radio.value);
                    e.stopPropagation(); // Prevent the panel from closing
                });
            }
        });

        // Close panel when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.panel.contains(e.target)) {
                this.panel.classList.remove('open');
            }
        });
    }

    // Handle theme change
    handleThemeChange(theme) {
        console.log('Changing theme to:', theme);
        if (window.ThemeManager) {
            window.ThemeManager.setTheme(theme);
            // Update the UI
            this.updateUI();
        }
    }

    updateUI() {
        if (!window.ThemeManager) {
            console.warn('ThemeManager not available for updateUI');
            return;
        }

        const currentTheme = window.ThemeManager.getCurrentTheme();
        const isDark = window.ThemeManager.isCurrentlyDark();

        console.log('Updating UI with theme:', currentTheme, 'isDark:', isDark);

        // Update radio buttons
        const radioButtons = this.panel.querySelectorAll('input[type="radio"]');
        radioButtons.forEach(radio => {
            radio.checked = radio.value === currentTheme;

            // Also update the label styling
            const label = this.panel.querySelector(`label[for="${radio.id}"]`);
            if (label) {
                if (radio.checked) {
                    label.setAttribute('aria-selected', 'true');
                } else {
                    label.removeAttribute('aria-selected');
                }
            }
        });

        // Update the theme toggle button appearance based on current theme
        const toggleButton = this.panel.querySelector('.theme-panel-toggle');
        if (toggleButton) {
            if (isDark) {
                toggleButton.setAttribute('aria-pressed', 'true');
                toggleButton.classList.add('is-dark');
            } else {
                toggleButton.setAttribute('aria-pressed', 'false');
                toggleButton.classList.remove('is-dark');
            }
        }
    }
}

// Create the theme control panel immediately
let themeControlPanel;

// Function to initialize the panel
function initThemeControlPanel() {
    if (!themeControlPanel) {
        themeControlPanel = new ThemeControlPanel();
    }
}

// Try to initialize immediately
if (document.body) {
    initThemeControlPanel();
} else {
    // If body isn't available yet, wait for DOMContentLoaded
    document.addEventListener('DOMContentLoaded', initThemeControlPanel);
}

// Also add a fallback for any edge cases
window.addEventListener('load', initThemeControlPanel);
