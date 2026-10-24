// tools.js — 5 functional tools

var FC_TOOLS = [];
var FC_TOOL_HOOKS = [];

// ==========================================
// HELPERS
// ==========================================

function h(tag, props, children) {
  return FC.el(tag, props, children);
}

function btn(label, onClick, cls) {
  return h("button", {
    class: "fc-btn " + (cls || ""),
    type: "button",
    onclick: onClick,
    text: label
  });
}

function field(labelText, input) {
  return h("label", { class: "fc-field" }, [
    h("span", { class: "fc-field-label", text: labelText }),
    input
  ]);
}

function section(titleText) {
  return h("div", { class: "fc-section", text: titleText });
}

function note(text) {
  return h("p", { class: "fc-note", text: text });
}

function resultBox() {
  return h("div", { class: "fc-result" });
}

function toastIn(mount, text) {
  const t = h("div", { class: "fc-toast", text: text });
  mount.appendChild(t);
  setTimeout(() => t.remove(), 1600);
}

function register(id, icon, name, desc, mountFn, initFn) {
  FC_TOOLS.push({
    id: id,
    icon: icon,
    name: name,
    desc: desc,
    mount: mountFn,
    init: initFn
  });

  if (typeof initFn === "function") {
    FC_TOOL_HOOKS.push(initFn);
  }
}

// ==========================================
// 1. NOTES / SCRATCHPAD
// ==========================================

register(
  "notes",
  "📝",
  "Notes",
  "Quick notes saved to this browser.",
  function (root) {
    const title = h("input", {
      class: "fc-input",
      placeholder: "Note title"
    });

    const body = h("textarea", {
      class: "fc-textarea",
      rows: "5",
      placeholder: "Write something..."
    });

    const listBox = h("div", { class: "fc-list" });

    async function renderList() {
      const notes = await FC.storeGet("fc_notes", []);
      listBox.innerHTML = "";

      if (!notes.length) {
        listBox.appendChild(note("No notes yet."));
      }

      notes.forEach(function (n) {
        listBox.appendChild(
          h("div", { class: "fc-item" }, [
            h("div", {
              class: "fc-item-main",
              onclick: function () {
                title.value = n.title || "";
                body.value = n.text || "";
              }
            }, [
              h("div", {
                class: "fc-item-title",
                text: n.title || "(untitled)"
              }),
              h("div", {
                class: "fc-item-sub fc-clamp",
                text: n.text || ""
              })
            ]),

            h("div", { class: "fc-item-actions" }, [
              btn("⧉", async function () {
                await FC.copy(n.text || "");
                toastIn(root, "Copied");
              }, "fc-btn-icon"),

              btn("🗑", async function () {
                const current = await FC.storeGet("fc_notes", []);
                await FC.storeSet(
                  "fc_notes",
                  current.filter(function (x) {
                    return x.id !== n.id;
                  })
                );
                await renderList();
              }, "fc-btn-icon")
            ])
          ])
        );
      });
    }

    const save = btn("Save note", async function () {
      const noteTitle = title.value.trim();
      const noteText = body.value.trim();

      if (!noteTitle && !noteText) {
        toastIn(root, "Please enter a note.");
        return;
      }

      try {
        const notes = await FC.storeGet("fc_notes", []);

        notes.unshift({
          id: FC.uuid(),
          title: noteTitle,
          text: noteText
        });

        await FC.storeSet("fc_notes", notes);

        title.value = "";
        body.value = "";

        await renderList();
        toastIn(root, "Note saved");
      } catch (error) {
        console.error("Save note error:", error);
        toastIn(root, "Could not save note.");
      }
    }, "fc-btn-primary");

    root.append(
      field("Title", title),
      field("Note", body),
      h("div", { class: "fc-row" }, [save]),
      section("All notes"),
      listBox
    );

    renderList().catch(function (e) {
      if (typeof FC.isStale === "function" && FC.isStale(e)) return;
      console.error("Load notes failed:", e);
    });
  }
);

// ==========================================
// 2. QUICK CALENDAR / REMINDERS
// ==========================================

