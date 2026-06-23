import logging
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from utils.helpers import upload_to_cloudinary

router = APIRouter(prefix="/api/upload", tags=["upload"])

@router.post("", status_code=status.HTTP_201_CREATED)
async def upload_image(file: UploadFile = File(...)):
    """Uploads an image file to Cloudinary and returns its secure URL and public ID."""
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File type not supported. Please upload an image."
        )
    
    try:
        logging.info(f"Received file: {file.filename}, type: {file.content_type}")
        file_bytes = await file.read()
        
        # Upload using the Cloudinary utility helper
        upload_result = await upload_to_cloudinary(file_bytes)
        
        logging.info(f"File uploaded successfully: {upload_result}")
        return upload_result
    except Exception as e:
        logging.error(f"Image upload endpoint failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload image: {str(e)}"
        )
