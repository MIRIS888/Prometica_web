// ===== GLOBAL VARIABLES =====
let isScrolling = false;
let particles = [];
let mouseX = 0, mouseY = 0;

// ===== DOM CONTENT LOADED =====
document.addEventListener('DOMContentLoaded', function() {
    initializeAnimations();
    initializeInteractions();
    initializeCursor();
    initializeCounters();
    initializeParticles();
    initializeIntersectionObserver();
    initializeSmoothScroll();
});

// ===== CURSOR GLOW EFFECT =====
function initializeCursor() {
    const cursorGlow = document.querySelector('.cursor-glow');
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        requestAnimationFrame(() => {
            cursorGlow.style.left = (mouseX - 100) + 'px';
            cursorGlow.style.top = (mouseY - 100) + 'px';
        });
    });
    
    // Hide cursor glow on mobile
    if (window.innerWidth <= 768) {
        cursorGlow.style.display = 'none';
    }
}

// ===== NAVBAR SCROLL EFFECT =====
function initializeInteractions() {
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;
    let scrollTimeout;
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add scrolled class after 100px
        if (scrollTop > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Hide navbar when scrolling down, show when scrolling up
        if (scrollTop > lastScrollTop && scrollTop > 200) {
            // Scrolling down
            navbar.classList.add('hidden');
        } else {
            // Scrolling up
            navbar.classList.remove('hidden');
        }
        
        // Clear timeout and set new one
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            navbar.classList.remove('hidden');
        }, 3000); // Show navbar after 3 seconds of no scrolling
        
        lastScrollTop = scrollTop;
    });
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===== ANIMATED COUNTERS =====
function initializeCounters() {
    const counters = document.querySelectorAll('[data-count]');
    
    const animateCounter = (counter) => {
        const target = parseFloat(counter.getAttribute('data-count'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            if (target % 1 === 0) {
                counter.textContent = Math.floor(current);
            } else {
                counter.textContent = current.toFixed(1);
            }
        }, 16);
    };
    
    // Intersection Observer for counters
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
}

// ===== FLOATING PARTICLES =====
function initializeParticles() {
    const heroParticles = document.querySelector('.hero-particles');
    
    function createParticle() {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = Math.random() * 4 + 2 + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = Math.random() > 0.5 ? '#1e90ff' : '#ff77c6';
        particle.style.borderRadius = '50%';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = '100%';
        particle.style.opacity = Math.random() * 0.5 + 0.3;
        particle.style.animation = `particleFloat ${Math.random() * 3 + 4}s linear infinite`;
        
        heroParticles.appendChild(particle);
        
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 7000);
    }
    
    // Create particles periodically
    setInterval(createParticle, 2000);
}

// ===== INTERSECTION OBSERVER FOR ANIMATIONS =====
function initializeIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'slideInUp 0.8s ease-out forwards';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements
    const elementsToObserve = document.querySelectorAll('.solution-card, .tech-item, .testimonial-card, .section-header');
    elementsToObserve.forEach(el => observer.observe(el));
}

// ===== BUTTON RIPPLE EFFECT =====
document.addEventListener('click', function(e) {
    if (e.target.closest('.btn')) {
        const button = e.target.closest('.btn');
        const ripple = document.createElement('div');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        ripple.classList.add('btn-ripple');
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        
        button.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }
});

// ===== FLOATING CARDS MOUSE INTERACTION =====
function initializeAnimations() {
    const floatingCards = document.querySelectorAll('.floating-card');
    
    floatingCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
            this.style.zIndex = '10';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.zIndex = '';
        });
    });
    
    // Card tilt effect
    floatingCards.forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / centerY * -10;
            const rotateY = (x - centerX) / centerX * 10;
            
            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
}

// ===== CHART ANIMATION =====
function animateCharts() {
    const chartBars = document.querySelectorAll('.chart-bar');
    
    chartBars.forEach((bar, index) => {
        setTimeout(() => {
            bar.style.animation = 'chartGrow 1s ease-out forwards';
        }, index * 200);
    });
}

