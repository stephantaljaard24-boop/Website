# Building a Professional Consulting Website with an AI Digital Twin
### A Beginner's Guide — from a Blank File to a Live, AI-Powered Website

---

## Table of Contents

1. [What We Built](#1-what-we-built)
2. [Technology Summary](#2-technology-summary)
3. [High-Level Walkthrough](#3-high-level-walkthrough)
4. [Detailed Code Review](#4-detailed-code-review)
   - 4.1 [HTML Structure](#41-html-structure)
   - 4.2 [CSS — Styling and Design System](#42-css--styling-and-design-system)
   - 4.3 [CSS — Layout Techniques](#43-css--layout-techniques)
   - 4.4 [CSS — Animations and Visual Effects](#44-css--animations-and-visual-effects)
   - 4.5 [JavaScript — The Canvas Animation](#45-javascript--the-canvas-animation)
   - 4.6 [JavaScript — Page Interactivity](#46-javascript--page-interactivity)
   - 4.7 [JavaScript — The Digital Twin Chat Widget](#47-javascript--the-digital-twin-chat-widget)
   - 4.8 [The Proxy Server (proxy.js)](#48-the-proxy-server-proxyjs)
   - 4.9 [Nginx — Web Server and Reverse Proxy](#49-nginx--web-server-and-reverse-proxy)
5. [Deployment on AWS EC2](#5-deployment-on-aws-ec2)
6. [5 Suggestions for Improvement](#6-5-suggestions-for-improvement)

---

## 1. What We Built

We built a **single-page professional consulting website** for Stephan Taljaard, a Contact Centre & AI Solutions Architect. The final product includes:

- A **sticky navigation bar** that changes appearance on scroll and collapses to a hamburger menu on mobile
- A **hero section** with an animated, interactive node-graph background drawn on an HTML canvas
- A **services grid** listing consulting offerings
- A **featured projects** portfolio with card layouts
- A **career timeline** showing professional history
- An **about section** with a technology stack grid and certifications list
- A **contact section** with LinkedIn and email CTAs
- A **Digital Twin AI chat widget** — a floating button that opens a chat panel, where visitors can ask an AI questions about Stephan's career

The whole frontend is a **single HTML file** (`index.html`) containing HTML, CSS, and JavaScript together. The AI backend is a separate **Node.js proxy server** (`proxy.js`) that runs on the web server and keeps the API key secret.

---

## 2. Technology Summary

### HTML (HyperText Markup Language)
HTML is the skeleton of every web page. It describes **what** is on the page using *tags* — labels wrapped in angle brackets like `<h1>`, `<p>`, `<div>`. Everything the user sees — headings, paragraphs, buttons, images — is an HTML element.

```html
<!-- A heading tag -->
<h1>Stephan Taljaard</h1>

<!-- A paragraph tag -->
<p>Contact Centre & AI Solutions Architect</p>

<!-- A link (anchor) tag -->
<a href="https://linkedin.com/in/stephantaljaard" target="_blank">LinkedIn</a>
```

### CSS (Cascading Style Sheets)
CSS controls **how** elements look — colours, fonts, spacing, layout, animations. "Cascading" means styles flow down and inherit from parent elements. CSS is written as rules with a *selector* (what to style) and *declarations* (how to style it).

```css
/* Select all h1 elements and make them large and white */
h1 {
  font-size: 4rem;
  color: white;
}

/* Select elements with class "card" */
.card {
  background: #0F1A30;
  border-radius: 12px;
  padding: 2rem;
}
```

### JavaScript
JavaScript makes pages **interactive and dynamic**. It runs in the browser and can react to user actions (clicks, typing, scrolling), update page content, and communicate with external services.

```javascript
// When the user clicks a button, show an alert
document.getElementById('my-button').addEventListener('click', function() {
  alert('Button clicked!');
});
```

### Node.js
Node.js lets you run JavaScript **on a server** (not just in a browser). We use it to run a small proxy server (`proxy.js`) that sits between the browser and the OpenRouter AI API — keeping the secret API key safe on the server.

### Nginx
Nginx (pronounced "engine-x") is a **web server** — software that listens for browser requests and responds with files. It serves our `index.html` to visitors and also forwards `/api/` requests to our Node.js proxy.

### AWS EC2
Amazon Web Services EC2 (Elastic Compute Cloud) provides a **virtual computer in the cloud** — our server that runs 24/7, accessible at a public IP address. We installed Amazon Linux, nginx, and Node.js on it.

### OpenRouter API
OpenRouter is a service that provides access to AI language models (like GPT) via a simple API. We send it a conversation (a list of messages) and it replies with an AI-generated response. We use the model `openai/gpt-oss-120b`.

### Git
Git is a **version control system** — it tracks every change made to files so you can see history, revert mistakes, and collaborate. We used it to save changes with `git commit` and push them to GitHub with `git push`.

---

## 3. High-Level Walkthrough

Here is the journey from blank file to live website, broken into stages:

```
Stage 1: Structure      → Write the HTML skeleton (sections, headings, text)
Stage 2: Styling        → Write CSS to make it look professional
Stage 3: Animation      → Add JavaScript for the canvas and scroll effects
Stage 4: Content        → Fill in real career information
Stage 5: AI Chat        → Build the Digital Twin widget + proxy server
Stage 6: Deployment     → Upload to EC2, configure nginx
```

### Stage 1 — HTML Structure
We created one HTML file divided into semantic sections:

```
<nav>      ← Navigation bar at the top
<section id="hero">     ← Name, tagline, CTA buttons
<section id="services"> ← Services card grid
<section id="projects"> ← Portfolio card grid
<section id="journey">  ← Career timeline
<section id="about">    ← Bio, tech stack, certifications
<section id="contact">  ← LinkedIn, email, location
<footer>   ← Copyright line
```

Each section has a unique `id` attribute so the navigation links can scroll directly to it using `href="#services"` etc.

### Stage 2 — CSS Styling
We defined a **design system** using CSS custom properties (variables) at the top, then wrote styles for every component. Key decisions:

- Dark navy background (`#0A0F1E`) for a premium, technical feel
- Electric teal (`#00C9B1`) as the primary accent colour
- Warm amber (`#F5A623`) as a secondary highlight
- Space Grotesk for headings, JetBrains Mono for technical labels
- CSS Grid and Flexbox for responsive layouts

### Stage 3 — JavaScript Animation
We added three JavaScript features:
1. A **canvas node-graph** in the hero that animates floating dots connected by lines, reacting to mouse movement
2. **Scroll effects** — the nav bar gains a blur/background when you scroll down
3. **Scroll reveal** — sections and cards fade up into view as you scroll to them

### Stage 4 — Content
We replaced placeholder text with real content from the LinkedIn PDF:
- Rewrote the About bio paragraph by paragraph
- Added the real career timeline (EmbedIT, Altron/MultiChoice, Bytes Connect, CTU)
- Replaced all 6 placeholder project cards with 4 real projects
- Updated all 10 certifications from Credly/LinkedIn badges
- Filled in real stats (15+ years, 50+ projects, 21 countries)

### Stage 5 — Digital Twin
We added two components:
- **Chat widget** in `index.html` — a floating button and slide-up panel with a conversation UI
- **Proxy server** in `proxy.js` — a Node.js HTTP server that receives chat messages from the browser, adds a system prompt describing Stephan's career, and forwards everything to OpenRouter

The API key lives only in a `.env` file on the server — it never appears in the HTML that browsers download.

### Stage 6 — Deployment
1. Launched an Amazon Linux EC2 instance
2. Installed nginx (web server) and Node.js
3. Uploaded `index.html`, `proxy.js`, and `.env` via `scp`
4. Started the proxy server with PM2 (a process manager that keeps Node.js running)
5. Configured nginx to serve `index.html` and forward `/api/` to the Node proxy
6. Fixed Windows file permissions on the `.pem` key file using `icacls`

---

## 4. Detailed Code Review

### 4.1 HTML Structure

#### The Document Shell
Every HTML file starts with this standard opening:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Stephan Taljaard — Contact Centre & AI Solutions Architect</title>
</head>
<body>
  <!-- All visible content goes here -->
</body>
</html>
```

- `<!DOCTYPE html>` — tells the browser this is modern HTML5
- `<head>` — contains metadata (not visible to users) — title, fonts, styles
- `<meta charset="UTF-8">` — enables all characters including special symbols
- `<meta name="viewport" ...>` — makes the page scale correctly on mobile phones
- `<body>` — everything the user actually sees

#### Semantic HTML
We use meaningful tags that describe the *purpose* of content, not just its appearance. This helps screen readers, search engines, and other developers understand the page:

```html
<nav>       ← Navigation links (not just a div!)
<section>   ← A thematic grouping of content
<article>   ← A self-contained piece of content (e.g. a project card)
<footer>    ← Bottom of the page metadata
<h1>, <h2>, <h3>  ← Headings in order of importance
```

#### Accessibility Attributes
We added ARIA (Accessible Rich Internet Applications) attributes so screen readers and keyboard users can use the site:

```html
<!-- aria-label describes what the element does -->
<nav aria-label="Main navigation">

<!-- aria-labelledby links a section to its heading -->
<section id="services" aria-labelledby="services-title">
  <h2 id="services-title">Services & Expertise</h2>

<!-- aria-hidden hides decorative elements from screen readers -->
<canvas id="hero-canvas" aria-hidden="true"></canvas>

<!-- aria-expanded tells screen readers if a menu is open or closed -->
<button aria-expanded="false" aria-controls="mobile-menu">
```

#### Google Fonts via CDN
We load fonts from Google's servers (a CDN — Content Delivery Network) rather than hosting them ourselves:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
```

`preconnect` tells the browser to open a connection to Google's font servers early, before it actually needs the files — this speeds up loading. `display=swap` means the browser shows a fallback font immediately and swaps to the custom font when it loads, preventing invisible text.

---

### 4.2 CSS — Styling and Design System

#### CSS Custom Properties (Variables)
Instead of typing the same colour code dozens of times, we define variables once at the top and reuse them everywhere. If we ever change the teal colour, we change it in one place:

```css
:root {
  --navy:    #0A0F1E;   /* Main background */
  --navy-2:  #0D1529;   /* Slightly lighter background for alternating sections */
  --teal:    #00C9B1;   /* Primary accent colour */
  --amber:   #F5A623;   /* Secondary highlight colour */
  --white:   #F0F4FF;   /* Text colour (slightly blue-white, easier on eyes) */
  --grey:    #8A96B4;   /* Subdued text colour */
  --card-bg: #0F1A30;   /* Background for cards */
  --border:  rgba(0,201,177,0.15); /* Subtle teal border */
  --radius:  12px;      /* Rounded corner size used on all cards */
  --transition: 0.25s ease; /* Animation speed used throughout */
  --font-head: 'Space Grotesk', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

To use a variable, write `var(--variable-name)`:

```css
.service-card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}
```

#### The Button System
We created reusable button styles using multiple classes together:

```css
/* Base styles every button shares */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

/* Solid teal button */
.btn-primary {
  background: var(--teal);
  color: var(--navy);
}
.btn-primary:hover {
  background: #00e8cc;
  transform: translateY(-2px);  /* Lifts up 2px on hover */
  box-shadow: 0 8px 24px rgba(0,201,177,0.35);  /* Glow shadow */
}

/* Transparent button with border */
.btn-outline {
  background: transparent;
  color: var(--white);
  border: 1.5px solid rgba(240,244,255,0.3);
}
.btn-outline:hover {
  border-color: var(--teal);
  color: var(--teal);
}
```

In HTML we combine them: `<a class="btn btn-primary">`. The browser applies both sets of styles.

#### Responsive Units
We use several unit types for different purposes:

```css
/* rem = relative to root font size (16px by default)
   Good for font sizes and spacing — scales with user's browser settings */
font-size: 1.5rem;   /* = 24px */
padding: 2rem;       /* = 32px */

/* vw = viewport width — percentage of screen width
   Good for things that should scale with screen size */
font-size: 5vw;      /* 5% of screen width */

/* clamp(min, preferred, max) — picks preferred but never goes below min or above max
   Perfect for text that should be big on desktop, readable on mobile */
font-size: clamp(2.8rem, 7vw, 5.5rem);
/* Minimum: 2.8rem | Scales with viewport | Maximum: 5.5rem */
```

---

### 4.3 CSS — Layout Techniques

#### Flexbox
Flexbox arranges items in a **row or column** and handles alignment. It is ideal for navigation bars, button groups, and any single-direction layout:

```css
/* The navigation bar inner row */
.nav-inner {
  display: flex;           /* Turn on flexbox */
  align-items: center;     /* Vertically centre all children */
  justify-content: space-between; /* Push logo left, links right */
  height: 68px;
}

/* A row of buttons */
.hero-actions {
  display: flex;
  flex-wrap: wrap;  /* Wrap to next line if screen is too narrow */
  gap: 1rem;        /* Space between buttons */
}
```

#### CSS Grid
Grid arranges items in **rows AND columns** simultaneously. It is ideal for card layouts:

```css
/* Services grid — automatically fills columns */
.services-grid {
  display: grid;
  /* auto-fill: create as many columns as fit
     minmax(300px, 1fr): each column is at least 300px, at most equal share */
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;  /* Space between cards */
}

/* About section — two equal columns */
.about-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;  /* Two equal columns */
  gap: 4rem;
}
```

#### The Career Timeline Grid
The timeline uses a 3-column grid: content | node | content, where only one side has content per row:

```css
.timeline-entry {
  display: grid;
  grid-template-columns: 1fr 36px 1fr;  /* Wide | Narrow centre | Wide */
  gap: 0 2rem;
}
```

For `right` entries, content goes in the third column (right side). For `left` entries, content goes in the first column (left side) — giving the alternating effect.

#### Media Queries — Responsive Design
Media queries apply different styles depending on screen size:

```css
/* Default styles apply to all screens (mobile-first approach) */
.about-grid {
  grid-template-columns: 1fr;  /* Single column on small screens */
}

/* When screen is wider than 860px, switch to two columns */
@media (min-width: 860px) {
  .about-grid {
    grid-template-columns: 1fr 1fr;
  }
}

/* Hide desktop nav on small screens, show hamburger */
@media (max-width: 768px) {
  .nav-links, .nav-cta { display: none; }
  .hamburger { display: flex; }
}
```

#### The Sticky Navigation
`position: fixed` takes an element out of the normal page flow and pins it to the viewport (the visible browser window):

```css
#nav {
  position: fixed;
  top: 0;      /* Pin to the top */
  left: 0;
  right: 0;    /* Stretch edge to edge */
  z-index: 100; /* Sit on top of all other content */
}
```

The teal/blur background is added by JavaScript when you scroll, by toggling the `scrolled` CSS class:

```css
#nav.scrolled {
  background: rgba(10,15,30,0.92);  /* Semi-transparent navy */
  backdrop-filter: blur(12px);       /* Blur whatever is behind the nav */
  box-shadow: 0 1px 0 var(--border);
}
```

---

### 4.4 CSS — Animations and Visual Effects

#### CSS Transitions
Transitions make property changes animate smoothly instead of jumping instantly:

```css
.service-card {
  /* When any of these properties change, animate over 0.25s */
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}

.service-card:hover {
  transform: translateY(-5px);  /* Move up 5px — the "lift" effect */
  border-color: rgba(0,201,177,0.4);
}
```

The browser smoothly animates the card from its resting state to the hover state and back.

#### CSS Keyframe Animations
For looping or more complex animations, we use `@keyframes` — a sequence of states the animation moves through:

```css
/* Define the animation: a bouncing movement */
@keyframes bounce {
  0%   { transform: translateX(-50%) translateY(0); }   /* Start position */
  50%  { transform: translateX(-50%) translateY(6px); } /* Move down 6px */
  100% { transform: translateX(-50%) translateY(0); }   /* Return to start */
}

/* Apply to the scroll indicator arrow */
.hero-scroll {
  animation: bounce 2s infinite; /* Name | Duration | Repeat forever */
}
```

#### The Typing Cursor
The blinking cursor on the hero is pure CSS:

```css
.type-cursor {
  display: inline-block;
  width: 3px;
  height: 0.85em;
  background: var(--teal);
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }  /* Visible */
  50%       { opacity: 0; } /* Invisible — creates the blink */
}
```

`step-end` makes the animation jump instantly (no smooth fade) — which is how a real cursor blinks.

#### Card Accent Line
The sweep of colour across the top of cards on hover uses a pseudo-element (`::before`) — a decorative element that exists in CSS but not in the HTML:

```css
.service-card::before {
  content: '';           /* Required — even if empty */
  position: absolute;
  top: 0;
  left: -100%;          /* Start off-screen to the left */
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--teal), var(--amber), transparent);
  opacity: 0;
  transition: opacity 0.4s ease, left 0.4s ease;
}

.service-card:hover::before {
  opacity: 1;
  left: 0;  /* Slide in from left to right */
}
```

#### Gradient Text
We can make text display as a gradient by clipping a background image to the text shape:

```css
.section-title.gradient {
  background: linear-gradient(135deg, var(--white) 30%, var(--teal) 100%);
  -webkit-background-clip: text;  /* Clip the gradient to text shape */
  -webkit-text-fill-color: transparent; /* Make the text itself transparent */
  background-clip: text;
}
```

The gradient shows through the transparent text — giving the white-to-teal effect.

#### Reduced Motion
Some users have a system setting to reduce animations (due to motion sensitivity). We respect this:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
  canvas { display: none !important; }
}
```

This is important for accessibility — it disables all animations and hides the canvas entirely for users who need it.

---

### 4.5 JavaScript — The Canvas Animation

The animated node-graph in the hero section is drawn on an HTML `<canvas>` element — a blank rectangle you can draw shapes, lines, and text on using JavaScript.

#### Setting Up the Canvas

```javascript
const canvas = document.getElementById('hero-canvas');
const ctx = canvas.getContext('2d');  // Get the "drawing tool" (2D context)
```

`ctx` is our drawing tool. Everything we draw calls methods on this object.

#### Creating the Nodes
We create an array of 55 node objects. Each node has a position (`x`, `y`), velocity (`vx`, `vy`), size (`r`), and a random chance of being amber-coloured:

```javascript
const NODE_COUNT = 55;

function initNodes() {
  nodes = Array.from({ length: NODE_COUNT }, () => ({
    x:     Math.random() * W,           // Random horizontal position
    y:     Math.random() * H,           // Random vertical position
    vx:    (Math.random() - 0.5) * 0.35, // Random horizontal speed (-0.175 to +0.175)
    vy:    (Math.random() - 0.5) * 0.35, // Random vertical speed
    r:     Math.random() * 1.8 + 0.8,    // Random radius (0.8 to 2.6px)
    amber: Math.random() < 0.12          // 12% chance of being amber
  }));
}
```

#### The Animation Loop
The browser provides `requestAnimationFrame` — a function that calls our drawing function ~60 times per second, creating smooth animation:

```javascript
function draw() {
  ctx.clearRect(0, 0, W, H);  // Wipe the canvas clean each frame

  // Move each node
  nodes.forEach(n => {
    n.x += n.vx;  // Apply horizontal velocity
    n.y += n.vy;  // Apply vertical velocity

    // Bounce off edges — reverse direction when hitting a wall
    if (n.x < 0 || n.x > W) n.vx *= -1;
    if (n.y < 0 || n.y > H) n.vy *= -1;
  });

  // Draw connecting lines between nearby nodes
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      const dx   = a.x - b.x;
      const dy   = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);  // Pythagoras: distance formula

      if (dist < 160) {  // Only draw lines if nodes are within 160px
        // Closer = more opaque. At dist=0, alpha=0.25. At dist=160, alpha=0
        const alpha = (1 - dist / 160) * 0.25;
        ctx.strokeStyle = `rgba(0,201,177,${alpha})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  // Draw each node as a filled circle
  nodes.forEach(n => {
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);  // x, y, radius, start angle, end angle
    ctx.fillStyle = `rgba(0,201,177,0.45)`;
    ctx.fill();
  });

  requestAnimationFrame(draw);  // Schedule the next frame
}
```

#### Mouse Interaction
We track the mouse position and use it to make nearby nodes brighter:

```javascript
let mouseX = 0, mouseY = 0;

canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;  // Mouse X relative to canvas
  mouseY = e.clientY - rect.top;
});

// In the draw function, when drawing each node:
const dx   = n.x - mouseX;
const dy   = n.y - mouseY;
const dist = Math.sqrt(dx * dx + dy * dy);
const glow = dist < 100 ? 0.9 : 0.45;  // Bright if within 100px, dim otherwise
```

---

### 4.6 JavaScript — Page Interactivity

#### Sticky Nav on Scroll
We listen for scroll events and toggle a CSS class on the nav element:

```javascript
const nav = document.getElementById('nav');

const onScroll = () => {
  // classList.toggle(class, condition)
  // Adds 'scrolled' if scrollY > 20, removes it otherwise
  nav.classList.toggle('scrolled', window.scrollY > 20);
};

// passive: true is a performance hint — tells the browser this won't prevent scrolling
window.addEventListener('scroll', onScroll, { passive: true });
```

#### Active Navigation Link
We use `IntersectionObserver` — a browser API that fires a callback when elements enter or leave the visible viewport. We observe every section and highlight the matching nav link:

```javascript
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {  // This section is visible
      navLinks.forEach(link => {
        // Compare the link's href (#services) with the section's id (services)
        link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
      });
    }
  });
}, {
  rootMargin: '-40% 0px -55% 0px'  // Only trigger when section is near the middle of the screen
});

