import '@babel/polyfill';
import axios from 'axios';
import { showAlert } from './alert';
export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
      withCredentials: true,
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
  } catch (err) {
    showAlert('error', err.response?.data?.message || 'Something went wrong!');
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
      withCredentials: true,
    });

    if (res.data.status === 'success') {
      window.location.replace('/'); // Redirects to home
    }
  } catch (err) {
    showAlert('error', 'Error logging out! Try again.');
  }
};
