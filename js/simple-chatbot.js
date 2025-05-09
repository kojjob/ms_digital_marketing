document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded, initializing chatbot...');

    try {
        // Load Flatpickr CSS for date/time picker
        loadFlatpickrResources();

        // Create chatbot elements
        createChatbotElements();

        // Initialize event listeners
        initEventListeners();

        // Initialize chatbot state and context
        initializeChatbotState();

        // Check if we should auto-open the chatbot based on user behavior
        setTimeout(checkForAutoOpen, 15000); // Check after 15 seconds

        console.log('Chatbot successfully initialized');
    } catch (error) {
        console.error('Error initializing chatbot:', error);
    }
});

// Function to load Flatpickr resources
function loadFlatpickrResources() {
    // Add Flatpickr CSS
    const flatpickrCSS = document.createElement('link');
    flatpickrCSS.rel = 'stylesheet';
    flatpickrCSS.href = 'https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css';
    document.head.appendChild(flatpickrCSS);

    // Add Flatpickr theme (optional)
    const flatpickrTheme = document.createElement('link');
    flatpickrTheme.rel = 'stylesheet';
    flatpickrTheme.href = 'https://cdn.jsdelivr.net/npm/flatpickr/dist/themes/material_blue.css';
    document.head.appendChild(flatpickrTheme);

    // Add Flatpickr JS
    const flatpickrScript = document.createElement('script');
    flatpickrScript.src = 'https://cdn.jsdelivr.net/npm/flatpickr';
    document.head.appendChild(flatpickrScript);
}

// Global state to track conversation context and user information
let chatbotState = {
    conversationHistory: [],
    context: {
        lastTopic: null,
        userInterests: [],
        mentionedServices: [],
        userInfo: {},
        conversationStage: 'greeting', // greeting, exploration, specific_inquiry, closing
        currentPage: window.location.pathname, // Track which page the user is on
        pageVisitCount: 0, // How many times they've visited this page
        totalSiteVisits: 0, // Total visits to the site
        referrer: document.referrer // Where they came from
    },
    sessionStartTime: null,
    userBehavior: {
        timeOnPage: 0,
        scrollDepth: 0,
        interactionCount: 0,
        hasScrolledPastThreshold: false
    },
    intelligence: {
        suggestedTopics: [],
        detectedIntent: null,
        confidenceScore: 0,
        entityRecognition: {}
    },
    isReturningUser: false,
    awaitingUserInfo: null,
    shouldAddSuggestions: false,
    appointment: {
        inProgress: false,
        step: null, // 'email', 'date', 'time', 'service', 'confirmation'
        details: {
            email: null,
            date: null,
            time: null,
            service: null,
            name: null,
            notes: null
        },
        availableTimes: [
            '9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM',
            '2:00 PM', '3:00 PM', '4:00 PM'
        ]
    }
};

// Function to check if we should auto-open the chatbot
function checkForAutoOpen() {
    // Don't auto-open if the user has already interacted with the chatbot
    if (chatbotState.conversationHistory.length > 0) {
        return;
    }

    // Check if user has been on the page for a while and scrolled significantly
    const timeOnPage = (new Date() - chatbotState.sessionStartTime) / 1000; // in seconds

    // Auto-open based on different conditions per page
    const currentPath = window.location.pathname;

    if (currentPath.includes('services') && timeOnPage > 30 && chatbotState.userBehavior.scrollDepth > 0.4) {
        // If they're on the services page and have been reading for a while
        openChatbotWithMessage("I see you're exploring our services. Can I help you find the right solution for your business?");
    }
    else if (currentPath.includes('pricing') && timeOnPage > 20) {
        // If they're on the pricing page
        openChatbotWithMessage("Have any questions about our pricing or packages? I'm happy to help!");
    }
    else if (currentPath.includes('contact') && timeOnPage > 15) {
        // If they're on the contact page
        openChatbotWithMessage("Looking to get in touch? I can help schedule a consultation or answer any questions you might have.");
    }
    else if (timeOnPage > 45 && chatbotState.userBehavior.scrollDepth > 0.6) {
        // General case - they've been on the site for a while and scrolled a lot
        openChatbotWithMessage("Hi there! 👋 I noticed you've been exploring our site. Is there anything specific you're looking for today?");
    }
}

