/**
 * MS Digital Marketing Website - Main JavaScript
 * Enhanced with modern features and performance optimizations
 */

// Wait for the DOM to be loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    initSmoothScrolling();
    initFormValidation();
    initTestimonialSlider();
    initLazyLoading();
    initCounterAnimation();
    initIntersectionAnimations();
    
    // Initialize tooltips, popovers on desktop
    if (window.innerWidth >= 768) {
        initTooltips();
    }
});

/**
 * Initialize smooth scrolling for anchor links
 */
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerOffset = 100;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
                
                // Update URL but don't scroll again
                history.pushState(null, null, targetId);
            }
        });
    });
}

/**
 * Initialize form validation for better UX
 */
function initFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        // Add validation styles to form fields
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            // Live validation as user types
            input.addEventListener('blur', function() {
                validateInput(this);
            });
            
            input.addEventListener('input', function() {
                if (this.classList.contains('is-invalid')) {
                    validateInput(this);
                }
            });
        });
        
        // Form submission with validation
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            let isValid = true;
            
            // Validate all fields before submission
            inputs.forEach(input => {
                if (!validateInput(input)) {
                    isValid = false;
                }
            });
            
            if (isValid) {
                // Show loading state
                const submitButton = form.querySelector('button[type="submit"]');
                if (submitButton) {
                    const originalText = submitButton.innerHTML;
                    submitButton.disabled = true;
                    submitButton.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Sending...';
                    
                    // Simulate form submission (in real app, would send to server)
                    setTimeout(() => {
                        // Success state
                        submitButton.innerHTML = '<i class="fas fa-check"></i> Sent!';
                        submitButton.classList.add('bg-green-600');
                        form.reset();
                        
                        // Reset after delay
                        setTimeout(() => {
                            submitButton.innerHTML = originalText;
                            submitButton.disabled = false;
                            submitButton.classList.remove('bg-green-600');
                        }, 3000);
                    }, 1500);
                }
            }
        });
    });
    
    // Validates a single input field
    function validateInput(input) {
        const value = input.value.trim();
        let isValid = true;
        const errorElement = input.nextElementSibling?.classList.contains('error-message') 
            ? input.nextElementSibling 
            : null;
        
        // Required field validation
        if (input.hasAttribute('required') && value === '') {
            showError(input, errorElement, 'This field is required');
            isValid = false;
        }
        // Email validation
        else if (input.type === 'email' && value !== '') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                showError(input, errorElement, 'Please enter a valid email address');
                isValid = false;
            } else {
                clearError(input, errorElement);
            }
        }
        // Phone validation (optional)
        else if (input.type === 'tel' && value !== '') {
            const phoneRegex = /^[\d\+\-\(\)\s]*$/;
            if (!phoneRegex.test(value)) {
                showError(input, errorElement, 'Please enter a valid phone number');
                isValid = false;
            } else {
                clearError(input, errorElement);
            }
        }
        // If valid, clear any errors
        else if (value !== '') {
            clearError(input, errorElement);
        }
        
        return isValid;
    }
    
    // Show error message for an input
    function showError(input, errorElement, message) {
        input.classList.add('border-red-500');
        input.classList.add('is-invalid');
        
        if (!errorElement) {
            errorElement = document.createElement('p');
            errorElement.className = 'error-message text-red-500 text-xs mt-1';
            input.parentNode.insertBefore(errorElement, input.nextSibling);
        }
        
        errorElement.textContent = message;
    }
    
    // Clear error message
    function clearError(input, errorElement) {
        input.classList.remove('border-red-500');
        input.classList.remove('is-invalid');
        input.classList.add('border-green-500');
        
        if (errorElement) {
            errorElement.textContent = '';
        }
    }
}

/**
 * Enhanced testimonial slider with animation
 */
