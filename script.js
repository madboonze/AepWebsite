

(function () {
    'use strict';

 
    const preloader = document.getElementById('preloader');

    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('hidden');
            document.body.classList.add('loaded');
            initReveal();
        }, 2000);
    });

    
    const canvas = document.getElementById('geoCanvas');
    const ctx = canvas.getContext('2d');
    let animFrame;
    let rotation = 0;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function drawGeometry() {
        const w = canvas.width;
        const h = canvas.height;
        const cx = w / 2;
        const cy = h / 2;
        const maxR = Math.max(w, h) * 0.6;

        ctx.clearRect(0, 0, w, h);

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotation);

        const rings = 12;
        const spokes = 24;

        for (let r = 1; r <= rings; r++) {
            const radius = (maxR / rings) * r;
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(201, 168, 76, ${0.03 + r * 0.005})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }

        for (let i = 0; i < spokes; i++) {
            const angle = (Math.PI * 2 / spokes) * i;
            const x = Math.cos(angle) * maxR;
            const y = Math.sin(angle) * maxR;

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(x, y);
            ctx.strokeStyle = 'rgba(201, 168, 76, 0.04)';
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }

        for (let i = 0; i < spokes; i++) {
            for (let j = i + 2; j < spokes; j += 2) {
                const a1 = (Math.PI * 2 / spokes) * i;
                const a2 = (Math.PI * 2 / spokes) * j;
                const r1 = maxR * 0.4;
                const r2 = maxR * 0.7;

                ctx.beginPath();
                ctx.moveTo(Math.cos(a1) * r1, Math.sin(a1) * r1);
                ctx.lineTo(Math.cos(a2) * r2, Math.sin(a2) * r2);
                ctx.strokeStyle = 'rgba(201, 168, 76, 0.025)';
                ctx.lineWidth = 0.3;
                ctx.stroke();
            }
        }

        ctx.restore();
        rotation += 0.0003;
        animFrame = requestAnimationFrame(drawGeometry);
    }

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        resizeCanvas();
        drawGeometry();
        window.addEventListener('resize', resizeCanvas);
    }


    const cursorGlow = document.getElementById('cursorGlow');
    let mouseX = 0;
    let mouseY = 0;
    let glowX = 0;
    let glowY = 0;

    if (window.matchMedia('(pointer: fine)').matches) {
        document.body.classList.add('cursor-active');

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function animateGlow() {
            glowX += (mouseX - glowX) * 0.08;
            glowY += (mouseY - glowY) * 0.08;
            cursorGlow.style.left = glowX + 'px';
            cursorGlow.style.top = glowY + 'px';
            requestAnimationFrame(animateGlow);
        }
        animateGlow();
    }

  
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        navbar.classList.toggle('scrolled', scrollY > 50);
        lastScroll = scrollY;
    }, { passive: true });


    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('open');
        navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('open');
            navLinks.classList.remove('open');
        });
    });


    const sections = document.querySelectorAll('section[id]');
    const navLinkEls = document.querySelectorAll('.nav-link');

    function updateActiveNav() {
        const scrollPos = window.scrollY + 100;

        sections.forEach((section) => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPos >= top && scrollPos < top + height) {
                navLinkEls.forEach((link) => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateActiveNav, { passive: true });


    function initReveal() {
        const reveals = document.querySelectorAll('.reveal');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const delay = entry.target.dataset.delay || 0;
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, parseInt(delay, 10));
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -40px 0px'
        });

        reveals.forEach((el) => observer.observe(el));
    }

 
    if (document.body.classList.contains('loaded')) {
        initReveal();
    }


    const magneticBtns = document.querySelectorAll('.btn-magnetic');

    if (window.matchMedia('(pointer: fine)').matches) {
        magneticBtns.forEach((btn) => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
            });
        });
    }

    const tiltCards = document.querySelectorAll('[data-tilt]');

    if (window.matchMedia('(pointer: fine)').matches) {
        tiltCards.forEach((card) => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;

                card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-8px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

   
    const aboutCards = document.querySelectorAll('.about-card');

    aboutCards.forEach((card) => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--mouse-x', x + '%');
            card.style.setProperty('--mouse-y', y + '%');
        });
    });


    document.querySelectorAll('.btn-popup, .btn-primary').forEach((btn) => {
        btn.addEventListener('click', function (e) {
            const rect = this.getBoundingClientRect();
            const ripple = document.createElement('span');
            ripple.className = 'btn-ripple';
            const size = Math.max(rect.width, rect.height);
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${e.clientX - rect.left - size / 2}px;
                top: ${e.clientY - rect.top - size / 2}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripplePop 0.6s ease-out forwards;
                pointer-events: none;
                z-index: 2;
            `;
            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });

    const rippleStyle = document.createElement('style');
    rippleStyle.textContent = `
        @keyframes ripplePop {
            to { transform: scale(2.5); opacity: 0; }
        }
    `;
    document.head.appendChild(rippleStyle);


    const ornaments = document.querySelectorAll('.hero-ornament');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        ornaments.forEach((orn, i) => {
            const speed = i === 0 ? 0.15 : 0.1;
            orn.style.transform = `translateY(${scrollY * speed}px) rotate(${scrollY * 0.02}deg)`;
        });
    }, { passive: true });

  
    const dualTexts = document.querySelectorAll('.dual-text');

    dualTexts.forEach((text) => {
        text.addEventListener('mouseenter', () => {
            text.style.transform = 'translateX(8px)';
        });
        text.addEventListener('mouseleave', () => {
            text.style.transform = '';
        });
    });

    
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();
            const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'), 10);
            const top = target.getBoundingClientRect().top + window.scrollY - navHeight;

            window.scrollTo({ top, behavior: 'smooth' });
        });
    });

})();