// ===== AUTOMATION FLOW ANIMATION =====
function animateAutomationFlow() {
    const steps = document.querySelectorAll('.flow-step');
    
    steps.forEach((step, index) => {
        setTimeout(() => {
            step.classList.add('active');
            if (index === steps.length - 1) {
                step.classList.add('processing');
            }
        }, index * 1000);
    });
}

// ===== SCROLL-TRIGGERED ANIMATIONS =====
function initializeScrollAnimations() {
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                
                if (target.classList.contains('chart-container')) {
                    animateCharts();
                }
                
                if (target.classList.contains('automation-flow')) {
                    animateAutomationFlow();
                }
                
                scrollObserver.unobserve(target);
            }
        });
    }, { threshold: 0.5 });
    
    const chartContainers = document.querySelectorAll('.chart-container');
    const automationFlows = document.querySelectorAll('.automation-flow');
    
    chartContainers.forEach(container => scrollObserver.observe(container));
    automationFlows.forEach(flow => scrollObserver.observe(flow));
}

// ===== PARALLAX EFFECT =====
function initializeParallax() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.floating-card');
        
        parallaxElements.forEach((element, index) => {
            const speed = (index + 1) * 0.5;
            const yPos = -(scrolled * speed / 10);
            element.style.transform = `translateY(${yPos}px)`;
        });
    });
}

// ===== TYPING ANIMATION =====
function initializeTypingAnimation() {
    const messages = document.querySelectorAll('.message-text');
    
    messages.forEach((message, index) => {
        const text = message.textContent;
        message.textContent = '';
        
        setTimeout(() => {
            let i = 0;
            const typeTimer = setInterval(() => {
                if (i < text.length) {
                    message.textContent += text.charAt(i);
                    i++;
                } else {
                    clearInterval(typeTimer);
                }
            }, 30);
        }, index * 2000);
    });
}

// ===== MOBILE MENU =====
function initializeMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            this.classList.toggle('active');
        });
    }
}

// ===== PERFORMANCE OPTIMIZATIONS =====
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Debounced scroll handler
const debouncedScrollHandler = debounce(() => {
    // Add any scroll-based animations here
}, 10);

window.addEventListener('scroll', debouncedScrollHandler);

// ===== RESIZE HANDLER =====
window.addEventListener('resize', debounce(() => {
    // Recalculate positions and sizes on resize
    const cursorGlow = document.querySelector('.cursor-glow');
    if (window.innerWidth <= 768) {
        cursorGlow.style.display = 'none';
    } else {
        cursorGlow.style.display = 'block';
    }
}, 250));

// ===== LOADING ANIMATION =====
window.addEventListener('load', function() {
    // Initialize scroll-triggered animations after load
    initializeScrollAnimations();
    initializeParallax();
    initializeTypingAnimation();
    initializeMobileMenu();
    
    // Add loaded class to body for CSS animations
    document.body.classList.add('loaded');
});

// ===== EASTER EGG - KONAMI CODE =====
let konamiCode = [];
const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];

document.addEventListener('keydown', function(e) {
    konamiCode.push(e.keyCode);
    
    if (konamiCode.length > konamiSequence.length) {
        konamiCode.shift();
    }
    
    if (JSON.stringify(konamiCode) === JSON.stringify(konamiSequence)) {
        // Easter egg activated
        document.body.style.filter = 'hue-rotate(180deg)';
        
        setTimeout(() => {
            document.body.style.filter = '';
        }, 3000);
        
        konamiCode = [];
    }
});

// ===== HERO STATS ANIMATION ON SCROLL =====
const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'slideInUp 0.8s ease-out forwards';
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    statsObserver.observe(heroStats);
}

// ===== TESTIMONIAL CARDS STAGGER ANIMATION =====
function initializeTestimonialAnimation() {
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    
    const testimonialObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.animation = 'slideInUp 0.8s ease-out forwards';
                }, index * 200);
                testimonialObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    
    testimonialCards.forEach(card => {
        testimonialObserver.observe(card);
    });
}

