import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "Vistrita API"
    VERSION: str = "1.0-mini"
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL")
    VISTRITA_API_KEY: str = os.getenv("VISTRITA_API_KEY", "")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://vistrita_user:vistrita_pass@db:5432/vistrita_db")

settings = Settings()