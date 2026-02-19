from fastapi import APIRouter, File, UploadFile, Form
from typing import List
from backend.app.services.face_recognition import face_service

router = APIRouter()

@router.post("/predict")
async def predict_face(file: UploadFile = File(...)):
    """
    Upload an image to detect and recognize faces.
    """
    contents = await file.read()
    results = face_service.analyze_image(contents)
    return {"results": results}

@router.post("/register")
async def register_face(name: str = Form(...), file: UploadFile = File(...)):
    """
    Register a new face (name + image).
    """
    contents = await file.read()
    result = face_service.register_face(name, contents)
    return result
