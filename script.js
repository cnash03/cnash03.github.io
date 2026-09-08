// Runs the track: draws the distance markers, then keeps the runner dot and
// the "you are at" readout in sync with how far down the page you've scrolled.
//
// Replace the placeholder values below with your real ones before you ship:
// - LINKS: your LinkedIn, GitHub, resume, and email
// - PROJECTS: two or three things you've built
// The bracketed text in index.html ([ONE OR TWO LINES...], [YOUR EMAIL], etc.)
// is yours to rewrite there directly.

const SVG_NS = "http://www.w3.org/2000/svg";

const LINKS = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/callen-nash/" },
  { label: "GitHub", href: "https://github.com/cnash03" },
  { label: "Resume", href: "resume.pdf" },
  { label: "Email", href: "mailto:callen.nash@gmail.com" },
];

const MARKERS = [
  { frac: 0, label: "0 / 400m" },
  { frac: 0.25, label: "100m" },
  { frac: 0.5, label: "200m" },
  { frac: 0.75, label: "300m" },
];

const PROJECTS = [
  { name: "[Project One]", blurb: "[What it does, what you built it with.]", href: "#" },
  { name: "[Project Two]", blurb: "[What it does, what you built it with.]", href: "#" },
  { name: "[Project Three]", blurb: "[What it does, what you built it with.]", href: "#" },
];

function renderLinks(containerId) {
  const el = document.getElementById(containerId);
  el.innerHTML = LINKS.map((l) => `<a href="${l.href}">${l.label}</a>`).join("");
}

function renderProjects() {
  const el = document.getElementById("project-grid");
  el.innerHTML = PROJECTS.map(
    (p) => `
    <div class="project-card">
      <h3>${p.name}</h3>
      <p>${p.blurb}</p>
      <a href="${p.href}">View &rarr;</a>
    </div>`
  ).join("");
}

function renderMarkers(svg) {
  MARKERS.forEach((m) => {
    const g = document.createElementNS(SVG_NS, "g");
    g.classList.add("marker");
    g.dataset.frac = m.frac;

    const circle = document.createElementNS(SVG_NS, "circle");
    circle.setAttribute("r", "4.5");

    const text = document.createElementNS(SVG_NS, "text");
    text.setAttribute("y", "-11");
    text.textContent = m.label;

    g.appendChild(circle);
    g.appendChild(text);
    svg.insertBefore(g, document.getElementById("runner"));
  });
}

// positions every marker at its distance along the track path; the runner
// moves separately, on every scroll (see updateTrack below)
function layoutMarkers(path) {
  const len = path.getTotalLength();
  document.querySelectorAll(".marker").forEach((g) => {
    const frac = parseFloat(g.dataset.frac);
    const p = path.getPointAtLength(frac * len);
    g.setAttribute("transform", `translate(${p.x},${p.y})`);
  });
}

function updateTrack(path) {
  const len = path.getTotalLength();
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const frac = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;

  const point = path.getPointAtLength(frac * len);
  document.getElementById("runner").setAttribute("transform", `translate(${point.x},${point.y})`);

  const meters = Math.round(frac * 400);
  document.getElementById("distance-value").textContent = frac >= 0.995 ? "Finish" : `${meters}m`;

  document.querySelectorAll(".marker").forEach((g) => {
    const mfrac = parseFloat(g.dataset.frac);
    const isStartFinish = mfrac === 0;
    const near = Math.abs(mfrac - frac) < 0.06 || (isStartFinish && frac >= 0.995);
    g.classList.toggle("near", near);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderLinks("nav-top");
  renderLinks("nav-finish");
  renderProjects();

  const svg = document.getElementById("track-svg");
  const path = document.getElementById("track-path");
  renderMarkers(svg);
  layoutMarkers(path);
  updateTrack(path);

  window.addEventListener("scroll", () => updateTrack(path), { passive: true });
  window.addEventListener("resize", () => {
    layoutMarkers(path);
    updateTrack(path);
  });
});
