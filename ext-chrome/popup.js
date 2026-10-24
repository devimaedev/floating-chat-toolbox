// popup.js — the toolbar popup. Its one job is to tell the current tab's
// content script to open the floating panel.
document.getElementById("open").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) return;
  try {
    await chrome.tabs.sendMessage(tab.id, { type: "fc:toggle" });
  } catch (_) {
    // Content script not injected yet (e.g. chrome:// pages) — ignore.
  }
  window.close();
});
