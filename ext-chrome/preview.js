(function () {
  function qs(n) { return new URLSearchParams(location.search).get(n); }
  const type = qs("type");
  const id = qs("id");
  const src = qs("src");
  const raw = qs("raw");
  const container = document.body;
  function el(tag, attrs) {
    const e = document.createElement(tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  if (raw) {
    const u = decodeURIComponent(raw);
    if (type === "audio") {
      const a = el("audio", { controls: "true", src: u });
      container.appendChild(a);
      a.play().catch(() => {});
    } else if (type === "video") {
      const v = el("video", { controls: "true", src: u, autoplay: "false" });
      container.appendChild(v);
    } else if (type === "image") {
      container.appendChild(el("img", { src: u }));
    } else {
      const iframe = el("iframe", { src: u, allow: "autoplay; encrypted-media; fullscreen; picture-in-picture", allowfullscreen: "true" });
      container.appendChild(iframe);
    }
    return;
  }
  if (type === "youtube" && id) {
    const iframe = el("iframe", { src: "https://www.youtube.com/embed/" + encodeURIComponent(id), allow: "autoplay; encrypted-media; fullscreen; picture-in-picture", allowfullscreen: "true" });
    container.appendChild(iframe);
    return;
  }
  if (type === "vimeo" && id) {
    const iframe = el("iframe", { src: "https://player.vimeo.com/video/" + encodeURIComponent(id), allow: "autoplay; fullscreen", allowfullscreen: "true" });
    container.appendChild(iframe);
    return;
  }
  if (type === "spotify" && id) {
    // id format: track|album/ID? already encoded in our param? we pass track/ID
    const iframe = el("iframe", { src: "https://open.spotify.com/embed/" + id, allow: "encrypted-media" });
    container.appendChild(iframe);
    return;
  }
  if (src) {
    const iframe = el("iframe", { src: decodeURIComponent(src), allow: "autoplay; encrypted-media; fullscreen" });
    container.appendChild(iframe);
    return;
  }
})();
