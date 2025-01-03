console.log("[Window Script]: Window script loaded");

const supportedSites = [
    "google.com",
    "chatgpt.com",
    "chatgpt.com",
    "claude.ai",
    "apps.abacus.ai",
];

// Добавляем переменную для отслеживания направления сортировки
let sortDirection = 'desc'; // 'desc' - от новых к старым, 'asc' - от старых к новым

function isSupportedUrl(url) {
    return supportedSites.some((site) => url.includes(site));
}

document.addEventListener("DOMContentLoaded", async function () {
    console.log("[Window Script]: DOMContentLoaded event fired");

    const tabsList = document.getElementById("tabsList");
    console.log("[Window Script]: Tabs list element:", tabsList);

    const sendButton = document.getElementById("sendButton");
    console.log("[Window Script]: Send button element:", sendButton);

    const inputText = document.getElementById("inputText");
    console.log("[Window Script]: Input text element:", inputText);

    // Добавляем кнопку сортировки
    const sortButton = document.createElement("button");
    sortButton.id = "sortButton";
    sortButton.textContent = "Сортировка";

    // Загружаем сохраненное направление сортировки
    const { savedSortDirection } = await chrome.storage.local.get("savedSortDirection");
    if (savedSortDirection) {
        sortDirection = savedSortDirection;
    }
    sortButton.className = sortDirection;

    tabsList.parentElement.insertBefore(sortButton, tabsList);

    // Функция сортировки вкладок
    function sortTabs(tabs) {
        return [...tabs].sort((a, b) => {
            if (sortDirection === 'desc') {
                return b.id - a.id; // От новых к старым
            } else {
                return a.id - b.id; // От старых к новым
            }
        });
    }

    // Функция обновления отображения вкладок
    async function updateTabsList() {
        const tabs = await chrome.tabs.query({});
        const { selectedTabs = {} } = await chrome.storage.local.get("selectedTabs");

        // Очищаем текущий список
        tabsList.innerHTML = '';

        // Сортируем вкладки
        const sortedTabs = sortTabs(tabs);

        // Создаем элементы для каждой вкладки
        sortedTabs.forEach((tab) => {
            console.log("[Window Script]: Creating tab item for:", tab.id, tab.title);

            const tabItem = document.createElement("div");
            tabItem.className = "tab-item";

            const isSupported = isSupportedUrl(tab.url);
            tabItem.classList.add(isSupported ? "supported" : "unsupported");

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.className = "tab-checkbox";
            checkbox.checked = isSupported && (selectedTabs[tab.id] || false);
            checkbox.dataset.tabId = tab.id;

            if (!isSupported) {
                checkbox.disabled = true;
            }

            const title = document.createElement("div");
            title.className = "tab-title";
            title.title = tab.title;
            title.textContent = tab.title;

            const url = document.createElement("div");
            url.className = "tab-url";
            url.textContent = tab.url;
            url.title = tab.url;

            tabItem.appendChild(checkbox);
            tabItem.appendChild(title);
            tabItem.appendChild(url);
            tabsList.appendChild(tabItem);

            if (isSupported) {
                checkbox.addEventListener("change", async () => {
                    const { selectedTabs = {} } = await chrome.storage.local.get("selectedTabs");
                    if (checkbox.checked) {
                        selectedTabs[tab.id] = true;
                    } else {
                        delete selectedTabs[tab.id];
                    }
                    await chrome.storage.local.set({ selectedTabs });
                });
            }
        });
    }

    // Обработчик клика по кнопке сортировки
    sortButton.addEventListener("click", async () => {
        console.log("[Window Script]: Sort button clicked");

        // Меняем направление сортировки
        sortDirection = sortDirection === 'desc' ? 'asc' : 'desc';

        // Сохраняем направление сортировки
        await chrome.storage.local.set({ savedSortDirection: sortDirection });

        // Обновляем класс кнопки
        sortButton.className = sortDirection;

        // Обновляем список вкладок
        await updateTabsList();
    });

    // Инициализация: отображаем вкладки
    await updateTabsList();
    sendButton.addEventListener("click", async () => {
        console.log("[Window Script]: Кнопка отправки нажата");

        const { selectedTabs = {} } = await chrome.storage.local.get("selectedTabs");
        console.log("[Window Script]: Выбранные вкладки из хранилища:", selectedTabs);

        const selectedTabIds = Object.keys(selectedTabs).map(Number);
        console.log("[Window Script]: Выбранные вкладки для отправки:", selectedTabIds);

        // Последовательно обрабатываем каждую вкладку
        for (const tabId of selectedTabIds) {
            console.log("[Window Script]: Начинаем обработку вкладки:", tabId);

            try {
                // Активируем вкладку
                await chrome.tabs.update(tabId, { active: true });
                console.log("[Window Script]: Вкладка активирована:", tabId);

                // Получаем информацию о вкладке
                const tab = await chrome.tabs.get(tabId);
                console.log("[Window Script]: Информация о вкладке:", tab);

                // Выполняем действие в зависимости от типа сайта
                await processTab(tab);

                console.log("[Window Script]: Обработка вкладки завершена:", tabId);

                // Добавляем небольшую задержку между обработкой вкладок
                await new Promise((resolve) => setTimeout(resolve, 500));
                console.log("[Window Script]: Задержка между вкладками выполнена");
            } catch (error) {
                console.error("[Window Script]: Ошибка при обработке вкладки:", tabId, error);
            }
        }
    });
});

// Функция обработки вкладки
async function processTab(tab) {
    console.log("[Window Script]: processTab started for tab:", tab.id, tab.url);

    const url = tab.url;
    console.log("[Window Script]: Processing tab:", tab.id, url);

    // Добавляем поддержку ChatGPT
    if (supportedSites.some((site) => url.includes(site))) {
        console.log("[Window Script]: Supported site detected");

        try {
            // Инжектируем content script
            console.log("[Window Script]: Injecting content script");
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ["content.js"],
            });
            console.log("[Window Script]: Content script injected successfully");

            // Увеличиваем время ожидания для инициализации
            console.log("[Window Script]: Waiting for initialization");
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const text = document.getElementById("inputText").value;
            console.log("[Window Script]: Text to send:", text);

            const response = await chrome.tabs.sendMessage(tab.id, {
                action: "focusAndFill",
                text: text,
            });
            console.log("[Window Script]: Response received:", response);

            if (!response?.success) {
                console.error("[Window Script]: Failed to process tab:", response?.error || "Unknown error");
            }
        } catch (error) {
            console.error("[Window Script]: Error processing tab:", error);
        }
    }
}