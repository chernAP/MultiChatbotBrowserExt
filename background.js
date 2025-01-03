// Хранит ID окна расширения
let windowId = null;

// Активация сервис-воркера
self.addEventListener('activate', () => {
  console.log('[Background] Service worker activated');
});

// Обработчик клика по иконке расширения
chrome.action.onClicked.addListener(async () => {
  console.log('[Background] Extension icon clicked');
  try {
    // Проверяем, существует ли уже окно расширения
    if (windowId) {
      const window = await chrome.windows.get(windowId).catch(() => null);
      if (window) {
        // Если окно существует, просто фокусируемся на нем
        await chrome.windows.update(windowId, { focused: true });
        return;
      }
    }

    // Создаем новое окно расширения
    const window = await chrome.windows.create({
      url: 'window.html',
      type: 'popup',
      width: 750,
      height: 600
    });

    // Сохраняем ID нового окна
    windowId = window.id;

    // Слушаем закрытие окна
    chrome.windows.onRemoved.addListener((closedWindowId) => {
      if (closedWindowId === windowId) {
        windowId = null;
      }
    });
  } catch (error) {
    console.error('[Background] Error:', error);
  }
});