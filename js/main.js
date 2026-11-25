document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector("header");
    const menu = document.querySelector(".nav-menu");
    const openButton = document.querySelector("#menu-open-button");
    const closeButton = document.querySelector("#menu-close-button");
    const topButton = document.querySelector("#backToTop");

    const closeMenu = () => {
        menu?.classList.remove("show-menu");
        document.body.classList.remove("menu-open");
        openButton?.setAttribute("aria-expanded", "false");
    };

    openButton?.setAttribute("aria-label", "Open navigation menu");
    openButton?.setAttribute("aria-expanded", "false");
    closeButton?.setAttribute("aria-label", "Close navigation menu");

    openButton?.addEventListener("click", () => {
        menu?.classList.add("show-menu");
        document.body.classList.add("menu-open");
        openButton.setAttribute("aria-expanded", "true");
    });

    closeButton?.addEventListener("click", closeMenu);
    menu?.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 900) closeMenu();
    });

    const updateOnScroll = () => {
        const scrolled = window.scrollY > 35;
        header?.classList.toggle("sticky", scrolled);
        topButton?.classList.toggle("visible", window.scrollY > 350);
    };

    updateOnScroll();
    window.addEventListener("scroll", updateOnScroll, { passive: true });

    topButton?.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // Reveal sections and cards as they enter the viewport.
    const revealItems = document.querySelectorAll(
        "main section, .fade-up, .product-card, .team-card, .testimonial-card, .gallery-img, .why-us .grid > div"
    );
    revealItems.forEach((item, index) => {
        if (!item.classList.contains("fade-up")) item.setAttribute("data-reveal", "");
        item.style.transitionDelay = `${(index % 4) * 70}ms`;
    });

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries, currentObserver) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible", "show");
                    currentObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
        revealItems.forEach(item => observer.observe(item));
    } else {
        revealItems.forEach(item => item.classList.add("is-visible", "show"));
    }

    // Keep in-page navigation smooth without blocking normal page links.
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", event => {
            const selector = anchor.getAttribute("href");
            if (!selector || selector === "#") return;
            const target = document.querySelector(selector);
            if (!target) return;
            event.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });

    // Contact form feedback (front-end only).
    const contactForm = document.querySelector(".contact-form");
    contactForm?.addEventListener("submit", event => {
        event.preventDefault();
        const fields = [...contactForm.querySelectorAll("input, textarea")];
        const emptyField = fields.find(field => !field.value.trim());
        if (emptyField) {
            emptyField.focus();
            emptyField.reportValidity?.();
            return;
        }
        let notice = contactForm.querySelector(".form-notice");
        if (!notice) {
            notice = document.createElement("p");
            notice.className = "form-notice";
            notice.setAttribute("role", "status");
            contactForm.appendChild(notice);
        }
        notice.textContent = "Thank you! Your message is ready. Please connect this form to a backend to receive submissions.";
        contactForm.reset();
    });

    // Add a subtle lift to image tiles and accessible labels to icon-only links.
    document.querySelectorAll(".social-links a, .about-social a").forEach((link, index) => {
        if (!link.getAttribute("aria-label")) link.setAttribute("aria-label", `Social link ${index + 1}`);
    });

    // Highlight the navigation item for the section currently in view.
    const pageSections = ["home", "about", "menu", "testimonials", "gallery", "contact"]
        .map(id => document.getElementById(id))
        .filter(Boolean);
    if ("IntersectionObserver" in window) {
        const sectionObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                document.querySelectorAll(".nav-link").forEach(link => {
                    link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
                });
            });
        }, { rootMargin: "-30% 0px -60% 0px", threshold: 0 });
        pageSections.forEach(section => sectionObserver.observe(section));
    }

});
