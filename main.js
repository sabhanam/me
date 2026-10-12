// Renders every section from data/profile.json, so the site, resume and LinkedIn copy share one source.
const $ = (id) => document.getElementById(id);

const el = (tag, props = {}, children = []) => {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key.includes("-")) node.setAttribute(key, value);
    else node[key] = value;
  }
  children.forEach((c) => node.append(c));
  return node;
};

const ICONS = {
  github: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true"><text x="12" y="18.5" text-anchor="middle" font-family="Inter, sans-serif" font-weight="700" font-size="19" fill="currentColor">in</text></svg>',
  email: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><polyline points="3 7 12 13 21 7"/></svg>',
  resume: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="14 3 14 9 20 9"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="14" y2="17"/></svg>',
};

const link = (href, text, cls = "btn") => el("a", { href, className: cls, textContent: text });

const tags = (items) => el("ul", { className: "tags" }, items.map((t) => el("li", { textContent: t })));

// Splits "−80%" into prefix, number and suffix, so the number alone can count up.
function splitValue(value) {
  const m = value.match(/^(\D*)(\d+)(.*)$/);
  return m ? { prefix: m[1], target: Number(m[2]), suffix: m[3] } : null;
}

async function render() {
  const res = await fetch("data/profile.json?v=5");
  const p = await res.json();

  document.title = `${p.name} · ${p.roleLine}`;
  $("hero-role").textContent = p.roleLine;
  $("hero-title").textContent = p.name;
  // Hand-drawn underline under the key phrase of the intro.
  const phrase = "the delivery system";
  const pitchNode = $("hero-pitch");
  if (p.pitch.includes(phrase)) {
    const [before, after] = p.pitch.split(phrase);
    pitchNode.append(before, el("span", { className: "underline-draw", textContent: phrase }), after);
  } else {
    pitchNode.textContent = p.pitch;
  }
  $("hero-photo").src = p.photo;
  $("work-photo").src = p.photo;
  $("work-name").textContent = p.name;
  $("work-now").textContent = `${p.experience[0].role} · ${p.experience[0].company}`;

  $("hero-links").append(
    link(`mailto:${p.links.email}`, "Email me", "btn"),
    link(p.links.linkedin, "LinkedIn", "btn ghost"),
  );

  // Marquee: the stack twice, so the -50% loop is seamless.
  const stack = [...new Set(Object.values(p.skills).flat())];
  const marquee = $("marquee");
  [false, true].forEach((hidden) =>
    stack.forEach((t) => {
      const span = el("span", { textContent: t });
      if (hidden) span.setAttribute("aria-hidden", "true");
      marquee.append(span);
    }),
  );

  // The years figure sits just above the Experience section.
  const years = p.proof[0];
  const yearsValue = el("dt", { className: "stat-value", textContent: years.value });
  const yearsParts = splitValue(years.value);
  if (yearsParts) yearsValue.dataset.count = JSON.stringify(yearsParts);
  const segs = el("div", { className: "segments" }, Array.from({ length: years.segments }, (_, k) => {
    const seg = el("span", { className: "seg" });
    seg.style.setProperty("--i", k);
    return seg;
  }));
  $("years-row").append(el("div", { className: "stat years-stat" }, [
    yearsValue,
    el("div", { className: "stat-body" }, [el("strong", { textContent: years.headline }), el("span", { textContent: years.context }), segs]),
  ]));

  $("solutions").append(
    ...p.solutions.map((sol) => {
      const children = [el("h3", { textContent: sol.title }), el("p", { textContent: sol.body })];
      if (sol.points) children.push(el("ul", { className: "sol-points" }, sol.points.map((pt) => el("li", { textContent: pt }))));
      if (sol.metrics) {
        children.push(el("div", { className: "sol-metrics" }, sol.metrics.map((mt) => {
          const fill = el("span", { className: "bar-fill" });
          fill.style.setProperty("--w", mt.w);
          return el("div", { className: "sol-metric" }, [
            el("strong", { textContent: mt.value }),
            el("span", { className: "bar-label", textContent: mt.label }),
            el("span", { className: "bar" }, [fill]),
          ]);
        })));
      }
      return el("article", { className: "hl-card reveal" }, children);
    }),
  );

  $("products").append(
    ...p.projects.map((pr) => {
      const children = [
        ...(pr.logo ? [el("img", { className: "proj-logo", src: pr.logo, alt: "", width: 44, height: 44, loading: "lazy" })] : []),
        el("h3", { textContent: pr.name }),
        el("p", { className: "kind", textContent: pr.kind }),
        el("p", { textContent: pr.summary }),
      ];
      if (pr.link) {
        const repo = el("a", { href: pr.link, className: "icon-link repo-link", title: pr.linkLabel, "aria-label": pr.linkLabel });
        repo.innerHTML = ICONS.github;
        children.push(repo);
      }
      return el("article", { className: "hl-card reveal" }, children);
    }),
  );


  $("pillars").append(
    ...p.pillars.map((pl, i) => {
      const wrap = el("div", { className: "pv-wrap" });
      wrap.innerHTML = pillarVisual(i);
      return el("article", { className: "pillar" }, [wrap, el("h3", { textContent: pl.title }), el("p", { textContent: pl.body })]);
    }),
  );

  renderMethod(p.philosophy);

  $("experience").append(
    ...p.experience.map((e) =>
      el("li", {}, [
        el("p", { className: "period", textContent: e.period }),
        el("div", {}, [
          el("h3", { className: "role", textContent: e.role }),
          el("p", { className: "meta", textContent: `${e.company} · ${e.place}` }),
          el("ul", {}, e.bullets.map((b) => el("li", { textContent: b }))),
        ]),
      ]),
    ),
  );

  $("ai-title").textContent = p.ai.title;
  $("ai-intro").textContent = p.ai.intro;
  $("ai-points").append(...p.ai.points.map((t) => el("li", { textContent: t })));

  // Bento: a wide story card, a tall "right now" card, and two short cards.
  $("bento").append(
    el("article", { className: "card wide" }, [
      el("h3", { textContent: "Who I am" }),
      el("p", { textContent: p.about[0] }),
      el("p", { textContent: p.about[1] }),
    ]),
    el("article", { className: "card tall dark" }, [
      el("h3", { textContent: p.now.title }),
      el("ul", {}, p.now.items.map((t) => el("li", { textContent: t }))),
    ]),
    el("article", { className: "card" }, [
      el("h3", { textContent: "How I work" }),
      el("ol", { className: "steps" }, p.howIWork.map((h, i) =>
        el("li", { className: "step" }, [
          el("span", { className: "step-num", textContent: String(i + 1) }),
          el("p", {}, [el("strong", { textContent: h.title + ". " }), el("span", { textContent: h.body })]),
        ]),
      )),
    ]),
    el("article", { className: "card" }, [
      el("h3", { textContent: "How I lead" }),
      el("p", { textContent: p.about[2] }),
    ]),
  );

  // Project screenshots: a row of same-size thumbnails per project, each opens full screen.
  const openShot = lightbox();
  $("project-shots").append(
    ...p.projects.filter((pr) => pr.images).flatMap((pr) => [
      el("h3", { className: "subhead", textContent: pr.name }),
      el("div", { className: "shots", "aria-label": `${pr.name} screenshots` }, pr.images.map((img, i) =>
        el("figure", {}, [
          el("button", { className: "shot", type: "button", "aria-label": `Open full screen: ${img.alt}`, onclick: () => openShot(pr.images, i) }, [
            el("img", { src: img.src, alt: "", loading: "lazy", width: 1440, height: 900 }),
          ]),
          el("figcaption", { textContent: img.caption }),
        ]),
      )),
    ]),
  );

  $("education").append(
    ...p.education.map((ed) =>
      el("article", { className: "edu" }, [
        el("img", { src: ed.logo, alt: `${ed.school} logo`, loading: "lazy", width: 64, height: 64 }),
        el("div", {}, [
          el("p", { className: "edu-name" }, [el("a", { href: ed.link, textContent: ed.school })]),
          el("p", { className: "meta", textContent: `${ed.place} · Graduated ${ed.year}` }),
        ]),
      ]),
    ),
  );

  // How it's built: case study, architecture layers, delivery and testing.
  const tech = p.technical;
  $("tech-title").textContent = tech.title;
  $("tech-lede").textContent = tech.lede;
  const cs = tech.caseStudy;
  $("casestudy").append(
    el("h3", { textContent: cs.title }),
    el("p", { className: "cs-problem", textContent: cs.problem }),
    el("ol", { className: "cs-steps" }, cs.steps.map((st, i) =>
      el("li", {}, [el("span", { className: "step-num", textContent: String(i + 1) }), el("p", { textContent: st })]),
    )),
    tags(cs.stack),
    el("p", { className: "cs-result", textContent: cs.result }),
  );
  $("architectures").append(
    ...tech.architectures.map((a) =>
      el("article", { className: "arch reveal" }, [
        el("h3", { textContent: a.name }),
        el("p", { className: "meta", textContent: a.summary }),
        el("ol", { className: "layers" }, a.layers.map((l) => el("li", { textContent: l }))),
      ]),
    ),
  );
  $("delivery").append(
    el("h3", { textContent: tech.delivery.title }),
    el("ul", {}, tech.delivery.points.map((pt) => el("li", { textContent: pt }))),
  );

  $("skills").append(
    ...Object.entries(p.skills).map(([group, items]) => el("div", {}, [el("h4", { textContent: group }), tags(items)])),
  );


  // Footer: icon links, each with an accessible name and a tooltip.
  const iconLink = (href, label, icon) => {
    const a = el("a", { href, className: "icon-link", title: label, "aria-label": label });
    if (icon.startsWith("<svg")) a.innerHTML = icon;
    else a.append(el("img", { src: icon, alt: "", width: 20, height: 20 }));
    return a;
  };
  // Contact: icon links with labels, matching the footer.
  ICONS.copy = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>';
  const contactItem = (label, icon, href, onclick) => {
    const node = href
      ? el("a", { href, className: "contact-icon", title: label, "aria-label": label })
      : el("button", { type: "button", className: "contact-icon", title: label, "aria-label": label, onclick });
    node.innerHTML = icon;
    return el("div", { className: "contact-item" }, [node, el("span", { className: "contact-label", textContent: label })]);
  };
  $("contact-links").append(
    contactItem("Email", ICONS.email, `mailto:${p.links.email}`),
    contactItem("Copy email", ICONS.copy, null, async (e) => {
      try {
        await navigator.clipboard.writeText(p.links.email);
        e.currentTarget.nextElementSibling.textContent = "Copied";
      } catch {
        e.currentTarget.nextElementSibling.textContent = p.links.email;
      }
    }),
    contactItem("LinkedIn", ICONS.linkedin, p.links.linkedin),
    contactItem("GitHub", ICONS.github, p.links.github),
    contactItem("Resume", ICONS.resume, p.links.resume),
  );

  $("footer-links").append(
    iconLink(p.links.github, "GitHub", ICONS.github),
    iconLink(p.links.linkedin, "LinkedIn", ICONS.linkedin),
    iconLink(`mailto:${p.links.email}`, "Email", ICONS.email),
    iconLink(p.links.resume, "Resume (PDF)", ICONS.resume),
    iconLink(p.links.atlas, "Atlas", "assets/projects/atlas-logo.png"),
  );
}

