# In models.py
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Website(Base):
    __tablename__ = "websites"
    
    id = Column(Integer, primary_key=True, index=True)
    url_slug = Column(String, unique=True, index=True)
    title = Column(String)
    description = Column(String)
    html_content = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)