console.log('[Content Script]: Loaded');

const siteHandlers = {
    google: {
        matches: (url) => {
            console.log('[Google Handler]: Checking URL', url);
            return url.includes('google.com');
        },
        getInputField: () => {
            console.log('[Google Handler]: Getting input field');
            const input = document.querySelector('textarea[name="q"]');
            console.log('[Google Handler]: Input field:', input);
            return input;
        },
        submitAction: (input) => {
            console.log('[Google Handler]: Submitting action');
            const form = input.closest('form');
            console.log('[Google Handler]: Form:', form);
            if (form) {
                console.log('[Google Handler]: Submitting form');
                form.submit();
            }
        }
    },
    chatgpt: {
        matches: (url) => {
            console.log('[ChatGPT Handler]: Checking URL', url);
            return url.includes('chat.openai.com') || url.includes('chatgpt.com');
        },
        getInputField: () => {
            console.log('[ChatGPT Handler]: Getting input field');
            const input = document.querySelector('div#prompt-textarea.ProseMirror');
            console.log('[ChatGPT Handler]: Input field:', input);
            return input;
        },
        submitAction: (input) => {
            console.log('[ChatGPT Handler]: Submitting action');
            const button = document.querySelector('button[data-testid="send-button"]');
            console.log('[ChatGPT Handler]: Send button:', button);
            if (button) {
                console.log('[ChatGPT Handler]: Clicking send button');
                button.click();
            }
        }
    }
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('[onMessage Listener]: Received request', request);

    if (request.action === 'ping') {
        console.log('[Ping Action]: Responding with success');
        sendResponse({ success: true });
        return true;
    }

    if (request.action === 'focusAndFill') {
        console.log('[FocusAndFill Action]: Starting process');
        try {
            const currentURL = window.location.href;
            console.log('[FocusAndFill Action]: Current URL', currentURL);

            const handler = Object.values(siteHandlers).find(h => h.matches(currentURL));
            console.log('[FocusAndFill Action]: Found handler', handler);

            if (!handler) {
                console.log('[FocusAndFill Action]: No matching handler found');
                sendResponse({ success: false, error: 'Site not supported' });
                return true;
            }

            const input = handler.getInputField();
            console.log('[FocusAndFill Action]: Got input element', input);

            if (!input) {
                console.log('[FocusAndFill Action]: Input field not found');
                sendResponse({ success: false, error: 'Input field not found' });
                return true;
            }

            console.log('[FocusAndFill Action]: Focusing input');
            input.focus();

            console.log('[FocusAndFill Action]: Setting input value', request.text);
            input.value = request.text;

            console.log('[FocusAndFill Action]: Performing submit action');
            handler.submitAction(input);

            console.log('[FocusAndFill Action]: Sending success response');
            sendResponse({ success: true });
        } catch (error) {
            console.error('[FocusAndFill Action]: Error occurred', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    console.log('[onMessage Listener]: Returning true');
    return true;
});