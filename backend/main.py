from fastapi import FastAPI, File, UploadFile, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from sqlalchemy.orm import Session
import uvicorn
from datetime import datetime
import shortuuid
from website_generator import generate_website_html
from typing import Optional
from models import Base, Website

# Database imports
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./websites.db"
try:
   engine = create_engine(SQLALCHEMY_DATABASE_URL)
   SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
   Base.metadata.create_all(bind=engine)
   print("Database initialized successfully")
except Exception as e:
   print(f"Error initializing database: {str(e)}")

# FastAPI app setup
app = FastAPI()

# CORS middleware
app.add_middleware(
   CORSMiddleware,
   allow_origins=["http://localhost:5174"],
   allow_credentials=True,
   allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
   allow_headers=["*"],
   expose_headers=["*"],
)

# Database dependency
def get_db():
   db = SessionLocal()
   try:
       yield db
   finally:
       db.close()

# Routes
@app.post("/api/generate-website")
async def generate_website(
   description: str = Form(...),
   inspiration_images: list[UploadFile] = File(None)
):
   try:
       print(f"Received description: {description}")
       print(f"Received {len(inspiration_images) if inspiration_images else 0} images")
       
       image_data = []
       if inspiration_images:
           for img in inspiration_images:
               content = await img.read()
               image_data.append(content)
       
       html = generate_website_html(description, image_data)
       print("Generated HTML length:", len(html) if html else 0)
       
       return JSONResponse(
           content={"html": html},
           headers={
               "Access-Control-Allow-Credentials": "true",
               "Access-Control-Allow-Origin": "http://localhost:5174"
           }
       )
   except Exception as e:
       print(f"Error generating website: {str(e)}")
       raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/websites/")
async def create_website(
   title: str = Form(...),
   description: str = Form(...),
   html_content: str = Form(...),
   db: Session = Depends(get_db)
):
   try:
       print(f"Creating website with title: {title}")
       url_slug = shortuuid.uuid()[:8]
       db_website = Website(
           url_slug=url_slug,
           title=title,
           description=description,
           html_content=html_content
       )
       db.add(db_website)
       db.commit()
       db.refresh(db_website)
       
       return JSONResponse(
           content={
               "url_slug": db_website.url_slug,
               "title": db_website.title,
               "permanent_url": f"/sites/{db_website.url_slug}"
           },
           headers={
               "Access-Control-Allow-Credentials": "true",
               "Access-Control-Allow-Origin": "http://localhost:5174"
           }
       )
   except Exception as e:
       print(f"Error saving website: {str(e)}")
       db.rollback()
       raise HTTPException(status_code=500, detail=str(e))

@app.get("/sites/{url_slug}")
async def serve_website(url_slug: str, db: Session = Depends(get_db)):
   try:
       website = db.query(Website).filter(Website.url_slug == url_slug).first()
       if not website:
           raise HTTPException(status_code=404, detail="Website not found")
       
       return HTMLResponse(
           content=website.html_content,
           headers={
               "Access-Control-Allow-Credentials": "true",
               "Access-Control-Allow-Origin": "http://localhost:5174"
           }
       )
   except Exception as e:
       print(f"Error serving website: {str(e)}")
       raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/websites/")
async def list_websites(db: Session = Depends(get_db)):
   try:
       websites = db.query(Website).all()
       print(f"Found {len(websites)} websites")
       
       return JSONResponse(
           content=[{
               "url_slug": website.url_slug,
               "title": website.title,
               "description": website.description,
               "created_at": website.created_at,
               "permanent_url": f"/sites/{website.url_slug}"
           } for website in websites],
           headers={
               "Access-Control-Allow-Credentials": "true",
               "Access-Control-Allow-Origin": "http://localhost:5174"
           }
       )
   except Exception as e:
       print(f"Error listing websites: {str(e)}")
       raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
   uvicorn.run(app, host="0.0.0.0", port=8000)