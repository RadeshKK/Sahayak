# frontend.py

import streamlit as st
from main import response_by_model
import speech_recognition as sr
import tempfile
import os
import time
import pyttsx3

st.set_page_config(page_title="Gemini Q&A Chatbot", layout="centered")
st.title("👵 Elder-Friendly Gemini Chatbot")
st.markdown("Ask anything in your own words. I'll answer it in the tone and language you prefer. 🌍")

# Initialize session state for chat history if not already present
if 'chat_history' not in st.session_state:
    st.session_state.chat_history = []

# Initialize text-to-speech engine
engine = pyttsx3.init()

# Mode selector
mode = st.selectbox(
    "Choose answer style:",
    ["Default", "Information", "Religious", "Wellbeing"]
)

# Optional local language preference
st.markdown("**Prefer the answer in a specific language?**")
language = st.radio(
    "Select a language (optional):",
    ("None", "English", "Hindi", "Kannada", "Tamil", "Telugu"),
    index=0,
    horizontal=True
)
preferred_language = None if language == "None" else language

# Add microphone button outside the form
col1, col2 = st.columns([1, 5])
with col1:
    mic_button = st.button("🎤 Use Microphone")

# Handle microphone input
if mic_button:
    st.info("Listening... Speak your question now.")
    
    # Initialize recognizer
    recognizer = sr.Recognizer()
    
    try:
        with sr.Microphone() as source:
            # Adjust for ambient noise
            recognizer.adjust_for_ambient_noise(source, duration=1)
            # Listen for audio
            audio = recognizer.listen(source, timeout=5)
            
            # Show processing message
            with st.spinner("Processing speech..."):
                # Convert speech to text
                text = recognizer.recognize_google(audio)
                # Update the session state
                st.session_state.user_question = text
                st.success(f"Recognized: {text}")
                # Rerun to update the UI
                st.rerun()
    except sr.WaitTimeoutError:
        st.error("No speech detected. Please try again.")
    except sr.UnknownValueError:
        st.error("Could not understand audio. Please try again.")
    except Exception as e:
        st.error(f"Error: {e}")

# Create a form for the chat interface
with st.form("chat_form"):
    # Text input for the question
    user_question = st.text_area("Type your question naturally here:", value=st.session_state.get('user_question', ''), key="question_input")
    
    # Submit button inside the form
    submitted = st.form_submit_button("Get Answer")

# Display chat history
for idx, (q, a) in enumerate(st.session_state.chat_history):
    st.write("**You:**", q)
    st.write("**Assistant:**", a)
    # Add read button for each response
    if st.button("🔊 Read This Response", key=f"read_{idx}"):
        engine.say(a)
        engine.runAndWait()
    st.markdown("---")

# Output
if submitted and user_question.strip():
    with st.spinner("Thinking..."):
        try:
            answer = response_by_model(user_question, mode, preferred_language)
            
            # Add to chat history
            st.session_state.chat_history.append((user_question, answer))
            
            # Display the new response
            st.write("**You:**", user_question)
            st.write("**Assistant:**", answer)
            # Add read button for the new response
            if st.button("🔊 Read This Response", key=f"read_new"):
                engine.say(answer)
                engine.runAndWait()
            st.markdown("---")
            
        except Exception as e:
            st.error(f"Error: {e}")
