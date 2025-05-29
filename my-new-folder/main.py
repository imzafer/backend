from dotenv import load_dotenv
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI

load_dotenv()  # Load .env variables

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

key = os.getenv("OPENAI_API_KEY")

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
print("✅ Loaded key:", os.getenv("OPENAI_API_KEY"))

class MessageRequest(BaseModel):
    message: str
    tone: str = "casual"

@app.post("/rephrase")
async def rephrase_message(data: MessageRequest):
    prompt = f"""Rephrase the following message to sound more like a polite and clear follow-up asking for an update, while preserving the original meaning:
"{data.message}"""
    
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=100
    )

    improved_message = response.choices[0].message.content.strip()
    return {"original": data.message, "rephrased": improved_message}
