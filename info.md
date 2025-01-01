## Technologies Used
- Chrome Extension Manifest V3
- JavaScript (ES6+)
- HTML5
- CSS3

## Project Description
Browser extension for Chrome that allows sending the same message to multiple AI chatbots and search engines simultaneously. The extension should support Google Search, ChatGPT, Claude, and Gemini. When activated, it opens a popup window displaying all open browser tabs, allowing users to select target tabs, input a message, and automatically submit it to all selected services.

## Please remember to update this list after each change
1. Attempt: Initial project setup with basic functionality for Google Search and ChatGPT. Need to implement support for Claude and Gemini, improve tab handling, and add proper error handling.
2. Attempt: Fixed ChatGPT input field detection by adding support for both textarea and contenteditable div elements. Added input event simulation and alternative Enter key submission method.
3. Attempt: Fixed ChatGPT integration by:
   - Adding ChatGPT processing in window.js
   - Updating content.js to properly handle contenteditable div
   - Adding proper event simulation for text input
   - Implementing correct text insertion method
   - Adding delays for proper event handling
 - Attempt failed - button click event wasn't properly handled and text wasn't being sent.
4. Attempt: Fixed ChatGPT message sending by:
   - Adding proper input event simulation
   - Adding delay before clicking send button
   - Adding button state verification
   - Improving error logging
 - attempt failed - text wasn't being inserted into the contenteditable div.
5. Success: Fixed ChatGPT text insertion and submission by:
   - Properly handling contenteditable div element
   - Adding correct event simulation
   - Implementing proper text insertion method
   - Adding delay for button activation
6. Attempt: Implementing Claude.ai integration by:
   - Adding Claude handler to content.js
   - Implementing proper text insertion for contenteditable div
   - Adding button click simulation using aria-label selector
   - Adding Return key simulation as fallback
7. Attempt: Fixed Claude.ai integration by:
   - Adding check for active conversation
   - Implementing automatic new chat creation if needed
   - Adding proper delays for React state updates
   - Improving error handling for UUID issues
8. Success: Fixed Claude.ai message sending by:
   - Properly simulating click event using MouseEvent constructor
   - Adding both click and Enter key simulation
   - Increasing timeout for React state updates
   - Adding proper event bubbling
   - Improving button state verification