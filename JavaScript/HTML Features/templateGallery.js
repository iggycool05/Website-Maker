/**
 * templateGallery.js
 *
 * Full-page template gallery. Selecting a template REPLACES the current page
 * HTML (after confirmation). All elements inside templates use
 * class="draggable-item" + contenteditable="true" so they work with the
 * existing drag, resize, and inline-edit system.
 */

import { elements } from "../DOM/elements.js";
import { renderPreview } from "../Preview/renderPreview.js";
import { scheduleAutosave } from "../Features/projectStorage.js";
import { scheduleSnapshot } from "../Utils/undoRedo.js";

// ── Template definitions ──────────────────────────────────────────────────────

const PAGE_TEMPLATES = [

  // ── 1. Minimal Landing ──────────────────────────────────────────────────────
  {
    name: "Minimal Landing",
    category: "Business",
    description: "Clean SaaS landing page with hero, features, and CTA",
    preview: "linear-gradient(135deg, #1a1a2e 45%, #e94560 45%)",
    html: `<nav class="draggable-item" style="position:absolute;left:0;top:0;width:900px;background:#1a1a2e;display:flex;align-items:center;padding:0 36px;height:62px;gap:28px;box-sizing:border-box;">
  <span contenteditable="true" style="color:#e94560;font-size:19px;font-weight:700;font-family:sans-serif;">Brand</span>
  <a href="#" contenteditable="true" style="color:#cbd5e1;text-decoration:none;font-size:13px;font-family:sans-serif;">Home</a>
  <a href="#" contenteditable="true" style="color:#cbd5e1;text-decoration:none;font-size:13px;font-family:sans-serif;">About</a>
  <a href="#" contenteditable="true" style="color:#cbd5e1;text-decoration:none;font-size:13px;font-family:sans-serif;">Services</a>
  <a href="#" contenteditable="true" style="color:#cbd5e1;text-decoration:none;font-size:13px;font-family:sans-serif;">Contact</a>
</nav>
<section class="draggable-item" style="position:absolute;left:0;top:72px;width:900px;background:linear-gradient(135deg,#1a1a2e,#16213e);padding:80px 40px;text-align:center;box-sizing:border-box;">
  <h1 contenteditable="true" style="color:#fff;font-size:48px;font-weight:700;font-family:sans-serif;margin:0 0 18px;line-height:1.2;">Launch Your Idea Today</h1>
  <p contenteditable="true" style="color:#94a3b8;font-size:18px;font-family:sans-serif;margin:0 auto 36px;max-width:520px;line-height:1.6;">A clean, modern landing page to showcase your product or service to the world.</p>
  <a href="#" contenteditable="true" style="display:inline-block;background:#e94560;color:#fff;padding:14px 38px;border-radius:30px;text-decoration:none;font-family:sans-serif;font-weight:600;font-size:15px;margin-right:10px;">Get Started Free</a>
  <a href="#" contenteditable="true" style="display:inline-block;border:1px solid #475569;color:#94a3b8;padding:14px 32px;border-radius:30px;text-decoration:none;font-family:sans-serif;font-size:15px;">Learn More</a>
</section>
<section class="draggable-item" style="position:absolute;left:0;top:430px;width:900px;background:#f8fafc;padding:52px 40px;display:flex;gap:24px;box-sizing:border-box;">
  <div style="flex:1;background:#fff;border-radius:12px;padding:26px;box-shadow:0 2px 10px rgba(0,0,0,0.07);">
    <div style="width:44px;height:44px;background:linear-gradient(135deg,#e94560,#c0392b);border-radius:10px;margin-bottom:16px;"></div>
    <h3 contenteditable="true" style="font-size:15px;font-weight:600;font-family:sans-serif;color:#1e293b;margin:0 0 8px;">Fast Performance</h3>
    <p contenteditable="true" style="font-size:13px;color:#64748b;font-family:sans-serif;margin:0;line-height:1.5;">Built for speed and reliability. Your users will notice the difference.</p>
  </div>
  <div style="flex:1;background:#fff;border-radius:12px;padding:26px;box-shadow:0 2px 10px rgba(0,0,0,0.07);">
    <div style="width:44px;height:44px;background:linear-gradient(135deg,#6366f1,#4f46e5);border-radius:10px;margin-bottom:16px;"></div>
    <h3 contenteditable="true" style="font-size:15px;font-weight:600;font-family:sans-serif;color:#1e293b;margin:0 0 8px;">Easy to Use</h3>
    <p contenteditable="true" style="font-size:13px;color:#64748b;font-family:sans-serif;margin:0;line-height:1.5;">Intuitive design that anyone can get started with on day one.</p>
  </div>
  <div style="flex:1;background:#fff;border-radius:12px;padding:26px;box-shadow:0 2px 10px rgba(0,0,0,0.07);">
    <div style="width:44px;height:44px;background:linear-gradient(135deg,#10b981,#059669);border-radius:10px;margin-bottom:16px;"></div>
    <h3 contenteditable="true" style="font-size:15px;font-weight:600;font-family:sans-serif;color:#1e293b;margin:0 0 8px;">Fully Secure</h3>
    <p contenteditable="true" style="font-size:13px;color:#64748b;font-family:sans-serif;margin:0;line-height:1.5;">Enterprise-grade security protecting your data around the clock.</p>
  </div>
</section>
<section class="draggable-item" style="position:absolute;left:0;top:680px;width:900px;background:#1a1a2e;padding:64px 40px;text-align:center;box-sizing:border-box;">
  <h2 contenteditable="true" style="color:#fff;font-size:32px;font-weight:700;font-family:sans-serif;margin:0 0 14px;">Ready to Get Started?</h2>
  <p contenteditable="true" style="color:#94a3b8;font-size:15px;font-family:sans-serif;margin:0 0 30px;">Join thousands of happy customers. No credit card required.</p>
  <a href="#" contenteditable="true" style="display:inline-block;background:#e94560;color:#fff;padding:14px 36px;border-radius:30px;text-decoration:none;font-family:sans-serif;font-weight:600;font-size:15px;">Start Free Trial</a>
</section>
<footer class="draggable-item" style="position:absolute;left:0;top:920px;width:900px;background:#0f172a;padding:20px 40px;text-align:center;box-sizing:border-box;">
  <p contenteditable="true" style="color:#475569;font-size:12px;font-family:sans-serif;margin:0;">© 2025 Brand. All rights reserved.</p>
</footer>`,
  },

  // ── 2. Creative Portfolio ───────────────────────────────────────────────────
  {
    name: "Creative Portfolio",
    category: "Portfolio",
    description: "Minimal portfolio with about section and project grid",
    preview: "linear-gradient(135deg, #6366f1 40%, #f0f4ff 40%)",
    html: `<header class="draggable-item" style="position:absolute;left:0;top:0;width:900px;background:#fff;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;padding:0 40px;height:64px;gap:32px;box-sizing:border-box;">
  <span contenteditable="true" style="color:#1e293b;font-size:18px;font-weight:700;font-family:sans-serif;">Jane Doe</span>
  <nav style="margin-left:auto;display:flex;gap:24px;">
    <a href="#" contenteditable="true" style="color:#475569;text-decoration:none;font-size:13px;font-family:sans-serif;">Work</a>
    <a href="#" contenteditable="true" style="color:#475569;text-decoration:none;font-size:13px;font-family:sans-serif;">About</a>
    <a href="#" contenteditable="true" style="color:#475569;text-decoration:none;font-size:13px;font-family:sans-serif;">Contact</a>
  </nav>
</header>
<section class="draggable-item" style="position:absolute;left:0;top:74px;width:900px;background:#f8fafc;padding:80px 80px 60px;box-sizing:border-box;display:flex;align-items:center;gap:60px;">
  <div style="flex:1;">
    <p contenteditable="true" style="color:#6366f1;font-size:13px;font-weight:600;font-family:sans-serif;margin:0 0 12px;text-transform:uppercase;letter-spacing:.08em;">Designer &amp; Developer</p>
    <h1 contenteditable="true" style="color:#1e293b;font-size:44px;font-weight:700;font-family:sans-serif;margin:0 0 18px;line-height:1.2;">I craft digital experiences that matter.</h1>
    <p contenteditable="true" style="color:#64748b;font-size:15px;font-family:sans-serif;line-height:1.7;margin:0 0 32px;">Hi, I&apos;m Jane. I design and build products that are beautiful, functional, and user-focused.</p>
    <a href="#" contenteditable="true" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 30px;border-radius:8px;text-decoration:none;font-family:sans-serif;font-weight:600;font-size:14px;margin-right:12px;">View My Work</a>
    <a href="#" contenteditable="true" style="display:inline-block;color:#6366f1;font-size:14px;font-family:sans-serif;text-decoration:none;font-weight:500;">Download CV →</a>
  </div>
  <div style="width:180px;height:180px;background:linear-gradient(135deg,#c7d2fe,#818cf8);border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;">
    <span style="font-size:64px;">👩‍💻</span>
  </div>
</section>
<section class="draggable-item" style="position:absolute;left:0;top:460px;width:900px;background:#fff;padding:52px 80px;box-sizing:border-box;">
  <h2 contenteditable="true" style="font-size:22px;font-weight:700;color:#1e293b;font-family:sans-serif;margin:0 0 32px;">Selected Work</h2>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;">
    <div style="background:#f1f5f9;border-radius:12px;overflow:hidden;">
      <div style="height:120px;background:linear-gradient(135deg,#818cf8,#6366f1);"></div>
      <div style="padding:16px;">
        <h3 contenteditable="true" style="font-size:14px;font-weight:600;font-family:sans-serif;color:#1e293b;margin:0 0 6px;">Project One</h3>
        <p contenteditable="true" style="font-size:12px;color:#64748b;font-family:sans-serif;margin:0;">Web Design</p>
      </div>
    </div>
    <div style="background:#f1f5f9;border-radius:12px;overflow:hidden;">
      <div style="height:120px;background:linear-gradient(135deg,#34d399,#10b981);"></div>
      <div style="padding:16px;">
        <h3 contenteditable="true" style="font-size:14px;font-weight:600;font-family:sans-serif;color:#1e293b;margin:0 0 6px;">Project Two</h3>
        <p contenteditable="true" style="font-size:12px;color:#64748b;font-family:sans-serif;margin:0;">Mobile App</p>
      </div>
    </div>
    <div style="background:#f1f5f9;border-radius:12px;overflow:hidden;">
      <div style="height:120px;background:linear-gradient(135deg,#fb923c,#f97316);"></div>
      <div style="padding:16px;">
        <h3 contenteditable="true" style="font-size:14px;font-weight:600;font-family:sans-serif;color:#1e293b;margin:0 0 6px;">Project Three</h3>
        <p contenteditable="true" style="font-size:12px;color:#64748b;font-family:sans-serif;margin:0;">Branding</p>
      </div>
    </div>
  </div>
</section>
<footer class="draggable-item" style="position:absolute;left:0;top:760px;width:900px;background:#1e293b;padding:32px 80px;text-align:center;box-sizing:border-box;">
  <p contenteditable="true" style="color:#94a3b8;font-size:13px;font-family:sans-serif;margin:0 0 8px;">Let&apos;s work together — <a href="#" contenteditable="true" style="color:#818cf8;">hello@janedoe.com</a></p>
  <p contenteditable="true" style="color:#475569;font-size:11px;font-family:sans-serif;margin:0;">© 2025 Jane Doe. Made with care.</p>
</footer>`,
  },

  // ── 3. Blog Article ─────────────────────────────────────────────────────────
  {
    name: "Blog Article",
    category: "Blog",
    description: "Clean article layout with header, content, and author bio",
    preview: "linear-gradient(135deg, #f1f5f9 60%, #0f172a 60%)",
    html: `<header class="draggable-item" style="position:absolute;left:0;top:0;width:900px;background:#fff;border-bottom:2px solid #0f172a;display:flex;align-items:center;padding:0 40px;height:58px;box-sizing:border-box;gap:32px;">
  <span contenteditable="true" style="color:#0f172a;font-size:17px;font-weight:800;font-family:Georgia,serif;letter-spacing:-.02em;">The Daily Read</span>
  <nav style="margin-left:auto;display:flex;gap:24px;">
    <a href="#" contenteditable="true" style="color:#475569;text-decoration:none;font-size:12px;font-family:sans-serif;text-transform:uppercase;letter-spacing:.06em;">Tech</a>
    <a href="#" contenteditable="true" style="color:#475569;text-decoration:none;font-size:12px;font-family:sans-serif;text-transform:uppercase;letter-spacing:.06em;">Design</a>
    <a href="#" contenteditable="true" style="color:#475569;text-decoration:none;font-size:12px;font-family:sans-serif;text-transform:uppercase;letter-spacing:.06em;">Business</a>
  </nav>
</header>
<section class="draggable-item" style="position:absolute;left:0;top:68px;width:900px;background:#fff;padding:52px 160px 0;box-sizing:border-box;">
  <p contenteditable="true" style="color:#6366f1;font-size:12px;font-weight:600;font-family:sans-serif;margin:0 0 14px;text-transform:uppercase;letter-spacing:.08em;">Design · 5 min read</p>
  <h1 contenteditable="true" style="color:#0f172a;font-size:40px;font-weight:700;font-family:Georgia,serif;margin:0 0 20px;line-height:1.25;">The Future of Interface Design in a World of AI</h1>
  <p contenteditable="true" style="color:#64748b;font-size:16px;font-family:Georgia,serif;line-height:1.7;margin:0 0 28px;font-style:italic;">Exploring how artificial intelligence is reshaping the way designers think about user experience, creativity, and the tools we use every day.</p>
  <div style="display:flex;align-items:center;gap:12px;padding:20px 0;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;margin-bottom:36px;">
    <div style="width:40px;height:40px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:50%;"></div>
    <div>
      <p contenteditable="true" style="color:#1e293b;font-size:13px;font-weight:600;font-family:sans-serif;margin:0;">Alex Johnson</p>
      <p contenteditable="true" style="color:#94a3b8;font-size:12px;font-family:sans-serif;margin:0;">Published April 20, 2025</p>
    </div>
  </div>
</section>
<section class="draggable-item" style="position:absolute;left:0;top:430px;width:900px;background:#fff;padding:0 160px 52px;box-sizing:border-box;">
  <p contenteditable="true" style="color:#334155;font-size:16px;font-family:Georgia,serif;line-height:1.8;margin:0 0 20px;">The relationship between human designers and AI tools is evolving rapidly. What once required hours of manual iteration can now be explored in seconds, leaving designers free to focus on the aspects of their work that truly require human judgment.</p>
  <h2 contenteditable="true" style="color:#0f172a;font-size:24px;font-weight:700;font-family:Georgia,serif;margin:32px 0 16px;">Where Creativity Meets Computation</h2>
  <p contenteditable="true" style="color:#334155;font-size:16px;font-family:Georgia,serif;line-height:1.8;margin:0 0 20px;">AI is not replacing designers — it is becoming an increasingly capable collaborator. The designers who thrive will be those who learn to direct these tools with clarity and intention.</p>
  <blockquote contenteditable="true" style="border-left:4px solid #6366f1;margin:28px 0;padding:16px 24px;background:#f8fafc;color:#475569;font-size:18px;font-family:Georgia,serif;font-style:italic;line-height:1.6;">"The best interface is the one your users never have to think about."</blockquote>
  <p contenteditable="true" style="color:#334155;font-size:16px;font-family:Georgia,serif;line-height:1.8;margin:0;">As these tools become more embedded in our workflows, the question shifts from whether to use them, to how to use them thoughtfully.</p>
</section>
<footer class="draggable-item" style="position:absolute;left:0;top:890px;width:900px;background:#f8fafc;padding:28px 160px;border-top:1px solid #e2e8f0;box-sizing:border-box;">
  <p contenteditable="true" style="color:#64748b;font-size:12px;font-family:sans-serif;margin:0;">© 2025 The Daily Read · <a href="#" style="color:#6366f1;text-decoration:none;">Privacy</a> · <a href="#" style="color:#6366f1;text-decoration:none;">Terms</a></p>
</footer>`,
  },

  // ── 4. Product Showcase ─────────────────────────────────────────────────────
  {
    name: "Product Showcase",
    category: "Business",
    description: "Product page with image, features, and buy button",
    preview: "linear-gradient(135deg, #0f172a 50%, #f59e0b 50%)",
    html: `<nav class="draggable-item" style="position:absolute;left:0;top:0;width:900px;background:#0f172a;display:flex;align-items:center;padding:0 36px;height:60px;gap:28px;box-sizing:border-box;">
  <span contenteditable="true" style="color:#f59e0b;font-size:18px;font-weight:700;font-family:sans-serif;">ShopCo</span>
  <span style="margin-left:auto;display:flex;gap:20px;">
    <a href="#" contenteditable="true" style="color:#94a3b8;text-decoration:none;font-size:13px;font-family:sans-serif;">Products</a>
    <a href="#" contenteditable="true" style="color:#94a3b8;text-decoration:none;font-size:13px;font-family:sans-serif;">About</a>
    <a href="#" contenteditable="true" style="background:#f59e0b;color:#0f172a;padding:8px 20px;border-radius:6px;text-decoration:none;font-size:13px;font-family:sans-serif;font-weight:600;">Cart (0)</a>
  </span>
</nav>
<section class="draggable-item" style="position:absolute;left:0;top:70px;width:900px;background:#fff;padding:52px 60px;box-sizing:border-box;display:flex;gap:60px;align-items:flex-start;">
  <div style="flex:0 0 340px;height:320px;background:linear-gradient(135deg,#1e293b,#334155);border-radius:16px;display:flex;align-items:center;justify-content:center;">
    <span style="font-size:96px;">📦</span>
  </div>
  <div style="flex:1;">
    <p contenteditable="true" style="color:#f59e0b;font-size:12px;font-weight:600;font-family:sans-serif;margin:0 0 8px;text-transform:uppercase;letter-spacing:.08em;">New Release</p>
    <h1 contenteditable="true" style="color:#0f172a;font-size:32px;font-weight:700;font-family:sans-serif;margin:0 0 12px;line-height:1.2;">ProWidget X</h1>
    <p contenteditable="true" style="color:#64748b;font-size:15px;font-family:sans-serif;line-height:1.6;margin:0 0 20px;">The most advanced widget ever made. Built for professionals who demand the absolute best in performance and design.</p>
    <div style="display:flex;align-items:baseline;gap:12px;margin-bottom:24px;">
      <span contenteditable="true" style="font-size:32px;font-weight:700;color:#0f172a;font-family:sans-serif;">$199</span>
      <span contenteditable="true" style="font-size:16px;color:#94a3b8;font-family:sans-serif;text-decoration:line-through;">$299</span>
    </div>
    <a href="#" contenteditable="true" style="display:inline-block;background:#f59e0b;color:#0f172a;padding:14px 40px;border-radius:8px;text-decoration:none;font-family:sans-serif;font-weight:700;font-size:15px;margin-right:12px;">Buy Now</a>
    <a href="#" contenteditable="true" style="display:inline-block;border:1px solid #e2e8f0;color:#475569;padding:14px 24px;border-radius:8px;text-decoration:none;font-family:sans-serif;font-size:15px;">Add to Cart</a>
  </div>
</section>
<section class="draggable-item" style="position:absolute;left:0;top:520px;width:900px;background:#f8fafc;padding:48px 60px;box-sizing:border-box;">
  <h2 contenteditable="true" style="font-size:20px;font-weight:700;color:#0f172a;font-family:sans-serif;margin:0 0 28px;">Why Choose ProWidget X</h2>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
    <div style="display:flex;gap:14px;align-items:flex-start;">
      <div style="width:36px;height:36px;background:#fef3c7;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px;">⚡</div>
      <div><h3 contenteditable="true" style="font-size:14px;font-weight:600;font-family:sans-serif;color:#1e293b;margin:0 0 4px;">Lightning Fast</h3><p contenteditable="true" style="font-size:13px;color:#64748b;font-family:sans-serif;margin:0;line-height:1.5;">Zero lag, instant response every time.</p></div>
    </div>
    <div style="display:flex;gap:14px;align-items:flex-start;">
      <div style="width:36px;height:36px;background:#dcfce7;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px;">🔒</div>
      <div><h3 contenteditable="true" style="font-size:14px;font-weight:600;font-family:sans-serif;color:#1e293b;margin:0 0 4px;">Bank-Level Security</h3><p contenteditable="true" style="font-size:13px;color:#64748b;font-family:sans-serif;margin:0;line-height:1.5;">Your data is always safe with us.</p></div>
    </div>
    <div style="display:flex;gap:14px;align-items:flex-start;">
      <div style="width:36px;height:36px;background:#ede9fe;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px;">🎨</div>
      <div><h3 contenteditable="true" style="font-size:14px;font-weight:600;font-family:sans-serif;color:#1e293b;margin:0 0 4px;">Beautiful Design</h3><p contenteditable="true" style="font-size:13px;color:#64748b;font-family:sans-serif;margin:0;line-height:1.5;">Crafted with attention to every detail.</p></div>
    </div>
    <div style="display:flex;gap:14px;align-items:flex-start;">
      <div style="width:36px;height:36px;background:#ffedd5;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px;">🌍</div>
      <div><h3 contenteditable="true" style="font-size:14px;font-weight:600;font-family:sans-serif;color:#1e293b;margin:0 0 4px;">Works Everywhere</h3><p contenteditable="true" style="font-size:13px;color:#64748b;font-family:sans-serif;margin:0;line-height:1.5;">Compatible with all devices and platforms.</p></div>
    </div>
  </div>
</section>`,
  },

  // ── 5. Restaurant Menu ──────────────────────────────────────────────────────
  {
    name: "Restaurant Menu",
    category: "Business",
    description: "Warm restaurant page with hero and menu sections",
    preview: "linear-gradient(135deg, #78350f 40%, #fef3c7 40%)",
    html: `<header class="draggable-item" style="position:absolute;left:0;top:0;width:900px;background:linear-gradient(135deg,#78350f,#92400e);padding:52px 60px;text-align:center;box-sizing:border-box;">
  <h1 contenteditable="true" style="color:#fef3c7;font-size:42px;font-weight:700;font-family:Georgia,serif;margin:0 0 8px;letter-spacing:-.01em;">La Maison</h1>
  <p contenteditable="true" style="color:#fcd34d;font-size:15px;font-family:Georgia,serif;font-style:italic;margin:0 0 20px;">Fine dining since 1987</p>
  <div style="display:flex;justify-content:center;gap:32px;">
    <a href="#" contenteditable="true" style="color:#fef3c7;text-decoration:none;font-size:13px;font-family:sans-serif;border-bottom:1px solid #fcd34d;padding-bottom:2px;">Menu</a>
    <a href="#" contenteditable="true" style="color:#fef3c7;text-decoration:none;font-size:13px;font-family:sans-serif;border-bottom:1px solid #fcd34d;padding-bottom:2px;">Reservations</a>
    <a href="#" contenteditable="true" style="color:#fef3c7;text-decoration:none;font-size:13px;font-family:sans-serif;border-bottom:1px solid #fcd34d;padding-bottom:2px;">About Us</a>
  </div>
</header>
<section class="draggable-item" style="position:absolute;left:0;top:210px;width:900px;background:#fffbeb;padding:44px 60px;box-sizing:border-box;">
  <h2 contenteditable="true" style="font-size:13px;font-weight:600;font-family:sans-serif;color:#92400e;text-transform:uppercase;letter-spacing:.1em;margin:0 0 24px;">Starters</h2>
  <div style="display:flex;flex-direction:column;gap:18px;">
    <div style="display:flex;justify-content:space-between;border-bottom:1px dotted #d97706;padding-bottom:18px;">
      <div><h3 contenteditable="true" style="font-size:15px;font-weight:600;font-family:Georgia,serif;color:#1c1917;margin:0 0 4px;">French Onion Soup</h3><p contenteditable="true" style="font-size:13px;color:#78716c;font-family:sans-serif;margin:0;">Caramelized onions, gruyère, toasted baguette</p></div>
      <span contenteditable="true" style="font-size:15px;font-weight:600;font-family:sans-serif;color:#92400e;white-space:nowrap;">$12</span>
    </div>
    <div style="display:flex;justify-content:space-between;border-bottom:1px dotted #d97706;padding-bottom:18px;">
      <div><h3 contenteditable="true" style="font-size:15px;font-weight:600;font-family:Georgia,serif;color:#1c1917;margin:0 0 4px;">Salmon Tartare</h3><p contenteditable="true" style="font-size:13px;color:#78716c;font-family:sans-serif;margin:0;">Fresh salmon, capers, crème fraîche, dill</p></div>
      <span contenteditable="true" style="font-size:15px;font-weight:600;font-family:sans-serif;color:#92400e;white-space:nowrap;">$16</span>
    </div>
    <div style="display:flex;justify-content:space-between;">
      <div><h3 contenteditable="true" style="font-size:15px;font-weight:600;font-family:Georgia,serif;color:#1c1917;margin:0 0 4px;">Burrata &amp; Heirloom Tomato</h3><p contenteditable="true" style="font-size:13px;color:#78716c;font-family:sans-serif;margin:0;">Fresh burrata, aged balsamic, basil oil</p></div>
      <span contenteditable="true" style="font-size:15px;font-weight:600;font-family:sans-serif;color:#92400e;white-space:nowrap;">$14</span>
    </div>
  </div>
</section>
<section class="draggable-item" style="position:absolute;left:0;top:510px;width:900px;background:#fff;padding:44px 60px;box-sizing:border-box;border-top:2px solid #fef3c7;">
  <h2 contenteditable="true" style="font-size:13px;font-weight:600;font-family:sans-serif;color:#92400e;text-transform:uppercase;letter-spacing:.1em;margin:0 0 24px;">Main Courses</h2>
  <div style="display:flex;flex-direction:column;gap:18px;">
    <div style="display:flex;justify-content:space-between;border-bottom:1px dotted #d97706;padding-bottom:18px;">
      <div><h3 contenteditable="true" style="font-size:15px;font-weight:600;font-family:Georgia,serif;color:#1c1917;margin:0 0 4px;">Filet Mignon</h3><p contenteditable="true" style="font-size:13px;color:#78716c;font-family:sans-serif;margin:0;">8oz tenderloin, truffle butter, roasted asparagus</p></div>
      <span contenteditable="true" style="font-size:15px;font-weight:600;font-family:sans-serif;color:#92400e;white-space:nowrap;">$52</span>
    </div>
    <div style="display:flex;justify-content:space-between;border-bottom:1px dotted #d97706;padding-bottom:18px;">
      <div><h3 contenteditable="true" style="font-size:15px;font-weight:600;font-family:Georgia,serif;color:#1c1917;margin:0 0 4px;">Pan-Seared Sea Bass</h3><p contenteditable="true" style="font-size:13px;color:#78716c;font-family:sans-serif;margin:0;">Lemon beurre blanc, seasonal vegetables, wild rice</p></div>
      <span contenteditable="true" style="font-size:15px;font-weight:600;font-family:sans-serif;color:#92400e;white-space:nowrap;">$38</span>
    </div>
    <div style="display:flex;justify-content:space-between;">
      <div><h3 contenteditable="true" style="font-size:15px;font-weight:600;font-family:Georgia,serif;color:#1c1917;margin:0 0 4px;">Duck Confit</h3><p contenteditable="true" style="font-size:13px;color:#78716c;font-family:sans-serif;margin:0;">Slow-cooked duck leg, cherry gastrique, potato gratin</p></div>
      <span contenteditable="true" style="font-size:15px;font-weight:600;font-family:sans-serif;color:#92400e;white-space:nowrap;">$44</span>
    </div>
  </div>
</section>
<footer class="draggable-item" style="position:absolute;left:0;top:810px;width:900px;background:#78350f;padding:24px 60px;text-align:center;box-sizing:border-box;">
  <p contenteditable="true" style="color:#fcd34d;font-size:13px;font-family:sans-serif;margin:0;">Reservations: (555) 012-3456 · 123 Main Street · Open Tue–Sun 5pm–11pm</p>
</footer>`,
  },

  // ── 6. Contact Page ─────────────────────────────────────────────────────────
  {
    name: "Contact Page",
    category: "Other",
    description: "Professional contact form with info and social links",
    preview: "linear-gradient(135deg, #e0f2fe 50%, #0284c7 50%)",
    html: `<header class="draggable-item" style="position:absolute;left:0;top:0;width:900px;background:#0f172a;padding:0 40px;height:60px;display:flex;align-items:center;box-sizing:border-box;gap:28px;">
  <span contenteditable="true" style="color:#38bdf8;font-size:18px;font-weight:700;font-family:sans-serif;">Acme Corp</span>
  <nav style="margin-left:auto;display:flex;gap:24px;">
    <a href="#" contenteditable="true" style="color:#94a3b8;text-decoration:none;font-size:13px;font-family:sans-serif;">Home</a>
    <a href="#" contenteditable="true" style="color:#38bdf8;text-decoration:none;font-size:13px;font-family:sans-serif;font-weight:600;">Contact</a>
  </nav>
</header>
<section class="draggable-item" style="position:absolute;left:0;top:70px;width:900px;background:#f0f9ff;padding:52px 60px;box-sizing:border-box;text-align:center;">
  <h1 contenteditable="true" style="color:#0c4a6e;font-size:36px;font-weight:700;font-family:sans-serif;margin:0 0 12px;">Get in Touch</h1>
  <p contenteditable="true" style="color:#0369a1;font-size:15px;font-family:sans-serif;margin:0;">We&apos;d love to hear from you. Fill out the form or reach us directly.</p>
</section>
<section class="draggable-item" style="position:absolute;left:0;top:220px;width:900px;background:#fff;padding:48px 60px;box-sizing:border-box;display:flex;gap:52px;">
  <form style="flex:1.4;display:flex;flex-direction:column;gap:16px;">
    <div style="display:flex;gap:16px;">
      <div style="flex:1;"><label contenteditable="true" style="display:block;font-size:12px;font-weight:600;color:#374151;font-family:sans-serif;margin-bottom:6px;">First Name</label><input placeholder="John" style="width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;font-family:sans-serif;box-sizing:border-box;"></div>
      <div style="flex:1;"><label contenteditable="true" style="display:block;font-size:12px;font-weight:600;color:#374151;font-family:sans-serif;margin-bottom:6px;">Last Name</label><input placeholder="Doe" style="width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;font-family:sans-serif;box-sizing:border-box;"></div>
    </div>
    <div><label contenteditable="true" style="display:block;font-size:12px;font-weight:600;color:#374151;font-family:sans-serif;margin-bottom:6px;">Email</label><input placeholder="john@example.com" type="email" style="width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;font-family:sans-serif;box-sizing:border-box;"></div>
    <div><label contenteditable="true" style="display:block;font-size:12px;font-weight:600;color:#374151;font-family:sans-serif;margin-bottom:6px;">Message</label><textarea placeholder="How can we help?" rows="5" style="width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;font-family:sans-serif;resize:vertical;box-sizing:border-box;"></textarea></div>
    <button type="submit" contenteditable="true" style="background:#0284c7;color:#fff;border:none;padding:12px;border-radius:6px;font-size:14px;font-family:sans-serif;font-weight:600;cursor:pointer;">Send Message</button>
  </form>
  <div style="flex:1;display:flex;flex-direction:column;gap:24px;padding-top:4px;">
    <div>
      <h3 contenteditable="true" style="font-size:14px;font-weight:600;color:#0f172a;font-family:sans-serif;margin:0 0 6px;">📍 Address</h3>
      <p contenteditable="true" style="font-size:13px;color:#64748b;font-family:sans-serif;margin:0;line-height:1.6;">123 Business Ave, Suite 400<br>San Francisco, CA 94107</p>
    </div>
    <div>
      <h3 contenteditable="true" style="font-size:14px;font-weight:600;color:#0f172a;font-family:sans-serif;margin:0 0 6px;">📞 Phone</h3>
      <p contenteditable="true" style="font-size:13px;color:#64748b;font-family:sans-serif;margin:0;">(555) 012-3456</p>
    </div>
    <div>
      <h3 contenteditable="true" style="font-size:14px;font-weight:600;color:#0f172a;font-family:sans-serif;margin:0 0 6px;">✉️ Email</h3>
      <p contenteditable="true" style="font-size:13px;color:#64748b;font-family:sans-serif;margin:0;">hello@acmecorp.com</p>
    </div>
    <div>
      <h3 contenteditable="true" style="font-size:14px;font-weight:600;color:#0f172a;font-family:sans-serif;margin:0 0 10px;">🕐 Hours</h3>
      <p contenteditable="true" style="font-size:13px;color:#64748b;font-family:sans-serif;margin:0;line-height:1.6;">Mon – Fri: 9am – 6pm PST<br>Sat – Sun: Closed</p>
    </div>
  </div>
</section>
<footer class="draggable-item" style="position:absolute;left:0;top:780px;width:900px;background:#0f172a;padding:20px 60px;text-align:center;box-sizing:border-box;">
  <p contenteditable="true" style="color:#475569;font-size:12px;font-family:sans-serif;margin:0;">© 2025 Acme Corp. All rights reserved.</p>
</footer>`,
  },

  // ── 7. Agency Services ──────────────────────────────────────────────────────
  {
    name: "Agency Services",
    category: "Business",
    description: "Bold agency page with services grid and team section",
    preview: "linear-gradient(135deg, #4c1d95 50%, #a78bfa 50%)",
    html: `<nav class="draggable-item" style="position:absolute;left:0;top:0;width:900px;background:#4c1d95;display:flex;align-items:center;padding:0 40px;height:64px;box-sizing:border-box;gap:32px;">
  <span contenteditable="true" style="color:#fff;font-size:18px;font-weight:800;font-family:sans-serif;letter-spacing:-.02em;">Pixel&amp;Co</span>
  <nav style="margin-left:auto;display:flex;gap:24px;align-items:center;">
    <a href="#" contenteditable="true" style="color:#c4b5fd;text-decoration:none;font-size:13px;font-family:sans-serif;">Work</a>
    <a href="#" contenteditable="true" style="color:#c4b5fd;text-decoration:none;font-size:13px;font-family:sans-serif;">Services</a>
    <a href="#" contenteditable="true" style="background:#a78bfa;color:#fff;padding:8px 20px;border-radius:6px;text-decoration:none;font-size:13px;font-family:sans-serif;font-weight:600;">Hire Us</a>
  </nav>
</nav>
<section class="draggable-item" style="position:absolute;left:0;top:74px;width:900px;background:linear-gradient(135deg,#4c1d95,#6d28d9);padding:80px 60px;box-sizing:border-box;">
  <p contenteditable="true" style="color:#a78bfa;font-size:12px;font-weight:600;font-family:sans-serif;margin:0 0 16px;text-transform:uppercase;letter-spacing:.1em;">Creative Agency</p>
  <h1 contenteditable="true" style="color:#fff;font-size:52px;font-weight:800;font-family:sans-serif;margin:0 0 20px;line-height:1.1;max-width:600px;">We build brands that people remember.</h1>
  <p contenteditable="true" style="color:#c4b5fd;font-size:16px;font-family:sans-serif;line-height:1.7;margin:0 0 36px;max-width:480px;">Strategy, design, and development — all under one roof. We partner with ambitious brands to create digital experiences that drive growth.</p>
  <a href="#" contenteditable="true" style="display:inline-block;background:#fff;color:#4c1d95;padding:14px 36px;border-radius:8px;text-decoration:none;font-family:sans-serif;font-weight:700;font-size:15px;margin-right:12px;">Start a Project</a>
  <a href="#" contenteditable="true" style="display:inline-block;color:#e9d5ff;font-size:15px;font-family:sans-serif;text-decoration:none;">View Our Work →</a>
</section>
<section class="draggable-item" style="position:absolute;left:0;top:410px;width:900px;background:#faf5ff;padding:52px 60px;box-sizing:border-box;">
  <h2 contenteditable="true" style="font-size:22px;font-weight:700;color:#1e1b4b;font-family:sans-serif;margin:0 0 8px;">Our Services</h2>
  <p contenteditable="true" style="font-size:14px;color:#6b7280;font-family:sans-serif;margin:0 0 32px;">What we do best.</p>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;">
    <div style="background:#fff;border-radius:12px;padding:24px;border:1px solid #ede9fe;">
      <div style="font-size:28px;margin-bottom:12px;">🎨</div>
      <h3 contenteditable="true" style="font-size:14px;font-weight:700;font-family:sans-serif;color:#1e1b4b;margin:0 0 8px;">Brand Design</h3>
      <p contenteditable="true" style="font-size:13px;color:#6b7280;font-family:sans-serif;margin:0;line-height:1.5;">Logos, visual identity, and brand guidelines that make you stand out.</p>
    </div>
    <div style="background:#fff;border-radius:12px;padding:24px;border:1px solid #ede9fe;">
      <div style="font-size:28px;margin-bottom:12px;">💻</div>
      <h3 contenteditable="true" style="font-size:14px;font-weight:700;font-family:sans-serif;color:#1e1b4b;margin:0 0 8px;">Web Development</h3>
      <p contenteditable="true" style="font-size:13px;color:#6b7280;font-family:sans-serif;margin:0;line-height:1.5;">Fast, scalable websites and web apps built with modern technology.</p>
    </div>
    <div style="background:#fff;border-radius:12px;padding:24px;border:1px solid #ede9fe;">
      <div style="font-size:28px;margin-bottom:12px;">📈</div>
      <h3 contenteditable="true" style="font-size:14px;font-weight:700;font-family:sans-serif;color:#1e1b4b;margin:0 0 8px;">Growth Strategy</h3>
      <p contenteditable="true" style="font-size:13px;color:#6b7280;font-family:sans-serif;margin:0;line-height:1.5;">Data-driven strategies to grow your audience and revenue.</p>
    </div>
  </div>
</section>
<footer class="draggable-item" style="position:absolute;left:0;top:730px;width:900px;background:#4c1d95;padding:20px 60px;text-align:center;box-sizing:border-box;">
  <p contenteditable="true" style="color:#c4b5fd;font-size:12px;font-family:sans-serif;margin:0;">© 2025 Pixel&amp;Co. All rights reserved.</p>
</footer>`,
  },

  // ── 8. Coming Soon ──────────────────────────────────────────────────────────
  {
    name: "Coming Soon",
    category: "Other",
    description: "Full-screen launch countdown with email signup",
    preview: "radial-gradient(ellipse at center, #1e1b4b 0%, #0f0a2e 100%)",
    html: `<section class="draggable-item" style="position:absolute;left:0;top:0;width:900px;min-height:600px;background:radial-gradient(ellipse at 50% 40%, #2e1065 0%, #0f0a2e 70%);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 60px;text-align:center;box-sizing:border-box;">
  <div style="width:64px;height:64px;background:linear-gradient(135deg,#818cf8,#6366f1);border-radius:16px;margin:0 auto 28px;display:flex;align-items:center;justify-content:center;font-size:28px;">🚀</div>
  <p contenteditable="true" style="color:#a78bfa;font-size:13px;font-weight:600;font-family:sans-serif;text-transform:uppercase;letter-spacing:.12em;margin:0 0 16px;">Something big is coming</p>
  <h1 contenteditable="true" style="color:#fff;font-size:52px;font-weight:800;font-family:sans-serif;margin:0 0 18px;line-height:1.1;">We&apos;re Launching Soon</h1>
  <p contenteditable="true" style="color:#a5b4fc;font-size:16px;font-family:sans-serif;max-width:440px;margin:0 auto 48px;line-height:1.6;">We&apos;re working hard on something amazing. Enter your email to be first in line.</p>
  <div style="display:flex;gap:0;max-width:420px;width:100%;background:#1e1b4b;border-radius:10px;overflow:hidden;border:1px solid #4338ca;">
    <input type="email" placeholder="Enter your email" style="flex:1;padding:14px 18px;background:transparent;border:none;color:#e0e7ff;font-size:14px;font-family:sans-serif;outline:none;">
    <button contenteditable="true" style="background:#6366f1;color:#fff;border:none;padding:14px 24px;font-size:14px;font-family:sans-serif;font-weight:600;cursor:pointer;white-space:nowrap;">Notify Me</button>
  </div>
  <div style="display:flex;gap:40px;margin-top:56px;">
    <div style="text-align:center;">
      <p contenteditable="true" style="color:#fff;font-size:36px;font-weight:700;font-family:sans-serif;margin:0 0 4px;">14</p>
      <p contenteditable="true" style="color:#6366f1;font-size:12px;font-family:sans-serif;text-transform:uppercase;letter-spacing:.08em;margin:0;">Days</p>
    </div>
    <div style="text-align:center;">
      <p contenteditable="true" style="color:#fff;font-size:36px;font-weight:700;font-family:sans-serif;margin:0 0 4px;">06</p>
      <p contenteditable="true" style="color:#6366f1;font-size:12px;font-family:sans-serif;text-transform:uppercase;letter-spacing:.08em;margin:0;">Hours</p>
    </div>
    <div style="text-align:center;">
      <p contenteditable="true" style="color:#fff;font-size:36px;font-weight:700;font-family:sans-serif;margin:0 0 4px;">42</p>
      <p contenteditable="true" style="color:#6366f1;font-size:12px;font-family:sans-serif;text-transform:uppercase;letter-spacing:.08em;margin:0;">Minutes</p>
    </div>
    <div style="text-align:center;">
      <p contenteditable="true" style="color:#fff;font-size:36px;font-weight:700;font-family:sans-serif;margin:0 0 4px;">18</p>
      <p contenteditable="true" style="color:#6366f1;font-size:12px;font-family:sans-serif;text-transform:uppercase;letter-spacing:.08em;margin:0;">Seconds</p>
    </div>
  </div>
</section>`,
  },

  // ── 9. Pricing Plans ────────────────────────────────────────────────────────
  {
    name: "Pricing Plans",
    category: "Business",
    description: "Three-tier pricing table with feature lists",
    preview: "linear-gradient(135deg, #f0fdf4 50%, #16a34a 50%)",
    html: `<header class="draggable-item" style="position:absolute;left:0;top:0;width:900px;background:#fff;border-bottom:1px solid #e2e8f0;padding:0 40px;height:60px;display:flex;align-items:center;box-sizing:border-box;gap:28px;">
  <span contenteditable="true" style="color:#0f172a;font-size:17px;font-weight:700;font-family:sans-serif;">PriceCo</span>
  <nav style="margin-left:auto;display:flex;gap:24px;">
    <a href="#" contenteditable="true" style="color:#475569;text-decoration:none;font-size:13px;font-family:sans-serif;">Features</a>
    <a href="#" contenteditable="true" style="color:#16a34a;text-decoration:none;font-size:13px;font-family:sans-serif;font-weight:600;">Pricing</a>
    <a href="#" contenteditable="true" style="color:#475569;text-decoration:none;font-size:13px;font-family:sans-serif;">Contact</a>
  </nav>
</header>
<section class="draggable-item" style="position:absolute;left:0;top:70px;width:900px;background:#f0fdf4;padding:52px 60px 0;box-sizing:border-box;text-align:center;">
  <h1 contenteditable="true" style="color:#14532d;font-size:36px;font-weight:700;font-family:sans-serif;margin:0 0 12px;">Simple, Transparent Pricing</h1>
  <p contenteditable="true" style="color:#15803d;font-size:15px;font-family:sans-serif;margin:0 0 40px;">No hidden fees. Cancel anytime. 14-day free trial on all plans.</p>
</section>
<section class="draggable-item" style="position:absolute;left:0;top:230px;width:900px;background:#f0fdf4;padding:0 60px 60px;box-sizing:border-box;display:flex;gap:20px;align-items:flex-start;">
  <div style="flex:1;background:#fff;border-radius:16px;padding:28px;border:1px solid #d1fae5;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
    <h3 contenteditable="true" style="font-size:14px;font-weight:600;font-family:sans-serif;color:#15803d;margin:0 0 8px;text-transform:uppercase;letter-spacing:.06em;">Starter</h3>
    <div style="margin-bottom:20px;"><span contenteditable="true" style="font-size:36px;font-weight:700;font-family:sans-serif;color:#0f172a;">$9</span><span contenteditable="true" style="font-size:14px;color:#64748b;font-family:sans-serif;">/mo</span></div>
    <ul style="list-style:none;padding:0;margin:0 0 24px;display:flex;flex-direction:column;gap:10px;">
      <li contenteditable="true" style="font-size:13px;color:#374151;font-family:sans-serif;padding-left:20px;position:relative;">✓ 5 projects</li>
      <li contenteditable="true" style="font-size:13px;color:#374151;font-family:sans-serif;padding-left:20px;">✓ 10 GB storage</li>
      <li contenteditable="true" style="font-size:13px;color:#374151;font-family:sans-serif;padding-left:20px;">✓ Email support</li>
      <li contenteditable="true" style="font-size:13px;color:#94a3b8;font-family:sans-serif;padding-left:20px;">✗ Custom domain</li>
      <li contenteditable="true" style="font-size:13px;color:#94a3b8;font-family:sans-serif;padding-left:20px;">✗ Analytics</li>
    </ul>
    <a href="#" contenteditable="true" style="display:block;text-align:center;border:1px solid #16a34a;color:#16a34a;padding:11px;border-radius:8px;text-decoration:none;font-family:sans-serif;font-weight:600;font-size:13px;">Get Started</a>
  </div>
  <div style="flex:1;background:#16a34a;border-radius:16px;padding:28px;position:relative;box-shadow:0 8px 24px rgba(22,163,74,0.3);">
    <div style="position:absolute;top:-10px;left:50%;transform:translateX(-50%);background:#f59e0b;color:#fff;font-size:10px;font-weight:700;font-family:sans-serif;padding:4px 12px;border-radius:20px;letter-spacing:.06em;">MOST POPULAR</div>
    <h3 contenteditable="true" style="font-size:14px;font-weight:600;font-family:sans-serif;color:#d1fae5;margin:0 0 8px;text-transform:uppercase;letter-spacing:.06em;">Pro</h3>
    <div style="margin-bottom:20px;"><span contenteditable="true" style="font-size:36px;font-weight:700;font-family:sans-serif;color:#fff;">$29</span><span contenteditable="true" style="font-size:14px;color:#a7f3d0;font-family:sans-serif;">/mo</span></div>
    <ul style="list-style:none;padding:0;margin:0 0 24px;display:flex;flex-direction:column;gap:10px;">
      <li contenteditable="true" style="font-size:13px;color:#fff;font-family:sans-serif;padding-left:20px;">✓ Unlimited projects</li>
      <li contenteditable="true" style="font-size:13px;color:#fff;font-family:sans-serif;padding-left:20px;">✓ 100 GB storage</li>
      <li contenteditable="true" style="font-size:13px;color:#fff;font-family:sans-serif;padding-left:20px;">✓ Priority support</li>
      <li contenteditable="true" style="font-size:13px;color:#fff;font-family:sans-serif;padding-left:20px;">✓ Custom domain</li>
      <li contenteditable="true" style="font-size:13px;color:#a7f3d0;font-family:sans-serif;padding-left:20px;">✗ Team collaboration</li>
    </ul>
    <a href="#" contenteditable="true" style="display:block;text-align:center;background:#fff;color:#16a34a;padding:11px;border-radius:8px;text-decoration:none;font-family:sans-serif;font-weight:700;font-size:13px;">Start Free Trial</a>
  </div>
  <div style="flex:1;background:#fff;border-radius:16px;padding:28px;border:1px solid #d1fae5;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
    <h3 contenteditable="true" style="font-size:14px;font-weight:600;font-family:sans-serif;color:#15803d;margin:0 0 8px;text-transform:uppercase;letter-spacing:.06em;">Enterprise</h3>
    <div style="margin-bottom:20px;"><span contenteditable="true" style="font-size:36px;font-weight:700;font-family:sans-serif;color:#0f172a;">$99</span><span contenteditable="true" style="font-size:14px;color:#64748b;font-family:sans-serif;">/mo</span></div>
    <ul style="list-style:none;padding:0;margin:0 0 24px;display:flex;flex-direction:column;gap:10px;">
      <li contenteditable="true" style="font-size:13px;color:#374151;font-family:sans-serif;padding-left:20px;">✓ Everything in Pro</li>
      <li contenteditable="true" style="font-size:13px;color:#374151;font-family:sans-serif;padding-left:20px;">✓ 1 TB storage</li>
      <li contenteditable="true" style="font-size:13px;color:#374151;font-family:sans-serif;padding-left:20px;">✓ Dedicated support</li>
      <li contenteditable="true" style="font-size:13px;color:#374151;font-family:sans-serif;padding-left:20px;">✓ Custom domain</li>
      <li contenteditable="true" style="font-size:13px;color:#374151;font-family:sans-serif;padding-left:20px;">✓ Team collaboration</li>
    </ul>
    <a href="#" contenteditable="true" style="display:block;text-align:center;border:1px solid #16a34a;color:#16a34a;padding:11px;border-radius:8px;text-decoration:none;font-family:sans-serif;font-weight:600;font-size:13px;">Contact Sales</a>
  </div>
</section>`,
  },

  // ── 10. Event Page ──────────────────────────────────────────────────────────
  {
    name: "Event Page",
    category: "Other",
    description: "Event landing page with details, speakers, and RSVP",
    preview: "linear-gradient(135deg, #f97316 40%, #0f172a 40%)",
    html: `<section class="draggable-item" style="position:absolute;left:0;top:0;width:900px;background:linear-gradient(135deg,#f97316,#ea580c);padding:64px 60px 52px;box-sizing:border-box;position:relative;">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:24px;">
    <div>
      <p contenteditable="true" style="color:#fed7aa;font-size:13px;font-weight:600;font-family:sans-serif;margin:0 0 12px;text-transform:uppercase;letter-spacing:.1em;">📅 May 15, 2025 · San Francisco, CA</p>
      <h1 contenteditable="true" style="color:#fff;font-size:44px;font-weight:800;font-family:sans-serif;margin:0 0 16px;line-height:1.15;max-width:520px;">Design Summit 2025</h1>
      <p contenteditable="true" style="color:#fed7aa;font-size:16px;font-family:sans-serif;line-height:1.6;max-width:480px;margin:0 0 32px;">A full-day conference bringing together the world&apos;s best designers, developers, and product thinkers under one roof.</p>
      <a href="#" contenteditable="true" style="display:inline-block;background:#fff;color:#ea580c;padding:14px 36px;border-radius:8px;text-decoration:none;font-family:sans-serif;font-weight:700;font-size:15px;margin-right:12px;">Reserve Your Seat →</a>
    </div>
    <div style="background:rgba(0,0,0,0.2);border-radius:16px;padding:24px 28px;min-width:200px;">
      <p contenteditable="true" style="color:#fed7aa;font-size:12px;font-family:sans-serif;margin:0 0 6px;text-transform:uppercase;letter-spacing:.06em;">Tickets from</p>
      <p contenteditable="true" style="color:#fff;font-size:36px;font-weight:800;font-family:sans-serif;margin:0 0 4px;">$149</p>
      <p contenteditable="true" style="color:#fed7aa;font-size:13px;font-family:sans-serif;margin:0 0 16px;">Early bird ends Apr 30</p>
      <div style="height:1px;background:rgba(255,255,255,0.2);margin-bottom:16px;"></div>
      <p contenteditable="true" style="color:#fff;font-size:13px;font-family:sans-serif;margin:0;">🎟 500 seats only</p>
    </div>
  </div>
</section>
<section class="draggable-item" style="position:absolute;left:0;top:320px;width:900px;background:#fff;padding:48px 60px;box-sizing:border-box;">
  <h2 contenteditable="true" style="font-size:22px;font-weight:700;color:#0f172a;font-family:sans-serif;margin:0 0 28px;">Event Highlights</h2>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
    <div style="display:flex;gap:16px;align-items:flex-start;background:#fff7ed;border-radius:12px;padding:20px;">
      <span style="font-size:28px;">🎤</span>
      <div><h3 contenteditable="true" style="font-size:14px;font-weight:700;font-family:sans-serif;color:#1e293b;margin:0 0 6px;">20+ Speakers</h3><p contenteditable="true" style="font-size:13px;color:#64748b;font-family:sans-serif;margin:0;line-height:1.5;">Industry leaders sharing insights and inspiration from the front lines of design.</p></div>
    </div>
    <div style="display:flex;gap:16px;align-items:flex-start;background:#fff7ed;border-radius:12px;padding:20px;">
      <span style="font-size:28px;">🛠</span>
      <div><h3 contenteditable="true" style="font-size:14px;font-weight:700;font-family:sans-serif;color:#1e293b;margin:0 0 6px;">Hands-On Workshops</h3><p contenteditable="true" style="font-size:13px;color:#64748b;font-family:sans-serif;margin:0;line-height:1.5;">Deep-dive sessions where you build real skills with expert practitioners.</p></div>
    </div>
    <div style="display:flex;gap:16px;align-items:flex-start;background:#fff7ed;border-radius:12px;padding:20px;">
      <span style="font-size:28px;">🤝</span>
      <div><h3 contenteditable="true" style="font-size:14px;font-weight:700;font-family:sans-serif;color:#1e293b;margin:0 0 6px;">Networking Events</h3><p contenteditable="true" style="font-size:13px;color:#64748b;font-family:sans-serif;margin:0;line-height:1.5;">Connect with 500 creatives at our evening mixer and curated roundtables.</p></div>
    </div>
    <div style="display:flex;gap:16px;align-items:flex-start;background:#fff7ed;border-radius:12px;padding:20px;">
      <span style="font-size:28px;">🎁</span>
      <div><h3 contenteditable="true" style="font-size:14px;font-weight:700;font-family:sans-serif;color:#1e293b;margin:0 0 6px;">Swag &amp; Surprises</h3><p contenteditable="true" style="font-size:13px;color:#64748b;font-family:sans-serif;margin:0;line-height:1.5;">Exclusive merch, giveaways, and a few special announcements you won&apos;t want to miss.</p></div>
    </div>
  </div>
</section>
<section class="draggable-item" style="position:absolute;left:0;top:640px;width:900px;background:#0f172a;padding:52px 60px;text-align:center;box-sizing:border-box;">
  <h2 contenteditable="true" style="color:#fff;font-size:28px;font-weight:700;font-family:sans-serif;margin:0 0 12px;">Don&apos;t miss your chance.</h2>
  <p contenteditable="true" style="color:#94a3b8;font-size:15px;font-family:sans-serif;margin:0 0 28px;">Early bird tickets are going fast. Secure yours today.</p>
  <a href="#" contenteditable="true" style="display:inline-block;background:#f97316;color:#fff;padding:16px 44px;border-radius:8px;text-decoration:none;font-family:sans-serif;font-weight:700;font-size:16px;">Get Tickets Now</a>
</section>`,
  },

];

