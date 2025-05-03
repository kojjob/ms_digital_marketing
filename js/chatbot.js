// MS Digital Marketing Chatbot

const chatbotData = {
    // Knowledge base for the chatbot
    knowledgeBase: {
        // Services information
        services: [
            { name: "SEO Optimization", description: "Improve your search engine rankings and drive organic traffic to your website." },
            { name: "Content Marketing", description: "Create valuable content that attracts and engages your target audience." },
            { name: "Social Media Management", description: "Build authentic connections with your audience across all major social media platforms." },
            { name: "PPC Advertising", description: "Targeted ad campaigns that deliver immediate results and measurable ROI." },
            { name: "Email Marketing", description: "Nurture leads and build customer loyalty with personalized email campaigns." },
            { name: "Web Design & Development", description: "Create stunning, responsive websites optimized for conversion and user experience." }
        ],
        
        // FAQ data
        faqs: [
            {
                question: "What digital marketing services do you offer?",
                answer: "We offer a comprehensive range of digital marketing services including SEO optimization, content marketing, social media management, PPC advertising, email marketing, and web design & development."
            },
            {
                question: "How much do your services cost?",
                answer: "Our pricing varies based on your specific needs and goals. We create custom packages tailored to your business requirements. Please contact us for a free consultation to discuss pricing options."
            },
            {
                question: "How long before I see results?",
                answer: "Results timeline varies by service. PPC campaigns can show immediate results, while SEO typically takes 3-6 months to see significant improvements. During your consultation, we'll provide realistic timeframes based on your specific goals."
            },
            {
                question: "Do you work with small businesses?",
                answer: "Yes, we work with businesses of all sizes. We have tailored packages specifically designed for small businesses and startups to help you maximize your marketing budget."
            },
            {
                question: "How do I get started?",
                answer: "The first step is to schedule a free consultation where we'll discuss your goals and how we can help. You can book this through our contact page or by clicking the chat button."
            }
        ],
        
        // Contact information
        contact: {
            email: "contact@msdigitalmarketing.com",
            phone: "+1 (XXX) XXX-XXXX",
            address: "Times Square, New York",
            hours: "Monday-Friday: 9am-5pm EST"
        }
    },
    
    // Responses for different queries
    responses: {
        greeting: "Hi there! 👋 I'm MS Assistant. How can I help you today with your digital marketing needs?",
        goodbye: "Thank you for chatting with us! If you have any more questions, feel free to reach out anytime.",
        fallback: "I'm not sure I understand that question. Could you please rephrase or ask about our services, pricing, or how we can help your business?",
        contact: "You can reach our team at contact@msdigitalmarketing.com or call us at +1 (XXX) XXX-XXXX. Our office hours are Monday-Friday, 9am-5pm EST.",
        consultation: "We'd be happy to set up a free consultation! Please provide your name, email, and a brief description of your needs, and our team will contact you within 24 hours.",
        thanks: "You're welcome! Is there anything else I can help you with today?"
    },
    
    // Common triggers and their corresponding response types
    triggers: {
        greeting: ["hello", "hi", "hey", "howdy", "greetings"],
        services: ["services", "offer", "provide", "help with"],
        pricing: ["pricing", "cost", "price", "how much", "rates", "packages"],
        seo: ["seo", "search engine", "ranking", "google"],
        social: ["social media", "facebook", "instagram", "twitter", "linkedin", "tiktok"],
        content: ["content", "blog", "article", "writing"],
        ppc: ["ppc", "pay per click", "google ads", "advertising", "ads"],
        email: ["email", "newsletter", "campaign"],
        web: ["website", "web design", "development", "landing page"],
        contact: ["contact", "reach", "call", "email", "phone", "talk to human"],
        consultation: ["consultation", "consult", "meeting", "appointment", "schedule", "book"],
        results: ["results", "timeline", "how long", "when", "expect"],
        thanks: ["thanks", "thank you", "appreciate", "helpful"],
        goodbye: ["bye", "goodbye", "see you", "talk later"]
    }
};