register(
  "calendar",
  "📅",
  "Calendar",
  "Mini month view plus reminders that notify you.",
  function (root) {
    const now = new Date();

    let viewYear = now.getFullYear();
    let viewMonth = now.getMonth();

    const gridHead = h("div", {
      class: "fc-cal-head",
      text: "Month"
    });

    const grid = h("div", { class: "fc-cal" });

    const prev = btn("‹", function () {
      viewMonth--;

      if (viewMonth < 0) {
        viewMonth = 11;
        viewYear--;
      }

      draw();
    });

    const next = btn("›", function () {
      viewMonth++;

      if (viewMonth > 11) {
        viewMonth = 0;
        viewYear++;
      }

      draw();
    });

    function draw() {
      gridHead.textContent = new Date(
        viewYear,
        viewMonth
      ).toLocaleString(undefined, {
        month: "long",
        year: "numeric"
      });

      grid.innerHTML = "";

      ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].forEach(
        function (day) {
          grid.appendChild(
            h("div", {
              class: "fc-cal-dow",
              text: day
            })
          );
        }
      );

      const first = new Date(
        viewYear,
        viewMonth,
        1
      ).getDay();

      const days = new Date(
        viewYear,
        viewMonth + 1,
        0
      ).getDate();

      for (let i = 0; i < first; i++) {
        grid.appendChild(h("div", {}));
      }

      for (let d = 1; d <= days; d++) {
        const isToday =
          d === now.getDate() &&
          viewMonth === now.getMonth() &&
          viewYear === now.getFullYear();

        grid.appendChild(
          h("div", {
            class: "fc-cal-day" + (isToday ? " today" : ""),
            text: String(d)
          })
        );
      }
    }

    const remText = h("input", {
      class: "fc-input",
      placeholder: "Reminder text"
    });

    const remWhen = h("input", {
      class: "fc-input",
      type: "datetime-local"
    });

    const remStatus = h("p", { class: "fc-note fc-rem-status" });

    function localISO(date) {
      return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
    }
    function setWhen(date) {
      remWhen.value = localISO(date);
      remStatus.textContent = "";
    }
    function inMinutes(mins) {
      return new Date(Date.now() + mins * 60000);
    }
    function tomorrowMorning() {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(9, 0, 0, 0);
      return d;
    }
    setWhen(inMinutes(60));

    const quickRow = h("div", { class: "fc-row fc-quick" }, [
      btn("+10 min", function () { setWhen(inMinutes(10)); }, "fc-chip"),
      btn("+1 hour", function () { setWhen(inMinutes(60)); }, "fc-chip"),
      btn("Tomorrow 9:00", function () { setWhen(tomorrowMorning()); }, "fc-chip")
    ]);

    const remBox = h("div", { class: "fc-list" });

    async function renderRems() {
      const reminders = await FC.storeGet("fc_reminders", []);

      remBox.innerHTML = "";

      if (!reminders.length) {
        remBox.appendChild(note("No reminders."));
      }

      reminders.forEach(function (reminder) {
        const due = new Date(reminder.when);
        const overdue = due.getTime() < Date.now();

        remBox.appendChild(
          h("div", { class: "fc-item" }, [
            h("div", { class: "fc-item-main" }, [
              h("div", {
                class: "fc-item-title",
                text: reminder.text
              }),

              h("div", {
                class: "fc-item-sub",
                style: {
                  color: overdue ? "#dc2626" : ""
                },
                text: due.toLocaleString()
              })
            ]),

            h("div", { class: "fc-item-actions" }, [
              btn("🗑", async function () {
                const current = await FC.storeGet(
                  "fc_reminders",
                  []
                );

                await FC.storeSet(
                  "fc_reminders",
                  current.filter(function (item) {
                    return item.id !== reminder.id;
                  })
                );

                await renderRems();
              }, "fc-btn-icon")
            ])
          ])
        );
      });
    }

    const addRem = btn("Add reminder", async function () {
      const reminderText = remText.value.trim();

      if (!reminderText) {
        remStatus.textContent = "Please type the reminder text first.";
        toastIn(root, "Please type the reminder text.");
        return;
      }

      if (!remWhen.value) setWhen(inMinutes(60));

      const date = new Date(remWhen.value);

      if (Number.isNaN(date.getTime())) {
        remStatus.textContent = "Invalid date/time. Please pick again.";
        toastIn(root, "Invalid reminder date.");
        return;
      }

      try {
        const reminders = await FC.storeGet(
          "fc_reminders",
          []
        );

        reminders.unshift({
          id: FC.uuid(),
          text: reminderText,
          when: date.toISOString(),
          notified: false
        });

        await FC.storeSet("fc_reminders", reminders);

        remText.value = "";
        setWhen(inMinutes(60));

        await renderRems();
        remStatus.textContent = "Reminder added ✓";
        toastIn(root, "Reminder added");

        const first = remBox.firstElementChild;
        if (first && first.classList.contains("fc-item")) {
          first.classList.add("fc-new");
          setTimeout(function () { first.classList.remove("fc-new"); }, 2200);
          try { first.scrollIntoView({ block: "nearest" }); } catch (_) {}
        }
      } catch (error) {
        if (!(typeof FC.isStale === "function" && FC.isStale(error))) {
          console.error("Add reminder error:", error);
        }
        remStatus.textContent = "Could not save. Refresh this page (F5) and try again.";
        toastIn(root, "Could not save reminder.");
      }
    }, "fc-btn-primary");

    remText.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        addRem.click();
      }
    });

    root.append(
      h("div", { class: "fc-row fc-between" }, [
        prev,
        gridHead,
        next
      ]),
      grid,
      section("New reminder"),
      field("Text", remText),
      field("When", remWhen),
      quickRow,
      addRem,
      remStatus,
      section("Upcoming"),
      remBox
    );

    draw();
    renderRems().catch(function (e) {
      if (typeof FC.isStale === "function" && FC.isStale(e)) return;
      console.error("Load reminders failed:", e);
    });
  }
);

