# 🏥 Sahayaak - Comprehensive Elderly Care Services Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-2.3.3-green.svg)](https://flask.palletsprojects.com/)
[![Streamlit](https://img.shields.io/badge/Streamlit-1.28+-red.svg)](https://streamlit.io/)

## 📖 Overview

**Sahayaak** is a revolutionary platform dedicated to improving the lives of senior citizens through technology. Our mission is to provide accessible, compassionate, and innovative solutions that enhance the quality of life for the elderly by combining cutting-edge AI technology with human-centered design.

## 🌟 Key Features

### 🤖 AI-Powered Assistant
- **Multi-modal AI Chatbot** with Google Gemini integration
- **Voice Recognition** for hands-free interaction
- **Themed Response Modes**: Information, Religious, Wellbeing
- **Multi-language Support** for diverse communities
- **Real-time Content Generation** using LangChain

### 👥 Community & Social Connection
- **Real-time Chat System** with WebSocket support
- **Community Events** creation and RSVP functionality
- **User Activity Tracking** and engagement metrics
- **Interactive Social Platform** for elderly networking

### 📱 Communication Hub
- **WhatsApp Integration** for family communication
- **Emergency Message System** for quick alerts
- **Scheduled Messaging** for regular check-ins
- **Photo Sharing Requests** for visual connection

### 🏃‍♂️ Elderly Fitness & Wellness
- **Interactive Muscle Wiki** with detailed exercise guides
- **Body Part Selection** with visual anatomy maps
- **Exercise Demonstrations** with animated GIFs
- **Fitness Tracking** and progress monitoring

### 📰 News & Information
- **Real-time News Hub** with customizable interests
- **Category-based Filtering**: International, National, Politics, Sports
- **Dynamic Content Loading** for fresh updates
- **Accessible Reading Interface** for elderly users

### 🗺️ Local Resources & Navigation
- **Interactive Maps** for local services
- **Hospital & Healthcare Locator**
- **Parks & Recreation Centers**
- **Temple & Wellness Center Directory**

### 🎮 Entertainment & Engagement
- **Interactive Games** for cognitive stimulation
- **Voice-controlled Navigation**
- **Accessibility Features** for various abilities

## 🏗️ Architecture & Technology Stack

### Frontend Technologies
- **HTML5, CSS3, JavaScript** for responsive web interface
- **Bootstrap 5** for modern UI components
- **Font Awesome** for intuitive icons
- **WebSocket** for real-time communication

### Backend Technologies
- **Python 3.8+** as primary language
- **Flask** for web application framework
- **Streamlit** for AI assistant interface
- **Flask-SocketIO** for real-time features

### AI & Machine Learning
- **Google Gemini 1.5 Pro** for AI responses
- **LangChain** for prompt engineering
- **Speech Recognition** for voice commands
- **Text-to-Speech** for audio feedback

### Communication & Integration
- **PyWhatKit** for WhatsApp automation
- **WebSocket** for real-time chat
- **CORS** for cross-origin requests

### Data & Storage
- **CSV Files** for local resource data
- **JSON** for configuration and messages
- **Session Management** for user states

## 🚀 Getting Started

### Prerequisites
- Python 3.8 or higher
- pip (Python package installer)
- Modern web browser
- WhatsApp Web access (for communication features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/sahayaak.git
   cd sahayaak
   ```

2. **Install Python dependencies**
   ```bash
   # For AI Assistant
   cd chat_bot1
   pip install -r requirements.txt
   
   # For Community Platform
   cd ../RoTech
   pip install -r requirements.txt
   
   # For Communication Hub
   cd ../whats/whats
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file in chat_bot1 directory
   echo "GOOGLE_API_KEY=your_google_api_key_here" > chat_bot1/.env
   ```

### Running the Application

1. **Start the AI Assistant**
   ```bash
   cd chat_bot1
   streamlit run main.py
   # Access at http://localhost:8501
   ```

2. **Start the Community Platform**
   ```bash
   cd RoTech
   python app.py
   # Access at http://localhost:5000
   ```

3. **Start the Communication Hub**
   ```bash
   cd whats/whats
   python app.py
   # Access at http://localhost:5000
   ```

4. **Open the main interface**
   - Open `index.html` in your web browser
   - Or serve it using a local server

## 📁 Project Structure

```
Sahayaak/
├── 📄 index.html                 # Main landing page
├── 🎮 games.html                 # Interactive games
├── 📰 news/                      # News hub application
├── 🤖 chat_bot1/                 # AI assistant with Streamlit
├── 👥 RoTech/                    # Community platform
├── 📱 whats/                     # Communication hub
├── 🏃‍♂️ musclewiki/              # Fitness and exercise guide
├── 🗺️ maps/                      # Local resources and maps
├── 🔐 login/                     # Authentication system
└── 🖼️ images/                    # Static assets
```

## 🔧 Configuration

### AI Assistant Configuration
- Set your Google Gemini API key in the environment variables
- Configure response modes and language preferences
- Customize voice recognition settings

### Communication Hub Setup
- Configure WhatsApp phone number in `app.py`
- Set up message templates for different scenarios
- Adjust timing settings for scheduled messages

### Community Platform Settings
- Configure WebSocket settings for real-time chat
- Set up user session management
- Customize event creation and RSVP features

## 🎯 Use Cases

### For Elderly Users
- **Daily Assistance**: AI-powered help for daily tasks
- **Social Connection**: Stay connected with family and community
- **Health Monitoring**: Track fitness and wellness activities
- **Information Access**: Easy access to news and local resources

### For Caregivers
- **Remote Monitoring**: Check on elderly family members
- **Communication**: Easy messaging and photo sharing
- **Emergency Alerts**: Quick response to urgent situations
- **Activity Tracking**: Monitor engagement and wellness

### For Healthcare Providers
- **Patient Engagement**: Tools for elderly patient interaction
- **Resource Directory**: Local healthcare facility information
- **Wellness Programs**: Fitness and activity recommendations

## 🤝 Contributing

We welcome contributions to make Sahayaak even better! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow PEP 8 for Python code
- Use meaningful commit messages
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

## 🐛 Known Issues & Limitations

- Voice recognition requires browser microphone permissions
- WhatsApp integration requires manual QR code scanning
- Some features may not work on older browsers
- AI responses depend on internet connectivity

## 🔮 Future Enhancements

- [ ] Mobile app development (iOS/Android)
- [ ] Integration with smart home devices
- [ ] Advanced health monitoring with wearables
- [ ] Machine learning for personalized recommendations
- [ ] Multi-language support expansion
- [ ] Offline functionality for core features
- [ ] Integration with healthcare systems
- [ ] Advanced analytics and reporting


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini** for AI capabilities
- **Streamlit** for rapid web app development
- **Flask** for robust backend framework
- **Bootstrap** for responsive design
- **Font Awesome** for beautiful icons
- **Open Source Community** for inspiration and tools

## 📊 Project Statistics

- **Lines of Code**: 10,000+
- **Components**: 8 major modules
- **Technologies**: 15+ frameworks/libraries
- **Features**: 20+ core functionalities
- **Target Users**: Elderly citizens and caregivers

---

**Made with ❤️ for the elderly community**

*Sahayaak - Empowering seniors through technology* 
