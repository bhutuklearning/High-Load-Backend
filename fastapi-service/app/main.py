# from fastapi import FastAPI
# from app.routes.ai import router as ai_router

# app = FastAPI(
#  title="AI Worker Service"
# )

# @app.get("/health")
# async def health():
#     return {
#     "status": "ok"
#     }

# app.include_router(
# ai_router,
# prefix="/ai"
# )







from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.routes.ai import router as ai_router
from app.services.worker import start_worker
import asyncio


@asynccontextmanager
async def lifespan(app: FastAPI):
    asyncio.create_task(
        start_worker()
    )
    yield


app = FastAPI(
    title="AI Worker Service",
    lifespan=lifespan
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