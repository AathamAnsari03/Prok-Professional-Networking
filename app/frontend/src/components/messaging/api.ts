const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const messagingApi = {
  getConversations: async () => {
    const response = await fetch(`${API_URL}/messages/conversations`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.json();
  },

  getMessages: async (conversationId: number) => {
    const response = await fetch(`${API_URL}/messages/${conversationId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.json();
  },

  sendMessage: async (conversationId: number, content: string) => {
    const response = await fetch(`${API_URL}/messages/${conversationId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ content }),
    });
    return response.json();
  },
}; 