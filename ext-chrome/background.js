// background.js — MV3 service worker.
// Content scripts live inside the page (isolated world) and cannot use most
// privileged APIs (captureVisibleTab, tabs, bookmarks, downloads) or fetch
// cross-origin without CORS issues. This worker does that heavy lifting and
// talks to the content script through chrome.runtime messaging.

// ---------- tiny helpers ----------
const ok = (data) => ({ ok: true, data });
const err = (message) => ({ ok: false, error: String(message) });

// Folders used to group our saved bookmarks so they don't pollute the user's bar.
const BOOKMARK_FOLDER = "Floating Chat Saves";

// ---------- message router ----------
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  handle(msg, sender)
    .then(sendResponse)
    .catch((e) => sendResponse(err(e)));
  return true; // keep the message channel open for the async response
});

async function handle(msg, sender) {
  switch (msg && msg.type) {
    case "capture":
      return capture(sender, msg.payload);
    case "tabs:list":
      return listTabs();
    case "tabs:activate":
      return activateTab(msg.payload.tabId);
    case "tabs:close":
      return closeTab(msg.payload.tabId);
    case "session:save":
      return saveSession(msg.payload);
    case "session:list":
      return ok(await getStore("fc_sessions", {}));
    case "session:delete":
      return deleteSession(msg.payload.name);
    case "session:restore":
      return restoreSession(msg.payload);
    case "translate":
      return translate(msg.payload);
    case "rates":
      return rates();
    case "shorten":
      return shorten(msg.payload.url);
    case "qr":
      return qr(msg.payload.text);
    case "download":
      return download(msg.payload);
    case "bookmark:save":
      return bookmarkSave(msg.payload);
    case "bookmark:list":
      return bookmarkList();
    case "ai:chat":
      return aiChat(msg.payload);
    case "meta":
      return linkMeta(msg.payload.url);
    case "notify":
      return notify(msg.payload);
    default:
      return err("Unknown message type: " + (msg && msg.type));
  }
}

// ---------- local storage shortcuts (service worker shares chrome.storage) ----------
function getStore(key, fallback) {
  return new Promise((resolve) =>
    chrome.storage.local.get({ [key]: fallback }, (r) => resolve(r[key]))
  );
}
function setStore(key, value) {
  return new Promise((resolve) => chrome.storage.local.set({ [key]: value }, resolve));
}

// ---------- screenshots ----------
// captureVisibleTab is rate limited (max ~2 per second), so the content script
// drives the scroll loop and waits between calls.
async function capture(sender, payload) {
  const windowId = sender && sender.tab ? sender.tab.windowId : chrome.windows.WINDOW_ID_CURRENT;
  const dataUrl = await chrome.tabs.captureVisibleTab(windowId, { format: "png" });
  return ok(dataUrl);
}

// ---------- tabs ----------
async function listTabs() {
  const tabs = await chrome.tabs.query({});
  return ok(
    tabs.map((t) => ({
      id: t.id,
      title: t.title,
      url: t.url,
      favIconUrl: t.favIconUrl,
      active: t.active,
      pinned: t.pinned,
    }))
  );
}
async function activateTab(tabId) {
  const tab = await chrome.tabs.update(tabId, { active: true });
  if (tab && tab.windowId != null) await chrome.windows.update(tab.windowId, { focused: true });
  return ok(true);
}
async function closeTab(tabId) {
  await chrome.tabs.remove(tabId);
  return ok(true);
}

// ---------- sessions ----------
async function saveSession({ name, tabs }) {
  const sessions = await getStore("fc_sessions", {});
  sessions[name] = { tabs, savedAt: Date.now() };
  await setStore("fc_sessions", sessions);
  return ok(true);
}
async function deleteSession(name) {
  const sessions = await getStore("fc_sessions", {});
  delete sessions[name];
  await setStore("fc_sessions", sessions);
  return ok(true);
}
async function restoreSession({ name }) {
  const sessions = await getStore("fc_sessions", {});
  const s = sessions[name];
  if (!s) return err("Session not found");
  for (const url of s.tabs) {
    if (url && !url.startsWith("chrome://")) {
      await chrome.tabs.create({ url, active: false });
    }
  }
  return ok(true);
}

// ---------- network helpers (work here because of host_permissions) ----------
async function translate({ text, target }) {
  const url =
    "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=" +
    encodeURIComponent(target || "en") +
    "&dt=t&q=" +
    encodeURIComponent(text);
  const res = await fetch(url);
  if (!res.ok) throw new Error("translate HTTP " + res.status);
  const json = await res.json();
  const out = (json[0] || []).map((part) => part[0]).join("");
  return ok(out);
}

