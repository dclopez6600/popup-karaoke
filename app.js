// PopUp Karaoke - Main JavaScript
// Cross-browser compatibility and functionality

(function() {
    'use strict';

    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        // Initialize all features
        initMobileMenu();
        initSmoothScroll();
        initFormValidation();
        initServiceWorker();
        initLazyLoading();
        initScrollAnimations();
        
        // Log initialization
        console.log('PopUp Karaoke PWA initialized');
    }

    // Mobile Menu Functionality
    function initMobileMenu() {
        const menuToggle = document.getElementById('mobileMenuToggle');
        const nav = document.getElementById('mainNav');
        const navLinks = document.querySelectorAll('.nav-link');

        if (!menuToggle || !nav) return;

        // Toggle menu on button click
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleMenu();
        });

        // Close menu when clicking nav links
        navLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    closeMenu();
                }
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (nav.classList.contains('active') && 
                !nav.contains(e.target) && 
                !menuToggle.contains(e.target)) {
                closeMenu();
            }
        });

        // Handle window resize
        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                if (window.innerWidth > 768 && nav.classList.contains('active')) {
                    closeMenu();
                }
            }, 250);
        });

        function toggleMenu() {
            menuToggle.classList.toggle('active');
            nav.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            if (nav.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }

        function closeMenu() {
            menuToggle.classList.remove('active');
            nav.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // Smooth Scroll Functionality
    function initSmoothScroll() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(function(link) {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                // Skip if href is just "#"
                if (href === '#') return;
                
                const target = document.querySelector(href);
                
                if (target) {
                    e.preventDefault();
                    
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // Form Validation and Submission
    function initFormValidation() {
        const form = document.getElementById('bookingForm');
        
        if (!form) return;

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                eventType: document.getElementById('eventType').value,
                eventDate: document.getElementById('eventDate').value,
                guests: document.getElementById('guests').value,
                message: document.getElementById('message').value
            };

            // Validate form
            if (!validateForm(formData)) {
                return;
            }

            // Create mailto link
            const subject = encodeURIComponent('Booking Request - ' + formData.eventType);
            const body = encodeURIComponent(
                'Name: ' + formData.name + '\n' +
                'Email: ' + formData.email + '\n' +
                'Phone: ' + formData.phone + '\n' +
                'Event Type: ' + formData.eventType + '\n' +
                'Event Date: ' + formData.eventDate + '\n' +
                'Expected Guests: ' + formData.guests + '\n' +
                'Message: ' + formData.message
            );

            const mailtoLink = 'mailto:booking@popupkaraoke.net?subject=' + subject + '&body=' + body;

            // Open mail client
            window.location.href = mailtoLink;

            // Show success message
            showMessage('Opening your email client...', 'success');

            // Reset form after a delay
            setTimeout(function() {
                form.reset();
            }, 1000);
        });

        function validateForm(data) {
            // Name validation
            if (data.name.trim().length < 2) {
                showMessage('Please enter your full name', 'error');
                return false;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                showMessage('Please enter a valid email address', 'error');
                return false;
            }

            // Phone validation (basic)
            const phoneRegex = /^[\d\s\-\(\)]+$/;
            if (!phoneRegex.test(data.phone) || data.phone.length < 10) {
                showMessage('Please enter a valid phone number', 'error');
                return false;
            }

            // Event type validation
            if (!data.eventType) {
                showMessage('Please select an event type', 'error');
                return false;
            }

            // Date validation
            if (!data.eventDate) {
                showMessage('Please select an event date', 'error');
                return false;
            }

            const selectedDate = new Date(data.eventDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
                showMessage('Please select a future date', 'error');
                return false;
            }

            return true;
        }

        function showMessage(message, type) {
            // Remove existing message
            const existingMessage = document.querySelector('.form-message');
            if (existingMessage) {
                existingMessage.remove();
            }

            // Create new message element
            const messageDiv = document.createElement('div');
            messageDiv.className = 'form-message form-message-' + type;
            messageDiv.textContent = message;
            
            // Style the message
            messageDiv.style.cssText = `
                padding: 15px 20px;
                margin-top: 20px;
                border-radius: 10px;
                text-align: center;
                font-weight: 500;
                animation: slideIn 0.3s ease;
                background-color: ${type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
                color: ${type === 'success' ? '#10b981' : '#ef4444'};
                border: 1px solid ${type === 'success' ? '#10b981' : '#ef4444'};
            `;

            form.appendChild(messageDiv);

            // Remove message after 5 seconds
            setTimeout(function() {
                if (messageDiv.parentNode) {
                    messageDiv.style.animation = 'slideOut 0.3s ease';
                    setTimeout(function() {
                        messageDiv.remove();
                    }, 300);
                }
            }, 5000);
        }
    }

    // Service Worker Registration
    function initServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                        console.log('ServiceWorker registration successful:', registration.scope);
                    })
                    .catch(function(err) {
                        console.log('ServiceWorker registration failed:', err);
                    });
            });
        }
    }

    // Lazy Loading Images
    function initLazyLoading() {
        if ('IntersectionObserver' in window) {
            const images = document.querySelectorAll('img[data-src]');
            
            const imageObserver = new IntersectionObserver(function(entries, observer) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach(function(img) {
                imageObserver.observe(img);
            });
        }
    }

    // Scroll Animations
    function initScrollAnimations() {
        if ('IntersectionObserver' in window) {
            const animatedElements = document.querySelectorAll('.feature-card, .service-card, .contact-card');
            
            const observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });

            animatedElements.forEach(function(element) {
                element.style.opacity = '0';
                element.style.transform = 'translateY(20px)';
                element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                observer.observe(element);
            });
        }
    }

    // Add CSS animation keyframes dynamically
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes slideOut {
            from {
                opacity: 1;
                transform: translateY(0);
            }
            to {
                opacity: 0;
                transform: translateY(-10px);
            }
        }
    `;
    document.head.appendChild(style);

})();

// Install prompt for PWA
let deferredPrompt;

window.addEventListener('beforeinstallprompt', function(e) {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Show install button if you want to add one
    console.log('PWA install prompt available');
});

window.addEventListener('appinstalled', function() {
    console.log('PWA was installed');
    deferredPrompt = null;
});
