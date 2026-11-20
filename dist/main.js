document.getElementById("year").textContent = String(new Date().getFullYear());

// Optional: set window.ORBIT_APK_URL before load, or edit here when you have a public APK link.
const apkUrl =
    window.ORBIT_APK_URL ||
    "https://raw.githubusercontent.com/Droplessrain/vpn_releases/main/releases/OrbitVPN-1.0.32-client-release.apk";
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

/** Phone demo: real screenshots Connect ↔ Connected */
(function initPhoneDemo() {
  const root = document.querySelector("[data-phone-demo]");
  if (!root) return;

  const btn = root.querySelector("[data-phone-toggle]");
  const img = root.querySelector("[data-phone-screen]");
  const hint = root.querySelector("[data-phone-hint]");
  if (!btn || !img) return;

  const shots = {
    off: {
      src: "images/guide/03-home.jpg",
      alt: "Orbit VPN: выбор Latvia и кнопка Connect",
    },
    on: {
      src: "images/guide/04-connected.jpg",
      alt: "Orbit VPN подключён: статус Connected",
    },
  };
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let on = false;
  let timer = null;
  let userTouched = false;

  function setConnected(next) {
    on = next;
    root.classList.toggle("is-on", on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    const shot = on ? shots.on : shots.off;
    img.src = shot.src;
    img.alt = shot.alt;
    if (hint) {
      hint.textContent = on
        ? "Connected · Latvia — нажмите, чтобы отключить"
        : "Нажмите на экран: Connect → Connected";
    }
  }

  function scheduleAuto() {
    if (reduceMotion.matches || userTouched) return;
    clearInterval(timer);
    timer = setInterval(() => setConnected(!on), 3400);
  }

  btn.addEventListener("click", () => {
    userTouched = true;
    clearInterval(timer);
    setConnected(!on);
  });

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) scheduleAuto();
          else clearInterval(timer);
        });
      },
      { threshold: 0.35 }
    );
    io.observe(root);
  } else {
    scheduleAuto();
  }
})();

/** Interactive map: you (IP geo) → Riga */
(function initRouteMap() {
  const root = document.querySelector("[data-route-map]");
  if (!root) return;

  const RIGA = { lat: 56.9496, lon: 24.1052, label: "Рига" };
  const MAP = {
    lonMin: -12,
    lonMax: 52,
    latMin: 34,
    latMax: 72,
    w: 900,
    h: 520,
  };

  const youEl = root.querySelector("[data-route-you]");
  const rigaEl = root.querySelector("[data-route-riga]");
  const pathEl = root.querySelector("[data-route-path]");
  const pathGlowEl = root.querySelector("[data-route-path-glow]");
  const gridEl = root.querySelector(".route-grid");
  const statusEl = root.querySelector("[data-route-status]");
  const fromEl = root.querySelector("[data-route-from]");
  const kmEl = root.querySelector("[data-route-km]");
  const rttEl = root.querySelector("[data-route-rtt]");

  function project(lat, lon) {
    const x = ((lon - MAP.lonMin) / (MAP.lonMax - MAP.lonMin)) * MAP.w;
    const y = ((MAP.latMax - lat) / (MAP.latMax - MAP.latMin)) * MAP.h;
    return {
      x: Math.min(MAP.w - 24, Math.max(24, x)),
      y: Math.min(MAP.h - 24, Math.max(24, y)),
    };
  }

  function haversineKm(a, b) {
    const toRad = (d) => (d * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lon - a.lon);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
  }

  function arcPath(from, to) {
    const mx = (from.x + to.x) / 2;
    const my = (from.y + to.y) / 2 - Math.min(90, Math.hypot(to.x - from.x, to.y - from.y) * 0.22);
    return `M ${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}`;
  }

  function drawGrid() {
    if (!gridEl) return;
    const frag = document.createDocumentFragment();
    for (let lon = -10; lon <= 50; lon += 10) {
      const a = project(MAP.latMin, lon);
      const b = project(MAP.latMax, lon);
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", a.x);
      line.setAttribute("y1", a.y);
      line.setAttribute("x2", b.x);
      line.setAttribute("y2", b.y);
      frag.appendChild(line);
    }
    for (let lat = 40; lat <= 70; lat += 10) {
      const a = project(lat, MAP.lonMin);
      const b = project(lat, MAP.lonMax);
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", a.x);
      line.setAttribute("y1", a.y);
      line.setAttribute("x2", b.x);
      line.setAttribute("y2", b.y);
      frag.appendChild(line);
    }
    gridEl.appendChild(frag);
  }

  function place(el, pt) {
    el.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
    el.setAttribute("opacity", "1");
  }

  function render(from, meta) {
    const a = project(from.lat, from.lon);
    const b = project(RIGA.lat, RIGA.lon);
    place(youEl, a);
    place(rigaEl, b);
    const d = arcPath(a, b);
    pathEl.setAttribute("d", d);
    pathGlowEl.setAttribute("d", d);

    const km = Math.round(haversineKm(from, RIGA));
    // Rough fiber RTT: ~200 km/ms one-way + hop overhead
    const rtt = Math.max(18, Math.round(km / 95 + 14));

    fromEl.textContent = meta.fromLabel;
    kmEl.textContent = `${km.toLocaleString("ru-RU")} км`;
    rttEl.textContent = `~${rtt} мс`;
    statusEl.textContent = meta.status;
    statusEl.classList.toggle("is-ready", meta.ok);
    statusEl.classList.toggle("is-fallback", !meta.ok);
  }

  async function lookupIp() {
    const withTimeout = async (url, ms = 4500) => {
      const c = new AbortController();
      const t = setTimeout(() => c.abort(), ms);
      try {
        const r = await fetch(url, { signal: c.signal, credentials: "omit" });
        if (!r.ok) throw new Error("bad status");
        return await r.json();
      } finally {
        clearTimeout(t);
      }
    };

    try {
      const data = await withTimeout("https://ipwho.is/");
      if (data && data.success !== false && data.latitude != null) {
        return {
          lat: Number(data.latitude),
          lon: Number(data.longitude),
          city: data.city || "",
          country: data.country || data.country_code || "",
        };
      }
    } catch (_) {
      /* try fallback */
    }

    try {
      const data = await withTimeout("https://ipapi.co/json/");
      if (data && data.latitude != null && !data.error) {
        return {
          lat: Number(data.latitude),
          lon: Number(data.longitude),
          city: data.city || "",
          country: data.country_name || data.country || "",
        };
      }
    } catch (_) {
      /* soft map fallback */
    }
    return null;
  }

  drawGrid();
  place(rigaEl, project(RIGA.lat, RIGA.lon));

  lookupIp().then((geo) => {
    if (geo) {
      const placeName = [geo.city, geo.country].filter(Boolean).join(", ") || "ваш регион";
      render(
        { lat: geo.lat, lon: geo.lon },
        {
          fromLabel: placeName,
          status: "Маршрут построен по IP",
          ok: true,
        }
      );
      return;
    }
    // Soft fallback near a common audience region (Moscow) — labelled as approximate
    render(
      { lat: 55.75, lon: 37.62 },
      {
        fromLabel: "Примерный регион",
        status: "IP не определился — показан пример маршрута",
        ok: false,
      }
    );
  });
})();

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
    const panels = track.children.length || 1;
    const x = raw * (panels - 1);
    // Percent of the track (not 100vw): avoids mobile horizontal page overflow.
    track.style.transform = `translate3d(${(-x * 100) / panels}%, 0, 0)`;

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