function createChatbotElements() {
    // Create chatbot icon
    const chatbotIcon = document.createElement('div');
    chatbotIcon.id = 'simple-chatbot-icon';
    chatbotIcon.innerHTML = `
        <div class="chat-icon-inner">
            <img src="images/logos/logo-white.jpeg" alt="MS Digital Marketing" class="icon-logo-img">
        </div>
    `;

    // Create chatbot container
    const chatbotContainer = document.createElement('div');
    chatbotContainer.id = 'simple-chatbot-container';
    chatbotContainer.classList.add('hidden');
    chatbotContainer.innerHTML = `
        <div class="chatbot-header">
            <div class="chatbot-logo">
                <img src="images/logos/logo-white.jpeg" alt="MS Digital Marketing" class="header-logo">
            </div>
            <div class="chatbot-header-text">
                <div class="chatbot-title">MS Assistant</div>
                <div class="chatbot-status">Online | Typically replies in a few minutes</div>
            </div>
            <button id="simple-chatbot-close">×</button>
        </div>
        <div id="simple-chatbot-messages"></div>
        <div class="chatbot-input-area">
            <input type="text" id="simple-chatbot-input" placeholder="Type your message...">
            <button id="simple-chatbot-send" aria-label="Send message">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"></path>
                </svg>
            </button>
        </div>
        <div class="chatbot-disclaimer">
            This is an AI assistant to help with basic questions. For complex inquiries, please contact our team directly.
        </div>
    `;

    // Create styles
    const style = document.createElement('style');
    style.textContent = `
        #simple-chatbot-icon {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            background-color: #1e88e5;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            transition: transform 0.3s, background-color 0.3s;
            animation: pulse-animation 2s infinite;
            padding: 0;
            overflow: hidden;
        }

        @keyframes pulse-animation {
            0% {
                box-shadow: 0 0 0 0 rgba(30, 136, 229, 0.7);
            }
            70% {
                box-shadow: 0 0 0 10px rgba(30, 136, 229, 0);
            }
            100% {
                box-shadow: 0 0 0 0 rgba(30, 136, 229, 0);
            }
        }

        #simple-chatbot-icon:hover {
            transform: scale(1.1);
            background-color: #1976d2;
        }

        .chat-icon-inner {
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }

        /* Logo styling handled by icon-logo-img */

        .chat-icon-inner::after {
            content: '';
            position: absolute;
            top: -5px;
            right: -5px;
            width: 10px;
            height: 10px;
            background-color: #22c55e;
            border-radius: 50%;
            border: 2px solid white;
        }

        #simple-chatbot-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 350px;
            height: 500px;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 5px 25px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            transition: all 0.3s ease;
            border: 1px solid rgba(0, 0, 0, 0.1);
            max-height: 80vh; /* Limit height on smaller screens */
        }

        #simple-chatbot-container.hidden {
            display: none;
            opacity: 0;
            transform: translateY(20px);
        }

        .chatbot-header {
            background-color: #1e88e5;
            color: white;
            padding: 12px 15px;
            display: flex;
            align-items: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .chatbot-logo {
            margin-right: 10px;
        }

        .header-logo {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            object-fit: cover;
            object-position: center;
            border: 2px solid white;
        }

        .icon-logo-img {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            object-fit: cover;
            object-position: center;
        }

        .chatbot-header-text {
            flex: 1;
        }

        .chatbot-title {
            font-weight: bold;
            font-size: 16px;
        }

        .chatbot-status {
            font-size: 12px;
            opacity: 0.9;
        }

        #simple-chatbot-close {
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            opacity: 0.8;
            transition: opacity 0.2s;
            padding: 0;
            margin-left: 10px;
        }

        #simple-chatbot-close:hover {
            opacity: 1;
        }

        #simple-chatbot-messages {
            flex: 1;
            padding: 15px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            background-color: #f5f7f9;
            max-height: calc(100% - 140px); /* Adjust based on header, input area, and disclaimer heights */
            scrollbar-width: thin;
            scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
        }

        #simple-chatbot-messages::-webkit-scrollbar {
            width: 6px;
        }

        #simple-chatbot-messages::-webkit-scrollbar-track {
            background: transparent;
        }

        #simple-chatbot-messages::-webkit-scrollbar-thumb {
            background-color: rgba(0, 0, 0, 0.2);
            border-radius: 3px;
        }

        .list-item {
            margin-bottom: 5px;
            padding-left: 5px;
        }

        .chatbot-input-area {
            padding: 12px 15px;
            display: flex;
            border-top: 1px solid #e5e7eb;
            background-color: white;
        }

        #simple-chatbot-input {
            flex: 1;
            padding: 12px 15px;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            outline: none;
            font-size: 14px;
            transition: border-color 0.3s;
        }

        #simple-chatbot-input:focus {
            border-color: #1e88e5;
        }

        #simple-chatbot-send {
            background-color: #1e88e5;
            color: white;
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 4px;
            margin-left: 8px;
            cursor: pointer;
            transition: background-color 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        #simple-chatbot-send:hover {
            background-color: #1976d2;
        }

        .chatbot-disclaimer {
            padding: 8px 15px;
            font-size: 12px;
            color: #6b7280;
            text-align: center;
            border-top: 1px solid #e5e7eb;
            background-color: white;
        }

        .bot-message {
            align-self: flex-start;
            background-color: white;
            padding: 12px 16px;
            border-radius: 10px;
            margin-bottom: 12px;
            max-width: 80%;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
            line-height: 1.5;
            font-size: 14px;
            color: #333333;
            animation: fadeIn 0.3s ease;
            word-wrap: break-word;
            overflow-wrap: break-word;
            white-space: pre-wrap;
        }

        .user-message {
            align-self: flex-end;
            background-color: #f0f0f0;
            color: #333333;
            padding: 12px 16px;
            border-radius: 10px;
            margin-bottom: 12px;
            max-width: 80%;
            line-height: 1.5;
            font-size: 14px;
            animation: fadeIn 0.3s ease;
            word-wrap: break-word;
            overflow-wrap: break-word;
            white-space: pre-wrap;
            text-align: center;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .typing-indicator {
            align-self: flex-start;
            background-color: white;
            padding: 12px 16px;
            border-radius: 10px;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            animation: fadeIn 0.3s ease;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .typing-indicator span {
            height: 8px;
            width: 8px;
            margin: 0 2px;
            background-color: #1e88e5;
            border-radius: 50%;
            display: inline-block;
            opacity: 0.4;
        }

        .typing-indicator span:nth-child(1) {
            animation: pulse 1s infinite 0.1s;
        }

        .typing-indicator span:nth-child(2) {
            animation: pulse 1s infinite 0.3s;
        }

        .typing-indicator span:nth-child(3) {
            animation: pulse 1s infinite 0.5s;
        }

        .quick-options {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 12px;
            align-self: center;
            width: 100%;
            animation: fadeIn 0.3s ease;
        }

        .quick-option-button {
            background-color: #f0f0f0;
            border: none;
            border-radius: 10px;
            padding: 10px 15px;
            font-size: 14px;
            color: #333333;
            cursor: pointer;
            transition: all 0.2s;
            text-align: center;
            width: 100%;
            max-width: 280px;
            margin: 0 auto;
        }

        .quick-option-button:hover {
            background-color: #e5e5e5;
        }

        @keyframes pulse {
            0% {
                transform: scale(1);
                opacity: 0.4;
            }
            50% {
                transform: scale(1.2);
                opacity: 1;
            }
            100% {
                transform: scale(1);
                opacity: 0.4;
            }
        }

        /* Date picker styles */
        .date-picker-container {
            background-color: white;
            border-radius: 12px;
            padding: 15px;
            margin-bottom: 15px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            align-self: center;
            width: 90%;
            max-width: 300px;
        }

        .date-picker-header {
            font-weight: 600;
            margin-bottom: 10px;
            color: #374151;
            text-align: center;
        }

        .appointment-date-input {
            width: 100%;
            padding: 10px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            text-align: center;
            cursor: pointer;
            font-size: 14px;
            color: #374151;
        }

        /* Time options styles */
        .time-options-container {
            background-color: white;
            border-radius: 12px;
            padding: 15px;
            margin-bottom: 15px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            align-self: center;
            width: 90%;
            max-width: 300px;
        }

        .time-options-header {
            font-weight: 600;
            margin-bottom: 10px;
            color: #374151;
            text-align: center;
        }

        .time-slots {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
        }

        .time-slot-button {
            background-color: #f3f4f6;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 8px;
            text-align: center;
            cursor: pointer;
            font-size: 14px;
            color: #374151;
            transition: all 0.2s;
        }

        .time-slot-button:hover {
            background-color: #0ea5e9;
            color: white;
            border-color: #0ea5e9;
        }

        /* Flatpickr customization */
        .flatpickr-calendar {
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            border: none;
        }

        .flatpickr-day.selected {
            background: #0ea5e9;
            border-color: #0ea5e9;
        }

        .flatpickr-day.selected:hover {
            background: #0284c7;
            border-color: #0284c7;
        }

        .flatpickr-day:hover {
            background: #e5e7eb;
        }

        .flatpickr-day.disabled {
            color: #d1d5db;
        }

        @media (max-width: 640px) {
            #simple-chatbot-container {
                width: 100%;
                height: 100%;
                bottom: 0;
                right: 0;
                border-radius: 0;
                max-height: 100vh;
            }

            #simple-chatbot-icon {
                bottom: 15px;
                right: 15px;
            }

            .bot-message, .user-message {
                max-width: 90%;
            }

            #simple-chatbot-messages {
                max-height: calc(100% - 130px);
                padding: 10px;
            }

            .chatbot-input-area {
                padding: 10px;
                position: sticky;
                bottom: 0;
                background-color: white;
            }

            .date-picker-container,
            .time-options-container {
                width: 95%;
            }

            .time-slots {
                grid-template-columns: 1fr;
            }
        }
    `;

    // Append elements to the document
    document.head.appendChild(style);
    document.body.appendChild(chatbotIcon);
    document.body.appendChild(chatbotContainer);
}