// Initialize testimonial animation
document.addEventListener('DOMContentLoaded', initializeTestimonialAnimation);

// ===== ABOUT SECTION ANIMATIONS =====
function initializeAboutAnimations() {
    const storyCards = document.querySelectorAll('.story-card');
    const teamMembers = document.querySelectorAll('.team-member');
    
    const aboutObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.animation = 'slideInUp 0.6s ease-out forwards';
                }, index * 100);
                aboutObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    
    [...storyCards, ...teamMembers].forEach(element => {
        aboutObserver.observe(element);
    });
}

// Initialize about animations
document.addEventListener('DOMContentLoaded', initializeAboutAnimations);

// ===== CONTACT FORM ANIMATIONS =====
function initializeContactAnimations() {
    const contactMethods = document.querySelectorAll('.contact-method');
    const formGroups = document.querySelectorAll('.form-group');
    
    const contactObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.animation = 'slideInUp 0.6s ease-out forwards';
                }, index * 150);
                contactObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    
    [...contactMethods, ...formGroups].forEach(element => {
        contactObserver.observe(element);
    });
}

// Initialize contact animations
document.addEventListener('DOMContentLoaded', initializeContactAnimations);

// ===== SOLUTION CARDS HOVER EFFECTS =====
document.querySelectorAll('.solution-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-15px) scale(1.02)';
        this.style.boxShadow = '0 25px 50px rgba(30, 144, 255, 0.2)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = '';
        this.style.boxShadow = '';
    });
});

// ===== TECH ITEMS WAVE ANIMATION =====
function initializeTechWave() {
    const techItems = document.querySelectorAll('.tech-item');
    
    const techObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                techItems.forEach((item, index) => {
                    setTimeout(() => {
                        item.style.animation = 'slideInUp 0.6s ease-out forwards';
                    }, index * 100);
                });
                techObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    
    if (techItems.length > 0) {
        techObserver.observe(techItems[0].parentElement);
    }
}

// Initialize tech wave animation
document.addEventListener('DOMContentLoaded', initializeTechWave);

// ===== CONSOLE EASTER EGG =====
console.log(`
🚀 Prometica AI - Budoucnost je zde!
  
   ╭─────────────────────────╮
   │  Pokročilé AI řešení    │
   │  pro vaše podnikání     │
   ╰─────────────────────────╯
   
💡 Tip: Zkuste Konami kód pro překvapení!
⬆️⬆️⬇️⬇️⬅️➡️⬅️➡️BA

🔗 Kontakt: info@prometica.cz
`);

// ===== FORM VALIDATION (if forms are added later) =====
function initializeFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Add your form validation logic here
            const inputs = form.querySelectorAll('input[required], textarea[required]');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    input.style.borderColor = '#ff4757';
                    isValid = false;
                } else {
                    input.style.borderColor = '';
                }
            });
            
            if (isValid) {
                // Process form
                console.log('Form submitted successfully');
            }
        });
    });
}

// ===== ERROR HANDLING =====
window.addEventListener('error', function(e) {
    console.warn('JavaScript error caught:', e.error);
});


// ===== BLOG POST INTERACTIONS =====
function initializeBlogInteractions() {
    const blogPosts = document.querySelectorAll('.blog-post');
    
    blogPosts.forEach(post => {
        post.addEventListener('click', function() {
            // Simulate opening blog post
            console.log('Opening blog post:', this.querySelector('h3').textContent);
            
            // Add click animation
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
}

// ===== SMOOTH SCROLL FOR NEW SECTIONS =====
function initializeSmoothScroll() {
    // Update existing smooth scroll to include new sections
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                // Add offset for fixed navbar
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===== CONTACT FORM HANDLING =====
function initializeContactForm() {
    const form = document.getElementById('contactForm');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            // Simple validation
            if (!data.name || !data.email || !data.interest || !data.message) {
                showFormMessage('Prosím vyplňte všechna povinná pole.', 'error');
                return;
            }
            
            // Simulate form submission
            const submitBtn = form.querySelector('.form-submit');
            const originalText = submitBtn.querySelector('span').textContent;
            
            submitBtn.disabled = true;
            submitBtn.querySelector('span').textContent = 'Odesílá se...';
            submitBtn.style.opacity = '0.7';
            
            setTimeout(() => {
                showFormMessage('Děkujeme za vaši zprávu! Ozveme se vám do 24 hodin.', 'success');
                form.reset();
                submitBtn.disabled = false;
                submitBtn.querySelector('span').textContent = originalText;
                submitBtn.style.opacity = '';
            }, 2000);
        });
    }
}

function showFormMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.form-success, .form-error');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageEl = document.createElement('div');
    messageEl.className = `form-${type}`;
    messageEl.textContent = message;
    messageEl.style.display = 'block';
    
    const form = document.getElementById('contactForm');
    form.insertBefore(messageEl, form.firstChild);
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        messageEl.style.opacity = '0';
        setTimeout(() => messageEl.remove(), 300);
    }, 5000);
}

