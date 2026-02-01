from fastapi import HTTPException, status

class VistritaException(HTTPException):
    """Base exception for Vistrita API"""
    def __init__(self, detail: str, status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR):
        super().__init__(status_code=status_code, detail=detail)

class AIProviderError(VistritaException):
    """Errors related to Gemini/AI processing"""
    def __init__(self, detail: str = "AI generation failed"):
        super().__init__(detail=f"AI_ERROR: {detail}", status_code=status.HTTP_502_BAD_GATEWAY)

class ValidationError(VistritaException):
    """Errors related to input validation"""
    def __init__(self, detail: str = "Invalid input data"):
        super().__init__(detail=f"VALIDATION_ERROR: {detail}", status_code=status.HTTP_400_BAD_REQUEST)

class ResourceNotFoundError(VistritaException):
    """Errors when a resource is not found"""
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(detail=f"NOT_FOUND: {detail}", status_code=status.HTTP_404_NOT_FOUND)
