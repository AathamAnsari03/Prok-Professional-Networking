const API_URL = 'http://localhost:5000/api';

export const profileApi = {
  getProfile: async () => {
    const response = await fetch(`${API_URL}/profile`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.json();
  },

  updateProfile: async (profileData: { bio?: string; location?: string; full_name?: string }) => {
    const response = await fetch(`${API_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(profileData),
    });
    return response.json();
  },

  uploadProfilePhoto: async (photoUrl: string) => {
    const response = await fetch(`${API_URL}/profile/photo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ photo_url: photoUrl }),
    });
    return response.json();
  },

  removeProfilePhoto: async () => {
    const response = await fetch(`${API_URL}/profile/photo`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.json();
  },



  addExperience: async (experienceData: { title: string; company: string; start_date: string; end_date?: string; description: string }) => {
    const response = await fetch(`${API_URL}/profile/experience`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(experienceData),
    });
    return response.json();
  },

  removeExperience: async (experienceId: number) => {
    const response = await fetch(`${API_URL}/profile/experience/${experienceId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.json();
  },

  addAchievement: async (achievementData: { title: string; description: string; date: string }) => {
    const response = await fetch(`${API_URL}/profile/achievements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(achievementData),
    });
    return response.json();
  },

  removeAchievement: async (achievementId: number) => {
    const response = await fetch(`${API_URL}/profile/achievements/${achievementId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.json();
  },
}; 