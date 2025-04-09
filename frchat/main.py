# main.py

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

API_KEY = "AIzaSyALlQogAp6P8tj77qFK3PqkSnrILFgQ3lA"

def response_by_model(user_input: str):
    model = ChatGoogleGenerativeAI(model="gemini-1.5-pro", temperature=0.7, api_key=API_KEY)
    
    base_prompt = """You are a friendly and caring chatbot friend. Your responses should be:
    - Warm and personal, like talking to a good friend
    - Engaging and conversational
    - Helpful and supportive
    - Natural and easy to understand
    Always maintain a positive and friendly tone while being genuine in your responses."""

    prompt = ChatPromptTemplate.from_messages([
        ("system", base_prompt),
        ("human", "{question}")
    ])
    
    chain = prompt | model | StrOutputParser()
    return chain.invoke({"question": user_input})
