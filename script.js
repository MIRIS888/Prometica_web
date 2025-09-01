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
    initializeAnalyticsAnimation();
    initializeChatAnimation();
    
    // Enhanced scroll animations
    addScrollAnimationStyles();
    initializeEnhancedScrollAnimations();
    
});

// ===== SCROLL TO CONTACT FUNCTION =====
function scrollToContact(productType) {
    // Scroll to contact section
    const contactSection = document.querySelector('#contact');
    if (contactSection) {
        contactSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        
        // Pre-select the product in the form after a short delay
        setTimeout(() => {
            const interestSelect = document.querySelector('#interest');
            if (interestSelect) {
                interestSelect.value = productType;
                
                // Add focus effect to the form
                const contactForm = document.querySelector('#contactForm');
                if (contactForm) {
                    contactForm.style.transform = 'scale(1.02)';
                    contactForm.style.transition = 'transform 0.3s ease';
                    
                    setTimeout(() => {
                        contactForm.style.transform = 'scale(1)';
                    }, 500);
                }
            }
        }, 800);
    }
}

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

// ===== PARALLAX EFFECT (DISABLED) =====
function initializeParallax() {
    // Disabled to prevent scroll conflicts
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

// ===== ANALYTICS ANIMATION =====
function initializeAnalyticsAnimation() {
    // Try new simple preview first
    const previewTitle = document.querySelector('.preview-title');
    const dataPoints = document.querySelectorAll('.data-point');
    
    if (previewTitle && dataPoints.length > 0) {
        const resultsContainer = document.querySelector('.results-container');
        
        // New simple animation
        setTimeout(() => {
            previewTitle.textContent = 'Zpracovávám data...';
            
            setTimeout(() => {
                previewTitle.textContent = 'Analýza dokončena ✓';
                previewTitle.style.color = '#22c55e';
                
                // Show results
                setTimeout(() => {
                    previewTitle.style.opacity = '0';
                    document.querySelector('.preview-animation').style.opacity = '0';
                    
                    setTimeout(() => {
                        if (resultsContainer) {
                            resultsContainer.style.opacity = '1';
                            resultsContainer.style.transition = 'opacity 0.8s ease';
                            
                            // Animate header first
                            const resultsHeader = resultsContainer.querySelector('.results-header');
                            if (resultsHeader) {
                                setTimeout(() => {
                                    resultsHeader.style.opacity = '1';
                                    resultsHeader.style.transform = 'translateY(0)';
                                }, 200);
                            }
                            
                            // Animate result metrics one by one
                            const resultMetrics = resultsContainer.querySelectorAll('.result-metric');
                            resultMetrics.forEach((item, index) => {
                                setTimeout(() => {
                                    item.style.transform = 'translateY(0)';
                                    item.style.opacity = '1';
                                }, 500 + (index * 150));
                            });
                        }
                    }, 300);
                }, 1000);
            }, 3000);
        }, 2000);
        return;
    }
    
    // Fallback to old animation
    const progressBar = document.getElementById('progressBar');
    const progressPercent = document.getElementById('progressPercent');
    const progressLabel = document.getElementById('progressLabel');
    const metricsContainer = document.getElementById('metricsContainer');
    const insightText = document.getElementById('insightText');
    
    if (!progressBar || !progressPercent || !progressLabel) return;
    
    // Start animation after 2 seconds
    setTimeout(() => {
        let progress = 0;
        const duration = 3000; // 3 seconds
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            progress = Math.min((elapsed / duration) * 100, 100);
            
            progressBar.style.width = progress + '%';
            progressPercent.textContent = Math.round(progress) + '%';
            
            // Update label based on progress
            if (progress < 30) {
                progressLabel.textContent = 'Načítám data...';
            } else if (progress < 60) {
                progressLabel.textContent = 'Analyzuji faktury...';
            } else if (progress < 90) {
                progressLabel.textContent = 'Hledám duplicity...';
            } else if (progress < 100) {
                progressLabel.textContent = 'Dokončuji analýzu...';
            } else {
                progressLabel.textContent = 'Analýza dokončena';
                
                // Show results after completion
                setTimeout(() => {
                    metricsContainer.style.opacity = '1';
                    metricsContainer.style.transition = 'opacity 0.8s ease';
                }, 300);
                
                setTimeout(() => {
                    insightText.style.opacity = '1';
                    insightText.style.transition = 'opacity 0.8s ease';
                }, 800);
                
                return;
            }
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }, 2000);
}

// ===== CHAT ANIMATION =====
function initializeChatAnimation() {
    const messageThread = document.querySelector('.message-thread');
    const messages = document.querySelectorAll('.message');
    
    if (!messageThread || messages.length === 0) return;
    
    // Hide all messages initially
    messages.forEach(message => {
        message.style.opacity = '0';
        message.style.transform = 'translateY(20px)';
        message.style.animation = 'none';
    });
    
    // Function to show messages sequentially
    function showMessages() {
        messages.forEach((message, index) => {
            setTimeout(() => {
                message.style.opacity = '1';
                message.style.transform = 'translateY(0)';
                message.style.transition = 'all 0.5s ease';
                
                // Add typing indicator for AI messages
                if (message.classList.contains('ai-message') && index > 0) {
                    const messageText = message.querySelector('.message-text');
                    const originalText = messageText.innerHTML;
                    
                    // Show typing indicator briefly
                    messageText.innerHTML = '<span style="opacity: 0.6;">Píše...</span>';
                    
                    setTimeout(() => {
                        messageText.innerHTML = originalText;
                    }, 1000);
                }
            }, index * 2000); // 2 second delay between messages
        });
    }
    
    // Start animation after 2 seconds
    setTimeout(showMessages, 2000);
}

// ===== ENHANCED SCROLL ANIMATIONS =====
function initializeEnhancedScrollAnimations() {
    // Create intersection observer for scroll animations
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const animationType = element.dataset.scroll || 'fadeInUp';
                const delay = parseInt(element.dataset.delay) || 0;
                
                // Use requestAnimationFrame for smoother animations
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        element.classList.add('animate');
                        element.style.opacity = '1';
                        element.style.transform = 'translateY(0)';
                    }, delay);
                });
                
                scrollObserver.unobserve(element);
            }
        });
    }, { 
        threshold: 0.15,
        rootMargin: '0px 0px -30px 0px'
    });
    
    // Add scroll animation classes to elements
    const elementsToAnimate = [
        // Section headers
        '.section-header',
        '.section-title',
        '.section-subtitle',
        '.section-badge',
        
        // Content elements
        '.solution-card',
        '.tech-item',
        '.story-card',
        '.team-member',
        '.blog-post',
        '.contact-method',
        '.form-group',
        
        // Hero elements (delayed)
        '.hero-title .title-line',
        '.hero-subtitle',
        '.hero-buttons',
        '.hero-stats',
        '.cards-title',
        
        // Other elements
        '.metric-item',
        '.feature-row',
        '.progress-section'
    ];
    
    // Set initial styles and observe elements
    elementsToAnimate.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element, index) => {
            // Set initial state
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            
            // Set staggered delay for multiple elements (reduced delays)
            element.dataset.delay = Math.min(index * 80, 400); // Max delay 400ms
            
            // Set animation type based on element
            if (element.classList.contains('title-line')) {
                element.dataset.scroll = 'slideInUp';
                element.dataset.delay = index * 150;
            } else if (element.classList.contains('solution-card')) {
                element.dataset.scroll = 'fadeInScale';
                element.dataset.delay = index * 120;
            } else if (element.classList.contains('tech-item')) {
                element.dataset.scroll = 'fadeInUp';
                element.dataset.delay = index * 60;
            }
            
            scrollObserver.observe(element);
        });
    });
}