// ==========================================
// 3. URL SHORTENER / QR GENERATOR
// ==========================================

register(
  "qr",
  "🔗",
  "QR & Links",
  "Make a QR code or shorten the current URL.",
  function (root) {
    const input = h("input", {
      class: "fc-input",
      value: location.href
    });

    const qrImg = h("img", { class: "fc-qr" });

    const shortOut = h("input", {
      class: "fc-input fc-mono",
      readonly: true
    });

    async function generateQR(showToast) {
      if (!input.value.trim()) return;
      try {
        qrImg.src = await FC.callBg("qr", { text: input.value });
        if (showToast) toastIn(root, "QR ready");
      } catch (error) {
        if (showToast) {
          toastIn(root, FC.isStale(error) ? "Refresh this page (F5)." : "QR error: " + error.message);
        }
      }
    }

    const makeQR = btn("Make QR", function () {
      generateQR(true);
    }, "fc-btn-primary");

    // Auto-generate while typing so the result is instant.
    input.addEventListener("input", FC.debounce(function () {
      generateQR(false);
    }, 400));

    const shorten = btn("Shorten", async function () {
      if (!input.value.trim()) return;

      shortOut.value = "Working...";

      try {
        shortOut.value = await FC.callBg("shorten", {
          url: input.value
        });
      } catch (error) {
        shortOut.value = "Error: " + error.message;
      }
    });

    const dlQr = btn("Download QR", function () {
      if (!qrImg.src) return;

      const a = document.createElement("a");
      a.href = qrImg.src;
      a.download = "qr.png";
      a.click();
    });

    const usePage = btn("Use page URL", function () {
      input.value = location.href;
    });

    const copyShort = btn("Copy", async function () {
      if (shortOut.value) {
        await FC.copy(shortOut.value);
        toastIn(root, "Copied");
      }
    });

    root.append(
      field("Text / URL", input),
      h("div", { class: "fc-row" }, [makeQR, usePage]),
      qrImg,
      h("div", { class: "fc-row" }, [dlQr]),
      section("URL shortener"),
      h("div", { class: "fc-row" }, [shorten]),
      field("Short URL", shortOut),
      h("div", { class: "fc-row" }, [copyShort]),
      note("Tip: QR ug shortener nanginahanglan internet.")
    );

    // Show the QR right away when the tool opens.
    generateQR(false);
  }
);

// ==========================================
// 4. DARK MODE (floating chat only)
// ==========================================

var FC_CHAT_THEME_KEY = "fc_chat_theme";

