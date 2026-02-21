from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.endpoints import router as api_router
import uvicorn

app = FastAPI(
    title="Face Recognition Dashboard API",
    description="얼굴 인식 대시보드 백엔드 API - InsightFace 기반 얼굴 감지, 식별, 등록",
    version="1.0.0"
)

# Setup CORS to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api")


@app.get("/")
def read_root():
    return {
        "message": "Face Recognition API is running.",
        "docs": "/docs",
        "endpoints": {
            "predict": "POST /api/predict",
            "register": "POST /api/register",
            "register_multiple": "POST /api/register/multiple",
            "list_users": "GET /api/users",
            "get_user": "GET /api/users/{name}",
            "update_user": "PUT /api/users/{name}",
            "delete_user": "DELETE /api/users/{name}",
        }
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
