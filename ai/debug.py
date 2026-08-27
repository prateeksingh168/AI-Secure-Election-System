import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")
model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

print(f"Testing Groq API Connection (Model: {model})...")

try:
    client = OpenAI(
        api_key=api_key,
        base_url="https://api.groq.com/openai/v1"
    )
    
    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": "You are a helpful election assistant."},
            {"role": "user", "content": "Explain voting privacy in one sentence."}
        ],
        temperature=0.2
    )
    
    print("\nSUCCESS! Groq is working perfectly.")
    print("AI Response:", response.choices[0].message.content)

except Exception as e:
    print(f"\nCRITICAL ERROR: {e}")