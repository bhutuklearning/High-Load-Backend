from fastapi import APIRouter
from app.schemas.ai_schema import DocumentRequest
from app.services.openrouter_service import process_document

router = APIRouter()

@router.post("/process")
async def process_ai_document(payload: DocumentRequest):
    result = await process_document(payload.content)
    return result

