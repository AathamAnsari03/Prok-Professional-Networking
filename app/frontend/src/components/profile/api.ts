const API_URL = 'http://localhost:5000';

export const profileApi = {
  getProfile: async (token: string) => {
    console.log('[profileApi] Fetching profile...');
    const response = await fetch(`${API_URL}/api/profile`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    let data;
    try {
      data = await response.json();
    } catch (jsonErr) {
      data = {};
    }
    
    if (!response.ok) {
      const errorMessage = data.message || 'Failed to get profile';
      return { success: false, message: errorMessage };
    }
    // Patch: always return { success, profile } for AuthContext
    if (data && data.user && data.user.profile) {
      return { ...data, profile: data.user.profile, success: true };
    }
    if (data && data.profile) {
      return { ...data, profile: data.profile, success: true };
    }
    return { ...data, success: true };
  },

  updateProfile: async (profileData: any, token: string) => {
    console.log('[profileApi] Updating profile...');
    const response = await fetch('http://localhost:5000/api/profile', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    });
    
    let data;
    try {
      data = await response.json();
    } catch (jsonErr) {
      data = {};
    }
    
    if (!response.ok) {
      const errorMessage = data.message || 'Failed to update profile';
      return { success: false, message: errorMessage };
    }
    
    return { ...data, success: true };
  },

  uploadAvatar: async (file: File, token: string) => {
    console.log('[profileApi] Uploading avatar...');
    const formData = new FormData();
    formData.append('file', file); // <-- change 'avatar' to 'file'
    
    const response = await fetch('http://localhost:5000/api/profile/image', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    let data;
    try {
      data = await response.json();
    } catch (jsonErr) {
      data = {};
    }
    
    if (!response.ok) {
      const errorMessage = data.message || 'Failed to upload avatar';
      return { success: false, message: errorMessage };
    }
    
    return { ...data, success: true };
  },

  // Helper function to get default avatar
  getDefaultAvatar: (name: string = 'User') => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
  },

  // Helper function to validate image file
  validateImageFile: (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, message: 'Only JPG and PNG files are allowed' };
    }

    if (file.size > maxSize) {
      return { valid: false, message: 'File size must be less than 5MB' };
    }

    return { valid: true, message: 'File is valid' };
  }
}; 