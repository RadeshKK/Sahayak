# main.py

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

API_KEY = "AIzaSyALlQogAp6P8tj77qFK3PqkSnrILFgQ3lA"

# Convert natural question into specific prompt (for themed modes)
def refine_prompt(natural_input: str, mode: str):
    model = ChatGoogleGenerativeAI(model="gemini-1.5-pro", temperature=0.3, api_key=API_KEY)
    system_message = (
        "You are an expert at converting vague or casual user questions into clear and specific prompts "
        "based on the user's selected theme."
    )

    instruction = (
        f"Theme: {mode}\n"
        f"User said: {natural_input}\n"
        f"Convert this into a specific and clear prompt."
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_message),
        ("human", "{instruction}")
    ])

    chain = prompt | model | StrOutputParser()
    return chain.invoke({"instruction": instruction})


# Main function that handles all modes
def response_by_model(user_input: str, mode: str, language: str = None):
    model = ChatGoogleGenerativeAI(model="gemini-1.5-pro", temperature=0.5, api_key=API_KEY)

    # Choose system prompt based on mode
    if mode == "Information":
        base_prompt = "You are a helpful AI assistant. Provide neutral, factual, and informative answers."
        refined_input = refine_prompt(user_input, mode)

    elif mode == "Religious":
        base_prompt = "You are a spiritual guide. Provide thoughtful answers with religious or spiritual context, respectful to all beliefs."
        refined_input = refine_prompt(user_input, mode)

    elif mode == "Wellbeing":
        base_prompt = "You are a wellbeing coach. Give positive, calming, and mindful answers to support emotional and mental health."
        refined_input = refine_prompt(user_input, mode)

    

    else:  # Default mode
        base_prompt = "You are a friendly and helpful assistant. Answer the question clearly and helpfully."
        refined_input = user_input

    # Override system prompt if user selects a specific language
    if language:
        base_prompt += f" Answer only in {language}, even if the user types in a different language."

    prompt = ChatPromptTemplate.from_messages([
        ("system", base_prompt),
        ("human", "{question}")
    ])
    chain = prompt | model | StrOutputParser()
    return chain.invoke({"question": refined_input})
