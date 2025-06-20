import os
import uuid
import magic
from PIL import Image
from werkzeug.utils import secure_filename
from flask import current_app
import logging

logger = logging.getLogger(__name__)

class ImageProcessor:
    """Image processing utility for profile pictures"""
    
    # Allowed file types
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    ALLOWED_MIME_TYPES = {
        'image/png', 'image/jpeg', 'image/jpg', 
        'image/gif', 'image/webp'
    }
    
    # File size limits (in bytes)
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
    
    # Image dimensions
    PROFILE_IMAGE_SIZE = (400, 400)
    THUMBNAIL_SIZE = (150, 150)
    
    def __init__(self, upload_folder='uploads'):
        self.upload_folder = upload_folder
        self.profile_images_folder = os.path.join(upload_folder, 'profile_images')
        self.thumbnails_folder = os.path.join(upload_folder, 'thumbnails')
        
        # Create directories if they don't exist
        os.makedirs(self.profile_images_folder, exist_ok=True)
        os.makedirs(self.thumbnails_folder, exist_ok=True)
    
    def validate_file(self, file):
        """Validate uploaded file"""
        errors = []
        
        # Check if file exists
        if not file or file.filename == '':
            errors.append("No file selected")
            return errors
        
        # Check file size
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)  # Reset file pointer
        
        if file_size > self.MAX_FILE_SIZE:
            errors.append(f"File size exceeds {self.MAX_FILE_SIZE // (1024*1024)}MB limit")
        
        # Check file extension
        filename = secure_filename(file.filename)
        if '.' not in filename:
            errors.append("File has no extension")
        else:
            extension = filename.rsplit('.', 1)[1].lower()
            if extension not in self.ALLOWED_EXTENSIONS:
                errors.append(f"File type '{extension}' not allowed. Allowed types: {', '.join(self.ALLOWED_EXTENSIONS)}")
        
        # Check MIME type
        try:
            mime_type = magic.from_buffer(file.read(1024), mime=True)
            file.seek(0)  # Reset file pointer
            
            if mime_type not in self.ALLOWED_MIME_TYPES:
                errors.append(f"Invalid file type: {mime_type}")
        except Exception as e:
            logger.warning(f"Could not determine MIME type: {e}")
            # Continue with extension-based validation
        
        return errors
    
    def generate_filename(self, original_filename, user_id):
        """Generate secure filename"""
        extension = original_filename.rsplit('.', 1)[1].lower()
        unique_id = str(uuid.uuid4())
        return f"profile_{user_id}_{unique_id}.{extension}"
    
    def process_image(self, file, user_id):
        """Process and save image with thumbnail"""
        try:
            # Generate filenames
            original_filename = secure_filename(file.filename)
            filename = self.generate_filename(original_filename, user_id)
            
            # Full paths
            profile_path = os.path.join(self.profile_images_folder, filename)
            thumbnail_path = os.path.join(self.thumbnails_folder, filename)
            
            # Open and process image
            with Image.open(file) as img:
                # Convert to RGB if necessary (for JPEG compatibility)
                if img.mode in ('RGBA', 'LA', 'P'):
                    img = img.convert('RGB')
                
                # Create profile image (resize and compress)
                profile_img = img.copy()
                profile_img.thumbnail(self.PROFILE_IMAGE_SIZE, Image.Resampling.LANCZOS)
                
                # Save profile image
                profile_img.save(profile_path, 'JPEG', quality=85, optimize=True)
                
                # Create thumbnail
                thumbnail_img = img.copy()
                thumbnail_img.thumbnail(self.THUMBNAIL_SIZE, Image.Resampling.LANCZOS)
                
                # Save thumbnail
                thumbnail_img.save(thumbnail_path, 'JPEG', quality=80, optimize=True)
            
            return {
                'filename': filename,
                'profile_url': f'/uploads/profile_images/{filename}',
                'thumbnail_url': f'/uploads/thumbnails/{filename}',
                'size': os.path.getsize(profile_path)
            }
            
        except Exception as e:
            logger.error(f"Error processing image: {e}")
            raise Exception(f"Failed to process image: {str(e)}")
    
    def delete_image(self, filename):
        """Delete image and thumbnail"""
        try:
            profile_path = os.path.join(self.profile_images_folder, filename)
            thumbnail_path = os.path.join(self.thumbnails_folder, filename)
            
            # Delete files if they exist
            if os.path.exists(profile_path):
                os.remove(profile_path)
            
            if os.path.exists(thumbnail_path):
                os.remove(thumbnail_path)
                
            return True
        except Exception as e:
            logger.error(f"Error deleting image: {e}")
            return False
    
    def get_image_info(self, filename):
        """Get image information"""
        try:
            profile_path = os.path.join(self.profile_images_folder, filename)
            if not os.path.exists(profile_path):
                return None
            
            with Image.open(profile_path) as img:
                return {
                    'filename': filename,
                    'size': os.path.getsize(profile_path),
                    'dimensions': img.size,
                    'format': img.format,
                    'mode': img.mode
                }
        except Exception as e:
            logger.error(f"Error getting image info: {e}")
            return None 