// Add new animation keyframes to CSS
function addScrollAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes fadeInScale {
            from {
                opacity: 0;
                transform: translateY(30px) scale(0.9);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
        
        @keyframes slideInLeft {
            from {
                opacity: 0;
                transform: translateX(-50px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(50px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        .animate {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
}

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
                    top: offsetTop
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

// ===== SIMULATED PHONE CALL FUNCTIONALITY =====
function startSimulatedCall() {
    const incomingCall = document.getElementById('incomingCall');
    const activeCall = document.getElementById('activeCall');
    const conversationMessages = document.getElementById('conversationMessages');
    const conversionSuccess = document.getElementById('conversionSuccess');
    
    if (!incomingCall || !activeCall) return;
    
    // Hide incoming call, show active call
    incomingCall.style.display = 'none';
    activeCall.style.display = 'flex';
    
    // Start call timer
    let callDuration = 0;
    const callTimeElement = activeCall.querySelector('.call-time');
    
    const callTimer = setInterval(() => {
        callDuration++;
        const minutes = Math.floor(callDuration / 60);
        const seconds = callDuration % 60;
        if (callTimeElement) {
            callTimeElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }, 1000);
    
    // Conversation messages sequence
    const messages = [
        { type: 'ai', text: 'Dobrý den! Děkuji za zavolání do restaurace U Kamene. Jak vám mohu pomoci?', delay: 1000 },
        { type: 'customer', text: 'Ahoj, chtěl bych rezervovat stůl na zítřejší večer pro 6 osob.', delay: 3000 },
        { type: 'ai', text: 'Samozřejmě! Pro kolik hodin byste si představoval rezervaci?', delay: 2000 },
        { type: 'customer', text: 'Kolem 19:00, pokud to bude možné.', delay: 2500 },
        { type: 'ai', text: 'Perfektní! Na 19:00 máme volno. Na jaké jméno mám rezervaci napsat?', delay: 2000 },
        { type: 'customer', text: 'Jan Novák, telefon 777 123 456.', delay: 2000 },
        { type: 'ai', text: '✅ Výborně! Rezervace pro pana Nováka na zítřek 19:00 pro 6 osob je potvrzena. Těšíme se na vás!', delay: 3000 }
    ];
    
    let messageIndex = 0;
    
    function addNextMessage() {
        if (messageIndex >= messages.length) {
            // Show conversion success
            setTimeout(() => {
                if (conversionSuccess) {
                    conversionSuccess.style.display = 'block';
                    conversionSuccess.style.animation = 'slideInUp 0.5s ease-out';
                }
                
                // Clear timer after success
                setTimeout(() => {
                    clearInterval(callTimer);
                }, 2000);
            }, 1000);
            return;
        }
        
        const message = messages[messageIndex];
        
        setTimeout(() => {
            const messageEl = document.createElement('div');
            messageEl.className = `message ${message.type}-message`;
            messageEl.textContent = message.text;
            
            if (conversationMessages) {
                conversationMessages.appendChild(messageEl);
                conversationMessages.scrollTop = conversationMessages.scrollHeight;
            }
            
            messageIndex++;
            addNextMessage();
        }, message.delay);
    }
    
    // Start conversation
    addNextMessage();
}

// ===== ENHANCED AI ANALYSIS LOADING =====
function initializeEnhancedAnalysisLoading() {
    const loadingElement = document.getElementById('aiAnalysisLoading');
    const resultsElement = document.getElementById('analyticsResults');
    
    if (!loadingElement || !resultsElement) return;
    
    // Auto-start analysis after page load
    setTimeout(() => {
        startAnalysisSequence();
    }, 3000);
}

function startAnalysisSequence() {
    const step1 = document.getElementById('scanStep1');
    const step2 = document.getElementById('scanStep2');
    const step3 = document.getElementById('scanStep3');
    const loadingElement = document.getElementById('aiAnalysisLoading');
    const resultsElement = document.getElementById('analyticsResults');
    const liveDiscoveries = document.getElementById('liveDiscoveries');
    
    // Step 1: Data loading
    setTimeout(() => {
        if (step1) {
            step1.classList.add('active');
            step1.querySelector('.step-text').textContent = 'Načítám 1,247 transakcí...';
        }
    }, 500);
    
    // Step 2: Fraud detection
    setTimeout(() => {
        if (step1) {
            step1.classList.remove('active');
            step1.classList.add('completed');
            step1.querySelector('.step-text').textContent = 'Transakce načteny ✓';
        }
        if (step2) {
            step2.classList.add('active');
            step2.querySelector('.step-text').textContent = 'Detekuji podvodné vzory...';
        }
        
        // Add live discovery
        if (liveDiscoveries) {
            const discovery1 = liveDiscoveries.children[0];
            if (discovery1) {
                discovery1.style.animation = 'discoverySlideIn 0.5s ease-out';
                discovery1.style.opacity = '1';
            }
        }
    }, 2500);
    
    // Step 3: Savings opportunities
    setTimeout(() => {
        if (step2) {
            step2.classList.remove('active');
            step2.classList.add('completed');
            step2.querySelector('.step-text').textContent = 'Podvody identifikovány ✓';
        }
        if (step3) {
            step3.classList.add('active');
            step3.querySelector('.step-text').textContent = 'Hledám úsporné příležitosti...';
        }
        
        // Add more discoveries
        if (liveDiscoveries) {
            const discovery2 = liveDiscoveries.children[1];
            const discovery3 = liveDiscoveries.children[2];
            if (discovery2) {
                setTimeout(() => {
                    discovery2.style.animation = 'discoverySlideIn 0.5s ease-out';
                    discovery2.style.opacity = '1';
                }, 500);
            }
            if (discovery3) {
                setTimeout(() => {
                    discovery3.style.animation = 'discoverySlideIn 0.5s ease-out';
                    discovery3.style.opacity = '1';
                }, 1000);
            }
        }
    }, 4500);
    
    // Complete analysis and show results
    setTimeout(() => {
        if (step3) {
            step3.classList.remove('active');
            step3.classList.add('completed');
            step3.querySelector('.step-text').textContent = 'Analýza dokončena ✓';
        }
        
        // Transition to results
        setTimeout(() => {
            if (loadingElement && resultsElement) {
                loadingElement.style.opacity = '0';
                loadingElement.style.transform = 'translateY(-20px)';
                
                setTimeout(() => {
                    loadingElement.style.display = 'none';
                    resultsElement.style.display = 'flex';
                    resultsElement.style.opacity = '0';
                    resultsElement.style.transform = 'translateY(20px)';
                    
                    setTimeout(() => {
                        resultsElement.style.opacity = '1';
                        resultsElement.style.transform = 'translateY(0)';
                        resultsElement.style.transition = 'all 0.6s ease-out';
                        
                        // Animate chart bars
                        const chartBars = resultsElement.querySelectorAll('.bar');
                        chartBars.forEach((bar, index) => {
                            setTimeout(() => {
                                bar.style.animation = 'barGrow 1s ease-out forwards';
                            }, index * 200);
                        });
                    }, 100);
                }, 400);
            }
        }, 1000);
    }, 6500);
}

// ===== AUTO-RESTART SIMULATED CALL =====
function initializeCallAutoRestart() {
    // Restart call simulation every 30 seconds
    setInterval(() => {
        const incomingCall = document.getElementById('incomingCall');
        const activeCall = document.getElementById('activeCall');
        const conversationMessages = document.getElementById('conversationMessages');
        const conversionSuccess = document.getElementById('conversionSuccess');
        
        if (incomingCall && activeCall) {
            // Reset to initial state
            incomingCall.style.display = 'flex';
            activeCall.style.display = 'none';
            
            if (conversationMessages) {
                conversationMessages.innerHTML = '';
            }
            if (conversionSuccess) {
                conversionSuccess.style.display = 'none';
            }
        }
    }, 30000); // Restart every 30 seconds
}

// ===== AUTO-RESTART ANALYSIS =====
function initializeAnalysisAutoRestart() {
    // Restart analysis every 25 seconds
    setInterval(() => {
        const loadingElement = document.getElementById('aiAnalysisLoading');
        const resultsElement = document.getElementById('analyticsResults');
        const liveDiscoveries = document.getElementById('liveDiscoveries');
        
        if (loadingElement && resultsElement) {
            // Reset to loading state
            loadingElement.style.display = 'flex';
            loadingElement.style.opacity = '1';
            loadingElement.style.transform = 'translateY(0)';
            
            resultsElement.style.display = 'none';
            resultsElement.style.opacity = '0';
            
            // Reset steps
            const steps = [
                document.getElementById('scanStep1'),
                document.getElementById('scanStep2'),
                document.getElementById('scanStep3')
            ];
            
            steps.forEach(step => {
                if (step) {
                    step.classList.remove('active', 'completed');
                }
            });
            
            // Reset discoveries
            if (liveDiscoveries) {
                Array.from(liveDiscoveries.children).forEach(item => {
                    item.style.opacity = '0';
                });
            }
            
            // Restart analysis
            setTimeout(() => {
                startAnalysisSequence();
            }, 1000);
        }
    }, 25000); // Restart every 25 seconds
}

// ===== FINAL INITIALIZATION =====
// ===== SIMPLE SMOOTH SCROLL =====
function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop
                });
            }
        });
    });
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