sections.forEach(s => observer.observe(s));
```

#### Hamburger Menu
The mobile hamburger button toggles the mobile menu open and closed:

```javascript
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.getElementById('mobile-menu');

hamburger.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');  // Toggle returns true if class was added
  hamburger.setAttribute('aria-expanded', isOpen);     // Update for screen readers
});

// Close the menu when any link inside it is clicked
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});
```

#### Scroll Reveal Animation
Elements with the class `reveal` start invisible and slide up into view when scrolled into viewport. We use another `IntersectionObserver`:

```javascript
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');    // Trigger the CSS animation
      revealObserver.unobserve(entry.target);   // Stop watching — only animate once
    }
  });
}, { threshold: 0.12 });  // Trigger when 12% of the element is visible

revealElements.forEach(el => revealObserver.observe(el));
```

The CSS for `reveal` starts hidden and transitions to visible:

```css
.reveal {
  opacity: 0;
  transform: translateY(28px);  /* Start 28px below final position */
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.reveal.visible {
  opacity: 1;
  transform: none;  /* Return to normal position */
}
```

---

### 4.7 JavaScript — The Digital Twin Chat Widget

#### State and References
We grab references to all the DOM elements we need and set up two pieces of state:

```javascript
const btn      = document.getElementById('dt-btn');      // Floating button
const panel    = document.getElementById('dt-panel');    // Chat panel
const messages = document.getElementById('dt-messages'); // Messages container
const input    = document.getElementById('dt-input');    // Text input
const send     = document.getElementById('dt-send');     // Send button
const typing   = document.getElementById('dt-typing');   // Typing indicator

let history = [];    // Array of all messages sent and received
let busy    = false; // Prevents sending while waiting for a reply
```

#### Opening and Closing
```javascript
function openPanel()  {
  panel.classList.add('open');                    // CSS makes it visible
  btn.setAttribute('aria-expanded', 'true');      // Accessibility update
  input.focus();                                  // Move keyboard cursor to input
}

function closePanel() {
  panel.classList.remove('open');
  btn.setAttribute('aria-expanded', 'false');
}

// Toggle on button click
btn.addEventListener('click', () => {
  panel.classList.contains('open') ? closePanel() : openPanel();
});

// Close with Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && panel.classList.contains('open')) closePanel();
});
```

#### Adding Messages to the Screen
```javascript
function appendMessage(role, text) {
  // Create the outer wrapper div
  const wrap = document.createElement('div');
  wrap.className = 'dt-msg ' + (role === 'user' ? 'user' : 'ai');

  // Create the text bubble
  const bubble = document.createElement('div');
  bubble.className = 'dt-bubble';
  bubble.textContent = text;  // textContent is safe — won't execute HTML as code

  // Create the timestamp
  const time = document.createElement('div');
  time.className = 'dt-msg-time';
  const d = new Date();
  time.textContent = d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');

  wrap.appendChild(bubble);
  wrap.appendChild(time);
  messages.appendChild(wrap);

  // Scroll the messages container to the bottom so the new message is visible
  messages.scrollTop = messages.scrollHeight;
}
```

#### Calling the AI — The fetch API
`fetch` is a browser function that makes HTTP requests (like a browser loading a page, but from JavaScript code):

```javascript
async function sendMessage() {
  const text = input.value.trim();
  if (!text || busy) return;  // Don't send empty messages or while waiting

  input.value = '';           // Clear the input
  appendMessage('user', text);
  history.push({ role: 'user', content: text });  // Add to conversation history

  busy = true;
  send.disabled = true;       // Disable button while waiting
  typing.classList.add('show'); // Show the animated dots

  try {
    // Send POST request to our proxy server
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history })  // Send full conversation history
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.error || 'Server error');

    // Extract the AI's reply from the response structure
    const reply = data.choices[0].message.content;
    history.push({ role: 'assistant', content: reply });

    typing.classList.remove('show');
    appendMessage('ai', reply);

  } catch (error) {
    typing.classList.remove('show');
    appendMessage('ai', 'Something went wrong — ' + error.message);
  } finally {
    // Always runs, success or failure
    busy = false;
    send.disabled = false;
    input.focus();
  }
}
```

`async/await` is modern JavaScript syntax for handling operations that take time (like network requests). `await` pauses the function until the network request completes, without freezing the browser.

---

### 4.8 The Proxy Server (proxy.js)

The proxy server is a Node.js script that runs on the EC2 instance. Its job is to receive chat requests from the browser and forward them to OpenRouter — keeping the API key secret.

#### Why a Proxy?
If we put the API key directly in `index.html`, anyone could:
1. Open the browser developer tools
2. View the page source
3. Copy the API key and use it themselves (costing you money)

The proxy server keeps the key in a `.env` file on the server — never sent to browsers.

#### Loading the .env File
```javascript
const fs   = require('fs');    // File system — built into Node.js
const path = require('path');  // Path utilities — built into Node.js

