# import os
# import httpx
# from dotenv import load_dotenv

# load_dotenv()

# OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# async def process_document(content: str):
#     prompt = f"""
#             Analyze this document.
#             Return:
#             1. Summary
#             2. Keywords
#             3. Sentiment

#             Content:
#             {content}
#     """
#     async with httpx.AsyncClient(timeout=60.0) as client:

#         response = await client.post(
#             "https://openrouter.ai/api/v1/chat/completions",
#             headers={
#                 "Authorization": f"Bearer {OPENROUTER_API_KEY}",
#                 "Content-Type": "application/json",
#             },
#             json={
#                 "model": "openai/gpt-4o-mini",
#                 "messages": [
#                     {
#                         "role": "user",
#                         "content": prompt,
#                     }
#                 ],
#             },
#         )

#         data = response.json()

#         ai_text = data["choices"][0]["message"]["content"]

#         return {
#             "raw_response": ai_text
#         }




import os
import httpx

from dotenv import load_dotenv
load_dotenv()

OPENROUTER_API_KEY = os.getenv(
"OPENROUTER_API_KEY"
)

async def process_document(content: str):
    prompt = f"""
        Analyze the following document.
        Return strictly in this format:
        Summary: <short summary>
        Keywords: <comma separated keywords>
        Sentiment:
        <positive/neutral/negative>
        Document:
        {content}
        """
    
    try:
        async with httpx.AsyncClient(
            timeout=60.0
        ) as client:

            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",

                headers={
                    "Authorization":
                        f"Bearer {OPENROUTER_API_KEY}",

                    "Content-Type":
                        "application/json",
                },

               json={              
                        "model": "openai/gpt-3.5-turbo",
                        "messages": [
                            {
                                "role": "user",
                                "content": prompt,
                            }
                        ],
                        "max_tokens": 300,
                        "temperature": 0.3,
                    },
            )

            data = response.json()

            print("OPENROUTER RESPONSE:")
            print(data)

            # Handle API errors properly
            if "choices" not in data:

                return {
                    "error":
                        data.get(
                            "error",
                            "Unknown OpenRouter error"
                        )
                }

            ai_text = (
                data["choices"][0]
                    ["message"]["content"]
            )

            return {
                "raw_response": ai_text
            }

    except Exception as error:

        print("OPENROUTER FAILURE:")
        print(error)

        return {
            "error": str(error)
        }

