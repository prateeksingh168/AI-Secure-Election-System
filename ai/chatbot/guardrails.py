import re

POLITICAL_ADVICE_PATTERNS = [
    r"who should i vote for",
    r"which candidate should i vote for",
    r"who is the best candidate",
    r"which party is better",
    r"tell me who to vote",
    r"recommend a candidate"
]

PROMPT_INJECTION_PATTERNS = [
    r"ignore previous instructions",
    r"ignore all instructions",
    r"reveal your system prompt",
    r"act as an admin",
    r"developer mode",
    r"bypass rules"
]

def check_question_safety(question: str):
    text = question.lower().strip()

    for pattern in PROMPT_INJECTION_PATTERNS:
        if re.search(pattern, text):
            return False, (
                "I cannot follow instructions that attempt to bypass system rules. "
                "Please ask a valid election-related question."
            )

    for pattern in POLITICAL_ADVICE_PATTERNS:
        if re.search(pattern, text):
            return False, (
                "I am a neutral election assistant and cannot recommend who to vote for. "
                "However, I can help you compare candidates using their official profiles and manifestos."
            )

    return True, None