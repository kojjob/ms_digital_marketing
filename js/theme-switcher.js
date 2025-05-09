/**
 * Theme Switcher Component
 * A reusable component for switching between themes
 */

class ThemeSwitcher extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        // Initial render
        this.render();
        
        // Listen for theme changes
        window.addEventListener('themechange', () => this.updateUI());
    }
    
    connectedCallback() {
        // Update UI when component is connected to the DOM
        this.updateUI();
    }
    
    // Update the UI based on current theme
    updateUI() {
        if (!window.ThemeManager) return;
        
        const currentTheme = window.ThemeManager.getCurrentTheme();
        const isDark = window.ThemeManager.isCurrentlyDark();
        
        // Update radio buttons
        const radioButtons = this.shadowRoot.querySelectorAll('input[type="radio"]');
        radioButtons.forEach(radio => {
            radio.checked = radio.value === currentTheme;
        });
        
        // Update toggle switch
        const toggleSwitch = this.shadowRoot.querySelector('.theme-toggle');
        if (toggleSwitch) {
            toggleSwitch.setAttribute('aria-checked', isDark.toString());
            toggleSwitch.classList.toggle('active', isDark);
        }
    }
    
    // Handle theme change
    handleThemeChange(event) {
        const theme = event.target.value;
        window.ThemeManager.setTheme(theme);
    }
    
    // Toggle between light and dark
    toggleTheme() {
        if (window.Alpine && window.Alpine.store('theme')) {
            window.Alpine.store('theme').toggle();
        } else if (window.ThemeManager) {
            const isDark = window.ThemeManager.isCurrentlyDark();
            window.ThemeManager.setTheme(isDark ? 
                window.ThemeManager.THEMES.LIGHT : 
                window.ThemeManager.THEMES.DARK
            );
        }
    }
    
    // Render the component
    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: inline-block;
                    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                }
                
                .theme-switcher {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                
                /* Toggle Switch Styles */
                .theme-toggle {
                    position: relative;
                    display: inline-block;
                    width: 3rem;
                    height: 1.5rem;
                    border-radius: 1.5rem;
                    background-color: #e5e7eb;
                    cursor: pointer;
                    transition: background-color 0.3s;
                    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
                }
                
                .theme-toggle.active {
                    background-color: #3b82f6;
                }
                
                .theme-toggle::after {
                    content: '';
                    position: absolute;
                    top: 0.125rem;
                    left: 0.125rem;
                    width: 1.25rem;
                    height: 1.25rem;
                    border-radius: 50%;
                    background-color: white;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
                    transition: transform 0.3s, background-color 0.3s;
                }
                
                .theme-toggle.active::after {
                    transform: translateX(1.5rem);
                }
                
                /* Radio Button Styles */
                .theme-options {
                    display: flex;
                    gap: 0.5rem;
                    margin-top: 0.5rem;
                }
                
                .radio-option {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                }
                
                .radio-option input {
                    margin: 0;
                }
                
                .radio-option label {
                    font-size: 0.875rem;
                    cursor: pointer;
                }
                
                /* Icons */
                .icon {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 1.5rem;
                    height: 1.5rem;
                }
                
                /* Dropdown Styles */
                .dropdown {
                    position: relative;
                    display: inline-block;
                }
                
                .dropdown-toggle {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem;
                    background: none;
                    border: none;
                    cursor: pointer;
                    border-radius: 0.25rem;
                    transition: background-color 0.2s;
                }
                
                .dropdown-toggle:hover {
                    background-color: rgba(0, 0, 0, 0.05);
                }
                
                .dropdown-menu {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    margin-top: 0.25rem;
                    padding: 0.5rem;
                    background-color: white;
                    border-radius: 0.25rem;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                    z-index: 10;
                    display: none;
                }
                
                .dropdown.open .dropdown-menu {
                    display: block;
                }
                
                /* Display modes */
                :host([mode="toggle"]) .theme-options,
                :host([mode="toggle"]) .dropdown {
                    display: none;
                }
                
                :host([mode="radio"]) .theme-toggle,
                :host([mode="radio"]) .dropdown {
                    display: none;
                }
                
                :host([mode="dropdown"]) .theme-toggle,
                :host([mode="dropdown"]) .theme-options {
                    display: none;
                }
                
                /* Default to toggle if no mode specified */
                :host(:not([mode])) .theme-options,
                :host(:not([mode])) .dropdown {
                    display: none;
                }
            </style>
            
            <!-- Toggle Switch -->
            <div class="theme-toggle" role="switch" tabindex="0" aria-checked="false"></div>
            
            <!-- Radio Buttons -->
            <div class="theme-options">
                <div class="radio-option">
                    <input type="radio" id="theme-light" name="theme" value="light">
                    <label for="theme-light">Light</label>
                </div>
                <div class="radio-option">
                    <input type="radio" id="theme-dark" name="theme" value="dark">
                    <label for="theme-dark">Dark</label>
                </div>
                <div class="radio-option">
                    <input type="radio" id="theme-system" name="theme" value="system">
                    <label for="theme-system">System</label>
                </div>
            </div>
            
            <!-- Dropdown -->
            <div class="dropdown">
                <button class="dropdown-toggle">
                    <span class="icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                        </svg>
                    </span>
                    <span>Theme</span>
                </button>
                <div class="dropdown-menu">
                    <div class="theme-options">
                        <div class="radio-option">
                            <input type="radio" id="dropdown-light" name="dropdown-theme" value="light">
                            <label for="dropdown-light">Light</label>
                        </div>
                        <div class="radio-option">
                            <input type="radio" id="dropdown-dark" name="dropdown-theme" value="dark">
                            <label for="dropdown-dark">Dark</label>
                        </div>
                        <div class="radio-option">
                            <input type="radio" id="dropdown-system" name="dropdown-theme" value="system">
                            <label for="dropdown-system">System</label>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners
        const toggleSwitch = this.shadowRoot.querySelector('.theme-toggle');
        toggleSwitch.addEventListener('click', () => this.toggleTheme());
        toggleSwitch.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleTheme();
            }
        });
        
        // Radio button event listeners
        const radioButtons = this.shadowRoot.querySelectorAll('input[type="radio"]');
        radioButtons.forEach(radio => {
            radio.addEventListener('change', (e) => this.handleThemeChange(e));
        });
        
        // Dropdown toggle
        const dropdownToggle = this.shadowRoot.querySelector('.dropdown-toggle');
        dropdownToggle.addEventListener('click', () => {
            const dropdown = this.shadowRoot.querySelector('.dropdown');
            dropdown.classList.toggle('open');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.contains(e.target)) {
                const dropdown = this.shadowRoot.querySelector('.dropdown');
                dropdown.classList.remove('open');
            }
        });
    }
}

// Define the custom element
customElements.define('theme-switcher', ThemeSwitcher);