async function rates() {
  const res = await fetch("https://open.er-api.com/v6/latest/USD");
  if (!res.ok) throw new Error("rates HTTP " + res.status);
  const json = await res.json();
  return ok({ base: json.base_code, rates: json.rates, updated: json.time_last_update_utc });
}

async function shorten(url) {
  const res = await fetch("https://is.gd/create.php?format=json&url=" + encodeURIComponent(url));
  if (!res.ok) throw new Error("shorten HTTP " + res.status);
  const json = await res.json();
  if (json.errorcode) throw new Error(json.errormessage || "shorten failed");
  return ok(json.shorturl);
}

async function qr(text) {
  const res = await fetch(
    "https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=" + encodeURIComponent(text)
  );
  if (!res.ok) throw new Error("qr HTTP " + res.status);
  const buf = await res.arrayBuffer();
  const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
  return ok("data:image/png;base64," + b64);
}

async function download({ url, filename }) {
  const id = await chrome.downloads.download({ url, filename, saveAs: false });
  return ok(id);
}

// ---------- bookmarks ----------
async function getSaveFolderId() {
  const [existing] = await chrome.bookmarks.search({ title: BOOKMARK_FOLDER });
  if (existing) return existing.id;
  const created = await chrome.bookmarks.create({ title: BOOKMARK_FOLDER });
  return created.id;
}
async function bookmarkSave({ url, title, tags, note }) {
  const parentId = await getSaveFolderId();
  const taggedTitle = tags && tags.length ? `[${tags.join(",")}] ${title || url}` : title || url;
  const bm = await chrome.bookmarks.create({ parentId, title: taggedTitle, url });
  if (note) {
    const map = await getStore("fc_bm_notes", {});
    map[bm.id] = note;
    await setStore("fc_bm_notes", map);
  }
  return ok(bm);
}
async function bookmarkList() {
  const parentId = await getSaveFolderId();
  const children = await chrome.bookmarks.getChildren(parentId);
  const notes = await getStore("fc_bm_notes", {});
  return ok(children.map((c) => ({ ...c, note: notes[c.id] || "" })));
}

// ---------- AI (any OpenAI-compatible endpoint) ----------
async function aiChat({ endpoint, apiKey, model, messages }) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + apiKey,
    },
    body: JSON.stringify({ model, messages }),
  });
  if (!res.ok) throw new Error("AI HTTP " + res.status + " " + (await res.text()).slice(0, 200));
  const json = await res.json();
  const reply = json.choices?.[0]?.message?.content ?? "(no content)";
  return ok(reply);
}

// ---------- link preview metadata (Open Graph) ----------
async function linkMeta(url) {
  const res = await fetch(url, { redirect: "follow" });
  const html = (await res.text()).slice(0, 300000);
  const pick = (re) => {
    const m = html.match(re);
    return m ? m[1].replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim() : "";
  };
  const title =
    pick(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["']/i) ||
    pick(/<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']*)["']/i) ||
    pick(/<title[^>]*>([^<]*)<\/title>/i);
  const description =
    pick(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i) ||
    pick(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i);
  const image =
    pick(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)["']/i) ||
    pick(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']*)["']/i);
  return ok({ title, description, image, url });
}

// ---------- reminder scheduler (alarms survive reloads/tabs) ----------
const REMINDER_ALARM = "fc-reminders";

chrome.alarms.create(REMINDER_ALARM, { periodInMinutes: 1 });
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(REMINDER_ALARM, { periodInMinutes: 1 });
  checkReminders();
});
chrome.runtime.onStartup.addListener(() => {
  chrome.alarms.create(REMINDER_ALARM, { periodInMinutes: 1 });
  checkReminders();
});
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === REMINDER_ALARM) checkReminders();
});

async function checkReminders() {
  try {
    const reminders = await getStore("fc_reminders", []);
    let changed = false;
    for (const reminder of reminders) {
      if (!reminder.notified && new Date(reminder.when).getTime() <= Date.now()) {
        await notify({ title: "Reminder", message: reminder.text });
        reminder.notified = true;
        changed = true;
      }
    }
    if (changed) await setStore("fc_reminders", reminders);
  } catch (_) {}
}

// ---------- notifications ----------
async function notify({ title, message }) {
  await chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/icon128.png",
    title: title || "Floating Chat",
    message: message || "",
  });
  return ok(true);
}
