# 💬 Floating Chat Toolbox — Chrome Extension (Manifest V3)

A single floating 💬 button that opens a chat-style panel with **5 tools**.
Every tool opens as a "card" in the message stream, and you can also launch a
tool by typing its name in the input box.

## 🧰 The 5 tools

| # | Tool | What it does | Key technique |
|---|------|--------------|---------------|
| 1 | 📝 **Notes / Scratchpad** | Write, save, reopen, copy and delete notes. | `chrome.storage.local` |
| 2 | 📅 **Quick Calendar / Reminders** | Mini month view + reminders that notify you when due. | Date math + storage + `setInterval` + `chrome.notifications` |
| 3 | 🔗 **URL Shortener / QR Generator** | Makes a QR code and shortens a URL. | Background `fetch` (QR image API + `is.gd`) |
| 4 | 🌙 **Dark Mode Toggle** | One-click dark theme per website, remembered. | Injected `filter: invert()` stylesheet per hostname |
| 5 | 📊 **Page Stats** | Word count, characters, reading time, links, images, headings. | DOM inspection |

### Notes / limitations
- **Reminders** notify while a tab is open; they are stored locally.
- **QR / Shortener** need internet access.
- Some tools won't run on `chrome://` pages (Chrome forbids content scripts there).

### ⭐ Bonus — Link previews
Paste or type a link and the chat shows a **preview card** (it does *not* auto-open):
- **YouTube / Vimeo / Spotify** → playable embedded player.
- **Direct audio** (`.mp3`, `.wav`, …) → inline audio player; **video** (`.mp4`) → inline video.
- **Any other page** → thumbnail + title + description (Open Graph, fetched by the background worker).
- A clickable link on **top** of the card (`🔗 host ↗`) opens the full page in a new tab.
- Typing a tool name (e.g. `open notes`, `qr code`) opens that tool. Anything else opens a Google search.

---

## 📁 File structure

```
ext-chrome/
├── manifest.json     # Extension config: permissions, content scripts, worker
├── background.js     # Service worker: CORS-free fetch (QR, shortener) + notifications
├── utils.js          # Shared helpers (messaging, storage, DOM builder, copy…)
├── tools.js          # The 5 tools; each self-registers into FC_TOOLS
├── content.js        # The panel UI shell: button, stream, input, tool cards
├── styles.css        # All panel/card/reader styles (namespaced with fc-)
├── popup.html        # Toolbar popup (quick launcher)
├── popup.js          # Popup logic: asks the page to open the panel
├── README.md         # This file
└── icons/            # 16/48/128 px toolbar icons
```

### Why split into these files?
- **content scripts** run inside the page, can touch the DOM, but **cannot** make
  cross-origin `fetch` without CORS problems.
- **background.js** (service worker) *can* fetch cross-origin thanks to
  `host_permissions`. The content script calls it via `FC.callBg(...)`.

---

## 🚀 How to load it

1. Open `chrome://extensions`.
2. Turn on **Developer mode** (top-right toggle).
3. Click **Load unpacked** and choose this `ext-chrome` folder.
4. Open a normal website and click the 💬 button (bottom-right), or the toolbar
   icon → **Open on this page**.

> After editing `manifest.json`, `background.js`, or any content script, click the
> 🔄 refresh arrow on the Extensions page, then reload the web page.

---

## 🧠 How the pieces talk

```
      page DOM                     isolated world                service worker
 ┌────────────────┐   injects   ┌────────────────────┐  message  ┌────────────────┐
 │  any website   │ ──────────► │ content.js (panel) │ ────────► │ background.js  │
 │                │             │  + tools.js        │  callBg   │ fetch / notify │
 │                │ ◄────────── │  + utils.js        │ ◄──────── │                │
 └────────────────┘             └────────────────────┘  {ok,data} └────────────────┘
```

- `tools.js` registers each tool: `register(id, icon, name, desc, mount, init)`.
- `content.js` builds the UI and calls `tool.mount(cardBody)` when a tool opens.
- `init` hooks (dark-mode reapply, reminder timer) run once at page load.

## 🔐 Permissions used

| Permission | Reason |
|-----------|--------|
| `storage` | Save notes, dark-mode prefs, reminders |
| `notifications` | Reminder alerts |
| `host_permissions: <all_urls>` | Inject on all pages + CORS-free QR/shortener fetches |