function initEventListeners() {
    const chatbotIcon = document.getElementById('simple-chatbot-icon');
    const chatbotContainer = document.getElementById('simple-chatbot-container');
    const closeButton = document.getElementById('simple-chatbot-close');
    const sendButton = document.getElementById('simple-chatbot-send');
    const chatInput = document.getElementById('simple-chatbot-input');
    const messagesContainer = document.getElementById('simple-chatbot-messages');

    // Toggle chatbot visibility
    chatbotIcon.addEventListener('click', function() {
        chatbotContainer.classList.remove('hidden');

        // Show welcome message if it's the first time in this session
        if (messagesContainer.children.length === 0) {
            // Different greeting based on whether they're a returning user
            if (chatbotState.isReturningUser && chatbotState.context.userInfo.name) {
                // Personalized greeting for returning users
                addBotMessage(`Welcome back, ${chatbotState.context.userInfo.name}! 👋 How can I assist you today?`);

                // Suggest topics based on previous interests
                setTimeout(function() {
                    let suggestedOptions = [];

                    if (chatbotState.context.userInterests.length > 0) {
                        // Suggest based on previous interests
                        addBotMessage("Based on our previous conversation, you might be interested in:");

                        // Create personalized suggestions
                        chatbotState.context.userInterests.forEach(interest => {
                            if (interest.includes('seo')) {
                                suggestedOptions.push("More about SEO services");
                            } else if (interest.includes('social')) {
                                suggestedOptions.push("Social media strategies");
                            } else if (interest.includes('ppc') || interest.includes('advertising')) {
                                suggestedOptions.push("PPC campaign options");
                            } else if (interest.includes('web') || interest.includes('website')) {
                                suggestedOptions.push("Website development services");
                            }
                        });

                        // Add some default options if we don't have enough
                        if (suggestedOptions.length < 2) {
                            suggestedOptions.push("What's new in digital marketing?");
                            suggestedOptions.push("Schedule a consultation");
                        }

                        // Always add a way to start fresh
                        suggestedOptions.push("I have a new question");
                    } else {
                        // Default options if we don't have specific interests
                        addBotMessage("How can I help you today?");
                        suggestedOptions = [
                            "What services do you offer?",
                            "How much do your services cost?",
                            "Tell me about SEO",
                            "Contact information"
                        ];
                    }

                    // Add the quick option buttons
                    addQuickOptions(suggestedOptions);
                }, 1000);
            } else {
                // Initial greeting for new users
                addBotMessage("Hi there! 👋 I'm MS Assistant. How can I help you today with your digital marketing needs?");

                // After a short delay, show quick options
                setTimeout(function() {
                    // Add quick option buttons
                    addQuickOptions([
                        "What services do you offer?",
                        "How much do your services cost?",
                        "Can you share some case studies?",
                        "How do I get started?"
                    ]);
                }, 1000);
            }
        }

        // Focus on input
        chatInput.focus();
    });

    // Close chatbot
    closeButton.addEventListener('click', function() {
        chatbotContainer.classList.add('hidden');
    });

    // Send message on button click
    sendButton.addEventListener('click', function() {
        sendMessage();
    });

    // Send message on Enter key
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    function sendMessage() {
        const message = chatInput.value.trim();

        if (message === '') return;

        // Add user message
        addUserMessage(message);

        // Clear input
        chatInput.value = '';

        // Update conversation history and context
        updateChatbotState(message);

        // Show typing indicator
        showTypingIndicator();

        // Generate response with a realistic delay based on message length
        const typingDelay = Math.min(1500, Math.max(800, message.length * 40));

        setTimeout(function() {
            // Hide typing indicator
            hideTypingIndicator();

            // Process the message with context awareness
            processMessageWithContext(message);

        }, typingDelay);
    }

    function processMessageWithContext(message) {
        // Check for special commands or patterns
        if (message.toLowerCase() === 'clear' || message.toLowerCase() === 'reset') {
            // Clear the conversation
            clearConversation();
            return;
        }

        // Check if we're in the appointment scheduling flow
        if (chatbotState.appointment.inProgress) {
            handleAppointmentFlow(message);
            return;
        }

        // Check if we're in post-appointment confirmation state
        if (chatbotState.appointment.step === 'post_confirmation') {
            handlePostConfirmationResponse(message);
            return;
        }

        // Check if we need to collect user information
        if (chatbotState.awaitingUserInfo) {
            handleUserInfoCollection(message);
            return;
        }

        // Analyze user intent and entities
        analyzeUserIntent(message);

        // Track interaction for user behavior
        chatbotState.userBehavior.interactionCount++;

        // Check if this is an appointment-related message
        if (isAppointmentRequest(message)) {
            startAppointmentFlow();
            return;
        }

        // Generate contextual response
        const response = generateContextualResponse(message);

        // Add the bot's response to the chat
        if (Array.isArray(response)) {
            // If we got multiple responses, show them sequentially
            showSequentialResponses(response);
        } else {
            // Single response
            addBotMessage(response);

            // Check if we should follow up with suggestions
            if (shouldAddSuggestions(message)) {
                setTimeout(() => {
                    addRelevantSuggestions();
                }, 800);
            }
        }

        // Check if we should suggest related topics based on the current page and conversation
        if (chatbotState.intelligence.suggestedTopics.length > 0 &&
            chatbotState.conversationHistory.length === 3) {
            // After a few exchanges, suggest a relevant topic based on the page they're on
            setTimeout(() => {
                suggestRelevantTopic();
            }, 5000);
        }

        // Save the updated state
        saveChatbotState();
    }

    // Function to handle responses after appointment confirmation
    function handlePostConfirmationResponse(message) {
        const lowerMessage = message.toLowerCase();

        // Reset the post-confirmation state
        chatbotState.appointment.step = null;

        if (lowerMessage.includes('yes') || lowerMessage.includes('specific question')) {
            // User has specific questions
            addBotMessage("Great! Please go ahead and share your specific questions or topics you'd like us to prepare for. Our team will review them before your consultation.");
        }
        else if (lowerMessage.includes('no') || lowerMessage.includes('that\'s all')) {
            // User is done
            addBotMessage("Perfect! We've got your appointment scheduled. If you think of any questions before your consultation, feel free to come back and chat with me. Have a great day!");
        }
        else if (lowerMessage.includes('reschedule') || lowerMessage.includes('change')) {
            // User wants to reschedule
            addBotMessage("I understand you'd like to reschedule. Let's set up a new appointment time.");

            // Start a new appointment flow
            setTimeout(() => {
                startAppointmentFlow();
            }, 1000);
        }
        else {
            // Default response for other messages
            addBotMessage("Thank you for your message. Our team will note this for your upcoming consultation. Is there anything else you'd like us to know before your appointment?");
        }
    }

    // Function to check if a message is an appointment request
    function isAppointmentRequest(message) {
        const lowerMessage = message.toLowerCase();

        // First check if it's a negative response, and if so, don't treat as appointment request
        if (lowerMessage.includes('no, that\'s all') ||
            lowerMessage.includes('that\'s all for now') ||
            lowerMessage.includes('no thanks') ||
            lowerMessage.includes('no, thank')) {
            return false;
        }

        return (
            lowerMessage.includes('schedule') ||
            lowerMessage.includes('appointment') ||
            lowerMessage.includes('book') ||
            lowerMessage.includes('consultation') ||
            lowerMessage.includes('meeting') ||
            (lowerMessage.includes('set') && lowerMessage.includes('up')) ||
            (lowerMessage.includes('make') && lowerMessage.includes('appointment'))
        );
    }

    // Function to start the appointment scheduling flow
    function startAppointmentFlow() {
        // Set appointment flow as active
        chatbotState.appointment.inProgress = true;
        chatbotState.appointment.step = 'email';

        // Ask for email if we don't have it
        if (!chatbotState.context.userInfo.email) {
            addBotMessage("I'd be happy to schedule a consultation for you. Could you please provide your email address so we can send you a confirmation?");
        } else {
            // If we already have the email, use it and move to date selection
            chatbotState.appointment.details.email = chatbotState.context.userInfo.email;
            addBotMessage(`I'll use your email (${chatbotState.context.userInfo.email}) for the appointment. Now, let's select a date for your consultation.`);

            // Show date picker after a short delay
            setTimeout(() => {
                addDatePicker();
            }, 1000);
        }
    }

    // Function to handle the appointment scheduling flow
    function handleAppointmentFlow(message) {
        const currentStep = chatbotState.appointment.step;

        switch(currentStep) {
            case 'email':
                handleEmailStep(message);
                break;

            case 'date':
                // This is handled by the date picker UI
                break;

            case 'time':
                // This is handled by the time selection UI
                break;

            case 'service':
                handleServiceStep(message);
                break;

            case 'notes':
                handleNotesStep(message);
                break;

            default:
                // If we're in an unknown state, reset the flow
                chatbotState.appointment.inProgress = false;
                chatbotState.appointment.step = null;
                addBotMessage("I'm sorry, there was an issue with the appointment scheduling. Let's try again. What would you like to do?");
        }
    }

    // Handle the email collection step
    function handleEmailStep(message) {
        // Check if the message contains a valid email
        const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;

        if (emailRegex.test(message)) {
            // Valid email format
            chatbotState.appointment.details.email = message;
            chatbotState.context.userInfo.email = message; // Also store in user info

            // Move to date selection
            chatbotState.appointment.step = 'date';

            addBotMessage("Thank you! Now, let's select a date for your consultation.");

            // Show date picker after a short delay
            setTimeout(() => {
                addDatePicker();
            }, 1000);
        } else {
            // Invalid email format
            addBotMessage("That doesn't appear to be a valid email address. Please provide a valid email so we can send you the appointment confirmation.");
        }
    }

    // Handle the service selection step
    function handleServiceStep(message) {
        // Store the service
        chatbotState.appointment.details.service = message;

        // Move to confirmation
        showAppointmentConfirmation();
    }

    // Handle the notes collection step
    function handleNotesStep(message) {
        // Store the notes
        chatbotState.appointment.details.notes = message;

        // Thank the user and complete the flow
        addBotMessage("Thank you for providing those details. We'll make sure to prepare for your specific needs before the consultation.");

        // Reset the appointment flow
        chatbotState.appointment.inProgress = false;
        chatbotState.appointment.step = null;
    }
}

function showTypingIndicator() {
    const messagesContainer = document.getElementById('simple-chatbot-messages');
    const typingIndicator = document.createElement('div');
    typingIndicator.id = 'typing-indicator';
    typingIndicator.className = 'typing-indicator';
    typingIndicator.innerHTML = '<span></span><span></span><span></span>';
    messagesContainer.appendChild(typingIndicator);
    scrollToBottom();
}

function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function openChatbotWithMessage(message) {
    const chatbotContainer = document.getElementById('simple-chatbot-container');

    // Open the chatbot
    chatbotContainer.classList.remove('hidden');

    // Add the proactive message
    addBotMessage(message);

    // Add appropriate quick options based on the current page
    const currentPath = window.location.pathname;
    let options = [];

    if (currentPath.includes('services')) {
        options = [
            "Tell me about SEO services",
            "What social media platforms do you manage?",
            "How much do your services cost?",
            "I'd like to schedule a consultation"
        ];
    }
    else if (currentPath.includes('about')) {
        options = [
            "How long have you been in business?",
            "What makes your agency different?",
            "What industries do you specialize in?",
            "I'd like to learn about your services"
        ];
    }
    else if (currentPath.includes('contact')) {
        options = [
            "I'd like to schedule a consultation",
            "What's your process for new clients?",
            "How quickly can we get started?",
            "Tell me about your services first"
        ];
    }
    else {
        // Default options
        options = [
            "What services do you offer?",
            "How much do your services cost?",
            "Tell me about your company",
            "I'd like to schedule a consultation"
        ];
    }

    // Add the quick options
    setTimeout(() => {
        addQuickOptions(options);
    }, 800);
}

