import base64
import os

import requests

groq_api_key = os.getenv("GROQ_API_KEY")

SYSTEM_PROMPT = """You are an advanced OCR tool. Your task is to accurately transcribe the text from the provided image.
Please follow these guidelines to ensure the transcription is as correct as possible:
1. **Preserve Line Structure**: Transcribe the text exactly as it appears in the image, including line breaks.
2. **Avoid Splitting Words**: Ensure that words are fully formed, even if they appear across two lines or are partially obscured. Join word parts together appropriately to create complete words.
3. **Correct Unnatural Spacing**: Do not add extra spaces between characters in a word. Make sure the words are spaced naturally, without any unwanted breaks or gaps.
4. **Recognize and Correct Word Breaks**: If any word is mistakenly broken into parts, join them correctly to produce a natural, readable word. 
5. **No Additional Comments or Analysis**: Provide only the raw text as it appears in the image, without any additional analysis, comments, or summaries.
6. **Output as a Block of Text**: Output the entire transcribed text as a block, maintaining the line breaks, but ensuring that each word appears as it should, with correct spelling, no character-level splits, and no hyphenations unless they appear naturally in the image.
7. **Don't summarize the text, just transcribe it as it is.**"""


def encode_image_to_base64(image):
    return base64.b64encode(image).decode("utf-8")


def parse_response(response_json):
    return response_json.get("choices", [{}])[0].get("message", {}).get("content", "")


def perform_ocr(image):
    base64_image = encode_image_to_base64(image)
    response = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {groq_api_key}",
            "Content-Type": "application/json",
        },
        json={
            "model": "meta-llama/llama-4-maverick-17b-128e-instruct",
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": SYSTEM_PROMPT},
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"},
                        },
                    ],
                }
            ],
            "temperature": 0.2,
        },
    )

    print(response.text)
    if response.status_code == 200:
        return parse_response(response.json())
