from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, ConfigDict, model_validator
from models.biometric import BiometricMethod

class BiometricInput(BaseModel):
    method: BiometricMethod
    embedding: Optional[List[float]] = None
    image_base64: Optional[str] = None
    vendor_result: Optional[Dict[str, Any]] = None

    @model_validator(mode="after")
    def validate_single_input_source(self):
        provided = sum([
            1 if self.embedding is not None else 0,
            1 if self.image_base64 is not None else 0,
            1 if self.vendor_result is not None else 0
        ])
        if provided != 1:
            raise ValueError(
                "Exactly one of 'embedding', 'image_base64', or 'vendor_result' must be provided"
            )
        return self

class BiometricEnrollRequest(BaseModel):
    voter_id: str
    biometric_data: BiometricInput
    re_enroll: Optional[bool] = False

class BiometricVerifyRequest(BaseModel):
    voter_id: str
    biometric_data: BiometricInput

class BiometricVerifyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    verified: bool
    confidence: Optional[float] = None
    biometric_token: Optional[str] = None
    message: str
