/**
 * componentLibrary.js
 *
 * A modal library of pre-built HTML+CSS template components.
 * Clicking a template appends its HTML (and optional CSS) to the current page
 * and triggers a live preview update.
 */

import { elements } from "../DOM/elements.js";
import { getRawCss, setRawCss } from "../CSS Features/cssStore.js";
import { renderPreview } from "../Preview/renderPreview.js";
import { scheduleAutosave } from "../Features/projectStorage.js";

// ── Template definitions ──────────────────────────────────────────────────────

const TEMPLATES = [
  // ── Layout ──────────────────────────────────────────────────────────────────
  {
    name: "Hero Section",
    category: "Layout",
    icon: "⬛",
    html: `<section class="hero-section">
  <h1 class="hero-title">Welcome to My Site</h1>
  <p class="hero-subtitle">A short description of what you offer.</p>
  <a href="#" class="hero-btn">Get Started</a>
</section>`,
    css: `.hero-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 80px 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}
.hero-title {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 16px;
}
.hero-subtitle {
  font-size: 20px;
  opacity: 0.9;
  margin-bottom: 32px;
  max-width: 600px;
}
.hero-btn {
  display: inline-block;
  padding: 14px 36px;
  background: #ffffff;
  color: #764ba2;
  border-radius: 30px;
  font-weight: 600;
  font-size: 16px;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
}
.hero-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.2);
}`,
  },
  {
    name: "Two Column",
    category: "Layout",
    icon: "▥",
    html: `<div class="two-col">
  <div class="col-left">
    <h2>Left Column</h2>
    <p>Your content goes here.</p>
  </div>
  <div class="col-right">
    <h2>Right Column</h2>
    <p>Your content goes here.</p>
  </div>
</div>`,
    css: `.two-col {
  display: flex;
  gap: 24px;
  padding: 40px;
}
.col-left, .col-right {
  flex: 1;
  padding: 24px;
  background: #f9f9f9;
  border-radius: 8px;
}`,
  },
  {
    name: "Footer",
    category: "Layout",
    icon: "▬",
    html: `<footer class="site-footer">
  <div class="footer-top">
    <div class="footer-brand">
      <h3>MySite</h3>
      <p>Building the web, one page at a time.</p>
    </div>
    <div class="footer-links">
      <h4>Links</h4>
      <a href="#">Home</a>
      <a href="#">About</a>
      <a href="#">Contact</a>
    </div>
  </div>
  <div class="footer-bottom">
    <p>&#169; 2026 MySite. All rights reserved.</p>
  </div>
</footer>`,
    css: `.site-footer {
  background: #111827;
  color: #fff;
  font-family: sans-serif;
}
.footer-top {
  display: flex;
  gap: 60px;
  padding: 48px 48px 32px;
  flex-wrap: wrap;
}
.footer-brand h3 {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 8px;
}
.footer-brand p {
  color: #9ca3af;
  font-size: 14px;
  max-width: 220px;
  line-height: 1.6;
}
.footer-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.footer-links h4 {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #9ca3af;
  margin-bottom: 4px;
}
.footer-links a {
  color: #d1d5db;
  text-decoration: none;
  font-size: 14px;
}
.footer-links a:hover { color: #fff; }
.footer-bottom {
  border-top: 1px solid #374151;
  padding: 16px 48px;
  text-align: center;
}
.footer-bottom p {
  color: #6b7280;
  font-size: 13px;
}`,
  },

  // ── Navigation ───────────────────────────────────────────────────────────────
  {
    name: "Navbar",
    category: "Navigation",
    icon: "≡",
    html: `<nav class="site-nav">
  <div class="nav-brand">MySite</div>
  <div class="nav-links">
    <a href="#">Home</a>
    <a href="#">About</a>
    <a href="#">Services</a>
    <a href="#">Contact</a>
  </div>
</nav>`,
    css: `.site-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  height: 60px;
  background: #1f2937;
  color: #fff;
}
.nav-brand {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
}
.nav-links {
  display: flex;
  gap: 24px;
}
.nav-links a {
  color: #d1d5db;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.15s;
}
.nav-links a:hover { color: #fff; }`,
  },

  // ── Content ──────────────────────────────────────────────────────────────────
  {
    name: "Card",
    category: "Content",
    icon: "▭",
    html: `<div class="card">
  <div class="card-img"></div>
  <div class="card-body">
    <h3 class="card-title">Card Title</h3>
    <p class="card-text">A short description of this card's content.</p>
    <a href="#" class="card-link">Read More &#8594;</a>
  </div>
</div>`,
    css: `.card {
  width: 300px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  background: #fff;
  font-family: sans-serif;
}
.card-img {
  height: 160px;
  background: linear-gradient(135deg, #a8edea, #fed6e3);
}
.card-body { padding: 20px; }
.card-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #1f2937;
}
.card-text {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 16px;
}
.card-link {
  font-size: 13px;
  font-weight: 600;
  color: #6366f1;
  text-decoration: none;
}
.card-link:hover { text-decoration: underline; }`,
  },
  {
    name: "Feature List",
    category: "Content",
    icon: "&#9783;",
    html: `<section class="features">
  <h2 class="features-title">Why Choose Us</h2>
  <div class="feature-grid">
    <div class="feature-item">
      <span class="feature-icon">&#9889;</span>
      <h3>Fast</h3>
      <p>Blazing fast performance out of the box.</p>
    </div>
    <div class="feature-item">
      <span class="feature-icon">&#128274;</span>
      <h3>Secure</h3>
      <p>Built with security as the top priority.</p>
    </div>
    <div class="feature-item">
      <span class="feature-icon">&#127912;</span>
      <h3>Beautiful</h3>
      <p>Stunning designs that delight users.</p>
    </div>
  </div>
</section>`,
    css: `.features {
  padding: 60px 40px;
  text-align: center;
  background: #f9fafb;
}
.features-title {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 40px;
}
.feature-grid {
  display: flex;
  gap: 32px;
  justify-content: center;
  flex-wrap: wrap;
}
.feature-item {
  flex: 1;
  min-width: 180px;
  max-width: 260px;
  padding: 28px 20px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
}
.feature-icon {
  font-size: 36px;
  display: block;
  margin-bottom: 12px;
}
.feature-item h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}
.feature-item p {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
}`,
  },
  {
    name: "Testimonial",
    category: "Content",
    icon: "&#10077;",
    html: `<div class="testimonial">
  <p class="testimonial-text">"This is the best product I have ever used. It completely transformed my workflow and I can't imagine working without it."</p>
  <div class="testimonial-author">
    <div class="testimonial-avatar"></div>
    <div>
      <div class="testimonial-name">Jane Doe</div>
      <div class="testimonial-role">CEO, Example Corp</div>
    </div>
  </div>
</div>`,
    css: `.testimonial {
  max-width: 600px;
  margin: 40px auto;
  padding: 32px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}
.testimonial-text {
  font-size: 18px;
  font-style: italic;
  color: #374151;
  line-height: 1.7;
  margin-bottom: 24px;
}
.testimonial-author {
  display: flex;
  align-items: center;
  gap: 12px;
}
.testimonial-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  flex-shrink: 0;
}
.testimonial-name {
  font-weight: 700;
  color: #1f2937;
  font-size: 15px;
}
.testimonial-role {
  font-size: 13px;
  color: #9ca3af;
}`,
  },
  {
    name: "Pricing Card",
    category: "Content",
    icon: "$",
    html: `<div class="pricing-card">
  <div class="pricing-header">
    <h3 class="pricing-name">Pro Plan</h3>
    <div class="pricing-price"><span class="price-amount">$29</span>/mo</div>
  </div>
  <ul class="pricing-features">
    <li>&#10003; Unlimited projects</li>
    <li>&#10003; 100 GB storage</li>
    <li>&#10003; Priority support</li>
    <li>&#10003; Custom domain</li>
  </ul>
  <a href="#" class="pricing-btn">Get Started</a>
</div>`,
    css: `.pricing-card {
  width: 280px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 6px 24px rgba(0,0,0,0.12);
  font-family: sans-serif;
  background: #fff;
}
.pricing-header {
  padding: 28px 24px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  text-align: center;
}
.pricing-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}
.pricing-price { font-size: 16px; opacity: 0.9; }
.price-amount {
  font-size: 40px;
  font-weight: 700;
}
.pricing-features {
  list-style: none;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.pricing-features li {
  font-size: 14px;
  color: #374151;
}
.pricing-btn {
  display: block;
  margin: 0 24px 24px;
  padding: 12px;
  background: #6366f1;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  font-weight: 600;
  text-decoration: none;
  font-size: 14px;
}
.pricing-btn:hover { background: #4f46e5; }`,
  },

  // ── Forms ────────────────────────────────────────────────────────────────────
  {
    name: "Contact Form",
    category: "Forms",
    icon: "&#9993;",
    html: `<div class="contact-form-wrap">
  <h2 class="contact-form-title">Get In Touch</h2>
  <form class="contact-form">
    <div class="cf-field">
      <label>Name</label>
      <input type="text" placeholder="Your name">
    </div>
    <div class="cf-field">
      <label>Email</label>
      <input type="email" placeholder="your@email.com">
    </div>
    <div class="cf-field">
      <label>Message</label>
      <textarea rows="4" placeholder="Your message..."></textarea>
    </div>
    <button type="submit" class="cf-submit">Send Message</button>
  </form>
</div>`,
    css: `.contact-form-wrap {
  max-width: 500px;
  margin: 40px auto;
  padding: 36px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  font-family: sans-serif;
}
.contact-form-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 24px;
}
.cf-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 18px;
}
.cf-field label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}
.cf-field input, .cf-field textarea {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 10px 14px;
  font-size: 14px;
  font-family: sans-serif;
  outline: none;
  resize: vertical;
}
.cf-field input:focus, .cf-field textarea:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99,102,241,0.15);
}
.cf-submit {
  width: 100%;
  padding: 12px;
  background: #6366f1;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.cf-submit:hover { background: #4f46e5; }`,
  },
  {
    name: "Newsletter",
    category: "Forms",
    icon: "&#9993;",
    html: `<div class="newsletter">
  <h3 class="newsletter-title">Stay in the loop</h3>
  <p class="newsletter-desc">Subscribe to get the latest updates.</p>
  <div class="newsletter-form">
    <input type="email" class="newsletter-input" placeholder="Enter your email">
    <button class="newsletter-btn">Subscribe</button>
  </div>
</div>`,
    css: `.newsletter {
  padding: 48px 40px;
  background: #1f2937;
  text-align: center;
  color: #fff;
  font-family: sans-serif;
}
.newsletter-title {
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 8px;
}
.newsletter-desc {
  font-size: 15px;
  color: #9ca3af;
  margin-bottom: 24px;
}
.newsletter-form {
  display: flex;
  gap: 8px;
  max-width: 440px;
  margin: 0 auto;
}
.newsletter-input {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-family: sans-serif;
  outline: none;
}
.newsletter-btn {
  padding: 12px 24px;
  background: #6366f1;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}
.newsletter-btn:hover { background: #4f46e5; }`,
  },
];

