document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const chatMessages = document.getElementById('chat-messages');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const addEmojiBtn = document.getElementById('addEmojiBtn');
    const readAloudButton = document.getElementById('read-aloud');
    const fontSizeBtn = document.getElementById('fontSizeBtn');
    const historyBtn = document.getElementById('historyBtn');
    const eventList = document.getElementById('event-list');
    const eventCount = document.getElementById('event-count');
    const addEventBtn = document.getElementById('addEventBtn');
    const eventModal = document.getElementById('eventModal');
    const eventForm = document.getElementById('eventForm');
    const dailyQuote = document.getElementById('dailyQuote');
    const notificationSound = document.getElementById('notification-sound');
    const micButton = document.getElementById('micButton');

    // State
    let currentFontSize = 1;
    let isReading = false;
    let speechSynthesis = window.speechSynthesis;
    let socket;
    let recognition = null;
    let isRecording = false;

    // Sample events data
    const sampleEvents = [
        {
            id: 1,
            title: "Weekly Coffee Meetup",
            date: "2024-03-15",
            time: "10:00",
            location: "Community Center",
            description: "Join us for coffee and conversation",
            rsvps: []
        },
        {
            id: 2,
            title: "Yoga Class",
            date: "2024-03-16",
            time: "09:00",
            location: "Park Pavilion",
            description: "Gentle yoga for seniors",
            rsvps: []
        }
    ];

    // Initialize WebSocket connection
    function initializeSocket() {
        // Generate a unique user ID or get from localStorage
        let userId = localStorage.getItem('userId');
        if (!userId) {
            userId = Math.random().toString(36).substring(2, 15);
            localStorage.setItem('userId', userId);
        }

        // Get or generate session ID
        let sessionId = localStorage.getItem('sessionId');
        if (!sessionId) {
            sessionId = Math.random().toString(36).substring(2, 15);
            localStorage.setItem('sessionId', sessionId);
        }

        // Connect to socket with user ID and session ID
        socket = io({
            query: {
                user_id: userId,
                session_id: sessionId
            },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            timeout: 20000
        });

        socket.on('connect', () => {
            console.log('Connected to server with session:', sessionId);
            console.log('User ID:', userId);
            socket.emit('get_messages');
            socket.emit('get_events');
        });

        socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
        });

        socket.on('reconnect', (attemptNumber) => {
            console.log('Reconnected after', attemptNumber, 'attempts');
        });

        socket.on('reconnect_error', (error) => {
            console.error('Reconnection error:', error);
        });

        socket.on('reconnect_failed', () => {
            console.error('Failed to reconnect');
        });

        socket.on('user_connected', (data) => {
            const user = data.user;
            console.log('User connected:', user.name);
            appendMessage({
                sender: 'System',
                content: `${user.name} has joined the chat`,
                timestamp: new Date().toLocaleTimeString()
            });
        });

        socket.on('user_disconnected', (data) => {
            const user = data.user;
            console.log('User disconnected:', user.name);
            appendMessage({
                sender: 'System',
                content: `${user.name} has left the chat`,
                timestamp: new Date().toLocaleTimeString()
            });
        });

        socket.on('message_history', (messages) => {
            // Clear existing messages first
            clearChatMessages();
            
            if (messages && messages.length > 0) {
                // Add each message
                messages.forEach(message => {
                    const messageElement = document.createElement('div');
                    messageElement.className = 'message';
                    messageElement.innerHTML = `
                        <div class="message-header">
                            <span class="sender">${message.sender}</span>
                            <span class="timestamp">${message.timestamp}</span>
                        </div>
                        <div class="message-content">${message.content}</div>
                    `;
                    chatMessages.appendChild(messageElement);
                });
            } else {
                appendMessage({
                    sender: 'System',
                    content: 'No messages available.',
                    timestamp: new Date().toLocaleTimeString()
                });
            }
            
            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });

        socket.on('new_message', (message) => {
            // Create and append new message
            const messageElement = document.createElement('div');
            messageElement.className = 'message';
            messageElement.innerHTML = `
                <div class="message-header">
                    <span class="sender">${message.sender}</span>
                    <span class="timestamp">${message.timestamp}</span>
                </div>
                <div class="message-content">${message.content}</div>
            `;
            chatMessages.appendChild(messageElement);
            
            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Play notification sound if available
            if (notificationSound) {
                notificationSound.play();
            }
            
            // Read message if read aloud is active
            if (isReading) {
                readMessage(message.content);
            }
        });

        socket.on('new_event', (event) => {
            appendEvent(event);
            updateEventCount();
        });

        socket.on('event_updated', (event) => {
            updateEvent(event);
            updateEventCount();
        });

        socket.on('event_history', (events) => {
            eventList.innerHTML = '';
            events.forEach(appendEvent);
            updateEventCount();
        });

        socket.on('error', (data) => {
            console.error('Socket error:', data.message);
            appendMessage({
                sender: 'System',
                content: `Error: ${data.message}`,
                timestamp: new Date().toLocaleTimeString()
            });
        });
    }

    // Initialize voice recognition
    function initializeVoiceRecognition() {
        if ('webkitSpeechRecognition' in window) {
            recognition = new webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                isRecording = true;
                micButton.classList.add('recording');
                micButton.innerHTML = '<i class="fas fa-microphone"></i> Recording...';
                messageInput.placeholder = 'Listening...';
            };

            recognition.onend = () => {
                isRecording = false;
                micButton.classList.remove('recording');
                micButton.innerHTML = '<i class="fas fa-microphone"></i>';
                messageInput.placeholder = 'Type your message here...';
            };

            recognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0])
                    .map(result => result.transcript)
                    .join('');
                messageInput.value = transcript;
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                appendMessage({
                    sender: 'System',
                    content: `Voice recognition error: ${event.error}. Please try again.`,
                    timestamp: new Date().toLocaleTimeString()
                });
                isRecording = false;
                micButton.classList.remove('recording');
                micButton.innerHTML = '<i class="fas fa-microphone"></i>';
                messageInput.placeholder = 'Type your message here...';
            };
        } else {
            console.error('Speech recognition not supported');
            micButton.style.display = 'none';
            appendMessage({
                sender: 'System',
                content: 'Voice recognition is not supported in your browser. Please use a modern browser like Chrome or Edge.',
                timestamp: new Date().toLocaleTimeString()
            });
        }
    }

    // Toggle voice recognition
    function toggleVoiceRecognition() {
        if (!recognition) {
            initializeVoiceRecognition();
        }

        if (isRecording) {
            recognition.stop();
        } else {
            try {
                // Clear any existing text
                messageInput.value = '';
                recognition.start();
            } catch (error) {
                console.error('Error starting recognition:', error);
                appendMessage({
                    sender: 'System',
                    content: 'Error starting voice recognition. Please check your microphone permissions and try again.',
                    timestamp: new Date().toLocaleTimeString()
                });
            }
        }
    }

    // Initialize
    initializeSocket();
    loadDailyQuote();
    setupEventListeners();

    function setupEventListeners() {
        // Chat functionality
        sendButton.addEventListener('click', sendMessage);
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        // Voice recognition
        micButton.addEventListener('click', toggleVoiceRecognition);

        // Accessibility features
        readAloudButton.addEventListener('click', toggleReadAloud);
        fontSizeBtn.addEventListener('click', increaseFontSize);
        
        // History functionality
        historyBtn.addEventListener('click', toggleHistory);

        // Events
        addEventBtn.addEventListener('click', () => {
            eventModal.style.display = 'block';
        });

        eventForm.addEventListener('submit', handleEventSubmit);

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === eventModal) {
                eventModal.style.display = 'none';
            }
        });
    }

    function sendMessage() {
        const content = messageInput.value.trim();
        if (content) {
            socket.emit('send_message', { content });
            messageInput.value = '';
        }
    }

    function appendMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.innerHTML = `
            <div class="message-header">
                <span>${message.sender}</span>
                <span>${message.timestamp}</span>
            </div>
            <div class="message-content">${message.content}</div>
        `;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function toggleReadAloud() {
        isReading = !isReading;
        readAloudButton.innerHTML = isReading ? 
            '<i class="fas fa-volume-up"></i> Stop Reading' : 
            '<i class="fas fa-volume-up"></i> Read Aloud';
        readAloudButton.classList.toggle('active', isReading);
        
        if (isReading) {
            readMessages();
        } else {
            speechSynthesis.cancel();
        }
    }

    function readMessage(message) {
        if (!isReading) return;
        
        const utterance = new SpeechSynthesisUtterance(message);
        // Set voice properties
        utterance.rate = 0.8;  // Slower rate for better comprehension
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        // Try to get a female voice
        const voices = speechSynthesis.getVoices();
        const femaleVoice = voices.find(voice => 
            voice.name.includes('female') || 
            voice.name.includes('Female') ||
            voice.name.includes('Microsoft Zira') ||
            voice.name.includes('Google US English Female')
        );
        
        if (femaleVoice) {
            utterance.voice = femaleVoice;
        }
        
        speechSynthesis.speak(utterance);
    }

    function readMessages() {
        if (!isReading) return;
        
        const messages = Array.from(chatMessages.children);
        let currentIndex = 0;
        
        function readNextMessage() {
            if (currentIndex >= messages.length || !isReading) {
                isReading = false;
                readAloudButton.innerHTML = '<i class="fas fa-volume-up"></i> Read Aloud';
                readAloudButton.classList.remove('active');
                return;
            }
            
            const message = messages[currentIndex];
            const text = message.textContent;
            
            const utterance = new SpeechSynthesisUtterance(text);
            // Set voice properties
            utterance.rate = 0.8;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            
            // Try to get a female voice
            const voices = speechSynthesis.getVoices();
            const femaleVoice = voices.find(voice => 
                voice.name.includes('female') || 
                voice.name.includes('Female') ||
                voice.name.includes('Microsoft Zira') ||
                voice.name.includes('Google US English Female')
            );
            
            if (femaleVoice) {
                utterance.voice = femaleVoice;
            }
            
            utterance.onend = () => {
                currentIndex++;
                readNextMessage();
            };
            
            speechSynthesis.speak(utterance);
        }
        
        readNextMessage();
    }

    function increaseFontSize() {
        currentFontSize = (currentFontSize % 3) + 1;
        document.body.style.fontSize = `${currentFontSize * 20}px`;
        
        if (currentFontSize === 3) {
            fontSizeBtn.innerHTML = '<i class="fas fa-text-height"></i> Reset Text Size';
        } else {
            fontSizeBtn.innerHTML = '<i class="fas fa-text-height"></i> Increase Text Size';
        }
    }

    function appendEvent(event) {
        const eventElement = document.createElement('div');
        eventElement.className = 'event-card';
        eventElement.id = `event-${event.id}`;
        
        const currentUser = localStorage.getItem('userId');
        const hasRSVPed = event.rsvps.includes(`User-${currentUser.slice(0, 8)}`);
        
        eventElement.innerHTML = `
            <h3>${event.title}</h3>
            <p><strong>Date:</strong> ${event.date}</p>
            <p><strong>Time:</strong> ${event.time}</p>
            <p><strong>Location:</strong> ${event.location}</p>
            <p>${event.description}</p>
            <p><strong>Created by:</strong> ${event.created_by}</p>
            <div class="rsvp-section">
                <button class="rsvp-button ${hasRSVPed ? 'rsvp-active' : ''}" 
                        onclick="rsvpEvent(${event.id})">
                    ${hasRSVPed ? 'Cancel RSVP' : 'RSVP'}
                </button>
                <span class="rsvp-count">${event.rsvps.length} attending</span>
            </div>
        `;
        eventList.appendChild(eventElement);
    }

    function updateEvent(event) {
        const eventElement = document.getElementById(`event-${event.id}`);
        if (eventElement) {
            const currentUser = localStorage.getItem('userId');
            const hasRSVPed = event.rsvps.includes(`User-${currentUser.slice(0, 8)}`);
            
            const rsvpButton = eventElement.querySelector('.rsvp-button');
            const rsvpCount = eventElement.querySelector('.rsvp-count');
            
            if (rsvpButton) {
                rsvpButton.textContent = hasRSVPed ? 'Cancel RSVP' : 'RSVP';
                rsvpButton.classList.toggle('rsvp-active', hasRSVPed);
            }
            
            if (rsvpCount) {
                rsvpCount.textContent = `${event.rsvps.length} attending`;
            }
        }
    }

    function updateEventCount() {
        eventCount.textContent = `(${eventList.children.length})`;
    }

    function handleEventSubmit(e) {
        e.preventDefault();
        
        const newEvent = {
            title: document.getElementById('eventTitle').value,
            date: document.getElementById('eventDate').value,
            time: document.getElementById('eventTime').value,
            location: document.getElementById('eventLocation').value,
            description: document.getElementById('eventDescription').value
        };
        
        socket.emit('create_event', newEvent);
        eventModal.style.display = 'none';
        eventForm.reset();
    }

    function loadDailyQuote() {
        const quotes = [
            "Age is an issue of mind over matter. If you don't mind, it doesn't matter.",
            "The best way to predict the future is to create it.",
            "You're never too old to set another goal or to dream a new dream.",
            "The secret of staying young is to live honestly, eat slowly, and lie about your age."
        ];
        
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        dailyQuote.textContent = randomQuote;
    }

    // Make rsvpEvent available globally
    window.rsvpEvent = function(eventId) {
        socket.emit('rsvp_event', { eventId });
    };

    // Load voices when they become available
    if (speechSynthesis) {
        speechSynthesis.onvoiceschanged = () => {
            console.log('Voices loaded:', speechSynthesis.getVoices());
        };
    }

    // Function to clear chat messages
    function clearChatMessages() {
        chatMessages.innerHTML = '';
    }

    // Toggle history view
    function toggleHistory() {
        const messages = Array.from(chatMessages.children);
        const historyContainer = document.getElementById('history-container');
        
        if (!historyContainer) {
            // Create history container if it doesn't exist
            const container = document.createElement('div');
            container.id = 'history-container';
            container.className = 'history-container';
            
            // Create close button
            const closeBtn = document.createElement('button');
            closeBtn.className = 'close-history-btn';
            closeBtn.innerHTML = '<i class="fas fa-times"></i>';
            closeBtn.onclick = toggleHistory;
            
            // Create history content
            const content = document.createElement('div');
            content.className = 'history-content';
            
            // Add messages to history
            messages.forEach(message => {
                const historyMessage = message.cloneNode(true);
                content.appendChild(historyMessage);
            });
            
            container.appendChild(closeBtn);
            container.appendChild(content);
            document.body.appendChild(container);
            
            // Add active class to history button
            historyBtn.classList.add('active');
        } else {
            // Remove history container if it exists
            historyContainer.remove();
            historyBtn.classList.remove('active');
        }
    }
});