class Chatbot {
    constructor() {
        this.data = chatbotData;
        this.conversationHistory = [];
        this.waitingForEmail = false;
        this.consultationRequest = null;
        
        // Initialize DOM elements after the page is loaded
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeElements();
            this.addEventListeners();
            this.loadChatHistory();
        });
    }
    
    // IMPROVEMENT 1: Persistent Chat History
    saveChatHistory() {
        localStorage.setItem('ms-chat-history', JSON.stringify(this.conversationHistory));
    }

    loadChatHistory() {
        const savedHistory = localStorage.getItem('ms-chat-history');
        if (savedHistory) {
            this.conversationHistory = JSON.parse(savedHistory);
            
            // Replay conversation history in the chat
            this.conversationHistory.forEach(msg => {
                if (msg.role === 'user') {
                    this.showUserMessage(msg.content, false);
                } else if (msg.role === 'assistant') {
                    this.showBotMessage(msg.content, false);
                }
            });
            
            // If there's history, suggest continuing the conversation
            if (this.conversationHistory.length > 0) {
                setTimeout(() => {
                    this.showOptions([
                        "I have a new question",
                        "Continue our conversation",
                        "Clear history"
                    ]);
                }, 300);
            }
        }
    }
    
    clearChatHistory() {
        localStorage.removeItem('ms-chat-history');
        this.conversationHistory = [];
        this.chatMessages.innerHTML = '';
        this.showBotMessage("Chat history cleared. How can I help you today?");
        this.showOptions([
            "What services do you offer?",
            "How much do your services cost?",
            "How do I get started?"
        ]);
    }
    
    initializeElements() {
        // Create chatbot elements if they don't exist
        if (!document.getElementById('ms-chatbot-container')) {
            this.createChatbotHTML();
        }
        
        // Get DOM elements
        this.chatbotIcon = document.getElementById('ms-chatbot-icon');
        this.chatbotContainer = document.getElementById('ms-chatbot-container');
        this.chatMessages = document.getElementById('ms-chat-messages');
        this.chatInput = document.getElementById('ms-chat-input');
        this.sendButton = document.getElementById('ms-chat-send');
        this.closeButton = document.getElementById('ms-chat-close');
    }
    
    createChatbotHTML() {
        // Create chatbot icon with notification bubble
        const chatbotIcon = document.createElement('div');
        chatbotIcon.id = 'ms-chatbot-icon';
        chatbotIcon.innerHTML = `
            <div class="relative">
                <div class="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full pulse-animation"></div>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
            </div>
        `;
        
        // Create chatbot container
        const chatbotContainer = document.createElement('div');
        chatbotContainer.id = 'ms-chatbot-container';
        chatbotContainer.className = 'hidden';
        chatbotContainer.innerHTML = `
            <div class="bg-primary-600 text-white p-4 rounded-t-lg flex justify-between items-center">
                <div class="flex items-center">
                    <div class="w-8 h-8 bg-white rounded-full flex items-center justify-center text-primary-600 font-bold mr-3">
                        MS
                    </div>
                    <div>
                        <h3 class="font-bold">MS Assistant</h3>
                        <p class="text-xs text-white/80">Online | Typically replies in a few minutes</p>
                    </div>
                </div>
                <button id="ms-chat-close" class="text-white hover:text-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
            <div id="ms-chat-messages" class="bg-white dark:bg-gray-800 p-4 h-80 overflow-y-auto flex flex-col space-y-4"></div>
            <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-b-lg">
                <div class="flex">
                    <input type="text" id="ms-chat-input" class="flex-grow px-4 py-2 rounded-l-lg border-0 focus:ring-2 focus:ring-primary-500 dark:bg-gray-600 dark:text-white" placeholder="Type your message...">
                    <button id="ms-chat-send" class="bg-primary-600 text-white px-4 py-2 rounded-r-lg hover:bg-primary-700 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                    This is an AI assistant to help with basic questions. For complex inquiries, please contact our team directly.
                </div>
            </div>
        `;
        
        // Add styles for the chatbot
        const chatbotStyles = document.createElement('style');
        chatbotStyles.textContent = `
            /* Basic chatbot styling */
            #ms-chatbot-icon {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 60px;
                height: 60px;
                background-color: #0ea5e9;
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                z-index: 999;
                transition: transform 0.3s;
            }
            
            #ms-chatbot-icon:hover {
                transform: scale(1.1);
            }
            
            #ms-chatbot-container {
                position: fixed;
                bottom: 90px;
                right: 20px;
                width: 350px;
                border-radius: 0.5rem;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                z-index: 999;
                overflow: hidden;
                transition: all 0.3s;
            }
            
            .bot-message {
                background-color: #f3f4f6;
                align-self: flex-start;
                border-radius: 1rem 1rem 1rem 0;
                max-width: 75%;
                padding: 0.75rem 1rem;
                margin-bottom: 0.75rem;
            }
            
            .user-message {
                background-color: #0ea5e9;
                color: white;
                align-self: flex-end;
                border-radius: 1rem 1rem 0 1rem;
                max-width: 75%;
                padding: 0.75rem 1rem;
                margin-bottom: 0.75rem;
            }
            
            .dark .bot-message {
                background-color: #374151;
                color: #e5e7eb;
            }
            
            /* IMPROVEMENT 2: Typing indicator */
            .typing-indicator {
                background-color: #f3f4f6;
                align-self: flex-start;
                border-radius: 1rem 1rem 1rem 0;
                padding: 1rem;
                display: flex;
                align-items: center;
            }
            
            .typing-indicator .dot {
                display: inline-block;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background-color: #6b7280;
                animation: typing-animation 1.4s infinite ease-in-out both;
                margin: 0 2px;
            }
            
            .typing-indicator .dot:nth-child(1) {
                animation-delay: 0s;
            }
            
            .typing-indicator .dot:nth-child(2) {
                animation-delay: 0.2s;
            }
            
            .typing-indicator .dot:nth-child(3) {
                animation-delay: 0.4s;
            }
            
            @keyframes typing-animation {
                0%, 100% {
                    transform: scale(0.7);
                    opacity: 0.5;
                }
                50% {
                    transform: scale(1);
                    opacity: 1;
                }
            }
            
            /* Chat options styling */
            .chat-options {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
                margin-top: 0.5rem;
            }
            
            .chat-option-button {
                background-color: #e5e7eb;
                color: #374151;
                border-radius: 1rem;
                padding: 0.5rem 1rem;
                font-size: 0.875rem;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .chat-option-button:hover {
                background-color: #d1d5db;
            }
            
            .dark .chat-option-button {
                background-color: #4b5563;
                color: #e5e7eb;
            }
            
            .dark .chat-option-button:hover {
                background-color: #6b7280;
            }
            
            /* Pulse animation for notification */
            .pulse-animation {
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0% {
                    transform: scale(0.95);
                    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
                }
                70% {
                    transform: scale(1);
                    box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
                }
                100% {
                    transform: scale(0.95);
                    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
                }
            }
            
            /* IMPROVEMENT 5: Rich Media Cards */
            .chat-rich-card {
                background-color: white;
                border-radius: 0.5rem;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                padding: 0.75rem;
                margin-top: 0.5rem;
                display: flex;
                flex-direction: column;
            }
            
            .chat-rich-card img {
                width: 100%;
                height: auto;
                border-radius: 0.25rem;
                margin-bottom: 0.5rem;
            }
            
            .chat-rich-card h4 {
                font-weight: 600;
                margin-bottom: 0.25rem;
                color: #111827;
            }
            
            .dark .chat-rich-card h4 {
                color: #f3f4f6;
            }
            
            .chat-rich-card p {
                font-size: 0.875rem;
                color: #6b7280;
                margin-bottom: 0.5rem;
            }
            
            .chat-card-link {
                color: #0ea5e9;
                font-weight: 500;
                font-size: 0.875rem;
                text-decoration: none;
                display: inline-block;
                margin-top: 0.25rem;
            }
            
            .chat-card-link:hover {
                text-decoration: underline;
            }
            
            /* IMPROVEMENT 3: Mobile Optimization */
            @media (max-width: 640px) {
                #ms-chatbot-container {
                    width: 100%;
                    height: 100%;
                    bottom: 0;
                    right: 0;
                    border-radius: 0;
                    position: fixed;
                    z-index: 1000;
                }
                
                #ms-chat-messages {
                    height: calc(100vh - 140px);
                }
                
                #ms-chatbot-icon {
                    bottom: 15px;
                    right: 15px;
                }
            }
        `;
        
        // Append elements to the document
        document.head.appendChild(chatbotStyles);
        document.body.appendChild(chatbotIcon);
        document.body.appendChild(chatbotContainer);
    }
    
    addEventListeners() {
        // Toggle chatbot visibility
        this.chatbotIcon.addEventListener('click', () => {
            this.toggleChatbot();
        });
        
        // Close chatbot
        this.closeButton.addEventListener('click', () => {
            this.chatbotContainer.classList.add('hidden');
        });
        
        // Send message on button click
        this.sendButton.addEventListener('click', () => {
            this.handleUserInput();
        });
        
        // Send message on Enter key
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleUserInput();
            }
        });
        
        // Handle option button clicks
        this.chatMessages.addEventListener('click', (e) => {
            if (e.target.classList.contains('chat-option-button')) {
                const optionText = e.target.textContent.trim();
                
                // Handle special options
                if (optionText === 'Clear history') {
                    this.clearChatHistory();
                    return;
                }
                
                this.handleUserMessage(optionText);
            }
        });
        
        // Focus input when chatbot opens
        this.chatbotContainer.addEventListener('transitionend', () => {
            if (!this.chatbotContainer.classList.contains('hidden')) {
                this.chatInput.focus();
            }
        });
    }
    
    // IMPROVEMENT 6: Office Hours Awareness
    isWithinOfficeHours() {
        const now = new Date();
        const day = now.getDay(); // 0 = Sunday, 6 = Saturday
        const hour = now.getHours();
        
        // Check if it's a weekday (Monday-Friday) and between 9am-5pm
        return day >= 1 && day <= 5 && hour >= 9 && hour < 17;
    }
    
    toggleChatbot() {
        const isHidden = this.chatbotContainer.classList.contains('hidden');
        
        if (isHidden) {
            this.chatbotContainer.classList.remove('hidden');
            // If it's the first time opening, show greeting
            if (this.conversationHistory.length === 0) {
                this.showBotMessage(this.data.responses.greeting);
                
                // Add suggested options
                this.showOptions([
                    "What services do you offer?",
                    "How much do your services cost?",
                    "How do I get started?"
                ]);
            }
        } else {
            this.chatbotContainer.classList.add('hidden');
        }
    }
    
    // IMPROVEMENT 4: User Feedback Collection
    addFeedbackRequest() {
        setTimeout(() => {
            if (this.conversationHistory.length > 6) {
                this.showBotMessage("Was this conversation helpful?");
                
                const feedbackContainer = document.createElement('div');
                feedbackContainer.className = 'chat-options bot-message';
                
                const yesButton = document.createElement('button');
                yesButton.className = 'chat-option-button';
                yesButton.innerHTML = '👍 Yes';
                yesButton.onclick = () => this.recordFeedback('positive');
                
                const noButton = document.createElement('button');
                noButton.className = 'chat-option-button';
                noButton.innerHTML = '👎 No';
                noButton.onclick = () => this.recordFeedback('negative');
                
                feedbackContainer.appendChild(yesButton);
                feedbackContainer.appendChild(noButton);
                this.chatMessages.appendChild(feedbackContainer);
                this.scrollToBottom();
            }
        }, 1000);
    }

    recordFeedback(type) {
        // Could send to analytics or server in a real implementation
        console.log(`User provided ${type} feedback`);
        
        if (type === 'positive') {
            this.showBotMessage("Thanks for your feedback! We're glad we could help.");
        } else {
            this.showBotMessage("Thanks for your feedback. We'll work on improving our responses. Would you like to be connected to our team?");
            this.showOptions(["Yes, please connect me", "No thanks"]);
        }
    }
    
    handleUserInput() {
        const userInput = this.chatInput.value.trim();
        
        if (userInput === '') return;
        
        // Process the input
        this.handleUserMessage(userInput);
        
        // Clear the input field
        this.chatInput.value = '';
    }
    
    handleUserMessage(message) {
        // Display user message
        this.showUserMessage(message);
        
        // Add to conversation history
        this.conversationHistory.push({ role: 'user', content: message });
        this.saveChatHistory();
        
        // Handle special case for email collection
        if (this.waitingForEmail) {
            this.handleConsultationRequest(message);
            return;
        }
        
        // Handle special case for feedback responses
        if (message.includes("Yes, please connect me")) {
            this.showBotMessage("I'll have someone from our team contact you soon. Please provide your email address so we can reach you.");
            this.waitingForEmail = true;
            this.consultationRequest = { initiated: true, urgent: true };
            return;
        }
        
        // Handle clear history request
        if (message.toLowerCase().includes("clear history")) {
            this.clearChatHistory();
            return;
        }
        
        // Generate and display bot response
        setTimeout(() => {
            const response = this.generateResponse(message);
            
            // Handle special actions
            if (response.specialAction === 'clearHistory') {
                this.clearChatHistory();
                return;
            }
            
            // Show the response with appropriate method based on content type
            if (response.richMedia) {
                this.showRichBotMessage(response.message);
            } else {
                this.showBotMessage(response.message);
                
                // Add to conversation history
                this.conversationHistory.push({ role: 'assistant', content: response.message });
                this.saveChatHistory();
            }
            
            // Show options if available
            if (response.options) {
                setTimeout(() => {
                    this.showOptions(response.options);
                }, 500);
            }
        }, 500);
    }
    
    generateResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // IMPROVEMENT 6: Human/Urgent support request with office hours check
        if (this.findTrigger(lowerMessage, ["urgent", "emergency", "speak", "human", "agent", "representative", "talk to someone"])) {
            const officeHoursMsg = this.isWithinOfficeHours() ?
                "Our team is currently available during office hours. You can call us directly at " + this.data.knowledgeBase.contact.phone + " for immediate assistance." :
                "Our office is currently closed. Our hours are Monday-Friday, 9am-5pm EST. Please leave your message and we'll respond as soon as possible.";
                
            return {
                message: officeHoursMsg,
                options: ["Leave a message", "Schedule a callback"]
            };
        }
        
        // Check for consultation request
        if (this.findTrigger(lowerMessage, this.data.triggers.consultation)) {
            this.waitingForEmail = true;
            this.consultationRequest = { initiated: true };
            return {
                message: "Great! I'd be happy to arrange a free consultation. Could you please provide your email address so our team can contact you?",
                options: null
            };
        }
        
        // Check for "clear history" request
        if (lowerMessage.includes("clear history") || lowerMessage.includes("start over") || lowerMessage.includes("reset")) {
            return {
                specialAction: 'clearHistory',
                message: "I've cleared our conversation history. How can I help you today?",
                options: ["What services do you offer?", "How much do your services cost?", "How do I get started?"]
            };
        }
        
        // Check for greeting
        if (this.findTrigger(lowerMessage, this.data.triggers.greeting)) {
            return {
                message: this.data.responses.greeting,
                options: ["What services do you offer?", "How much do your services cost?", "How do I get started?"]
            };
        }
        
        // Check for goodbye
        if (this.findTrigger(lowerMessage, this.data.triggers.goodbye)) {
            // IMPROVEMENT 4: Add feedback collection on conversation end
            setTimeout(() => this.addFeedbackRequest(), 2000);
            
            return {
                message: this.data.responses.goodbye,
                options: null
            };
        }
        
        // Check for thanks
        if (this.findTrigger(lowerMessage, this.data.triggers.thanks)) {
            return {
                message: this.data.responses.thanks,
                options: ["Tell me more about your services", "I'd like a consultation", "Contact information"]
            };
        }
        
        // Check for contact information request
        if (this.findTrigger(lowerMessage, this.data.triggers.contact)) {
            return {
                message: this.data.responses.contact,
                options: ["I'd like a consultation", "Tell me about your services"]
            };
        }
        
        // Check for services question
        if (this.findTrigger(lowerMessage, this.data.triggers.services)) {
            const servicesMsg = "We offer the following digital marketing services: " + 
                               this.data.knowledgeBase.services.map(s => s.name).join(", ") + ". " +
                               "Which service would you like to learn more about?";
            return {
                message: servicesMsg,
                options: this.data.knowledgeBase.services.map(s => s.name)
            };
        }
        
        // Check for pricing question
        if (this.findTrigger(lowerMessage, this.data.triggers.pricing)) {
            const pricingFAQ = this.data.knowledgeBase.faqs.find(faq => faq.question.toLowerCase().includes("cost"));
            return {
                message: pricingFAQ.answer,
                options: ["I'd like a consultation", "What services do you offer?"]
            };
        }
        
        // Check for results timeline question
        if (this.findTrigger(lowerMessage, this.data.triggers.results)) {
            const resultsFAQ = this.data.knowledgeBase.faqs.find(faq => faq.question.toLowerCase().includes("results"));
            return {
                message: resultsFAQ.answer,
                options: ["Tell me about specific services", "I'd like a consultation"]
            };
        }
        
        // Check for specific services
        // SEO
        if (this.findTrigger(lowerMessage, this.data.triggers.seo) || lowerMessage.includes("seo optimization")) {
            const seoService = this.data.knowledgeBase.services.find(s => s.name.toLowerCase().includes("seo"));
            
            // IMPROVEMENT 5: Use rich media response
            return {
                richMedia: true,
                message: `
                    <p><strong>${seoService.name}:</strong> ${seoService.description}</p>
                    <div class="chat-rich-card">
                        <img src="../images/services/seo-service.svg" alt="SEO Service" onerror="this.src='../images/blog/blog1.svg';">
                        <h4>Our SEO Services Include:</h4>
                        <ul style="margin-left: 20px; list-style-type: disc;">
                            <li>Keyword research and strategy</li>
                            <li>On-page optimization</li>
                            <li>Technical SEO improvements</li>
                            <li>Content optimization</li>
                            <li>Link building</li>
                        </ul>
                        <a href="../pages/services.html" class="chat-card-link">Learn more</a>
                    </div>
                `,
                options: ["Other services", "Pricing", "Schedule a consultation"]
            };
        }
        
        // Social Media
        if (this.findTrigger(lowerMessage, this.data.triggers.social) || lowerMessage.includes("social media management")) {
            const socialService = this.data.knowledgeBase.services.find(s => s.name.toLowerCase().includes("social media"));
            
            // IMPROVEMENT 5: Use rich media response
            return {
                richMedia: true,
                message: `
                    <p><strong>${socialService.name}:</strong> ${socialService.description}</p>
                    <div class="chat-rich-card">
                        <img src="../images/services/social-media-service.svg" alt="Social Media Service" onerror="this.src='../images/blog/blog3.svg';">
                        <h4>Platforms We Manage:</h4>
                        <p>Facebook, Instagram, Twitter, LinkedIn, TikTok, and Pinterest</p>
                        <a href="../pages/services.html" class="chat-card-link">See our social media work</a>
                    </div>
                `,
                options: ["Other services", "Pricing", "Schedule a consultation"]
            };
        }
        
        // Content Marketing
        if (this.findTrigger(lowerMessage, this.data.triggers.content) || lowerMessage.includes("content marketing")) {
            const contentService = this.data.knowledgeBase.services.find(s => s.name.toLowerCase().includes("content"));
            return {
                message: `${contentService.name}: ${contentService.description} Our team creates compelling blog posts, articles, infographics, videos, and other content formats to drive traffic and establish your authority.`,
                options: ["Other services", "Pricing", "Schedule a consultation"]
            };
        }
        
        // PPC
        if (this.findTrigger(lowerMessage, this.data.triggers.ppc) || lowerMessage.includes("ppc advertising")) {
            const ppcService = this.data.knowledgeBase.services.find(s => s.name.toLowerCase().includes("ppc"));
            return {
                message: `${ppcService.name}: ${ppcService.description} We manage campaigns across Google Ads, Facebook Ads, Instagram Ads, and LinkedIn Ads with continuous optimization for maximum ROI.`,
                options: ["Other services", "Pricing", "Schedule a consultation"]
            };
        }
        
        // Email Marketing
        if (this.findTrigger(lowerMessage, this.data.triggers.email) || lowerMessage.includes("email marketing")) {
            const emailService = this.data.knowledgeBase.services.find(s => s.name.toLowerCase().includes("email"));
            return {
                message: `${emailService.name}: ${emailService.description} We design engaging email templates, create automation workflows, segment your audience, and provide detailed performance analytics.`,
                options: ["Other services", "Pricing", "Schedule a consultation"]
            };
        }
        
        // Web Design
        if (this.findTrigger(lowerMessage, this.data.triggers.web) || lowerMessage.includes("web design")) {
            const webService = this.data.knowledgeBase.services.find(s => s.name.toLowerCase().includes("web"));
            return {
                message: `${webService.name}: ${webService.description} Our team creates mobile-responsive, SEO-friendly websites with a focus on user experience and conversion optimization.`,
                options: ["Other services", "Pricing", "Schedule a consultation"]
            };
        }
        
        // Check for any FAQ matches
        for (const faq of this.data.knowledgeBase.faqs) {
            if (lowerMessage.includes(faq.question.toLowerCase())) {
                return {
                    message: faq.answer,
                    options: ["Tell me more about your services", "I'd like a consultation"]
                };
            }
        }
        
        // Fallback response
        return {
            message: this.data.responses.fallback,
            options: ["What services do you offer?", "Pricing information", "Contact information"]
        };
    }
    
    handleConsultationRequest(message) {
        // Check if the input looks like an email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (emailRegex.test(message)) {
            // Valid email format
            this.consultationRequest.email = message;
            this.waitingForEmail = false;
            
            setTimeout(() => {
                this.showBotMessage("Thank you! Your consultation request has been received. Our team will contact you at " + message + " within 24 hours. Is there anything specific you'd like to discuss during the consultation?");
                
                this.showOptions([
                    "SEO needs",
                    "Social media strategy",
                    "Website redesign",
                    "General digital marketing"
                ]);
            }, 500);
        } else {
            // Invalid email format
            setTimeout(() => {
                this.showBotMessage("That doesn't appear to be a valid email address. Could you please provide a valid email so we can contact you?");
            }, 500);
        }
    }
    
    findTrigger(message, triggerList) {
        return triggerList.some(trigger => message.includes(trigger));
    }
    
    // IMPROVEMENT 2: Typing Indicator methods
    showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'typing-indicator';
        indicator.className = 'typing-indicator';
        indicator.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
        this.chatMessages.appendChild(indicator);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }
    
    showUserMessage(message, save = true) {
        const messageElement = document.createElement('div');
        messageElement.className = 'user-message';
        messageElement.textContent = message;
        this.chatMessages.appendChild(messageElement);
        this.scrollToBottom();
        
        // Save to history if needed
        if (save) {
            this.saveChatHistory();
        }
    }
    
    showBotMessage(message, showTyping = true) {
        if (showTyping) {
            this.showTypingIndicator();
            
            setTimeout(() => {
                this.hideTypingIndicator();
                const messageElement = document.createElement('div');
                messageElement.className = 'bot-message';
                messageElement.textContent = message;
                this.chatMessages.appendChild(messageElement);
                this.scrollToBottom();
                
                // Save to history
                this.conversationHistory.push({ role: 'assistant', content: message });
                this.saveChatHistory();
            }, 1000);
        } else {
            const messageElement = document.createElement('div');
            messageElement.className = 'bot-message';
            messageElement.textContent = message;
            this.chatMessages.appendChild(messageElement);
            this.scrollToBottom();
        }
    }
    
    // IMPROVEMENT 5: Rich Media Responses
    showRichBotMessage(messageHTML, showTyping = true) {
        if (showTyping) {
            this.showTypingIndicator();
            
            setTimeout(() => {
                this.hideTypingIndicator();
                const messageElement = document.createElement('div');
                messageElement.className = 'bot-message';
                messageElement.innerHTML = messageHTML;
                this.chatMessages.appendChild(messageElement);
                this.scrollToBottom();
                
                // Save a text version to history for simplicity
                this.conversationHistory.push({ 
                    role: 'assistant', 
                    content: messageElement.textContent || 'Sent rich media content'
                });
                this.saveChatHistory();
            }, 1200);
        } else {
            const messageElement = document.createElement('div');
            messageElement.className = 'bot-message';
            messageElement.innerHTML = messageHTML;
            this.chatMessages.appendChild(messageElement);
            this.scrollToBottom();
        }
    }
    
    showOptions(options) {
        if (!options || options.length === 0) return;
        
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'chat-options bot-message';
        
        options.forEach(option => {
            const optionButton = document.createElement('button');
            optionButton.className = 'chat-option-button';
            optionButton.textContent = option;
            optionsContainer.appendChild(optionButton);
        });
        
        this.chatMessages.appendChild(optionsContainer);
        this.scrollToBottom();
    }
    
    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
}

// Initialize the chatbot
const msChatbot = new Chatbot();