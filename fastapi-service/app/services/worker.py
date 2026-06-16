import json
import redis
import asyncio
import httpx

from app.services.openrouter_service import process_document

redis_client = redis.Redis(
    host="redis",
    port=6379,
    decode_responses=True
)


EXPRESS_URL = ("http://nginx"
)

async def start_worker():

    print("AI Worker Started")

    while True:

        try:

            job = redis_client.brpop(
                "document-processing-queue",
                timeout=5
            )

            if not job:
                await asyncio.sleep(1)
                continue

            payload = json.loads(
                job[1]
            )

            document_id = payload["documentId"]

            result = await process_document(
                payload["content"]
            )

            if "raw_response" not in result:

                async with httpx.AsyncClient() as client:
                    await client.post(
                        f"{EXPRESS_URL}/api/internal/documents/{document_id}/failed"
                    )

                continue

            async with httpx.AsyncClient() as client:

                await client.post(
                    f"{EXPRESS_URL}/api/internal/documents/{document_id}/complete",
                    json=result
                )

            print(
                f"Processed {document_id}"
            )

        except Exception as e:

            print(
                "WORKER ERROR:",
                e
            )

            await asyncio.sleep(3)