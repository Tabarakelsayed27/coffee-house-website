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
        if (!menu) return;
        menu.classList.toggle("show-menu");
        const isOpen = menu.classList.contains("show-menu");
        document.body.classList.toggle("menu-open", isOpen);
        openButton.setAttribute("aria-expanded", String(isOpen));
        openButton.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
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
        const formData = new FormData(contactForm);
        const subject = encodeURIComponent(formData.get("subject") || "Coffee House website message");
        const body = encodeURIComponent(
            `Name: ${formData.get("name")}\nEmail: ${formData.get("email")}\n\n${formData.get("message")}`
        );
        window.location.href = `mailto:coffee@email.com?subject=${subject}&body=${body}`;
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

    // Product ordering: add menu items to a small cart and prepare an email order.
    const cart = new Map();
    const cartOverlay = document.querySelector("#cartOverlay");
    const cartOpen = document.querySelector("#cartOpen");
    const cartClose = document.querySelector("#cartClose");
    const cartItems = document.querySelector("#cartItems");
    const cartCount = document.querySelector("#cartCount");
    const cartTotal = document.querySelector("#cartTotal");
    const cartCheckout = document.querySelector("#cartCheckout");

    const formatPrice = value => `EGP ${Math.round(value).toLocaleString("en-EG")}`;
    const openCart = () => {
        cartOverlay?.classList.add("is-open");
        cartOverlay?.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        cartClose?.focus();
    };
    const closeCart = () => {
        cartOverlay?.classList.remove("is-open");
        cartOverlay?.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    };
    const renderCart = () => {
        if (!cartItems || !cartCount || !cartTotal || !cartCheckout) return;
        const entries = [...cart.entries()];
        const quantity = entries.reduce((sum, [, item]) => sum + item.quantity, 0);
        const total = entries.reduce((sum, [, item]) => sum + item.price * item.quantity, 0);
        cartCount.textContent = quantity;
        cartTotal.textContent = formatPrice(total);
        cartCheckout.disabled = entries.length === 0;
        if (!entries.length) {
            cartItems.innerHTML = '<p class="cart-empty">Your order is empty. Add something delicious from our menu.</p>';
            return;
        }
        cartItems.innerHTML = entries.map(([name, item]) => `
            <article class="cart-item">
                <div><h3>${name}</h3><p>${formatPrice(item.price)} each</p></div>
                <div class="cart-item-actions">
                    <button type="button" data-cart-action="minus" data-name="${name}" aria-label="Remove one ${name}">−</button>
                    <span>${item.quantity}</span>
                    <button type="button" data-cart-action="plus" data-name="${name}" aria-label="Add one ${name}">+</button>
                    <button class="remove-item" type="button" data-cart-action="remove" data-name="${name}" aria-label="Remove ${name}">×</button>
                </div>
            </article>`).join("");
    };

    document.querySelectorAll(".product-card").forEach(card => {
        const orderButton = card.querySelector("button");
        orderButton?.addEventListener("click", () => {
            const name = card.querySelector("h4")?.textContent.trim();
            const priceText = card.querySelector("span")?.textContent || "";
            const price = Number(priceText.replace(/[^0-9.]/g, ""));
            if (!name || !Number.isFinite(price)) return;
            const current = cart.get(name) || { price, quantity: 0 };
            current.quantity += 1;
            cart.set(name, current);
            renderCart();
            openCart();
        });
    });

    cartOpen?.addEventListener("click", openCart);
    cartClose?.addEventListener("click", closeCart);
    cartOverlay?.addEventListener("click", event => {
        if (event.target === cartOverlay) closeCart();
    });
    cartItems?.addEventListener("click", event => {
        const button = event.target.closest("button[data-cart-action]");
        if (!button) return;
        const name = button.dataset.name;
        const item = cart.get(name);
        if (!item) return;
        if (button.dataset.cartAction === "plus") item.quantity += 1;
        if (button.dataset.cartAction === "minus") item.quantity -= 1;
        if (button.dataset.cartAction === "remove" || item.quantity <= 0) cart.delete(name);
        else cart.set(name, item);
        renderCart();
    });
    cartCheckout?.addEventListener("click", () => {
        const orderLines = [...cart.entries()].map(([name, item]) =>
            `${item.quantity} x ${name} - ${formatPrice(item.price * item.quantity)}`
        );
        const total = [...cart.values()].reduce((sum, item) => sum + item.price * item.quantity, 0);
        const subject = encodeURIComponent("Coffee House - New Order");
        const body = encodeURIComponent(`${orderLines.join("\n")}\n\nTotal: ${formatPrice(total)}`);
        window.location.href = `mailto:coffee@email.com?subject=${subject}&body=${body}`;
    });
    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && cartOverlay?.classList.contains("is-open")) closeCart();
    });
    renderCart();

});
