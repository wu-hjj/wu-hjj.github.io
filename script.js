/* Navigation is a progressive enhancement; every section works without JS. */
(() => {
  if (!("IntersectionObserver" in window)) return;

  const links = [...document.querySelectorAll(".section-nav .nav-link")];
  const sections = links
    .map((link) => document.getElementById(link.hash.slice(1)))
    .filter(Boolean);
  const visible = new Set();

  const markActive = (id) => {
    links.forEach((link) => {
      const active = link.hash === `#${id}`;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    });

    const current = sections.find((section) => visible.has(section));
    if (current) markActive(current.id);
  }, { rootMargin: "-12% 0px -62% 0px", threshold: 0 });

  sections.forEach((section) => observer.observe(section));
})();