// ===== FINAL INITIALIZATION =====
// ===== MOMENTUM SMOOTH SCROLL =====
class MomentumScroller {
    constructor() {
        this.scrollTarget = 0;
        this.scrollCurrent = 0;
        this.ease = 0.08;
        this.isScrolling = false;
        this.init();
    }
    
    init() {
        // Disable default scroll behavior
        this.updateScrollTarget();
        this.smoothScrollLoop();
        this.bindEvents();
    }
    
    updateScrollTarget() {
        this.scrollTarget = window.pageYOffset;
        this.scrollCurrent = window.pageYOffset;
    }
    
    bindEvents() {
        // Handle wheel events for momentum
        let wheelTimeout;
        window.addEventListener('wheel', (e) => {
            clearTimeout(wheelTimeout);
            this.isScrolling = true;
            
            // Smooth wheel scrolling with momentum
            const delta = e.deltaY * 0.8;
            this.scrollTarget += delta;
            this.scrollTarget = Math.max(0, Math.min(this.scrollTarget, document.body.scrollHeight - window.innerHeight));
            
            wheelTimeout = setTimeout(() => {
                this.isScrolling = false;
            }, 150);
        }, { passive: true });
        
        // Handle navigation clicks
        const links = document.querySelectorAll('a[href^="#"]');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.scrollToSection(link.getAttribute('href'));
            });
        });
        
        // Handle button clicks
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            if (button.getAttribute('onclick')) {
                button.removeAttribute('onclick');
                button.addEventListener('click', (e) => {
                    if (button.textContent.includes('Kontaktujte nás')) {
                        e.preventDefault();
                        this.scrollToSection('#contact');
                    } else if (button.textContent.includes('Naše produkty')) {
                        e.preventDefault();
                        this.scrollToSection('#solutions');
                    }
                });
            }
        });
        
        // Update on resize
        window.addEventListener('resize', () => {
            this.updateScrollTarget();
        });
    }
    
    scrollToSection(targetId) {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const offsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset - 80;
            this.scrollTarget = Math.max(0, Math.min(offsetTop, document.body.scrollHeight - window.innerHeight));
        }
    }
    
    smoothScrollLoop() {
        if (Math.abs(this.scrollTarget - this.scrollCurrent) > 0.5) {
            this.scrollCurrent += (this.scrollTarget - this.scrollCurrent) * this.ease;
            window.scrollTo(0, this.scrollCurrent);
        } else {
            this.scrollCurrent = this.scrollTarget;
        }
        
        requestAnimationFrame(() => this.smoothScrollLoop());
    }
}

function initializeSmoothScroll() {
    // Only initialize on desktop for performance
    if (window.innerWidth > 768) {
        new MomentumScroller();
    } else {
        // Keep simple smooth scroll on mobile
        const links = document.querySelectorAll('a[href^="#"]');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initializeFormValidation();
    initializeBlogInteractions();
    initializeSmoothScroll();
    initializeContactForm();
    
    // Add any final initialization code here
    setTimeout(() => {
        document.body.classList.add('animations-ready');
    }, 100);
});