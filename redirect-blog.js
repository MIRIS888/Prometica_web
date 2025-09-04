// Handle page navigation and scrolling
window.addEventListener('load', function() {
    // Always scroll to top on page load/refresh
    setTimeout(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }, 0);
    
    // If we have a hash in URL, scroll to that section after going to top
    if (window.location.hash) {
        const targetSection = document.querySelector(window.location.hash);
        if (targetSection) {
            setTimeout(() => {
                targetSection.scrollIntoView({behavior: 'smooth'});
            }, 100);
        }
    }
});