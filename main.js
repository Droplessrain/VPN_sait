document.getElementById("year").textContent = String(new Date().getFullYear());

// Optional: set window.ORBIT_APK_URL before load, or edit here when you have a public APK link.
const apkUrl =
    window.ORBIT_APK_URL ||
    "https://raw.githubusercontent.com/Droplessrain/vpn_releases/main/releases/OrbitVPN-1.0.18-client-release.apk";
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
