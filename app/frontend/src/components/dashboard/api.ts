const API_URL = 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const dashboardApi = {
  // Get user profile
  getProfile: async () => {
    const response = await fetch(`${API_URL}/profile`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Update profile basic info
  updateProfile: async (data: { bio?: string; location?: string }) => {
    const response = await fetch(`${API_URL}/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Add skill
  addSkill: async (name: string) => {
    const response = await fetch(`${API_URL}/profile/skills`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name }),
    });
    return response.json();
  },

  // Remove skill
  removeSkill: async (skillId: number) => {
    const response = await fetch(`${API_URL}/profile/skills/${skillId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Add experience
  addExperience: async (data: {
    title: string;
    company: string;
    start_date: string;
    end_date?: string;
    description?: string;
  }) => {
    const response = await fetch(`${API_URL}/profile/experience`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Remove experience
  removeExperience: async (expId: number) => {
    const response = await fetch(`${API_URL}/profile/experience/${expId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Add achievement
  addAchievement: async (data: {
    title: string;
    description?: string;
    date?: string;
    image_url?: string;
  }) => {
    const response = await fetch(`${API_URL}/profile/achievements`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Remove achievement
  removeAchievement: async (achievementId: number) => {
    const response = await fetch(`${API_URL}/profile/achievements/${achievementId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};