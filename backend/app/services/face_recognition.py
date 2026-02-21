import numpy as np
import cv2
import pickle
import os
import json
import base64
from insightface.app import FaceAnalysis
from datetime import datetime

# Data directory for storing registered faces
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "data")
DATA_FILE = os.path.join(DATA_DIR, "registered_faces.pkl")
META_FILE = os.path.join(DATA_DIR, "faces_meta.json")
THUMB_DIR = os.path.join(DATA_DIR, "thumbnails")


class FaceRecognitionService:
    def __init__(self, use_gpu: bool = False):
        providers = ['CPUExecutionProvider']

        # Initialize FaceAnalysis app
        self.app = FaceAnalysis(name='buffalo_l', providers=providers)
        self.app.prepare(ctx_id=0, det_size=(640, 640))

        # In-memory storage for registered faces {name: [embedding1, embedding2, ...]}
        self.registered_faces: dict[str, list[np.ndarray]] = {}
        # Metadata: {name: {"image_count": int, "created_at": str, ...}}
        self.faces_meta: dict[str, dict] = {}

        # Ensure data directories exist
        os.makedirs(DATA_DIR, exist_ok=True)
        os.makedirs(THUMB_DIR, exist_ok=True)

        self.load_faces()

    def load_faces(self):
        """Load registered faces from disk."""
        if os.path.exists(DATA_FILE):
            try:
                with open(DATA_FILE, 'rb') as f:
                    self.registered_faces = pickle.load(f)
                print(f"Loaded {len(self.registered_faces)} registered faces.")
            except Exception as e:
                print(f"Error loading faces: {e}")
                self.registered_faces = {}

        if os.path.exists(META_FILE):
            try:
                with open(META_FILE, 'r', encoding='utf-8') as f:
                    self.faces_meta = json.load(f)
            except Exception as e:
                print(f"Error loading metadata: {e}")
                self.faces_meta = {}

    def save_faces(self):
        """Save registered faces to disk."""
        try:
            with open(DATA_FILE, 'wb') as f:
                pickle.dump(self.registered_faces, f)

            with open(META_FILE, 'w', encoding='utf-8') as f:
                json.dump(self.faces_meta, f, ensure_ascii=False, indent=2)

            print("Faces saved successfully.")
        except Exception as e:
            print(f"Error saving faces: {e}")

    def _save_thumbnail(self, name: str, img: np.ndarray, face_bbox):
        """Save a cropped face thumbnail for display."""
        try:
            x1, y1, x2, y2 = [int(v) for v in face_bbox]
            h, w = img.shape[:2]

            # Add padding around face (20%)
            pad_w = int((x2 - x1) * 0.2)
            pad_h = int((y2 - y1) * 0.2)
            x1 = max(0, x1 - pad_w)
            y1 = max(0, y1 - pad_h)
            x2 = min(w, x2 + pad_w)
            y2 = min(h, y2 + pad_h)

            face_crop = img[y1:y2, x1:x2]

            # Resize thumbnail to fixed size
            thumb = cv2.resize(face_crop, (128, 128))

            # Save as JPEG
            thumb_path = os.path.join(THUMB_DIR, f"{name}.jpg")
            cv2.imwrite(thumb_path, thumb, [cv2.IMWRITE_JPEG_QUALITY, 85])

            return thumb_path
        except Exception as e:
            print(f"Error saving thumbnail: {e}")
            return None

    def get_thumbnail_base64(self, name: str) -> str | None:
        """Get thumbnail as base64 string for API response."""
        thumb_path = os.path.join(THUMB_DIR, f"{name}.jpg")
        if os.path.exists(thumb_path):
            try:
                with open(thumb_path, 'rb') as f:
                    data = f.read()
                return f"data:image/jpeg;base64,{base64.b64encode(data).decode()}"
            except Exception:
                return None
        return None

    def register_face(self, name: str, image_bytes: bytes):
        """
        Register a face from an image byte stream.
        Supports Korean (한글) names via UTF-8.
        Appends to existing embeddings if the name already exists.
        """
        try:
            name = name.strip()
            if not name:
                return {"status": "error", "message": "Name cannot be empty"}

            # Convert bytes to numpy array
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if img is None:
                return {"status": "error", "message": "Failed to decode image"}

            # Detect faces
            faces = self.app.get(img)

            if not faces:
                return {"status": "error", "message": "No face detected in the image"}

            # For registration, assume the largest face is the target
            target_face = max(faces, key=lambda x: (x.bbox[2] - x.bbox[0]) * (x.bbox[3] - x.bbox[1]))

            # Save embedding (append to list)
            if name not in self.registered_faces:
                self.registered_faces[name] = []

            self.registered_faces[name].append(target_face.embedding)

            # Save thumbnail (always update with latest face)
            self._save_thumbnail(name, img, target_face.bbox)

            # Update metadata
            if name not in self.faces_meta:
                self.faces_meta[name] = {
                    "created_at": datetime.now().isoformat(),
                    "image_count": 0
                }
            self.faces_meta[name]["image_count"] = len(self.registered_faces[name])
            self.faces_meta[name]["updated_at"] = datetime.now().isoformat()

            self.save_faces()

            count = len(self.registered_faces[name])
            print(f"Registered face for '{name}'. Total images: {count}")
            return {
                "status": "success",
                "message": f"Face registered for '{name}'",
                "name": name,
                "total_images": count
            }

        except Exception as e:
            return {"status": "error", "message": str(e)}

    def register_multiple_faces(self, name: str, images_bytes_list: list[bytes]):
        """Register multiple face images at once for a person."""
        results = []
        for idx, image_bytes in enumerate(images_bytes_list):
            result = self.register_face(name, image_bytes)
            result["image_index"] = idx
            results.append(result)

        success_count = sum(1 for r in results if r.get("status") == "success")
        return {
            "status": "success" if success_count > 0 else "error",
            "message": f"Registered {success_count}/{len(images_bytes_list)} images for '{name}'",
            "name": name,
            "total_images": len(self.registered_faces.get(name, [])),
            "details": results
        }

    def analyze_image(self, image_bytes: bytes):
        """
        Analyze image for faces and identify them.
        Returns list of detected faces with bounding box, name, and similarity score.
        """
        try:
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if img is None:
                return {"error": "Failed to decode image"}

            faces = self.app.get(img)
            results = []

            # Prepare for vectorized comparison
            all_names = []
            all_embeddings = []
            for reg_name, embs in self.registered_faces.items():
                for emb in embs:
                    all_names.append(reg_name)
                    all_embeddings.append(emb)
            
            all_embeddings = np.array(all_embeddings) if all_embeddings else None

            for face in faces:
                bbox = face.bbox.astype(int).tolist()
                name = "Unknown"
                max_similarity = 0.0

                # Optimized comparison using Numpy vectorization
                if all_embeddings is not None:
                    # Normalize embeddings for cosine similarity
                    face_norm = face.embedding / np.linalg.norm(face.embedding)
                    regs_norm = all_embeddings / np.linalg.norm(all_embeddings, axis=1, keepdims=True)
                    
                    # Compute all similarities at once (dot product of normalized vectors)
                    similarities = np.dot(regs_norm, face_norm)
                    
                    max_idx = np.argmax(similarities)
                    sim = float(similarities[max_idx])
                    
                    if sim > 0.4:  # Threshold
                        name = all_names[max_idx]
                        max_similarity = sim
                    else:
                        max_similarity = sim

                results.append({
                    "bbox": bbox,
                    "name": name,
                    "score": float(face.det_score),
                    "similarity": max_similarity
                })


            return results

        except Exception as e:
            return {"error": str(e)}

    def get_registered_users(self):
        """Get all registered users with their metadata and thumbnails."""
        users = []
        for name, embeddings in self.registered_faces.items():
            meta = self.faces_meta.get(name, {})
            users.append({
                "name": name,
                "image_count": len(embeddings),
                "created_at": meta.get("created_at", "N/A"),
                "updated_at": meta.get("updated_at", "N/A"),
                "thumbnail": self.get_thumbnail_base64(name)
            })
        return users

    def get_user(self, name: str):
        """Get a specific registered user info with thumbnail."""
        if name not in self.registered_faces:
            return None
        meta = self.faces_meta.get(name, {})
        return {
            "name": name,
            "image_count": len(self.registered_faces[name]),
            "created_at": meta.get("created_at", "N/A"),
            "updated_at": meta.get("updated_at", "N/A"),
            "thumbnail": self.get_thumbnail_base64(name)
        }

    def update_user_name(self, old_name: str, new_name: str):
        """Update a registered user's name (supports Korean names)."""
        new_name = new_name.strip()
        if not new_name:
            return {"status": "error", "message": "New name cannot be empty"}

        if old_name not in self.registered_faces:
            return {"status": "error", "message": f"User '{old_name}' not found"}

        if new_name in self.registered_faces and new_name != old_name:
            return {"status": "error", "message": f"User '{new_name}' already exists"}

        # Transfer embeddings
        self.registered_faces[new_name] = self.registered_faces.pop(old_name)

        # Transfer metadata
        if old_name in self.faces_meta:
            self.faces_meta[new_name] = self.faces_meta.pop(old_name)
            self.faces_meta[new_name]["updated_at"] = datetime.now().isoformat()

        # Rename thumbnail
        old_thumb = os.path.join(THUMB_DIR, f"{old_name}.jpg")
        new_thumb = os.path.join(THUMB_DIR, f"{new_name}.jpg")
        if os.path.exists(old_thumb):
            os.rename(old_thumb, new_thumb)

        self.save_faces()
        return {"status": "success", "message": f"Name updated from '{old_name}' to '{new_name}'"}

    def delete_user(self, name: str):
        """Delete a registered user and all their data."""
        if name not in self.registered_faces:
            return {"status": "error", "message": f"User '{name}' not found"}

        del self.registered_faces[name]
        if name in self.faces_meta:
            del self.faces_meta[name]

        # Delete thumbnail
        thumb_path = os.path.join(THUMB_DIR, f"{name}.jpg")
        if os.path.exists(thumb_path):
            os.remove(thumb_path)

        self.save_faces()
        return {"status": "success", "message": f"User '{name}' deleted successfully"}


# Create a global instance
face_service = FaceRecognitionService()
