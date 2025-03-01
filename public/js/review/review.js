import axios from 'axios';
import { showAlert } from '../utils/alert';

export const addReview = async (review, rating, tour, user) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/reviews',
      data: {
        review,
        rating,
        tour,
        user,
      },
      withCredentials: true,
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Review added successfully!');
    }
  } catch (err) {
    showAlert('error', err.response?.data?.message || 'Something went wrong!');
  }
};

export const getReviews = async (reviewId) => {
  let url;
  url = '/api/v1/reviews';
  if (reviewId) url += `/${reviewId}`;

  try {
    const res = await axios({
      method: 'GET',
      url,
      withCredentials: true,
    });
    // Return the fetched reviews
    if (res.data.status === 'success') {
      return res.data.data.doc;
    }
  } catch (err) {
    // Handle errors
    console.error('Error fetching reviews:', err);
    showAlert(
      'error',
      err.response?.data?.message ||
        'Failed to fetch reviews. Please try again.'
    );
    return null;
  }
};

export const updateReview = async (reviewId, review, rating) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/reviews/${reviewId}`,
      data: { review, rating },
      withCredentials: true,
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Review updated successfully!');
    }
    // Return the fetched reviews
  } catch (err) {
    // Handle errors
    console.error('Error fetching reviews:', err);
    showAlert(
      'error',
      err.response?.data?.message ||
        'Failed to fetch reviews. Please try again.'
    );
    return null;
  }
};
