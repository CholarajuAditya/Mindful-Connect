// public/js/chat.js

document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    // Ensure your HTML input has id="user-input"
    const userInputField = document.getElementById('user-input');
    const messagesContainer = document.getElementById('messages-container');
    const chatBox = document.getElementById('chat-box');
    // Ensure your clear button has id="clear-chat-button" in chat.ejs
    const clearChatButton = document.getElementById('clear-chat-button');
    // Ensure your intro quote has id="intro-quote" in chat.ejs
    const introQuote = document.getElementById('intro-quote');

    // This will store the actual chat history (user and bot turns) for Gemini
    // It will be updated by responses from the server.
    let currentChatHistory = [];

    // Function to scroll to the bottom of the chat box
    const scrollToBottom = () => {
        chatBox.scrollTop = chatBox.scrollHeight;
    };

    // Function to add a message to the chat display
    // This function now handles rendering markdown for general links and YouTube videos
    const addMessage = (sender, text) => {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);

        // Convert newlines to <br> for proper display of multiline text
        let formattedMessage = text.replace(/\n/g, '<br>');

        // Regex for general Markdown links: [Link Text](URL)
        // This will find patterns like [Google](https://google.com) and convert to <a> tags
        formattedMessage = formattedMessage.replace(
            /\[(.*?)\]\((https?:\/\/[^\s]+)\)/g,
            (match, linkText, url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${linkText}</a>`
        );

        // Regex for YouTube Video links: [YouTube Video: Video Title](YouTube_URL)
        // This will find patterns like [YouTube Video: My Video](https://youtube.com/watch?v=VIDEO_ID)
        // and convert them into a clickable thumbnail structure.
        formattedMessage = formattedMessage.replace(
            /\[YouTube Video:\s*([^\]]+)\]\((https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+))\)/g,
            (match, videoTitle, fullUrl, videoId) => {
                return `
                    <div class="youtube-embed-container">
                        <a href="${fullUrl}" target="_blank" rel="noopener noreferrer" class="youtube-thumbnail-link">
                            <img src="https://img.youtube.com/vi/${videoId}/hqdefault.jpg" alt="${videoTitle}" class="youtube-thumbnail">
                            <div class="youtube-play-button">▶</div>
                        </a>
                        <div class="youtube-title">${videoTitle}</div>
                        <a href="${fullUrl}" target="_blank" rel="noopener noreferrer" class="youtube-direct-link">Watch on YouTube</a>
                    </div>
                `;
            }
        );

        // Set the message content (sender label + formatted text)
        // Using innerHTML because formattedMessage now contains HTML tags from link/video parsing
        messageDiv.innerHTML = `<strong>${sender === 'user' ? 'You' : 'MindfulBot'}:</strong><br>${formattedMessage}`;
        messagesContainer.appendChild(messageDiv);
        scrollToBottom();

        // Hide the intro quote once any message (user or bot) is added
        if (introQuote) {
            introQuote.classList.add('hidden'); // Use class for hiding
        }
    };

    // --- Typing Indicator ---
    // This HTML will be inserted when the bot is thinking
    const typingIndicatorHtml = `
        <div class="message bot typing-indicator" id="typing-indicator">
            <div><strong>MindfulBot:</strong></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;

    // Shows the typing indicator in the chat box
    const showTypingIndicator = () => {
        // Only add if it's not already there
        if (!document.getElementById('typing-indicator')) {
            messagesContainer.insertAdjacentHTML('beforeend', typingIndicatorHtml);
            scrollToBottom();
        }
    };

    // Removes the typing indicator from the chat box
    const removeTypingIndicator = () => {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    };

    // --- Chat Form Submission ---
    chatForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission (page reload)

        const userInputText = userInputField.value.trim();
        if (!userInputText) return; // Don't send empty messages

        addMessage('user', userInputText); // Add user message to display immediately
        userInputField.value = ''; // Clear input field
        showTypingIndicator(); // Show typing indicator

        try {
            // Send user input AND the current chat history to the backend
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userInput: userInputText,
                    chatHistory: currentChatHistory // Pass the accumulated chat history
                }),
            });

            if (!response.ok) {
                // Attempt to get a more specific error message from the server if available
                const errorData = await response.json().catch(() => ({})); // Catch JSON parse error
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }

            const data = await response.json(); // Expecting { responseText, newHistory } from backend
            removeTypingIndicator(); // Remove typing indicator
            addMessage('bot', data.responseText); // Add bot message to display

            // Update the client-side chat history with the new history received from the server
            currentChatHistory = data.newHistory;

        } catch (error) {
            console.error('Error sending message:', error);
            removeTypingIndicator(); // Remove typing indicator even on error
            addMessage('bot', `I apologize, but I'm having trouble connecting right now: ${error.message}. Please try again later.`);
        }
    });

    // --- Clear Chat Button Functionality ---
    clearChatButton.addEventListener('click', async () => {
        if (confirm('Are you sure you want to clear the entire chat history? This cannot be undone.')) {
            try {
                // Send a request to the backend to clear the server-side history
                const response = await fetch('/clear-chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                if (data.success) {
                    messagesContainer.innerHTML = ''; // Clear messages from display
                    currentChatHistory = []; // Reset client-side history
                    if (introQuote) {
                        introQuote.classList.remove('hidden'); // Show intro quote again
                    }
                    scrollToBottom(); // Scroll to top (or bottom, which is effectively top when empty)
                    addMessage('bot', 'Conversation cleared. How can I assist you now?'); // Optional confirmation message
                } else {
                    // Use a custom modal or message box instead of alert()
                    addMessage('bot', 'Failed to clear chat history. Please try again.');
                }
            } catch (error) {
                console.error('Error clearing chat:', error);
                // Use a custom modal or message box instead of alert()
                addMessage('bot', 'An error occurred while trying to clear chat history.');
            }
        }
    });

    // --- Load Chat History on Page Load ---
    // This function fetches any existing history from the server and displays it
    async function loadChatHistory() {
        try {
            const response = await fetch('/chat-history'); // New route to fetch history
            if (response.ok) {
                const data = await response.json();
                if (data.history && data.history.length > 0) {
                    currentChatHistory = data.history;
                    // Filter out the initial system prompt from history for display
                    // The first two messages in history are the system prompt from gemini-helper
                    const displayHistory = currentChatHistory.filter(
                        (msg, index) => !(index < 2 && msg.role === 'user' && msg.parts[0].text.includes('You are a professional mental health assistant'))
                    );

                    displayHistory.forEach(msg => {
                        if (msg.role === 'user' || msg.role === 'model') {
                            addMessage(msg.role, msg.parts[0].text);
                        }
                    });
                    // Hide intro quote if history was loaded
                    if (introQuote) {
                        introQuote.classList.add('hidden');
                    }
                } else {
                    // Show intro quote if no history
                    if (introQuote) {
                        introQuote.classList.remove('hidden');
                    }
                }
            } else {
                 // If there's an error fetching history, ensure intro quote is visible
                if (introQuote) {
                    introQuote.classList.remove('hidden');
                }
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
            // If error, ensure intro quote is visible
            if (introQuote) {
                introQuote.classList.remove('hidden');
            }
        } finally {
            scrollToBottom(); // Always scroll to bottom after load attempt
        }
    }

    // Call loadChatHistory when the DOM is fully loaded
    loadChatHistory();
});
