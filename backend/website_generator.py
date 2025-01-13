import os
from openai import OpenAI
from base64 import b64encode
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('OPENAI_API_KEY')
print(f"API Key found: {'Yes' if api_key else 'No'}")

try:
    client = OpenAI(
        api_key=api_key
    )
    print("OpenAI client initialized successfully")
except Exception as e:
    print(f"Error initializing OpenAI client: {str(e)}")

def generate_website_html(description: str, image_data: list) -> str:
    print(f"Received description: {description}")

    # Process images if provided
    image_analysis = ""
    if image_data:
        encoded_images = [b64encode(img).decode() for img in image_data]
        # Add image analysis using Vision API
        for image in encoded_images:
            response = client.chat.completions.create(
                model="gpt-4o",
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

    prompt = f"""
    Create a modern, professional website based on this description: {description}

Requirements:
1. Use modern design patterns and animations:
   - Smooth fade-in animations for elements
   - Subtle hover effects
   - Scroll animations
2. Include essential sections with proper styling:
   - Navigation with smooth transitions
   - Hero section with engaging layout
   - Content sections with proper spacing
   - Footer with proper information
3. Implement professional features:
   - Responsive navigation menu
   - Contact form with validation
   - Social media integration
   - Loading states and transitions
4. Use these technologies:
   - Tailwind CSS for styling
   - Alpine.js for interactivity
   - CSS animations and transitions
   - Modern meta tags and SEO elements

The website should be visually striking and professionally polished.
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a web developer expert in creating clean, modern, production-ready websites."},
                {"role": "user", "content": prompt}
            ]
        )
        
        # Debug logs
        print("API Response received")
        html_content = response.choices[0].message.content
        print("First 100 characters of generated HTML:")
        print(html_content[:100])
        
        return response.choices[0].message.content
    
    except Exception as e:
        print(f"Error generating website: {str(e)}")  # Debug log for errors
        raise e
