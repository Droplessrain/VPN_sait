document.getElementById("year").textContent = String(new Date().getFullYear());

// Optional: set window.ORBIT_APK_URL before load, or edit here when you have a public APK link.
const apkUrl =
    window.ORBIT_APK_URL ||
    "https://raw.githubusercontent.com/Droplessrain/vpn_releases/main/releases/OrbitVPN-1.0.23-client-release.apk";
const apkLink = document.getElementById("apk-link");
if (apkUrl) {
  apkLink.href = apkUrl;
  const ver = (apkUrl.match(/OrbitVPN-([0-9.]+)/) || [])[1];
  apkLink.textContent = ver ? `Скачать APK ${ver}` : "Скачать APK";
  apkLink.removeAttribute("aria-disabled");
}

const reveal = document.querySelectorAll(".section, .plan");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  reveal.forEach((el) => {
    el.classList.add("will-reveal");
    io.observe(el);
  });
}

/** Mobile: vertical scroll → horizontal Riga panels */
(function initRigaScroll() {
  const root = document.querySelector("[data-riga-scroll]");
  if (!root) return;

  const pin = root.querySelector(".riga-pin");
  const track = root.querySelector(".riga-track");
  const dots = root.querySelectorAll(".riga-dots span");
  if (!pin || !track) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobileMq = window.matchMedia("(max-width: 759px)");
  let ticking = false;
  let lastIndex = 0;

  function progress() {
    if (!mobileMq.matches || reduceMotion.matches) {
      track.style.transform = "";
      return;
    }
    const rect = pin.getBoundingClientRect();
    const scrollable = pin.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return;
    const raw = Math.min(1, Math.max(0, -rect.top / scrollable));
    const x = raw * (track.children.length - 1);
    track.style.transform = `translate3d(${-x * 100}vw, 0, 0)`;

    const idx = Math.min(dots.length - 1, Math.round(raw * (dots.length - 1)));
    if (idx !== lastIndex) {
      dots.forEach((d, i) => d.classList.toggle("is-active", i === idx));
      lastIndex = idx;
    }
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      progress();
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  mobileMq.addEventListener("change", onScroll);
  progress();
})();
