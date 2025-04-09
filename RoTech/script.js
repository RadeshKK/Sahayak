document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const addEmojiBtn = document.getElementById('addEmojiBtn');
    const readAloudBtn = document.getElementById('readAloudBtn');
    const fontSizeBtn = document.getElementById('fontSizeBtn');
    const eventsList = document.getElementById('eventsList');
    const addEventBtn = document.getElementById('addEventBtn');
    const eventModal = document.getElementById('eventModal');
    const eventForm = document.getElementById('eventForm');
    const dailyQuote = document.getElementById('dailyQuote');

    // State
    let currentFontSize = 1;
    let isReadAloudEnabled = false;
    let speechSynthesis = window.speechSynthesis;

    // Sample data (in a real app, this would come from a backend)
    const sampleEvents = [
        {
            id: 1,
            title: "Morning Coffee Meetup",
            date: "2024-03-20T10:00",
            location: "Community Center",
            description: "Join us for coffee and conversation",
            attendees: 5
        },
        {
            id: 2,
            title: "Book Club",
            date: "2024-03-22T14:00",
            location: "Library",
            description: "Discussion of this month's book",
            attendees: 8
        }
    ];

    // Initialize
    loadSampleEvents();
    loadDailyQuote();
    setupEventListeners();

    function setupEventListeners() {
        // Chat functionality
        sendMessageBtn.addEventListener('click', sendMessage);
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        // Accessibility features
        readAloudBtn.addEventListener('click', toggleReadAloud);
        fontSizeBtn.addEventListener('click', increaseFontSize);

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
        const message = messageInput.value.trim();
        if (!message) return;

        const messageElement = createMessageElement('You', message);
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Clear input
        messageInput.value = '';

        // Play notification sound
        playNotificationSound();

        // If read aloud is enabled, read the message
        if (isReadAloudEnabled) {
            readMessage(message);
        }
    }

    function createMessageElement(sender, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        
        const header = document.createElement('div');
        header.className = 'message-header';
        
        const senderSpan = document.createElement('span');
        senderSpan.textContent = sender;
        
        const timeSpan = document.createElement('span');
        timeSpan.textContent = new Date().toLocaleTimeString();
        
        header.appendChild(senderSpan);
        header.appendChild(timeSpan);
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = content;
        
        messageDiv.appendChild(header);
        messageDiv.appendChild(contentDiv);
        
        return messageDiv;
    }

    function toggleReadAloud() {
        isReadAloudEnabled = !isReadAloudEnabled;
        readAloudBtn.classList.toggle('active', isReadAloudEnabled);
        
        if (isReadAloudEnabled) {
            readAloudBtn.innerHTML = '<i class="fas fa-volume-up"></i> Stop Reading';
        } else {
            readAloudBtn.innerHTML = '<i class="fas fa-volume-up"></i> Read Aloud';
            speechSynthesis.cancel();
        }
    }

    function readMessage(message) {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = 0.8; // Slower speech rate
        utterance.pitch = 1.0;
        speechSynthesis.speak(utterance);
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

    function loadSampleEvents() {
        eventsList.innerHTML = '';
        sampleEvents.forEach(event => {
            const eventElement = createEventElement(event);
            eventsList.appendChild(eventElement);
        });
    }

    function createEventElement(event) {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'event-card';
        
        const title = document.createElement('h3');
        title.className = 'event-title';
        title.textContent = event.title;
        
        const details = document.createElement('div');
        details.className = 'event-details';
        details.innerHTML = `
            <p><i class="fas fa-clock"></i> ${new Date(event.date).toLocaleString()}</p>
            <p><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
            <p>${event.description}</p>
            <p><i class="fas fa-users"></i> ${event.attendees} attending</p>
        `;
        
        const rsvpButton = document.createElement('button');
        rsvpButton.className = 'accessibility-btn';
        rsvpButton.innerHTML = '<i class="fas fa-hand-paper"></i> I\'m Interested';
        rsvpButton.addEventListener('click', () => {
            event.attendees++;
            loadSampleEvents();
        });
        
        eventDiv.appendChild(title);
        eventDiv.appendChild(details);
        eventDiv.appendChild(rsvpButton);
        
        return eventDiv;
    }

    function handleEventSubmit(e) {
        e.preventDefault();
        
        const newEvent = {
            id: sampleEvents.length + 1,
            title: document.getElementById('eventTitle').value,
            date: document.getElementById('eventDate').value,
            location: document.getElementById('eventLocation').value,
            description: document.getElementById('eventDescription').value,
            attendees: 0
        };
        
        sampleEvents.push(newEvent);
        loadSampleEvents();
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

    function playNotificationSound() {
        const audio = new Audio('notification.mp3');
        audio.volume = 0.5;
        audio.play().catch(e => console.log('Audio playback failed:', e));
    }
}); 