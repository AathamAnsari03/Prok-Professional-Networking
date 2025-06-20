import os
import uuid
from datetime import datetime
from werkzeug.utils import secure_filename
from PIL import Image
import mimetypes
from typing import List, Tuple, Optional
import logging

logger = logging.getLogger(__name__)

class MediaProcessor:
    """Utility class for processing media uploads"""
    
    # Allowed file types
    ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'}
    ALLOWED_VIDEO_EXTENSIONS = {'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'}
    
    # File size limits (in bytes)
    MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB
    MAX_VIDEO_SIZE = 100 * 1024 * 1024  # 100MB
    
    # Image dimensions
    MAX_IMAGE_DIMENSIONS = (4096, 4096)  # Max width, height
    THUMBNAIL_SIZE = (300, 300)
    
    def __init__(self, upload_folder: str = 'uploads'):
        self.upload_folder = upload_folder
        self.ensure_upload_directories()
    
    def ensure_upload_directories(self):
        """Ensure upload directories exist"""
        directories = [
            self.upload_folder,
            os.path.join(self.upload_folder, 'posts'),
            os.path.join(self.upload_folder, 'thumbnails'),
            os.path.join(self.upload_folder, 'temp')
        ]
        
        for directory in directories:
            os.makedirs(directory, exist_ok=True)
    
    def is_allowed_file(self, filename: str, file_type: str = None) -> bool:
        """Check if file type is allowed"""
        if not filename:
            return False
        
        extension = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
        
        if file_type == 'image':
            return extension in self.ALLOWED_IMAGE_EXTENSIONS
        elif file_type == 'video':
            return extension in self.ALLOWED_VIDEO_EXTENSIONS
        else:
            # Check both image and video extensions
            return extension in self.ALLOWED_IMAGE_EXTENSIONS or extension in self.ALLOWED_VIDEO_EXTENSIONS
    
    def get_file_type(self, filename: str) -> Optional[str]:
        """Determine file type based on extension"""
        if not filename:
            return None
        
        extension = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
        
        if extension in self.ALLOWED_IMAGE_EXTENSIONS:
            return 'image'
        elif extension in self.ALLOWED_VIDEO_EXTENSIONS:
            return 'video'
        
        return None
    
    def validate_file(self, file, file_type: str = None) -> Tuple[bool, str]:
        """Validate uploaded file"""
        if not file or not file.filename:
            return False, "No file provided"
        
        # Check file extension
        if not self.is_allowed_file(file.filename, file_type):
            return False, f"File type not allowed. Allowed types: {', '.join(self.ALLOWED_IMAGE_EXTENSIONS | self.ALLOWED_VIDEO_EXTENSIONS)}"
        
        # Check file size
        file.seek(0, 2)  # Seek to end
        file_size = file.tell()
        file.seek(0)  # Reset to beginning
        
        detected_type = self.get_file_type(file.filename)
        max_size = self.MAX_IMAGE_SIZE if detected_type == 'image' else self.MAX_VIDEO_SIZE
        
        if file_size > max_size:
            return False, f"File too large. Maximum size: {max_size // (1024 * 1024)}MB"
        
        return True, "File is valid"
    
    def generate_unique_filename(self, original_filename: str) -> str:
        """Generate unique filename with UUID"""
        extension = original_filename.rsplit('.', 1)[1].lower() if '.' in original_filename else ''
        unique_id = str(uuid.uuid4())
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        return f"{timestamp}_{unique_id}.{extension}"
    
    def save_file(self, file, subfolder: str = 'posts') -> Tuple[bool, str, dict]:
        """Save uploaded file and return file info"""
        try:
            # Validate file
            is_valid, error_message = self.validate_file(file)
            if not is_valid:
                return False, error_message, {}
            
            # Generate unique filename
            original_filename = secure_filename(file.filename)
            unique_filename = self.generate_unique_filename(original_filename)
            
            # Create file path
            file_type = self.get_file_type(original_filename)
            file_path = os.path.join(self.upload_folder, subfolder, unique_filename)
            
            # Save file
            file.save(file_path)
            
            # Get file info
            file.seek(0, 2)
            file_size = file.tell()
            file.seek(0)
            
            # Generate thumbnail for images
            thumbnail_url = None
            if file_type == 'image':
                thumbnail_url = self.create_thumbnail(file_path, unique_filename)
            
            file_info = {
                'original_filename': original_filename,
                'filename': unique_filename,
                'file_url': f'/uploads/{subfolder}/{unique_filename}',
                'file_type': file_type,
                'file_size': file_size,
                'mime_type': mimetypes.guess_type(original_filename)[0] or 'application/octet-stream',
                'thumbnail_url': thumbnail_url
            }
            
            return True, "File saved successfully", file_info
            
        except Exception as e:
            logger.error(f"Error saving file: {str(e)}")
            return False, f"Error saving file: {str(e)}", {}
    
    def create_thumbnail(self, image_path: str, filename: str) -> Optional[str]:
        """Create thumbnail for image"""
        try:
            with Image.open(image_path) as img:
                # Convert to RGB if necessary
                if img.mode in ('RGBA', 'LA', 'P'):
                    img = img.convert('RGB')
                
                # Create thumbnail
                img.thumbnail(self.THUMBNAIL_SIZE, Image.Resampling.LANCZOS)
                
                # Generate thumbnail filename
                name, ext = os.path.splitext(filename)
                thumbnail_filename = f"{name}_thumb{ext}"
                thumbnail_path = os.path.join(self.upload_folder, 'thumbnails', thumbnail_filename)
                
                # Save thumbnail
                img.save(thumbnail_path, quality=85, optimize=True)
                
                return f'/uploads/thumbnails/{thumbnail_filename}'
                
        except Exception as e:
            logger.error(f"Error creating thumbnail: {str(e)}")
            return None
    
    def delete_file(self, file_url: str) -> bool:
        """Delete file from storage"""
        try:
            if file_url.startswith('/uploads/'):
                file_path = file_url.replace('/uploads/', '')
                full_path = os.path.join(self.upload_folder, file_path)
                
                if os.path.exists(full_path):
                    os.remove(full_path)
                    return True
            return False
        except Exception as e:
            logger.error(f"Error deleting file: {str(e)}")
            return False
    
    def process_multiple_files(self, files: List, subfolder: str = 'posts') -> List[dict]:
        """Process multiple files and return results"""
        results = []
        
        for file in files:
            success, message, file_info = self.save_file(file, subfolder)
            results.append({
                'success': success,
                'message': message,
                'file_info': file_info
            })
        
        return results

# Global instance
media_processor = MediaProcessor() 