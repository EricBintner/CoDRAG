"""
CoDRAG API Response Envelope.

Standardized response wrapper per API.md specification.
All endpoints should use these helpers to ensure consistent error handling.
"""

from __future__ import annotations

from typing import Any, Dict, Optional

from fastapi import HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel


# =============================================================================
# Error Codes (per API.md)
# =============================================================================

class ErrorCode:
    """Standard error codes."""
    VALIDATION_ERROR = "VALIDATION_ERROR"
    PROJECT_NOT_FOUND = "PROJECT_NOT_FOUND"
    PROJECT_ALREADY_EXISTS = "PROJECT_ALREADY_EXISTS"
    INDEX_NOT_BUILT = "INDEX_NOT_BUILT"
    BUILD_ALREADY_RUNNING = "BUILD_ALREADY_RUNNING"
    BUILD_FAILED = "BUILD_FAILED"
    OLLAMA_UNAVAILABLE = "OLLAMA_UNAVAILABLE"
    OLLAMA_MODEL_NOT_FOUND = "OLLAMA_MODEL_NOT_FOUND"
    PERMISSION_DENIED = "PERMISSION_DENIED"
    IO_ERROR = "IO_ERROR"
    NOT_IMPLEMENTED = "NOT_IMPLEMENTED"
    INTERNAL_ERROR = "INTERNAL_ERROR"
    # MCP-specific
    DAEMON_UNAVAILABLE = "DAEMON_UNAVAILABLE"
    PROJECT_SELECTION_AMBIGUOUS = "PROJECT_SELECTION_AMBIGUOUS"


# =============================================================================
# Pydantic Models
# =============================================================================

class APIError(BaseModel):
    """Error details in response envelope."""
    code: str
    message: str
    hint: Optional[str] = None
    details: Optional[Dict[str, Any]] = None


class APIResponse(BaseModel):
    """Standard API response envelope."""
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[APIError] = None


# =============================================================================
# Response Helpers
# =============================================================================

def success_response(data: Dict[str, Any], status_code: int = 200) -> JSONResponse:
    """
    Create a successful API response.
    
    Args:
        data: Response payload
        status_code: HTTP status code (default 200)
    
    Returns:
        JSONResponse with standard envelope
    """
    envelope = {
        "success": True,
        "data": data,
        "error": None,
    }
    return JSONResponse(content=envelope, status_code=status_code)


def error_response(
    code: str,
    message: str,
    status_code: int = 400,
    hint: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
) -> JSONResponse:
    """
    Create an error API response.
    
    Args:
        code: Error code from ErrorCode
        message: Human-readable error message
        status_code: HTTP status code
        hint: Optional actionable hint
        details: Optional additional details
    
    Returns:
        JSONResponse with standard error envelope
    """
    envelope = {
        "success": False,
        "data": None,
        "error": {
            "code": code,
            "message": message,
            "hint": hint,
            "details": details,
        },
    }
    return JSONResponse(content=envelope, status_code=status_code)


# =============================================================================
# Exception Classes
# =============================================================================

class APIException(Exception):
    """Base API exception that converts to standard error response."""
    
    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = 400,
        hint: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
    ):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.hint = hint
        self.details = details
        super().__init__(message)

    def to_response(self) -> JSONResponse:
        """Convert to JSONResponse."""
        return error_response(
            code=self.code,
            message=self.message,
            status_code=self.status_code,
            hint=self.hint,
            details=self.details,
        )


class ValidationError(APIException):
    """Validation error (400)."""
    def __init__(self, message: str, hint: Optional[str] = None, details: Optional[Dict[str, Any]] = None):
        super().__init__(ErrorCode.VALIDATION_ERROR, message, 400, hint, details)


class ProjectNotFoundError(APIException):
    """Project not found error (404)."""
    def __init__(self, project_id: str):
        super().__init__(
            ErrorCode.PROJECT_NOT_FOUND,
            f"Project with ID '{project_id}' not found",
            404,
            "Add the project first or select an existing project.",
        )


class ProjectAlreadyExistsError(APIException):
    """Project already exists error (409)."""
    def __init__(self, path: str):
        super().__init__(
            ErrorCode.PROJECT_ALREADY_EXISTS,
            f"A project already exists at '{path}'",
            409,
            "Use a different path or remove the existing project first.",
        )


class IndexNotBuiltError(APIException):
    """Index not built error (400)."""
    def __init__(self, project_id: str):
        super().__init__(
            ErrorCode.INDEX_NOT_BUILT,
            f"Index for project '{project_id}' has not been built",
            400,
            "Run a build first: POST /projects/{project_id}/build",
        )


class BuildAlreadyRunningError(APIException):
    """Build already running error (409)."""
    def __init__(self):
        super().__init__(
            ErrorCode.BUILD_ALREADY_RUNNING,
            "A build is already in progress",
            409,
            "Wait for the current build to complete or check status.",
        )


class OllamaUnavailableError(APIException):
    """Ollama unavailable error (503)."""
    def __init__(self, url: str):
        super().__init__(
            ErrorCode.OLLAMA_UNAVAILABLE,
            f"Cannot connect to Ollama at {url}",
            503,
            "Ensure Ollama is running: ollama serve",
        )


class InternalError(APIException):
    """Internal server error (500)."""
    def __init__(self, message: str = "An internal error occurred"):
        super().__init__(ErrorCode.INTERNAL_ERROR, message, 500)


# =============================================================================
# FastAPI Exception Handler
# =============================================================================

async def api_exception_handler(request, exc: APIException) -> JSONResponse:
    """FastAPI exception handler for APIException."""
    return exc.to_response()


def register_exception_handlers(app):
    """Register API exception handlers with FastAPI app."""
    app.add_exception_handler(APIException, api_exception_handler)
