from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from website_generator import generate_website_html

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/generate-website")
async def generate_website(
    description: str = Form(...),
    inspiration_images: list[UploadFile] = File(None)
):
    image_data = []
    if inspiration_images:
        for img in inspiration_images:
            content = await img.read()
            image_data.append(content)
    
    html = generate_website_html(description, image_data)
    return {"html": html}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)