function initializeChatbotState() {
    // Set session start time
    chatbotState.sessionStartTime = new Date();

    // Initialize properties that might be missing
    chatbotState.awaitingUserInfo = null;
    chatbotState.shouldAddSuggestions = false;

    // Check for returning user
    const savedState = localStorage.getItem('ms-chatbot-state');
    if (savedState) {
        try {
            const parsedState = JSON.parse(savedState);

            // Only restore certain parts of the state to avoid conflicts
            if (parsedState.context && parsedState.context.userInfo) {
                chatbotState.context.userInfo = parsedState.context.userInfo;
            }

            if (parsedState.context && parsedState.context.userInterests) {
                chatbotState.context.userInterests = parsedState.context.userInterests;
            }

            // Update visit counts
            if (parsedState.context && parsedState.context.totalSiteVisits) {
                chatbotState.context.totalSiteVisits = parsedState.context.totalSiteVisits + 1;
            } else {
                chatbotState.context.totalSiteVisits = 1;
            }

            // Check if they've visited this specific page before
            if (parsedState.context &&
                parsedState.context.currentPage === window.location.pathname &&
                parsedState.context.pageVisitCount) {
                chatbotState.context.pageVisitCount = parsedState.context.pageVisitCount + 1;
            } else {
                chatbotState.context.pageVisitCount = 1;
            }

            // Mark as returning user
            chatbotState.isReturningUser = true;

            // Set up page-specific intelligence
            setupPageSpecificIntelligence();

        } catch (e) {
            console.error('Error parsing saved chatbot state:', e);
            // Reset to default if there's an error
            chatbotState.isReturningUser = false;
            chatbotState.context.totalSiteVisits = 1;
            chatbotState.context.pageVisitCount = 1;
        }
    } else {
        chatbotState.isReturningUser = false;
        chatbotState.context.totalSiteVisits = 1;
        chatbotState.context.pageVisitCount = 1;
    }

    // Set up scroll tracking
    setupScrollTracking();

    console.log('Chatbot state initialized:', chatbotState);
}

function setupPageSpecificIntelligence() {
    const currentPath = window.location.pathname;

    // Set up suggested topics based on the current page
    if (currentPath.includes('services')) {
        chatbotState.intelligence.suggestedTopics = [
            'service offerings', 'pricing', 'case studies', 'results', 'process'
        ];
        chatbotState.intelligence.detectedIntent = 'explore_services';
    }
    else if (currentPath.includes('about')) {
        chatbotState.intelligence.suggestedTopics = [
            'company history', 'team expertise', 'values', 'approach', 'differentiators'
        ];
        chatbotState.intelligence.detectedIntent = 'learn_about_company';
    }
    else if (currentPath.includes('portfolio') || currentPath.includes('case-studies')) {
        chatbotState.intelligence.suggestedTopics = [
            'results', 'methodologies', 'similar projects', 'timelines', 'industries'
        ];
        chatbotState.intelligence.detectedIntent = 'see_proof';
    }
    else if (currentPath.includes('contact')) {
        chatbotState.intelligence.suggestedTopics = [
            'consultation', 'process', 'timeline', 'next steps', 'requirements'
        ];
        chatbotState.intelligence.detectedIntent = 'get_in_touch';
    }
    else if (currentPath.includes('blog')) {
        chatbotState.intelligence.suggestedTopics = [
            'related articles', 'industry trends', 'expert advice', 'subscribe'
        ];
        chatbotState.intelligence.detectedIntent = 'research';
    }
}

function setupScrollTracking() {
    // Track scroll depth
    window.addEventListener('scroll', function() {
        // Calculate scroll depth as percentage
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollDepth = scrollTop / scrollHeight;

        // Update the chatbot state
        chatbotState.userBehavior.scrollDepth = scrollDepth;

        // Check if they've scrolled past threshold
        if (scrollDepth > 0.6 && !chatbotState.userBehavior.hasScrolledPastThreshold) {
            chatbotState.userBehavior.hasScrolledPastThreshold = true;
            // Could trigger actions here based on scroll depth
        }
    });

    // Track time on page
    setInterval(function() {
        chatbotState.userBehavior.timeOnPage = (new Date() - chatbotState.sessionStartTime) / 1000;
    }, 5000); // Update every 5 seconds
}

function saveChatbotState() {
    try {
        localStorage.setItem('ms-chatbot-state', JSON.stringify(chatbotState));
    } catch (e) {
        console.error('Error saving chatbot state:', e);
    }
}

function updateChatbotState(message) {
    // Add to conversation history
    chatbotState.conversationHistory.push({
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
    });

    // Update context based on message content
    updateContext(message);
}

function updateContext(message) {
    const lowerMessage = message.toLowerCase();

    // Update last topic
    chatbotState.context.lastTopic = detectTopic(lowerMessage);

    // Track user interests
    trackUserInterests(lowerMessage);

    // Extract any user information
    extractUserInfo(lowerMessage);

    // Update conversation stage
    updateConversationStage(lowerMessage);
}

function detectTopic(message) {
    // Detect the main topic of the message
    if (message.includes('seo') || message.includes('search engine') || message.includes('ranking')) {
        return 'seo';
    } else if (message.includes('social media') || message.includes('facebook') || message.includes('instagram')) {
        return 'social_media';
    } else if (message.includes('ppc') || message.includes('pay per click') || message.includes('advertising')) {
        return 'ppc';
    } else if (message.includes('content') || message.includes('blog') || message.includes('article')) {
        return 'content';
    } else if (message.includes('web') || message.includes('website') || message.includes('design')) {
        return 'web_design';
    } else if (message.includes('price') || message.includes('cost') || message.includes('package')) {
        return 'pricing';
    } else if (message.includes('contact') || message.includes('email') || message.includes('phone')) {
        return 'contact';
    } else {
        return 'general';
    }
}

function trackUserInterests(message) {
    // Add topics to user interests if they're not already there
    const topic = detectTopic(message);
    if (topic !== 'general' && !chatbotState.context.userInterests.includes(topic)) {
        chatbotState.context.userInterests.push(topic);
    }

    // Track mentioned services
    const services = ['seo', 'social media', 'ppc', 'content', 'web design', 'email marketing'];
    services.forEach(service => {
        if (message.includes(service) && !chatbotState.context.mentionedServices.includes(service)) {
            chatbotState.context.mentionedServices.push(service);
        }
    });
}

function extractUserInfo(message) {
    // Extract name if it appears to be introduced
    if (message.includes('my name is') || message.includes("i'm ") || message.includes('i am ')) {
        const nameMatch = message.match(/my name is (.+?)[\.\,\s]|i'm (.+?)[\.\,\s]|i am (.+?)[\.\,\s]/i);
        if (nameMatch) {
            const name = (nameMatch[1] || nameMatch[2] || nameMatch[3]).trim();
            if (name.length > 1 && name.length < 20) { // Basic validation
                chatbotState.context.userInfo.name = name;
            }
        }
    }

    // Extract company if mentioned
    if (message.includes('company') || message.includes('business') || message.includes('organization')) {
        const companyMatch = message.match(/my company is (.+?)[\.\,\s]|our company is (.+?)[\.\,\s]|at (.+?)[\.\,\s]/i);
        if (companyMatch) {
            const company = (companyMatch[1] || companyMatch[2] || companyMatch[3]).trim();
            if (company.length > 1) {
                chatbotState.context.userInfo.company = company;
            }
        }
    }

    // Extract email if shared
    const emailMatch = message.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    if (emailMatch) {
        chatbotState.context.userInfo.email = emailMatch[0];
    }
}

function updateConversationStage(message) {
    // Update the conversation stage based on the message and current stage
    const currentStage = chatbotState.context.conversationStage;

    if (currentStage === 'greeting') {
        // Move to exploration after initial greeting
        chatbotState.context.conversationStage = 'exploration';
    } else if (currentStage === 'exploration') {
        // Check if user is asking specific questions
        if (message.includes('how much') || message.includes('pricing') ||
            message.includes('details') || message.includes('specific')) {
            chatbotState.context.conversationStage = 'specific_inquiry';
        }
    } else if (currentStage === 'specific_inquiry') {
        // Check if user is wrapping up
        if (message.includes('thank') || message.includes('bye') ||
            message.includes('later') || message.includes('contact')) {
            chatbotState.context.conversationStage = 'closing';
        }
    }
}

function analyzeUserIntent(message) {
    // Analyze the user's message to determine their intent
    const lowerMessage = message.toLowerCase();

    // Detect entities in the message (services, locations, etc.)
    const entities = detectEntities(lowerMessage);
    chatbotState.intelligence.entityRecognition = entities;

    // Determine the user's intent
    let intent = 'general_inquiry';
    let confidence = 0.5; // Default confidence

    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much')) {
        intent = 'pricing_inquiry';
        confidence = 0.8;
    }
    else if (lowerMessage.includes('schedule') || lowerMessage.includes('appointment') || lowerMessage.includes('consultation')) {
        intent = 'schedule_meeting';
        confidence = 0.9;
    }
    else if (lowerMessage.includes('compare') || lowerMessage.includes('difference') || lowerMessage.includes('better than')) {
        intent = 'comparison';
        confidence = 0.7;
    }
    else if (lowerMessage.includes('result') || lowerMessage.includes('case study') || lowerMessage.includes('portfolio')) {
        intent = 'proof_request';
        confidence = 0.8;
    }
    else if (lowerMessage.includes('process') || lowerMessage.includes('how do you') || lowerMessage.includes('steps')) {
        intent = 'process_inquiry';
        confidence = 0.75;
    }

    // Update the chatbot state with the detected intent
    chatbotState.intelligence.detectedIntent = intent;
    chatbotState.intelligence.confidenceScore = confidence;
}