// Read the .env file and parse KEY=VALUE pairs
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [key, ...valueParts] = line.trim().split('=');
    if (key && valueParts.length) {
      process.env[key] = valueParts.join('=');  // Set as environment variable
    }
  });
}

const API_KEY = process.env.OPENROUTER_API_KEY;
```

#### The System Prompt
The system prompt is the secret instruction we give the AI before every conversation. It defines who the AI is pretending to be and what facts it knows:

```javascript
const SYSTEM_PROMPT = `You are the Digital Twin of Stephan Taljaard...
[Full career history, certifications, personality rules]`;
```

We prepend this to every conversation sent to OpenRouter:

```javascript
const messages = [
  { role: 'system', content: SYSTEM_PROMPT }, // Always first
  ...userMessages                              // Then the actual conversation
];
```

#### Making the HTTPS Request
Node.js has a built-in `https` module for making requests to external servers:

```javascript
const https = require('https');

function callOpenRouter(userMessages) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: 'openai/gpt-oss-120b',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...userMessages]
    });

    const options = {
      hostname: 'openrouter.ai',
      path:     '/api/v1/chat/completions',
      method:   'POST',
      headers:  {
        'Authorization': `Bearer ${API_KEY}`,  // API key in header, never in URL
        'Content-Type':  'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, response => {
      let data = '';
      response.on('data', chunk => data += chunk);  // Collect response chunks
      response.on('end',  ()    => resolve({ status: response.statusCode, body: JSON.parse(data) }));
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}
```

#### The HTTP Server
The proxy creates its own HTTP server listening only on `127.0.0.1` (localhost) — meaning it is not accessible from the internet directly, only from nginx running on the same machine:

```javascript
const http = require('http');

const server = http.createServer(async (req, res) => {
  // Only respond to POST requests to /api/chat
  if (req.method === 'POST' && req.url === '/api/chat') {
    const body = await readBody(req);
    const { status, body: aiResponse } = await callOpenRouter(body.messages);
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(aiResponse));
    return;
  }

  // Everything else gets a 404
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(3001, '127.0.0.1');  // Only listen on localhost, port 3001
```

---

### 4.9 Nginx — Web Server and Reverse Proxy

Nginx serves two roles:

**1. Static file server** — sends `index.html` to browsers that request the site.

**2. Reverse proxy** — forwards `/api/` requests to the Node.js proxy running on port 3001.

```nginx
server {
    listen 80 default_server;          # Listen on port 80 (standard HTTP)
    root /usr/share/nginx/html;        # Folder containing index.html
    index index.html;                  # Default file to serve

    # For any request starting with /api/
    location /api/ {
        # Forward to Node.js running locally on port 3001
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # All other requests serve static files (index.html)
}
```

From the browser's perspective, `/api/chat` is on the same server as the website. It has no idea Node.js is involved — nginx handles the routing transparently.

---

## 5. Deployment on AWS EC2

Here is a summary of every command used, with explanations:

```bash
# Update all installed packages to the latest version
sudo dnf update -y

# Install nginx web server
sudo dnf install nginx -y

# Start nginx and enable it to start automatically on server reboot
sudo systemctl enable nginx
sudo systemctl start nginx

# Install Node.js (JavaScript runtime for the proxy server)
sudo dnf install nodejs -y

# Install PM2 globally — a process manager that keeps Node.js running
sudo npm install -g pm2

# Create the api folder and move files into it
mkdir -p /home/ec2-user/api
cp /home/ec2-user/proxy.js /home/ec2-user/.env /home/ec2-user/api/

# Start the proxy server with PM2
cd /home/ec2-user/api
pm2 start proxy.js --name digital-twin

# Register PM2 with systemd so it restarts after server reboots
pm2 startup    # Outputs a command — copy and run it
pm2 save       # Save current process list

# Write the nginx configuration file
sudo tee /etc/nginx/conf.d/api-proxy.conf <<'EOF'
server { ... }
EOF

# Test nginx config for syntax errors
sudo nginx -t

# Apply config changes without downtime
sudo systemctl reload nginx

# Copy local files to EC2 (run on your local machine, not on EC2)
scp -i "key.pem" index.html ec2-user@IP:/home/ec2-user/
```

### Windows .pem Permission Fix
SSH requires that private key files are only readable by you — not other users. Windows sometimes grants too many permissions. We fixed this with `icacls`:

```powershell
# Remove inherited permissions (from parent folder)
icacls "key.pem" /inheritance:r

# Grant read permission to your user only
icacls "key.pem" /grant:r ("$env:USERNAME" + ":(R)")
```

---

## 6. Five Suggestions for Improvement

These are areas where the codebase could be made more robust, maintainable, or professional — identified through self-review.

---

### 1. Move Styles and Scripts into Separate Files

**Current state:** All CSS and JavaScript live inside `<style>` and `<script>` tags within `index.html`. The file is over 1,400 lines long.

**Why it's a problem:** As the site grows, a single file becomes hard to navigate. Browsers also cannot cache inline styles and scripts separately — they re-download everything each visit.

**Improvement:** Split into separate files:

```
index.html    ← HTML structure only
style.css     ← All CSS
main.js       ← Canvas and page interactivity
chat.js       ← Digital Twin chat widget
```

Link them from the HTML:
```html
<link rel="stylesheet" href="style.css" />
<script src="main.js" defer></script>
<script src="chat.js" defer></script>
```

The browser can now cache `style.css` separately — a repeat visitor won't re-download it unless it changes.

---

### 2. Sanitize AI Responses Before Displaying Them

**Current state:** The AI's reply is displayed using `textContent`:

```javascript
bubble.textContent = text;  // This is actually safe!
```

However, if the code were ever changed to use `innerHTML` (which renders HTML tags), it would create a **Cross-Site Scripting (XSS)** vulnerability — malicious content in the AI response could execute code in the visitor's browser.

**Improvement:** Add a sanitisation step before displaying any external content, and add a code comment to document why `textContent` must be used:

```javascript
// IMPORTANT: Use textContent, never innerHTML, for AI responses.
// AI output is untrusted external content — innerHTML would allow XSS.
bubble.textContent = text;
```

Additionally, validate the API response structure before accessing nested properties:

```javascript
// Current — throws if response structure is unexpected:
const reply = data.choices[0].message.content;

// Better — safe access with fallback:
const reply = data?.choices?.[0]?.message?.content
  ?? 'Sorry, I could not generate a response.';
```

---

### 3. Add Rate Limiting to the Proxy Server

**Current state:** The `/api/chat` endpoint will forward any number of requests to OpenRouter without restriction.

**Why it's a problem:** A malicious user (or a script) could send thousands of requests per second, running up your OpenRouter API bill quickly.

**Improvement:** Track how many requests each IP address makes and refuse requests above a threshold:

```javascript
const requestCounts = new Map();
const RATE_LIMIT    = 20;   // Maximum requests
const WINDOW_MS     = 60000; // Per 60 seconds

function isRateLimited(ip) {
  const now    = Date.now();
  const record = requestCounts.get(ip) || { count: 0, resetAt: now + WINDOW_MS };

  if (now > record.resetAt) {
    record.count   = 0;
    record.resetAt = now + WINDOW_MS;
  }

  record.count++;
  requestCounts.set(ip, record);
  return record.count > RATE_LIMIT;
}

// In the request handler:
const clientIP = req.headers['x-real-ip'] || req.socket.remoteAddress;
if (isRateLimited(clientIP)) {
  res.writeHead(429, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Too many requests. Please wait a minute.' }));
  return;
}
```

---

### 4. Add a Contact Form with Email Delivery

**Current state:** The contact section has a LinkedIn button and a `mailto:` email link. Clicking the email link opens the visitor's email client — which many people (especially on mobile) find inconvenient, and many do not have configured.

**Why it's a problem:** You are likely losing potential client enquiries from people who see no easy way to reach you without leaving the site.

**Improvement:** Add a simple HTML contact form that submits to a server-side endpoint, which sends an email using a service like AWS SES or Resend:

```html
<form id="contact-form">
  <input type="text"  name="name"    placeholder="Your name"    required />
  <input type="email" name="email"   placeholder="Your email"   required />
  <textarea           name="message" placeholder="Your message" required></textarea>
  <button type="submit" class="btn btn-primary">Send Message</button>
</form>
```

The proxy server would gain a new `/api/contact` endpoint that calls an email delivery API. This keeps the site as the single point of contact and removes the dependency on the visitor's mail client.

---

### 5. Add HTTPS and a Custom Domain

**Current state:** The site is served over plain HTTP at an IP address (`http://13.49.78.105`). Browsers show "Not Secure" in the address bar.

**Why it's a problem:**
- "Not Secure" warnings reduce trust — critical for a professional consulting site
- Browsers block some modern features on HTTP pages
- The IP address will change if the EC2 instance is stopped (unless an Elastic IP is assigned)
- Professional clients expect a branded domain

**Improvement — three steps:**

**Step 1:** Assign an AWS Elastic IP (free while attached to a running instance) so the IP address never changes.

**Step 2:** Register a domain (e.g. `stephantaljaard.com` on Cloudflare for ~$10/year) and add a DNS A record pointing to the Elastic IP.

**Step 3:** Install Certbot and enable free HTTPS via Let's Encrypt:

```bash
sudo dnf install certbot python3-certbot-nginx -y
sudo certbot --nginx -d stephantaljaard.com -d www.stephantaljaard.com
```

Certbot automatically edits the nginx config to redirect HTTP to HTTPS and installs a free SSL certificate. It also sets up auto-renewal so the certificate never expires. After this, the browser shows a padlock and the URL becomes `https://stephantaljaard.com` — the standard for any professional site.

---

*End of tutorial.*
