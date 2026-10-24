// utils.js — shared helpers available to tools.js and content.js.
// Content scripts from the same extension run in the same isolated world, so a
// `var FC` declared here is visible in the later files (they share one scope).

var FC = (function () {
  const STALE = "Extension was reloaded. Refresh this page (F5) to reconnect.";

  // True while this content script still belongs to the loaded extension.
  function alive() {
    try {
      return !!(chrome && chrome.runtime && chrome.runtime.id);
    } catch (_) {
      return false;
    }
  }

  // Promise wrapper around chrome.runtime.sendMessage that unwraps {ok,data}.
  function callBg(type, payload) {
    return new Promise((resolve, reject) => {
      try {
        if (!alive()) return reject(new Error(STALE));
        chrome.runtime.sendMessage({ type, payload }, (res) => {
          if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
          if (!res) return reject(new Error("No response from background"));
          if (!res.ok) return reject(new Error(res.error || "Background error"));
          resolve(res.data);
        });
      } catch (e) {
        reject(new Error(STALE));
      }
    });
  }

  // storage.local helpers (promise based)
  function storeGet(key, fallback) {
    return new Promise((resolve, reject) => {
      try {
        if (!alive()) return reject(new Error(STALE));
        chrome.storage.local.get({ [key]: fallback }, (r) => {
          if (chrome.runtime.lastError) return reject(new Error(STALE));
          resolve(r[key]);
        });
      } catch (_) {
        reject(new Error(STALE));
      }
    });
  }
  function storeSet(key, value) {
    return new Promise((resolve, reject) => {
      try {
        if (!alive()) return reject(new Error(STALE));
        chrome.storage.local.set({ [key]: value }, () => {
          if (chrome.runtime.lastError) return reject(new Error(STALE));
          resolve();
        });
      } catch (_) {
        reject(new Error(STALE));
      }
    });
  }

  function isStale(error) {
    return String(error && error.message ? error.message : error).indexOf("Refresh this page") !== -1 ||
      String(error && error.message ? error.message : error).indexOf("context invalidated") !== -1;
  }

  // Create a DOM element: el("div", {class:"x"}, [child, "text"])
  function el(tag, props, children) {
    const node = document.createElement(tag);
    if (props) {
      for (const [k, v] of Object.entries(props)) {
        if (k === "class") node.className = v;
        else if (k === "html") node.innerHTML = v;
        else if (k === "text") node.textContent = v;
        else if (k === "style" && typeof v === "object") Object.assign(node.style, v);
        else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
        else if (v !== null && v !== undefined) node.setAttribute(k, v);
      }
    }
    if (children) {
      for (const c of [].concat(children)) {
        if (c == null) continue;
        node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
      }
    }
    return node;
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (m) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m])
    );
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const done = document.execCommand("copy");
      ta.remove();
      return done;
    }
  }

  function getSelection() {
    const sel = window.getSelection();
    return sel ? sel.toString().trim() : "";
  }

  function uuid() {
    return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  function debounce(fn, ms) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  function fmtDate(ts) {
    return new Date(ts).toLocaleString();
  }

  return {
    alive,
    isStale,
    STALE,
    callBg,
    storeGet,
    storeSet,
    el,
    escapeHtml,
    copy,
    getSelection,
    uuid,
    debounce,
    fmtDate,
  };
})();