function detectEntities(message) {
    // Detect entities in the user's message
    const entities = {
        services: [],
        locations: [],
        timeframes: [],
        platforms: [],
        businessType: null
    };

    // Detect services
    const serviceKeywords = {
        'seo': ['seo', 'search engine', 'ranking', 'organic', 'keyword'],
        'social_media': ['social', 'facebook', 'instagram', 'twitter', 'linkedin', 'tiktok'],
        'ppc': ['ppc', 'pay per click', 'google ads', 'advertising', 'ad campaign'],
        'content': ['content', 'blog', 'article', 'writing', 'copywriting'],
        'web_design': ['web', 'website', 'design', 'development', 'landing page'],
        'email': ['email', 'newsletter', 'campaign', 'automation']
    };

    // Check for service mentions
    Object.keys(serviceKeywords).forEach(service => {
        const keywords = serviceKeywords[service];
        for (const keyword of keywords) {
            if (message.includes(keyword)) {
                if (!entities.services.includes(service)) {
                    entities.services.push(service);
                }
                break;
            }
        }
    });

    // Detect platforms
    const platformKeywords = ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube', 'pinterest', 'google'];
    platformKeywords.forEach(platform => {
        if (message.includes(platform)) {
            entities.platforms.push(platform);
        }
    });

    // Detect timeframes
    const timeframePatterns = [
        { regex: /(\d+)\s*(day|days)/i, unit: 'days' },
        { regex: /(\d+)\s*(week|weeks)/i, unit: 'weeks' },
        { regex: /(\d+)\s*(month|months)/i, unit: 'months' },
        { regex: /(\d+)\s*(year|years)/i, unit: 'years' }
    ];

    timeframePatterns.forEach(pattern => {
        const match = message.match(pattern.regex);
        if (match) {
            entities.timeframes.push({
                value: parseInt(match[1]),
                unit: pattern.unit
            });
        }
    });

    // Detect business type
    const businessTypes = {
        'ecommerce': ['ecommerce', 'online store', 'shop', 'product', 'sell online'],
        'local_business': ['local business', 'store', 'restaurant', 'shop', 'local'],
        'b2b': ['b2b', 'business to business', 'corporate', 'enterprise'],
        'saas': ['saas', 'software', 'app', 'application'],
        'professional_services': ['law firm', 'lawyer', 'accountant', 'consultant', 'agency']
    };

    Object.keys(businessTypes).forEach(type => {
        const keywords = businessTypes[type];
        for (const keyword of keywords) {
            if (message.includes(keyword)) {
                entities.businessType = type;
                break;
            }
        }
    });

    return entities;
}

function suggestRelevantTopic() {
    // Suggest a relevant topic based on the page they're on and conversation so far
    const currentPath = window.location.pathname;
    let suggestedMessage = "";

    // Different suggestions based on the page
    if (currentPath.includes('services')) {
        suggestedMessage = "I notice you're exploring our services. Would you like me to explain our approach to digital marketing and what makes us different from other agencies?";
    }
    else if (currentPath.includes('about')) {
        suggestedMessage = "Since you're on our About page, would you like to know more about our team's expertise or our company history?";
    }
    else if (currentPath.includes('portfolio')) {
        suggestedMessage = "I see you're looking at our portfolio. Would you like to see case studies from a specific industry or for a particular service?";
    }
    else if (currentPath.includes('contact')) {
        suggestedMessage = "I notice you're on our contact page. Would you like me to help schedule a consultation with our team?";
    }
    else if (currentPath.includes('blog')) {
        suggestedMessage = "Since you're browsing our blog, would you like recommendations for articles related to a specific digital marketing topic?";
    }
    else {
        // Default suggestion
        suggestedMessage = "By the way, would you like to know what makes our approach to digital marketing different?";
    }

    // Add the suggestion with a delay
    addBotMessage(suggestedMessage);

    // Add quick response options
    setTimeout(() => {
        addQuickOptions([
            "Yes, tell me more",
            "Not right now",
            "I have a different question"
        ]);
    }, 500);
}

function clearConversation() {
    // Clear the chat messages
    const messagesContainer = document.getElementById('simple-chatbot-messages');
    messagesContainer.innerHTML = '';

    // Reset the conversation state but keep user info
    const userInfo = chatbotState.context.userInfo;
    chatbotState.conversationHistory = [];
    chatbotState.context = {
        lastTopic: null,
        userInterests: [],
        mentionedServices: [],
        userInfo: userInfo, // Keep the user info
        conversationStage: 'greeting'
    };

    // Show a reset message
    addBotMessage("I've reset our conversation. How can I help you today?");

    // Add quick options
    setTimeout(() => {
        addQuickOptions([
            "What services do you offer?",
            "How much do your services cost?",
            "Tell me about SEO",
            "Contact information"
        ]);
    }, 500);

    // Save the updated state
    saveChatbotState();
}

function handleUserInfoCollection(message) {
    // Check if user is canceling or saying they're done
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('no, that\'s all') ||
        lowerMessage.includes('that\'s all for now') ||
        lowerMessage.includes('no thanks') ||
        lowerMessage.includes('no, thank') ||
        lowerMessage.includes('cancel') ||
        lowerMessage.includes('never mind')) {

        // Reset the awaiting state
        chatbotState.awaitingUserInfo = null;

        // If we were in appointment flow, reset that too
        if (chatbotState.appointment.inProgress) {
            chatbotState.appointment.inProgress = false;
            chatbotState.appointment.step = null;
        }

        // Provide a friendly response
        addBotMessage("No problem! If you change your mind or have any other questions, I'm here to help. Have a great day!");
        return;
    }

    // Handle collection of user information when in collection mode
    if (chatbotState.awaitingUserInfo === 'email') {
        const emailMatch = message.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
        if (emailMatch) {
            chatbotState.context.userInfo.email = emailMatch[0];
            chatbotState.awaitingUserInfo = null;

            // If we're in appointment flow, continue with that
            if (chatbotState.appointment.inProgress) {
                chatbotState.appointment.details.email = emailMatch[0];
                chatbotState.appointment.step = 'date';

                addBotMessage(`Thank you for providing your email (${emailMatch[0]}). Now, let's select a date for your consultation.`);

                // Show date picker after a short delay
                setTimeout(() => {
                    addDatePicker();
                }, 1000);
                return;
            }

            // Otherwise, standard email collection flow
            addBotMessage(`Thank you for providing your email (${emailMatch[0]}). A member of our team will contact you shortly to discuss your needs.`);

            setTimeout(() => {
                addBotMessage("Is there anything else you'd like to know in the meantime?");
                addQuickOptions([
                    "Tell me more about your services",
                    "What makes you different?",
                    "No thanks, that's all for now"
                ]);
            }, 1000);
        } else {
            addBotMessage("That doesn't appear to be a valid email address. Please provide a valid email so our team can contact you.");
        }
    } else if (chatbotState.awaitingUserInfo === 'name') {
        if (message.length > 1 && message.length < 30) {
            chatbotState.context.userInfo.name = message;
            chatbotState.awaitingUserInfo = null;

            addBotMessage(`Nice to meet you, ${message}! How can I help you today?`);

            setTimeout(() => {
                addQuickOptions([
                    "What services do you offer?",
                    "How much do your services cost?",
                    "Tell me about your company"
                ]);
            }, 800);
        } else {
            addBotMessage("I didn't quite catch that. Could you please share your name again?");
        }
    }
}

function showSequentialResponses(responses) {
    // Show multiple responses with a delay between each
    if (!responses || responses.length === 0) return;

    // Show the first response immediately
    addBotMessage(responses[0]);

    // Show the rest with delays
    for (let i = 1; i < responses.length; i++) {
        const delay = 1000 + (i - 1) * 800; // Increasing delay for each message
        setTimeout(() => {
            addBotMessage(responses[i]);

            // If this is the last response and we should add suggestions
            if (i === responses.length - 1 && chatbotState.shouldAddSuggestions) {
                setTimeout(() => {
                    addRelevantSuggestions();
                    chatbotState.shouldAddSuggestions = false;
                }, 800);
            }
        }, delay);
    }
}

function shouldAddSuggestions(message) {
    // Determine if we should add suggestions after this message
    const lowerMessage = message.toLowerCase();

    // Don't add suggestions if the user is saying goodbye
    if (lowerMessage.includes('bye') || lowerMessage.includes('thank')) {
        return false;
    }

    // Add suggestions if the user is asking about services or pricing
    if (lowerMessage.includes('service') || lowerMessage.includes('price') ||
        lowerMessage.includes('offer') || lowerMessage.includes('help')) {
        return true;
    }

    // Add suggestions if we're in the exploration stage
    if (chatbotState.context.conversationStage === 'exploration') {
        return true;
    }

    // By default, don't add suggestions for every message
    return false;
}

