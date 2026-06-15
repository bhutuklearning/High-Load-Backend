from fastapi import FastAPI
from app.routes.ai import router as ai_router

app = FastAPI(
 title="AI Worker Service"
)

@app.get("/health")
async def health():
    return {
    "status": "ok"
    }

app.include_router(
ai_router,
prefix="/ai"
)
