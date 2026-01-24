// API client for database operations
import { API_BASE_URL } from './config.js';

// Helper function to handle API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

export const translationService = {
  async getAllTranslations() {
    return await apiCall('/translations');
  },

  async getTranslationsByBook(bookId) {
    return await apiCall(`/translations/book/${bookId}`);
  },

  async getTranslationById(id) {
    return await apiCall(`/translations/${id}`);
  },

  async createTranslation(translationData, sessionToken) {
    return await apiCall('/translations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sessionToken}`
      },
      body: JSON.stringify(translationData)
    });
  },

  async updateTranslation(id, translationData, sessionToken) {
    return await apiCall(`/translations/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${sessionToken}`
      },
      body: JSON.stringify(translationData)
    });
  }
};

export const bookService = {
  async getAllBooks() {
    return await apiCall('/books');
  },

  async getBookById(id) {
    return await apiCall(`/books/${id}`);
  },

  async createBook(bookData, sessionToken) {
    return await apiCall('/books', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sessionToken}`
      },
      body: JSON.stringify(bookData)
    });
  }
};

export const bookmarkService = {
  async getBookmarks(sessionToken) {
    return await apiCall('/bookmarks', {
      headers: {
        'Authorization': `Bearer ${sessionToken}`
      }
    });
  },

  async createBookmark(data, sessionToken) {
    return await apiCall('/bookmarks', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sessionToken}`
      },
      body: JSON.stringify(data)
    });
  },

  async deleteBookmark(bookmarkId, sessionToken) {
    return await apiCall(`/bookmarks/${bookmarkId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${sessionToken}`
      }
    });
  },

  async checkBookBookmark(bookId, sessionToken) {
    return await apiCall(`/bookmarks/check-book?bookId=${bookId}`, {
      headers: {
        'Authorization': `Bearer ${sessionToken}`
      }
    });
  },

  async checkTranslationBookmark(translationId, sessionToken) {
    return await apiCall(`/bookmarks/check-translation?translationId=${translationId}`, {
      headers: {
        'Authorization': `Bearer ${sessionToken}`
      }
    });
  }
};

export const userService = {
  async getUserBookmarks(sessionToken) {
    return await bookmarkService.getBookmarks(sessionToken);
  }
};

export const profileService = {
  async getProfile(sessionToken) {
    return await apiCall('/profile', {
      headers: {
        'Authorization': `Bearer ${sessionToken}`
      }
    });
  },

  async getPublicProfile(userId) {
    return await apiCall(`/profile/${userId}`);
  }
};