function initTestimonialSlider() {
    const testimonialSlider = document.querySelector('.testimonial-slider');
    if (!testimonialSlider) return;
    
    // In a full implementation, these would come from an API or CMS
    const testimonials = [
        {
            text: "MS Digital Marketing Agency increased our organic traffic by 250% in just three months.",
            author: "John Doe",
            company: "Company A",
            avatar: "JD"
        },
        {
            text: "Our social media following grew exponentially after working with MS Digital Marketing Agency.",
            author: "Jane Smith",
            company: "Company B",
            avatar: "JS"
        },
        {
            text: "The team at MS Digital Marketing Agency truly understands our brand and has helped us achieve amazing results.",
            author: "Robert Johnson",
            company: "Company C",
            avatar: "RJ"
        }
    ];
    
    if (testimonials.length <= 1) return;
    
    let currentIndex = 0;
    let isAnimating = false;
    
    // Create indicators
    const indicatorsContainer = document.createElement('div');
    indicatorsContainer.className = 'flex justify-center mt-6 space-x-2';
    
    testimonials.forEach((_, index) => {
        const indicator = document.createElement('button');
        indicator.className = `w-3 h-3 rounded-full transition-all duration-300 ${index === 0 ? 'bg-primary-600 w-6' : 'bg-gray-300 dark:bg-gray-600'}`;
        indicator.setAttribute('aria-label', `Testimonial ${index + 1}`);
        indicator.addEventListener('click', () => goToSlide(index));
        indicatorsContainer.appendChild(indicator);
    });
    
    testimonialSlider.appendChild(indicatorsContainer);
    
    function goToSlide(index) {
        if (isAnimating || index === currentIndex) return;
        isAnimating = true;
        
        // Update indicators
        const indicators = indicatorsContainer.querySelectorAll('button');
        indicators.forEach((indicator, i) => {
            if (i === index) {
                indicator.classList.add('bg-primary-600', 'w-6');
                indicator.classList.remove('bg-gray-300', 'dark:bg-gray-600');
            } else {
                indicator.classList.remove('bg-primary-600', 'w-6');
                indicator.classList.add('bg-gray-300', 'dark:bg-gray-600');
            }
        });
        
        // Create new testimonial element
        const newTestimonial = createTestimonialElement(testimonials[index]);
        newTestimonial.classList.add('opacity-0', 'translate-x-10');
        testimonialSlider.appendChild(newTestimonial);
        
        // Get current testimonial
        const currentTestimonial = testimonialSlider.querySelector('.testimonial');
        
        // Animate out current testimonial
        currentTestimonial.classList.add('-translate-x-10', 'opacity-0');
        
        // After animation, remove old testimonial and reset new one
        setTimeout(() => {
            currentTestimonial.remove();
            newTestimonial.classList.remove('translate-x-10', 'opacity-0');
            currentIndex = index;
            isAnimating = false;
        }, 300);
    }
    
    function createTestimonialElement(testimonial) {
        const element = document.createElement('div');
        element.className = 'testimonial bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg transition-all duration-300 transform';
        
        element.innerHTML = `
            <div class="flex justify-between items-start mb-6">
                <div class="flex-shrink-0 mr-4">
                    <div class="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold">
                        ${testimonial.avatar}
                    </div>
                </div>
                <div class="flex text-yellow-400">
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                </div>
            </div>
            <p class="text-lg mb-6 text-gray-700 dark:text-gray-300 italic">
                "${testimonial.text}"
            </p>
            <div>
                <h4 class="font-bold text-gray-900 dark:text-white">${testimonial.author}</h4>
                <p class="text-gray-600 dark:text-gray-400">${testimonial.company}</p>
            </div>
        `;
        
        return element;
    }
    
    // Auto rotate testimonials
    let autoRotateInterval = setInterval(() => {
        const nextIndex = (currentIndex + 1) % testimonials.length;
        goToSlide(nextIndex);
    }, 6000);
    
    // Pause rotation on hover
    testimonialSlider.addEventListener('mouseenter', () => {
        clearInterval(autoRotateInterval);
    });
    
    testimonialSlider.addEventListener('mouseleave', () => {
        autoRotateInterval = setInterval(() => {
            const nextIndex = (currentIndex + 1) % testimonials.length;
            goToSlide(nextIndex);
        }, 6000);
    });
}

/**
 * Initialize lazy loading images for better performance
 */
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('[data-src]');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    img.classList.add('fade-in');
                    observer.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(image => {
            imageObserver.observe(image);
        });
    } else {
        // Fallback for browsers without intersection observer
        const lazyImages = document.querySelectorAll('[data-src]');
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }
}

/**
 * Initialize counter animation for statistics
 */
function initCounterAnimation() {
    const counters = document.querySelectorAll('.counter-value');
    
    if (!counters.length) return;
    
    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-target'));
                const duration = parseInt(counter.getAttribute('data-duration') || '2000');
                const countTo = target;
                
                let current = 0;
                const step = countTo / (duration / 16);
                const timer = setInterval(() => {
                    current += step;
                    counter.textContent = Math.round(current);
                    
                    if (current >= countTo) {
                        counter.textContent = countTo;
                        clearInterval(timer);
                    }
                }, 16);
                
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
}

/**
 * Initialize animations that trigger based on element visibility
 */
function initIntersectionAnimations() {
    // Only run if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) return;
    
    // Fade-in animation for elements with data-animate attribute
    const animatedElements = document.querySelectorAll('[data-animate]');
    
    const animationObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const animation = element.getAttribute('data-animate');
                const delay = element.getAttribute('data-delay') || '0';
                
                setTimeout(() => {
                    element.classList.add(animation);
                    element.classList.add('visible');
                }, parseInt(delay));
                
                observer.unobserve(element);
            }
        });
    }, { threshold: 0.1 });
    
    animatedElements.forEach(element => {
        animationObserver.observe(element);
    });
}

/**
 * Initialize tooltips for improved UX on desktop
 */
function initTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        const tooltipText = element.getAttribute('data-tooltip');
        
        // Create tooltip element
        const tooltip = document.createElement('div');
        tooltip.className = 'absolute z-50 px-2 py-1 text-xs bg-gray-900 text-white rounded opacity-0 pointer-events-none transition-opacity duration-200 -mt-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap';
        tooltip.textContent = tooltipText;
        
        // Positioning arrow
        const arrow = document.createElement('div');
        arrow.className = 'absolute h-2 w-2 bg-gray-900 transform rotate-45 left-1/2 -ml-1 -bottom-1';
        tooltip.appendChild(arrow);
        
        // Add tooltip to element
        element.style.position = 'relative';
        element.appendChild(tooltip);
        
        // Show tooltip on hover
        element.addEventListener('mouseenter', () => {
            tooltip.classList.remove('opacity-0');
            tooltip.classList.add('opacity-100');
        });
        
        element.addEventListener('mouseleave', () => {
            tooltip.classList.remove('opacity-100');
            tooltip.classList.add('opacity-0');
        });
    });
}