// Объект с обработчиками для разных сайтов
const siteHandlers = {
    // Обработчик для Google Search
    google: {
        // Проверяет, подходит ли текущий URL для этого обработчика
        matches: (url) => {
            console.log('[Google]: Проверка URL', url);
            return url.includes('google.com');
        },
        // Находит поле ввода на странице Google
        getInputField: () => {
            console.log('[Google]: Поиск поля ввода');
            const input = document.querySelector('textarea[name="q"]');
            console.log('[Google]: Найдено поле ввода:', input);
            return input;
        },
        // Отправляет форму поиска
        submitAction: (input) => {
            console.log('[Google]: Подготовка к отправке формы');
            const form = input.closest('form');
            console.log('[Google]: Найдена форма:', form);
            if (form) {
                console.log('[Google]: Отправка формы');
                form.submit();
            }
        }
    },

    // Обработчик для ChatGPT
    chatgpt: {
        // Проверяет URL на принадлежность к ChatGPT
        matches: (url) => {
            console.log('[ChatGPT]: Проверка URL', url);
            return url.includes('chat.openai.com') || url.includes('chatgpt.com');
        },
        // Находит поле ввода на странице ChatGPT
        getInputField: () => {
            console.log('[ChatGPT]: Поиск поля ввода');
            const input = document.querySelector('div#prompt-textarea[contenteditable="true"]');
            console.log('[ChatGPT]: Найдено поле ввода:', input);
            return input;
        },
        // Отправляет сообщение в ChatGPT
        submitAction: (input) => {
            console.log('[ChatGPT]: Начало процесса отправки');

            // Очищаем поле ввода перед вставкой нового текста
            input.innerHTML = '';

            // Создаем параграф с текстом сообщения
            const p = document.createElement('p');
            p.textContent = input.value || '';
            input.appendChild(p);

            // Эмулируем события ввода для активации интерфейса
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));

            // Даем время на обработку событий и активацию кнопки
            setTimeout(() => {
                const button = document.querySelector('button[data-testid="send-button"]');
                console.log('[ChatGPT]: Найдена кнопка отправки:', button);

                if (button && !button.disabled) {
                    console.log('[ChatGPT]: Нажатие кнопки отправки');
                    button.click();
                } else {
                    console.log('[ChatGPT]: Кнопка отправки не найдена или неактивна');
                }
            }, 100);
        }
    },

    // Обработчик для Claude.ai
    claude: {
        // Проверяет URL на принадлежность к Claude
        matches: (url) => {
            console.log('[Claude]: Проверка URL', url);
            return url.includes('claude.ai');
        },
        // Находит поле ввода на странице Claude
        getInputField: () => {
            console.log('[Claude]: Поиск поля ввода');
            const input = document.querySelector('div[contenteditable="true"].ProseMirror');
            console.log('[Claude]: Найдено поле ввода:', input);
            return input;
        },
        // Отправляет сообщение в Claude
        submitAction: async (input) => {
            console.log('[Claude]: Начало процесса отправки');

            // Проверяем, находимся ли на странице нового чата
            if (window.location.href.includes('claude.ai/new')) {
                console.log('[Claude]: Обнаружена страница нового чата, ожидание инициализации');
                // Ждем инициализации интерфейса
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            // Очищаем поле ввода
            input.innerHTML = '';

            // Создаем параграф с текстом
            const p = document.createElement('p');
            p.textContent = input.value || '';
            input.appendChild(p);

            // Эмулируем события ввода
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));

            // Ждем обновления состояния React
            await new Promise(resolve => setTimeout(resolve, 100));

            // Пробуем отправить через эмуляцию нажатия Enter
            const enterEvent = new KeyboardEvent('keydown', {
                key: 'Enter',
                code: 'Enter',
                keyCode: 13,
                which: 13,
                bubbles: true,
                cancelable: true,
                composed: true
            });
            input.dispatchEvent(enterEvent);

            // Если Enter не сработал, пробуем через кнопку
            setTimeout(() => {
                const button = document.querySelector('button[aria-label="Send Message"]');
                if (button && !button.disabled) {
                    const clickEvent = new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true,
                        view: window
                    });
                    button.dispatchEvent(clickEvent);
                }
            }, 100);
        }
    },
    abacusChat: {
        matches: (url) => {
            console.log('[Abacus Handler]: Checking URL', url);
            return url.includes('apps.abacus.ai/chatllm');
        },
        getInputField: () => {
            console.log('[Abacus Handler]: Getting input field');
            // Находим поле ввода по селектору из предоставленного кода
            const input = document.querySelector('textarea[placeholder="Write something..."]');
            console.log('[Abacus Handler]: Input field found:', input);
            return input;
        },
        submitAction: async (input) => {
            console.log('[Abacus Handler]: Starting submit action');
            try {
                // Устанавливаем значение в поле ввода
                input.value = input.value || '';

                // Эмулируем события для активации интерфейса
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));

                // Даем время на обработку событий
                await new Promise(resolve => setTimeout(resolve, 100));

                // Находим кнопку отправки по SVG иконке
                const button = document.querySelector('button svg.fa-paper-plane').closest('button');

                if (button && !button.disabled) {
                    console.log('[Abacus Handler]: Send button found, clicking');
                    // Создаем событие клика
                    const clickEvent = new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true,
                        view: window
                    });
                    button.dispatchEvent(clickEvent);
                } else {
                    console.log('[Abacus Handler]: Send button not found or disabled');
                    // Пробуем отправить через Enter как запасной вариант
                    const enterEvent = new KeyboardEvent('keydown', {
                        key: 'Enter',
                        code: 'Enter',
                        keyCode: 13,
                        which: 13,
                        bubbles: true,
                        cancelable: true,
                        composed: true
                    });
                    input.dispatchEvent(enterEvent);
                }
            } catch (error) {
                console.error('[Abacus Handler]: Error during submission:', error);
                throw error;
            }
        }
    }
};