// ── State ─────────────────────────────────────────────────────────────────────

let _activeCategory = "All";

// ── Public API ────────────────────────────────────────────────────────────────

export function initTemplateGallery() {
  const modal   = document.getElementById("templateGalleryModal");
  const openBtn = document.getElementById("templateGalleryBtn");
  const closeBtn = document.getElementById("tgCloseBtn");

  openBtn?.addEventListener("click", openTemplateGallery);
  closeBtn?.addEventListener("click", closeTemplateGallery);

  modal?.addEventListener("click", e => {
    if (e.target === modal) closeTemplateGallery();
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && modal && !modal.classList.contains("hidden")) {
      closeTemplateGallery();
    }
  });

  // Category tabs
  document.getElementById("tgCatTabs")?.addEventListener("click", e => {
    const tab = e.target.closest(".tg-cat-tab");
    if (!tab) return;
    document.querySelectorAll(".tg-cat-tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    _activeCategory = tab.dataset.cat;
    _renderList(_activeCategory);
  });
}

export function openTemplateGallery() {
  const modal = document.getElementById("templateGalleryModal");
  if (!modal) return;
  modal.classList.add("open");
  _activeCategory = "All";
  document.querySelectorAll(".tg-cat-tab").forEach(t => {
    t.classList.toggle("active", t.dataset.cat === "All");
  });
  _renderList("All");
}