function fcApplyDark(enabled) {
  var root = document.getElementById("fc-root");
  if (root) root.classList.toggle("fc-theme-dark", !!enabled);

  // Remove the old page-inverting style from previous versions.
  var legacy = document.getElementById("fc-dark-style");
  if (legacy) legacy.remove();
}

function fcLoadTheme() {
  return FC.storeGet(FC_CHAT_THEME_KEY, "light").then(function (value) {
    return value === "dark";
  });
}

register(
  "dark",
  "🌙",
  "Dark Mode",
  "Dark or light theme for the floating chat only.",
  function (root) {
    const status = note("Chat theme: Light");

    function updateStatus(dark) {
      status.textContent = dark ? "Chat theme: Dark" : "Chat theme: Light";
    }

    async function setTheme(dark) {
      updateStatus(dark);
      fcApplyDark(dark);
      try {
        await FC.storeSet(FC_CHAT_THEME_KEY, dark ? "dark" : "light");
      } catch (error) {
        if (typeof FC.isStale === "function" && FC.isStale(error)) {
          toastIn(root, "Refresh this page (F5) to reconnect.");
        } else {
          toastIn(root, "Could not save theme.");
        }
      }
    }

    const darkBtn = btn("Dark chat", function () { setTheme(true); }, "fc-btn-primary");
    const lightBtn = btn("Light chat", function () { setTheme(false); });

    root.append(
      h("div", { class: "fc-row" }, [darkBtn, lightBtn]),
      status,
      note("Applies to the floating chat only. The website stays the same.")
    );

    fcLoadTheme()
      .then(function (dark) {
        fcApplyDark(dark);
        updateStatus(dark);
      })
      .catch(function () {});
  }
);

FC_TOOL_HOOKS.push(async function () {
  try {
    const dark = await fcLoadTheme();
    fcApplyDark(dark);
  } catch (error) {
    if (!FC.isStale(error)) console.error("Could not restore chat theme:", error);
  }
});

// ==========================================
// 5. PAGE STATS
// ==========================================