function addRelevantSuggestions() {
    // Add relevant suggestions based on the conversation context
    let suggestions = [];

    // Base suggestions on the last topic if available
    const lastTopic = chatbotState.context.lastTopic;

    if (lastTopic === 'seo') {
        suggestions = [
            "How much do SEO services cost?",
            "How long until I see SEO results?",
            "Do you offer content creation?"
        ];
    } else if (lastTopic === 'social_media') {
        suggestions = [
            "Which platforms do you manage?",
            "Do you create social media content?",
            "How do you measure social media success?"
        ];
    } else if (lastTopic === 'ppc') {
        suggestions = [
            "What's your approach to PPC?",
            "How do you optimize ad spend?",
            "Do you handle Google and Facebook ads?"
        ];
    } else if (lastTopic === 'pricing') {
        suggestions = [
            "Do you offer package deals?",
            "Is there a minimum contract period?",
            "Schedule a consultation"
        ];
    } else if (lastTopic === 'contact') {
        suggestions = [
            "Tell me more about your team",
            "What industries do you specialize in?",
            "I'd like to schedule a call"
        ];
    } else {
        // Default suggestions
        suggestions = [
            "What makes your agency different?",
            "Can you share some case studies?",
            "How do we get started?"
        ];
    }

    // Add the suggestions
    addQuickOptions(suggestions);
}

function addQuickOptions(options) {
    const messagesContainer = document.getElementById('simple-chatbot-messages');
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'quick-options';

    options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'quick-option-button';
        button.textContent = option;
        button.addEventListener('click', function() {
            // Add the selected option as a user message
            addUserMessage(option);

            // Remove the options container
            optionsContainer.remove();

            // Process the user's selection
            const chatInput = document.getElementById('simple-chatbot-input');
            chatInput.value = '';

            // Show typing indicator
            showTypingIndicator();

            // Generate response with a realistic delay
            setTimeout(function() {
                // Hide typing indicator
                hideTypingIndicator();

                // Check if we're in post-confirmation state
                if (chatbotState.appointment.step === 'post_confirmation') {
                    // Handle post-confirmation responses
                    handlePostConfirmationResponse(option);
                } else {
                    // Get and display standard response
                    const response = generateContextualResponse(option);
                    addBotMessage(response);
                }
            }, 1500);
        });

        optionsContainer.appendChild(button);
    });

    messagesContainer.appendChild(optionsContainer);
    scrollToBottom();
}

// Function to add a date picker for appointment scheduling
function addDatePicker() {
    const messagesContainer = document.getElementById('simple-chatbot-messages');
    const datePickerContainer = document.createElement('div');
    datePickerContainer.className = 'date-picker-container';
    datePickerContainer.innerHTML = `
        <div class="date-picker-header">Select a date for your consultation</div>
        <input type="text" id="appointment-date-picker" class="appointment-date-input" placeholder="Click to select a date" readonly>
    `;

    messagesContainer.appendChild(datePickerContainer);
    scrollToBottom();

    // Initialize Flatpickr with configuration
    const today = new Date();
    const minDate = new Date();
    minDate.setDate(today.getDate() + 1); // Start from tomorrow

    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 30); // Allow booking up to 30 days in advance

    // Disable weekends (Saturday and Sunday)
    const disableDays = function(date) {
        return (date.getDay() === 0 || date.getDay() === 6);
    };

    // Initialize the date picker
    setTimeout(() => {
        const datePicker = flatpickr("#appointment-date-picker", {
            minDate: minDate,
            maxDate: maxDate,
            disable: [disableDays],
            dateFormat: "F j, Y", // e.g., "January 1, 2023"
            disableMobile: false,
            onChange: function(_, dateStr) {
                // Store the selected date
                chatbotState.appointment.details.date = dateStr;

                // Remove the date picker
                datePickerContainer.remove();

                // Show typing indicator
                showTypingIndicator();

                // Proceed to time selection
                setTimeout(() => {
                    hideTypingIndicator();
                    addBotMessage(`Great! You've selected ${dateStr}. Now, please select a time for your consultation:`);
                    addTimeOptions();
                }, 1000);
            }
        });

        // Open the date picker automatically
        datePicker.open();
    }, 500);
}

// Function to add time selection options
function addTimeOptions() {
    const messagesContainer = document.getElementById('simple-chatbot-messages');
    const timeOptionsContainer = document.createElement('div');
    timeOptionsContainer.className = 'time-options-container';

    // Create time slots
    const timeSlots = chatbotState.appointment.availableTimes;

    timeOptionsContainer.innerHTML = `
        <div class="time-options-header">Available Time Slots</div>
        <div class="time-slots"></div>
    `;

    messagesContainer.appendChild(timeOptionsContainer);

    const timeSlotsContainer = timeOptionsContainer.querySelector('.time-slots');

    // Add time slot buttons
    timeSlots.forEach(time => {
        const timeButton = document.createElement('button');
        timeButton.className = 'time-slot-button';
        timeButton.textContent = time;
        timeButton.addEventListener('click', function() {
            // Store the selected time
            chatbotState.appointment.details.time = time;

            // Remove the time options
            timeOptionsContainer.remove();

            // Show typing indicator
            showTypingIndicator();

            // Proceed to service selection or confirmation
            setTimeout(() => {
                hideTypingIndicator();

                // If we already know the service, go to confirmation
                if (chatbotState.appointment.details.service) {
                    showAppointmentConfirmation();
                } else {
                    // Otherwise ask for the service
                    addBotMessage("What service are you interested in discussing during your consultation?");
                    addServiceOptions();
                }
            }, 1000);
        });

        timeSlotsContainer.appendChild(timeButton);
    });

    scrollToBottom();
}

// Function to add service selection options
function addServiceOptions() {
    const services = [
        "SEO & Content Marketing",
        "Social Media Management",
        "PPC & Paid Advertising",
        "Web Design & Development",
        "Email Marketing",
        "General Digital Strategy"
    ];

    addQuickOptions(services);

    // Override the default click behavior for these specific options
    const buttons = document.querySelectorAll('.quick-option-button');
    buttons.forEach(button => {
        // Store original click handler (not used but kept for reference)
        button.onclick = function() {
            // Store the selected service
            chatbotState.appointment.details.service = button.textContent;

            // Remove the options
            button.closest('.quick-options').remove();

            // Add user message
            addUserMessage(button.textContent);

            // Show typing indicator
            showTypingIndicator();

            // Show confirmation
            setTimeout(() => {
                hideTypingIndicator();
                showAppointmentConfirmation();
            }, 1000);
        };
    });
}

// Function to show appointment confirmation
function showAppointmentConfirmation() {
    const { date, time, service, email } = chatbotState.appointment.details;

    const confirmationMessage = `
Great! I've scheduled your consultation for:

• Date: ${date}
• Time: ${time}
• Service: ${service || "General Consultation"}
• Email: ${email}

Our team will send a calendar invitation to your email with a meeting link. Is there anything specific you'd like us to prepare for the consultation?`;

    addBotMessage(confirmationMessage);

    // Save the appointment to localStorage
    saveAppointment();

    // Set a special state to handle post-confirmation responses
    chatbotState.appointment.inProgress = false;
    chatbotState.appointment.step = 'post_confirmation';

    // Add follow-up options
    setTimeout(() => {
        addQuickOptions([
            "Yes, I have specific questions",
            "No, that's all for now",
            "I need to reschedule"
        ]);
    }, 1000);
}

// Function to save appointment to localStorage
function saveAppointment() {
    try {
        // Get existing appointments or initialize empty array
        const existingAppointments = JSON.parse(localStorage.getItem('ms-appointments') || '[]');

        // Add new appointment
        existingAppointments.push({
            ...chatbotState.appointment.details,
            id: Date.now(), // Simple unique ID
            createdAt: new Date().toISOString()
        });

        // Save back to localStorage
        localStorage.setItem('ms-appointments', JSON.stringify(existingAppointments));

        console.log('Appointment saved successfully');
    } catch (error) {
        console.error('Error saving appointment:', error);
    }
}

function addUserMessage(message) {
    const messagesContainer = document.getElementById('simple-chatbot-messages');
    const messageElement = document.createElement('div');
    messageElement.className = 'user-message';
    messageElement.textContent = message;
    messagesContainer.appendChild(messageElement);
    scrollToBottom();
}

