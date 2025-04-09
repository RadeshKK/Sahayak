from flask import Flask, request, jsonify
from flask_cors import CORS
import pywhatkit
import time
from datetime import datetime

app = Flask(__name__)
CORS(app)

@app.route('/send-message', methods=['POST'])
def send_message():
    try:
        data = request.json
        message_type = data.get('type')
        phone_number = '+916361723819'  # Fixed phone number
        
        current_time = datetime.now()
        # Add 1 minute to current time to ensure message is sent
        send_time = current_time.replace(minute=current_time.minute + 1)

        if message_type == 'emergency':
            message = "🚨 EMERGENCY: This is an emergency message. Please respond immediately!"
        elif message_type == 'call':
            message = "📞 I would like to have a call with you. Please call me back when you're available."
        elif message_type == 'photo':
            message = "📸 Could you please send me a recent photo?"
        elif message_type == 'hangout':
            message = "👥 Would you like to hang out? I'm available for a meetup!"
        else:
            return jsonify({"error": "Invalid message type"}), 400

        # Send message using pywhatkit with additional parameters
        pywhatkit.sendwhatmsg(phone_number, message, 
                             send_time.hour, 
                             send_time.minute,
                             wait_time=15,
                             tab_close=True,
                             close_time=3)
        
        return jsonify({"success": True, "message": "Message scheduled successfully"})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000) 