register(
  "stats",
  "📊",
  "Page Stats",
  "Professional snapshot of this page.",
  function (root) {
    const out = h("div", { class: "fc-stats" });
    const foot = h("div", { class: "fc-stats-foot" });

    function collect() {
      const text = (document.body.innerText || "")
        .replace(/\s+/g, " ")
        .trim();
      const words = text ? text.split(" ").length : 0;
      const chars = text.length;
      const readMin = Math.max(1, Math.round(words / 200));

      return {
        words: words,
        chars: chars,
        readMin: readMin,
        links: document.querySelectorAll("a[href]").length,
        images: document.images.length,
        headings: document.querySelectorAll("h1,h2,h3,h4,h5,h6").length,
        paragraphs: document.querySelectorAll("p").length,
        forms: document.querySelectorAll("form").length,
        host: location.hostname || "this page",
        scanned: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
    }

    function tile(label, value) {
      return h("div", { class: "fc-stat-tile" }, [
        h("div", { class: "fc-stat-label", text: label }),
        h("div", { class: "fc-stat-value", text: String(value) })
      ]);
    }

    function render(data) {
      out.innerHTML = "";
      out.appendChild(
        h("div", { class: "fc-stats-hero" }, [
          h("div", { class: "fc-stats-hero-value", text: "≈ " + data.readMin + " min read" }),
          h("div", {
            class: "fc-stats-hero-sub",
            text: data.words.toLocaleString() + " words · " +
              data.chars.toLocaleString() + " characters"
          })
        ])
      );
      out.appendChild(
        h("div", { class: "fc-stats-grid" }, [
          tile("Links", data.links),
          tile("Images", data.images),
          tile("Headings", data.headings),
          tile("Paragraphs", data.paragraphs),
          tile("Forms", data.forms),
          tile("Characters", data.chars)
        ])
      );
      foot.textContent = "Scanned " + data.scanned + " · " + data.host;
    }

    function scan() {
      const data = collect();
      render(data);
      return data;
    }

    const top = h("div", { class: "fc-stats-top" }, [
      h("div", { class: "fc-stats-host", text: location.hostname || "this page" }),
      h("div", { class: "fc-stats-actions" }, [
        btn("Re-scan", scan, "fc-stats-btn"),
        btn("Copy", async function () {
          const d = collect();
          const lines = [
            "Page Stats — " + d.host,
            "Words: " + d.words,
            "Characters: " + d.chars,
            "Reading time: " + d.readMin + " min",
            "Links: " + d.links,
            "Images: " + d.images,
            "Headings: " + d.headings,
            "Paragraphs: " + d.paragraphs,
            "Forms: " + d.forms
          ];
          try {
            await FC.copy(lines.join("\n"));
            toastIn(root, "Stats copied");
          } catch (_) {
            toastIn(root, "Copy failed");
          }
        }, "fc-stats-btn fc-stats-copy")
      ])
    ]);

    root.append(top, out, foot);
    scan();
  }
);

// 6. CALCULATOR
// ==========================================

function calcEval(src) {
  const s = String(src)
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/−/g, "-")
    .replace(/,/g, ".");
  let i = 0;

  function ws() {
    while (i < s.length && /\s/.test(s[i])) i++;
  }
  function peek() {
    ws();
    return s[i];
  }
  function parseExpr() {
    let v = parseTerm();
    for (;;) {
      const c = peek();
      if (c === "+") { i++; v += parseTerm(); }
      else if (c === "-") { i++; v -= parseTerm(); }
      else break;
    }
    return v;
  }
  function parseTerm() {
    let v = parseUnary();
    for (;;) {
      const c = peek();
      if (c === "*") { i++; v *= parseUnary(); }
      else if (c === "/") { i++; v /= parseUnary(); }
      else break;
    }
    return v;
  }
  function parseUnary() {
    const c = peek();
    if (c === "-") { i++; return -parseUnary(); }
    if (c === "+") { i++; return parseUnary(); }
    return parsePow();
  }
  function parsePow() {
    const base = parsePrimary();
    if (peek() === "^") { i++; return Math.pow(base, parseUnary()); }
    return base;
  }
  function parsePrimary() {
    const c = peek();
    if (c === "(") {
      i++;
      const v = parseExpr();
      if (peek() !== ")") throw new Error("Missing )");
      i++;
      return v;
    }
    if (c === undefined) throw new Error("Empty");
    const start = i;
    if (c === "." || /[0-9]/.test(c)) {
      while (i < s.length && /[0-9.]/.test(s[i])) i++;
      const num = parseFloat(s.slice(start, i));
      if (!isFinite(num)) throw new Error("Bad number");
      return num;
    }
    throw new Error("Unexpected " + c);
  }

  const value = parseExpr();
  ws();
  if (i < s.length) throw new Error("Unexpected " + s[i]);
  if (!isFinite(value)) throw new Error("Math error");
  return value;
}

function calcFormat(value) {
  const rounded = Number(value.toPrecision(12));
  if (rounded !== 0 && (Math.abs(rounded) >= 1e15 || Math.abs(rounded) < 1e-9)) {
    return rounded.toExponential(6);
  }
  return String(rounded);
}

register(
  "calculator",
  "🧮",
  "Calculator",
  "Quick calculator with + − × ÷, parentheses and powers.",
  function (root) {
    const display = h("input", {
      class: "fc-input fc-calc-display",
      placeholder: "0",
      readonly: "",
      inputmode: "none"
    });

    const grid = h("div", { class: "fc-calc-grid" });

    function press(key) {
      if (key === "C") {
        display.value = "";
        return;
      }
      if (key === "⌫") {
        display.value = display.value.slice(0, -1);
        return;
      }
      if (key === "=") {
        if (!display.value.trim()) return;
        try {
          display.value = calcFormat(calcEval(display.value));
        } catch (error) {
          display.value = "Error";
        }
        return;
      }
      if (display.value === "Error") display.value = "";
      display.value += key;
    }

    [
      "C", "⌫", "(", ")",
      "7", "8", "9", "÷",
      "4", "5", "6", "×",
      "1", "2", "3", "−",
      "0", ".", "=", "+"
    ].forEach(function (key) {
      const isOp = "÷×−+".indexOf(key) !== -1;
      grid.appendChild(
        h("button", {
          class: "fc-calc-key" + (isOp ? " op" : "") + (key === "=" ? " equals" : ""),
          type: "button",
          text: key,
          onclick: function () { press(key); }
        })
      );
    });

    root.append(display, grid);
  }
);