// ── Init / open / close ───────────────────────────────────────────────────────

export function initComponentLibrary() {
  const btn      = document.getElementById("insertComponentBtn");
  const modal    = document.getElementById("componentLibraryModal");
  const closeBtn = document.getElementById("compLibCloseBtn");

  if (!btn || !modal) return;

  btn.addEventListener("click", openComponentLibrary);
  closeBtn?.addEventListener("click", closeComponentLibrary);

  modal.addEventListener("click", e => {
    if (e.target === modal) closeComponentLibrary();
  });
  modal.addEventListener("keydown", e => {
    if (e.key === "Escape") closeComponentLibrary();
  });

  // Category tabs
  modal.querySelectorAll(".cl-cat-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      modal.querySelectorAll(".cl-cat-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      _renderGrid(tab.dataset.cat);
    });
  });

  _renderGrid("All");
}

export function openComponentLibrary() {
  const modal = document.getElementById("componentLibraryModal");
  if (!modal) return;
  modal.querySelectorAll(".cl-cat-tab").forEach(t => t.classList.remove("active"));
  modal.querySelector('[data-cat="All"]')?.classList.add("active");
  _renderGrid("All");
  modal.classList.add("open");
}

function closeComponentLibrary() {
  document.getElementById("componentLibraryModal")?.classList.remove("open");
}