function addBotMessage(message) {
    const messagesContainer = document.getElementById('simple-chatbot-messages');
    const messageElement = document.createElement('div');
    messageElement.className = 'bot-message';

    // Format numbered lists properly
    let formattedMessage = message;

    // Handle numbered lists (1. Item format)
    formattedMessage = formattedMessage.replace(/(\d+\.\s.*?)(?=\n\d+\.|\n\n|$)/gs, function(match) {
        return '<div class="list-item">' + match + '</div>';
    });

    // Convert newlines to <br> tags and handle bullet points
    formattedMessage = formattedMessage
        .replace(/\n\n/g, '<br><br>')
        .replace(/\n(?!\<br)/g, '<br>')
        .replace(/•/g, '<span style="display: inline-block; margin-right: 5px;">•</span>');

    messageElement.innerHTML = formattedMessage;
    messagesContainer.appendChild(messageElement);
    scrollToBottom();
}

function scrollToBottom() {
    const messagesContainer = document.getElementById('simple-chatbot-messages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function generateContextualResponse(message) {
    message = message.toLowerCase();

    // Check if we need to ask for user information
    if (message.includes('schedule') || message.includes('consultation') || message.includes('talk to someone') ||
        message.includes('contact me') || message.includes('get in touch')) {

        if (!chatbotState.context.userInfo.email) {
            chatbotState.awaitingUserInfo = 'email';
            return "I'd be happy to arrange that for you. Could you please provide your email address so our team can contact you?";
        }
    }

    // Check if the user is introducing themselves
    if ((message.includes('my name is') || message.includes("i'm ") || message.includes('i am ')) &&
        !chatbotState.context.userInfo.name) {

        const nameMatch = message.match(/my name is (.+?)[\.\,\s]|i'm (.+?)[\.\,\s]|i am (.+?)[\.\,\s]/i);
        if (nameMatch) {
            const name = (nameMatch[1] || nameMatch[2] || nameMatch[3]).trim();
            if (name.length > 1 && name.length < 20) {
                chatbotState.context.userInfo.name = name;
                return `Nice to meet you, ${name}! How can I help you today with your digital marketing needs?`;
            }
        } else {
            chatbotState.awaitingUserInfo = 'name';
            return "I'd love to know your name. What should I call you?";
        }
    }

    // Check for multi-part questions and prepare sequential responses
    if (message.includes('and') && (
        (message.includes('seo') && message.includes('social')) ||
        (message.includes('price') && message.includes('timeline')) ||
        (message.includes('service') && message.includes('different'))
    )) {
        return prepareSequentialResponse(message);
    }

    // Consider conversation context for more relevant responses
    const lastTopic = chatbotState.context.lastTopic;
    const conversationStage = chatbotState.context.conversationStage;

    // If we're in a specific inquiry about a topic, provide more detailed information
    if (conversationStage === 'specific_inquiry' && lastTopic && lastTopic !== 'general') {
        return getDetailedTopicResponse(lastTopic, message);
    }

    // If we're in the closing stage, provide a warm closing response
    if (conversationStage === 'closing') {
        if (message.includes('thank') || message.includes('bye') || message.includes('goodbye')) {
            // If we have their name, personalize the goodbye
            if (chatbotState.context.userInfo.name) {
                return `Thank you for chatting with us, ${chatbotState.context.userInfo.name}! If you have any more questions in the future, feel free to reach out anytime. Have a great day!`;
            } else {
                return "Thank you for chatting with us! If you have any more questions, feel free to reach out anytime. Have a great day!";
            }
        }
    }

    // Fall back to the standard response logic if no contextual response was generated
    return generateStandardResponse(message);
}

function prepareSequentialResponse(message) {
    // Handle multi-part questions with sequential responses
    let responses = [];

    if (message.includes('seo') && message.includes('social')) {
        responses = [
            "Let me tell you about both our SEO and social media services:",
            "For SEO, we focus on improving your website's visibility in search engines through keyword research, on-page optimization, content creation, and link building. Our goal is to drive organic traffic that converts.",
            "For social media, we develop platform-specific strategies, create engaging content, manage community interactions, and run targeted ad campaigns to build your brand presence and drive engagement."
        ];
        chatbotState.shouldAddSuggestions = true;
        return responses;
    }

    if (message.includes('price') && message.includes('timeline')) {
        responses = [
            "Regarding pricing and timelines:",
            "Our pricing is customized based on your specific needs and goals. Basic packages start at $1,000/month, while more comprehensive solutions range from $2,500-$5,000/month depending on the scope.",
            "As for timelines, you can expect to see initial results from PPC campaigns within days, social media improvements within weeks, and SEO progress within 3-6 months. We provide detailed monthly reports to track all progress."
        ];
        chatbotState.shouldAddSuggestions = true;
        return responses;
    }

    if (message.includes('service') && message.includes('different')) {
        responses = [
            "Our services and what makes us different:",
            "We offer comprehensive digital marketing services including SEO, social media management, PPC advertising, content marketing, web design, and analytics.",
            "What sets us apart is our data-driven approach, transparent reporting, and focus on ROI. We don't just drive traffic – we focus on conversions and revenue growth. Our team has specialized expertise across multiple industries, allowing us to apply proven strategies to your specific business."
        ];
        chatbotState.shouldAddSuggestions = true;
        return responses;
    }

    // If no specific multi-part question was matched
    return generateStandardResponse(message);
}

function getDetailedTopicResponse(topic, message) {
    // Provide more detailed responses based on the current topic of conversation

    switch(topic) {
        case 'seo':
            if (message.includes('how long') || message.includes('timeline') || message.includes('results')) {
                return "SEO is a long-term strategy that typically shows initial improvements within 3-6 months. However, the most significant results usually come after 6-12 months of consistent effort. We focus on quick wins first, like on-page optimization and technical fixes, while building toward long-term authority with content and link building. We'll provide monthly reports showing exactly how your rankings and traffic are improving over time.";
            } else if (message.includes('cost') || message.includes('price') || message.includes('package')) {
                return "Our SEO packages start at $1,000/month for local SEO campaigns and range up to $3,500/month for competitive national or international campaigns. Each package is customized based on your industry, competition level, and goals. We don't believe in one-size-fits-all pricing because every business has unique needs. Would you like me to have our SEO specialist prepare a custom quote for your business?";
            } else if (message.includes('process') || message.includes('how do you')) {
                return "Our SEO process begins with a comprehensive audit of your website and competitive landscape. We then develop a strategic roadmap that includes technical optimization, content development, on-page SEO, and link building. We prioritize actions based on impact and implement changes methodically. Throughout the process, we continuously monitor performance, make data-driven adjustments, and provide transparent reporting on all activities and results.";
            }
            break;

        case 'social_media':
            if (message.includes('platform') || message.includes('which')) {
                return "We manage campaigns across all major social platforms including Facebook, Instagram, Twitter, LinkedIn, TikTok, and Pinterest. Our approach is to focus on the platforms where your specific audience is most active rather than spreading efforts too thin. We'll help you identify which platforms will drive the best results for your business based on your industry, goals, and target demographic.";
            } else if (message.includes('content') || message.includes('post')) {
                return "Yes, our team handles all aspects of content creation including photography, graphic design, copywriting, and video production. We develop a content calendar aligned with your brand voice and marketing goals, then create engaging posts that resonate with your audience. All content is optimized for each specific platform and designed to drive engagement and conversions.";
            } else if (message.includes('ads') || message.includes('advertising')) {
                return "Our social media advertising services include strategy development, audience targeting, ad creation, A/B testing, and performance optimization. We work with budgets of all sizes and focus on maximizing your ROI. Our team is certified in all major social advertising platforms and stays current with the latest targeting capabilities and ad formats.";
            }
            break;

        case 'ppc':
            if (message.includes('platform') || message.includes('which')) {
                return "We manage PPC campaigns across Google Ads, Microsoft Ads (Bing), Facebook/Instagram Ads, LinkedIn Ads, Twitter Ads, and display networks. Our recommendation for which platforms to use depends on your industry, target audience, and business goals. We often start with the platforms that will deliver the quickest ROI and then expand as we optimize performance.";
            } else if (message.includes('budget') || message.includes('spend')) {
                return "We work with ad budgets ranging from $1,000 to $50,000+ per month. Our management fee is typically 15-20% of ad spend, with a minimum of $500/month. We're transparent about how every dollar is spent and focus on continuously improving your cost per acquisition. We don't lock you into long-term contracts for ad spend - you maintain control of your budget at all times.";
            } else if (message.includes('results') || message.includes('expect')) {
                return "PPC campaigns typically show results much faster than organic strategies - often within the first week of launching. During the first month, we focus on testing different ad variations, keywords, and audience targeting to identify what works best. By month two or three, you should see significant improvements in performance as we optimize based on the data collected. We provide detailed reports showing all key metrics including impressions, clicks, conversions, and ROI.";
            }
            break;

        case 'pricing':
            if (message.includes('package') || message.includes('bundle')) {
                return "Yes, we offer package deals that combine complementary services for better results and value. Popular packages include SEO + Content Marketing ($2,500/month), Social Media + PPC ($2,800/month), and our Comprehensive Digital Marketing package that includes all core services ($4,500/month). Each package can be customized to your specific needs and budget constraints.";
            } else if (message.includes('contract') || message.includes('commitment')) {
                return "We typically recommend a 6-month initial commitment for most services to allow enough time to implement strategies and see meaningful results. However, we also offer month-to-month options with a slightly higher rate. We're confident in our work and don't believe in locking clients into long-term contracts if they're not seeing results. All contracts include a 30-day notice period for cancellation.";
            } else if (message.includes('payment') || message.includes('invoice')) {
                return "We invoice clients at the beginning of each month for that month's services. Payment is due within 15 days of invoice receipt. We accept all major credit cards, bank transfers, and PayPal. For annual contracts paid upfront, we offer a 10% discount on our standard rates.";
            }
            break;
    }

    // If no detailed response matched, fall back to standard response
    return generateStandardResponse(message);
}

function generateStandardResponse(message) {
    // Standard response logic for when contextual responses don't apply

    // Greeting patterns
    if (message.includes('hello') || message.includes('hi') || message.includes('hey') || message.includes('howdy') || message.includes('greetings')) {
        // Personalize if we know their name
        if (chatbotState.context.userInfo.name) {
            return `Hello ${chatbotState.context.userInfo.name}! How can I help you with your digital marketing needs today?`;
        } else {
            return "Hello! How can I help you with your digital marketing needs today?";
        }
    }

    // Services and offerings
    else if (message.includes('service') || message.includes('offer') || message.includes('provide') || message.includes('help with')) {
        return "We offer a comprehensive range of digital marketing services including:\n\n• SEO & Content Marketing\n• Social Media Management\n• PPC & Paid Advertising\n• Email Marketing Campaigns\n• Web Design & Development\n• Analytics & Reporting\n\nWhich service are you most interested in learning more about?";
    }

    // Specific service inquiries
    else if (message.includes('seo') || message.includes('search engine') || message.includes('ranking') || message.includes('google')) {
        return "Our SEO services help improve your website's visibility in search engines like Google. We conduct keyword research, optimize your website structure, create quality content, and build authoritative backlinks to boost your organic rankings and drive targeted traffic to your site.";
    }
    else if (message.includes('social media') || message.includes('facebook') || message.includes('instagram') || message.includes('twitter') || message.includes('linkedin') || message.includes('tiktok')) {
        return "Our social media management services include platform strategy, content creation, community engagement, paid social campaigns, and performance analytics. We help you build a strong social presence across all relevant platforms for your business.";
    }
    else if (message.includes('content') || message.includes('blog') || message.includes('article') || message.includes('writing')) {
        return "Our content marketing team creates engaging, SEO-optimized content that resonates with your target audience. This includes blog posts, articles, whitepapers, case studies, infographics, and more - all designed to establish your authority and drive conversions.";
    }
    else if (message.includes('ppc') || message.includes('pay per click') || message.includes('google ads') || message.includes('advertising') || message.includes('ads')) {
        return "Our PPC services deliver targeted advertising campaigns across Google, Bing, social media platforms, and display networks. We handle keyword research, ad creation, bid management, and continuous optimization to maximize your ROI.";
    }
    else if (message.includes('email') || message.includes('newsletter') || message.includes('campaign')) {
        return "Our email marketing services include campaign strategy, list management, content creation, automation, A/B testing, and performance analysis. We help you nurture leads and maintain customer relationships through targeted, personalized email communications.";
    }
    else if (message.includes('website') || message.includes('web design') || message.includes('development') || message.includes('landing page')) {
        return "Our web design and development team creates responsive, user-friendly websites optimized for conversions. We focus on creating seamless user experiences with fast loading times, intuitive navigation, and compelling calls-to-action.";
    }

    // Pricing inquiries
    else if (message.includes('price') || message.includes('cost') || message.includes('how much') || message.includes('rates') || message.includes('packages')) {
        return "Our pricing varies based on your specific needs and goals. We create custom packages tailored to your business requirements, starting from $1,000/month for basic services. Would you like to schedule a free consultation to discuss pricing options for your specific needs?";
    }

    // Contact information
    else if (message.includes('contact') || message.includes('reach') || message.includes('email') || message.includes('phone') || message.includes('talk to human')) {
        return "You can reach our team at msdigitalmarketingagency90@gmail.com or call us at +233 (XXX) XXX-XXXX. Our office hours are Monday-Friday, 9am-5pm GMT. Would you like us to have someone contact you directly?";
    }

    // Location information
    else if (message.includes('location') || message.includes('address') || message.includes('office') || message.includes('where')) {
        return "Our main office is located in Kumasi, Ghana. We also work with clients remotely across the globe.";
    }

    // Results and timeline questions
    else if (message.includes('results') || message.includes('timeline') || message.includes('how long') || message.includes('when') || message.includes('expect')) {
        return "Results vary depending on the services and your specific goals. Generally, SEO improvements begin to show in 3-6 months, while PPC and social media campaigns can generate results more quickly. During our initial consultation, we'll provide a more specific timeline based on your objectives.";
    }

    // Consultation requests or getting started
    else if (message.includes('consultation') || message.includes('consult') || message.includes('meeting') || message.includes('appointment') || message.includes('schedule') || message.includes('book') || message.includes('how do we get started') || message.includes('how to get started')) {
        // Start the appointment flow instead of just returning a message
        startAppointmentFlow();
        return "I'd be happy to help you schedule a consultation. Let's set that up now.";
    }

    // Gratitude
    else if (message.includes('thank') || message.includes('appreciate') || message.includes('helpful')) {
        return "You're welcome! We're glad to help. Is there anything else you'd like to know about our services or how we can help your business grow online?";
    }

    // Farewell
    else if (message.includes('bye') || message.includes('goodbye') || message.includes('see you') || message.includes('talk later') ||
             message.includes('that\'s all') || message.includes('no thanks') || message.includes('no, thank')) {
        return "Thank you for chatting with us! If you have any more questions, feel free to reach out anytime. Have a great day!";
    }

    // FAQ questions
    else if (message.includes('different') || message.includes('unique') || message.includes('stand out') || message.includes('why choose')) {
        return "What makes MS Digital Marketing Agency different is our data-driven approach, personalized strategies, and focus on measurable results. Unlike many agencies, we don't offer one-size-fits-all solutions. We create custom strategies based on your specific business goals and target audience. Our team consists of specialists in each digital marketing discipline, ensuring expert execution across all channels. We also provide transparent reporting and maintain clear communication throughout our partnership.";
    }
    else if (message.includes('experience') || message.includes('how long have you')) {
        return "MS Digital Marketing Agency has been helping businesses grow their online presence for over 5 years. Our team has a combined experience of 20+ years in digital marketing across various industries.";
    }
    else if (message.includes('industry') || message.includes('specialize') || message.includes('niche')) {
        return "While we work with businesses across many industries, we have particular expertise in e-commerce, SaaS, healthcare, education, and professional services. Our diverse experience allows us to apply best practices from different sectors to your specific needs.";
    }
    else if (message.includes('case stud') || message.includes('success stor') || message.includes('portfolio') || message.includes('example')) {
        return "We have several detailed case studies showcasing our work and results. Here are a few highlights:<br><br>• <b>Website Redesign:</b> We helped TechPro Industries transform their outdated website, resulting in a 200% increase in engagement and 150% boost in traffic.<br><br>• <b>PPC Campaign:</b> Our data-driven approach delivered a 300% ROI for FashionHub while reducing their cost per acquisition by 58%.<br><br>• <b>Social Media Strategy:</b> We increased Glow Beauty's follower count by 500% and engagement by 350%.<br><br>You can view our full case studies at <a href='pages/portfolio.html' target='_blank'>our portfolio page</a>.";
    }
    else if (message.includes('report') || message.includes('measure') || message.includes('analytics') || message.includes('track')) {
        return "We provide comprehensive monthly reports detailing all key performance metrics relevant to your campaigns. We track conversions, traffic, engagement, rankings, and ROI. Our team also offers regular strategy calls to review results and adjust tactics as needed.";
    }
    else if (message.includes('contract') || message.includes('commitment') || message.includes('lock')) {
        return "We typically work on 6-month contracts to allow enough time to implement strategies and see meaningful results. However, we also offer month-to-month options for certain services. We're confident in our work and don't believe in locking clients into long-term contracts if they're not seeing results.";
    }

    // Getting started
    else if (message.includes('get started') || message.includes('start') || message.includes('begin') || message.includes('first step')) {
        return "Getting started with us is easy! Here's our simple process:\n\n1. Schedule a free consultation call where we'll discuss your goals\n2. We'll create a customized digital marketing strategy for your business\n3. Once approved, we'll implement the strategy and provide regular updates\n4. You'll receive detailed monthly reports showing your ROI\n\nWould you like to schedule your free consultation now?";
    }
    // Default response for unrecognized queries
    else {
        return "I'm not sure I understand that specific question. Could you please rephrase or ask about our services, pricing, results, or how we can help your business? Alternatively, you can email us at msdigitalmarketingagency90@gmail.com for more detailed information.";
    }
}
