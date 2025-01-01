let windowId = null;

// Ensure service worker activation
self.addEventListener('activate', event => {
  console.log('[Background] Service worker activated');
});

// Handle extension icon click
chrome.action.onClicked.addListener(async () => {
    console.log('[Background] Extension icon clicked');
  try {
    if (windowId) {
        console.log('[Background] Checking for existing window:', windowId);
      const window = await chrome.windows.get(windowId).catch(() => null);
      if (window) {
          console.log('[Background] Existing window found, focusing:', windowId);
        await chrome.windows.update(windowId, { focused: true });
        return;
      }
    }
        console.log('[Background] Creating new window.');

    const window = await chrome.windows.create({
      url: 'window.html',
      type: 'popup',
      width: 500,
      height: 600
    });

    windowId = window.id;
    console.log('[Background] New window created:', windowId);

    chrome.windows.onRemoved.addListener((closedWindowId) => {
        console.log('[Background] Window removed:', closedWindowId);
      if (closedWindowId === windowId) {
          console.log('[Background] Window removed is the extension window, resetting windowId.');
        windowId = null;
      }
    });
  } catch (error) {
    console.error('[Background] Error handling click:', error);
  }
});