function closeTemplateGallery() {
  document.getElementById("templateGalleryModal")?.classList.remove("open");
}

// ── Rendering ─────────────────────────────────────────────────────────────────

function _renderList(category) {
  const grid = document.getElementById("tgGrid");
  if (!grid) return;

  const list = category === "All"
    ? PAGE_TEMPLATES
    : PAGE_TEMPLATES.filter(t => t.category === category);

  grid.innerHTML = list.map((t, i) => {
    const globalIdx = PAGE_TEMPLATES.indexOf(t);
    return `<div class="tg-card" data-index="${globalIdx}">
      <div class="tg-card-preview" style="background:${t.preview};"></div>
      <div class="tg-card-info">
        <div class="tg-card-name">${t.name}</div>
        <div class="tg-card-desc">${t.description}</div>
        <div class="tg-card-footer">
          <span class="tg-cat-badge">${t.category}</span>
          <button class="tg-use-btn" data-index="${globalIdx}">Use Template</button>
        </div>
      </div>
    </div>`;
  }).join("");

  grid.querySelectorAll(".tg-use-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      _applyTemplate(PAGE_TEMPLATES[parseInt(btn.dataset.index)]);
    });
  });

  grid.querySelectorAll(".tg-card").forEach(card => {
    card.addEventListener("click", () => {
      _applyTemplate(PAGE_TEMPLATES[parseInt(card.dataset.index)]);
    });
  });
}

// ── Insertion ─────────────────────────────────────────────────────────────────

function _applyTemplate(template) {
  const current = elements.htmlInput.value.trim();
  if (current && !confirm(`This will replace the current page with "${template.name}". Continue?`)) return;

  elements.htmlInput.value = template.html;
  renderPreview();
  scheduleSnapshot();
  scheduleAutosave();
  closeTemplateGallery();
}