// Copy email: one tap to paste the address elsewhere.

// Phone menu: toggles the nav panel and keeps aria-expanded in sync.
function menuToggle() {
  const toggle = document.querySelector(".menu-toggle");
  const header = document.querySelector(".site-nav");
  toggle.addEventListener("click", () => {
    const open = header.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  document.querySelectorAll("#site-nav a").forEach((a) =>
    a.addEventListener("click", () => {
      header.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
    }),
  );
}

// Highlighter sweep on the key phrase, drawn when the card enters.
function markedText(text) {
  const span = el("span");
  const key = "Visual Comparison";
  if (!text.includes(key)) {
    span.textContent = text;
    return span;
  }
  const [before, after] = text.split(key);
  span.append(before, el("mark", { className: "mark", textContent: key }), after);
  return span;
}

// Pillar visuals: small SVG or logo animations, played once when the card enters.
function pillarVisual(i) {
  if (i === 0) {
    return `<svg class="pv" viewBox="0 0 48 48" aria-hidden="true"><path class="shield" d="M24 4 L40 10 V22 C40 32 33 41 24 44 C15 41 8 32 8 22 V10 Z"/><path class="check" d="M17 24 L22 29 L31 19"/></svg>`;
  }
  if (i === 1) {
    return `<svg class="pv pv-pipe" viewBox="0 0 160 40" aria-hidden="true"><line class="rail" x1="12" y1="20" x2="148" y2="20"/><circle class="pipe-node" cx="12" cy="20" r="6"/><circle class="pipe-node" cx="52" cy="20" r="6"/><circle class="pipe-node" cx="92" cy="20" r="6"/><circle class="pipe-node" cx="148" cy="20" r="6"/><circle class="travel" cx="12" cy="20" r="4"/></svg>`;
  }
  return `<div class="pv pv-logos" aria-hidden="true"><img src="assets/projects/atlas-logo.png" alt=""><img src="assets/projects/dhequest-logo.png" alt=""><img src="assets/projects/experts-jar-logo.png" alt=""></div>`;
}

// Full-screen viewer for screenshots: a native dialog, so Escape closes it.
function lightbox() {
  const dlg = $("lightbox");
  const img = $("lb-img");
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
  dlg.querySelector(".lb-close").addEventListener("click", () => dlg.close());
  // Previous/next move through the opened project's screenshots and wrap around.
  let list = [];
  let at = 0;
  const show = (i) => {
    at = (i + list.length) % list.length;
    img.src = list[at].src;
    img.alt = list[at].alt;
  };
  dlg.querySelector(".lb-prev").addEventListener("click", () => show(at - 1));
  dlg.querySelector(".lb-next").addEventListener("click", () => show(at + 1));
  dlg.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") show(at - 1);
    if (e.key === "ArrowRight") show(at + 1);
  });
  return (images, i) => {
    list = images;
    show(i);
    dlg.showModal();
  };
}

