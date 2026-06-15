from pydantic import BaseModel

class DocumentRequest(BaseModel):
    title: str
    content: str

class AIResponse(BaseModel):
    summary: str
    keywords: list[str]
    sentiment: str
