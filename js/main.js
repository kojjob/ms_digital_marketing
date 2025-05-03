// Wait for the DOM to be loaded
document.addEventListener('DOMContentLoaded', function() {
    // Mobile navigation toggle (to be implemented)
    const mobileNavToggle = document.createElement('button');
    mobileNavToggle.className = 'mobile-nav-toggle';
    mobileNavToggle.innerHTML = '<i class="fas fa-bars"></i>';
    
    // Add smooth scrolling to all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
    
    // Form submission handling
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            // Show a thank you message or redirect
            // In a real implementation, you would send the form data to a backend
            alert('Thank you for your submission! We will be in touch soon.');
            form.reset();
        });
    });
    
    // Simple testimonial slider functionality
    // In a real implementation, you would have multiple testimonials
    const testimonialSlider = document.querySelector('.testimonial-slider');
    if (testimonialSlider) {
        const testimonials = [
            {
                text: "MS Digital Marketing Agency increased our organic traffic by 250% in just three months.",
                author: "Client Name, Company A"
            },
            {
                text: "Our social media following grew exponentially after working with MS Digital Marketing Agency.",
                author: "Client Name, Company B"
            },
            {
                text: "The team at MS Digital Marketing Agency truly understands our brand and has helped us achieve amazing results.",
                author: "Client Name, Company C"
            }
        ];
        
        let currentIndex = 0;
        
        // Function to update the testimonial
        function updateTestimonial() {
            const testimonial = testimonialSlider.querySelector('.testimonial');
            testimonial.innerHTML = `
                <p>"${testimonials[currentIndex].text}"</p>
                <h4>- ${testimonials[currentIndex].author}</h4>
            `;
        }
        
        // Change testimonial every 5 seconds
        setInterval(() => {
            currentIndex = (currentIndex + 1) % testimonials.length;
            updateTestimonial();
        }, 5000);
    }
});