import axios from 'axios';
import { showAlert } from '../utils/alert';

// type is eigher 'password' or 'data'
export const updateSettings = async (data, type) => {
  try {
    const route = type === 'password' ? 'updatePassword' : 'updateMe';
    const req = await axios({
      method: 'PATCH',
      url: `/api/v1/users/${route}`,
      data,
      // headers: {
      //   'Content-Type': 'application/json',
      //   Authorization: `Bearer ${localStorage.getItem('token')}`,
      // },
    });

    if (req.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully!`);
    }
  } catch (err) {
    // console.error('Error updating settings', err);
    showAlert('error', err.response?.data?.message || 'Something went wrong!');
  }
};
