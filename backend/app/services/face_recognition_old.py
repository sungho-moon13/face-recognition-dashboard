import numpy as np
import cv2
from insightface.app import FaceAnalysis

class FaceRecognitionService:
    def __init__(self, use_gpu: bool = False):
        providers = ['CUDAExecutionProvider', 'CPUExecutionProvider'] if use_gpu else ['CPUExecutionProvider']
        
        # Initialize FaceAnalysis app
        # Using the standard model pack for detection and recognition
        self.app = FaceAnalysis(name='buffalo_l', providers=providers)
        self.app.prepare(ctx_id=0, det_size=(640, 640))
        
        # In-memory storage for registered faces {name: embedding}
        self.registered_faces = {}

    def register_face(self, name: str, image_bytes: bytes):
        """
        Register a face from an image byte stream.
        """
        try:
            # Convert bytes to numpy array
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is None:
                return {"status": "error", "message": "Failed to decode image"}

            # Detect faces
            faces = self.app.get(img)
            
            if not faces:
                return {"status": "error", "message": "No face detected"}
            
            # For registration, assume the largest face is the target
            target_face = max(faces, key=lambda x: (x.bbox[2]-x.bbox[0]) * (x.bbox[3]-x.bbox[1]))
            
            # Save embedding
            self.registered_faces[name] = target_face.embedding
            return {"status": "success", "message": f"Face registered for {name}"}
            
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def analyze_image(self, image_bytes: bytes):
        """
        Analyze image for faces and identify them.
        """
        try:
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is None:
                return {"status": "error", "message": "Failed to decode image"}
            
            faces = self.app.get(img)
            results = []
            
            for face in faces:
                bbox = face.bbox.astype(int).tolist()
                name = "Unknown"
                max_similarity = 0.0
                
                # Check against registered faces
                if self.registered_faces:
                    for reg_name, reg_embedding in self.registered_faces.items():
                        # Cosine similarity
                        sim = np.dot(face.embedding, reg_embedding) / (np.linalg.norm(face.embedding) * np.linalg.norm(reg_embedding))
                        if sim > max_similarity:
                            max_similarity = float(sim)
                            if sim > 0.4:  # Threshold for recognition
                                name = reg_name
                
                results.append({
                    "bbox": bbox,
                    "name": name,
                    "score": float(face.det_score),
                    "similarity": max_similarity
                })
                
            return results
            
        except Exception as e:
            return {"error": str(e)}

# Create a global instance
face_service = FaceRecognitionService()
