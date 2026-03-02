document.addEventListener('DOMContentLoaded', () => {
    //  1. CUSTOM CURSOR LOGIC  
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');

    // Only activate custom cursor on non-touch devices for better performance
    if (window.matchMedia("(pointer: fine)").matches) {
        window.addEventListener('mousemove', (e) => {
            requestAnimationFrame(() => {
                const posX = e.clientX;
                const posY = e.clientY;

                cursorDot.style.left = `${posX}px`;
                cursorDot.style.top = `${posY}px`;

                cursorOutline.style.left = `${posX}px`;
                cursorOutline.style.top = `${posY}px`;
            });
        });

        // Magnetic effect for buttons
        const magneticBtns = document.querySelectorAll('.btn-magnetic');
        magneticBtns.forEach(btn => {
            btn.addEventListener('mouseover', () => cursorOutline.classList.add('cursor-interact'));
            btn.addEventListener('mouseout', () => cursorOutline.classList.remove('cursor-interact'));
        });
    } else {
        // Hide custom cursor on touch devices
        if(cursorDot) cursorDot.style.display = 'none';
        if(cursorOutline) cursorOutline.style.display = 'none';
    }

    //  2. SCROLL REVEAL ANIMATION (FIXED VERSION)  
    const revealElements = document.querySelectorAll('.reveal');
    
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                // If element is intersecting (visible)
                if (entry.isIntersecting) {
                    // Add active class with a slight delay based on index for stagger effect
                    setTimeout(() => {
                        entry.target.classList.add('active');
                    }, parseInt(entry.target.dataset.index || 0) * 100);
                    
                    // Stop observing once it's visible so it doesn't re-animate
                    observer.unobserve(entry.target);
                }
            });
        }, { 
            threshold: 0.15, // Trigger when 15% is visible
            rootMargin: "0px 0px -50px 0px" // Trigger slightly before it hits the center
        });

        // Assign index for stagger and start observing
        revealElements.forEach((el, index) => {
            el.dataset.index = index;
            revealObserver.observe(el);
        });
    } else {
        // Fallback for browsers without IntersectionObserver
        revealElements.forEach(el => el.classList.add('active'));
    }

    // FIX: Force check for elements already in view on page load
    setTimeout(() => {
        revealElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const isVisible = (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );

            // If already visible and not active, add active class immediately
            if (isVisible && !el.classList.contains('active')) {
                el.classList.add('active');
            }
        });
    }, 500); // Small delay to ensure layout is painted

    //  3. MODAL LOGIC  
    const modal = document.getElementById('checkoutModal');
    const openBtn = document.getElementById('openCheckout');
    const closeBtn = document.querySelector('.close-btn');

    function openModal() {
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal() {
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    if (openBtn) openBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    
    // Close on outside click
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    //  4. FORM SUBMISSION  
    const form = document.getElementById('paymentForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const inputs = form.querySelectorAll('input[required]');
            let isValid = true;
            inputs.forEach(input => {
                if (!input.value) {
                    input.style.borderColor = 'var(--accent)';
                    isValid = false;
                } else {
                    input.style.borderColor = 'var(--border)';
                }
            });

            if (isValid) {
                const submitBtn = form.querySelector('button');
                submitBtn.textContent = 'Processing...';
                submitBtn.disabled = true;

                setTimeout(() => {
                    const modalContent = modal.querySelector('.modal-content');
                    if(modalContent) {
                        modalContent.innerHTML = `
                            <div style="text-align: center;">
                                <span class="close-btn" style="position:absolute; top:1rem; right:1.5rem; font-size:2rem; cursor:pointer; color:var(--muted);">&times;</span>
                                <div style="font-size: 5rem; margin-bottom: 1rem; color: var(--primary);">✓</div>
                                <h2 style="font-family: var(--font-display);">Payment Confirmed</h2>
                                <p style="color: var(--muted); margin: 1rem 0 2rem;">Welcome to the Beta Sprint. Check your inbox for the onboarding kit.</p>
                                <button class="btn btn-primary" onclick="location.reload()">Awesome</button>
                            </div>
                        `;
                        // Re-bind close button
                        const newCloseBtn = modalContent.querySelector('.close-btn');
                        if (newCloseBtn) newCloseBtn.addEventListener('click', () => location.reload());
                    }
                }, 1500);
            }
        });
    }

    //  5. SMOOTH SCROLL  
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    //  6. PARALLAX EFFECT FOR HERO CARDS  
    // Optimize: Only add listener if cards exist and on desktop
    const cards = document.querySelectorAll('.floating-card');
    if (cards.length > 0 && window.matchMedia("(pointer: fine)").matches) {
        let ticking = false;
        
        document.addEventListener('mousemove', (e) => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const x = e.clientX / window.innerWidth;
                    const y = e.clientY / window.innerHeight;

                    cards.forEach((card, index) => {
                        const speed = (index + 1) * 15;
                        const moveX = (x - 0.5) * speed;
                        const moveY = (y - 0.5) * speed;
                        card.style.transform = `translate(${moveX}px, ${moveY}px) rotate(${moveX/10}deg)`;
                    });
                    ticking = false;
                });
                ticking = true;
            }
        });
    }
});
