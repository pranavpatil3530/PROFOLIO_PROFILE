(() => {
  const root = document.documentElement;

  // ---------------------------
  // Utilities
  // ---------------------------
  const $ = (sel, parent = document) => parent.querySelector(sel);
  const $$ = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));

  // ---------------------------
  // Theme (light/dark)
  // ---------------------------
  const themeToggle = $("#pf-theme-toggle");
  const savedTheme = (() => {
    try {
      return localStorage.getItem("pf-theme");
    } catch {
      return null;
    }
  })();

  const prefersDark =
    window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (savedTheme === "light" || savedTheme === "dark") {
    root.dataset.theme = savedTheme;
  } else {
    root.dataset.theme = prefersDark ? "dark" : "light";
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = root.dataset.theme === "dark" ? "dark" : "light";
      const next = current === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      try {
        localStorage.setItem("pf-theme", next);
      } catch {
        // Ignore storage errors
      }
    });
  }

  // ---------------------------
  // Sticky header styling
  // ---------------------------
  const header = $("#pf-header");
  const setHeaderScrolled = () => {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 10);
  };
  setHeaderScrolled();
  window.addEventListener("scroll", setHeaderScrolled, { passive: true });

  // ---------------------------
  // Mobile nav toggle
  // ---------------------------
  const mobileToggle = $("#pf-mobile-toggle");
  const nav = $("#pf-nav");
  const closeOnNavClick = (e) => {
    const target = e.target;
    if (!target || target.tagName !== "A") return;
    if (!header) return;
    header.classList.remove("pf-nav-open");
    if (mobileToggle) mobileToggle.setAttribute("aria-expanded", "false");
  };

  if (mobileToggle && nav && header) {
    mobileToggle.addEventListener("click", () => {
      const open = header.classList.toggle("pf-nav-open");
      mobileToggle.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", closeOnNavClick);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && header.classList.contains("pf-nav-open")) {
        header.classList.remove("pf-nav-open");
        mobileToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // ---------------------------
  // Smooth reveal animations
  // ---------------------------
  const revealEls = $$("[data-reveal]");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    },
    { threshold: 0.15 }
  );

  revealEls.forEach((el) => {
    el.classList.add("reveal");
    revealObserver.observe(el);
  });

  // ---------------------------
  // Typing animation
  // ---------------------------
  const typedEl = $("#pf-typed-text");
  if (typedEl) {
    const text = "Pranav Nandkumar Patil";
    let i = 0;
    let deleting = false;
    let lastDelay = 70;

    const tick = () => {
      const reduced = window.matchMedia
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false;

      if (reduced) {
        typedEl.textContent = text;
        return;
      }

      if (!deleting) {
        i += 1;
        typedEl.textContent = text.slice(0, i);
        lastDelay = i < text.length ? 75 : 900;
        if (i >= text.length) deleting = true;
      } else {
        i -= 1;
        typedEl.textContent = text.slice(0, i);
        lastDelay = i > 0 ? 40 : 300;
        if (i <= 0) deleting = false;
      }

      window.setTimeout(tick, lastDelay);
    };

    tick();
  }

  // ---------------------------
  // Skill progress bars
  // ---------------------------
  const skillObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const container = entry.target;
        const items = $$("[data-skill]", container);
        for (const item of items) {
          const level = Number(item.dataset.level || 0);
          const percentEl = $(".pf-skill-percent", item);
          const fill = $(".pf-skill-fill", item);
          if (!fill) continue;

          if (percentEl) percentEl.textContent = `${level}%`;

          // Animate from 0 -> level%
          fill.style.width = "0%";
          // Trigger a layout so the transition runs
          // eslint-disable-next-line no-unused-expressions
          fill.offsetWidth;
          fill.style.width = `${level}%`;
        }
        skillObserver.unobserve(container);
      }
    },
    { threshold: 0.2 }
  );

  const skillsSection = $("#skills");
  if (skillsSection) skillObserver.observe(skillsSection);

  // ---------------------------
  // Resume download (PDF in project)
  // ---------------------------
  const resumeBtn = $("#pf-resume-btn");
  if (resumeBtn) {
    resumeBtn.addEventListener("click", () => {
      const a = document.createElement("a");
      a.href = "resume.pdf";
      a.download = "PRANAV_NANDKUMAR_PATIL_RESUME.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
  }

  // ---------------------------
  // Footer year
  // ---------------------------
  const yearEl = $("#pf-year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ---------------------------
  // Contact form
  // ---------------------------
  const form = $("#pf-contact-form");
  const status = $("#pf-form-status");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = $("#pf-contact-name")?.value?.trim() || "";
      const email = $("#pf-contact-email")?.value?.trim() || "";
      const message = $("#pf-contact-message")?.value?.trim() || "";

      const validEmail = email.includes("@") && email.includes(".");

      if (!name) {
        if (status) status.textContent = "Please enter your name.";
        return;
      }
      if (!validEmail) {
        if (status) status.textContent = "Please enter a valid email address.";
        return;
      }
      if (!message) {
        if (status) status.textContent = "Please enter a message.";
        return;
      }

      if (status) {
        status.textContent = "Thanks! Your message is ready to send.";
      }

      const subject = encodeURIComponent("Portfolio Contact - Pranav Nandkumar Patil");
      const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n`
      );

      // Mail draft (no backend required)
      window.location.href = `mailto:pranavpatil3530@gmail.com?subject=${subject}&body=${body}`;
      form.reset();
    });
  }

  // ---------------------------
  // Active nav link (optional polish)
  // ---------------------------
  const navLinks = $$("#pf-nav a[href^='#']");
  const sections = ["home", "about", "skills", "projects", "experience", "certifications", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;

      const id = visible.target.id;
      for (const link of navLinks) {
        const href = link.getAttribute("href") || "";
        link.classList.toggle("is-active", href === `#${id}`);
      }
    },
    { threshold: [0.25, 0.4, 0.6] }
  );

  sections.forEach((s) => observer.observe(s));
})();

