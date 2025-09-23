// BlurText effect - vanilla JavaScript version
class BlurText {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            text: options.text || element.textContent || '',
            delay: options.delay || 200,
            animateBy: options.animateBy || 'words', // 'words' or 'chars'
            direction: options.direction || 'top', // 'top' or 'bottom'
            threshold: options.threshold || 0.1,
            rootMargin: options.rootMargin || '0px',
            stepDuration: options.stepDuration || 0.35,
            ...options
        };

        this.isInView = false;
        this.elements = this.options.animateBy === 'words'
            ? this.options.text.split(' ')
            : this.options.text.split('');

        this.init();
    }

    init() {
        this.setupElement();
        this.createObserver();
    }

    setupElement() {
        this.element.style.display = 'flex';
        this.element.style.flexWrap = 'wrap';
        this.element.innerHTML = '';

        this.elements.forEach((segment, index) => {
            const span = document.createElement('span');
            span.className = 'blur-text-span';
            span.style.display = 'inline-block';
            span.style.willChange = 'transform, filter, opacity';

            // Apply gradient to "AI budoucnost"
            if (segment === 'AI' || segment === 'budoucnost') {
                span.style.background = 'linear-gradient(135deg, #f59e0b, #f97316, #ea580c)';
                span.style.webkitBackgroundClip = 'text';
                span.style.webkitTextFillColor = 'transparent';
                span.style.backgroundClip = 'text';
                span.style.opacity = '0.9';
                span.classList.add('gradient-word');
            }

            // Set initial state
            const initialStyle = this.getInitialStyle();
            Object.assign(span.style, {
                ...initialStyle,
                // Preserve gradient properties if they exist
                ...(span.style.background && {
                    background: span.style.background,
                    webkitBackgroundClip: span.style.webkitBackgroundClip,
                    webkitTextFillColor: span.style.webkitTextFillColor,
                    backgroundClip: span.style.backgroundClip
                })
            });

            // Handle spaces
            if (segment === ' ') {
                span.innerHTML = '&nbsp;';
            } else {
                span.textContent = segment;
                if (this.options.animateBy === 'words' && index < this.elements.length - 1) {
                    span.innerHTML += '&nbsp;';
                }
            }

            this.element.appendChild(span);
        });
    }

    getInitialStyle() {
        const direction = this.options.direction;
        return {
            filter: 'blur(15px) brightness(0.3)',
            opacity: '0',
            transform: direction === 'top' ? 'translateY(-30px) scale(0.95)' : 'translateY(30px) scale(0.95)',
            transition: 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            textShadow: '0 0 0px rgba(255, 255, 255, 0)'
        };
    }

    getAnimationSteps() {
        const direction = this.options.direction;
        return [
            {
                filter: 'blur(8px) brightness(0.7)',
                opacity: '0.3',
                transform: direction === 'top' ? 'translateY(-10px) scale(0.98)' : 'translateY(10px) scale(0.98)',
                textShadow: '0 0 20px rgba(255, 255, 255, 0.3)'
            },
            {
                filter: 'blur(3px) brightness(0.9)',
                opacity: '0.7',
                transform: direction === 'top' ? 'translateY(-2px) scale(0.99)' : 'translateY(2px) scale(0.99)',
                textShadow: '0 0 30px rgba(255, 255, 255, 0.5)'
            },
            {
                filter: 'blur(0px) brightness(1)',
                opacity: '1',
                transform: 'translateY(0px) scale(1)',
                textShadow: '0 0 40px rgba(255, 255, 255, 0.4), 0 0 80px rgba(255, 255, 255, 0.2)'
            }
        ];
    }

    createObserver() {
        if (!window.IntersectionObserver) {
            this.startAnimation();
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.isInView) {
                        this.isInView = true;
                        this.startAnimation();
                        observer.unobserve(this.element);
                    }
                });
            },
            {
                threshold: this.options.threshold,
                rootMargin: this.options.rootMargin
            }
        );

        observer.observe(this.element);
    }

    startAnimation() {
        const spans = this.element.querySelectorAll('.blur-text-span');
        const steps = this.getAnimationSteps();

        spans.forEach((span, index) => {
            const delay = (index * this.options.delay);

            setTimeout(() => {
                this.animateSpan(span, steps, index === spans.length - 1);
            }, delay);
        });
    }

    animateSpan(span, steps, isLast) {
        let currentStep = 0;
        const stepDuration = this.options.stepDuration * 1000; // Convert to milliseconds

        // Store gradient properties if they exist
        const hasGradient = span.classList.contains('gradient-word');
        const gradientProperties = hasGradient ? {
            background: span.style.background,
            webkitBackgroundClip: span.style.webkitBackgroundClip,
            webkitTextFillColor: span.style.webkitTextFillColor,
            backgroundClip: span.style.backgroundClip
        } : {};

        // Custom animation steps for gradient words
        const customSteps = hasGradient ? [
            {
                filter: 'blur(8px) brightness(0.7)',
                opacity: '0.3',
                transform: 'translateY(-10px) scale(0.98)',
                textShadow: '0 0 25px rgba(245, 158, 11, 0.6)'
            },
            {
                filter: 'blur(3px) brightness(0.9)',
                opacity: '0.7',
                transform: 'translateY(-2px) scale(0.99)',
                textShadow: '0 0 35px rgba(245, 158, 11, 0.8), 0 0 70px rgba(249, 115, 22, 0.4)'
            },
            {
                filter: 'blur(0px) brightness(1)',
                opacity: '1',
                transform: 'translateY(0px) scale(1)',
                textShadow: '0 0 50px rgba(245, 158, 11, 0.7), 0 0 100px rgba(249, 115, 22, 0.3), 0 0 150px rgba(234, 88, 12, 0.2)'
            }
        ] : steps;

        const animate = () => {
            if (currentStep < customSteps.length) {
                const step = customSteps[currentStep];
                Object.assign(span.style, {
                    ...step,
                    ...gradientProperties // Preserve gradient properties
                });
                currentStep++;
                setTimeout(animate, stepDuration / customSteps.length);
            } else if (isLast && this.options.onAnimationComplete) {
                this.options.onAnimationComplete();
            }
        };

        animate();
    }
}

// Helper function to initialize BlurText on elements
function initBlurText(selector, options = {}) {
    const elements = document.querySelectorAll(selector);
    const instances = [];

    elements.forEach(element => {
        instances.push(new BlurText(element, options));
    });

    return instances;
}

// Export for use
window.BlurText = BlurText;
window.initBlurText = initBlurText;