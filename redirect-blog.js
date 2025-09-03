// Handle page navigation and scrolling
window.addEventListener('load', function() {
    // If we have a hash in URL, scroll to that section
    if (window.location.hash) {
        const targetSection = document.querySelector(window.location.hash);
        if (targetSection) {
            setTimeout(() => {
                targetSection.scrollIntoView({behavior: 'smooth'});
            }, 200);
            return; // Don't scroll to top
        }
    }
    
    // Only scroll to top if we're on a page refresh without hash and not coming from another page with hash
    const isFromOtherPage = document.referrer && (
        document.referrer.includes('produkty.html') || 
        document.referrer.includes('blog.html') || 
        document.referrer.includes('about_us.html')
    );
    
    // If refreshing the same page (not coming from other pages), remove hash and scroll to top
    if (!isFromOtherPage && window.location.pathname.includes('index.html')) {
        if (window.location.hash) {
            // Only remove hash if we're refreshing the same section
            const currentUrl = window.location.href;
            const referrerUrl = document.referrer;
            if (currentUrl === referrerUrl) {
                history.replaceState(null, null, window.location.pathname);
                setTimeout(() => {
                    window.scrollTo(0, 0);
                    document.documentElement.scrollTop = 0;
                    document.body.scrollTop = 0;
                }, 0);
            }
        } else {
            // No hash, just scroll to top
            setTimeout(() => {
                window.scrollTo(0, 0);
                document.documentElement.scrollTop = 0;
                document.body.scrollTop = 0;
            }, 0);
        }
    }
});