// ── Grid rendering ────────────────────────────────────────────────────────────

function _renderGrid(category) {
  const grid = document.getElementById("compLibGrid");
  if (!grid) return;

  const list = category === "All"
    ? TEMPLATES
    : TEMPLATES.filter(t => t.category === category);

  grid.innerHTML = list.map((t, localIdx) => {
    const globalIdx = TEMPLATES.indexOf(t);
    return `<div class="cl-card" data-index="${globalIdx}">
      <div class="cl-card-preview">${t.icon}</div>
      <div class="cl-card-name">${t.name}</div>
      <div class="cl-card-cat">${t.category}</div>
    </div>`;
  }).join("");

  grid.querySelectorAll(".cl-card").forEach(card => {
    card.addEventListener("click", () => {
      _insertTemplate(TEMPLATES[parseInt(card.dataset.index)]);
    });
  });
}

// ── Template insertion ────────────────────────────────────────────────────────

function _insertTemplate(template) {
  // Append HTML
  const current = elements.htmlInput.value.trimEnd();
  elements.htmlInput.value = current + (current ? "\n\n" : "") + template.html;

  // Append CSS if template includes styles
  if (template.css) {
    const currentCss = getRawCss().trimEnd();
    const newCss     = currentCss + (currentCss ? "\n\n" : "") + template.css;
    setRawCss(newCss);
    elements.cssInput.value = newCss;
  }

  renderPreview();
  scheduleAutosave();
  closeComponentLibrary();
}
