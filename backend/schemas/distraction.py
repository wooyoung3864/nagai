# backend/schemas/distraction.py
from pydantic import BaseModel
from datetime import datetime
from typing import List
from database import SessionLocal


class DistractionIn(BaseModel):
    session_id: int or None = None
    timestamp: datetime or None = None
    focus_score: int or None = None
    is_focused: bool or None = None
    observed_behaviors: List[str] or None = None
    explanation: str or None = None


class DistractionOut(DistractionIn):
    id: int
    timestamp: datetime
    user_id: int

    class Config:
        from_attributes = True

{
  "action": "STOP",
  "focus_score": 95,
  "is_focused": True,
  "observed_behaviors": [],
  "explanation": "A single hand is visible, palm up, and satisfies all criteria A-E."
}

def push_gemini_distraction():
    db = SessionLocal()
    distraction = [
        {"action": "", "focus_score": "", "is_focused": "", "observed_behaviors": "", "explanation": ""},
        {"service": "gemini", "key_name": "api_key_2", "plaintext_key": "AIzaSyAl9TIvPzX4OC7Uixl08cb-UDnQ-kGTSHw"},
        {"service": "gemini", "key_name": "api_key_3", "plaintext_key": "AIzaSyA5E2RqP-utLkqvdmjogAnG1g2VHAPyT40"},
    ]

    for d in distraction:
        db.add(DistractionIn(action=d["service"], focus_score=d["key_name"], is_focused=d["is_focused"], observed_behaviors=d["observed_behaviors"], explanation=d["explanation"]))

    db.commit()
    db.close()

if __name__ == "__main__":
    push_gemini_distraction()
