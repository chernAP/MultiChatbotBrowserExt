console.log("[Window Script]: Window script loaded");

document.addEventListener('DOMContentLoaded', async function() {
    console.log('[Window Script]: DOMContentLoaded event fired');

    const tabsList = document.getElementById('tabsList');
    console.log('[Window Script]: Tabs list element:', tabsList);

    const sendButton = document.getElementById('sendButton');
    console.log('[Window Script]: Send button element:', sendButton);

    const inputText = document.getElementById('inputText');
    console.log('[Window Script]: Input text element:', inputText);

    // Загружаем сохраненные выбранные вкладки
    console.log('[Window Script]: Загружаем сохраненные выбранные вкладки...');
    const { selectedTabs = {} } = await chrome.storage.local.get('selectedTabs');
    console.log('[Window Script]: Сохраненные выбранные вкладки:', selectedTabs);

    // Получаем список всех вкладок
    console.log('[Window Script]: Получаем список всех вкладок...');
    const tabs = await chrome.tabs.query({});
    console.log('[Window Script]: Список всех вкладок:', tabs);

    // Создаем элементы для каждой вкладки
    tabs.forEach(tab => {
        console.log('[Window Script]: Creating tab item for:', tab.id, tab.title);

        const tabItem = document.createElement('div');
        tabItem.className = 'tab-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'tab-checkbox';
        checkbox.checked = selectedTabs[tab.id] || false;
        checkbox.dataset.tabId = tab.id;

        const title = document.createElement('div');
        title.className = 'tab-title';
        title.title = tab.title;
        title.textContent = tab.title;

        tabItem.appendChild(checkbox);
        tabItem.appendChild(title);
        tabsList.appendChild(tabItem);

        console.log('[Window Script]: Вкладка добавлена в список:', tab.id, tab.title);

        // Сохраняем состояние чекбокса при изменении
        checkbox.addEventListener('change', async () => {
            console.log('[Window Script]: Изменение состояния чекбокса для вкладки:', tab.id);

            const { selectedTabs = {} } = await chrome.storage.local.get('selectedTabs');
            console.log('[Window Script]: Текущие выбранные вкладки:', selectedTabs);

            if (checkbox.checked) {
                selectedTabs[tab.id] = true;
                console.log('[Window Script]: Вкладка выбрана:', tab.id);
            } else {
                delete selectedTabs[tab.id];
                console.log('[Window Script]: Вкладка отменена:', tab.id);
            }

            await chrome.storage.local.set({ selectedTabs });
            console.log('[Window Script]: Сохраненное состояние вкладок:', selectedTabs);
        });
    });

    sendButton.addEventListener('click', async () => {
        console.log('[Window Script]: Кнопка отправки нажата');

        const { selectedTabs = {} } = await chrome.storage.local.get('selectedTabs');
        console.log('[Window Script]: Выбранные вкладки из хранилища:', selectedTabs)

        const selectedTabIds = Object.keys(selectedTabs).map(Number);
        console.log('[Window Script]: Выбранные вкладки для отправки:', selectedTabIds);

        // Последовательно обрабатываем каждую вкладку
        for (const tabId of selectedTabIds) {
            console.log('[Window Script]: Начинаем обработку вкладки:', tabId);

            try {
                // Активируем вкладку
                await chrome.tabs.update(tabId, { active: true });
                console.log('[Window Script]: Вкладка активирована:', tabId);

                // Получаем информацию о вкладке
                const tab = await chrome.tabs.get(tabId);
                console.log('[Window Script]: Информация о вкладке:', tab);

                // Выполняем действие в зависимости от типа сайта
                await processTab(tab);

                console.log('[Window Script]: Обработка вкладки завершена:', tabId);

                // Добавляем небольшую задержку между обработкой вкладок
                await new Promise(resolve => setTimeout(resolve, 500));
                console.log('[Window Script]: Задержка между вкладками выполнена');

            } catch (error) {
                console.error('[Window Script]: Ошибка при обработке вкладки:', tabId, error);
            }
        }
    });
});

// Функция обработки вкладки
async function processTab(tab) {
    console.log('[Window Script]: processTab started for tab:', tab.id, tab.url);

    const url = tab.url;
    console.log('[Window Script]: Processing tab:', tab.id, url);

    // Добавляем поддержку ChatGPT
    if (url.includes('google.com') || url.includes('chat.openai.com') || url.includes('chatgpt.com')) {
        console.log('[Window Script]: Supported site detected');

        try {
            // Инжектируем content script
            console.log('[Window Script]: Injecting content script');
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
            });
            console.log('[Window Script]: Content script injected successfully');

            // Увеличиваем время ожидания для инициализации
            console.log('[Window Script]: Waiting for initialization');
            await new Promise(resolve => setTimeout(resolve, 1000));

            const text = document.getElementById('inputText').value;
            console.log('[Window Script]: Text to send:', text);

            const response = await chrome.tabs.sendMessage(tab.id, {
                action: 'focusAndFill',
                text: text
            });
            console.log('[Window Script]: Response received:', response);

            if (!response?.success) {
                console.error('[Window Script]: Failed to process tab:',
                    response?.error || 'Unknown error');
            }

        } catch (error) {
            console.error('[Window Script]: Error processing tab:', error);
        }
    }
}