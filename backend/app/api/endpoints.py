from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from typing import List, Optional
from backend.app.services.face_recognition import face_service

router = APIRouter()


# ─── Predict (Analyze) ─────────────────────────────────────────────

@router.post("/predict")
async def predict_face(file: UploadFile = File(...)):
    """
    Upload an image to detect and recognize faces.
    Returns bounding boxes, identified names, and similarity scores.
    """
    contents = await file.read()
    results = face_service.analyze_image(contents)
    return {"results": results}


# ─── Register ───────────────────────────────────────────────────────

@router.post("/register")
async def register_face(name: str = Form(...), file: UploadFile = File(...)):
    """
    Register a new face (name + single image).
    Supports Korean (한글) names.
    If the name already exists, the new embedding is appended.
    """
    contents = await file.read()
    result = face_service.register_face(name, contents)
    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result["message"])
    return result


@router.post("/register/multiple")
async def register_multiple_faces(
    name: str = Form(...),
    files: List[UploadFile] = File(...)
):
    """
    Register multiple face images for a person at once.
    At least 2 images recommended for better recognition accuracy.
    """
    images_bytes = []
    for f in files:
        contents = await f.read()
        images_bytes.append(contents)

    result = face_service.register_multiple_faces(name, images_bytes)
    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result["message"])
    return result


# ─── User Management (CRUD) ────────────────────────────────────────

@router.get("/users")
async def get_users():
    """
    Get all registered users with their information.
    """
    users = face_service.get_registered_users()
    return {"users": users, "total": len(users)}


@router.get("/users/{name}")
async def get_user(name: str):
    """
    Get a specific registered user's information.
    """
    user = face_service.get_user(name)
    if user is None:
        raise HTTPException(status_code=404, detail=f"User '{name}' not found")
    return user


@router.put("/users/{name}")
async def update_user(name: str, new_name: str = Form(...)):
    """
    Update a registered user's name.
    Supports Korean (한글) names.
    """
    result = face_service.update_user_name(name, new_name)
    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result["message"])
    return result


@router.delete("/users/{name}")
async def delete_user(name: str):
    """
    Delete a registered user and all their face data.
    """
    result = face_service.delete_user(name)
    if result["status"] == "error":
        raise HTTPException(status_code=404, detail=result["message"])
    return result
