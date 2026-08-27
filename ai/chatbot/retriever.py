from __future__ import annotations

import json
import re
from dataclasses import dataclass
from pathlib import Path

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


PROJECT_ROOT = Path(__file__).resolve().parents[2]
KNOWLEDGE_PATH = PROJECT_ROOT / "ai" / "knowledge" / "election_knowledge.json"
DATABASE_DIR = PROJECT_ROOT / "database" / "data"


def safe_get(row, columns, default=""):
    for col in columns:
        if col in row and pd.notna(row[col]):
            return str(row[col]).strip()
    return default


def normalize_text(value: str) -> str:
    value = value.lower().strip()
    value = re.sub(r"\s+", " ", value)
    return value


@dataclass
class RetrievedDocument:
    source: str
    title: str
    content: str
    score: float

    @property
    def display(self) -> str:
        if self.title:
            return f"{self.title}: {self.content}"
        return self.content


class ElectionRetriever:
    def __init__(self):
        self.documents: list[dict] = []
        self.vectorizer = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            max_df=0.95,
            min_df=1,
        )
        self.matrix = None
        self.load_documents()

    def load_documents(self) -> None:
        self.documents = []
        self._load_knowledge_base()
        self._load_candidates_csv()
        self._load_elections_csv()

        corpus = [doc["search_text"] for doc in self.documents]
        self.matrix = self.vectorizer.fit_transform(corpus) if corpus else None

    def _add_document(self, source: str, title: str, content: str, keywords: str = "") -> None:
        content = re.sub(r"\s+", " ", content).strip()
        title = re.sub(r"\s+", " ", title).strip()
        if not content:
            return

        search_text = f"{title}. {content}. {keywords}".strip()
        self.documents.append(
            {
                "source": source,
                "title": title,
                "content": content,
                "search_text": search_text,
            }
        )

    def _load_knowledge_base(self) -> None:
        if not KNOWLEDGE_PATH.exists():
            return

        with open(KNOWLEDGE_PATH, "r", encoding="utf-8") as file:
            data = json.load(file)

        for section, items in data.items():
            if not isinstance(items, list):
                continue

            for item in items:
                if not isinstance(item, dict):
                    continue

                title = str(item.get("title") or item.get("question") or section.replace("_", " ").title())
                content = str(item.get("content") or item.get("answer") or item.get("details") or "")
                keywords = f"{section.replace('_', ' ')} election voting"

                self._add_document(
                    source=f"knowledge:{section}",
                    title=title,
                    content=content,
                    keywords=keywords,
                )

    def _load_candidates_csv(self) -> None:
        path = DATABASE_DIR / "candidates.csv"
        if not path.exists():
            return

        df = pd.read_csv(path)
        for _, row in df.iterrows():
            candidate_id = safe_get(row, ["candidate_id", "id"])
            name = safe_get(row, ["name", "candidate_name", "full_name"])
            party = safe_get(row, ["party", "party_name"])
            election_id = safe_get(row, ["election_id"])
            profile = safe_get(row, ["profile", "bio", "description"])
            manifesto = safe_get(row, ["manifesto", "manifesto_summary", "agenda", "policies"])

            title = f"Candidate Profile: {name or candidate_id}"
            content = (
                f"{name} is a candidate"
                f"{f' from {party}' if party else ''}"
                f"{f' in election {election_id}' if election_id else ''}."
            )
            if profile:
                content += f" Profile: {profile}"
            if manifesto:
                content += f" Manifesto: {manifesto}"
            if candidate_id:
                content += f" Candidate ID: {candidate_id}."

            self._add_document(
                source="database:candidates.csv",
                title=title,
                content=content,
                keywords=f"candidate manifesto profile party {name} {party} {candidate_id}",
            )

    def _load_elections_csv(self) -> None:
        path = DATABASE_DIR / "elections.csv"
        if not path.exists():
            return

        df = pd.read_csv(path)
        for _, row in df.iterrows():
            election_id = safe_get(row, ["election_id", "id"])
            title_value = safe_get(row, ["title", "name", "election_name"]) or election_id
            description = safe_get(row, ["description"])
            start_date = safe_get(row, ["start_date", "start_time"])
            end_date = safe_get(row, ["end_date", "end_time"])
            status = safe_get(row, ["status"])

            title = f"Election Schedule: {title_value}"
            content = f"Election {title_value}"
            if election_id:
                content += f" (ID: {election_id})"
            content += "."
            if description:
                content += f" Description: {description}."
            if start_date:
                content += f" Starts: {start_date}."
            if end_date:
                content += f" Ends: {end_date}."
            if status:
                content += f" Status: {status}."

            self._add_document(
                source="database:elections.csv",
                title=title,
                content=content,
                keywords=f"election schedule date start end status {title_value} {election_id}",
            )

    def _keyword_bonus(self, question: str, doc: dict) -> float:
        q = normalize_text(question)
        text = normalize_text(doc["search_text"])
        bonus = 0.0

        intent_terms = {
            "where": ["where", "location", "portal", "website", "online", "place"],
            "how": ["how", "procedure", "steps", "process", "cast", "submit"],
            "schedule": ["when", "schedule", "start", "end", "date", "deadline"],
            "rules": ["rule", "eligible", "eligibility", "allowed", "requirements"],
            "candidate": ["candidate", "manifesto", "profile", "party"],
            "security": ["security", "privacy", "anonymous", "duplicate", "audit"],
            "faq": ["twice", "change", "receipt", "confirm", "officers"],
        }

        source = doc["source"]

        if any(term in q for term in intent_terms["where"]) and "voting_locations" in source:
            bonus += 0.35
        if any(term in q for term in intent_terms["how"]) and "voting_procedure" in source:
            bonus += 0.30
        if any(term in q for term in intent_terms["schedule"]) and (
            "election_schedule" in source or source.endswith("elections.csv")
        ):
            bonus += 0.30
        if any(term in q for term in intent_terms["rules"]) and (
            "election_rules" in source or "eligibility" in source
        ):
            bonus += 0.25
        if any(term in q for term in intent_terms["candidate"]) and "candidates.csv" in source:
            bonus += 0.30
        if any(term in q for term in intent_terms["security"]) and "security_information" in source:
            bonus += 0.25
        if any(term in q for term in intent_terms["faq"]) and "faqs" in source:
            bonus += 0.20

        # small exact token overlap boost
        q_tokens = set(re.findall(r"[a-z0-9]+", q))
        d_tokens = set(re.findall(r"[a-z0-9]+", text))
        overlap = len(q_tokens & d_tokens)
        bonus += min(overlap * 0.01, 0.1)

        return bonus

    def retrieve(self, question: str, top_k: int = 4) -> list[RetrievedDocument]:
        if not self.documents or self.matrix is None:
            return []

        query_vec = self.vectorizer.transform([question])
        tfidf_scores = cosine_similarity(query_vec, self.matrix).flatten()

        scored: list[RetrievedDocument] = []
        for idx, base_score in enumerate(tfidf_scores):
            doc = self.documents[idx]
            final_score = float(base_score) + self._keyword_bonus(question, doc)
            if final_score <= 0.05:
                continue

            scored.append(
                RetrievedDocument(
                    source=doc["source"],
                    title=doc["title"],
                    content=doc["content"],
                    score=final_score,
                )
            )

        scored.sort(key=lambda item: item.score, reverse=True)
        return scored[:top_k]