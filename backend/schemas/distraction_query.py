from pydantic import BaseModel
from datetime import datetime


class DistractionQuery(BaseModel):
    user_id: int
    start: datetime | None = None
    end: datetime | None = None
