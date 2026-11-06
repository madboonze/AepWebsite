(function () {
    'use strict';

    const $ = (selector, scope) => (scope || document).querySelector(selector);
    const $$ = (selector, scope) => Array.from((scope || document).querySelectorAll(selector));

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    /* ---------------------------------------------------------------
       Preloader, then the page-load sequence (the lapel draws itself)
       --------------------------------------------------------------- */
    const preloader = $('#preloader');
    let revealStarted = false;

    function startPage() {
        if (revealStarted) return;
        revealStarted = true;
        if (preloader) preloader.classList.add('hidden');
        document.body.classList.add('loaded');
        initReveal();
    }

    function whenLoaded() {
        setTimeout(startPage, reducedMotion ? 0 : 1000);
    }

    if (document.readyState === 'complete') {
        whenLoaded();
    } else {
        window.addEventListener('load', whenLoaded);
    }

    // Never leave visitors on the loader if a large image is slow.
    setTimeout(startPage, 4500);

    /* ---------------------------------------------------------------
       Navigation
       --------------------------------------------------------------- */
    const navbar = $('#navbar');
    const navToggle = $('#navToggle');
    const navLinks = $('#navLinks');

    function onScroll() {
        if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 40);
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    function setMenu(open) {
        if (!navToggle || !navLinks) return;
        navToggle.classList.toggle('open', open);
        navLinks.classList.toggle('open', open);
        navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    if (navToggle && navLinks) {
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-controls', 'navLinks');

        navToggle.addEventListener('click', () => {
            setMenu(!navLinks.classList.contains('open'));
        });

        $$('a', navLinks).forEach((link) => {
            link.addEventListener('click', () => setMenu(false));
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') setMenu(false);
        });
    }

    // Highlight the link for the section crossing the middle of the screen.
    const pageName = document.body.dataset.page;

    if (pageName === 'event') {
        const eventLink = $('.nav-link--event');
        if (eventLink) eventLink.classList.add('active');
    } else if ('IntersectionObserver' in window) {
        const sectionLinks = new Map();

        $$('.nav-link[href^="#"]').forEach((link) => {
            sectionLinks.set(link.getAttribute('href').slice(1), link);
        });

        const spy = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                sectionLinks.forEach((link, id) => {
                    link.classList.toggle('active', id === entry.target.id);
                });
            });
        }, { rootMargin: '-45% 0px -50% 0px' });

        $$('section[id]').forEach((section) => {
            if (sectionLinks.has(section.id)) spy.observe(section);
        });
    }

    /* ---------------------------------------------------------------
       Reveal on scroll (a quiet fade)
       --------------------------------------------------------------- */
    function initReveal() {
        const items = $$('.reveal');

        if (!('IntersectionObserver' in window) || reducedMotion) {
            items.forEach((el) => el.classList.add('visible'));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        items.forEach((el) => observer.observe(el));
    }

    /* ---------------------------------------------------------------
       Previous events: the photo turns over to show the story.
       Hover (after a short pause) on desktop; tap or Enter everywhere.
       --------------------------------------------------------------- */
    const flipCards = $$('.event-card--flip');

    function setFlipped(card, on) {
        card.classList.toggle('is-flipped', on);
        const toggle = $('.event-info-toggle', card);
        if (toggle) toggle.setAttribute('aria-expanded', on ? 'true' : 'false');
    }

    flipCards.forEach((card) => {
        const toggle = $('.event-info-toggle', card);
        let timer;

        if (finePointer) {
            card.addEventListener('mouseenter', () => {
                timer = setTimeout(() => setFlipped(card, true), 600);
            });

            card.addEventListener('mouseleave', () => {
                clearTimeout(timer);
                setFlipped(card, false);
            });
        }

        if (toggle) {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                clearTimeout(timer);
                setFlipped(card, !card.classList.contains('is-flipped'));
            });
        }
    });

    document.addEventListener('click', (e) => {
        flipCards.forEach((card) => {
            if (card.classList.contains('is-flipped') && !card.contains(e.target)) {
                setFlipped(card, false);
            }
        });
    });
})();
