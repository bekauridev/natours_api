import axios from 'axios';
import { showAlert } from './alert';

export const getCurrentUser = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/me',
      withCredentials: true,
    });

    if (res.data.status === 'success') {
      return res.data.data.doc;
    } else {
      throw new Error('Failed to fetch user data');
    }
  } catch (err) {
    console.error('Error fetching current user:', err);
    showAlert('error', 'Error getting current user');
    return null;
  }
};
