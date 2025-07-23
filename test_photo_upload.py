#!/usr/bin/env python3
import requests
import base64
import json

# Test the achievement photo upload endpoint
def test_achievement_photo_upload():
    url = "http://localhost:5000/api/profile/achievement-photo"
    
    # Create a simple test image (1x1 pixel PNG)
    test_image_base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer test"  # This will fail due to JWT, but we can see the endpoint structure
    }
    
    data = {
        "photo_url": f"data:image/png;base64,{test_image_base64}"
    }
    
    try:
        response = requests.post(url, headers=headers, json=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        return response.status_code == 201
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print("Testing achievement photo upload...")
    success = test_achievement_photo_upload()
    print(f"Test {'passed' if success else 'failed'}") 