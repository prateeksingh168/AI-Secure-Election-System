# 🤖 AI Election Chatbot

The **AI Election Assistant** provides voters with accurate, source-cited information about elections, candidates, and voting procedures.

## ✨ Features
- **Natural Language Understanding**: Answers questions in plain English.
- **Knowledge Base**: Powered by `election_knowledge.json` (generated from CSV files).
- **Retrieval-Augmented Generation (RAG)**: Retrieves relevant documents before generating responses.
- **Audit Logging**: Tracks all interactions (without PII) for transparency.
- **Fallback Mechanism**: Works even without an LLM (uses direct knowledge base responses).

## 📦 Setup

1. **Generate the Knowledge Base** (from your CSV files):
   ```bash
   cd ../knowledge
   python generate_knowledge_base.py