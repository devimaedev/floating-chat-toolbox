# ✅ TESTING / VERIFICATION GUIDE — Floating Chat Toolbox v3.4

Giya aron makumpirma nga **functional** ang 5 ka tools.
Sunda: **"Buhata"** → tan-awa ang **"Dapat makita"**.

---

## ⚙️ SETUP (sigurohon nga v3.4)

1. `chrome://extensions` → click **🔄** sa "Floating Chat Toolbox".
2. Sa address bar: `chrome://restart` → Enter (molimpyo sa cache).
3. Bag-ong tab → adto sa normal nga website (e.g. `https://example.com`).
4. Click **💬** (bottom-right).
5. **CHECK:** Welcome message = **"Floating Chat Toolbox v3.4 — 5 tools"**.
6. Click **🧰**.
7. **CHECK:** **Usa ra** ka grid, ug **5 ka card** (📝 📅 🔗 🌙 📊).

> Kung dili v3.4 → wala pa na-reload. Balik sa Step 1–2.

---

## 1️⃣ 📝 Notes / Scratchpad
| Buhata | Dapat makita |
|--------|--------------|
| Click **📝 Notes** (o type `notes` + Enter) | Title box + Note box + Save button |
| Type sa Title: `Test` ; sa Note: `hello` | Naka-type |
| Click **Save note** | Mugawas ang "Test" sa **All notes** ubos |
| Refresh ang page → ablihi balik | **Naa gihapon** ang note |
| Click **⧉** | Ma-copy ang text (naay "Copied" toast) |
| Click **🗑** | Matangtang ang note |

**RESULTA: ✅** (nag-save lokal via `chrome.storage.local`)

---

## 2️⃣ 📅 Quick Calendar / Reminders
| Buhata | Dapat makita |
|--------|--------------|
| Click **📅 Calendar** | Mini calendar (buwan karon); ang adlaw karon naka-highlight |
| Click **›** / **‹** | Mo-usab ang buwan |
| Type `meeting` + pilia date/time → **Add reminder** | Mugawas sa **Upcoming** |
| Click **🗑** | Matangtang ang reminder |

**RESULTA: ✅** (kung due na, mo-notify)

---

## 3️⃣ 🔗 URL Shortener / QR Generator
| Buhata | Dapat makita |
|--------|--------------|
| Click **🔗 URL Shortener** | Field naka-fill sa URL sa page |
| Click **Make QR** | Mugawas ang **QR image** |
| Click **Download QR** | Ma-download ang `qr.png` |
| Click **Shorten** | Mugawas ang `https://is.gd/...` |
| Click **Copy** | Ma-copy ang short URL |

**RESULTA: ✅** (kinahanglan internet)

---

## 4️⃣ 🌙 Dark Mode Toggle (per site)
| Buhata | Dapat makita |
|--------|--------------|
| Click **🌙 Dark Mode** | Toggle + Turn off buttons |
| Click **Toggle dark mode** | **Mo-itom** ang tibuok page |
| Click **Turn off** | Mobalik sa normal |
| Toggle balik → refresh ang page | **Dark gihapon** (remembered per site) |

**RESULTA: ✅**

---

## 5️⃣ 📊 Page Stats
| Buhata | Dapat makita |
|--------|--------------|
| Click **📊 Page Stats** | Mugawas dayon: Words, Characters, Reading time, Links, Images, Headings, Paragraphs, Forms |
| Click **Re-scan** | Mo-update ang numbers |

**RESULTA: ✅**

---

## ⭐ BONUS — Link preview
| Buhata | Dapat makita |
|--------|--------------|
| I-type/i-paste `https://www.youtube.com/watch?v=dQw4w9WgXcQ` + Enter | Preview card + **embedded player** (ma-play dayon) |
| I-paste ang `.mp3` link | **Audio player** |
| I-paste `github.com` | **Thumbnail + title** (Open Graph) |
| I-click ang **link sa ibabaw** (`🔗 host ↗`) | Moabli ang tibuok page sa bag-ong tab |
| I-type `open notes` / `qr code` | Moabli ang tool |
| I-type `hello` (wala'y match) | Mo-Google search |

**RESULTA: ✅**

---

## 🚫 KUNG DILI MO-FUNCTION

| Simtomas | Solusyon |
|----------|----------|
| Welcome dili v3.4 | Wala pa na-refresh → `chrome://extensions` 🔄 + `chrome://restart` |
| Walay 💬 button | Naa ka sa `chrome://` page — gamit ug normal nga website |
| Daghan ang grid / duplicate | Wala pa na-reload ang bag-ong code → refresh + restart |
| QR/Shorten error | Walay internet, o gi-block — sulayi sa lain nga site |
| Dark mode walay epekto | Sulayi sa laing site (ang uban naay kaugalingon nga dark mode) |

---

## 📋 SUMMARY nga Checklist
- [ ] v3.4 sa welcome
- [ ] Usa ra ka grid, 5 cards
- [ ] Notes: Save → naa sa lista
- [ ] Calendar: Add reminder → naa sa Upcoming
- [ ] QR: Make QR → naay image
- [ ] Shortener: Shorten → naay is.gd link
- [ ] Dark Mode: Toggle → mo-itom
- [ ] Page Stats: naay numbers
- [ ] Link paste: moabli dayon
