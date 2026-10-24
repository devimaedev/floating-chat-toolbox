# 🎬 PRESENTATION GUIDE — Floating Chat Toolbox v3.4

Giya sa paggamit sa 5 ka tools + unsaon pag-explain atol sa presentation.

---

## 🟢 BAG-O SA PAGSUGOD (Opening demo)

1. Ablihi ang **Chrome** ug adto sa bisan unsang website (e.g. `https://example.com`).
2. Click ang **💬 button** sa **bottom-right** sa screen.
3. Mugawas ang panel: welcome message + **grid sa 5 ka tools**.
4. Para moabli sa usa ka tool:
   - Click **🧰** (taas-tuo) → click ang tool card, **O**
   - I-type ang ngalan sa input (e.g. `notes`) + Enter.

> **Isulti:** "Kini usa ka Chrome extension nga nagbutang ug floating chat button sa bisan unsang website. Sulod niini naa ang 5 ka gamit nga tool."

---

## 1️⃣ 📝 Notes / Scratchpad

**Unsaon:**
1. I-type `notes` + Enter (o click ang card).
2. Sa **Title**, i-type ang ulohan (e.g. "Meeting notes").
3. Sa **Note**, i-type ang sulud.
4. Click **Save note**.
5. Mugawas sa **All notes** sa ubos.
6. Click ang note para ma-reload/edit; **⧉** para mo-copy; **🗑** para mo-delete.

**Explanation:**
- Nag-save sa `chrome.storage.local` (storage sa browser mismo).
- **Mopadayon** ang notes bisan i-refresh o isira ang browser.
- Wala kini mag-gamit ug internet — local ra.

> **Isulti:** "Dali kaayo maglista ug ideya o reminder direkta sa page nga walay pag-abli ug laing app. Naka-save kini lokal, so naa gihapon kung mobalik ka."

---

## 2️⃣ 📅 Quick Calendar / Reminders

**Unsaon:**
1. I-type `calendar` + Enter.
2. Makita ang **mini calendar** (buwan karon). Click **‹ ›** para mag-change ug buwan; ang **karon** naka-highlight.
3. Sa **New reminder**: i-type ang text + pilia ang **date & time** (datetime field).
4. Click **Add reminder** → makita sa **Upcoming**.
5. Kung moabot na ang oras → mugawas ang **desktop notification**.
6. Click **🗑** para tangtangon ang reminder.

**Explanation:**
- Ang calendar gibuhat gamit ang JavaScript `Date` math.
- Ang reminders naka-save lokal ug gi-check kada minuto.
- `chrome.notifications` ang nagpakita sa alert.

> **Isulti:** "Naa mi quick calendar nga naay reminders. Dili na kinahanglan mobalhin ug tab o mo-abli ug calendar app — direkta kini sa page ug mo-notify kung due na."

---

## 3️⃣ 🔗 URL Shortener / QR Generator

**Unsaon:**
1. I-type `qr` (o `shortener`) + Enter.
2. Ang field naka-fill na sa **URL sa karon nga page**.
3. Click **Make QR** → mugawas ang **QR code**; click **Download QR** para i-save.
4. Click **Shorten** → mugawas ang **short URL** (via is.gd); click **Copy**.
5. **Use page URL** para i-reset ang field sa kasamtangang page.

**Explanation:**
- Ang QR ug pag-shorten gihimo sa **background service worker** (para walay CORS issue).
- Naggamit ug internet: QR image API + `is.gd` shortener.

> **Isulti:** "Pwede namo ma-generate ug QR code o ma-shorten ang usa ka link direkta — gamit kaayo para mag-share sa phone o sa chat."

---

## 4️⃣ 🌙 Dark Mode Toggle (per site)

**Unsaon:**
1. I-type `dark` + Enter.
2. Click **Toggle dark mode** → **mo-itom** ang page (ma-invert).
3. Click **Turn off** → mobalik sa normal.
4. I-refresh ang page → **dark gihapon** (naka-remember).

**Explanation:**
- Nag-inject ug CSS `filter: invert(1) hue-rotate(180deg)` sa `body`.
- Gi-re-invert ang mga hulagway/video para normal gihapon ang kolor.
- Naka-save **per website** (hostname).

> **Isulti:** "Para sa mga site nga walay dark mode, maka-one-click ta ug dark theme nga naka-remember per site."

---

## 5️⃣ 📊 Page Stats

**Unsaon:**
1. I-type `stats` + Enter.
2. Makita dayon: **Words, Characters, Reading time, Links, Images, Headings, Paragraphs, Forms**.
3. Click **Re-scan** para i-update.

**Explanation:**
- Nagbasa sa DOM: `document.body.innerText` para sa words/characters.
- Reading time = words ÷ 200 words/min.

> **Isulti:** "Maka-kita ta unsa ka-taas ang usa ka artikulo — pila ka pulong ug pila ka minuto basahon — gamit ang page stats."

---

## ⭐ BONUS — Link previews

1. Sa input box, **i-paste** o i-type ang link (e.g. `https://www.youtube.com/watch?v=dQw4w9WgXcQ`).
2. **Enter** → mugawas ang **preview card**: makita/ma-play dayon ang music o video.
3. I-click ang **link sa ibabaw** (`🔗 youtube.com ↗`) para ma-abli ang tibuok page.

| Link nga i-paste | Mugawas |
|------------------|---------|
| YouTube / Spotify / Vimeo | ▶️ embedded player (ma-play dayon) |
| `.mp3` / `.wav` | 🔊 audio player |
| `github.com` (generic) | 🖼️ thumbnail + title |

> **Isulti:** "I-paste lang ang link — makita dayon kung unsa siya (music, video, o article), unya i-click ang link sa ibabaw para moabli ang tibuok."

---

## 🎤 SUGGESTED DEMO ORDER

1. Ablihi ang 💬 ug ipakita ang **5 tools** (grid).
2. **Notes** — pagsulat ug save ug usa ka note.
3. **Page Stats** — ipakita ang word count sa page.
4. **Dark Mode** — i-toggle (makahanduraw nga epekto).
5. **QR / Shortener** — pag-generate ug QR + shorten.
6. **Calendar** — pag-add ug reminder.
7. **Link paste** — bonus.

## 🧠 Parasabut sa architecture (kung gipangutana)

- **content.js** — nag-buhat sa floating panel (UI).
- **tools.js** — ang 5 ka tools.
- **utils.js** — shared helpers (storage, messaging, copy).
- **background.js** — service worker: fetch sa QR/shortener + notifications.
- **manifest.json** — config sa extension (MV3).
