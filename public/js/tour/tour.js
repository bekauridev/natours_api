export const getTour = async (slug = null) => {
  try {
    let url = '/api/v1/tours';
    if (slug) {
      url += `/${slug}`; // Append the slug to the URL if provided
    }

    const res = await axios({
      method: 'GET',
      url: url,
      withCredentials: true,
    });
    // Return the fetched tours
    return res.data.data;
  } catch (err) {
    // Handle errors
    // console.error('Error fetching tours:', err);
    showAlert(
      'error',
      err.response?.data?.message || 'Failed to fetch tours. Please try again.'
    );
    return null;
  }
};
