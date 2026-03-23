document.addEventListener("DOMContentLoaded", function () {

  /************************************************************
   * 1. HAMBURGER MOBILE NAV OVERLAY
   ************************************************************/
  const hamburger = document.querySelector(".hamburger");
  const mainNavLinks = document.querySelector(".main-nav-links");

  if (hamburger && mainNavLinks) {
    const overlay = document.createElement("div");
    overlay.classList.add("mobile-nav-overlay");

    overlay.innerHTML = `
      <button class="close-overlay-btn" aria-label="Close menu">&times;</button>
      ${mainNavLinks.innerHTML}
    `;
    document.body.appendChild(overlay);

    const closeBtn = overlay.querySelector(".close-overlay-btn");

    const toggleOverlay = () => {
      overlay.classList.toggle("show");
      hamburger.classList.toggle("is-active");
    };

    hamburger.addEventListener("click", toggleOverlay);
    closeBtn.addEventListener("click", toggleOverlay);

    overlay.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        if (overlay.classList.contains("show")) toggleOverlay();
      });
    });
  }

  /************************************************************
   * 2. SMOOTH SCROLL FOR ANCHOR LINKS
   ************************************************************/
  document.querySelectorAll('a[href*="#"]').forEach(link => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      const targetPath = href.split("#")[0];
      const currentFile = window.location.pathname
        .substring(window.location.pathname.lastIndexOf("/") + 1);

      if ((targetPath === "" || targetPath === currentFile) && href.includes("#")) {
        const hash = `#${href.split("#")[1]}`;
        const target = document.querySelector(hash);
        if (target) {
          e.preventDefault();
          history.pushState(null, null, hash);
          target.scrollIntoView({ behavior: "smooth" });
        }
      }
    });
  });

  if (window.location.hash) {
    setTimeout(() => {
      const el = document.querySelector(window.location.hash);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 120);
  }

  /************************************************************
   * 3. FADE-IN ON SCROLL (Intersection Observer)
   ************************************************************/
  const fadeEls = document.querySelectorAll(".fade-in-section");
  if (fadeEls.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    fadeEls.forEach(el => observer.observe(el));
  }

  /************************************************************
   * 4. FORM SUBMISSIONS — AWS API GATEWAY
   ************************************************************/
  const API_URL = "https://po1s6ptb9g.execute-api.us-east-2.amazonaws.com/dev/submit";

  // ---- Mini homepage notify form ----
  const notifyForm = document.getElementById("notifyForm");
  if (notifyForm) {
    notifyForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = notifyForm.querySelector("button[type='submit']");
      const original = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Sending...";

      const fd = new FormData(notifyForm);
      const email = fd.get("email");
      const zip   = fd.get("zip");

      if (!email) {
        alert("Please enter your email address.");
        btn.disabled = false;
        btn.textContent = original;
        return;
      }

      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formType: "join", email, zipCode: zip }),
        });
        if (res.ok) {
          alert("You're on the list. We'll be in touch when the time is right.");
          notifyForm.reset();
        } else {
          alert("Something went wrong. Please try again.");
        }
      } catch {
        alert("Connection error. Please try again later.");
      } finally {
        btn.disabled = false;
        btn.textContent = original;
      }
    });
  }

  // ---- Stay in the Loop interest form ----
  const interestForm = document.getElementById("interestForm");
  if (interestForm) {
    interestForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = interestForm.querySelector("button[type='submit']");
      const original = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Sending...";

      const fd = new FormData(interestForm);
      const firstName = fd.get("firstName");
      const lastName  = fd.get("lastName");
      const email     = fd.get("email");
      const city      = fd.get("city") || "";
      const interests = fd.getAll("interest");
      const message   = fd.get("message") || "";
      const agreed    = fd.get("privacy_policy") === "on";

      if (!firstName || !lastName || !email) {
        alert("Please fill in your name and email address.");
        btn.disabled = false;
        btn.textContent = original;
        return;
      }
      if (!agreed) {
        alert("Please agree to receive updates before submitting.");
        btn.disabled = false;
        btn.textContent = original;
        return;
      }

      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            formType: "volunteer",
            firstName, lastName, email,
            city, state: "MA",
            interests,
            notRobotChecked: true,
            privacyPolicyAgreed: true,
            message,
          }),
        });
        if (res.ok) {
          alert("You're in. We'll reach out when something is happening. Thank you!");
          interestForm.reset();
        } else {
          alert("Something went wrong. Please try again.");
        }
      } catch {
        alert("Connection error. Please try again later.");
      } finally {
        btn.disabled = false;
        btn.textContent = original;
      }
    });
  }

  // ---- Contact form ----
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector("button[type='submit']");
      const original = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Sending...";

      const fd      = new FormData(contactForm);
      const name    = fd.get("name");
      const email   = fd.get("email");
      const subject = fd.get("subject") || "";
      const message = fd.get("message");
      const agreed  = fd.get("privacy_policy") === "on";

      if (!name || !email || !message) {
        alert("Please fill in your name, email, and message.");
        btn.disabled = false;
        btn.textContent = original;
        return;
      }
      if (!agreed) {
        alert("Please check the agreement box before sending.");
        btn.disabled = false;
        btn.textContent = original;
        return;
      }

      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            formType: "subscribe",
            name, email,
            privacyPolicyAgreed: true,
            subject, message,
          }),
        });
        if (res.ok) {
          alert("Message received! We'll get back to you soon.");
          contactForm.reset();
        } else {
          alert("Something went wrong. Please try again.");
        }
      } catch {
        alert("Connection error. Please try again later.");
      } finally {
        btn.disabled = false;
        btn.textContent = original;
      }
    });
  }

  /************************************************************
   * 5. ACTIVE NAV LINK HIGHLIGHTING
   ************************************************************/
  const currentPage = window.location.pathname
    .substring(window.location.pathname.lastIndexOf("/") + 1) || "index.html";

  document.querySelectorAll(".main-nav a").forEach(link => {
    const linkPage = link.getAttribute("href");
    if (linkPage === currentPage || (currentPage === "" && linkPage === "index.html")) {
      link.classList.add("active");
    }
  });

  console.log("The Grillin Greek — Script Initialized");
});
