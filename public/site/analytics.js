(() => {
  const id = "G-QH59YMTGL8";
  const key = "enludus-analytics-consent-v1";
  const prefix = "enludus_web";
  const disabled = "ga-disable-" + id;
  // Production only: previews and local development must not pollute GA4.
  if (location.protocol !== "https:" || !["enludus.com", "www.enludus.com"].includes(location.hostname)) return;
  const ja = document.documentElement.lang === "ja";
  let choice;
  try { choice = localStorage.getItem(key); } catch { /* storage unavailable: default to no tracking */ }
  window[disabled] = choice !== "granted";
  let started = false;

  function start() {
    if (started) return;
    started = true;
    window[disabled] = false;
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    gtag("consent", "default", {
      analytics_storage: "granted", ad_storage: "denied",
      ad_user_data: "denied", ad_personalization: "denied",
    });
    gtag("js", new Date());
    gtag("config", id, {
      cookie_domain: "none", cookie_prefix: prefix, cookie_path: "/",
      allow_google_signals: false, allow_ad_personalization_signals: false,
      page_location: location.origin + location.pathname,
      page_referrer: document.referrer ? new URL(document.referrer).origin : "",
    });
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + id;
    document.head.append(script);
  }

  function clearCookies() {
    for (const cookie of document.cookie.split(";")) {
      const name = cookie.split("=")[0].trim();
      if (name === prefix + "_ga" || name.startsWith(prefix + "_ga_")) {
        document.cookie = name + "=; Max-Age=0; Path=/; Secure; SameSite=Lax";
      }
    }
  }

  const root = document.createElement("aside");
  root.className = "analytics-settings";
  root.setAttribute("aria-label", ja ? "アクセス解析設定" : "Analytics settings");
  root.innerHTML = ja
    ? '<button type="button" data-settings aria-expanded="false">アクセス解析設定</button><section hidden data-panel><p>サイト改善のため、同意した場合のみGoogle Analyticsを使用します。<a href="/privacy">詳細</a></p><button type="button" data-deny>拒否する</button> <button type="button" data-allow>同意する</button></section>'
    : '<button type="button" data-settings aria-expanded="false">Analytics settings</button><section hidden data-panel><p>We use Google Analytics to improve this site only if you agree. <a href="/privacy">Privacy (Japanese)</a></p><button type="button" data-deny>Decline</button> <button type="button" data-allow>Accept</button></section>';
  document.body.append(root);
  const settings = root.querySelector("[data-settings]");
  const panel = root.querySelector("[data-panel]");
  function show(open) {
    panel.hidden = !open;
    settings.setAttribute("aria-expanded", String(open));
  }
  function choose(value) {
    try { localStorage.setItem(key, value); } catch { /* choice applies to this page */ }
    choice = value;
    show(false);
    settings.focus();
    if (value === "granted") start();
    else {
      window[disabled] = true;
      clearCookies();
      // Remove a previously loaded Google tag from the page after revocation.
      if (started) location.reload();
    }
  }
  settings.addEventListener("click", () => show(panel.hidden));
  root.querySelector("[data-allow]").addEventListener("click", () => choose("granted"));
  root.querySelector("[data-deny]").addEventListener("click", () => choose("denied"));
  if (choice === "granted") start();
  else if (choice !== "denied") show(true);
})();
