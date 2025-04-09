document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.action-button');
    
    // Create processing popup element
    const processingPopup = document.createElement('div');
    processingPopup.className = 'processing-popup';
    processingPopup.innerHTML = `
        <div class="processing-content">
            <div class="spinner"></div>
            <p>Processing your request...</p>
        </div>
    `;
    document.body.appendChild(processingPopup);
    
    // Function to show processing popup
    function showProcessingPopup() {
        processingPopup.style.display = 'flex';
    }
    
    // Function to hide processing popup
    function hideProcessingPopup() {
        processingPopup.style.display = 'none';
    }
    
    // Function to send message to backend
    async function sendMessage(type) {
        try {
            showProcessingPopup();
            
            const response = await fetch('http://localhost:5000/send-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: type,
                    phoneNumber: '+916361723819'
                })
            });

            const data = await response.json();
            
            hideProcessingPopup();
            
            if (data.error) {
                alert(`Error: ${data.error}`);
            } else {
                alert('Message scheduled successfully! It will be sent in 1 minute.');
            }
        } catch (error) {
            hideProcessingPopup();
            alert('Error sending message. Please make sure the backend server is running.');
            console.error('Error:', error);
        }
    }
    
    buttons.forEach(button => {
        button.addEventListener('click', async () => {
            // Add a visual feedback when button is clicked
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = 'translateY(-5px)';
            }, 200);

            let messageType;
            if (button.classList.contains('emergency')) {
                messageType = 'emergency';
            } else if (button.classList.contains('call')) {
                messageType = 'call';
            } else if (button.classList.contains('photo')) {
                messageType = 'photo';
            } else if (button.classList.contains('hangout')) {
                messageType = 'hangout';
            }

            await sendMessage(messageType);
        });
    });
}); 