// Вспомогательная функция для эмуляции отправки сообщения
function simulateSubmit(input) {
    console.log('[Helper]: Попытка эмуляции отправки');

    // Ищем и нажимаем кнопку отправки
    const button = document.querySelector('button[aria-label="Send Message"]');
    if (button && !button.disabled) {
        console.log('[Helper]: Найдена активная кнопка отправки');
        button.click();
    } else {
        console.log('[Helper]: Кнопка не найдена, пробуем через Enter');
        // Если кнопка не найдена, пробуем через Enter
        const enterEvent = new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13,
            bubbles: true,
            cancelable: true
        });
        input.dispatchEvent(enterEvent);
    }
}

// Основной обработчик сообщений от расширения
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('[Main]: Получено сообщение', request);

    if (request.action === 'focusAndFill') {
        console.log('[Main]: Обработка действия focusAndFill');
        try {
            // Получаем текущий URL
            const currentURL = window.location.href;
            console.log('[Main]: Текущий URL:', currentURL);

            // Находим подходящий обработчик для текущего сайта
            const handler = Object.values(siteHandlers).find(h => h.matches(currentURL));
            console.log('[Main]: Найден обработчик:', handler);

            if (!handler) {
                console.log('[Main]: Подходящий обработчик не найден');
                sendResponse({ success: false, error: 'Сайт не поддерживается' });
                return true;
            }

            // Получаем поле ввода
            const input = handler.getInputField();
            console.log('[Main]: Получено поле ввода:', input);

            if (!input) {
                console.log('[Main]: Поле ввода не найдено');
                sendResponse({ success: false, error: 'Поле ввода не найдено' });
                return true;
            }

            // Фокусируемся на поле ввода
            console.log('[Main]: Установка фокуса на поле ввода');
            input.focus();

            // Сохраняем текст для использования в submitAction
            input.value = request.text;

            // Выполняем отправку
            console.log('[Main]: Выполнение действия отправки');
            handler.submitAction(input);

            console.log('[Main]: Отправка успешного ответа');
            sendResponse({ success: true });
        } catch (error) {
            console.error('[Main]: Произошла ошибка:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    return true;
});