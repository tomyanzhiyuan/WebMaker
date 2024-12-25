import os
from openai import OpenAI
from base64 import b64encode
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def generate_website_html(description: str, image_data: list) -> str:
    # Process images if provided
    image_analysis = ""
    if image_data:
        encoded_images = [b64encode(img).decode() for img in image_data]
        # Add image analysis using Vision API
        for image in encoded_images:
            response = client.chat.completions.create(
                model="gpt-4-vision-preview",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": "Analyze this image for website design elements. Describe colors, layout, and style."
                            },
                            {
                                "type": "image_url",
                                "image_url": f"data:image/jpeg;base64,{image}"
                            }
                        ]
                    }
                ]
            )
            image_analysis += response.choices[0].message.content + "\n"

    # Generate website HTML using GPT-4
    prompt = f"""
    Create a simple, modern website based on this description: {description}
    
    Image analysis results: {image_analysis}
    
    Generate valid HTML and CSS code that:
    1. Uses modern, responsive design
    2. Includes only necessary elements
    3. Uses tailwind-like utility classes
    4. Works as a single HTML file
    """

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a web developer expert in creating clean, modern websites."},
            {"role": "user", "content": prompt}
        ]
    )

    return response.choices[0].message.content