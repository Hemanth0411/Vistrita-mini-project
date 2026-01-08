from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from app.api.v1.router import api_router
from app.core.database import engine, Base
from app.models import user, product # Import models to ensure they are registered

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Vistrita API",
    description="Backend for the Vistrita Product Description Generator",
    version="1.0-mini",
    docs_url="/docs", # Swagger UI
    redoc_url="/redoc"
)

# Custom OpenAPI schema to add API Key security
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    if "components" not in openapi_schema:
        openapi_schema["components"] = {}
    openapi_schema["components"]["securitySchemes"] = {
        "ApiKeyAuth": {
            "type": "apiKey",
            "in": "header",
            "name": "X-API-Key"
        }
    }
    openapi_schema["security"] = [{"ApiKeyAuth": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# CORS Configuration (Allow frontend to talk to backend)
origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    "*" # For mini-project, allowing all is fine. In prod, restrict this.
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the V1 Router
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "Welcome to Vistrita API. Go to /docs for Swagger UI."}