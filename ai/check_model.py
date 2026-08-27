import os
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv()

def check_available_models():
    print("=" * 60)
    print("Checking Available Models on Groq")
    print("=" * 60)

    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        print("ERROR: GROQ_API_KEY not found in .env file")
        return

    try:
        client = OpenAI(
            api_key=api_key,
            base_url="https://api.groq.com/openai/v1"
        )

        print("Connecting to Groq API...\n")

        models = client.models.list()

        print("Available Models:\n")

        for model in models.data:
            print(f"• {model.id}")

        print("\n" + "=" * 60)
        print("Recommended fast models for this project:")
        print("=" * 60)

        recommended = [
            "llama-3.1-8b-instant",
            "llama-3.1-70b-versatile",
            "mixtral-8x7b-32768",
            "gemma2-9b-it"
        ]

        for rec in recommended:
            exists = any(m.id == rec for m in models.data)
            status = "AVAILABLE" if exists else "NOT AVAILABLE"
            print(f"• {rec:<30} → {status}")

    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    check_available_models()