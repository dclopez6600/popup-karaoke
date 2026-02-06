// Mobile Menu Toggle
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');

menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close menu when clicking on a link
const navLinks = document.querySelectorAll('.nav-menu li a');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!menuToggle.contains(e.target) && !navMenu.contains(e.target)) {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
    }
});

// Smooth Scrolling for all anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 70; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Form Submission Handler
const bookingForm = document.getElementById('bookingForm');
bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(bookingForm);
    const data = Object.fromEntries(formData.entries());
    
    // Create mailto link with form data
    const subject = encodeURIComponent(`Karaoke Booking Request - ${data.eventType}`);
    const body = encodeURIComponent(`
Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone}
Event Type: ${data.eventType}
Event Date: ${data.eventDate}
Expected Guests: ${data.guests}
Additional Details: ${data.message}
    `);
    
    window.location.href = `mailto:booking@popupkaraoke.net?subject=${subject}&body=${body}`;
    
    // Show confirmation message
    alert('Thank you! Your booking request will open in your email client. Please send the email to complete your booking request.');
    bookingForm.reset();
});

// Add active state to nav links based on scroll position
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.scrollY + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
});

// Navbar background on scroll
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.style.backgroundColor = 'rgba(10, 10, 26, 0.98)';
        navbar.style.boxShadow = '0 4px 30px rgba(155, 77, 255, 0.2)';
    } else {
        navbar.style.backgroundColor = 'rgba(10, 10, 26, 0.95)';
        navbar.style.boxShadow = '0 2px 20px rgba(155, 77, 255, 0.1)';
    }
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all feature cards and event cards
document.querySelectorAll('.feature-card, .event-card, .contact-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// Phone number formatting
const phoneInput = document.getElementById('phone');
phoneInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 0) {
        if (value.length <= 3) {
            value = `(${value}`;
        } else if (value.length <= 6) {
            value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
        } else {
            value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
        }
    }
    e.target.value = value;
});

// Date input minimum date (today)
const eventDateInput = document.getElementById('eventDate');
const today = new Date().toISOString().split('T')[0];
eventDateInput.setAttribute('min', today);

// Performance: Lazy load iframe
const calendarEmbed = document.querySelector('.calendar-embed');
if (calendarEmbed) {
    const loadCalendar = () => {
        if (calendarEmbed.getBoundingClientRect().top < window.innerHeight + 200) {
            if (!calendarEmbed.hasAttribute('data-loaded')) {
                calendarEmbed.setAttribute('data-loaded', 'true');
            }
            window.removeEventListener('scroll', loadCalendar);
        }
    };
    window.addEventListener('scroll', loadCalendar);
    loadCalendar(); // Check on page load
}

// Log when page is loaded
console.log('PopUp Karaoke website loaded successfully! 🎤');
