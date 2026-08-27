from __future__ import annotations

import os
from dotenv import load_dotenv
from openai import OpenAI

from ai.chatbot.guardrails import check_question_safety
from ai.chatbot.retriever import ElectionRetriever

load_dotenv()

SYSTEM_PROMPT = """
You are a neutral, secure AI Election Assistant for a digital voting system.

Mandatory rules:
1. Use ONLY the official context provided below.
2. Never recommend, endorse, or rank any candidate or political party.
3. If the context does not contain the answer, say:
   "This information is not available in the official election knowledge base."
4. Never ask for or process passwords, OTPs, or private keys.
5. Provide clear, professional, concise, and structured answers (bullet points or short paragraphs).
"""

class ElectionAssistant:
    def __init__(self):
        self.retriever = ElectionRetriever()
        self.provider = os.getenv("AI_PROVIDER", "groq").lower().strip()

        timeout = float(os.getenv("AI_REQUEST_TIMEOUT", "30"))
        max_retries = int(os.getenv("AI_MAX_RETRIES", "2"))

        # Configure Groq / OpenAI / Others
        if self.provider == "groq":
            api_key = os.getenv("GROQ_API_KEY")
            base_url = "https://api.groq.com/openai/v1"
            self.model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
        elif self.provider == "grok":
            api_key = os.getenv("XAI_API_KEY")
            base_url = "https://api.x.ai/v1"
            self.model = os.getenv("GROK_MODEL", "grok-3-mini")
        else:
            api_key = os.getenv("OPENAI_API_KEY")
            base_url = None
            self.model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

        self.client = None
        if api_key:
            kwargs = {
                "api_key": api_key,
                "timeout": timeout,
                "max_retries": max_retries,
            }
            if base_url:
                kwargs["base_url"] = base_url
            self.client = OpenAI(**kwargs)

    def answer(self, question: str) -> dict:
        is_safe, safety_message = check_question_safety(question)
        if not is_safe:
            return {
                "answer": safety_message,
                "sources": [],
                "mode": "guardrail"
            }

        docs = self.retriever.retrieve(question, top_k=4)
        if not docs:
            return {
                "answer": "This information is not available in the official election knowledge base.",
                "sources": [],
                "mode": "no_context"
            }

        context = "\n".join(
            [f"- Source: {doc.source}\n  Title: {doc.title}\n  Fact: {doc.content}" for doc in docs]
        )

        if self.client:
            answer = self._generate_llm_answer(question, context)
            mode = f"{self.provider}_llm"
        else:
            answer = self._fallback_answer(question, docs)
            mode = "retrieval_fallback"

        return {
            "answer": answer,
            "sources": [
                {"source": doc.source, "score": round(float(doc.score), 4)}
                for doc in docs
            ],
            "mode": mode
        }

    def _generate_llm_answer(self, question: str, context: str) -> str:
        response = self.client.chat.completions.create(
            model=self.model,
            temperature=0.1,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": f"Official Context:\n{context}\n\nUser Question: {question}\n\nAnswer:"
                }
            ]
        )
        return response.choices[0].message.content.strip()

    def _fallback_answer(self, question: str, docs) -> str:
        lines = ["Here is the official information regarding your query:"]
        for doc in docs[:4]:
            lines.append(f"- {doc.title}: {doc.content}")
        return "\n".join(lines)