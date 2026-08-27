import base64
from typing import Tuple, Optional, List, Dict, Any
from schemas.biometric import BiometricInput
from models.biometric import BiometricSourceType

def extract_embedding_stub(image_bytes: bytes) -> List[float]:
    """
    Placeholder/stub function for face/retina ML embedding extraction.
    In production, this would call OpenCV, InsightFace, or RetinaFace models.
    Produces a deterministic dummy vector derived from image content length/bytes.
    """
    if not image_bytes:
        raise ValueError("Empty image data supplied")
    # Generate a deterministic 128-float normalized dummy vector
    seed_val = sum(image_bytes) % 1000 + 1
    vector = [round(((i * seed_val) % 100) / 100.0, 4) for i in range(128)]
    # Normalize L2 norm
    magnitude = (sum(v ** 2 for v in vector)) ** 0.5 or 1.0
    return [round(v / magnitude, 4) for v in vector]

def normalize_to_embedding(
    payload: BiometricInput
) -> Tuple[Optional[List[float]], Optional[Dict[str, Any]], BiometricSourceType]:
    """
    Normalizes input payload into either:
      1. (embedding, None, BiometricSourceType.EMBEDDING)
      2. (embedding, None, BiometricSourceType.IMAGE_DERIVED)
      3. (None, vendor_result, BiometricSourceType.VENDOR)

    Raises ValueError if none of the three are present or payload shape is invalid.
    """
    if payload is None:
        raise ValueError("Biometric input payload cannot be None")

    if payload.embedding is not None and len(payload.embedding) > 0:
        return payload.embedding, None, BiometricSourceType.EMBEDDING

    if payload.image_base64 is not None and payload.image_base64.strip():
        try:
            # Clean up base64 prefix if present (e.g. data:image/jpeg;base64,...)
            raw_b64 = payload.image_base64.strip()
            if "," in raw_b64:
                raw_b64 = raw_b64.split(",", 1)[1]
            image_bytes = base64.b64decode(raw_b64)
            if not image_bytes:
                raise ValueError("Decoded image bytes are empty")
            
            embedding = extract_embedding_stub(image_bytes)
            # Immediate cleanup: raw image bytes are discarded from memory
            del image_bytes
            return embedding, None, BiometricSourceType.IMAGE_DERIVED
        except Exception as e:
            raise ValueError(f"Failed to process image_base64 payload: {str(e)}")

    if payload.vendor_result is not None and isinstance(payload.vendor_result, dict):
        return None, payload.vendor_result, BiometricSourceType.VENDOR

    raise ValueError("Unrecognized biometric payload shape. Exactly one of 'embedding', 'image_base64', or 'vendor_result' must be set.")
