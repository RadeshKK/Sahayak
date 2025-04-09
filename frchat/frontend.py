# frontend.py

import streamlit as st
from main import response_by_model
import speech_recognition as sr
import tempfile
import os
import pyttsx3
import threading

st.set_page_config(page_title="My Friendly Chatbot", layout="centered")
st.title("👋 My Friendly Chatbot")
st.markdown("Hi! I'm your friendly chatbot. Let's chat about anything you'd like! 💬")

# Initialize speech recognizer and text-to-speech engine
recognizer = sr.Recognizer()
# Configure the recognizer for better accuracy
recognizer.energy_threshold = 4000  # Much higher sensitivity for better voice detection
recognizer.dynamic_energy_threshold = True  # Automatically adjust for ambient noise
recognizer.pause_threshold = 1.0  # Longer pause threshold for better phrase detection
recognizer.phrase_threshold = 0.3  # Lower phrase threshold for better word detection
recognizer.non_speaking_duration = 0.5  # Shorter non-speaking duration
engine = pyttsx3.init()

# Initialize session state for user input and response
if 'user_input' not in st.session_state:
    st.session_state.user_input = ""
if 'last_response' not in st.session_state:
    st.session_state.last_response = ""
if 'chat_history' not in st.session_state:
    st.session_state.chat_history = []

# Function to handle speech recognition
def speech_to_text():
    try:
        with sr.Microphone() as source:
            st.info("Initializing microphone... Please wait.")
            # Initial noise adjustment with longer duration
            recognizer.adjust_for_ambient_noise(source, duration=3)
            
            # Show current energy threshold
            st.info(f"Current energy threshold: {recognizer.energy_threshold}")
            
            st.info("Listening... Speak clearly and at a normal pace.")
            # Configure listen parameters for better accuracy
            audio = recognizer.listen(
                source,
                timeout=10,  # Longer timeout
                phrase_time_limit=15,  # Longer phrase time limit
                snowboy_configuration=None  # Disable hotword detection
            )
            
            st.info("Processing speech... This may take a moment.")
            
            # Try Google Speech Recognition first (most accurate)
            try:
                # Use language-specific recognition for better accuracy
                text = recognizer.recognize_google(audio, language="en-US")
                if text:
                    st.success("Speech recognized successfully using Google!")
                    return text
            except sr.UnknownValueError:
                st.warning("Google Speech Recognition could not understand the audio. Trying other services...")
            except sr.RequestError as e:
                st.warning(f"Google Speech Recognition service error: {str(e)}. Trying other services...")
            
            # Try Sphinx as fallback (offline)
            try:
                text = recognizer.recognize_sphinx(audio)
                if text:
                    st.success("Speech recognized successfully using Sphinx!")
                    return text
            except:
                pass
            
            st.warning("Could not recognize speech accurately. Please try again or type your message.")
            return None
            
    except Exception as e:
        st.error(f"Error in speech recognition: {str(e)}")
        return None

# Function to read text aloud
def speak_text(text):
    try:
        engine.say(text)
        engine.runAndWait()
    except Exception as e:
        st.error(f"Error in text-to-speech: {str(e)}")

# Microphone button outside the form
if st.button("🎤 Click to speak", help="Click to speak"):
    text = speech_to_text()
    if text:
        st.session_state.user_input = text
        st.rerun()

# Input form
with st.form("chat_form"):
    user_question = st.text_area("What's on your mind?", value=st.session_state.user_input)
    col1, col2 = st.columns([1, 1])
    with col1:
        submitted = st.form_submit_button("Send Message")
    with col2:
        read_aloud = st.form_submit_button("🔊 Read Last Response")

# Output
if submitted and user_question.strip():
    with st.spinner("Thinking..."):
        try:
            answer = response_by_model(user_question)
            # Store the response in session state
            st.session_state.last_response = answer
            # Add to chat history
            st.session_state.chat_history.append({"question": user_question, "answer": answer})
            # Clear the session state after sending
            st.session_state.user_input = ""
        except Exception as e:
            st.error(f"Oops! Something went wrong: {e}")

# Display chat history
for chat in st.session_state.chat_history:
    st.write("You:", chat["question"])
    st.write("Chatbot:", chat["answer"])
    st.write("---")

# Handle read aloud button
if read_aloud and st.session_state.last_response:
    # Run text-to-speech in a separate thread to avoid blocking the UI
    threading.Thread(target=speak_text, args=(st.session_state.last_response,)).start()
