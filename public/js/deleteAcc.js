import axios from 'axios';
import { showAlert } from './alert';

export const deleteCurrentAccount = async () => {
  try {
    const res = await axios({
      method: 'DELETE',
      url: '/api/v1/users/deleteMe',
      withCredentials: true,
    });
    if (res.status === 204) {
      location.assign('/');
    }
  } catch (err) {
    showAlert('error', 'Error Deleting account Try again.');
  }
};