// Reading progress, a cursor spotlight on cards, and nothing else heavy.
function uiDetails() {
  const bar = document.querySelector(".progress");
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  };
  onFrame(onScroll);
  onScroll();

  followPointer();
  document.querySelectorAll(".hl-card, .arch, .pillar, .cs, .delivery-card, .card, .stat").forEach((n) => n.classList.add("spot"));
  let spot = null;
  document.addEventListener("pointermove", (e) => {
    spot = { x: e.clientX, y: e.clientY, target: e.target };
    if (!framePending) { framePending = true; requestAnimationFrame(flushFrame); }
  }, { passive: true });
  onFrame(() => {
    if (!spot) return;
    const card = spot.target.closest ? spot.target.closest(".spot") : null;
    if (!card) { spot = null; return; }
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${spot.x - r.left}px`);
    card.style.setProperty("--my", `${spot.y - r.top}px`);
    spot = null;
  });
}

// The hero glow drifts toward the cursor anywhere on the page, and eases back when the cursor leaves the window.
function followPointer() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const aura = document.querySelector(".hero-wrap .aurora");
  let tx = 0, ty = 0, x = 0, y = 0, frame = 0;
  const step = () => {
    x += (tx - x) * 0.08;
    y += (ty - y) * 0.08;
    aura.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
    const settled = Math.abs(tx - x) + Math.abs(ty - y) < 0.1;
    frame = settled ? 0 : requestAnimationFrame(step);
  };
  const kick = () => {
    if (!frame) frame = requestAnimationFrame(step);
  };
  window.addEventListener("pointermove", (e) => {
    tx = (e.clientX - window.innerWidth / 2) * 0.25;
    ty = (e.clientY - window.innerHeight / 2) * 0.25;
    kick();
  }, { passive: true });
  document.documentElement.addEventListener("pointerleave", () => {
    tx = 0;
    ty = 0;
    kick();
  });
}

// The five-step walkthrough: each step's animation plays as the page scrolls through it.
const METHOD_VISUALS = [
  // 1. Make the requirements less dumb: a magnifier checks each requirement
  `<svg viewBox="-10 10 300 240" aria-hidden="true">
    <rect class="m-paper" x="110" y="40" width="180" height="180" rx="14"/>
    <rect class="m-line" x="136" y="78" width="130" height="10" rx="5"/>
    <rect class="m-line" x="136" y="104" width="100" height="10" rx="5"/>
    <rect class="m-line m-crossed" x="136" y="130" width="120" height="10" rx="5"/>
    <rect class="m-line" x="136" y="156" width="110" height="10" rx="5"/>
    <path class="m-tick" d="M136 200 L146 210 L166 190" />
    <g class="m-lens"><circle cx="160" cy="92" r="26"/><line x1="178" y1="110" x2="196" y2="128"/></g>
  </svg>`,
  // 2. Delete the part or process: parts fall away, the rest close ranks
  `<svg viewBox="-10 10 300 240" aria-hidden="true">
    <rect class="m-block b1" x="140" y="30" width="120" height="36" rx="8"/>
    <rect class="m-block b2" x="140" y="74" width="120" height="36" rx="8"/>
    <rect class="m-block b3 m-drop" x="140" y="118" width="120" height="36" rx="8"/>
    <rect class="m-block b4" x="140" y="162" width="120" height="36" rx="8"/>
    <rect class="m-block b5" x="140" y="206" width="120" height="36" rx="8"/>
  </svg>`,
  // 3. Simplify or optimise: many nodes converge into one
  `<svg viewBox="-10 10 300 240" aria-hidden="true">
    <circle class="m-node n1" cx="90" cy="60" r="14"/>
    <circle class="m-node n2" cx="310" cy="60" r="14"/>
    <circle class="m-node n3" cx="90" cy="200" r="14"/>
    <circle class="m-node n4" cx="310" cy="200" r="14"/>
    <circle class="m-node n5" cx="200" cy="30" r="14"/>
    <circle class="m-node n6" cx="200" cy="230" r="14"/>
    <circle class="m-core" cx="200" cy="130" r="26"/>
  </svg>`,
  // 4. Accelerate cycle time: a gauge needle sweeps and the loop speeds up
  `<svg viewBox="-10 10 300 240" aria-hidden="true">
    <path class="m-gauge" d="M110 190 A90 90 0 0 1 290 190"/>
    <line class="m-needle" x1="200" y1="190" x2="200" y2="112"/>
    <circle class="m-hub" cx="200" cy="190" r="8"/>
    <circle class="m-fast" cx="200" cy="60" r="7"/>
    <circle class="m-fast f2" cx="200" cy="60" r="5"/>
  </svg>`,
  // 5. Automate: a loop that runs by itself
  `<svg viewBox="-10 10 300 240" aria-hidden="true">
    <path class="m-loop" d="M120 80 H280 Q300 80 300 100 V160 Q300 180 280 180 H120 Q100 180 100 160 V100 Q100 80 120 80 Z"/>
    <circle class="m-runner" r="8"><animateMotion dur="3.2s" repeatCount="indefinite" path="M120 80 H280 Q300 80 300 100 V160 Q300 180 280 180 H120 Q100 180 100 160 V100 Q100 80 120 80 Z"/></circle>
    <circle class="m-core" cx="200" cy="130" r="22"/>
  </svg>`,
];

// Extra motion inside each diagram: a scan beam, falling dust, data pulses, lit gauge ticks, and an orbit.
const METHOD_EXTRA = [
  `<rect class="m-beam" x="104" y="34" width="176" height="4" rx="2"/>`,
  `<rect class="m-dust d1" x="150" y="206" width="7" height="7" rx="2"/><rect class="m-dust d2" x="176" y="214" width="6" height="6" rx="2"/><circle class="m-dust d3" cx="162" cy="228" r="3.5"/>`,
  `<circle class="m-pulse" cx="200" cy="150" r="22"/><circle class="m-particle" r="4"><animateMotion dur="2.4s" repeatCount="indefinite" path="M92 66 L178 136"/></circle><circle class="m-particle" r="4"><animateMotion dur="2.4s" begin="0.8s" repeatCount="indefinite" path="M308 66 L222 136"/></circle><circle class="m-particle" r="4"><animateMotion dur="2.4s" begin="1.6s" repeatCount="indefinite" path="M200 36 L200 128"/></circle>`,
  `<g class="m-ticks"><circle cx="126" cy="190" r="4"/><circle cx="136" cy="153" r="4"/><circle cx="163" cy="127" r="4"/><circle cx="200" cy="116" r="4"/><circle cx="237" cy="127" r="4"/><circle cx="264" cy="153" r="4"/><circle cx="274" cy="190" r="4"/></g>`,
  `<circle class="m-orbit" cx="200" cy="150" r="60"/><circle class="m-runner2" r="6"><animateMotion dur="4s" repeatCount="indefinite" path="M200 90 A60 60 0 1 1 199.9 90"/></circle>`,
];
METHOD_VISUALS.forEach((v, i) => { METHOD_VISUALS[i] = v.replace("</svg>", METHOD_EXTRA[i] + "</svg>"); });
// On phones and touch screens, drop the main-thread particle motion (SMIL) entirely.
const LOW_POWER = window.matchMedia("(max-width: 860px), (hover: none)").matches;
if (LOW_POWER) document.querySelectorAll(".agent-svg *").forEach((n) => { if (n.localName.toLowerCase() === "animatemotion") n.remove(); });

// What each step looked like in real work, taken from the resume.
const METHOD_EXAMPLES = [
  "Before building the Visual Comparison solution, the real requirement was simple: show what changed between two report versions, so teams stop comparing by hand.",
  "Removed the UFT license cost by running the QTP/UFT scripts in parallel on an in-house platform, instead of paying for more licences.",
  "The Visual Comparison pipeline folds every difference into one consolidated HTML report, in place of manual checking.",
  "Release validation went from 6 weeks to 7 days once the Visual Comparison solution shipped.",
  "Azure DevOps YAML pipelines with release gates, branch policies and self-hosted agents, so releases run without manual steps.",
];

// Problem, action and result for each step, all from the resume.
const METHOD_STORY = [
  { problem: "Report versions could not be compared, so every release needed manual checking.",
    action: "Defined the real requirement: show exactly what changed between two versions.",
    result: "That requirement became the Visual Comparison solution." },
  { problem: "UFT licences were a recurring cost for every test run.",
    action: "Removed the dependency: QTP/UFT scripts ran in parallel on an in-house platform.",
    result: "The UFT license cost went away, and test management effort dropped." },
  { problem: "Differences were spread across many outputs, and reviewers hunted for them.",
    action: "Folded every difference into one consolidated HTML report.",
    result: "One place to review every change, instead of many." },
  { problem: "Release validation took 6 weeks.",
    action: "Shipped the Visual Comparison solution, which made validation mostly automatic.",
    result: "Release validation dropped to 7 days." },
  { problem: "Releases depended on manual steps and on memory.",
    action: "Built Azure DevOps YAML pipelines with release gates, approvals and self-hosted agents.",
    result: "Engineering, QA and release run through one governed pipeline." },
];

// The change each drawing shows, in one line.
const METHOD_CAPTIONS = [
  "A vague requirement becomes one question",
  "Five parts become four",
  "Many outputs become one report",
  "Six weeks becomes seven days",
  "Manual steps become one pipeline",
];

// Hand-drawn doodles beside the text. Each one is a complete little sketch; shapes draw in once the step is active.
const METHOD_DOODLES = [
  // 1: a checklist, a magnifier at the end of a curved arrow, and a sparkle
  `<svg class="m-doodle" viewBox="0 0 200 300" aria-hidden="true">
    <rect pathLength="1" x="28" y="34" width="28" height="28" rx="6"/>
    <path pathLength="1" class="acc" d="M36 48 L43 55 L55 40"/>
    <rect pathLength="1" x="28" y="94" width="28" height="28" rx="6"/>
    <path pathLength="1" class="acc" d="M36 108 L43 115 L55 100"/>
    <rect pathLength="1" x="28" y="154" width="28" height="28" rx="6"/>
    <path pathLength="1" d="M54 168 C 86 176, 100 196, 112 222"/>
    <path pathLength="1" class="acc" d="M104 216 L113 224 L117 213"/>
    <circle pathLength="1" cx="130" cy="240" r="16"/>
    <path pathLength="1" d="M142 252 L158 268"/>
    <path pathLength="1" class="wrm" d="M150 34 L153 44 L163 47 L153 50 L150 60 L147 50 L137 47 L147 44 Z"/>
  </svg>`,
  // 2: a stack of blocks; the third is struck through and falls away on a curved trail
  `<svg class="m-doodle" viewBox="0 0 200 300" aria-hidden="true">
    <rect pathLength="1" x="30" y="30" width="110" height="26" rx="8"/>
    <rect pathLength="1" x="30" y="66" width="110" height="26" rx="8"/>
    <rect pathLength="1" x="30" y="102" width="110" height="26" rx="8"/>
    <path pathLength="1" class="wrm" d="M26 115 C 60 108, 100 124, 146 116"/>
    <rect pathLength="1" x="30" y="138" width="110" height="26" rx="8"/>
    <path pathLength="1" class="acc" d="M146 118 C 168 146, 152 188, 176 214"/>
    <path pathLength="1" class="acc" d="M168 210 L177 216 L183 207"/>
    <path pathLength="1" d="M30 200 L140 200"/>
    <path pathLength="1" d="M30 222 L104 222"/>
  </svg>`,
  // 3: many parts converge on one core
  `<svg class="m-doodle" viewBox="0 0 200 300" aria-hidden="true">
    <circle pathLength="1" cx="36" cy="60" r="9"/>
    <circle pathLength="1" cx="164" cy="60" r="9"/>
    <circle pathLength="1" cx="36" cy="240" r="9"/>
    <circle pathLength="1" cx="164" cy="240" r="9"/>
    <circle pathLength="1" cx="100" cy="30" r="9"/>
    <circle pathLength="1" cx="100" cy="270" r="9"/>
    <path pathLength="1" d="M44 68 Q 70 110, 88 138"/>
    <path pathLength="1" d="M156 68 Q 130 110, 112 138"/>
    <path pathLength="1" d="M44 232 Q 70 190, 88 162"/>
    <path pathLength="1" d="M156 232 Q 130 190, 112 162"/>
    <path pathLength="1" class="acc" d="M100 40 L100 124"/>
    <path pathLength="1" class="acc" d="M100 260 L100 176"/>
    <circle pathLength="1" class="acc" cx="100" cy="150" r="22"/>
  </svg>`,
  // 4: a stopwatch, a sweep that shows the speed-up, and speed lines
  `<svg class="m-doodle" viewBox="0 0 200 300" aria-hidden="true">
    <circle pathLength="1" cx="108" cy="160" r="64"/>
    <path pathLength="1" d="M98 92 L118 92"/>
    <path pathLength="1" d="M108 92 L108 96"/>
    <path pathLength="1" class="acc" d="M108 160 L146 124"/>
    <path pathLength="1" class="wrm" d="M108 104 A 56 56 0 0 1 160 128"/>
    <path pathLength="1" class="wrm" d="M154 121 L161 129 L169 124"/>
    <path pathLength="1" d="M18 130 L56 130"/>
    <path pathLength="1" d="M10 160 L40 160"/>
    <path pathLength="1" d="M22 190 L52 190"/>
  </svg>`,
  // 5: a loop that runs by itself, with a gear at its centre
  `<svg class="m-doodle" viewBox="0 0 200 300" aria-hidden="true">
    <path pathLength="1" d="M100 70 A 80 80 0 1 1 52 84"/>
    <path pathLength="1" class="acc" d="M45 74 L52 84 L62 80"/>
    <circle pathLength="1" cx="100" cy="150" r="18"/>
    <path pathLength="1" d="M100 122 L100 128 M100 172 L100 178 M72 150 L78 150 M122 150 L128 150"/>
    <path pathLength="1" class="wrm" d="M160 52 L163 60 L171 63 L163 66 L160 74 L157 66 L149 63 L157 60 Z"/>
    <path pathLength="1" d="M30 240 C 60 270, 120 270, 152 240"/>
  </svg>`,
];

// Sketches for the right-hand margin. They complement the left ones and draw in with the step.
const METHOD_DOODLES_RIGHT = [
  // 1: a page with lines and a pencil writing on it
  `<svg class="m-doodle" viewBox="0 0 200 300" aria-hidden="true">
    <rect pathLength="1" x="40" y="60" width="110" height="140" rx="10"/>
    <path pathLength="1" d="M58 90 L130 90"/>
    <path pathLength="1" d="M58 116 L120 116"/>
    <path pathLength="1" d="M58 142 L104 142"/>
    <path pathLength="1" class="acc" d="M96 196 L150 142 L162 154 L108 208 L92 212 Z"/>
    <path pathLength="1" class="wrm" d="M150 36 l4 -12 l4 12 l12 4 l-12 4 l-4 12 l-4 -12 l-12 -4 z"/>
  </svg>`,
  // 2: a bin with its lid and two lines of waste leaving it
  `<svg class="m-doodle" viewBox="0 0 200 300" aria-hidden="true">
    <path pathLength="1" d="M60 98 L140 98"/>
    <path pathLength="1" d="M86 84 L86 98 M114 84 L114 98 M86 84 L114 84"/>
    <path pathLength="1" d="M66 98 L72 218 Q 73 226 82 226 L118 226 Q 127 226 128 218 L134 98"/>
    <path pathLength="1" d="M88 120 L90 204 M100 120 L100 204 M112 120 L110 204"/>
    <path pathLength="1" class="acc" d="M154 160 C 170 150, 182 166, 176 178"/>
    <path pathLength="1" class="acc" d="M172 170 L176 178 L184 176"/>
  </svg>`,
  // 3: three paths converging into one point
  `<svg class="m-doodle" viewBox="0 0 200 300" aria-hidden="true">
    <path pathLength="1" d="M30 70 C 60 90, 80 120, 100 150"/>
    <path pathLength="1" d="M170 70 C 140 90, 120 120, 100 150"/>
    <path pathLength="1" d="M100 40 L100 130"/>
    <path pathLength="1" class="acc" d="M92 124 L100 132 L108 124"/>
    <circle pathLength="1" class="acc" cx="100" cy="160" r="10"/>
    <path pathLength="1" d="M100 170 L100 250"/>
    <path pathLength="1" class="acc" d="M92 244 L100 252 L108 244"/>
  </svg>`,
  // 4: a bolt and speed chevrons
  `<svg class="m-doodle" viewBox="0 0 200 300" aria-hidden="true">
    <path pathLength="1" class="wrm" d="M118 40 L70 150 L104 150 L82 262 L140 128 L104 128 Z"/>
    <path pathLength="1" d="M30 120 L50 140 L30 160"/>
    <path pathLength="1" d="M20 150 L40 170 L20 190"/>
    <path pathLength="1" d="M160 200 L180 220 L160 240"/>
    <path pathLength="1" d="M150 230 L170 250 L150 270"/>
  </svg>`,
  // 5: a gear beside a play symbol, with a loop arrow
  `<svg class="m-doodle" viewBox="0 0 200 300" aria-hidden="true">
    <circle pathLength="1" cx="100" cy="110" r="36"/>
    <circle pathLength="1" cx="100" cy="110" r="12"/>
    <path pathLength="1" d="M100 66 L100 74 M100 146 L100 154 M56 110 L64 110 M136 110 L144 110"/>
    <path pathLength="1" d="M72 82 L78 88 M128 138 L122 132 M128 82 L122 88 M72 138 L78 132"/>
    <path pathLength="1" class="acc" d="M74 210 L74 262 L120 236 Z"/>
    <path pathLength="1" d="M48 280 C 90 300, 140 292, 160 260"/>
    <path pathLength="1" class="acc" d="M154 266 L160 258 L168 264"/>
  </svg>`,
];

function renderMethod(steps) {
  const wrap = $("method-steps");
  const chain = $("method-chain");
  const SHORT = ["Requirements", "Delete", "Simplify", "Accelerate", "Automate"];
  chain.append(...SHORT.map((label) => el("li", { textContent: label })));
  wrap.append(...steps.map((st, i) => {
    const visual = el("div", { className: "m-visual" });
    visual.innerHTML = METHOD_VISUALS[i];
    if (LOW_POWER) [...visual.querySelectorAll("*")].filter((n) => n.localName.toLowerCase() === "animatemotion").forEach((a) => a.remove());
    const story = METHOD_STORY[i];
    const text = el("div", { className: "m-text" }, [
      el("span", { className: "m-num", textContent: String(i + 1).padStart(2, "0") }),
      el("h3", { textContent: st.step }),
      el("p", { className: "m-note", textContent: st.note }),
      el("dl", { className: "m-story" }, [
        el("dt", { textContent: "The problem" }), el("dd", { textContent: story.problem }),
        el("dt", { textContent: "What I did" }), el("dd", { textContent: story.action }),
        el("dt", { textContent: "The result" }), el("dd", { textContent: story.result }),
      ]),
    ]);
    const caption = el("p", { className: "m-caption", textContent: METHOD_CAPTIONS[i] });
    const doodle = el("div", { className: "m-doodles" });
    doodle.innerHTML = METHOD_DOODLES[i];
    const doodleR = el("div", { className: "m-doodles m-doodles-r" });
    doodleR.innerHTML = METHOD_DOODLES_RIGHT[i];
    return el("article", { className: "mstep" }, [text, el("div", { className: "m-card" }, [visual, caption]), doodle, doodleR]);
  }));
}

// Small sketches beside the other sections, in the margins on wide screens. Each draws in when the section is seen.
const SECTION_SKETCHES = {
  ai: [
    `<svg class="sk" viewBox="0 0 200 300" aria-hidden="true"><circle pathLength="1" cx="40" cy="60" r="12"/><circle pathLength="1" cx="160" cy="46" r="12"/><circle pathLength="1" cx="100" cy="150" r="14"/><circle pathLength="1" cx="36" cy="236" r="12"/><circle pathLength="1" cx="164" cy="240" r="12"/><path pathLength="1" d="M50 68 L90 138"/><path pathLength="1" d="M152 58 L110 140"/><path pathLength="1" d="M48 226 L92 162"/><path pathLength="1" d="M154 228 L108 162"/><path pathLength="1" class="acc" d="M100 20 l4 -12 l4 12 l12 4 l-12 4 l-4 12 l-4 -12 l-12 -4 z"/></svg>`,
    `<svg class="sk" viewBox="0 0 200 300" aria-hidden="true"><path pathLength="1" class="acc" d="M40 150 C 40 100, 100 90, 110 140 C 120 190, 60 200, 60 160 C 60 130, 96 126, 104 150"/><path pathLength="1" d="M150 60 l5 -15 l5 15 l15 5 l-15 5 l-5 15 l-5 -15 l-15 -5 z"/><circle pathLength="1" class="wrm" cx="160" cy="230" r="8"/></svg>`,
  ],
  highlights: [
    `<svg class="sk" viewBox="0 0 200 300" aria-hidden="true"><circle pathLength="1" class="acc" cx="100" cy="110" r="46"/><circle pathLength="1" cx="100" cy="110" r="30"/><path pathLength="1" d="M74 150 L62 260 L84 244 L96 270 L110 180"/><path pathLength="1" d="M126 150 L138 260 L116 244 L104 270 L90 180"/><path pathLength="1" class="wrm" d="M100 92 l5 10 l11 1 l-8 7 l2 11 l-10 -6 l-10 6 l2 -11 l-8 -7 l11 -1 z"/></svg>`,
    `<svg class="sk" viewBox="0 0 200 300" aria-hidden="true"><path pathLength="1" d="M100 40 C 130 70, 136 120, 128 180 L72 180 C 64 120, 70 70, 100 40 Z"/><circle pathLength="1" class="acc" cx="100" cy="110" r="12"/><path pathLength="1" d="M72 150 L52 180 L72 180"/><path pathLength="1" d="M128 150 L148 180 L128 180"/><path pathLength="1" class="wrm" d="M86 184 C 90 216, 100 236, 100 262 C 100 236, 110 216, 114 184"/></svg>`,
  ],
  why: [
    `<svg class="sk" viewBox="0 0 200 300" aria-hidden="true"><circle pathLength="1" cx="100" cy="150" r="70"/><circle pathLength="1" cx="100" cy="150" r="44"/><circle pathLength="1" class="acc" cx="100" cy="150" r="12"/><path pathLength="1" class="wrm" d="M150 60 L100 150"/><path pathLength="1" class="wrm" d="M142 58 L150 60 L152 68"/></svg>`,
    `<svg class="sk" viewBox="0 0 200 300" aria-hidden="true"><path pathLength="1" d="M100 60 L150 110 L100 160 L50 110 Z"/><path pathLength="1" class="acc" d="M50 150 L100 200 L150 150"/><path pathLength="1" d="M50 190 L100 240 L150 190"/></svg>`,
  ],
  work: [
    `<svg class="sk" viewBox="0 0 200 300" aria-hidden="true"><path pathLength="1" d="M60 20 C 150 60, 40 120, 120 160 C 180 190, 60 240, 110 280"/><circle pathLength="1" class="acc" cx="60" cy="20" r="7"/><circle pathLength="1" cx="120" cy="160" r="7"/><circle pathLength="1" cx="110" cy="280" r="7"/></svg>`,
    `<svg class="sk" viewBox="0 0 200 300" aria-hidden="true"><rect pathLength="1" x="48" y="110" width="104" height="80" rx="10"/><path pathLength="1" d="M82 110 L82 96 Q 82 84 94 84 L106 84 Q 118 84 118 96 L118 110"/><path pathLength="1" class="acc" d="M48 150 L152 150"/></svg>`,
  ],
  contact: [
    `<svg class="sk" viewBox="0 0 200 300" aria-hidden="true"><rect pathLength="1" x="30" y="110" width="140" height="92" rx="10"/><path pathLength="1" class="acc" d="M30 120 L100 168 L170 120"/></svg>`,
    `<svg class="sk" viewBox="0 0 200 300" aria-hidden="true"><path pathLength="1" d="M40 90 Q 40 70, 60 70 L140 70 Q 160 70, 160 90 L160 140 Q 160 160, 140 160 L92 160 L70 184 L72 160 L60 160 Q 40 160, 40 140 Z"/><path pathLength="1" class="acc" d="M64 96 L136 96 M64 118 L120 118"/><path pathLength="1" class="wrm" d="M150 200 l4 -12 l4 12 l12 4 l-12 4 l-4 12 l-4 -12 l-12 -4 z"/></svg>`,
  ],
  tech: [
    `<svg class="sk" viewBox="0 0 200 300" aria-hidden="true"><rect pathLength="1" x="56" y="110" width="88" height="88" rx="10"/><rect pathLength="1" class="acc" x="82" y="136" width="36" height="36" rx="6"/><path pathLength="1" d="M76 110 V86 M100 110 V86 M124 110 V86 M76 198 V222 M100 198 V222 M124 198 V222 M56 128 H32 M56 150 H32 M56 172 H32 M144 128 H168 M144 150 H168 M144 172 H168"/><circle pathLength="1" class="wrm" cx="100" cy="60" r="8"/></svg>`,
    `<svg class="sk" viewBox="0 0 200 300" aria-hidden="true"><path pathLength="1" d="M40 110 L100 80 L160 110 L100 140 Z"/><path pathLength="1" d="M40 150 L100 180 L160 150"/><path pathLength="1" class="acc" d="M40 190 L100 220 L160 190"/><path pathLength="1" class="wrm" d="M100 232 L100 262 M92 254 L100 262 L108 254"/></svg>`,
  ],
  projects: [
    `<svg class="sk" viewBox="0 0 200 300" aria-hidden="true"><path pathLength="1" class="acc" d="M30 170 L170 90 L120 200 L100 170 Z"/><path pathLength="1" d="M100 170 L170 90"/><path pathLength="1" d="M40 210 C 60 230, 80 220, 90 200"/><path pathLength="1" d="M26 226 C 40 240, 60 240, 74 230"/></svg>`,
    `<svg class="sk" viewBox="0 0 200 300" aria-hidden="true"><path pathLength="1" d="M60 40 L60 270"/><path pathLength="1" class="acc" d="M60 50 C 90 40, 110 70, 140 60 L140 110 C 110 120, 90 90, 60 100 Z"/><path pathLength="1" class="wrm" d="M40 270 L80 270"/><circle pathLength="1" cx="150" cy="200" r="6"/><circle pathLength="1" cx="170" cy="230" r="4"/></svg>`,
  ],
  about: [
    `<svg class="sk" viewBox="0 0 200 300" aria-hidden="true"><path pathLength="1" class="wrm" d="M100 70 C 66 70, 56 104, 70 128 C 80 146, 84 160, 84 176 L116 176 C 116 160, 120 146, 130 128 C 144 104, 134 70, 100 70 Z"/><path pathLength="1" d="M86 196 L114 196 M90 212 L110 212"/><path pathLength="1" class="acc" d="M100 24 L100 36 M52 46 L60 56 M148 46 L140 56 M40 90 L50 96 M160 90 L150 96"/></svg>`,
    `<svg class="sk" viewBox="0 0 200 300" aria-hidden="true"><circle pathLength="1" cx="100" cy="150" r="66"/><path pathLength="1" d="M100 150 L128 118"/><path pathLength="1" class="acc" d="M100 96 L100 110 M100 190 L100 204 M46 150 L60 150 M140 150 L154 150"/><path pathLength="1" class="wrm" d="M100 150 L84 186 L100 178 L116 186 Z"/></svg>`,
  ],
};

function addSketches() {
  Object.entries(SECTION_SKETCHES).forEach(([id, [left, right]]) => {
    const section = document.getElementById(id);
    if (!section) return;
    section.classList.add("has-sketch");
    const l = el("div", { className: "sketch sketch-l" });
    l.innerHTML = left;
    const r = el("div", { className: "sketch sketch-r" });
    r.innerHTML = right;
    section.append(l, r);
  });
}

// Scroll position drives the active step and the progress rail. Only classes and one custom property change.
function trackMethod() {
  const track = $("method");
  const stage = track.querySelector(".method-stage");
  const chainItems = [...track.querySelectorAll(".method-chain li")];
  const steps = [...track.querySelectorAll(".mstep")];
  let last = -1;
  const update = () => {
    const range = track.offsetHeight - window.innerHeight;
    const p = range > 0 ? Math.min(Math.max(-track.getBoundingClientRect().top / range, 0), 1) : 0;
    stage.style.setProperty("--p", p.toFixed(3));
    const idx = Math.min(steps.length - 1, Math.floor(p * steps.length));
    if (idx === last) return;
    last = idx;
    steps.forEach((s, i) => s.classList.toggle("active", i === idx));
    chainItems.forEach((c, i) => c.classList.toggle("on", i === idx));
  };
  onFrame(update);
  update();
}

// Count-up: animates the number once, with requestAnimationFrame, when its card appears.
function countUp(node) {
  const { prefix, target, suffix } = JSON.parse(node.dataset.count);
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const duration = 1100;
  const start = performance.now();
  const frame = (now) => {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    node.textContent = `${prefix}${Math.round(target * eased)}${suffix}`;
    if (t < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

// One observer; each element animates once, then is released.
function revealOnScroll() {
  const items = document.querySelectorAll(".stat, .pillar, .path li, .timeline > li, .ai-points li, .project, .card, .hl-card, .arch, .cs, .delivery-card, .layers li, .sketch");
  items.forEach((node) => node.classList.add("reveal"));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const node = entry.target;
      node.classList.add("in");
      const counter = node.querySelector("[data-count]");
      if (counter) countUp(counter);
      io.unobserve(node);
    });
  }, { rootMargin: "0px 0px -8% 0px" });
  items.forEach((node) => io.observe(node));
}

// One scroll listener for the whole page. Jobs run once per animation frame, never more.
const frameJobs = [];
let framePending = false;
const onFrame = (fn) => frameJobs.push(fn);
function flushFrame() {
  framePending = false;
  for (const fn of frameJobs) fn();
}
window.addEventListener("scroll", () => {
  if (!framePending) { framePending = true; requestAnimationFrame(flushFrame); }
}, { passive: true });
window.addEventListener("resize", () => {
  if (!framePending) { framePending = true; requestAnimationFrame(flushFrame); }
}, { passive: true });

// Nav: highlight the section crossing the middle of the screen. Clears when no tracked section is there.
function trackNav() {
  const links = [...document.querySelectorAll("[data-nav]")];
  const sections = ["method", "ai", "highlights", "why", "work", "contact"].map((id) => document.getElementById(id)).filter(Boolean);
  const update = () => {
    const mid = window.innerHeight / 2;
    const current = sections.find((s) => {
      const r = s.getBoundingClientRect();
      return r.top <= mid && r.bottom > mid;
    });
    links.forEach((a) => a.classList.toggle("active", !!current && a.dataset.nav === current.id));
  };
  onFrame(update);
  update();
}

// Skills strip: float at the bottom of the screen while the hero is visible, then release to scroll with the page.
function floatMarquee() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const strip = document.querySelector(".marquee");
  const hero = document.querySelector(".hero");
  const update = () => {
    const bottom = hero.getBoundingClientRect().bottom;
    strip.classList.toggle("float", bottom + strip.offsetHeight > window.innerHeight);
  };
  onFrame(update);
  update();
}

// Skills strip: one requestAnimationFrame loop moves the track. No CSS animation, so nothing can stall on reload or hover.
function runMarquee() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const track = $("marquee");
  const SECONDS_PER_HALF = 38; // same pace as the old CSS loop
  let half = 0;
  let x = 0;
  let last = 0;
  const measure = () => { half = track.scrollWidth / 2; };
  const frame = (now) => {
    const dt = last ? Math.min(now - last, 50) : 0; // cap the step after a tab switch
    last = now;
    x = (x + (dt * half) / (SECONDS_PER_HALF * 1000)) % (half || 1);
    track.style.transform = `translate3d(${-x}px, 0, 0)`;
    requestAnimationFrame(frame);
  };
  measure();
  window.addEventListener("resize", measure, { passive: true });
  requestAnimationFrame(frame);
}

render().then(() => { addSketches(); revealOnScroll(); trackNav(); floatMarquee(); menuToggle(); uiDetails(); trackMethod(); runMarquee(); }).catch((err) => {
  document.body.insertAdjacentElement("afterbegin", el("p", { textContent: "Could not load profile data. Serve this folder over HTTP.", role: "alert" }));
  console.error(err);
});
